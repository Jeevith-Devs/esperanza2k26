import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import nodemailer from 'nodemailer';

const app = express();

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- 1. MIDDLEWARE ---
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));


// DEBUG LOGGING
console.log("DEBUG: Env Check");
console.log("Cloud Name exists:", !!process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key exists:", !!process.env.CLOUDINARY_API_KEY);
console.log("API Secret exists:", !!process.env.CLOUDINARY_API_SECRET);
console.log("Mongo URI exists:", !!process.env.MONGO_URI);


// --- 2a. CLOUDINARY CONFIG ---
// --- 2. CLOUDINARY CONFIGURATION (The Fixed Part) ---
// We check for credentials to help you debug if something is wrong
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ CRITICAL ERROR: Cloudinary credentials are missing in .env file.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// DEBUG: Check Cloudinary Config (Safe Log)
console.log("-----------------------------------------");
console.log("🔍 Checking Environment Variables:");
console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ MISSING");
console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ MISSING");
console.log("Cloudinary API Secret:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ MISSING");
console.log("Mongo URI:", process.env.MONGO_URI ? "✅ Set" : "❌ MISSING");
console.log("-----------------------------------------");

// Configure Storage (Updated to support Videos & PDFs)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'espranza_uploads',
    // 'auto' lets Cloudinary detect if it's an image, video, or raw file (PDF)
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mkv', 'pdf'],
  },
});

const upload = multer({ storage: storage });

// --- 3. MONGODB CONNECTION ---
if (!process.env.MONGO_URI) {
  console.error("❌ CRITICAL ERROR: MONGO_URI is missing in .env file.");
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully vro!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));


// --- 4. SCHEMAS (Your Data Models) ---

// --- 4. SCHEMAS (Your Data Models) ---

// Media Asset Sub-schema (Reusable)
const MediaAssetSchema = {
  url: String,
  publicId: String,
  type: { type: String, default: 'image' } // 'image', 'video', 'pdf'
};

// Registration Schema
const RegistrationSchema = new mongoose.Schema({
  // Common fields
  email: String,
  eventId: String,
  eventName: String,
  participationType: String, // 'Solo' or 'Team'

  // Solo event fields
  name: String,
  phone: String,
  college: String,
  department: String,
  degree: String,
  course: String,
  year: String,
  idCardUrl: String,

  // Team event fields
  teamName: String,
  teamMembers: [{
    name: String,
    phone: String
  }],
  teamLeaderIdCardUrl: String,

  // Payment
  paymentScreenshotUrl: String,
  paymentStatus: { type: String, default: "Pending" },

  // Admin
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const RegistrationModel = mongoose.model('Registration', RegistrationSchema);

// Event Schema
const EventSchema = new mongoose.Schema({
  id: String,
  title: String,
  date: String,
  time: String,
  description: String,
  category: String,
  registeredCount: Number,
  maxSlots: Number,
  image: MediaAssetSchema, // Updated to MediaAsset
  participationType: String,
  ticketTiers: [String],
  rules: [String],
  teamSize: String,
  coordinatorPhone: String, // Event coordinator contact number
  entryFee: String,
  isPassEvent: { type: Boolean, default: true } // Toggle for pricing logic
});
const EventModel = mongoose.model('Event', EventSchema);

// Content Schema
const ContentSchema = new mongoose.Schema({
  heroTitle: String,
  heroSubtitle: String,
  heroBackgroundMedia: MediaAssetSchema, // Updated
  marqueeText: String,
  eventDate: String,
  ticketPrices: {
    diamond: Number,
    gold: Number,
    silver: Number
  },
  upiId: String,
  qrCodeUrl: String,
  galleryImages: [MediaAssetSchema], // Updated to array of MediaAssets

  isTicketPassEnabled: { type: Boolean, default: true }
});
const ContentModel = mongoose.model('Content', ContentSchema);




// --- 5. API ROUTES ---

// === A. FILE UPLOAD ROUTE (FIXED) ===
app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log("DEBUG: /api/upload hit");

  if (!req.file) {
    console.error("❌ No file received");
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  // Success! Multer-Storage-Cloudinary has already uploaded it.
  console.log("✅ Upload Successful:", req.file.path);

  res.json({
    success: true,
    data: {
      url: req.file.path,
      publicId: req.file.filename,
      type: req.file.mimetype
    }
  });
});

// === B. ADMIN SECURITY ===
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASS) {
    res.json({ success: true, token: "admin-access-granted-vro" });
  } else {
    res.status(401).json({ success: false, message: "Wrong password vro!" });
  }
});

