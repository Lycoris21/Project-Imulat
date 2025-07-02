import { Bookmark, Collection, Claim, Report, Comment } from '../models/index.js';
import ReactionService from './reactionService.js';
import mongoose from 'mongoose';
import { parseVerdict } from '../utils/helpers.js'

class BookmarkService {
  // Get all bookmarks for a user
  static async getUserBookmarks(userId, collectionId = undefined) {
    try {
      const query = {
        userId
      };

      // Only filter by collection if collectionId is explicitly provided
      if (collectionId !== undefined) {
        query.collectionId = collectionId;
      }
      // If collectionId is undefined, show ALL bookmarks (both with and without collections)

      console.log('BookmarkService.getUserBookmarks query:', query);

      const bookmarks = await Bookmark.find(query).sort({
        createdAt: -1
      });

      console.log('BookmarkService.getUserBookmarks found bookmarks:', bookmarks.length);

      // Manually populate targetId based on targetType
      const populatedBookmarks = await Promise.all(
          bookmarks.map(async(bookmark) => {
            let populatedTarget = null;

            if (bookmark.targetType === 'report') {
              const report = await Report.findById(bookmark.targetId).populate('userId', 'username profilePictureUrl');
              if (report) {
                // Add reaction counts and comment count like in reportService
                const commentCount = await Comment.countDocuments({
                  targetType: 'report',
                  targetId: report._id,
                });
                const reactionCounts = await ReactionService.countReactions(report._id, 'report');

                populatedTarget = {
                  ...report.toObject({
                    virtuals: true
                  }),
                  commentCount,
                  reactionCounts
                };
              }
            } else if (bookmark.targetType === 'claim') {
              const claim = await Claim.findById(bookmark.targetId).populate('userId', 'username profilePictureUrl');
              if (claim) {
                // Add reaction counts and comment count like in claimService
                const commentCount = await Comment.countDocuments({
                  targetType: 'claim',
                  targetId: claim._id,
                });
                const reactionCounts = await ReactionService.countReactions(claim._id, 'claim');

                populatedTarget = {
                  ...claim.toObject({
                    virtuals: true
                  }),
                  commentCount,
                  reactionCounts
                };
              }
            }

            if (populatedTarget) {
              return {
                ...bookmark.toObject(),
                targetId: populatedTarget
              };
            }
            return null; // Will be filtered out
          }));

      // Filter out bookmarks where target was not found (deleted reports/claims)
      const filteredBookmarks = populatedBookmarks.filter(bookmark => bookmark !== null);
      console.log('BookmarkService.getUserBookmarks after filtering:', filteredBookmarks.length);

      return filteredBookmarks;
    } catch (error) {
      console.error('Error in BookmarkService.getUserBookmarks:', error);
      throw error;
    }
  }

  // Get all collections for a user
  static async getUserCollections(userId) {
    const collections = await Collection.find({
      userId
    }).sort({
      collectionName: 1
    });

    // Get bookmark count for each collection
    const collectionsWithCounts = await Promise.all(
        collections.map(async(collection) => {
          const bookmarkCount = await Bookmark.countDocuments({
            userId,
            collectionId: collection._id
          });
          return {
            ...collection.toObject(),
            bookmarkCount
          };
        }));

    return collectionsWithCounts;
  }

  // Create a new collection
  static async createCollection(userId, collectionName, collectionBanner = null) {
    const collection = new Collection({
      userId,
      collectionName,
      collectionBanner
    });
    return await collection.save();
  }

  // Add bookmark
  static async addBookmark(userId, targetId, targetType, collectionId = null) {
    const bookmark = new Bookmark({
      userId,
      targetId,
      targetType,
      collectionId
    });
    return await bookmark.save();
  }

  // Remove bookmark
  static async removeBookmark(userId, targetId, targetType) {
    return await Bookmark.findOneAndDelete({
      userId,
      targetId,
      targetType
    });
  }

