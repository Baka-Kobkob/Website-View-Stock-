const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));

// ទិន្នន័យគំរូដំបូង
let initialData = {
    config: { logo: "", qr: "" },
    products: [
        { id: 1, name: "86 💎", cost: 0.80, price: 1.10, sold: 10 },
        { id: 2, name: "172 💎", cost: 1.60, price: 2.15, sold: 5 }
    ],
    orders: [
        { id: 101, playerID: "556677", product: "86 💎", price: 1.10, date: "2024-05-22" }
    ]
};

app.get('/api/data', (req, res) => res.json(initialData));

// បង្កើត API សម្រាប់ទទួលយកការ Save (Vercel Serverless)
app.post('/api/save', (req, res) => {
    res.json({ success: true, message: "Data received" });
});

module.exports = app;
