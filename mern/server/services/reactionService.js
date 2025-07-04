import mongoose from 'mongoose';
import { Reaction, Claim, Report, Comment, User, Notification, Activity } from '../models/index.js';
import { parseVerdict, capitalize } from '../utils/helpers.js';
import activityService from './activityService.js';

class ReactionService {
  static async getReactionsByTarget(targetId, targetType) {
    return Reaction.find({
      targetId,
      targetType
    });
  }

  static async countReactions(targetId, targetType) {
    // Convert string ID to ObjectId if needed
    const targetObjectId = typeof targetId === 'string' ? new mongoose.Types.ObjectId(targetId) : targetId;

    const counts = await Reaction.aggregate([{
            $match: {
              targetId: targetObjectId,
              targetType
            }
          }, {
            $group: {
              _id: '$reactionType',
              count: {
                $sum: 1
              }
            }
          }
        ]);

    const result = {
      like: 0,
      dislike: 0
    };
    counts.forEach(item => {
      result[item._id] = item.count;
    });

    // Also include the reactionCounts key for consistency
    result.reactionCounts = {
      like: result.like,
      dislike: result.dislike
    };

    return result;
  }

  static async getUserReaction(userId, targetId, targetType) {
    return Reaction.findOne({
      userId,
      targetId,
      targetType
    });
  }

  static async toggleReaction(userId, targetId, targetType, reactionType) {
    const existing = await Reaction.findOne({
      userId,
      targetId,
      targetType
    });
    let result;

    if (existing) {
      if (existing.reactionType === reactionType) {
        await Reaction.deleteOne({
          _id: existing._id
        });
        result = {
          message: 'Reaction removed',
          removed: true
        };
      } else {
        existing.reactionType = reactionType;
        await existing.save();
        result = {
          message: 'Reaction updated',
          updated: true
        };
      }
    } else {
      const newReaction = new Reaction({
        userId,
        targetId,
        targetType,
        reactionType
      });
      await newReaction.save();
      result = {
        message: 'Reaction added',
        created: true
      };
    }

    // For any target type, return the updated reaction counts
    if (result.created || result.updated || result.removed) {
      await activityService.logActivity(
        userId,
        reactionType === 'like' ? 'LIKE' : 'DISLIKE',
        targetType.toUpperCase(),
        targetId,
        capitalize(targetType)
      );

      const counts = await this.countReactions(targetId, targetType);
      result.reactionCounts = counts.reactionCounts;
    }

    return result;
  }

  static async setReaction(userId, targetId, targetType, reactionType, io) {
    // Validate before proceeding
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(targetId)) {
      throw new Error('Invalid userId or targetId');
    }

    // Find if there's an existing reaction
    const previous = await Reaction.findOne({
      userId,
      targetId,
      targetType
    });

    // Update or create the reaction
    const updated = await Reaction.findOneAndUpdate({
      userId,
      targetId,
      targetType
    }, {
      reactionType
    }, {
      upsert: true,
      new: true
    });

    let isNew = false;

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

