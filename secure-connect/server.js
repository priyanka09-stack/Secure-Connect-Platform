require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
require('./socket')(io);

app.use(express.json());
app.use(express.static('public'));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const protectedRoutes = require('./routes/protected');
app.use('/api', protectedRoutes);


const noteRoutes = require('./routes/notes');
app.use('/api/notes', noteRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => console.log('[db] MongoDB connected')).catch((err) => console.log('[db] connection error:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});