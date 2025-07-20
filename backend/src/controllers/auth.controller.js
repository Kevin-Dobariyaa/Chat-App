import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // req.body.password = hashedPassword;
    const newUser = new User({ name, email, password: hashedPassword });

    if (newUser) {
      const token = generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.log("Error in signup controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      token,
    });
  } catch (err) {
    console.log("Error in login controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log("Error in logout controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;
  try {
    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Please provide a profile picture" });
    }

    const uploadRes = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadRes.secure_url },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);

  } catch (err) {
    console.log("Error in updateProfile controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    console.log(req.user);
    const token = req.cookies.jwt;
    res.status(200).json(req.user,token);
  } catch (err) {
    console.log("Error in checkAuth controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}