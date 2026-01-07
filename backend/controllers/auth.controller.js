// ======================= IMPORTS =======================

// Password hashing library
import bcrypt from "bcryptjs";

// Used for generating secure random tokens (reset password)
import crypto from "crypto";

// User & House database models
import { User } from "../models/user.model.js";
import House from "../models/house.model.js";

// Email sending utilities
import {
  sendLinkForResettingPwd,
  sendResetPwdSuccessfullyMail,
  sendVerificatinMail,
  sendWemcomeEmail,
} from "../sendingMails/emails.js";

// JWT token generation + cookie setter
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

// ======================= SIGNUP =======================
export const signup = async (req, res) => {
  try {
    // Extract user data from request body
    let { email, username, password, address = "", phone = "" } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      throw new Error("EMAIL, USERNAME AND PASSWORD ARE REQUIRED!");
    }

    // Check if user already exists
    const isExisted = await User.findOne({ email });

    // If user exists and is already verified → block signup
    if (isExisted && isExisted.isVerified)
      throw new Error("USER ALREADY EXISTS");

    // Generate a 6-digit verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000);

    // Token expires after 24 hours
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    let user;

    // Hash password before saving
    password = await bcrypt.hash(password, 10);

    // If user exists but not verified → update their info
    if (isExisted && !isExisted.isVerified) {
      user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            username,
            password,
            verificationToken,
            verificationTokenExpiresAt,
            address,
            phone,
          },
        },
        { new: true }
      );
    } else {
      // Otherwise create a new user
      user = await User.create({
        username,
        email,
        password,
        verificationToken,
        verificationTokenExpiresAt,
        address,
        phone,
      });
    }

    // Send verification email
    await sendVerificatinMail(user.email, verificationToken);

    // Respond without password
    res.status(201).json({
      status: "success",
      message: "verification email sent successfully",
      data: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ======================= VERIFY EMAIL =======================
export const verifyMail = async (req, res) => {
  try {
    // Verification code from frontend
    const { code } = req.body;

    // Find user with valid & non-expired code
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "invalid or expired verification code",
      });
    }

    // Send welcome email
    await sendWemcomeEmail(user.email, user.username);

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    // Auto-login after verification
    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      status: "success",
      message: "email verified successfully",
      data: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.clearCookie("auth-token");
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

// ======================= LOGIN =======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new Error("missing email or password field");
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) throw new Error("user does not exit please signup");

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("invalid password");

    // Generate auth token
    generateTokenAndSetCookie(res, user.id);

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      status: "success",
      message: "user logged in successfully",
      data: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ======================= LOGOUT =======================
export const logout = async (req, res) => {
  // Clear auth cookie
  res.clearCookie("auth-token");

  res.status(200).json({
    status: "success",
    message: "user logged out successfully",
  });
};

// ======================= FORGOT PASSWORD =======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) throw new Error("invalid email");

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(10).toString("hex");

    // Token valid for 15 minutes
    const resetPasswordTokenExpiresAt = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;
    await user.save();

    // Send reset link via email
    await sendLinkForResettingPwd(resetPasswordToken, user.email);

    res.status(200).json({
      status: "success",
      message: "verification mail sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

// ======================= RESET PASSWORD =======================
export const resetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    let { newPassword } = req.body;

    // Validate input
    if (!token || !newPassword)
      throw new Error("missing token or the new password");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) throw new Error("Invalid or expired token");

    // Hash new password
    newPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;

    await user.save();

    // Notify user
    await sendResetPwdSuccessfullyMail(user.email);

    res.status(200).json({
      status: "success",
      message: "password updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ======================= CHECK AUTH =======================
export const checkAuth = async (req, res) => {
  try {
    // Fetch authenticated user
    const user = await User.findById(req.userId).select("-password");

    if (!user) throw new Error("user not found");

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(200).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ======================= GOOGLE AUTH =======================
export const google = async (req, res) => {
  try {
    const { email, username, avatar, address = "", phone = "" } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email }).lean();

    if (!user) {
      // Generate random password for Google users
      let password = Math.random().toString(36).slice(-8);
      password = await bcrypt.hash(password, 10);

      user = await User.create({
        username: username.split(" ").join("").toLowerCase(),
        email,
        password,
        avatar,
        isVerified: true,
        address,
        phone,
      });
    }

    // Login user
    generateTokenAndSetCookie(res, user._id);

    user = user._doc || user;

    res.status(200).json({
      status: "success",
      message: "user logged in with google successfully",
      data: {
        ...user,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ======================= DELETE ACCOUNT =======================
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    // Delete user
    await User.findByIdAndDelete(userId);

    // Clear auth cookie
    res.clearCookie("auth-token");

    res.status(200).json({
      status: "success",
      message: "user account deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ======================= UPDATE PROFILE =======================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, oldPassword, newPassword, avatar, address, phone } =
      req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const updateData = {};

    // Optional updates
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;

    // Password change logic
    if (newPassword) {
      if (!oldPassword) throw new Error("Current password is required");

      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!isOldPasswordValid) throw new Error("Current password is incorrect");

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ======================= GET HOUSE OWNER =======================
export const getHouseOwner = async (req, res) => {
  try {
    const houseId = req.params.id;

    // Populate owner info
    const house = await House.findById(houseId).populate(
      "userRef",
      "-password"
    );

    if (!house) {
      return res.status(404).json({
        status: "fail",
        message: "HOUSE NOT FOUND",
      });
    }

    res.status(200).json({
      status: "success",
      data: house.userRef,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