  // Check if item is bookmarked
  static async isBookmarked(userId, targetId, targetType) {
    const bookmark = await Bookmark.findOne({
      userId,
      targetId,
      targetType
    });
    return !!bookmark;
  }

  // Search bookmarks
  static async searchBookmarks(userId, searchQuery, collectionId = undefined, limit = null) {
    try {
      const query = {
        userId
      };

      // Only filter by collection if collectionId is explicitly provided
      if (collectionId !== undefined) {
        query.collectionId = collectionId;
      }
      // If collectionId is undefined, search ALL bookmarks (both with and without collections)

      const bookmarks = await Bookmark.find(query).sort({
        createdAt: -1
      });

      // Manually populate and filter based on search query
      const searchResults = await Promise.all(
          bookmarks.map(async(bookmark) => {
            let populatedTarget = null;

            if (bookmark.targetType === 'report') {
              const report = await Report.findById(bookmark.targetId).populate('userId', 'username profilePictureUrl');
              if (report) {
                // Add reaction counts and comment count like in reportService
                const commentCount = await Comment.countDocuments({
                  targetType: 'report',
                  targetId: report._id,
                });
                const reactionCounts = await ReactionService.countReactions(report._id, 'report');

                populatedTarget = {
                  ...report.toObject({
                    virtuals: true
                  }),
                  commentCount,
                  reactionCounts
                };
              }
            } else if (bookmark.targetType === 'claim') {
              const claim = await Claim.findById(bookmark.targetId).populate('userId', 'username profilePictureUrl');
              if (claim) {
                // Add reaction counts and comment count like in claimService
                const commentCount = await Comment.countDocuments({
                  targetType: 'claim',
                  targetId: claim._id,
                });
                const reactionCounts = await ReactionService.countReactions(claim._id, 'claim');

                populatedTarget = {
                  ...claim.toObject({
                    virtuals: true
                  }),
                  commentCount,
                  reactionCounts
                };
              }
            }

            if (populatedTarget) {
              // Check if the populated target matches the search query
              const searchLower = searchQuery.toLowerCase();
              const matchesSearch =
                (populatedTarget.reportTitle && populatedTarget.reportTitle.toLowerCase().includes(searchLower)) ||
              (populatedTarget.claimTitle && populatedTarget.claimTitle.toLowerCase().includes(searchLower)) ||
              (populatedTarget.reportContent && populatedTarget.reportContent.toLowerCase().includes(searchLower)) ||
              (populatedTarget.claimContent && populatedTarget.claimContent.toLowerCase().includes(searchLower)) ||
              (populatedTarget.reportDescription && populatedTarget.reportDescription.toLowerCase().includes(searchLower));

              if (matchesSearch) {
                return {
                  ...bookmark.toObject(),
                  targetId: populatedTarget,
                  target: populatedTarget // For suggestions compatibility
                };
              }
            }
            return null;
          }));

      // Filter out non-matching bookmarks and apply limit if specified
      const filteredResults = searchResults.filter(bookmark => bookmark !== null);

      if (limit && typeof limit === 'number' && limit > 0) {
        return filteredResults.slice(0, limit);
      }

      return filteredResults;
    } catch (error) {
      console.error('Error in BookmarkService.searchBookmarks:', error);
      throw error;
    }
  }

