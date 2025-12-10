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
        secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
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

app.get('/profile.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'profile.html'));
});



// --- PROTECTED PAGE ROUTES ---
app.get('/test.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'test.html'));
});

app.get('/equipment.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'equipment.html'));
});

app.get('/inspectionplan.html', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'inspectionplan.html'));
});

// --- API & AUTH ROUTES ---
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/test.html');
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
    server.close(() => {
        console.log('HTTP server closed');
    });
});