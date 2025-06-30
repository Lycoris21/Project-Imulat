import BookmarkService from '../services/bookmarkService.js';
import mongoose from 'mongoose';

class BookmarkController {
  // Get user bookmarks
  static async getUserBookmarks(req, res) {
    try {
      const { userId } = req.params;
      const { collectionId, search, limit, page, targetType, paginated } = req.query;

      console.log('BookmarkController.getUserBookmarks params:', { userId, collectionId, search, limit, page, targetType, paginated });

      // Check if paginated request
      if (paginated === 'true') {
        const options = {
          page: parseInt(page, 10) || 1,
          limit: parseInt(limit, 10) || 10,
          targetType: targetType || null,
          collectionId,
          search
        };
        
        const result = await BookmarkService.getUserBookmarksPaginated(userId, options);
        console.log('BookmarkController.getUserBookmarks paginated result:', result.bookmarks.length, 'bookmarks');
        res.status(200).json(result);
      } else {
        // Legacy non-paginated request
        let bookmarks;
        if (search) {
          const parsedLimit = limit ? parseInt(limit, 10) : null;
          bookmarks = await BookmarkService.searchBookmarks(userId, search, collectionId, parsedLimit);
        } else {
          bookmarks = await BookmarkService.getUserBookmarks(userId, collectionId);
        }

        console.log('BookmarkController.getUserBookmarks result:', bookmarks.length, 'bookmarks');
        res.status(200).json(bookmarks);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  }

  // Get user collections
  static async getUserCollections(req, res) {
    try {
      const { userId } = req.params;
      const collections = await BookmarkService.getUserCollections(userId);
      res.status(200).json(collections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ error: 'Failed to fetch collections' });
    }
  }

  // Create collection
  static async createCollection(req, res) {
    try {
      const { userId, collectionName, collectionBanner } = req.body;
      
      if (!userId || !collectionName) {
        return res.status(400).json({ error: 'User ID and collection name are required' });
      }

      const collection = await BookmarkService.createCollection(userId, collectionName, collectionBanner);
      res.status(201).json(collection);
    } catch (error) {
      console.error('Error creating collection:', error);
      if (error.code === 11000) {
        res.status(400).json({ error: 'Collection name already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create collection' });
      }
    }
  }

  // Add bookmark
  static async addBookmark(req, res) {
    try {
      const { userId, targetId, targetType, collectionId } = req.body;
      
      if (!userId || !targetId || !targetType) {
        return res.status(400).json({ error: 'User ID, target ID, and target type are required' });
      }

      const bookmark = await BookmarkService.addBookmark(userId, targetId, targetType, collectionId);
      res.status(201).json(bookmark);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      if (error.code === 11000) {
        res.status(400).json({ error: 'Bookmark already exists' });
      } else {
        res.status(500).json({ error: 'Failed to add bookmark' });
      }
    }
  }

  // Remove bookmark
  static async removeBookmark(req, res) {
    try {
      const { userId, targetId, targetType } = req.body;
      
      if (!userId || !targetId || !targetType) {
        return res.status(400).json({ error: 'User ID, target ID, and target type are required' });
      }

      const result = await BookmarkService.removeBookmark(userId, targetId, targetType);
      
      if (result) {
        res.status(200).json({ message: 'Bookmark removed successfully' });
      } else {
        res.status(404).json({ error: 'Bookmark not found' });
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      res.status(500).json({ error: 'Failed to remove bookmark' });
    }
  }

  // Check bookmark status
  static async checkBookmark(req, res) {
    try {
      const { userId, targetId, targetType } = req.params;
      const isBookmarked = await BookmarkService.isBookmarked(userId, targetId, targetType);
      res.status(200).json({ isBookmarked });
    } catch (error) {
      console.error('Error checking bookmark:', error);
      res.status(500).json({ error: 'Failed to check bookmark status' });
    }
  }

  // Update collection
  static async updateCollection(req, res) {
    try {
      const { collectionId } = req.params;
      const { userId, collectionName, collectionDescription } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const updateData = {};
      if (collectionName) updateData.collectionName = collectionName;
      if (collectionDescription !== undefined) updateData.collectionDescription = collectionDescription;

      const collection = await BookmarkService.updateCollection(collectionId, userId, updateData);
      
      if (collection) {
        res.status(200).json(collection);
      } else {
        res.status(404).json({ error: 'Collection not found' });
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      res.status(500).json({ error: 'Failed to update collection' });
    }
  }

  // Delete collection
  static async deleteCollection(req, res) {
    try {
      const { collectionId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const result = await BookmarkService.deleteCollection(collectionId, userId);
      
      if (result) {
        res.status(200).json({ message: 'Collection deleted successfully' });
      } else {
        res.status(404).json({ error: 'Collection not found' });
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      res.status(500).json({ error: 'Failed to delete collection' });
    }
  }
}

export default BookmarkController;
