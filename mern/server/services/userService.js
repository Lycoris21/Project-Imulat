import { User } from "../models/index.js";

class UserService {
  // Get all users
  static async getAllUsers() {
    return await User.find({}, '-passwordHash');
  }

  // Get user by ID
  static async getUserById(id) {
    return await User.findById(id, '-passwordHash');
  }

  // Find user by email or username
  static async findUserByEmailOrUsername(email, username) {
    return await User.findOne({ 
      $or: [{ email }, { username }] 
    });
  }

  // Create new user
  static async createUser(userData) {
    const { password, ...otherData } = userData;
    
    // TODO: Hash password before saving (use bcrypt)
    const newUser = new User({
      ...otherData,
      passwordHash: password // In production, hash this password
    });

    const savedUser = await newUser.save();
    
    // Return user without password
    const userResponse = savedUser.toObject();
    delete userResponse.passwordHash;
    
    return userResponse;
  }

  // Update user
  static async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');
  }

  // Delete user
  static async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  // Get user with password (for authentication)
  static async getUserWithPassword(email) {
    return await User.findOne({ email });
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    return await User.findByIdAndUpdate(
      id,
      { passwordHash: hashedPassword },
      { new: true, runValidators: true }
    ).select('-passwordHash');
  }
}

export default UserService;
