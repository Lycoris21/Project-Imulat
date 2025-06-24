import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
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
    enum: ['report', 'claim', 'comment', 'user'],
    required: true
  },
  reactionType: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create compound index to ensure one reaction per user per target
reactionSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

// Additional indexes for queries
reactionSchema.index({ targetId: 1, targetType: 1, reactionType: 1 });
reactionSchema.index({ userId: 1 });

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;
