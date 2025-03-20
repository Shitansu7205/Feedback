// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const nodemailer = require("nodemailer");
// const bodyParser = require("body-parser");

// // Initialize Express App
// const app = express();
// const PORT = process.env.PORT || 8000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Connect to MongoDB
// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         });
//         console.log("✅ MongoDB Connected Successfully!");
//     } catch (error) {
//         console.error("❌ MongoDB Connection Error:", error.message);
//         process.exit(1); // Exit process if connection fails
//     }
// };
// connectDB();

// // Define Feedback Schema
// const feedbackSchema = new mongoose.Schema({
//     property_name: String,
//     email: String,
//     rate_us: String,
//     need_assistance: String,
//     timestamp: { type: Date, default: Date.now }
// });

// // Create Feedback Model
// const Feedback = mongoose.model("Feedback", feedbackSchema);

// // API Endpoint to Receive Form Data
// app.post("/api/auth/feedbackbj", async (req, res) => {
//     try {
//         const { property_name, email, rate_us, need_assistance } = req.body;

//         console.log("Received Data:", req.body);

//         // Save to MongoDB
//         const newFeedback = new Feedback({ property_name, email, rate_us, need_assistance });
//         await newFeedback.save();
//         console.log("✅ Data saved to MongoDB:", newFeedback);

//         // Email Transporter
//         let transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL,
//                 pass: process.env.EMAIL_PASSWORD
//             }
//         });

//         // Email Options
//         let mailOptions = {
//             from: process.env.EMAIL,
//             to: "shitansukumargochhayat@gmail.com",
//             subject: "New Feedback Submission",
//             text: `You have a new feedback submission:\n\n
//             Property Name: ${property_name}
//             Email: ${email}
//             Rating: ${rate_us} ⭐
//             Needs Assistance: ${need_assistance}
//             `
//         };

//         // Send Email
//         let info = await transporter.sendMail(mailOptions);
//         console.log("📧 Email sent: %s", info.messageId);

//         res.status(200).send({ message: "Feedback submitted successfully & email sent", data: newFeedback });

//     } catch (error) {
//         console.error("❌ Error:", error);
//         res.status(500).send({ message: "Error processing request", error });
//     }
// });

// // Start Server
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });





require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const axios = require("axios");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected Successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};
connectDB();

// Define Feedback Schema
const feedbackSchema = new mongoose.Schema({
    property_name: String,
    email: String,
    rate_us: String,
    need_assistance: String,
    timestamp: { type: Date, default: Date.now }
});

// Create Feedback Model
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Google Apps Script Web URL (Replace with your actual deployment URL)
const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwP1g9CXqbxUdI0yy3hrI4qLj3w5VvAfawiO6_cXSL7fsZBB7e7tNIPhuD3hyO2dE0Y/exec"; 

// Function to Send Data to Google Sheets
const sendToGoogleSheets = async (feedbackData) => {
    try {
        await axios.post(GOOGLE_SHEET_SCRIPT_URL, feedbackData);
        console.log("✅ Data Sent to Google Sheets Successfully!");
    } catch (error) {
        console.error("❌ Error Sending Data to Google Sheets:", error);
    }
};

// API Endpoint to Receive Form Data
app.post("/api/auth/feedbackbj", async (req, res) => {
    try {
        const { property_name, email, rate_us, need_assistance } = req.body;

        console.log("Received Data:", req.body);

        // Save to MongoDB
        const newFeedback = new Feedback({ property_name, email, rate_us, need_assistance });
        await newFeedback.save();
        console.log("✅ Data saved to MongoDB:", newFeedback);

        // Send Data to Google Sheets
        sendToGoogleSheets(newFeedback);

        // Email Transporter
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Email Options
        let mailOptions = {
            from: process.env.EMAIL,
            to: "shitansukumargochhayat@gmail.com",
            subject: "New Feedback Submission",
            text: `You have a new feedback submission:\n\n
            Property Name: ${property_name}
            Email: ${email}
            Rating: ${rate_us} ⭐
            Needs Assistance: ${need_assistance}
            `
        };

        // Send Email
        let info = await transporter.sendMail(mailOptions);
        console.log("📧 Email sent: %s", info.messageId);

        res.status(200).send({ message: "Feedback submitted successfully, email sent, and data backed up to Google Sheets" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).send({ message: "Error processing request", error });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
