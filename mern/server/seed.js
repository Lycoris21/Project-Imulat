import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './models/Notification.js';

dotenv.config({ path: './config.env' });

async function deleteAllNotifications() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);

    // Delete all notifications
    await Notification.deleteMany({});
    console.log("🗑️ All notifications deleted");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error deleting notifications:", err);
    process.exit(1);
  }
}

deleteAllNotifications();
