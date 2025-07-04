import express from 'express';
import BookmarkController from '../controllers/bookmarkController.js';

const router = express.Router();

// Get user bookmarks (with optional collection filter and search)
router.get('/user/:userId', BookmarkController.getUserBookmarks);

// Search endpoints for paginated results
router.get('/user/:userId/search/reports', BookmarkController.getUserBookmarks);
router.get('/user/:userId/search/claims', BookmarkController.getUserBookmarks);

// Get user collections
router.get('/collections/:userId', BookmarkController.getUserCollections);

// Create collection
router.post('/collections', BookmarkController.createCollection);

// Update collection
router.put('/collections/:collectionId', BookmarkController.updateCollection);

// Delete collection
router.delete('/collections/:collectionId', BookmarkController.deleteCollection);

// Add bookmark
router.post('/', BookmarkController.addBookmark);

// Remove bookmark
router.delete('/', BookmarkController.removeBookmark);

// Check bookmark status
router.get('/check/:userId/:targetId/:targetType', BookmarkController.checkBookmark);

export default router;
