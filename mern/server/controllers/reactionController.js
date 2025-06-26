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
      res.json(reaction);
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
      const result = await ReactionService.setReaction(userId, targetId, targetType, reactionType);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to set reaction' });
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
  }
};

export default reactionController;
