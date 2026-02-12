import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  fileUrl: String, // or filePath
  coverImage: String
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);
