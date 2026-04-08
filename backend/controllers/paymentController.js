import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import Book from "../models/bookModel.js";

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "user",
        select: "name email profilePic",
        model: User
      })
      .populate({
        path: "book",
        select: "title coverImage author price",
        model: Book
      })
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message
    });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({
      success: true,
      stats,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats"
    });
  }
};