  static async getUserBookmarksPaginated(userId, options = {}) {
    try {
      const { page = 1,
      limit = 10,
      targetType = null,
      collectionId = undefined,
      search = null
       } = options;

      const matchStage = {
        userId: new mongoose.Types.ObjectId(userId)
      };
      if (targetType)
        matchStage.targetType = targetType;
      if (collectionId)
        matchStage.collectionId = new mongoose.Types.ObjectId(collectionId);

      const lookupStage = {
        $lookup: {
          from: '', // Will be set dynamically based on targetType
          localField: 'targetId',
          foreignField: '_id',
          as: 'targetData'
        }
      };

      const addFieldsStage = {
        $addFields: {
          targetData: {
            $arrayElemAt: ['$targetData', 0]
          }
        }
      };

      const pipeline = [{
          $match: matchStage
        }
      ];

      if (targetType === 'report') {
        lookupStage.$lookup.from = 'reports';
      } else if (targetType === 'claim') {
        lookupStage.$lookup.from = 'claims';
      } else {
        // Allow both types
        const reportLookup = {
          $lookup: {
            from: 'reports',
            localField: 'targetId',
            foreignField: '_id',
            as: 'reportData'
          }
        };
        const claimLookup = {
          $lookup: {
            from: 'claims',
            localField: 'targetId',
            foreignField: '_id',
            as: 'claimData'
          }
        };
        pipeline.push(reportLookup, claimLookup, {
          $addFields: {
            targetData: {
              $cond: {
                if : {
                  $eq: ['$targetType', 'report']
                },
              then: {
                $arrayElemAt: ['$reportData', 0]
              },
              else : {
                  $arrayElemAt: ['$claimData', 0]
                }
            }
          }
        }
      });
    }

    if (targetType) {
      pipeline.push(lookupStage, addFieldsStage);
    }

    // 👇 Lookup user info from `users` based on targetData.userId
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'targetData.userId',
        foreignField: '_id',
        as: 'author'
      }
    }, {
      $addFields: {
        'targetData.user': {
          $arrayElemAt: ['$author', 0]
        }
      }
    }, {
      $project: {
        author: 0 // clean up intermediate join
      }
    });

    // Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [{
              'targetData.reportTitle': searchRegex
            }, {
              'targetData.claimTitle': searchRegex
            }, {
              'targetData.reportContent': searchRegex
            }, {
              'targetData.claimContent': searchRegex
            }, {
              'targetData.reportDescription': searchRegex
            }, {
              'targetData.aiReportSummary': searchRegex
            }, {
              'targetData.aiClaimSummary': searchRegex
            }
          ]
        }
      });
    }

    pipeline.push({
      $sort: {
        createdAt: -1
      }
    }, {
      $facet: {
        bookmarks: [{
            $skip: (page - 1) * limit
          }, {
            $limit: limit
          }
        ],
        totalCount: [{
            $count: 'count'
          }
        ]
      }
    });

    const [result] = await Bookmark.aggregate(pipeline);

    const bookmarks = result.bookmarks || [];
    const totalItems = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Enrich with comment and reaction counts
    const enriched = await Promise.all(bookmarks.map(async(b) => {
          const target = b.targetData;
          if (!target)
            return null;

          const commentCount = await Comment.countDocuments({
            targetType: b.targetType,
            targetId: target._id
          });

          const reactionCounts = await ReactionService.countReactions(target._id, b.targetType);

          const enrichedTarget = {
            ...target,
            commentCount,
            reactionCounts,
            userId: target.user
             ? {
              _id: target.user._id,
              username: target.user.username,
              profilePictureUrl: target.user.profilePictureUrl
            }
             : null
          };

          if (target.truthVerdict) {
            enrichedTarget.truthVerdictParsed = parseVerdict(target.truthVerdict);
          }

          return {
            ...b,
            targetId: enrichedTarget
          };
        }));

    return {
      bookmarks: enriched.filter(Boolean),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (err) {
    console.error('Aggregation error:', err);
    throw err;
  }
}

// Get all collections for a user
static async getUserCollections(userId) {
  const collections = await Collection.find({
    userId
  }).sort({
    collectionName: 1
  });

  // Get bookmark count for each collection
  const collectionsWithCounts = await Promise.all(
      collections.map(async(collection) => {
        const bookmarkCount = await Bookmark.countDocuments({
          userId,
          collectionId: collection._id
        });
        return {
          ...collection.toObject(),
          bookmarkCount
        };
      }));

  return collectionsWithCounts;
}

// Create a new collection
static async createCollection(userId, collectionName, collectionBanner = null) {
  const collection = new Collection({
    userId,
    collectionName,
    collectionBanner
  });
  return await collection.save();
}

// Add bookmark
static async addBookmark(userId, targetId, targetType, collectionId = null) {
  const bookmark = new Bookmark({
    userId,
    targetId,
    targetType,
    collectionId
  });
  return await bookmark.save();
}

