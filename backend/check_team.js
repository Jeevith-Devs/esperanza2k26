
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  name: String,
  role: String,
  category: { type: String, required: false },
  subCategory: { type: String, required: false },
  image: {
    url: String,
    publicId: String,
    type: { type: String, default: 'image' }
  },
  isActive: { type: Boolean, default: true },
  instagram: String,
  linkedin: String,
  order: { type: Number, default: 0 }
});
const TeamMemberModel = mongoose.model('TeamMember', TeamMemberSchema);

console.log("Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected!');
    try {
      const count = await TeamMemberModel.countDocuments();
      console.log(`TeamMember count: ${count}`);
      if (count > 0) {
        const members = await TeamMemberModel.find().limit(2);
        console.log('Sample members:', JSON.stringify(members, null, 2));
      }
      process.exit(0);
    } catch (e) {
      console.error('Error:', e);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Connection failed:', err);
    process.exit(1);
  });
