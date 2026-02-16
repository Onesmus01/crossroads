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

const storage = multer.memoryStorage();
export const upload = multer({ storage });


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
