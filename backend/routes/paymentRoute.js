import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import validator from 'validator';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import authToken from '../middleware/authToken.js';
import User from '../models/userModel.js';
import Book from '../models/bookModel.js';
import Payment from '../models/paymentModel.js';
import MpesaLog from '../models/mpesaLog.js';
import transporter from '../config/nodemailer.js';
import isAdmin from '../middleware/adminAuth.js';

dotenv.config();
const paymentRouter = express.Router();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  CALLBACK_URL,
  WEBHOOK_SECRET,
  MPESA_ENV
} = process.env;

const BASE_URL =
  MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

/* ================= TOKEN CACHE ================= */
let cachedToken = null;
let tokenExpiry = null;

const getMpesaToken = async () => {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) return cachedToken;

  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const { data } = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  cachedToken = data.access_token;
  tokenExpiry = now + 3500 * 1000;
  return cachedToken;
};

/* ================= SANITIZER ================= */
const sanitizeInput = (input) =>
  validator.escape(String(input).trim());

/* ================= EMAIL RECEIPT ================= */
const sendPaymentEmail = async (email, name, amount, transactionId, bookTitle) => {
  try {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Book Purchase Confirmation',
        text: `Hello ${name}, your payment of KES ${amount} for "${bookTitle}" was successful.`,
        attachments: [
          { filename: `Receipt-${transactionId}.pdf`, content: pdfData }
        ]
      });
    });

    doc.fontSize(18).text('Book Purchase Receipt', { align: 'center' });
    doc.moveDown();
    doc.text(`Transaction ID: ${transactionId}`);
    doc.text(`Book: ${bookTitle}`);
    doc.text(`Amount: KES ${amount}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.end();
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
  }
};

/* ================= INITIATE BOOK PAYMENT ================= */
paymentRouter.post('/mpesa/pay', authToken, async (req, res) => {
  try {
    let { phone, bookId } = req.body;

    phone = sanitizeInput(phone);

    if (!phone || !bookId) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    if (phone.startsWith('0')) phone = '254' + phone.slice(1);

    if (!/^(2547|2541)\d{8}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid Kenyan phone number' });
    }

    const user = await User.findById(req.userId);
    const book = await Book.findById(bookId);

    if (!user || !book)
      return res.status(404).json({ success: false, message: 'User or Book not found' });

    // Prevent duplicate purchase
    if (user.purchasedBooks.includes(bookId)) {
      return res.status(400).json({ success: false, message: 'You already own this book' });
    }

    const amount = book.price;

    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: CALLBACK_URL,
        AccountReference: `Book-${book._id}`,
        TransactionDesc: `Purchase ${book.title}`
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await Payment.create({
      user: user._id,
      book: book._id,
      phone,
      amount,
      status: 'pending',
      transaction: data.CheckoutRequestID
    });

    res.json({
      success: true,
      message: 'STK Push sent. Enter M-Pesa PIN.',
      transaction_id: data.CheckoutRequestID
    });
  } catch (err) {
    console.error('[STK ERROR]', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'STK Push failed' });
  }
});

/* ================= WEBHOOK ================= */
paymentRouter.post('/mpesa/webhook', express.json(), async (req, res) => {
  try {
    const stkCallback = req.body?.Body?.stkCallback;
    if (!stkCallback) return res.status(400).json({ message: 'Invalid payload' });

    const { CheckoutRequestID, ResultCode } = stkCallback;

    const payment = await Payment.findOne({ transaction: CheckoutRequestID });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.status === 'success') return res.status(200).end();

    const status =
      ResultCode === 0
        ? 'success'
        : ResultCode === 1032
        ? 'cancelled'
        : 'failed';

    payment.status = status;
    await payment.save();

    await MpesaLog.create({
      transaction_id: CheckoutRequestID,
      status,
      payload: req.body
    });

    if (status === 'success') {
      const user = await User.findById(payment.user);
      const book = await Book.findById(payment.book);

      if (user && book) {
        if (!user.purchasedBooks.includes(book._id)) {
          user.purchasedBooks.push(book._id);
          await user.save();
        }

        await sendPaymentEmail(
          user.email,
          user.name,
          payment.amount,
          CheckoutRequestID,
          book.title
        );
      }
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err);
    res.status(500).json({ message: 'Webhook error' });
  }
});

/* ================= PAYMENT STATUS ================= */
paymentRouter.get('/mpesa/status/:transactionId', authToken, async (req, res) => {
  const payment = await Payment.findOne({
    transaction: req.params.transactionId
  });

  if (!payment)
    return res.status(404).json({ success: false, message: 'Not found' });

  res.json({
    success: true,
    status: payment.status
  });
});


paymentRouter.get("/all-payments", authToken, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("book", "title price");

    res.status(200).json({ success: true, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch payments", error: err.message });
  }
});
export default paymentRouter;
