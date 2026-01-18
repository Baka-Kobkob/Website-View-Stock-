const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// បញ្ចូល MongoDB URL របស់អ្នក (បានកែសម្រួល Password រួចរាល់)
const mongoURI = "mongodb+srv://Apiadmin:mongodb1999mongodb@apiadmin.wgvem6w.mongodb.net/tigerstore?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB!"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// បង្កើត Schema សម្រាប់រក្សាទុកក្នុង Database
const Product = mongoose.model('Product', { 
    name: String, 
    cost: Number, 
    price: Number 
});

const Order = mongoose.model('Order', { 
    player: String, 
    id: String, 
    product: String, 
    price: String, 
    receipt: String, 
    date: String 
});

// 1. API សម្រាប់ទាញទិន្នន័យពី Database
app.get('/api/data', async (req, res) => {
    try {
        const products = await Product.find();
        const orders = await Order.find().sort({ _id: -1 }); // យក Order ថ្មីមកមុន
        res.json({ products, orders });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. API សម្រាប់ Add ឬ Edit ផលិតផល
app.post('/api/products', async (req, res) => {
    try {
        const p = req.body;
        if (p.id) {
            // បើមាន ID គឺវា Update
            await Product.findByIdAndUpdate(p.id, p);
        } else {
            // បើអត់ទេ គឺវាថែមថ្មី
            const newProduct = new Product(p);
            await newProduct.save();
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// 3. API សម្រាប់ទទួល Order ពី Store
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order({ 
            ...req.body, 
            date: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh' }) 
        });
        await order.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// 4. API សម្រាប់ឆែកឈ្មោះ
app.get('/api/check-id', async (req, res) => {
    const { uid, zid } = req.query;
    try {
        const url = `https://api.isan.eu.org/nickname/ml?id=${uid}&zone=${zid}`;
        const response = await axios.get(url);
        res.json({ success: response.data.success, username: response.data.name });
    } catch (e) { res.json({ success: false }); }
});

module.exports = app;
