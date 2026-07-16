require('dotenv').config();
const mongoose = require('mongoose');
async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const result = await db.collection('milestones').updateOne({ contractMilestoneId: 1784203463775 }, { $set: { status: 'submitted', submissionUrl: 'https://work-safe-freelancer-milestone-paym.vercel.app/dashboard' } });
  console.log('Modified:', result.modifiedCount);
  process.exit(0);
}
fix();
