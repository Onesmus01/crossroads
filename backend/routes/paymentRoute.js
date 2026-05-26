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
import { getAllPayments, getPaymentStats } from "../controllers/paymentController.js";

dotenv.config();
const paymentRouter = express.Router();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  CALLBACK_URL,
  MPESA_ENV
} = process.env;

if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE || !MPESA_PASSKEY || !CALLBACK_URL) {
  throw new Error('Missing required M-Pesa environment variables.');
}

const BASE_URL = MPESA_ENV === 'production'
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
    const buffers = [];
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
    doc.fontSize(12).text(`Transaction ID: ${transactionId}`);
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

    console.log('📱 Payment Request:', { phone, bookId, userId: req.userId });

    if (!phone || !bookId) {
      return res.status(400).json({ success: false, message: 'Phone and bookId required' });
    }

    // Phone formatting: 0712345678 → 254712345678
    if (phone.startsWith('0')) phone = '254' + phone.slice(1);
    if (!/^(2547|2541)\d{8}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone format' });
    }

    const [user, book] = await Promise.all([
      User.findById(req.userId),
      Book.findById(bookId)
    ]);

    if (!user || !book) {
      return res.status(404).json({ success: false, message: 'User or Book not found' });
    }

    if (user.purchasedBooks.includes(bookId)) {
      return res.status(400).json({ success: false, message: 'Book already purchased' });
    }

    const token = await getMpesaToken();

    /* =========================================
       EXACT SAME LOGIC AS YOUR WORKING APP
       ========================================= */
    const storeNumber = process.env.MPESA_STORE_NUMBER;  // Daraja-registered merchant (BusinessShortCode + Password)
    const tillNumber = MPESA_SHORTCODE;                  // Where money lands (PartyB)

    if (!storeNumber) {
      return res.status(500).json({
        success: false,
        message: 'Server config error: MPESA_STORE_NUMBER not set',
      });
    }

    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
    // CRITICAL: Password uses STORE NUMBER (same as working app)
    const password = Buffer.from(`${storeNumber}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    // DEBUG
    console.log('[MPESA DEBUG] ==================================');
    console.log('[MPESA DEBUG] Store Number (BusinessShortCode):', storeNumber);
    console.log('[MPESA DEBUG] Till Number (PartyB):', tillNumber);
    console.log('[MPESA DEBUG] PhoneNumber:', phone);
    console.log('[MPESA DEBUG] Amount:', book.price);
    console.log('[MPESA DEBUG] Timestamp:', timestamp);
    console.log('[MPESA DEBUG] Password prefix:', password.slice(0, 20) + '...');
    console.log('[MPESA DEBUG] ==================================');

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: storeNumber,       // Daraja-registered number
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: book.price,
        PartyA: phone,
        PartyB: tillNumber,                   // Till where money goes
        PhoneNumber: phone,
        CallBackURL: CALLBACK_URL,
        AccountReference: `Book-${book._id.toString().slice(-6)}`,
        TransactionDesc: 'Book Purchase',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ STK Response:', data);

    await Payment.create({
      user: user._id,
      book: book._id,
      phone,
      amount: book.price,
      status: 'pending',
      transaction: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID
    });

    res.json({
      success: true,
      message: 'STK Push sent. Enter M-Pesa PIN.',
      transaction_id: data.CheckoutRequestID,
    });

  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error('[MPESA STK ERROR]', errData);

    let message = 'STK Push failed. Try again.';
    if (errData?.errorCode === '400.002.02') message = 'Invalid phone number';
    if (errData?.errorCode === '500.003.02') message = 'System busy. Try again later';
    if (errData?.errorCode === '404.001.03') message = 'M-Pesa service error. Please try again.';
    if (errData?.errorCode === '500.001.1001') message = 'Merchant configuration error. Contact support.';

    res.status(500).json({ success: false, message });
  }
});

/* ================= WEBHOOK ================= */
paymentRouter.post('/mpesa/webhook', express.json(), async (req, res) => {
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  try {
    const stkCallback = req.body?.Body?.stkCallback;
    if (!stkCallback) {
      console.warn('[WEBHOOK] Missing stkCallback');
      return;
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;
    console.log('📥 Webhook:', { CheckoutRequestID, ResultCode, ResultDesc });

    const payment = await Payment.findOne({ transaction: CheckoutRequestID });
    if (!payment || payment.status === 'success') return;

    const status = ResultCode === 0 ? 'success' : ResultCode === 1032 ? 'cancelled' : 'failed';
    payment.status = status;
    payment.mpesaResultDesc = ResultDesc;
    await payment.save();

    await MpesaLog.create({
      transaction_id: CheckoutRequestID,
      status,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      payload: req.body
    });

    if (status === 'success') {
      const [user, book] = await Promise.all([
        User.findById(payment.user),
        Book.findById(payment.book)
      ]);

      if (user && book) {
        if (!user.purchasedBooks.includes(book._id)) {
          user.purchasedBooks.push(book._id);
          await user.save();
        }
        await sendPaymentEmail(user.email, user.name, payment.amount, CheckoutRequestID, book.title);
      }
    }

    console.log(`✅ [WEBHOOK] Payment ${status}:`, CheckoutRequestID);
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err);
  }
});

/* ================= PAYMENT STATUS ================= */
paymentRouter.get('/mpesa/status/:transactionId', authToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({ transaction: req.params.transactionId });
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    if (payment.user.toString() !== req.userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    res.json({ success: true, status: payment.status, amount: payment.amount, createdAt: payment.createdAt });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch status' });
  }
});

/* ================= ADMIN ROUTES ================= */
paymentRouter.get("/all-payments", authToken, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("book", "title price")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch payments", error: err.message });
  }
});

paymentRouter.get("/all", authToken, isAdmin, getAllPayments);
paymentRouter.get("/stats", authToken, isAdmin, getPaymentStats);

export default paymentRouter;