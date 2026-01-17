
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ១. កំណត់ Socket.io ឱ្យដំណើរការជាមួយ CORS
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e7 // អនុញ្ញាតឱ្យផ្ញើ File រហូតដល់ 10MB (រូបភាព/សំឡេង)
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // បង្កើនទំហំ JSON សម្រាប់រូបភាព base64

// ២. ភ្ជាប់ទៅ MongoDB Atlas
const MONGO_URI = "mongodb+srv://Bakakobkobkob:683ad7f53006c056d4e753c4@cluster2.0sppllw.mongodb.net/ChatApp2026?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas ✅"))
    .catch(err => console.error("MongoDB Error ❌", err));

// ៣. បង្កើត Schema សម្រាប់ User (បន្ថែមសមត្ថភាពរក្សារូបភាព Profile)
const UserSchema = new mongoose.Schema({
    telegram_id: { type: String, unique: true }, // ប្រើជា Access Code
    username: { type: String, unique: true },
    avatar: { type: String, default: "" }, // ទុកជា base64 string
    friends: [String], // ទុកឈ្មោះមិត្តភក្តិ
    balance: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

// ៤. API Routes
app.post('/api/update-user', async (req, res) => {
    try {
        const { id, username, avatar } = req.body;
        const user = await User.findOneAndUpdate(
            { telegram_id: id },
            { username, avatar },
            { upsert: true, new: true }
        );
        res.json({ status: "success", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// ៥. ប្រព័ន្ធ Real-time Chat (Socket.io)
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // ចូលទៅក្នុងបន្ទប់ Chat ផ្តាច់មុខ (Private Room)
    socket.on('join_room', (roomID) => {
        socket.join(roomID);
        console.log(`User joined room: ${roomID}`);
    });

    // ទទួល និងបញ្ជូនសារ (អក្សរ, រូបភាព, ឬសំឡេង)
    socket.on('send_message', (data) => {
        // data រួមមាន: room, sender, message, type (text/image/voice)
        io.to(data.room).emit('receive_message', {
            sender: data.sender,
            message: data.message,
            type: data.type,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// បង្ហាញ index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Master Server running on port ${PORT} 🚀`));

module.exports = app;
