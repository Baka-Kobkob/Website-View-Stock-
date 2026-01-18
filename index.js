const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));

// ទិន្នន័យបណ្តោះអាសន្ន (បើចង់ឱ្យនៅជាប់រហូត ១០០% ត្រូវប្រើ Database)
let db = {
    config: { logo: "", qr: "" },
    products: [
        { id: 1, name: "86 💎", cost: 0.8, price: 1.1, sold: 5 }
    ],
    orders: []
};

// API សម្រាប់ទាញទិន្នន័យ
app.get('/api/data', (req, res) => res.json(db));

// API សម្រាប់ Add ផលិតផល
app.post('/api/products', (req, res) => {
    const p = req.body;
    if (p.id) {
        const idx = db.products.findIndex(i => i.id === p.id);
        if (idx > -1) db.products[idx] = { ...db.products[idx], ...p };
    } else {
        db.products.push({ ...p, id: Date.now(), sold: 0 });
    }
    res.json({ success: true });
});

module.exports = app;
