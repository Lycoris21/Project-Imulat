import Activity from '../models/Activity.js';

class ActivityService {
    async logActivity(
        userId,
        type,
        targetType,
        targetId,
        targetModelName, {
        actionDetails = null,
        postType = null,
        postId = null
    } = {}) {
        try {
            const activity = new Activity({
                user: userId,
                type,
                targetType,
                target: targetId,
                targetModel: targetModelName,
                postType,
                postId,
                actionDetails
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

            let activities = await Activity.find({
                user: userId
            })
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit)
                .populate('user', 'username avatar')
                .populate('target')
                .populate('postId').populate({
                    path: 'postId',
                    populate: {
                        path: 'userId',
                        select: 'username'
                    }
                })
                .lean();

            // Manually populate user information for different target types
            for (let activity of activities) {
                if (activity.target && activity.targetModel) {
                    try {
                        let targetWithUser = null;

                        if (activity.targetModel === 'Report') {
                            const { Report } = await import('../models/index.js');
                            targetWithUser = await Report.findById(activity.target._id).populate('userId', 'username avatar').lean();
                            if (targetWithUser) {
                                activity.target.owner = targetWithUser.userId;
                            }
                        } else if (activity.targetModel === 'Claim') {
                            const { Claim } = await import('../models/index.js');
                            targetWithUser = await Claim.findById(activity.target._id).populate('userId', 'username avatar').lean();
                            if (targetWithUser) {
                                activity.target.owner = targetWithUser.userId;
                            }
                        } else if (activity.targetModel === 'Comment') {
                            const { Comment } = await import('../models/index.js');
                            targetWithUser = await Comment.findById(activity.target._id).populate('userId', 'username avatar').lean();
                            if (targetWithUser) {
                                activity.target.owner = targetWithUser.userId;
                            }
                        } else if (activity.targetModel === 'Bookmark') {
                            const { Bookmark, Report, Claim } = await import('../models/index.js');

                            // Step 1: Get the bookmark
                            const bookmark = await Bookmark.findById(activity.target._id)
                                .populate('userId', 'username avatar')
                                .lean();

                            if (!bookmark) {
                                console.warn('[ActivityService] Bookmark not found:', activity.target._id);
                                continue;
                            }

                            // Step 2: Get the bookmarked target (Report or Claim)
                            let bookmarkedTarget = null;
                            if (bookmark.targetType === 'report') {
                                bookmarkedTarget = await Report.findById(bookmark.targetId)
                                    .populate('userId', 'username avatar')
                                    .lean();
                            } else if (bookmark.targetType === 'claim') {
                                bookmarkedTarget = await Claim.findById(bookmark.targetId)
                                    .populate('userId', 'username avatar')
                                    .lean();
                            }

                            // Step 3: Assign user data into activity.target
                            if (bookmarkedTarget) {
                                activity.target.owner = bookmark.userId;
                                activity.target.targetId = bookmarkedTarget;

                                // Optional debug logs
                                console.log('[ActivityService] Populated bookmark:', bookmarkedTarget);
                                console.log('[ActivityService] Owner:', bookmark.userId);
                            } else {
                                console.warn('[ActivityService] Target (report/claim) not found for bookmark:', bookmark._id);
                            }
                        }
                    } catch (populateError) {
                        console.error('Error populating target user:', populateError);
                        // Continue without user info
                    }
                }
            }

            const total = await Activity.countDocuments({
                user: userId
            });

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
    }

    async getActivitiesByDateRange(userId, startDate, endDate, page = 1, limit = 10) {
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
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit)
                .populate('user', 'username avatar')
                .populate('target')
                .lean();

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
