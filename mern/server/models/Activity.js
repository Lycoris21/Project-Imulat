import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'LIKE',
            'DISLIKE',
            'COMMENT',
            'REPLY',
            'REPORT_CREATE',
            'CLAIM_CREATE',
            'BOOKMARK_CREATE',
            'REPORT_DELETE',
            'CLAIM_DELETE',
            'BOOKMARK_DELETE',
            'COMMENT_DELETE',
            'PROFILE_UPDATE'
        ]
    },
    targetType: {
        type: String,
        required: true,
        enum: ['REPORT', 'CLAIM', 'COMMENT', 'USER', 'BOOKMARK']
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        required: true,
        enum: ['Report', 'Claim', 'Comment', 'User', 'Bookmark']
    },
    // Additional context for specific actions
    actionDetails: {
        type: String, // For profile updates: 'info', 'password', 'delete'
        enum: ['info', 'password', 'delete', null]
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for efficient date-based queries
activitySchema.index({ createdAt: -1 });

// Index for efficient user + date queries
activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
