import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js'; // Ensure this path is correct

dotenv.config({ path: './config.env' });

async function nukeAllReports() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("✅ Connected to MongoDB");

    const result = await Report.deleteMany({});
    console.log(`🔥 Deleted ${result.deletedCount} reports`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error deleting reports:", err);
    process.exit(1);
  }
}

nukeAllReports();
