import Wishlist from "../models/wishlistModel.js"

// Get all wishlist items for the logged-in user
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.userId }).populate("book")
    res.json({ wishlist })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Add a book to wishlist
export const addToWishlist = async (req, res) => {
  const { bookId } = req.body
  if (!bookId) return res.status(400).json({ message: "Book ID is required" })

  try {
    const exists = await Wishlist.findOne({ user: req.userId, book: bookId })
    if (exists) return res.status(400).json({ message: "Book already in wishlist" })

    const item = await Wishlist.create({ user: req.userId, book: bookId })
    res.status(201).json({ message: "Added to wishlist", item })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Remove a book from wishlist
export const removeFromWishlist = async (req, res) => {
  const { id } = req.params
  try {
    const item = await Wishlist.findOneAndDelete({ user: req.userId, book: id })
    if (!item) return res.status(404).json({ message: "Item not found" })
    res.json({ message: "Removed from wishlist" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
