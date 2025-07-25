import { User, Claim, Report, Reaction, Activity } from "../models/index.js";
import reportService from './reportService.js';
import claimService from './claimService.js';
import activityService from './activityService.js';

class UserService {
  // Get all users
  static async getAllUsers() {
    return await User.find({
      deletedAt: null
    }, '-passwordHash');
  }

  // Get user by ID
  static async getUserById(id, viewerId = null) {
    const user = await User.findOne({
      _id: id
    }, '-passwordHash').lean();
    if (!user)
      throw new Error('User not found');

    const claims = await claimService.getClaimsByUser(id);
    user.claims = claims;

    if (user?.role === 'admin' || user?.role === 'researcher') {
      const reports = await reportService.getReportsByUser(id, viewerId); // pass viewer ID
      user.reports = reports;
    }

    const [likes, dislikes] = await Promise.all([
          Reaction.countDocuments({
            targetId: id,
            targetType: 'user',
            reactionType: 'like'
          }),
          Reaction.countDocuments({
            targetId: id,
            targetType: 'user',
            reactionType: 'dislike'
          }),
        ]);

    user.likes = likes;
    user.dislikes = dislikes;

    return user;
  }

  // Find user by email or username
  static async findUserByEmailOrUsername(email, username) {
    return await User.findOne({
      $or: [{
          email
        }, {
          username
        }
      ],
      deletedAt: null
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
    const updated = await User.findByIdAndUpdate(
        id,
        updateData, {
        new: true,
        runValidators: true
      }).select('-passwordHash');

    // Log the activity for profile updates
    if (updated && (updateData.username || updateData.bio || updateData.profilePictureUrl)) {
      try {
        await activityService.logActivity(
          id,
          'PROFILE_UPDATE',
          'USER',
          id,
          'User', {
          actionDetails: 'info' // Profile information update
        });
      } catch (activityError) {
        console.error('Error logging profile update activity:', activityError);
        // Don't fail the update if activity logging fails
      }
    }

    return updated;
  }

  // Delete user
  static async deleteUser(id) {
    const deletedUser = await User.findByIdAndUpdate(
        id, {
        deletedAt: new Date()
      }, {
        new: true
      });

    if (deletedUser) {
      await activityService.logActivity(
        id,
        'PROFILE_UPDATE',
        'USER',
        id,
        'User', {
        actionDetails: 'delete'
      });
    }

    return deletedUser;
  }

  // Get user with password (for authentication)
  static async getUserWithPassword(email) {
    return await User.findOne({
      email,
      deletedAt: null
    });
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    const updatedUser = await User.findByIdAndUpdate(
        id, {
        passwordHash: hashedPassword
      }, {
        new: true,
        runValidators: true,
      }).select('-passwordHash'); // Exclude password from result

    if (updatedUser) {
      // Log activity only if update was successful
      await activityService.logActivity(
        id,
        'PROFILE_UPDATE',
        'USER',
        id,
        'User', {
        actionDetails: 'password',
      });
    }

    return updatedUser;
  }

  // Search users
  static async searchUsers(query) {
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

    const users = await User.find({
      $and: [{
          $or: [{
              username: {
                $regex: searchRegex
              }
            }, {
              email: {
                $regex: searchRegex
              }
            }, {
              firstName: {
                $regex: searchRegex
              }
            }, {
              lastName: {
                $regex: searchRegex
              }
            }
          ]
        }, {
          deletedAt: null
        }
      ]
    }, '-passwordHash') // Exclude password hash
      .limit(20) // Limit results to 20 users
      .sort({
        username: 1
      }) // Sort by username
      .lean();

    // Add like and dislike counts for each user
    const usersWithReactions = await Promise.all(users.map(async(user) => {
          const [likes, dislikes] = await Promise.all([
                Reaction.countDocuments({
                  targetId: user._id,
                  targetType: 'user',
                  reactionType: 'like'
                }),
                Reaction.countDocuments({
                  targetId: user._id,
                  targetType: 'user',
                  reactionType: 'dislike'
                }),
              ]);

          return {
            ...user,
            likes,
            dislikes
          };
        }));

    return usersWithReactions;
  }
}

export default UserService;
