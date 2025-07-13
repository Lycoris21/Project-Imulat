import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js'; // Make sure this path is correct

dotenv.config({ path: './config.env' });

async function fixPeerReviews() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("✅ Connected to MongoDB");

    // Step 1: Find affected reports
    const reports = await Report.find({
      'peerReviews.decision': { $exists: false }
    });

    console.log(`🔍 Found ${reports.length} reports with missing decisions`);

    let updatedCount = 0;

    // Step 2: Update each report
    for (const report of reports) {
      let changed = false;

      for (const review of report.peerReviews) {
        if (!review.decision) {
          review.decision = 'approve'; // Or 'disapprove', or infer if possible
          changed = true;
        }
      }

      if (changed) {
        await report.save();
        updatedCount++;
      }
    }

    console.log(`✅ Fixed ${updatedCount} reports`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error fixing peer reviews:", err);
    process.exit(1);
  }
}

fixPeerReviews();
