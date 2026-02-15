import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional if for specific user
  read: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
