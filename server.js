const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // សម្រាប់រូបភាពទំហំធំ

// តភ្ជាប់ទៅ MongoDB (ប្រើ Local ឬ Atlas)
mongoose.connect('mongodb+srv://Apiadmin:<mongodb1999mongodb>@apiadmin.wgvem6w.mongodb.net/?appName=Apiadmin')
    .then(() => console.log("Database Connected!"))
    .catch(err => console.log(err));

// Schema សម្រាប់ផ្ទុកទិន្នន័យ
const portfolioSchema = new mongoose.Schema({
    skills: { python: Number, html: Number, js: Number, node: Number },
    projects: [{ title: String, cat: String, img: String }]
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// API ទាញទិន្នន័យ
app.get('/api/data', async (req, res) => {
    let data = await Portfolio.findOne();
    if (!data) data = { skills: { python: 0, html: 0, js: 0, node: 0 }, projects: [] };
    res.json(data);
});

// API រក្សាទុកទិន្នន័យ
app.post('/api/save', async (req, res) => {
    let data = await Portfolio.findOne();
    if (data) {
        data.skills = req.body.skills;
        data.projects = req.body.projects;
        await data.save();
    } else {
        data = new Portfolio(req.body);
        await data.save();
    }
    res.json({ status: "success" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
