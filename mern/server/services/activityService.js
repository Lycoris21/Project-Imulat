import Activity from '../models/Activity.js';

class ActivityService {
    async logActivity(userId, type, targetType, targetId, targetModelName) {
        try {
            const activity = new Activity({
                user: userId,
                type,
                targetType,
                target: targetId,
                targetModel: targetModelName
            });
            await activity.save();
            return activity;
        } catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }

    async getUserActivities(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            const activities = await Activity.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'username avatar')
                .lean(); // Use lean() for better performance

            const total = await Activity.countDocuments({ user: userId });

            return {
                activities,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching user activities:', error);
            throw error;
        }
    }    async getActivitiesByDateRange(userId, startDate, endDate, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            const query = {
                user: userId,
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };

            const activities = await Activity.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'username avatar')
                .lean(); // Use lean() for better performance

            const total = await Activity.countDocuments(query);

            return {
                activities,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching activities by date range:', error);
            throw error;
        }
    }
}

export default new ActivityService();
