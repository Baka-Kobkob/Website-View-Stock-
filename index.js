const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ១. តភ្ជាប់ MongoDB
const MONGO_URI = "mongodb+srv://Bakakobkobkob:683ad7f53006c056d4e753c4@cluster2.0sppllw.mongodb.net/ChatApp2026?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI);

// ២. Schema សម្រាប់រក្សាទុកទិន្នន័យ
const Config = mongoose.model('Config', new mongoose.Schema({
    logoText: { type: String, default: "BLUE" },
    prices: { type: Array, default: [] }
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    userId: String, zoneId: String, amount: String, price: Number,
    payment: String, date: { type: Date, default: Date.now }
}));

// --- API ROUTES ---

// ទាញយក Config (សម្រាប់ Web A និង Admin)
app.get('/api/config', async (req, res) => {
    const data = await Config.findOne();
    res.json(data || { logoText: "BLUE", prices: [] });
});

// Update Config (ពី Admin)
app.post('/api/admin/update', async (req, res) => {
    const { logoText, prices, adminKey } = req.body;
    if (adminKey !== "112233") return res.status(401).send("Key ខុស!");
    await Config.findOneAndUpdate({}, { logoText, prices }, { upsert: true });
    res.json({ success: true });
});

// ទាញយករបាយការណ៍លក់សរុប (ពី Admin)
app.get('/api/orders/summary', async (req, res) => {
    const orders = await Order.find().sort({ date: -1 });
    const totalRevenue = orders.reduce((sum, item) => sum + (item.price || 0), 0);
    res.json({
        totalOrders: orders.length,
        totalRevenue: totalRevenue.toFixed(2)
    });
});

module.exports = app;
