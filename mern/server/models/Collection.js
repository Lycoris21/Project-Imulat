import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collectionName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  collectionBanner: {
    type: String,
    trim: true,
    default: null // URL to the banner image
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create indexes for better query performance
collectionSchema.index({ userId: 1 });
collectionSchema.index({ collectionName: 'text' });

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
