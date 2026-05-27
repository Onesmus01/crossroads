import express from "express";
import multer from "multer";
import Book from "../models/bookModel.js";
import path from "path";
import {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import authToken from "../middleware/authToken.js";
import isAdmin from "../middleware/adminAuth.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import fs from "fs";
import https from "https";

const router = express.Router();

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ================= PUBLIC ROUTES =================
router.get("/all-books", getAllBooks);
router.get("/:id", getBookById);

router.post(
  "/add",
  authToken,
  isAdmin,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  addBook
);

router.put(
  "/update/:id",
  authToken,
  isAdmin,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateBook
);

router.delete("/:id", authToken, isAdmin, deleteBook);

/**
 * ✅ Check Ownership
 */
router.get('/:id/check-ownership', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const isPurchased = user.purchasedBooks?.some(
      (bookId) => bookId.toString() === id
    );

    return res.json({
      success: true,
      isPurchased: !!isPurchased,
    });

  } catch (err) {
    console.error('Ownership check error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Helper: Fetch file from URL using https (more reliable than fetch for some hosts)
 */
function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * ✅ Secure Download — Proxies from Cloudinary with fallback
 */
router.get('/:id/download', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const isPurchased = user.purchasedBooks?.some(
      (bookId) => bookId.toString() === id
    );

    const isFree = book.price === 0;

    if (!isPurchased && !isFree) {
      return res.status(403).json({
        success: false,
        message: 'Purchase required to download',
      });
    }

    if (!book.fileUrl) {
      return res.status(404).json({ success: false, message: 'File not available' });
    }

    console.log(`[DOWNLOAD] Fetching from Cloudinary: ${book.fileUrl}`);

    let buffer;
    let fetchError;

    // Try 1: Node.js native fetch
    try {
      const fileRes = await fetch(book.fileUrl, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (Node.js Backend)' }
      });
      if (fileRes.ok) {
        buffer = Buffer.from(await fileRes.arrayBuffer());
        console.log(`[DOWNLOAD] fetch() success — ${buffer.length} bytes`);
      } else {
        fetchError = `fetch() got HTTP ${fileRes.status}`;
        console.warn(`[DOWNLOAD] ${fetchError}`);
      }
    } catch (err) {
      fetchError = `fetch() error: ${err.message}`;
      console.warn(`[DOWNLOAD] ${fetchError}`);
    }

    // Try 2: https module fallback
    if (!buffer) {
      try {
        buffer = await fetchFile(book.fileUrl);
        console.log(`[DOWNLOAD] https.get success — ${buffer.length} bytes`);
      } catch (err) {
        console.warn(`[DOWNLOAD] https.get error: ${err.message}`);
      }
    }

    // If we got the file, send it
    if (buffer && buffer.length > 0) {
      const safeFileName = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }

    // 🔥 FALLBACK: Return direct URL to frontend
    // Browser can download from Cloudinary directly (no CORS for navigation)
    console.log(`[DOWNLOAD] Proxy failed, returning direct URL fallback`);
    return res.json({
      success: true,
      fileUrl: book.fileUrl,
      fileName: `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      fallback: true,
      message: 'Use direct link to download',
    });

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ success: false, message: 'Download error: ' + err.message });
  }
});

/**
 * ✅ Read Online / View — Serves PDF inline with fallback
 */
router.get('/:id/view', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const isPurchased = user.purchasedBooks?.some(
      (bookId) => bookId.toString() === id
    );

    const isFree = book.price === 0;

    if (!isPurchased && !isFree) {
      return res.status(403).json({
        success: false,
        message: 'Purchase required to read this book',
      });
    }

    if (!book.fileUrl) {
      return res.status(404).json({ success: false, message: 'File not available' });
    }

    console.log(`[VIEW] Fetching from Cloudinary: ${book.fileUrl}`);

    let buffer;

    // Try 1: fetch
    try {
      const fileRes = await fetch(book.fileUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Node.js Backend)' }
      });
      if (fileRes.ok) {
        buffer = Buffer.from(await fileRes.arrayBuffer());
        console.log(`[VIEW] fetch() success — ${buffer.length} bytes`);
      } else {
        console.warn(`[VIEW] fetch() got HTTP ${fileRes.status}`);
      }
    } catch (err) {
      console.warn(`[VIEW] fetch() error: ${err.message}`);
    }

    // Try 2: https.get
    if (!buffer) {
      try {
        buffer = await fetchFile(book.fileUrl);
        console.log(`[VIEW] https.get success — ${buffer.length} bytes`);
      } catch (err) {
        console.warn(`[VIEW] https.get error: ${err.message}`);
      }
    }

    // If we got the file, send it inline
    if (buffer && buffer.length > 0) {
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }

    // 🔥 FALLBACK: Return direct URL — frontend will handle it
    console.log(`[VIEW] Proxy failed, returning direct URL fallback`);
    return res.json({
      success: true,
      fileUrl: book.fileUrl,
      fallback: true,
    });

  } catch (err) {
    console.error('View error:', err);
    res.status(500).json({ success: false, message: 'View error: ' + err.message });
  }
});

/**
 * ✅ Read Online — Returns JSON with fileUrl (legacy endpoint)
 */
router.get('/:id/read', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const isPurchased = user.purchasedBooks?.some(
      (bookId) => bookId.toString() === id
    );

    const isFree = book.price === 0;

    if (!isPurchased && !isFree) {
      return res.status(403).json({
        success: false,
        message: 'Purchase required to read this book',
      });
    }

    if (!book.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'Book file not available',
      });
    }

    return res.json({
      success: true,
      fileUrl: book.fileUrl,
    });

  } catch (err) {
    console.error('Read error:', err);
    res.status(500).json({ success: false, message: 'Read error' });
  }
});

/**
 * ✅ Download Logging
 */
router.post('/:id/download-log', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    await Book.findByIdAndUpdate(id, {
      $inc: { downloadCount: 1 },
    });

    return res.json({ success: true });

  } catch (err) {
    console.error('Download log error:', err);
    res.status(500).json({ success: false });
  }
});

export default router;