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
    const previous = await Reaction.findOne({ userId, targetId, targetType });

    let isNew = false;

    const updated = await Reaction.findOneAndUpdate(
      { userId, targetId, targetType },
      { reactionType },
      { new: true, upsert: true }
    );

    if (!previous || !previous.reactionType || previous.reactionType !== reactionType) {
      isNew = true;
    }

    let targetDoc = null;
    let recipientId = null;
    let postType = null;
    let postId = null;

    if (targetType === "claim") {
      targetDoc = await Claim.findById(targetId).populate("userId");
      recipientId = targetDoc?.userId?._id;
      postType = "claim";
      postId = targetId;
    } else if (targetType === "report") {
      targetDoc = await Report.findById(targetId).populate("userId");
      recipientId = targetDoc?.userId?._id;
      postType = "report";
      postId = targetId;
    } else if (targetType === "comment") {
      targetDoc = await Comment.findById(targetId).populate("userId");
      recipientId = targetDoc?.userId?._id;
      postType = targetDoc?.targetType;
      postId = targetDoc?.targetId;
    } else if (targetType === "user") {
      recipientId = targetId;
    }

    if (
      isNew &&
      reactionType === "like" &&
      recipientId &&
      recipientId.toString() !== userId.toString()
    ) {
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
          postType,
          postId,
        });

        if (io) {
          io.to(recipientId.toString()).emit("new-notification", newNotif);
        }
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
