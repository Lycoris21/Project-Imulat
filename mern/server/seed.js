import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Activity from './models/Activity.js';

dotenv.config({ path: './config.env' });

async function deleteAllNotifications() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);

    // Delete all notifications
    await Activity.deleteMany({});
    console.log("🗑️ All activities deleted");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error deleting activities:", err);
    process.exit(1);
  }
}

deleteAllNotifications();
