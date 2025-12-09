const db = require('../config/db');
const bcrypt = require('bcryptjs');
/**
 * Authentication Controller
 * Handles user login, logout, and session management
 */

/**
 * Register Handler
 * @route POST /auth/register
 */
exports.register = async (req, res) => {
    const { username, password, role } = req.body;

    // Default to 'user' if role is not provided
    const userRole = (role === 'admin') ? 'admin' : 'user';

    try {
        // 1. Check if user already exists
        const userCheck = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // 2. Insert new user DIRECTLY (No Hashing)
        // This saves the password exactly as typed (e.g., "123456")
        const newUser = await db.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING user_id, username, role, created_at',
            [username, password, userRole]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

/**
 * Login Handler
 * @route POST /auth/login
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if user exists
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1', 
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const user = result.rows[0];

        // 2. Check Password
        if (password === user.password) {
            
            // 3. Save session
            req.session.user = {
                id: user.user_id,
                username: user.username,
                role: user.role || 'user'
            };

            // Save session before sending response
            req.session.save(err => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Session error' 
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Login successful',
                    redirect: '/test.html', 
                    user: req.session.user 
                });
            });

        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid password' 
            });
        }

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

/**
 * Logout Handler
 * @route POST /auth/logout
 */
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: "Logout failed" 
            });
        }
        res.clearCookie('connect.sid'); 
        res.json({ success: true, redirect: '/' });
    });
};

/**
 * Check Authentication Status
 * @route GET /auth/me
 */
exports.checkAuth = (req, res) => {
    if (req.session.user) {
        res.json({ 
            success: true,
            isAuthenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ 
            success: false,
            isAuthenticated: false 
        });
    }
};