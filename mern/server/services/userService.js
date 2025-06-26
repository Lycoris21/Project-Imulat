import { User, Claim, Report, Reaction} from "../models/index.js";
import reportService from './reportService.js';
import claimService from './claimService.js';

class UserService {
  // Get all users
  static async getAllUsers() {
    return await User.find({}, '-passwordHash');
  }

  // Get user by ID
  static async getUserById(id) {
    // Step 1: Get the user without passwordHash
    const user = await User.findById(id, '-passwordHash').lean();
    if (!user) throw new Error('User not found');

    // Step 2: Get all claims authored by this user using service
    const claims = await claimService.getClaimsByUser(id); // must use .lean({ virtuals: true }) internally
    user.claims = claims;

    // Step 3: If admin, get reports using service
    if (user?.role === 'admin') {
      const reports = await reportService.getReportsByUser(id); // already populates and returns virtuals
      user.reports = reports;
    }
    
    // Step 4: Count likes and dislikes on the user object
    const [likes, dislikes] = await Promise.all([
      Reaction.countDocuments({ targetId: id, targetType: 'user', reactionType: 'like' }),
      Reaction.countDocuments({ targetId: id, targetType: 'user', reactionType: 'dislike' }),
    ]);

    user.likes = likes;
    user.dislikes = dislikes;

    return user;
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
