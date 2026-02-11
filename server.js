const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://selvapopzz2003:gSgFIUbj1imxW2tQ@cluster0.6ayd2eg.mongodb.net/valentine_suite?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
    });

// --- DATA MODEL ---
const invitationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: String,
    images: [String], // Array of URLs for the gallery
    status: {
        type: String,
        enum: ['Sent', 'Opened', 'Accepted', 'Declined'],
        default: 'Sent'
    },
    dateSent: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});

const Invitation = mongoose.model('Invitation', invitationSchema);

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- API ROUTES ---

// Create & Send
app.post('/api/invitations', async (req, res) => {
    try {
        const { name, email, message, images } = req.body;
        const newInvite = new Invitation({ name, email, message, images });
        const saved = await newInvite.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const magicLink = `${frontendUrl}/#/invite/${saved._id}`;

        const mailOptions = {
            from: `"Valentine Concierge" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `A Private Message for ${name} ❤️`,
            html: `
        <div style="background-color: #fff5f7; padding: 40px 10px; font-family: sans-serif; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 40px; border: 1px solid #ffe4e9;">
            <div style="font-size: 60px; margin-bottom: 20px;">💌</div>
            <h1 style="color: #f43f5e; margin-bottom: 10px;">For ${name}</h1>
            <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">Someone special has sent you a digital Valentine's invitation.</p>
            <a href="${magicLink}" style="display: inline-block; background: #f43f5e; color: #ffffff; padding: 20px 45px; border-radius: 100px; font-weight: bold; font-size: 18px; text-decoration: none; box-shadow: 0 10px 25px rgba(244,63,94,0.3);">Open My Letter ❤️</a>
          </div>
        </div>
      `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
        }

        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create invitation' });
    }
});

// List All
app.get('/api/invitations', async (req, res) => {
    try {
        const list = await Invitation.find().sort({ dateSent: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

// Get Single
app.get('/api/invitations/:id', async (req, res) => {
    try {
        const invite = await Invitation.findById(req.params.id);
        if (!invite) return res.status(404).json({ error: 'Not found' });
        res.json(invite);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Patch Status
app.patch('/api/invitations/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Invitation.findByIdAndUpdate(
            req.params.id,
            { status, lastActive: Date.now() },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
