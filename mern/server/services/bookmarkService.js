import { Bookmark, Collection, Claim, Report, Comment } from '../models/index.js';
import ReactionService from './reactionService.js';

class BookmarkService {
  // Get all bookmarks for a user
  static async getUserBookmarks(userId, collectionId = undefined) {
    try {
      const query = { userId };
      
      // Only filter by collection if collectionId is explicitly provided
      if (collectionId !== undefined) {
        query.collectionId = collectionId;
      }
      // If collectionId is undefined, show ALL bookmarks (both with and without collections)

      console.log('BookmarkService.getUserBookmarks query:', query);
      
      const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 });

      console.log('BookmarkService.getUserBookmarks found bookmarks:', bookmarks.length);
      
      // Manually populate targetId based on targetType
      const populatedBookmarks = await Promise.all(
        bookmarks.map(async (bookmark) => {
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
                ...report.toObject({ virtuals: true }),
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
                ...claim.toObject({ virtuals: true }),
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
        })
      );
      
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
    const collections = await Collection.find({ userId }).sort({ collectionName: 1 });
    
    // Get bookmark count for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const bookmarkCount = await Bookmark.countDocuments({
          userId,
          collectionId: collection._id
        });
        return {
          ...collection.toObject(),
          bookmarkCount
        };
      })
    );

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
    return await Bookmark.findOneAndDelete({ userId, targetId, targetType });
  }

  // Check if item is bookmarked
  static async isBookmarked(userId, targetId, targetType) {
    const bookmark = await Bookmark.findOne({ userId, targetId, targetType });
    return !!bookmark;
  }

  // Search bookmarks
  static async searchBookmarks(userId, searchQuery, collectionId = undefined, limit = null) {
    try {
      const query = { userId };
      
      // Only filter by collection if collectionId is explicitly provided
      if (collectionId !== undefined) {
        query.collectionId = collectionId;
      }
      // If collectionId is undefined, search ALL bookmarks (both with and without collections)

      const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 });

      // Manually populate and filter based on search query
      const searchResults = await Promise.all(
        bookmarks.map(async (bookmark) => {
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
                ...report.toObject({ virtuals: true }),
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
                ...claim.toObject({ virtuals: true }),
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
        })
      );
      
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

  // Get paginated bookmarks for a user with optional type filtering
  static async getUserBookmarksPaginated(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        targetType = null, // 'report', 'claim', or null for all
        collectionId = undefined,
        search = null
      } = options;

      const query = { userId };
      
      // Filter by collection if specified
      if (collectionId !== undefined) {
        query.collectionId = collectionId;
      }

      // Filter by target type if specified
      if (targetType) {
        query.targetType = targetType;
      }

      console.log('BookmarkService.getUserBookmarksPaginated query:', query);
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Get total count for pagination info
      const totalBookmarks = await Bookmark.countDocuments(query);
      
      // Fetch bookmarks with pagination
      const bookmarks = await Bookmark.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      console.log('BookmarkService.getUserBookmarksPaginated found bookmarks:', bookmarks.length);
      
      // Manually populate targetId based on targetType
      const populatedBookmarks = await Promise.all(
        bookmarks.map(async (bookmark) => {
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
                ...report.toObject({ virtuals: true }),
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
                ...claim.toObject({ virtuals: true }),
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
        })
      );
      
      // Filter out bookmarks where target was not found (deleted reports/claims)
      const filteredBookmarks = populatedBookmarks.filter(bookmark => bookmark !== null);
      
      // Apply search filter if provided
      let searchFilteredBookmarks = filteredBookmarks;
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        searchFilteredBookmarks = filteredBookmarks.filter(bookmark => {
          const target = bookmark.targetId;
          return (
            target.reportTitle?.toLowerCase().includes(searchLower) ||
            target.claimTitle?.toLowerCase().includes(searchLower) ||
            target.reportContent?.toLowerCase().includes(searchLower) ||
            target.claimContent?.toLowerCase().includes(searchLower) ||
            target.reportDescription?.toLowerCase().includes(searchLower) ||
            target.aiReportSummary?.toLowerCase().includes(searchLower) ||
            target.aiClaimSummary?.toLowerCase().includes(searchLower)
          );
        });
      }

      console.log('BookmarkService.getUserBookmarksPaginated after filtering:', searchFilteredBookmarks.length);
      
      return {
        bookmarks: searchFilteredBookmarks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBookmarks / limit),
          totalItems: totalBookmarks,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalBookmarks / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error in BookmarkService.getUserBookmarksPaginated:', error);
      throw error;
    }
  }

  // Get all collections for a user
  static async getUserCollections(userId) {
    const collections = await Collection.find({ userId }).sort({ collectionName: 1 });
    
    // Get bookmark count for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const bookmarkCount = await Bookmark.countDocuments({
          userId,
          collectionId: collection._id
        });
        return {
          ...collection.toObject(),
          bookmarkCount
        };
      })
    );

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
    return await Bookmark.findOneAndDelete({ userId, targetId, targetType });
  }

  // Check if item is bookmarked
  static async isBookmarked(userId, targetId, targetType) {
    const bookmark = await Bookmark.findOne({ userId, targetId, targetType });
    return !!bookmark;
  }

  // Search bookmarks
  static async searchBookmarks(userId, searchQuery, collectionId = undefined, limit = null) {
    try {
      const query = { userId };
      
      // Only filter by collection if collectionId is explicitly provided
      if (collectionId !== undefined) {
        query.collectionId = collectionId;
      }
      // If collectionId is undefined, search ALL bookmarks (both with and without collections)

      const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 });

      // Manually populate and filter based on search query
      const searchResults = await Promise.all(
        bookmarks.map(async (bookmark) => {
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
                ...report.toObject({ virtuals: true }),
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
                ...claim.toObject({ virtuals: true }),
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
        })
      );
      
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
    return await Collection.findOneAndUpdate(
      { _id: collectionId, userId },
      updateData,
      { new: true }
    );
  }

  // Delete collection
  static async deleteCollection(collectionId, userId) {
    // First, remove the collection reference from all bookmarks
    await Bookmark.updateMany(
      { collectionId, userId },
      { $unset: { collectionId: 1 } }
    );
    
    // Then delete the collection
    return await Collection.findOneAndDelete({ _id: collectionId, userId });
  }
}

export default BookmarkService;
