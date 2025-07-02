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

  static async getUserLikes(userId, targetType, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Base aggregation pipeline
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          reactionType: 'like',
          targetType: targetType
        }
      },
      {
        $sort: { createdAt: -1 } // Most recent first
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];

    // Add lookup stage based on target type
    let lookupStage;
    switch (targetType) {
      case 'report':
        lookupStage = {
          $lookup: {
            from: 'reports',
            localField: 'targetId',
            foreignField: '_id',
            as: 'targetId',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'userId'
                }
              },
              {
                $unwind: '$userId'
              },
              // Add reaction counts
              {
                $lookup: {
                  from: 'reactions',
                  localField: '_id',
                  foreignField: 'targetId',
                  as: 'reactions'
                }
              },
              {
                $addFields: {
                  reactionCounts: {
                    like: {
                      $size: {
                        $filter: {
                          input: '$reactions',
                          cond: { $eq: ['$$this.reactionType', 'like'] }
                        }
                      }
                    },
                    dislike: {
                      $size: {
                        $filter: {
                          input: '$reactions',
                          cond: { $eq: ['$$this.reactionType', 'dislike'] }
                        }
                      }
                    }
                  }
                }
              },
              // Add comment count
              {
                $lookup: {
                  from: 'comments',
                  localField: '_id',
                  foreignField: 'targetId',
                  as: 'comments'
                }
              },
              {
                $addFields: {
                  commentCount: { $size: '$comments' }
                }
              },
              {
                $project: {
                  reactions: 0,
                  comments: 0
                }
              }
            ]
          }
        };
        break;
      case 'claim':
        lookupStage = {
          $lookup: {
            from: 'claims',
            localField: 'targetId',
            foreignField: '_id',
            as: 'targetId',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'userId'
                }
              },
              {
                $unwind: '$userId'
              },
              // Add reaction counts
              {
                $lookup: {
                  from: 'reactions',
                  localField: '_id',
                  foreignField: 'targetId',
                  as: 'reactions'
                }
              },
              {
                $addFields: {
                  reactionCounts: {
                    like: {
                      $size: {
                        $filter: {
                          input: '$reactions',
                          cond: { $eq: ['$$this.reactionType', 'like'] }
                        }
                      }
                    },
                    dislike: {
                      $size: {
                        $filter: {
                          input: '$reactions',
                          cond: { $eq: ['$$this.reactionType', 'dislike'] }
                        }
                      }
                    }
                  }
                }
              },
              // Add comment count
              {
                $lookup: {
                  from: 'comments',
                  localField: '_id',
                  foreignField: 'targetId',
                  as: 'comments'
                }
              },
              {
                $addFields: {
                  commentCount: { $size: '$comments' }
                }
              },
              {
                $project: {
                  reactions: 0,
                  comments: 0
                }
              }
            ]
          }
        };
        break;
      case 'comment':
        lookupStage = {
          $lookup: {
            from: 'comments',
            localField: 'targetId',
            foreignField: '_id',
            as: 'targetId',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'userId'
                }
              },
              {
                $unwind: '$userId'
              },
              // Add reaction counts for the comment
              {
                $lookup: {
                  from: 'reactions',
                  localField: '_id',
                  foreignField: 'targetId',
                  as: 'reactions'
                }
              },
              {
                $addFields: {
                  likes: {
                    $size: {
                      $filter: {
                        input: '$reactions',
                        cond: { $eq: ['$$this.reactionType', 'like'] }
                      }
                    }
                  },
                  dislikes: {
                    $size: {
                      $filter: {
                        input: '$reactions',
                        cond: { $eq: ['$$this.reactionType', 'dislike'] }
                      }
                    }
                  }
                }
              },
              // Add replies count (comments that reply to this comment)
              {
                $lookup: {
                  from: 'comments',
                  localField: '_id',
                  foreignField: 'parentId',
                  as: 'replyComments'
                }
              },
              {
                $addFields: {
                  replies: '$replyComments'
                }
              },
              {
                $lookup: {
                  from: 'reports',
                  localField: 'targetId',
                  foreignField: '_id',
                  as: 'reportTarget'
                }
              },
              {
                $lookup: {
                  from: 'claims',
                  localField: 'targetId',
                  foreignField: '_id',
                  as: 'claimTarget'
                }
              },
              {
                $addFields: {
                  targetId: {
                    $cond: {
                      if: { $eq: ['$targetType', 'report'] },
                      then: { $arrayElemAt: ['$reportTarget', 0] },
                      else: { $arrayElemAt: ['$claimTarget', 0] }
                    }
                  }
                }
              },
              {
                $project: {
                  reportTarget: 0,
                  claimTarget: 0,
                  reactions: 0,
                  replyComments: 0
                }
              }
            ]
          }
        };
        break;
      case 'user':
        lookupStage = {
          $lookup: {
            from: 'users',
            localField: 'targetId',
            foreignField: '_id',
            as: 'targetId'
          }
        };
        break;
      default:
        throw new Error('Invalid target type');
    }

    pipeline.splice(3, 0, lookupStage);
    pipeline.push({
      $unwind: '$targetId'
    });

    // Get the reactions with populated target data
    const reactions = await Reaction.aggregate(pipeline);

    // Get total count for pagination
    const totalCount = await Reaction.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      reactionType: 'like',
      targetType: targetType
    });

    return {
      items: reactions,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    };
  }
}

export default ReactionService;
