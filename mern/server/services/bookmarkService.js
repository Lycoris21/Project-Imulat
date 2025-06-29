import { Bookmark, Collection, Claim, Report } from '../models/index.js';

class BookmarkService {
  // Get all bookmarks for a user
  static async getUserBookmarks(userId, collectionId = null) {
    const query = { userId };
    if (collectionId) {
      query.collectionId = collectionId;
    } else if (collectionId === null) {
      // Only get bookmarks without collection when explicitly looking for uncategorized
      query.collectionId = null;
    }

    const bookmarks = await Bookmark.find(query)
      .populate({
        path: 'targetId',
        populate: {
          path: 'userId',
          select: 'username profilePictureUrl'
        }
      })
      .sort({ createdAt: -1 });

    return bookmarks;
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
  static async searchBookmarks(userId, searchQuery, collectionId = null) {
    const query = { userId };
    if (collectionId) {
      query.collectionId = collectionId;
    }

    const bookmarks = await Bookmark.find(query)
      .populate({
        path: 'targetId',
        match: {
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { content: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } }
          ]
        },
        populate: {
          path: 'userId',
          select: 'username profilePictureUrl'
        }
      })
      .sort({ createdAt: -1 });

    // Filter out bookmarks where populate didn't match
    return bookmarks.filter(bookmark => bookmark.targetId);
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
