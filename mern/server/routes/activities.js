import express from 'express';
import activityController from '../controllers/activityController.js';
import { query } from 'express-validator';

const router = express.Router();

// Get user's activities with pagination
router.get('/user/:userId', activityController.getUserActivities);

// Get activities by date range
router.get('/user/:userId/range', [
    query('startDate').isISO8601().withMessage('Invalid start date'),
    query('endDate').isISO8601().withMessage('Invalid end date'),
], activityController.getActivitiesByDateRange);

export default router;
