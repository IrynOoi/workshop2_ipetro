const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import Controllers
const equipmentController = require('../controllers/EquipmentController');
const inspectionController = require('../controllers/InspectionController');
const adminController = require('../controllers/AdminController');
const userController = require('../controllers/UserController');
const dashboardController = require('../controllers/dashboardController');

/**
 * API Routes
 * All routes prefixed with /api
 */

// --- MULTER CONFIGURATION (File Uploads) ---

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../public/uploads');
const profileUploadDir = path.join(__dirname, '../public/uploads/profiles');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(profileUploadDir)) {
    fs.mkdirSync(profileUploadDir, { recursive: true });
}

// Equipment image storage
const equipmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Profile picture storage
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profileUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const equipmentUpload = multer({
    storage: equipmentStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const profileUpload = multer({
    storage: profileStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- DASHBOARD ROUTES ---
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/export-master', dashboardController.exportMasterData);

// --- EQUIPMENT ROUTES ---
router.get('/equipment', equipmentController.getEquipment);
router.get('/equipment-list', equipmentController.getEquipmentList);
router.get('/equipment-parts/:equipment_id', equipmentController.getEquipmentParts);
router.post('/add-equipment', equipmentUpload.single('image'), equipmentController.addEquipment);
router.put('/edit-equipment/:id', equipmentUpload.single('image'), equipmentController.editEquipment);
router.delete('/delete-equipment/:equipment_id', equipmentController.deleteEquipment);

// --- INSPECTION ROUTES ---
router.get('/inspection-history', inspectionController.getInspectionHistory);
router.get('/inspection-details/:id', inspectionController.getInspectionDetails);
router.get('/inspection-plan/:id', inspectionController.getInspectionPlan);
router.post('/save-data', inspectionController.saveData);
router.post('/extract-data', inspectionController.extractData);
router.delete('/inspection/:id', inspectionController.deleteInspection);

// --- ADMIN USER MANAGEMENT ROUTES ---
router.get('/admin/users', adminController.getAllUsers);
router.post('/admin/users', adminController.createUser);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);

// --- USER PROFILE ROUTES ---
router.get('/user/profile', userController.getProfile);
router.put('/user/profile', profileUpload.single('profile_picture'), userController.updateProfile);

module.exports = router;