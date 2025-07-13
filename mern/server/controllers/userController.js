import { User } from "../models/index.js";
import UserService from "../services/userService.js";
import bcrypt from "bcrypt";

class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        error: "Error fetching users"
      });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const profileUserId = req.params.id;
      const viewerId = req.headers['x-viewer-id']; // safely read viewer ID

      const user = await UserService.getUserById(profileUserId, viewerId);
      res.json(user);
    } catch (err) {
      console.error("Error:", err);
      res.status(404).json({
        error: "User not found"
      });
    }
  }

  // Create new user
  static async createUser(req, res) {
    try {
      const { username, email, password, birthdate, bio, role, profilePictureUrl, coverPhotoUrl } = req.body;

      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({
          error: "Username, email, and password are required"
        });
      }

      // Check if user already exists
      const existingUser = await UserService.findUserByEmailOrUsername(email, username);
      if (existingUser) {
        return res.status(400).json({
          error: "User with this email or username already exists"
        });
      }

      // Create user
      const userData = {
        username,
        email,
        password,
        birthdate,
        bio,
        role,
        profilePictureUrl,
        coverPhotoUrl
      };

      const newUser = await UserService.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: error.message
        });
      }
      res.status(500).json({
        error: "Error creating user"
      });
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { username, email, birthdate, bio, role, profilePictureUrl, coverPhotoUrl } = req.body;

      const updateData = {
        username,
        email,
        birthdate,
        bio,
        role,
        profilePictureUrl,
        coverPhotoUrl
      };

      const updatedUser = await UserService.updateUser(req.params.id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: error.message
        });
      }
      res.status(500).json({
        error: "Error updating user"
      });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const deletedUser = await UserService.deleteUser(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      res.status(200).json({
        message: "User deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        error: "Error deleting user"
      });
    }
  }

  // Change user password
  static async changePassword(req, res) {
    try {
      const { userId, oldPassword, newPassword } = req.body;

      // Validation
      if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({
          error: "User ID, old password, and new password are required"
        });
      }

      // Get user with password for verification
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          error: "Current password is incorrect"
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const updatedUser = await UserService.updatePassword(userId, hashedNewPassword);

      res.status(200).json({
        message: "Password changed successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({
        error: "Error changing password"
      });
    }
  }

  // Verify user password
  static async verifyPassword(req, res) {
    try {
      const { userId, password } = req.body;

      // Validation
      if (!userId || !password) {
        return res.status(400).json({
          error: "User ID and password are required"
        });
      }

      // Get user with password for verification
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (isMatch) {
        res.status(200).json({
          message: "Password verified successfully",
          verified: true
        });
      } else {
        res.status(400).json({
          error: "Password is incorrect",
          verified: false
        });
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      res.status(500).json({
        error: "Error verifying password"
      });
    }
  }

  // Search users
  static async searchUsers(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === '') {
        return res.status(200).json([]);
      }

      const users = await UserService.searchUsers(q.trim());
      res.status(200).json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({
        error: "Error searching users"
      });
    }
  }

}

export default UserController;
