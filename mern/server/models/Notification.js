import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  type: {
    type: String,
    enum: ["like", "comment", "peer_review", "report_approved", "report_rejected"],
    required: true,
  },
  targetType: {
    type: String,
    enum: ["claim", "report", "comment"],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  read: {
    type: Boolean,
  default:
    false,
  },
  postType: {
    type: String,
    enum: ["claim", "report"],
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

notificationSchema.index({
  recipientId: 1
});
notificationSchema.index({
  type: 1,
  targetType: 1
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
