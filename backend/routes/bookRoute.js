import express from "express";
import {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import authToken from "../middleware/authToken.js";

const router = express.Router();

// ---------------- Public Routes ----------------
router.get("/", getAllBooks);           // Get all books
router.get("/:id", getBookById);        // Get a single book by ID

// ---------------- Protected Routes ----------------
// Only admin can add, update, delete
router.post("/", authToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, addBook);

router.put("/:id", authToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, updateBook);

router.delete("/:id", authToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, deleteBook);

export default router;
