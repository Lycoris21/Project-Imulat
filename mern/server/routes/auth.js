import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Resend } from "resend";
import User from "../models/User.js";

const router = express.Router();

// Replace with your actual Resend API Key
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

    res.status(200).json({ message: "Login successful.", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

router.post("/signup", async (req, res) => {
  const { username, email, password, birthdate, bio, profilePictureUrl, coverPhotoUrl, role } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: "Username or email already in use." });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      passwordHash,
      birthdate,
      bio,
      profilePictureUrl,
      coverPhotoUrl,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.username || "there"},</p>
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>If you didn’t request this, you can ignore this email.</p>
      `,
    });

    res.status(200).json({
      message: "Reset email sent if account exists.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      message: "Server error during password reset request.",
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error during password reset." });
  }
});

export default router;
