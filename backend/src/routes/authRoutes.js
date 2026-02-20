const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/*
 * Authentication routes
 *
 * These routes handle user registration and login. They are mounted
 * under the /api/v1/auth prefix in src/index.js. Registration is
 * open to all users, while login returns a JWT token on success.
 */

// Register a new user
router.post('/register', authController.register);

// Log in an existing user
router.post('/login', authController.login);

module.exports = router;