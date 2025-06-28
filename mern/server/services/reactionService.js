import mongoose from 'mongoose';
import { Reaction, Claim, Report, Comment, User, Notification } from '../models/index.js';

class ReactionService {
  static async getReactionsByTarget(targetId, targetType) {
    return Reaction.find({ targetId, targetType });
  }

  static async countReactions(targetId, targetType) {
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
  }

  static async getUserReaction(userId, targetId, targetType) {
    return Reaction.findOne({ userId, targetId, targetType });
  }

  static async toggleReaction(userId, targetId, targetType, reactionType) {
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
  }

  static async setReaction(userId, targetId, targetType, reactionType, io = null) {
    // Find existing reaction
    const previous = await Reaction.findOne({ userId, targetId, targetType });

    let isNew = false;

    // If no previous or changing the reactionType, apply new reaction
    const updated = await Reaction.findOneAndUpdate(
      { userId, targetId, targetType },
      { reactionType },
      { new: true, upsert: true }
    );

    // If it was new or changing from null, mark as new
    if (!previous || !previous.reactionType || previous.reactionType !== reactionType) {
      isNew = true;
    }

    // Determine the target's owner
    let targetDoc = null;
    let recipientId = null;

    if (targetType === "claim") {
      targetDoc = await Claim.findById(targetId).populate("userId");
      recipientId = targetDoc?.userId?._id;
    } else if (targetType === "report") {
      targetDoc = await Report.findById(targetId).populate("userId");
      recipientId = targetDoc?.userId?._id;
    } else if (targetType === "comment") {
      targetDoc = await Comment.findById(targetId).populate("userId");
      recipientId = targetDoc?.userId?._id;
    } else if (targetType === "user") {
      // For user reactions, the target user is the recipient
      recipientId = targetId;
    }

    // Only notify on new "like" and not if you're liking your own stuff
    if (
      isNew &&
      reactionType === "like" &&
      recipientId &&
      recipientId.toString() !== userId.toString()
    ) {
      // Prevent duplicate notifications
      const alreadyExists = await Notification.exists({
        recipientId,
        senderId: userId,
        type: "like",
        targetType,
        targetId,
      });

      if (!alreadyExists) {
        const newNotif = await Notification.create({
          recipientId,
          senderId: userId,
          type: "like",
          targetType,
          targetId,
        });
      }
    }

    return updated;
  }

  static async removeReaction(userId, targetId, targetType) {
    const deleted = await Reaction.findOneAndDelete({ userId, targetId, targetType });
    return deleted ? { message: 'Reaction deleted' } : { message: 'No reaction found' };
  }
}

export default ReactionService;
