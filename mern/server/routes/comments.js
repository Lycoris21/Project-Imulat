import express from "express";
import CommentController from "../controllers/commentController.js";

const router = express.Router();

// Create comment
router.post("/", CommentController.createComment);

// Get comments by target (using query params)
router.get("/", CommentController.getCommentsByTarget);

// Like/dislike comments
router.put("/:commentId/like", CommentController.likeComment);
router.put("/:commentId/dislike", CommentController.dislikeComment);

// Delete comment
router.delete("/:commentId", CommentController.deleteComment);

export default router;