      // Update comment's likes and dislikes counts
      if (targetDoc) {
        // Get all reactions for this comment
        const likesCount = await Reaction.countDocuments({
          targetId,
          targetType: 'comment',
          reactionType: 'like'
        });

        const dislikesCount = await Reaction.countDocuments({
          targetId,
          targetType: 'comment',
          reactionType: 'dislike'
        });

        // Get all users who liked/disliked this comment
        const likedByUsers = await Reaction.find({
          targetId,
          targetType: 'comment',
          reactionType: 'like'
        }).distinct('userId');

        const dislikedByUsers = await Reaction.find({
          targetId,
          targetType: 'comment',
          reactionType: 'dislike'
        }).distinct('userId');

        // Update the comment document
        await Comment.findByIdAndUpdate(targetId, {
          likes: likesCount,
          dislikes: dislikesCount,
          likedBy: likedByUsers,
          dislikedBy: dislikedByUsers
        });
      }
    } else if (targetType === "user") {
      recipientId = targetId;
    }

    if (
      isNew &&
      reactionType === "like" &&
      recipientId &&
      recipientId.toString() !== userId.toString()) {
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

    try {
      const existingActivity = await Activity.exists({
        userId,
        type: reactionType === 'like' ? 'LIKE' : 'DISLIKE',
        targetType: targetType.toUpperCase(),
        targetId,
      });

      if (!existingActivity) {
        await activityService.logActivity(
          userId,
          reactionType === 'like' ? 'LIKE' : 'DISLIKE',
          targetType.toUpperCase(),
          targetId,
          capitalize(targetType)
        )
      }
    } catch (activityError) {
      console.error('Error logging activity:', activityError);
    }

    return updated;
  }

  static async removeReaction(userId, targetId, targetType) {
    const deleted = await Reaction.findOneAndDelete({
      userId,
      targetId,
      targetType
    });
    return deleted ? {
      message: 'Reaction deleted'
    }
     : {
      message: 'No reaction found'
    };
  }

  static async getUserLikes(userId, targetType, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Base aggregation pipeline
    const pipeline = [{
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          reactionType: 'like',
          targetType: targetType
        }
      }, {
        $sort: {
          createdAt: -1
        } // Most recent first
      }, {
        $skip: skip
      }, {
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
          pipeline: [{
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userId'
              }
            }, {
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
            }, {
              $addFields: {
                reactionCounts: {
                  like: {
                    $size: {
                      $filter: {
                        input: '$reactions',
                        cond: {
                          $eq: ['$$this.reactionType', 'like']
                        }
                      }
                    }
                  },
                  dislike: {
                    $size: {
                      $filter: {
                        input: '$reactions',
                        cond: {
                          $eq: ['$$this.reactionType', 'dislike']
                        }
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
            }, {
              $addFields: {
                commentCount: {
                  $size: '$comments'
                }
              }
            }, {
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
          pipeline: [{
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userId'
              }
            }, {
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
            }, {
              $addFields: {
                reactionCounts: {
                  like: {
                    $size: {
                      $filter: {
                        input: '$reactions',
                        cond: {
                          $eq: ['$$this.reactionType', 'like']
                        }
                      }
                    }
                  },
                  dislike: {
                    $size: {
                      $filter: {
                        input: '$reactions',
                        cond: {
                          $eq: ['$$this.reactionType', 'dislike']
                        }
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
            }, {
              $addFields: {
                commentCount: {
                  $size: '$comments'
                }
              }
            }, {
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
          pipeline: [{
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userId'
              }
            }, {
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
            }, {
              $addFields: {
                likes: {
                  $size: {
                    $filter: {
                      input: '$reactions',
                      cond: {
                        $eq: ['$$this.reactionType', 'like']
                      }
                    }
                  }
                },
                dislikes: {
                  $size: {
                    $filter: {
                      input: '$reactions',
                      cond: {
                        $eq: ['$$this.reactionType', 'dislike']
                      }
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
            }, {
              $addFields: {
                replies: '$replyComments'
              }
            }, {
              $lookup: {
                from: 'reports',
                localField: 'targetId',
                foreignField: '_id',
                as: 'reportTarget'
              }
            }, {
              $lookup: {
                from: 'claims',
                localField: 'targetId',
                foreignField: '_id',
                as: 'claimTarget'
              }
            }, {
              $addFields: {
                targetId: {
                  $cond: {
                    if : {
                      $eq: ['$targetType', 'report']
                    },
                  then: {
                    $arrayElemAt: ['$reportTarget', 0]
                  },
                  else : {
                      $arrayElemAt: ['$claimTarget', 0]
                    }
                }
              }
            }
          }, {
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

  if (targetType === 'report') {
    reactions.forEach((reaction) => {
      if (reaction.targetId?.truthVerdict) {
        reaction.targetId.truthVerdictParsed = parseVerdict(reaction.targetId.truthVerdict);
      }
    });
  }

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
