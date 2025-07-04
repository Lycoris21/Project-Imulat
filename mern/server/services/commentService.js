import mongoose from 'mongoose';
import { Comment, Notification, Report, Claim, Reaction, Activity } from '../models/index.js';
import { capitalize } from '../utils/helpers.js';
import activityService from './activityService.js';

class CommentService {
  static async createComment({
    userId,
    targetId,
    targetType,
    parentCommentId = null,
    commentContent
  }) {
    const newComment = new Comment({
      userId,
      targetId,
      targetType,
      parentCommentId,
      commentContent
    });

    const savedComment = await newComment.save();

    let postType = targetType;
    let postId = targetId;

    // Log the activity
    try {
      if (parentCommentId) {
        // If it's a reply, use the root comment's post context
        const parentComment = await Comment.findById(parentCommentId);
        if (parentComment) {
          postType = parentComment.targetType;
          postId = parentComment.targetId;
        }
      }

      await activityService.logActivity(
        userId,
        parentCommentId ? 'REPLY' : 'COMMENT',
        targetType.toUpperCase(),
        savedComment._id,
        'Comment', {
        postType: capitalize(postType),
        postId
      });
    } catch (activityError) {
      console.error('Error logging comment activity:', activityError);
      // Don't fail the comment if activity logging fails
    }

    try {
      let recipientId = null;

      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId).populate("userId");
        if (parentComment) {
          if (String(parentComment.userId._id) !== String(userId)) {
            recipientId = parentComment.userId._id;
          }
        }
      } else {
        const Model = targetType === "claim" ? Claim : Report;
        const parent = await Model.findById(targetId).populate("userId");
        if (parent && String(parent.userId._id) !== String(userId)) {
          recipientId = parent.userId._id;
        }
      }

