const jwt = require('jsonwebtoken');
const User = require('./models/User');
const appEvents = require('./events');

// handshake se token nikalta hai (auth object ya cookie)
function getSocketToken(socket) {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    return socket.handshake.auth.token;
  }

  const cookieHeader = socket.handshake.headers.cookie || '';
  const tokenCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('token='));

  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

module.exports = (io) => {
  // connection se pehle JWT verify
  io.use(async (socket, next) => {
    const token = getSocketToken(socket);
    if (!token) {
      return next(new Error('No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = { id: user._id, username: user.username };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.join('general');
    console.log(`${socket.id} joined room general`);

    socket.on('chat message', (text) => {
      if (!text || !text.trim()) return;

      console.log(`[general] ${socket.user.username}: ${text}`);

      io.to('general').emit('chat message', {
        user: socket.user.username,
        text: text,
        time: new Date().toISOString()
      });
      appEvents.emit('chat:message', { user: socket.user.username, text });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};