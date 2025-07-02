import ReactionService from '../services/reactionService.js';

const reactionController = {
  async getReactionCounts(req, res) {
    const { targetId, targetType } = req.params;
    try {
      const counts = await ReactionService.countReactions(targetId, targetType);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reaction counts' });
    }
  },

  async getUserReaction(req, res) {
    const { userId, targetId, targetType } = req.params;
    try {
      const reaction = await ReactionService.getUserReaction(userId, targetId, targetType);
      res.json(reaction || { reactionType: null });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user reaction' });
    }
  },

  async toggleReaction(req, res) {
    const { userId, targetId, targetType, reactionType } = req.body;
    try {
      const result = await ReactionService.toggleReaction(userId, targetId, targetType, reactionType);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle reaction' });
    }
  },

  async setReaction(req, res) {
    const { userId, targetId, targetType, reactionType } = req.body;
    try {
      console.log('setReaction called with:', { userId, targetId, targetType, reactionType });
      const result = await ReactionService.setReaction(userId, targetId, targetType, reactionType);
      res.json(result);
    } catch (error) {
      console.error('setReaction error:', error);
      res.status(500).json({ error: 'Failed to set reaction', details: error.message });
    }
  },

  async removeReaction(req, res) {
    const { userId, targetId, targetType } = req.params;
    try {
      const result = await ReactionService.removeReaction(userId, targetId, targetType);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove reaction' });
    }
  },

  async getUserLikes(req, res) {
    const { userId, targetType } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    try {
      const result = await ReactionService.getUserLikes(userId, targetType, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.json(result);
    } catch (error) {
      console.error('Error getting user likes:', error);
      res.status(500).json({ error: 'Failed to fetch user likes' });
    }
  }
};

export default reactionController;
