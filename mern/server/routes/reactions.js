import express from 'express';
import reactionController from '../controllers/reactionController.js';

const router = express.Router();

// Set or update a reaction (like/dislike)
router.put('/', reactionController.setReaction);

// Remove a user's reaction
router.delete('/:targetType/:targetId/:userId', reactionController.removeReaction);

// Get total like/dislike counts for a target
router.get('/counts/:targetType/:targetId', reactionController.getReactionCounts);

// Get current user’s reaction for a target
router.get('/user/:targetType/:targetId/:userId', reactionController.getUserReaction);

export default router;
