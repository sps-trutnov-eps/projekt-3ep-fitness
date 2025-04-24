const express = require('express');
const router = express.Router();

// Require controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const progressController = require('../controllers/progressController');
const photoUpload = require('../middleware/photoUpload');

// Auth routes
router.get('/register', authController.registerGet);
router.post('/register', authController.registerPost);
router.get('/login', authController.loginGet);
router.post('/login', authController.loginPost);
router.get('/logout', authController.logoutGet);

// User profile routes
router.get('/profile', userController.profileGet);
router.post('/weight', userController.saveWeightPost);
router.post('/calorie-goal', userController.setCalorieGoalPost);
router.post('/activity', userController.saveActivityPost);

// Progress routes
router.post('/photo', photoUpload.single('photo'), progressController.uploadPhotoPost);
router.get('/show-progress', progressController.showProgressGet);

module.exports = router;