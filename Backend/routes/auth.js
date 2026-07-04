const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// User Registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, 'user'),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, 'user'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Registration (One time setup utility or hidden route)
router.post('/admin/setup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const adminExists = await Admin.findOne({ username });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const admin = await Admin.create({ username, password });
    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      token: generateToken(admin._id, 'admin'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id, 'admin'),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
