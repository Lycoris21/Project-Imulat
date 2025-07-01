import CommentService from '../services/commentService.js';

class CommentController {
  static async createComment(req, res) {
    try {
      const { userId, targetId, targetType, parentCommentId, commentContent } = req.body;

      
      const comment = await CommentService.createComment({
        userId,
        targetId,
        targetType,
        parentCommentId,
        commentContent
      });
      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ message: err.message || "Failed to create comment" });
    }
  }

  static async getCommentsByTarget(req, res) {
    try {
      const { targetType, targetId, userId } = req.query; // Added userId from query
      
      const comments = await CommentService.getCommentsByTarget(targetType, targetId, userId);
      res.status(200).json(comments);
    } catch (err) {
      res.status(500).json({ message: err.message || "Failed to retrieve comments" });
    }
  }

  static async likeComment(req, res) {
    try {
      const { commentId } = req.params;
      const { userId } = req.body;
      
      const result = await CommentService.toggleLike(commentId, userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message || "Failed to like comment" });
    }
  }

  static async dislikeComment(req, res) {
    try {
      const { commentId } = req.params;
      const { userId } = req.body;
      
      const result = await CommentService.toggleDislike(commentId, userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message || "Failed to dislike comment" });
    }
  }

  static async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { commentContent, userId } = req.body;
      
      const updatedComment = await CommentService.updateComment(commentId, userId, commentContent);
      res.status(200).json(updatedComment);
    } catch (err) {
      res.status(403).json({ message: err.message || "Failed to update comment" });
    }
  }

  static async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user?._id || req.body.userId; // Fallback if not using auth middleware
      await CommentService.deleteComment(commentId, userId);
      res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
      res.status(403).json({ message: err.message || "Failed to delete comment" });
    }
  }
}

export default CommentController;
