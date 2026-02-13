import mongoose from "mongoose"

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
}, { timestamps: true })

export default mongoose.model("Wishlist", wishlistSchema)
