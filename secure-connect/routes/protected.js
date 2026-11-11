const express = require('express');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// koi bhi logged-in user
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json(user);
});

// sirf admin
router.get('/admin/users', verifyToken, isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json(users);
});

module.exports = router;