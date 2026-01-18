const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));

// ទិន្នន័យបណ្ដោះអាសន្ន
let db = {
    config: { logo: "", qr: "" },
    products: [
        { id: 1, name: "86 💎", cost: 0.80, price: 1.10, sold: 10 },
        { id: 2, name: "172 💎", cost: 1.60, price: 2.15, sold: 5 }
    ],
    orders: [
        { playerID: "123456", product: "86 💎", date: "2024-05-22", price: 1.10 }
    ]
};

app.get('/api/data', (req, res) => res.json(db));

app.post('/api/products', (req, res) => {
    const p = req.body;
    const index = db.products.findIndex(i => i.id === p.id);
    if (index > -1) {
        db.products[index] = { ...db.products[index], ...p };
    } else {
        db.products.push({ ...p, id: Date.now(), sold: 0 });
    }
    res.json({ success: true });
});

app.post('/api/config', (req, res) => {
    db.config = { ...db.config, ...req.body };
    res.json({ success: true });
});

module.exports = app;
