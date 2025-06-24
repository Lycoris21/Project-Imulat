import Comment from '../models/Comment.js';

class CommentService {
  static async createComment({ userId, targetId, targetType, parentCommentId = null, commentContent }) {
    const newComment = new Comment({
      userId,
      targetId,
      targetType,
      parentCommentId,
      commentContent
    });

    return await newComment.save();
  }

  static async getCommentsByTarget(targetType, targetId) {
    console.log("Querying comments with:", { targetType, targetId });
    
    return await Comment.find({
      targetType,
      targetId,
      parentCommentId: null
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .populate({
        path: 'replies',
        populate: { path: 'userId', select: 'username' },
        options: { sort: { createdAt: 1 } }
      });
  }

  static async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== userId.toString()) throw new Error("Unauthorized");

    await Comment.deleteMany({ parentCommentId: comment._id }); // Delete replies
    return await comment.deleteOne();
  }
}

export default CommentService;
