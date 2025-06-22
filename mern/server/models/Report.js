import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }], // Array to handle "can be many" relationship
  reportTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  reportContent: {
    type: String,
    required: true,
    trim: true
  },
  truthVerdict: {
    type: String,
    enum: ['true', 'false', 'partially_true', 'misleading', 'unverified', 'disputed'],
    required: true
  },
  aiReportSummary: {
    type: String,
    trim: true
  },
  reportConclusion: {
    type: String,
    required: true,
    trim: true
  },
  reportReferences: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Create indexes for better query performance
reportSchema.index({ userId: 1 });
reportSchema.index({ truthVerdict: 1 });
reportSchema.index({ reportTitle: 'text', reportContent: 'text' }); // Text search
reportSchema.index({ createdAt: -1 }); // For sorting by date

const Report = mongoose.model('Report', reportSchema);

export default Report;
