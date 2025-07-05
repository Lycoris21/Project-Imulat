import { findUserByEmail, verifyPassword, hashPassword, generateResetToken, sendPasswordResetEmail,  } from "../services/authService.js";
import User from "../models/User.js";

// loginUser
export const loginUser = async(req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }
    res.status(200).json({
      message: "Login successful.",
      user
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Server error during login."
    });
  }
};

// registerUser
export const registerUser = async(req, res) => {
  const { username, email, password, birthdate, bio, profilePictureUrl, coverPhotoUrl, role } = req.body;

  console.log('Incoming values:', req.body.profilePictureUrl, typeof req.body.profilePictureUrl);

  
  try {
    const existingUser = await User.findOne({
      $or: [{
          email
        }, {
          username
        }
      ]
    });
    if (existingUser)
      return res.status(400).json({
        message: "Username or email already in use."
      });

    const passwordHash = await hashPassword(password);

    const newUser = new User({
      username,
      email,
      passwordHash,
      birthdate,
      bio,
      profilePictureUrl: profilePictureUrl || null,
      coverPhotoUrl: coverPhotoUrl || null,
      role,
    });

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully."
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Server error during registration."
    });
  }
};

// forgotPassword
export const forgotPassword = async(req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({
        message: "If an account with that email exists, a reset link has been sent."
      });
    }

    const { token, expiry } = generateResetToken();
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    await sendPasswordResetEmail(user, token);

    res.status(200).json({
      message: "Reset email sent if account exists."
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      message: "Server error during password reset request."
    });
  }
};

// resetPassword
export const resetPassword = async(req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: {
        $gt: Date.now()
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token."
      });
    }

    const passwordHash = await hashPassword(newPassword);
    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({
      message: "Password reset successful. You can now log in."
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Server error during password reset."
    });
  }
};
