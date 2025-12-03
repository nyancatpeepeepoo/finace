import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "./data.json";

// Helper: read database
function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

// Helper: save database
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// POST /add — add earnings or spending
app.post("/add", (req, res) => {
    const { amount } = req.body;
    if (typeof amount !== "number") {
        return res.status(400).json({ error: "Amount must be a number" });
    }

    const data = readData();
    data.push({
        amount,
        date: new Date().toISOString()
    });

    saveData(data);
    res.json({ success: true });
});

// GET /history — returns cumulative balance since 2 Dec 2025
app.get("/history", (req, res) => {
    const data = readData();

    const startDate = new Date("2025-12-02T00:00:00Z");
    let balance = 0;

    const timeline = data
        .filter(entry => new Date(entry.date) >= startDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(entry => {
            balance += entry.amount;
            return {
                date: entry.date,
                balance
            };
        });

    res.json(timeline);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
