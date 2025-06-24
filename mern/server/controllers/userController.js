import { User } from "../models/index.js";
import UserService from "../services/userService.js";

class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Error fetching user" });
    }
  }

  // Create new user
  static async createUser(req, res) {
    try {
      const { username, email, password, birthdate, bio, role, profilePictureUrl, coverPhotoUrl } = req.body;
      
      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await UserService.findUserByEmailOrUsername(email, username);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email or username already exists" });
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
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Error creating user" });
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
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Error updating user" });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const deletedUser = await UserService.deleteUser(req.params.id);
      
      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Error deleting user" });
    }
  }
}

export default UserController;
