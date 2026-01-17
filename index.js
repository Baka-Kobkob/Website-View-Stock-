const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ការកំណត់ទំហំទិន្នន័យសម្រាប់រូបភាព Screenshot ធំៗ
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- ១. ការតភ្ជាប់ទៅកាន់ Database ---
// ប្រើ Link MongoDB របស់អ្នក
const MONGO_URI = "mongodb+srv://Bakakobkobkob:683ad7f53006c056d4e753c4@cluster2.0sppllw.mongodb.net/ChatApp2026?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB ✅"))
    .catch(err => console.error("Database Connection Error ❌:", err));

// --- ២. ការបង្កើត Schema (ទម្រង់ទិន្នន័យ) ---

// Schema សម្រាប់តម្លៃ និង Logo
const ConfigSchema = new mongoose.Schema({
    logoText: { type: String, default: "NEXTOPUP" },
    prices: [{ amount: String, price: String }]
});
const Config = mongoose.model('Config', ConfigSchema);

// Schema សម្រាប់រក្សាទុកការកុម្ម៉ង់ (Orders)
const OrderSchema = new mongoose.Schema({
    username: String,    // ID & Zone
    telegram_id: String, // ព័ត៌មានកញ្ចប់ Diamond
    avatar: String,      // រូបភាពវិក្កយបត្រ (Base64)
    status: { type: String, default: "Pending" },
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// --- ៣. API ROUTES ---

// ក. សម្រាប់ Home Page & Admin ទាញយកតម្លៃ
app.get('/api/config', async (req, res) => {
    try {
        const data = await Config.findOne();
        res.json(data || { logoText: "NEXTOPUP", prices: [] });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ខ. សម្រាប់ Admin Update តម្លៃ និង Logo
app.post('/api/admin/update', async (req, res) => {
    const { logoText, prices, adminKey } = req.body;
    
    // ត្រួតពិនិត្យលេខសម្ងាត់ Admin
    if (adminKey !== "112233") {
        return res.status(401).json({ success: false, message: "Admin Key មិនត្រឹមត្រូវ!" });
    }

    try {
        const updated = await Config.findOneAndUpdate(
            {}, 
            { logoText, prices }, 
            { upsert: true, new: true }
        );
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// គ. សម្រាប់អតិថិជនផ្ញើការកុម្ម៉ង់ (Submit Order)
app.post('/api/update-user', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.json({ success: true, message: "Order Sent Successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ឃ. សម្រាប់ Admin មើលបញ្ជីអ្នកទិញ (Order List)
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// បើកដំណើរការ Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`);
});