// === C. REGISTRATION ROUTES ===
app.post('/api/register', async (req, res) => {
  try {
    const { email, eventId, eventName, participationType, paymentScreenshotUrl } = req.body;

    // Basic validation
    if (!email || !eventId || !eventName || !participationType || !paymentScreenshotUrl) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Check if event is full
    const event = await EventModel.findOne({ id: eventId });
    if (event && event.maxSlots > 0 && event.registeredCount >= event.maxSlots) {
      return res.status(400).json({ success: false, error: "Sorry, this event has reached its maximum capacity." });
    }

    if (participationType === 'Solo') {
      if (!req.body.name || !req.body.phone || !req.body.idCardUrl) {
        return res.status(400).json({ success: false, error: "Missing required solo fields" });
      }
    } else if (participationType === 'Team') {
      if (!req.body.teamName || !req.body.teamMembers || !req.body.teamLeaderIdCardUrl) {
        return res.status(400).json({ success: false, error: "Missing required team fields" });
      }
    }

    const newReg = new RegistrationModel(req.body);
    await newReg.save();
    console.log("New Registration Saved:", req.body.name || req.body.teamName);
    res.json({ success: true, message: "Registration successful! Verification is pending." });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/registrations', async (req, res) => {
  try {
    const allStudents = await RegistrationModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: allStudents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/verify-registration', async (req, res) => {
  try {
    const { registrationId, isActive } = req.body;
    if (!registrationId) {
      return res.status(400).json({ success: false, error: "Registration ID is required" });
    }

    // Get old registration state to know if we are toggling
    const oldReg = await RegistrationModel.findById(registrationId);
    if (!oldReg) {
      return res.status(404).json({ success: false, error: "Registration not found" });
    }

    const updatedReg = await RegistrationModel.findByIdAndUpdate(
      registrationId,
      { isActive: isActive },
      { new: true }
    );

    // Update event registeredCount
    if (oldReg.isActive !== isActive) {
      const increment = isActive ? 1 : -1;
      await EventModel.findOneAndUpdate(
        { id: updatedReg.eventId },
        { $inc: { registeredCount: increment } }
      );
      console.log(`Updated registeredCount for event ${updatedReg.eventId} by ${increment}`);
    }

    console.log(`✅ Registration Verified: ${updatedReg.name || updatedReg.teamName} (${updatedReg._id})`);

    // Only send email if verifying (isActive: true)
    if (isActive) {
      try {
        // Fetch event details to get the image for the pass
        const event = await EventModel.findOne({ id: updatedReg.eventId });
        const passImageUrl = event?.image?.url || "";
        const participantName = updatedReg.name || updatedReg.teamName || "Participant";
        const eventName = updatedReg.eventName || "Esperanza Event";

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Esperanza 2K26 - Confirmed</title>
<style>
body{ margin:0; padding:0; background: radial-gradient(circle at top, #0d1b3d 0%, #050816 70%); font-family: 'Segoe UI', sans-serif; color:white; }
.wrapper{ padding:40px 15px; }
.container{ max-width:650px; margin:auto; background: linear-gradient(180deg, rgba(15,23,42,0.95), rgba(5,8,22,0.95)); border-radius:20px; overflow:hidden; box-shadow:0 25px 70px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.08); }
.header{ text-align:center; padding:60px 20px; background: linear-gradient(135deg,#0f2027,#203a43,#2c5364); position:relative; }
.header h1{ font-size:42px; margin:0; letter-spacing:3px; text-transform:uppercase; color:#8be9fd; text-shadow: 0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 40px #008cff; }
.header p{ margin-top:15px; font-size:16px; letter-spacing:2px; color:#ff4ecd; }
.content{ padding:40px 30px; }
.greeting{ font-size:20px; color:#00f0ff; }
.message{ margin:20px 0 30px; line-height:1.7; color:#cbd5e1; font-size:16px; }
.details{ background:rgba(255,255,255,0.05); padding:25px; border-radius:15px; border:1px solid rgba(255,255,255,0.08); margin-bottom:30px; }
.details h2{ margin-top:0; font-size:18px; letter-spacing:2px; color:#ff4ecd; }
.row{ display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px; }
.label{ color:#94a3b8; font-weight:600; }
.value{ color:white; font-weight:500; }
.registration-id{ font-family:monospace; color:#ffd700; letter-spacing:2px; font-weight:bold; }
.important{ background:linear-gradient(90deg,#ff4ecd,#00f0ff); padding:15px; border-radius:10px; font-size:14px; margin-bottom:30px; color:#0f172a; font-weight:600; }
.pass-container{ text-align:center; padding:20px; border-radius:15px; border:1px dashed #00f0ff; background:rgba(0,240,255,0.05); }
.pass-container p{ font-size:12px; letter-spacing:3px; color:#8be9fd; }
.pass-image{ max-width:100%; border-radius:10px; box-shadow:0 10px 40px rgba(0,240,255,0.3); }
.footer{ text-align:center; padding:30px 20px; background:#020617; font-size:12px; color:#64748b; }
.footer a{ color:#00f0ff; text-decoration:none; }
@media(max-width:600px){ .row{ flex-direction:column; } }
</style>
</head>
<body>
<div class="wrapper">
<div class="container">
<div class="header">
  <h1>Esperanza 2K26</h1>
  <p>AN INTER-COLLEGE CULTURAL FEST</p>
</div>
<div class="content">
<p class="greeting">Hello <strong>${participantName}</strong>,</p>
<p class="message">
Your registration for <strong>${eventName}</strong> has been successfully confirmed.
Get ready to experience lights, music, energy, and unforgettable moments on
<strong>6th March 2026</strong> 🚀
</p>
<div class="details">
<h2>REGISTRATION DETAILS</h2>
<div class="row">
<span class="label">Event</span>
<span class="value">${eventName}</span>
</div>
${updatedReg.name ? `
<div class="row">
<span class="label">Participant</span>
<span class="value">${updatedReg.name}</span>
</div>` : ''}
${updatedReg.teamName ? `
<div class="row">
<span class="label">Team</span>
<span class="value">${updatedReg.teamName}</span>
</div>` : ''}
<div class="row">
<span class="label">Registration ID</span>
<span class="value registration-id">${updatedReg._id}</span>
</div>
<div class="row">
<span class="label">College</span>
<span class="value">${updatedReg.college || 'N/A'}</span>
</div>
</div>
<div class="important">
⚠️ Bring this pass to the venue. Arrive 30 minutes early to avoid entry delay.
</div>
${passImageUrl ? `
<div class="pass-container">
<p>OFFICIAL EVENT PASS</p>
<img src="${passImageUrl}" class="pass-image" alt="Event Pass"/>
</div>` : ''}
</div>
<div class="footer">
© 2026 Vistara Student Club, VTMT  
<br>
Vel Tech Multi Tech – Avadi, Chennai  
<br><br>
Questions?  
<a href="mailto:esperanza2k26@vtmt.edu.in">esperanza2k26@vtmt.edu.in</a>
</div>
</div>
</div>
</body>
</html>`;

        await transporter.sendMail({
          from: `"Esperanza 2K26" <${process.env.EMAIL_USER}>`,
          to: updatedReg.email,
          subject: `Registration Confirmed: ${eventName} - Esperanza 2K26`,
          html: emailHtml
        });
        console.log(`📧 Confirmation email sent to: ${updatedReg.email}`);
      } catch (mailError) {
        console.error("❌ Error sending confirmation email:", mailError);
        // We don't return error here because the registration IS verified in DB
      }
    }

    res.json({ success: true, message: "Registration verified successfully and email sent!", data: updatedReg });
  } catch (error) {
    console.error("❌ Error verifying registration:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- D. EVENT ROUTES ---
app.get('/api/events', async (req, res) => {
  try {
    const events = await EventModel.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post('/api/events/update', async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      return res.status(400).json({ success: false, error: "Events must be an array" });
    }

    // Use bulkWrite for safer updates (upsert)
    const operations = events.map(event => ({
      updateOne: {
        filter: { id: event.id },
        update: {
          $set: {
            title: event.title,
            date: event.date,
            time: event.time,
            description: event.description,
            category: event.category,
            maxSlots: event.maxSlots,
            image: event.image,
            participationType: event.participationType,
            ticketTiers: event.ticketTiers,
            rules: event.rules,
            teamSize: event.teamSize,
            coordinatorPhone: event.coordinatorPhone,
            entryFee: event.entryFee,
            isPassEvent: event.isPassEvent
          },
          // We DON'T update registeredCount here to prevent accidental overrides
          // If it's a new event, we can set it to 0
          $setOnInsert: { registeredCount: 0 }
        },
        upsert: true
      }
    }));

    // Find and remove events that are not in the new list
    const incomingIds = events.map(e => e.id);
    await EventModel.deleteMany({ id: { $nin: incomingIds } });

    if (operations.length > 0) {
      await EventModel.bulkWrite(operations);
    }

    res.json({ success: true, message: "Events updated and counts preserved!" });
  } catch (error) {
    console.error("Error updating events:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- E. CONTENT ROUTES ---
app.get('/api/content', async (req, res) => {
  try {
    const content = await ContentModel.findOne();
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/content/update', async (req, res) => {
  try {
    const { content } = req.body;
    // We assume there's only one content document
    await ContentModel.findOneAndUpdate({}, content, { upsert: true, new: true });
    res.json({ success: true, message: "Website content saved!" });
  } catch (error) {
    console.error("Error saving content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));