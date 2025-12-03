import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----- Connect to MongoDB -----
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Mongo Error:", err));

// ----- Schema -----
const entrySchema = new mongoose.Schema({
    amount: Number,
    date: { type: Date, default: Date.now }
});

const Entry = mongoose.model("Entry", entrySchema);

// ----- ROUTES -----

// Add a transaction (positive = earned, negative = spent)
app.post("/add", async (req, res) => {
    const { amount } = req.body;

    if (typeof amount !== "number") {
        return res.status(400).json({ error: "Amount must be a number" });
    }

    await Entry.create({ amount });
    res.json({ success: true });
});

// Get history (from Dec 2, 2025 onward)
app.get("/history", async (req, res) => {
    const start = new Date("2025-12-02T00:00:00Z");

    const entries = await Entry.find({ date: { $gte: start } }).sort({ date: 1 });

    let balance = 0;
    const timeline = entries.map(e => {
        balance += e.amount;
        return {
            date: e.date,
            balance
        };
    });

    res.json(timeline);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
