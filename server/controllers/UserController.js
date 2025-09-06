import { generateToken } from "../libs/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../libs/cloudinary.js";

export const signup = async (req, res) => {
  const { email, fullName, password, bio } = req.body;
  try {
    if (!email || !fullName || !password || !bio) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
      bio,
    });
    
    const token = generateToken(newUser._id);
     
    res.cookie("chatAppToken", token, {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000, 
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
});

    
    await newUser.save();
   
    res
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        userData: newUser,
      });
  } catch (e) {
    
    res.status(500).json({ success: false, message: e.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    res.cookie("chatAppToken", token, {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
});


    res
      .status(200)
      .json({ success: true, message: "Login successful", userData: user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res
      .status(200)
      .json({
        success: true,
        userData: req.user,
      });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("chatAppToken", {
      httpOnly: true,
     secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const updateProfile = async (req, res) => {
  const { fullName, bio, profilePic } = req.body;
  try {
    const userId = req.user._id;
    let updatedUser;
    if (!profilePic) {
      if (!bio || !fullName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio },
        { new: true }
      ).select("-password");
    } else {
      if (!bio || !fullName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      console.log(profilePic);
      
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      ).select("-password");
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        userData: updatedUser,
      });
  } catch (e) {
    res.status(500).json({ success: true, message: e.message });
  }
};
