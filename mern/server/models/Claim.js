import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null // Nullable as per your ERD
  },
  claimTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  claimContent: {
    type: String,
    required: true,
    minlength: 250,
    trim: true
  },
  claimSources: {
    type: String,
    default: null // Nullable as per your ERD
  },
  aiClaimSummary: {
    type: String,
    trim: true
  },
  aiTruthIndex: {
    type: Number,
    min: 0.0,
    max: 99.9, // Assuming truth index is between 0 and 99.9%
    default: null
  },
  aiClaimAnalysis: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create indexes for better query performance
claimSchema.index({ userId: 1 });
claimSchema.index({ reportId: 1 });
claimSchema.index({ aiTruthIndex: 1 });
claimSchema.index({ claimTitle: 'text', claimContent: 'text' }); // Text search

const Claim = mongoose.model('Claim', claimSchema);

export default Claim;
