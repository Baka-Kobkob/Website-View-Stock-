const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// ភ្ជាប់ទៅ MongoDB Atlas
const MONGO_URI = "mongodb+srv://Bakakobkobkob:683ad7f53006c056d4e753c4@cluster2.0sppllw.mongodb.net/?appName=Cluster2";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas ✅"))
    .catch(err => console.error("MongoDB Connection Error ❌", err));

// បង្កើត Schema សម្រាប់ User
const User = mongoose.model('User', new mongoose.Schema({
    telegram_id: { type: Number, unique: true },
    username: String,
    balance: { type: Number, default: 0 }
}));

// API សម្រាប់ Bot ផ្ញើទិន្នន័យមក (POST)
app.post('/api/update-user', async (req, res) => {
    try {
        const { id, username } = req.body;
        const user = await User.findOneAndUpdate(
            { telegram_id: id },
            { username: username },
            { upsert: true, new: true }
        );
        res.json({ status: "success", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API សម្រាប់ Website ទាញយកទិន្នន័យ (GET)
app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// បង្ហាញឯកសារ index.html នៅលើទំព័រមុខ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// បើក Server (សម្រាប់ប្រើក្នុង Local test)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
