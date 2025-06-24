import express from "express";
import CommentController from "../controllers/commentController.js";

const router = express.Router();

// Nested under /api/reports/:reportId/comments
router.post("/", CommentController.createComment);
router.get("/:targetType/:targetId", CommentController.getCommentsByTarget);
router.delete("/:commentId", CommentController.deleteComment);


export default router;
