import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Define schemas to match server.js
const MediaAssetSchema = {
    url: String,
    publicId: String,
    type: { type: String, default: 'image' }
};

const EventSchema = new mongoose.Schema({
    id: String,
    title: String,
    date: String,
    time: String,
    description: String,
    category: String,
    registeredCount: Number,
    maxSlots: Number,
    image: MediaAssetSchema,
    participationType: String,
    ticketTiers: [String],
    rules: [String],
    teamSize: String,
    coordinatorPhone: String,
    entryFee: Number,
    isPassEvent: { type: Boolean, default: true }
});

const EventModel = mongoose.model('Event', EventSchema);

const events = [
    {
        id: "1",
        title: "ANYBODY CAN DANCE (Group)",
        category: "Group Dance",
        description: "Group dance showcasing coordination, expressions & energy!",
        rules: [
            "Team size: 3–12 participants.",
            "Time limit: 3–5 minutes.",
            "Use only non-copyrighted music.",
            "Props allowed.",
            "Judging based on coordination & energy.",
        ],
        coordinatorPhone: "JERVIN J.V- 7418907836",
        participationType: "Team",
        teamSize: "3-12",
        date: "Feb 27, 2026",
        time: "10:00 AM",
        registeredCount: 0,
        maxSlots: 50,
        ticketTiers: [],
        isPassEvent: false
    },
    {
        id: "2",
        title: "ANYBODY CAN DANCE (Solo)",
        category: "Solo Dance",
        description: "Join our dance event – rhythm, creativity, and energy!",
        rules: [
            "Perform solo with original choreography.",
            "Performance duration: 2–3 minutes.",
            "Props allowed but must be self-managed.",
            "Costumes must be appropriate.",
            "Report 30 minutes before your slot.",
        ],
        coordinatorPhone: "JERVIN J.V- 7418907836",
        participationType: "Solo",
        teamSize: "1",
        date: "Feb 27, 2026",
        time: "11:00 AM",
        registeredCount: 0,
        maxSlots: 50,
        ticketTiers: [],
        isPassEvent: false
    },
    {
        id: "3",
        title: "VOICE QUEST (Group)",
        category: "Group Singing",
        description: "Singing event uniting students through music!",
        rules: [
            "Team size: 3–10 participants.",
            "Time limit: 4 minutes.",
            "Live instruments allowed.",
            "No offensive lyrics.",
            "Judging based on harmony & coordination.",
        ],
        coordinatorPhone: "DARSHAN S - 8637466016",
        participationType: "Team",
        teamSize: "3-10",
        date: "Feb 27, 2026",
        time: "12:00 PM",
        registeredCount: 0,
        maxSlots: 30,
        ticketTiers: [],
        isPassEvent: false
    },
    {
        id: "4",
        title: "VOICE QUEST (Solo)",
        category: "Solo Singing",
        description: "Showcase your vocal talent in this solo singing competition!",
        rules: [
            "Solo performance only.",
            "Maximum time: 3 minutes.",
            "Karaoke track must be submitted beforehand.",
            "Offensive lyrics prohibited.",
            "Judging based on pitch & clarity.",
        ],
        coordinatorPhone: "DARSHAN S - 8637466016",
        participationType: "Solo",
        teamSize: "1",
        date: "Feb 27, 2026",
        time: "02:00 PM",
        registeredCount: 0,
        maxSlots: 50,
        ticketTiers: [],
        isPassEvent: false
    },
    {
        id: "5",
        title: "FRAME BY FRAME",
        category: "Film",
        description: "Short-film contest for creative storytellers!",
        rules: [
            "Submit individually or in teams of 1–4.",
            "Film duration: 5–7 minutes including credits.",
            "Background score allowed; songs with lyrics prohibited.",
            "Film must be original & copyright-free.",
            "Upload to Drive and bring a pendrive copy.",
        ],
        coordinatorPhone: "SAI SANTHOSH P - 8072152950",
        participationType: "Team",
        teamSize: "1-4",
        date: "Feb 28, 2026",
        time: "10:00 AM",
        registeredCount: 0,
        maxSlots: 40,
        ticketTiers: [],
        isPassEvent: false
    },
    {
        id: "6",
        title: "The Walk of Fame",
        category: "Ramp Walk",
        description: "Strut your style on the ramp in this team fashion showcase!",
        rules: [
            "Team: 5 members. Time: 3-5 mins.",
            "Theme: Workplace attire. Creative & decent.",
            "Submit background music in advance.",
            "Teams must justify concept to judges.",
        ],
        coordinatorPhone: "Silviya E - 9361847450",
        participationType: "Team",
        teamSize: "5",
        date: "Feb 28, 2026",
        time: "04:00 PM",
        registeredCount: 0,
        maxSlots: 20,
        ticketTiers: [],
        isPassEvent: false
    }
];

const seedDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env file");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        await EventModel.deleteMany({});
        console.log("🗑️  Cleared existing events");

        await EventModel.insertMany(events);
        console.log(`✅ Seeded ${events.length} events successfully`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding database:", err);
        process.exit(1);
    }
};

seedDB();
