import express from "express"
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js"
import authToken from "../middleware/authToken.js"

const wishlistRouter = express.Router()

wishlistRouter.get("/get", authToken, getWishlist)
wishlistRouter.post("/add", authToken, addToWishlist)
wishlistRouter.delete("/delete/:id", authToken, removeFromWishlist)
export default wishlistRouter