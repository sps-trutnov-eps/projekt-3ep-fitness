const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/register', userController.registerGet);
router.post('/register', userController.registerPost);

router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);

router.get('/logout', userController.logoutGet);

router.get('/profile', userController.profileGet);

router.post('/weight', userController.saveWeight);

router.post('/calorie-goal', userController.setCalorieGoal);

router.post('/activity', userController.saveActivity);
module.exports = router;