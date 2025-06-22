import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare raw password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Optional: send back basic user data (not the hash)
    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

    // Optional: You could also issue a JWT here
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

router.post("/signup", async (req, res) => {
  const {
    username,
    email,
    password,
    birthdate,
    bio,
    profilePictureUrl,
    backgroundImageUrl,
    role
  } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already in use." });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user document
    const newUser = new User({
      username,
      email,
      passwordHash,
      birthdate,
      bio,
      profilePictureUrl,
      backgroundImageUrl,
      role
    });

    // Save to MongoDB Atlas
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

export default router;
