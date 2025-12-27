import cloudinary from "../dbconfig/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../model/user.Model.js";
import bcrypt from "bcryptjs";

/* SIGNUP */
export const signupUser = async (req, res) => {
  try {
    const { userName, email, password, bio, profilePic } = req.body;

    if (!userName || !email || !password ||!bio) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let uploadedPic = "";
    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      uploadedPic = upload.secure_url;
    }

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
      bio,
      profilePic: uploadedPic,
    });

    const token = generateToken(newUser._id);

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      user: userResponse,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/*LOGIN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      user: userResponse,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* CHECK AUTH */
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

/*UPDATE PROFILE */
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, userName } = req.body;
    const userId = req.user._id;

    let updateData = { bio, userName };

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
