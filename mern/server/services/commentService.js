import { Comment, Notification, Report, Claim } from '../models/index.js';
import NotificationService from './notificationService.js';

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

    try {
      let recipientId = null;
      let postType = targetType;
      let postId = targetId;

      // If replying to a comment
      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId).populate("userId");
        if (parentComment) {
          // Override postType/postId with root comment's context
          postType = parentComment.targetType;
          postId = parentComment.targetId;

          // Notify parent comment's author (if not self)
          if (String(parentComment.userId._id) !== String(userId)) {
            recipientId = parentComment.userId._id;
          }
        }
      } else {
        // Not a reply, notify post owner (report/claim author)
        const Model = targetType === "claim" ? Claim : Report;
        const parent = await Model.findById(targetId).populate("userId");
        if (parent && String(parent.userId._id) !== String(userId)) {
          recipientId = parent.userId._id;
        }
      }

      // Create notification
      if (recipientId) {
        const notif = await Notification.create({
          recipientId,
          senderId: userId,
          type: "comment",
          targetType: "comment", // still pointing to the comment created
          targetId: savedComment._id,
          postType,
          postId,
          read: false,
        });

        // Emit via socket
        const { io } = await import("../server.js");
        io.to(recipientId.toString()).emit("new-notification", notif);
      }
    } catch (err) {
      console.error("⚠️ Failed to create or emit notification:", err.message);
    }

    return savedComment;
  }

  static async getCommentsByTarget(targetType, targetId, userId = null) {
    // Get all comments for the target
    const allComments = await Comment.find({
      targetType,
      targetId
    })
      .sort({
        createdAt: -1
      })
      .populate('userId', 'username profilePictureUrl')
      .lean();

    // Add user reaction status to each comment if userId is provided
    if (userId) {
      allComments.forEach(comment => {
        // Convert ObjectIds to strings for comparison
        const likedByStrings = (comment.likedBy || []).map(id => id.toString());
        const dislikedByStrings = (comment.dislikedBy || []).map(id => id.toString());

        if (likedByStrings.includes(userId.toString())) {
          comment.userReaction = 'like';
        } else if (dislikedByStrings.includes(userId.toString())) {
          comment.userReaction = 'dislike';
        } else {
          comment.userReaction = null;
        }
      });
    }

    // Build nested structure
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create a map of all comments
    allComments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment._id.toString(), comment);
    });

    // Second pass: build the tree structure
    allComments.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId.toString());
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    // Sort replies by creation date (oldest first for readability)
    const sortReplies = (comments) => {
      comments.forEach(comment => {
        if (comment.replies.length > 0) {
          comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          sortReplies(comment.replies);
        }
      });
    };

    sortReplies(rootComments);
    return rootComments;
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
    
    return await comment.save();
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
    
    return await comment.deleteOne();
  }
}

export default CommentService;
