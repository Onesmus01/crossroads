import express from "express";
import multer from "multer";
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

const router = express.Router();


// ================= MULTER CONFIG =================

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, "uploads/books"); // PDFs
    } else {
      cb(null, "uploads/covers"); // Images
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// File filter (only allow PDF + images)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});


// ================= PUBLIC ROUTES =================

router.get("/all-books", getAllBooks);
router.get("/:id", getBookById);


// Add book (PDF + Cover upload)
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


// Update book (optional new files)
router.put(
  "/:id",
  authToken,
  isAdmin,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateBook
);


router.delete("/:id", authToken, isAdmin, deleteBook);

export default router;
