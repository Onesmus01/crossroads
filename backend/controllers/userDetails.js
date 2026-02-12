 import User from '../models/userModel.js'
 
 export const userDetails = async (req,res)=> {
    try {

        const user = await User.findById(req.userId).select("-password")

        res.status(200).json({
            success: true,
            message: 'User details available',
            data: user
            
        })
    } catch (error) {
        res.status(500).json({success: false,message: "Internal server Error"})
    }

 }