      if (recipientId) {
        const notif = await Notification.create({
          recipientId,
          senderId: userId,
          type: "comment",
          targetType: "comment",
          targetId: savedComment._id,
          postType,
          postId,
          read: false,
        });

        const { io } = await import("../server.js");
        io.to(recipientId.toString()).emit("new-notification", notif);
      }
    } catch (err) {
      console.error("⚠️ Failed to create or emit notification:", err.message);
    }

    return savedComment;
  }

  static async getCommentsByTarget(targetType, targetId, userId = null) {
    const comments = await Comment.find({
      targetType,
      targetId,
      deletedAt: null
    })
      .populate('userId')
      .sort({
        createdAt: 1
      }); // earlier comments first

    const commentIds = comments.map(c => c._id);

    // Get reaction counts
    const reactions = await Reaction.aggregate([{
            $match: {
              targetId: {
                $in: commentIds.map(id => new mongoose.Types.ObjectId(id))
              },
              targetType: 'comment'
            }
          }, {
            $group: {
              _id: {
                targetId: '$targetId',
                reactionType: '$reactionType'
              },
              count: {
                $sum: 1
              }
            }
          }
        ]);

    // Get user reactions
    let userReactions = [];
    if (userId) {
      userReactions = await Reaction.find({
        userId: new mongoose.Types.ObjectId(userId),
        targetId: {
          $in: commentIds
        },
        targetType: 'comment'
      });
    }

    // Build a map for faster access
    const commentMap = {};
    comments.forEach(comment => {
      const obj = comment.toObject();
      obj.reactionCounts = {
        like: 0,
        dislike: 0
      };

      reactions.forEach(r => {
        if (r._id.targetId.equals(comment._id)) {
          obj.reactionCounts[r._id.reactionType] = r.count;
        }
      });

      if (userId) {
        const userReaction = userReactions.find(r => r.targetId.equals(comment._id));
        obj.userReaction = userReaction ? userReaction.reactionType : null;
      }

      obj.replies = [];
      commentMap[comment._id.toString()] = obj;
    });

    // Nest replies
    const topLevelComments = [];

    Object.values(commentMap).forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentMap[comment.parentCommentId.toString()];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    return topLevelComments;
  }

  static async toggleLike(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment)
      throw new Error("Comment not found");

    const hasLiked = comment.likedBy.includes(userId);
    const hasDisliked = comment.dislikedBy.includes(userId);

    if (hasLiked) {
      // Remove like
      comment.likedBy.pull(userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Add like
      comment.likedBy.push(userId);
      comment.likes += 1;

      if (hasDisliked) {
        comment.dislikedBy.pull(userId);
        comment.dislikes = Math.max(0, comment.dislikes - 1);
      }

      if (String(comment.userId._id || comment.userId) !== String(userId)) {
        // Trace the comment back to its post (claim/report)
        const postType = comment.targetType;
        const postId = comment.targetId;

        const notif = await Notification.findOneAndUpdate({
          recipientId: comment.userId,
          senderId: userId,
          type: "like",
          targetType: "comment",
          targetId: comment._id,
        }, {
          $set: {
            read: false,
            createdAt: new Date(),
            postType,
            postId,
          },
        }, {
          upsert: true,
          new: true,
        });

        // Emit it
        const { io } = await import("../server.js");
        io.to(comment.userId.toString()).emit("new-notification", notif);
      }
    }

    await comment.save();
    return {
      likes: comment.likes,
      dislikes: comment.dislikes,
      userReaction: hasLiked ? null : 'like'
    };
  }

  static async toggleDislike(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment)
      throw new Error("Comment not found");

    const hasLiked = comment.likedBy.includes(userId);
    const hasDisliked = comment.dislikedBy.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      comment.dislikedBy.pull(userId);
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    } else {
      // Add dislike
      comment.dislikedBy.push(userId);
      comment.dislikes += 1;

      // Remove like if exists
      if (hasLiked) {
        comment.likedBy.pull(userId);
        comment.likes = Math.max(0, comment.likes - 1);
      }
    }

    await comment.save();
    return {
      likes: comment.likes,
      dislikes: comment.dislikes,
      userReaction: hasDisliked ? null : 'dislike'
    };
  }

  static async updateComment(commentId, userId, newContent) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only allow the comment author to edit their own comment
    if (comment.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized: You can only edit your own comments");
    }

    comment.commentContent = newContent;
    comment.updatedAt = new Date();

    const updatedComment = await comment.save();

    try {
      await activityService.logActivity(
        userId,
        'COMMENT_EDIT',
        'COMMENT',
        comment._id,
        'Comment',
        {
          postId: comment.targetId,      // this is the original post (claim/report) ID
          postType: capitalize(comment.targetType)  // e.g., 'Claim' or 'Report'
        }
      );
      console.log('📝 [ActivityService] Logged COMMENT_EDIT activity for comment:', commentId);
    } catch (activityError) {
      console.error('❌ [ActivityService] Failed to log COMMENT_EDIT activity:', activityError);
      // Do not throw; editing should not fail just because activity logging failed
    }

    return await updatedComment;
  }

  static async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Get user to check if they are admin
    const { User } = await import('../models/index.js');
    const user = await User.findById(userId);

    // Allow comment author or admin to delete
    const isAuthor = comment.userId.toString() === userId.toString();
    const isAdmin = user && user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      throw new Error("Unauthorized: You can only delete your own comments");
    }

    // Delete all replies to this comment
    await Comment.deleteMany({
      parentCommentId: comment._id
    });

    try {
      await activityService.logActivity(
        userId,
        'COMMENT_DELETE',
        'COMMENT',
        comment._id,
        'Comment');
      console.log('📝 [ActivityService] Logged COMMENT_DELETE activity for comment:', commentId);
    } catch (activityError) {
      console.error('❌ [ActivityService] Failed to log COMMENT_DELETE activity:', activityError);
    }

    return await comment.deleteOne();
  }
}

export default CommentService;