// Remove bookmark
static async removeBookmark(userId, targetId, targetType) {
  return await Bookmark.findOneAndDelete({
    userId,
    targetId,
    targetType
  });
}

// Check if item is bookmarked
static async isBookmarked(userId, targetId, targetType) {
  const bookmark = await Bookmark.findOne({
    userId,
    targetId,
    targetType
  });
  return !!bookmark;
}

// Search bookmarks
static async searchBookmarks(userId, searchQuery, collectionId = undefined, limit = null) {
  try {
    const query = {
      userId
    };

    // Only filter by collection if collectionId is explicitly provided
    if (collectionId !== undefined) {
      query.collectionId = collectionId;
    }
    // If collectionId is undefined, search ALL bookmarks (both with and without collections)

    const bookmarks = await Bookmark.find(query).sort({
      createdAt: -1
    });

    // Manually populate and filter based on search query
    const searchResults = await Promise.all(
        bookmarks.map(async(bookmark) => {
          let populatedTarget = null;

          if (bookmark.targetType === 'report') {
            const report = await Report.findById(bookmark.targetId).populate('userId', 'username profilePictureUrl');
            if (report) {
              // Add reaction counts and comment count like in reportService
              const commentCount = await Comment.countDocuments({
                targetType: 'report',
                targetId: report._id,
              });
              const reactionCounts = await ReactionService.countReactions(report._id, 'report');

              populatedTarget = {
                ...report.toObject({
                  virtuals: true
                }),
                commentCount,
                reactionCounts
              };
            }
          } else if (bookmark.targetType === 'claim') {
            const claim = await Claim.findById(bookmark.targetId).populate('userId', 'username profilePictureUrl');
            if (claim) {
              // Add reaction counts and comment count like in claimService
              const commentCount = await Comment.countDocuments({
                targetType: 'claim',
                targetId: claim._id,
              });
              const reactionCounts = await ReactionService.countReactions(claim._id, 'claim');

              populatedTarget = {
                ...claim.toObject({
                  virtuals: true
                }),
                commentCount,
                reactionCounts
              };
            }
          }

          if (populatedTarget) {
            // Check if the populated target matches the search query
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
              (populatedTarget.reportTitle && populatedTarget.reportTitle.toLowerCase().includes(searchLower)) ||
            (populatedTarget.claimTitle && populatedTarget.claimTitle.toLowerCase().includes(searchLower)) ||
            (populatedTarget.reportContent && populatedTarget.reportContent.toLowerCase().includes(searchLower)) ||
            (populatedTarget.claimContent && populatedTarget.claimContent.toLowerCase().includes(searchLower)) ||
            (populatedTarget.reportDescription && populatedTarget.reportDescription.toLowerCase().includes(searchLower));

            if (matchesSearch) {
              return {
                ...bookmark.toObject(),
                targetId: populatedTarget,
                target: populatedTarget // For suggestions compatibility
              };
            }
          }
          return null;
        }));

    // Filter out non-matching bookmarks and apply limit if specified
    const filteredResults = searchResults.filter(bookmark => bookmark !== null);

    if (limit && typeof limit === 'number' && limit > 0) {
      return filteredResults.slice(0, limit);
    }

    return filteredResults;
  } catch (error) {
    console.error('Error in BookmarkService.searchBookmarks:', error);
    throw error;
  }
}

// Update collection
static async updateCollection(collectionId, userId, updateData) {
  return await Collection.findOneAndUpdate({
    _id: collectionId,
    userId
  },
    updateData, {
    new: true
  });
}

// Delete collection
static async deleteCollection(collectionId, userId) {
  // First, remove the collection reference from all bookmarks
  await Bookmark.updateMany({
    collectionId,
    userId
  }, {
    $unset: {
      collectionId: 1
    }
  });

  // Then delete the collection
  return await Collection.findOneAndDelete({
    _id: collectionId,
    userId
  });
}
}

export default BookmarkService;
