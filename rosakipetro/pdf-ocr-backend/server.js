const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Import Routes
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- SESSION CONFIGURATION ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secret_key_change_this_later',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// --- STATIC FILES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- AUTHENTICATION MIDDLEWARE ---
const protect = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).sendFile(path.join(__dirname, 'public', '403.html'));
    }
};

// --- PROTECTED PAGE ROUTES ---
// NEW: Dashboard Route
app.get('/dashboard.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'dashboard.html'));
});

app.get('/test.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'test.html'));
});

app.get('/equipment.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'equipment.html'));
});

app.get('/inspectionplan.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'inspectionplan.html'));
});

// NEW: Profile page (accessible to all authenticated users)
app.get('/profile.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'profile.html'));
});

// NEW: Users management page (admin only)
app.get('/users.html', protect, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'users.html'));
});

// --- PROTECTED STATIC RESOURCES ---
app.get('/private/sidebar.js', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'sidebar.js'));
});

app.get('/private/menu.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'menu.html'));
});

// --- API & AUTH ROUTES ---
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard.html'); // Redirect to dashboard on login
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        error: {
            message: process.env.NODE_ENV === 'production' 
                ? 'Internal server error' 
                : err.message
        }
    });
});

// --- 404 HANDLER ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: { message: 'Route not found' }
    });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   iPETRO - RBIMS Core System          ║
║   Server Status: ONLINE               ║
║   Port: ${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}          ║
╚═══════════════════════════════════════╝
    `);
});

// --- GRACEFUL SHUTDOWN ---
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
    });
});