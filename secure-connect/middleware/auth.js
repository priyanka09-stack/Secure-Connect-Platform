const jwt = require('jsonwebtoken');

// token ko header ya cookie se nikalta hai
function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  // cookie-parser allowed nahi hai, isliye manually padh rahe hain
  const cookieHeader = req.headers.cookie || '';
  const tokenCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('token='));

  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

// Protected route ke liye: valid JWT chahiye
function verifyToken(req, res, next) {
  const token = getToken(req);

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// RBAC: sirf admin ko allow karta hai
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
}

module.exports = { verifyToken, isAdmin };