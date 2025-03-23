const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getTodayDateRange, checkAuth } = require('../utils/helpers');

exports.uploadPhotoPost = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;
    
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).redirect('/user/login');
    }

    // Check if a photo was already uploaded today
    const { today } = getTodayDateRange();
    const alreadyUploaded = user.photos && user.photos.some(photo => {
      const photoDate = new Date(photo.date);
      photoDate.setHours(0, 0, 0, 0);
      return photoDate.getTime() === today.getTime();
    });

    if (alreadyUploaded) {
      return res.status(400).send('You have already uploaded a photo today.');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads/photos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write the file to disk
    fs.writeFileSync(filePath, req.file.buffer);

    // Ensure the photos array exists
    if (!user.photos) {
      user.photos = [];
    }

    // Add photo reference to user
    user.photos.push({ imagePath: fileName, date: new Date() });
    await user.save();

    return res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
};

exports.showProgressGet = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }
    
    // Prepare chart data for weights
    const weightChartLabels = user.weights.map(entry => entry.date.toDateString());
    const weightChartData = user.weights.map(entry => entry.value);
    
    res.render('showProgress', { 
      title: 'My Progress', 
      user, 
      photos: user.photos, 
      weightChartLabels, 
      weightChartData 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};