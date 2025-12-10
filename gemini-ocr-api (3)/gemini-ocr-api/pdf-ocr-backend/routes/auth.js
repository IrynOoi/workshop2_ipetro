const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

/**
 * Authentication Routes
 * All routes prefixed with /auth
 */
// Register (NEW)
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Check Authentication Status
router.get('/me', authController.checkAuth);


// NEW: Profile Routes
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);

module.exports = router;