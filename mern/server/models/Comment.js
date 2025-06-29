import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType' // Dynamic reference based on targetType
  },
  targetType: {
    type: String,
    enum: ['report', 'claim'],
    required: true
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  default:
    null // For replies - null means it's a top-level comment
  },
  commentContent: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: {
    type: Number,
  default:
    0
  },
  dislikes: {
    type: Number,
  default:
    0
  },
  likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  dislikedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  deletedAt: {
    type: Date,
  default:
    null
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create indexes for better query performance
commentSchema.index({
  userId: 1
});
commentSchema.index({
  targetId: 1,
  targetType: 1
});
commentSchema.index({
  parentCommentId: 1
});
commentSchema.index({
  createdAt: -1
}); // For sorting by date

// Virtual to get replies to this comment
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId'
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
