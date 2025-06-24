import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js';
import Claim from './models/Claim.js';

dotenv.config({ path: './config.env' });

async function seed() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);

    // Wipe existing data
    await Report.deleteMany({});
    await Claim.deleteMany({});
    console.log("🗑️ Existing reports and claims deleted");

    // ✅ STEP 1: Insert Reports
    const user1 = new mongoose.Types.ObjectId("6859edb5957b70127ef526a5");
    const user2 = new mongoose.Types.ObjectId("6859fffdb4cb9ef1427bd9bc");

    const insertedReports = await Report.insertMany([
      {
        userId: user1,
        claimIds: [],
        reportTitle: "Debunking the 5G COVID-19 Myth",
        reportContent: "This report addresses the false claim that 5G towers are linked to the spread of COVID-19.",
        reportCoverUrl: "https://res.cloudinary.com/dy994eyye/image/upload/v1750755876/profile_pictures/nmlgoajocptgrf7ttesk.png",
        truthVerdict: "false",
        aiReportSummary: "Scientific evidence strongly refutes the claim that 5G technology is linked to viral transmission.",
        reportConclusion: "There is no evidence to support the claim. 5G does not cause or spread viruses.",
        reportReferences: "https://www.who.int/news-room/q-a-detail/radiation-5g-mobile-networks-and-health"
      },
      {
        userId: user1,
        claimIds: [],
        reportTitle: "Analyzing the Vaccine Microchip Theory",
        reportContent: "Some believe vaccines include microchips used to track individuals.",
        reportCoverUrl: "https://res.cloudinary.com/dy994eyye/image/upload/v1750755876/profile_pictures/nmlgoajocptgrf7ttesk.png",
        truthVerdict: "misleading",
        aiReportSummary: "No credible evidence supports the claim. Microchips in vaccines are physically implausible.",
        reportConclusion: "This claim is based on conspiracy theories, not science.",
        reportReferences: "https://www.cdc.gov/coronavirus/2019-ncov/vaccines/facts.html"
      },
      {
        userId: user2,
        claimIds: [],
        reportTitle: "Is Climate Change a Government Hoax?",
        reportContent: "A report evaluating the widespread belief that climate change is a fabricated phenomenon.",
        reportCoverUrl: "https://res.cloudinary.com/dy994eyye/image/upload/v1750755876/profile_pictures/nmlgoajocptgrf7ttesk.png",
        truthVerdict: "false",
        aiReportSummary: "Scientific consensus affirms that climate change is real and driven by human activity.",
        reportConclusion: "Climate change is real, backed by decades of scientific data.",
        reportReferences: "https://climate.nasa.gov/evidence/"
      }
    ]);

    const [report1, report2, report3] = insertedReports;

    // ✅ STEP 2: Insert Claims
    const insertedClaims = await Claim.insertMany([
      {
        userId: user1,
        reportId: report1._id,
        claimTitle: "5G Towers Cause COVID-19 Spread",
        claimContent: "Some social media posts claim that 5G technology causes the spread of COVID-19.",
        claimSources: "https://example.com/article/5g-covid-claim",
        aiClaimSummary: "The claim suggests a causal link between 5G towers and the COVID-19 virus.",
        aiTruthIndex: 12.5,
        aiClaimAnalysis: "There is no scientific evidence supporting this claim. 5G is non-ionizing radiation and cannot carry viruses."
      },
      {
        userId: user1,
        reportId: report2._id,
        claimTitle: "Vaccines Contain Tracking Microchips",
        claimContent: "A conspiracy theory claims that vaccines contain microchips to track people.",
        claimSources: null,
        aiClaimSummary: "The claim involves the injection of tracking devices via vaccines.",
        aiTruthIndex: 5.3,
        aiClaimAnalysis: "No credible evidence exists to support this claim. Vaccine ingredients are publicly listed and regulated."
      },
      {
        userId: user2,
        reportId: report3._id,
        claimTitle: "Climate Change is a Hoax",
        claimContent: "Some believe climate change is fabricated by governments to control people.",
        claimSources: "https://fakenews.example.com/climate-hoax",
        aiClaimSummary: "The claim suggests climate change is not real and is a tool for manipulation.",
        aiTruthIndex: 8.7,
        aiClaimAnalysis: "Extensive scientific research confirms climate change is real and driven by human activities."
      }
    ]);

    // ✅ STEP 3: Link Claims back to Reports
    for (const claim of insertedClaims) {
      await Report.findByIdAndUpdate(claim.reportId, {
        $push: { claimIds: claim._id }
      });
    }

    console.log("✅ Reports and Claims seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
