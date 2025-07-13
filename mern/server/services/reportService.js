import { Report, User, Claim, Comment, Activity, Notification } from "../models/index.js";
import aiSummaryService from "./aiSummaryService.js";
import ReactionService from "./reactionService.js";
import mongoose from "mongoose";
import activityService from './activityService.js';

class ReportService {
  // Get all reports
  static async getAllReports(page = 1, limit = 24, sort = 'newest') {
    const skip = (page - 1) * limit;

    // Base match criteria
    let matchCriteria = {
      status: "approved",
      deletedAt: null
    };

    // Add date filters for time-based sorts
    if (sort === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchCriteria.createdAt = {
        $gte: today,
        $lt: tomorrow
      };
    } else if (sort === 'thisWeek') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchCriteria.createdAt = {
        $gte: weekAgo
      };
    } else if (sort === 'thisMonth') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchCriteria.createdAt = {
        $gte: monthAgo
      };
    }

    // Build sort criteria
    let sortCriteria = {
      createdAt: -1
    }; // default: newest
    switch (sort) {
    case 'oldest':
      sortCriteria = {
        createdAt: 1
      };
      break;
    case 'mostLiked':
      sortCriteria = {
        likeCount: -1
      };
      break;
    case 'mostCommented':
      sortCriteria = {
        commentCount: -1
      };
      break;
    case 'highestTruth':
      sortCriteria = {
        truthVerdict: -1
      };
      break;
    case 'hottest':
      sortCriteria = {
        hotScore: -1
      };
      break;
    default:
      sortCriteria = {
        createdAt: -1
      };
    }

    // Use aggregation for sorting by reaction counts or comment counts
    if (sort === 'mostLiked' || sort === 'mostCommented' || sort === 'hottest') {
      const pipeline = [{
          $match: matchCriteria
        }, {
          $lookup: {
            from: 'comments',
            let: {
              reportId: '$_id'
            },
            pipeline: [{
                $match: {
                  $expr: {
                    $and: [{
                        $eq: ['$targetType', 'report']
                      }, {
                        $eq: ['$targetId', '$$reportId']
                      }
                    ]
                  }
                }
              }
            ],
            as: 'comments'
          }
        }, {
          $lookup: {
            from: 'reactions',
            let: {
              reportId: '$_id'
            },
            pipeline: [{
                $match: {
                  $expr: {
                    $and: [{
                        $eq: ['$targetType', 'report']
                      }, {
                        $eq: ['$targetId', '$$reportId']
                      }, {
                        $eq: ['$reactionType', 'like']
                      }
                    ]
                  }
                }
              }
            ],
            as: 'likes'
          }
        }, {
          $addFields: {
            commentCount: {
              $size: '$comments'
            },
            likeCount: {
              $size: '$likes'
            },
            hotScore: {
              $add: [{
                  $size: '$comments'
                }, {
                  $multiply: [{
                      $size: '$likes'
                    }, 1.5]
                }
              ]
            }
          }
        }, {
          $sort: sortCriteria
        }, {
          $skip: skip
        }, {
          $limit: limit
        }, {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [{
                $project: {
                  username: 1,
                  email: 1
                }
              }
            ]
          }
        }, {
          $lookup: {
            from: 'claims',
            localField: 'claimIds',
            foreignField: '_id',
            as: 'claimIds',
            pipeline: [{
                $project: {
                  claimTitle: 1,
                  aiTruthIndex: 1
                }
              }
            ]
          }
        }, {
          $addFields: {
            userId: {
              $arrayElemAt: ['$userId', 0]
            }
          }
        }
      ];

      const [reports, totalResult] = await Promise.all([
            Report.aggregate(pipeline),
            Report.aggregate([{
                  $match: matchCriteria
                }, {
                  $count: 'total'
                }
              ])
          ]);

      const total = totalResult[0]?.total || 0;

      // Add reaction counts for each report
      const reportsWithMeta = await Promise.all(
          reports.map(async(report) => {
            const reactionCounts = await ReactionService.countReactions(report._id, 'report');
            return {
              ...report,
              reactionCounts,
            };
          }));

      return {
        reports: reportsWithMeta,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } else {
      // Use regular query for other sorts
      const [reports, total] = await Promise.all([
            Report.find(matchCriteria)
            .populate('userId', 'username email')
            .populate('claimIds', 'claimTitle aiTruthIndex')
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit),
            Report.countDocuments(matchCriteria)
          ]);

      const reportsWithMeta = await Promise.all(
          reports.map(async(report) => {
            const count = await Comment.countDocuments({
              targetType: 'report',
              targetId: report._id,
            });

            const reactionCounts = await ReactionService.countReactions(report._id, 'report');
            const plainReport = report.toObject({
              virtuals: true
            });

            return {
              ...plainReport,
              commentCount: count,
              reactionCounts
            };
          }));

      return {
        reports: reportsWithMeta,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }
  }

  // Get report by ID
  static async getReportById(id) {
    const report = await Report.findOne({
      _id: id,
      deletedAt: null
    })
      .populate('userId', 'username email bio')
      .populate('claimIds');

    if (!report)
      return null;

    const reactionCounts = await ReactionService.countReactions(id, 'report');
    const commentCount = await Comment.countDocuments({
      targetType: 'report',
      targetId: id
    });
    const reportObj = report.toObject({
      virtuals: true
    });
    reportObj.reactionCounts = reactionCounts;
    reportObj.commentCount = commentCount;

    return reportObj;
  }

  // Create new report
  static async createReport(reportData) {
    const { userId, claimIds, reportContent } = reportData;

    try {
      const user = await User.findById(userId);
      if (!user)
        throw new Error("User not found");

      if (claimIds && claimIds.length > 0) {
        const claims = await Claim.find({
          _id: {
            $in: claimIds
          }
        });
        if (claims.length !== claimIds.length) {
          throw new Error("One or more claims not found");
        }
      }

      const aiReportSummary = await aiSummaryService.generateAISummary(reportContent);

      const newReport = new Report({
        ...reportData,
        aiReportSummary,
        status: "pending",
        claimIds: claimIds || []
      });

      const savedReport = await newReport.save();

      // Log the activity
      try {
        await activityService.logActivity(
          userId,
          'REPORT_CREATE',
          'REPORT',
          savedReport._id,
          'Report');
      } catch (activityError) {
        console.error('Error logging report activity:', activityError);
        // Don't fail the report if activity logging fails
      }

      const populated = await Report.findById(savedReport._id)
        .populate('userId', 'username email')
        .populate('claimIds', 'claimTitle aiTruthIndex');

      return populated?.toObject({
        virtuals: true
      }) || null;
    } catch (err) {
      console.error("Error in createReport:", err);
      throw err;
    }
  }

  static async updateReport(id, updateData, userId) {
    const updated = await Report.findByIdAndUpdate(
        id, {
        ...updateData,
        status: 'pending', // reset status
        peerReviews: []// clear all reviews
      }, {
        new: true,
        runValidators: true
      })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex');

    if (!updated)
      return null;

    // Log activity
    try {
      if (userId) {
        await activityService.logActivity(
          userId,
          'REPORT_UPDATE',
          'REPORT',
          updated._id,
          'Report');
      } else {
        console.warn(`[ActivityService] Skipping activity log: userId missing for update`);
      }
    } catch (err) {
      console.error('Error logging REPORT_UPDATE activity:', err);
    }

    return updated.toObject({
      virtuals: true
    });
  }

  static async getReportsByStatus(status) {
    return Report.find({
      status,
      deletedAt: null
    })
    .populate('userId', 'username') // populate user for display
    .sort({
      createdAt: -1
    });
  }

  // Delete report
  static async deleteReport(id, userId) {
    const updatedReport = await Report.findByIdAndUpdate(
        id, {
        deletedAt: new Date()
      }, {
        new: true
      });

    if (updatedReport) {
      if (!userId) {
        console.warn(`[ActivityService] Skipping activity log: userId is missing`);
        return updatedReport;
      }

      await activityService.logActivity(
        userId,
        'REPORT_DELETE',
        'REPORT',
        updatedReport._id,
        'Report');

      console.log(`[ActivityService] Logged report deletion for report ID ${id}`);
    }

    return updatedReport;
  }

  // Get reports by truth verdict
  static async getReportsByVerdict(verdict) {
    const reports = await Report.find({
      truthVerdict: verdict,
      deletedAt: null
    })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({
        createdAt: -1
      });

    const reportsWithMeta = await Promise.all(
        reports.map(async(report) => {
          const count = await Comment.countDocuments({
            targetType: 'report',
            targetId: report._id,
          });

          const reactionCounts = await ReactionService.countReactions(report._id, 'report');

          return {
            ...report.toObject({
              virtuals: true
            }),
            commentCount: count,
            reactionCounts,
          };
        }));

    return reportsWithMeta;
  }

  // Get reports by user
  static async getReportsByUser(userId, viewerId) {
    const filter = {
      userId,
      deletedAt: null,
    };

    // Only show approved reports if the viewer is not the owner
    if (viewerId !== String(userId)) {
      filter.status = 'approved';
    }

    const reports = await Report.find(filter)
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({
        createdAt: -1
      });

    const reportsWithMeta = await Promise.all(
        reports.map(async(report) => {
          const count = await Comment.countDocuments({
            targetType: 'report',
            targetId: report._id,
          });

          const reactionCounts = await ReactionService.countReactions(report._id, 'report');

          return {
            ...report.toObject({
              virtuals: true
            }),
            commentCount: count,
            reactionCounts,
          };
        }));

    return reportsWithMeta;
  }

  // Get latest reports
  static async getLatestReports() {
    const reports = await Report.find({
      status: "approved",
      deletedAt: null
    })
      .populate('userId', 'username email')
      .populate('claimIds', 'claimTitle aiTruthIndex')
      .sort({
        createdAt: -1
      })
      .limit(5);

    const reportsWithMeta = await Promise.all(
        reports.map(async(report) => {
          const count = await Comment.countDocuments({
            targetType: 'report',
            targetId: report._id,
          });

          const reactionCounts = await ReactionService.countReactions(report._id, 'report');

          return {
            ...report.toObject({
              virtuals: true
            }),
            commentCount: count,
            reactionCounts,
          };
        }));

    return reportsWithMeta;
  }

  // Search reports
  static async searchReports(query, page = 1, limit = 24, sort = 'newest', user = null) {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i');

    let userIds = [];

    if (!user) {
      const matchedUsers = await User.find({
        $or: [{
            username: {
              $regex: searchRegex
            }
          }, {
            email: {
              $regex: searchRegex
            }
          }
        ]
      }).select('_id');
      userIds = matchedUsers.map(u => u._id);
    }

    const searchQuery = {
      $and: [
        user
         ? {
          $and: [{
              userId: new mongoose.Types.ObjectId(user)
            }, {
              $or: [{
                  reportTitle: {
                    $regex: searchRegex
                  }
                }, {
                  reportContent: {
                    $regex: searchRegex
                  }
                }, {
                  reportDescription: {
                    $regex: searchRegex
                  }
                }, {
                  aiReportSummary: {
                    $regex: searchRegex
                  }
                },
              ],
            },
          ],
        }
         : {
          $or: [{
              reportTitle: {
                $regex: searchRegex
              }
            }, {
              reportContent: {
                $regex: searchRegex
              }
            }, {
              reportDescription: {
                $regex: searchRegex
              }
            }, {
              aiReportSummary: {
                $regex: searchRegex
              }
            },
            ...(userIds.length > 0 ? [{
                  userId: {
                    $in: userIds
                  }
                }
              ] : []),
          ],
        }, {
          deletedAt: null
        },
      ],
    };

    // Build sort criteria
    let sortCriteria = {
      createdAt: -1
    }; // default: newest
    switch (sort) {
    case 'oldest':
      sortCriteria = {
        createdAt: 1
      };
      break;
    case 'mostLiked':
      sortCriteria = {
        likeCount: -1
      };
      break;
    case 'mostCommented':
      sortCriteria = {
        commentCount: -1
      };
      break;
    case 'highestTruth':
      sortCriteria = {
        truthVerdict: -1
      };
      break;
    case 'hottest':
      sortCriteria = {
        hotScore: -1
      };
      break;
    default:
      sortCriteria = {
        createdAt: -1
      };
    }

    // Use aggregation for sorting by reaction counts or comment counts
    if (sort === 'mostLiked' || sort === 'mostCommented' || sort === 'hottest') {
      const pipeline = [{
          $match: searchQuery
        }, {
          $lookup: {
            from: 'comments',
            let: {
              reportId: '$_id'
            },
            pipeline: [{
                $match: {
                  $expr: {
                    $and: [{
                        $eq: ['$targetType', 'report']
                      }, {
                        $eq: ['$targetId', '$$reportId']
                      }
                    ]
                  }
                }
              }
            ],
            as: 'comments'
          }
        }, {
          $lookup: {
            from: 'reactions',
            let: {
              reportId: '$_id'
            },
            pipeline: [{
                $match: {
                  $expr: {
                    $and: [{
                        $eq: ['$targetType', 'report']
                      }, {
                        $eq: ['$targetId', '$$reportId']
                      }, {
                        $eq: ['$reactionType', 'like']
                      }
                    ]
                  }
                }
              }
            ],
            as: 'likes'
          }
        }, {
          $addFields: {
            commentCount: {
              $size: '$comments'
            },
            likeCount: {
              $size: '$likes'
            },
            hotScore: {
              $add: [{
                  $size: '$comments'
                }, {
                  $multiply: [{
                      $size: '$likes'
                    }, 2]
                }
              ]
            }
          }
        }, {
          $sort: sortCriteria
        }, {
          $skip: skip
        }, {
          $limit: limit
        }, {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [{
                $project: {
                  username: 1,
                  email: 1
                }
              }
            ]
          }
        }, {
          $lookup: {
            from: 'claims',
            localField: 'claimIds',
            foreignField: '_id',
            as: 'claimIds',
            pipeline: [{
                $project: {
                  claimTitle: 1,
                  aiTruthIndex: 1
                }
              }
            ]
          }
        }, {
          $addFields: {
            userId: {
              $arrayElemAt: ['$userId', 0]
            }
          }
        }
      ];

      const [reports, totalResult] = await Promise.all([
            Report.aggregate(pipeline),
            Report.aggregate([{
                  $match: searchQuery
                }, {
                  $count: 'total'
                }
              ])
          ]);

      const total = totalResult[0]?.total || 0;

      // Add reaction counts for each report
      const reportsWithMeta = await Promise.all(
          reports.map(async(report) => {
            const reactionCounts = await ReactionService.countReactions(report._id, 'report');
            return {
              ...report,
              reactionCounts,
            };
          }));

      return {
        reports: reportsWithMeta,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } else {
      // Use regular query for other sorts
      const [reports, total] = await Promise.all([
            Report.find(searchQuery)
            .populate('userId', 'username email')
            .populate('claimIds', 'claimTitle aiTruthIndex')
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit),
            Report.countDocuments(searchQuery)
          ]);

      const reportsWithMeta = await Promise.all(
          reports.map(async(report) => {
            const count = await Comment.countDocuments({
              targetType: 'report',
              targetId: report._id,
            });

            const reactionCounts = await ReactionService.countReactions(report._id, 'report');
            const plainReport = report.toObject({
              virtuals: true
            });

            return {
              ...plainReport,
              commentCount: count,
              reactionCounts
            };
          }));

      return {
        reports: reportsWithMeta,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }
  }

  static async getPeerReviews(reportId) {
    const report = await Report.findById(reportId).populate({
      path: 'peerReviews.userId',
      select: 'username role' // Assuming User model has fullName and role
    });

    if (!report)
      throw new Error('Report not found');

    return report.peerReviews;
  }

  static async submitPeerReview(reportId, userId, reviewText, decision, io = null) {
    if (!userId) {
      throw new Error("Missing user ID.");
    }
    if (decision === 'disapprove' && !reviewText?.trim()) {
      throw new Error("Review text is required when disapproving.");
    }
    if (!['approve', 'disapprove'].includes(decision)) {
      throw new Error("Decision must be either 'approve' or 'disapprove'.");
    }

    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error("Report not found.");
    }

    const alreadyReviewed = report.peerReviews.some(
        (review) => review.userId.toString() === userId);
    if (alreadyReviewed) {
      throw new Error("User has already submitted a review.");
    }

    // Add the peer review
    report.peerReviews.push({
      userId,
      reviewText: reviewText.trim(),
      decision,
    });

    // Update status
    let previousStatus = report.status;
    if (['pending', ''].includes(report.status)) {
      report.status = 'under_review';
    }

    const approvals = report.peerReviews.filter(r => r.decision === 'approve').length;
    const rejections = report.peerReviews.filter(r => r.decision === 'disapprove').length;

    if (approvals >= 2) {
      report.status = 'approved';
    } else if (rejections >= 5) {
      report.status = 'rejected';
    }

    await report.save();

    // LOG THE ACTIVITY
    const actionType = decision === 'approve' ? 'PEER_REVIEW_APPROVE' : 'PEER_REVIEW_DISAPPROVE';

    try {
      await activityService.logActivity(
        userId,
        actionType,
        'REPORT',
        reportId,
        'Report');
    } catch (err) {
      console.error('Error logging ' + actionType + ' activity:', err);
    }

    const recipientId = report.userId?.toString();

    // Notify the owner about the review (only if not reviewing their own report)
    if (recipientId && recipientId !== userId) {
      const alreadyExists = await Notification.exists({
        recipientId,
        senderId: userId,
        type: "peer_review",
        targetType: "report",
        targetId: reportId,
      });

      if (!alreadyExists) {
        const newNotif = await Notification.create({
          recipientId,
          senderId: userId,
          type: "peer_review",
          targetType: "report",
          targetId: reportId,
        });

        if (io) {
          io.to(recipientId).emit("new-notification", newNotif);
        }
      }
    }

    // Notify the owner when report status is finalized (approved or rejected)
    if (
      report.status !== previousStatus &&
      ['approved', 'rejected'].includes(report.status) &&
      recipientId) {
      const finalStatusNotif = await Notification.create({
        recipientId,
        senderId: null,
        type: report.status === 'approved' ? 'report_approved' : 'report_rejected',
        targetType: 'report',
        targetId: reportId,
      });

      if (io) {
        io.to(recipientId).emit("new-notification", finalStatusNotif);
      }
    }

    return report.peerReviews;
  }

  static async getReportsByStatuses(statuses) {
    return await Report.find({
      status: {
        $in: statuses
      },
      deletedAt: null // Exclude soft-deleted reports
    })
    .populate('userId', 'username role') // optional: populate creator info
    .sort({
      createdAt: -1
    });
  }
}

export default ReportService;
