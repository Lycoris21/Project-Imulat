import mongoose from 'mongoose';
import Reaction from '../models/Reaction.js';

const ReactionService = {
  async getReactionsByTarget(targetId, targetType) {
    return Reaction.find({ targetId, targetType });
  },

  async countReactions(targetId, targetType) {
    const counts = await Reaction.aggregate([
      { $match: { targetId: new mongoose.Types.ObjectId(targetId), targetType } },
      {
        $group: {
          _id: '$reactionType',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = { like: 0, dislike: 0 };
    counts.forEach(item => {
      result[item._id] = item.count;
    });
    return result;
  },

  async getUserReaction(userId, targetId, targetType) {
    return Reaction.findOne({ userId, targetId, targetType });
  },

  async toggleReaction(userId, targetId, targetType, reactionType) {
    const existing = await Reaction.findOne({ userId, targetId, targetType });

    if (existing) {
      if (existing.reactionType === reactionType) {
        await Reaction.deleteOne({ _id: existing._id });
        return { message: 'Reaction removed', removed: true };
      } else {
        existing.reactionType = reactionType;
        await existing.save();
        return { message: 'Reaction updated', updated: true };
      }
    } else {
      const newReaction = new Reaction({ userId, targetId, targetType, reactionType });
      await newReaction.save();
      return { message: 'Reaction added', created: true };
    }
  },

  async setReaction(userId, targetId, targetType, reactionType) {
    const existing = await Reaction.findOneAndUpdate(
      { userId, targetId, targetType },
      { reactionType },
      { new: true, upsert: true }
    );
    return existing;
  },

  async removeReaction(userId, targetId, targetType) {
    const deleted = await Reaction.findOneAndDelete({ userId, targetId, targetType });
    return deleted ? { message: 'Reaction deleted' } : { message: 'No reaction found' };
  }
};

export default ReactionService;
