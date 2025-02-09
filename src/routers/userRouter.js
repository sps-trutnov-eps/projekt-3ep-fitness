const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/register', userController.registerGet);
router.get('/login', userController.loginGet);

module.exports = router;