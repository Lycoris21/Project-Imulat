import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null // Nullable as per your ERD
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType' // Dynamic reference based on targetType
  },
  targetType: {
    type: String,
    enum: ['Report', 'Claim'],
    required: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create compound index to ensure one bookmark per user per target
bookmarkSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

// Additional indexes for queries
bookmarkSchema.index({ userId: 1, collectionId: 1 });
bookmarkSchema.index({ targetId: 1, targetType: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;
