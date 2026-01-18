const express = require('express');
const cors = require('cors'); // សំខាន់បំផុត៖ ដើម្បីឱ្យ Link ផ្សេងហៅប្រើបាន
const axios = require('axios');
const app = express();

// កំណត់ទំហំទិន្នន័យឱ្យធំដើម្បីអាចទទួលរូបភាពវិក្កយបត្របាន
app.use(express.json({ limit: '50mb' }));
app.use(cors()); // បើកសិទ្ធិឱ្យ tigerstore.vercel.app អាចទាញទិន្នន័យបាន

// នេះគឺជាកន្លែងផ្ទុកទិន្នន័យ (បណ្ដោះអាសន្ន)
let db = {
    products: [
        { id: 1, name: "86 💎", cost: 0.8, price: 1.10 },
        { id: 2, name: "172 💎", cost: 1.6, price: 2.15 }
    ],
    orders: []
};

// 1. API សម្រាប់ឱ្យវេបសាយ Store ទាញយកតម្លៃពេជ្រទៅបង្ហាញ
app.get('/api/data', (req, res) => {
    res.json(db);
});

// 2. API សម្រាប់ឱ្យវេបសាយ Store ឆែកឈ្មោះ (MLBB Nickname)
app.get('/api/check-id', async (req, res) => {
    const { uid, zid } = req.query;
    try {
        const url = `https://api.isan.eu.org/nickname/ml?id=${uid}&zone=${zid}`;
        const response = await axios.get(url);
        res.json({ 
            success: response.data.success, 
            username: response.data.name 
        });
    } catch (e) {
        res.json({ success: false });
    }
});

// 3. API សម្រាប់ឱ្យវេបសាយ Store បញ្ជូន Order និងរូបភាពមកផ្ទុកក្នុង Admin
app.post('/api/orders', (req, res) => {
    const newOrder = { 
        id: Date.now(), 
        ...req.body, 
        date: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh' }) 
    };
    db.orders.unshift(newOrder); // បញ្ចូលទៅលើគេបង្អស់
    res.json({ success: true, order: newOrder });
});

// 4. API សម្រាប់ Admin Panel ខ្លួនឯងបន្ថែម ឬកែតម្លៃពេជ្រ
app.post('/api/products', (req, res) => {
    const p = req.body;
    if (p.id) {
        const idx = db.products.findIndex(i => i.id === p.id);
        if (idx > -1) db.products[idx] = { ...db.products[idx], ...p };
    } else {
        db.products.push({ ...p, id: Date.now() });
    }
    res.json({ success: true });
});

module.exports = app;
