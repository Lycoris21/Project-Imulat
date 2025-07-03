import activityService from '../services/activityService.js';
import { validationResult } from 'express-validator';

class ActivityController {
    async getUserActivities(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const userId = req.params.userId || req.body.userId;

            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }

            const result = await activityService.getUserActivities(userId, parseInt(page), parseInt(limit));
            res.json(result);
        } catch (error) {
            console.error('Error in getUserActivities:', error);
            res.status(500).json({ message: 'Error fetching activities' });
        }
    }

    async getActivitiesByDateRange(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { startDate, endDate } = req.query;
            const { page = 1, limit = 10 } = req.query;
            const userId = req.params.userId || req.body.userId;

            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }

            const result = await activityService.getActivitiesByDateRange(
                userId,
                startDate,
                endDate,
                parseInt(page),
                parseInt(limit)
            );

            res.json(result);
        } catch (error) {
            console.error('Error in getActivitiesByDateRange:', error);
            res.status(500).json({ message: 'Error fetching activities' });
        }
    }
}

export default new ActivityController();
