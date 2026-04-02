import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Single validation check
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide email and password" 
      });
    }

    const user = await User.findOne({ email });

    // Security: Don't reveal if email exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const passwordExist = await bcrypt.compare(password, user.password);

    if (!passwordExist) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const tokenData = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    // Set cookie (works if domains match, ignored if cross-domain)
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    // Return token for Authorization header (cross-domain fallback)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,  // 🔥 Frontend stores this for headers
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("SignIn error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const signUp = async (req,res) => {
    try {
        const {name,email,password} = req.body
           if (!name) return res.status(400).json({ success: false, message: "Please provide username" });
            if (!email) return res.status(400).json({ success: false, message: "Please provide email" });
            if (!password) return res.status(400).json({ success: false, message: "Please provide password" });
        const userData = await User.findOne({email})
        if(userData){
            return res.status(400).json({success: false,message: "User has already registered"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        if(!hashedPassword){
            throw new Error("Something is wrong")
        }

        const savedUser = new User({
            name: name,
            role: 'GENERAL',
            email: email,
            password: hashedPassword
        })

        await savedUser.save()
        res.status(201).json({success: true,message: "User created successfully",data: savedUser})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const logout = async (req, res) => {
  try {
    // Clear the cookie named "token"
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // optional
      sameSite: "strict",
    });

    res.json({ success: true, message: "Logged out successfully", data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async(req,res)=> {
    try {
        const users =await User.find().select("-password")
        await res.status(200).json({
            success:true,
            message:"user fetched Successfully",
            data: users
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }
}

export const updateUser = async(req,res)=> {
    try {
        const {userId,name,email,role} = req.body
        const payload = {
            ...(email && {email: email}),
            ...(name && {name: name}),
            ...(role && {role: role})
        }

        const updatedUser = await User.findByIdAndUpdate(userId,payload,{new:true}).select("-password")
            if (!updatedUser) {
            return res.status(404).json({
            success: false,
            message: "User not found",
        });
        }
          return res.status(200).json({
          success: true,
          message: "User updated successfully",
          data: updatedUser
    });
    

    } catch (error) {
         return res.status(500).json({
         success: false,
         message: "Server error"
    });
  }
    
}


