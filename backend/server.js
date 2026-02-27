import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmed - Esperanza 2K26</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
        table, td {font-family: Arial, sans-serif;}
    </style>
    <![endif]-->
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap');
        
        body, table, td, p, a, h1, h2, h3 {
            font-family: 'Bricolage Grotesque', Arial, sans-serif;
        }
        
        body {
            margin: 0;
            padding: 0;
            background-color: #0c0c0c;
            color: #ffffff;
            -webkit-font-smoothing: antialiased;
        }

        table {
            border-spacing: 0;
            border-collapse: collapse;
            width: 100%;
        }

        .main-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #0f172a;
            border-radius: 24px;
            border: 1px solid #1e293b;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .header {
            background-color: #020617;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 1px solid #1e293b;
        }

        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            color: #c084fc;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 500;
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #ffffff;
        }

        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #cbd5e1;
            margin: 0 0 35px 0;
        }

        .details-box {
            background-color: #1e293b;
            border-radius: 16px;
            padding: 25px 30px;
            border: 1px solid #334155;
            margin-bottom: 30px;
        }

        .details-title {
            font-size: 13px;
            color: #c084fc;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0 0 20px 0;
            font-weight: 700;
            border-bottom: 1px solid #334155;
            padding-bottom: 12px;
        }

        .detail-row {
            margin-bottom: 18px;
        }

        .detail-label {
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .detail-value {
            font-size: 16px;
            color: #ffffff;
            font-weight: 600;
        }

        .alert-box {
            background-color: rgba(168, 85, 247, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(168, 85, 247, 0.2);
            margin-bottom: 30px;
        }

        .alert-box p {
            margin: 0;
            font-size: 14px;
            color: #e2e8f0;
            font-weight: 500;
        }

        .pass-section {
            background-color: rgba(168, 85, 247, 0.05);
            border: 1px dashed rgba(168, 85, 247, 0.3);
            border-radius: 16px;
            padding: 25px;
            text-align: center;
            margin-bottom: 30px;
        }

        .pass-title {
            font-size: 13px;
            color: #c084fc;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 800;
            margin: 0 0 15px 0;
        }

        .pass-image {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .footer {
            background-color: #020617;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #1e293b;
        }

        .footer p {
            margin: 0 0 10px 0;
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
        }

        .footer a {
            color: #c084fc;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }

        /* Responsive Styles */
        @media only screen and (max-width: 600px) {
            .main-container {
                border-radius: 0 !important;
                border: none !important;
            }
            body {
                padding: 0 !important;
            }
            .header, .content, .footer {
                padding: 30px 20px !important;
            }
            .header h1 {
                font-size: 26px !important;
            }
            .greeting {
                font-size: 20px !important;
            }
            .message {
                font-size: 15px !important;
            }
            .details-box, .pass-section {
                padding: 20px !important;
            }
            .detail-value {
                font-size: 14px !important;
            }
            .pass-image {
                border-radius: 8px !important;
            }
        }
    </style>
</head>
<body style="background-color: #0c0c0c; margin: 0; padding: 40px 20px;">
    <!-- Centering Table -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                
                <!-- Main Content Table -->
                <table role="presentation" class="main-container" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <h1>Esperanza 2K26</h1>
                            <p>An Inter-College Cultural Fest</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td class="content">
                            <h2 class="greeting">Hello ${participantName},</h2>
                            <p class="message">
                                Your registration for <strong>${eventName}</strong> has been successfully verified! 
                                Get ready to experience lights, music, energy, and unforgettable moments on 
                                <strong>6th March 2026</strong>.
                            </p>

                            <!-- Details Table -->
                            <table role="presentation" class="details-box" border="0" cellspacing="0" cellpadding="0" width="100%">
                                <tr>
                                    <td>
                                        <p class="details-title">Registration Details</p>

                                        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                                            <tr>
                                                <td class="detail-row" style="padding-bottom: 15px;">
                                                    <div class="detail-label">Event</div>
                                                    <div class="detail-value">${eventName}</div>
                                                </td>
                                            </tr>
                                            ${updatedReg.name ? `
                                            <tr>
                                                <td class="detail-row" style="padding-bottom: 15px;">
                                                    <div class="detail-label">Participant</div>
                                                    <div class="detail-value">${updatedReg.name}</div>
                                                </td>
                                            </tr>` : ''}
                                            ${updatedReg.teamName ? `
                                            <tr>
                                                <td class="detail-row" style="padding-bottom: 15px;">
                                                    <div class="detail-label">Team</div>
                                                    <div class="detail-value">${updatedReg.teamName}</div>
                                                </td>
                                            </tr>` : ''}
                                            ${(updatedReg.participationType === 'Team' && updatedReg.teamMembers && Array.isArray(updatedReg.teamMembers) && updatedReg.teamMembers.length > 0 && updatedReg.teamMembers.some(m => m.name && m.name.trim() !== '')) ? `
                                            <tr>
                                                <td class="detail-row" style="padding-bottom: 15px;">
                                                    <div class="detail-label">Team Members</div>
                                                    <div class="detail-value" style="font-size: 14px; font-weight: 500;">
                                                        ${updatedReg.teamMembers.filter(m => m.name && m.name.trim() !== '').map(m => m.name).join(', ')}
                                                    </div>
                                                </td>
                                            </tr>` : ''}
                                            <tr>
                                                <td class="detail-row" style="padding-bottom: 0;">
                                                    <div class="detail-label">Institution</div>
                                                    <div class="detail-value">${updatedReg.college || 'N/A'}</div>
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <!-- Important Alert -->
                            <table role="presentation" class="alert-box" border="0" cellspacing="0" cellpadding="0" width="100%">
                                <tr>
                                    <td>
                                        <p>⚠️ Please bring this email or pass to the venue. Arrive 30 minutes early.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Pass Image -->
                            <table role="presentation" class="pass-section" border="0" cellspacing="0" cellpadding="0" width="100%">
                                <tr>
                                    <td>
                                        <p class="pass-title">Official Event Pass</p>
                                        <img src="cid:esperanza_entry_pass" class="pass-image" alt="Event Pass" width="500" style="width: 100%; max-width: 500px; display: block; margin: 0 auto;"/>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p>© 2026 Vistara Student Club, VTMT</p>
                            <p>Vel Tech Multi Tech – Avadi, Chennai</p>
                            <p style="margin-top: 15px; margin-bottom: 0;">
                                Questions? <br/>
                                <a href="mailto:technical.vistara25@gmail.com" style="display:inline-block; margin-top:5px;">technical.vistara25@gmail.com</a>
                            </p>
                        </td>
                    </tr>
                    
                </table>

            </td>
        </tr>
    </table>
</body>
</html>`;

        const defaultPassImagePath = path.join(__dirname, '..', 'public', 'Entry Pass', 'esperanza_entry_pass.png');
        
        let isBuffer = false;
        let attachmentConfig;

        if (passImageUrl) {
          try {
            const resp = await axios.get(passImageUrl, { responseType: 'arraybuffer' });
            attachmentConfig = {
              filename: 'esperanza_entry_pass.png',
              content: Buffer.from(resp.data),
              cid: 'esperanza_entry_pass'
            };
            isBuffer = true;
          } catch (fetchErr) {
            console.error("Failed fetching pass string image, falling back to default:", fetchErr.message);
          }
        }

        if (!isBuffer) {
          attachmentConfig = { 
            filename: 'esperanza_entry_pass.png', 
            path: defaultPassImagePath, 
            cid: 'esperanza_entry_pass' 
          };
        }

        await transporter.sendMail({
          from: `"Esperanza 2K26" <${process.env.EMAIL_USER}>`,
          to: updatedReg.email,
          subject: `Registration Confirmed: ${eventName} - Esperanza 2K26`,
          html: emailHtml,
          attachments: [attachmentConfig]
        });
        console.log(`📧 Confirmation email sent to: ${updatedReg.email}`);
      } catch (mailError) {
        console.error("❌ Error sending confirmation email:", mailError);
        // We don't return error here because the registration IS verified in DB
      }
    } else {
      // Send Pending Email
      try {
        const participantName = updatedReg.name || updatedReg.teamName || "Participant";
        const eventName = updatedReg.eventName || "Esperanza Event";
        
        const pendingEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Pending - Esperanza 2K26</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
        table, td {font-family: Arial, sans-serif;}
    </style>
    <![endif]-->
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap');
        
        body, table, td, p, a, h1, h2, h3 {
            font-family: 'Bricolage Grotesque', Arial, sans-serif;
        }
        
        body {
            margin: 0;
            padding: 0;
            background-color: #0c0c0c;
            color: #ffffff;
            -webkit-font-smoothing: antialiased;
        }

        table {
            border-spacing: 0;
            border-collapse: collapse;
            width: 100%;
        }

        .main-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #0f172a;
            border-radius: 24px;
            border: 1px solid #1e293b;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .header {
            background-color: #020617;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 1px solid #1e293b;
        }

        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            color: #eab308;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 500;
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #ffffff;
        }

        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #cbd5e1;
            margin: 0 0 35px 0;
        }

        .alert-box {
            background-color: rgba(234, 179, 8, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(234, 179, 8, 0.2);
            margin-bottom: 30px;
        }

        .alert-box p {
            margin: 0;
            font-size: 14px;
            color: #e2e8f0;
            font-weight: 500;
        }

        .footer {
            background-color: #020617;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #1e293b;
        }

        .footer p {
            margin: 0 0 10px 0;
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
        }

        .footer a {
            color: #eab308;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }

        @media only screen and (max-width: 600px) {
            .main-container {
                border-radius: 0 !important;
                border: none !important;
            }
            body {
                padding: 0 !important;
            }
            .header, .content, .footer {
                padding: 30px 20px !important;
            }
        }
    </style>
</head>
<body style="background-color: #0c0c0c; margin: 0; padding: 40px 20px;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table role="presentation" class="main-container" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                    <tr>
                        <td class="header">
                            <h1>Esperanza 2K26</h1>
                            <p style="color: #eab308;">Action Required</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <h2 class="greeting">Hello ${participantName},</h2>
                            <p class="message">
                                Your registration status for <strong>${eventName}</strong> has been updated to <strong>PENDING</strong>. 
                                We are currently verifying your payment and identity details. If there are any discrepancies, we may need you to reach out and provide further proof.
                            </p>
                            <table role="presentation" class="alert-box" border="0" cellspacing="0" cellpadding="0" width="100%">
                                <tr>
                                    <td>
                                        <p>⚠️ Please ensure your payment screenshot and ID card details were uploaded correctly.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <p>© 2026 Vistara Student Club, VTMT</p>
                            <p>Vel Tech Multi Tech – Avadi, Chennai</p>
                            <p style="margin-top: 15px; margin-bottom: 0;">
                                Support Email: <br/>
                                <a href="mailto:technical.vistara25@gmail.com" style="display:inline-block; margin-top:5px; color: #eab308;">technical.vistara25@gmail.com</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        await transporter.sendMail({
          from: `"Esperanza 2K26" <${process.env.EMAIL_USER}>`,
          to: updatedReg.email,
          subject: `Action Required: Registration Pending for ${eventName} - Esperanza 2K26`,
          html: pendingEmailHtml
        });
        console.log(`📧 Pending status email sent to: ${updatedReg.email}`);
      } catch (mailError) {
        console.error("❌ Error sending pending email:", mailError);
      }
    }

    res.json({ success: true, message: `Registration ${isActive ? 'verified' : 'set to pending'} successfully and email sent!`, data: updatedReg });
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