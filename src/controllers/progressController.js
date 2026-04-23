const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getTodayDateRange, checkAuth } = require('../utils/helpers');

exports.uploadPhotoPost = async (req, res) => {
  try {
    // Kontrola autentizace - přesměrování, pokud uživatel není přihlášen
    const userId = checkAuth(req, res);
    if (!userId) return;
    
    if (!req.file) {
      res.formError('photoForm', 'No file uploaded');
      return res.redirect('/user/profile');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    // Kontrola, zda již byla fotografie dnes nahrána
    const { today } = getTodayDateRange();
    const alreadyUploaded = user.photos && user.photos.some(photo => {
      const photoDate = new Date(photo.date);
      photoDate.setHours(0, 0, 0, 0);
      return photoDate.getTime() === today.getTime();
    });

    if (alreadyUploaded) {
      res.formError('photoForm', 'You have already uploaded a photo today');
      return res.redirect('/user/profile');
    }

    // Vytvoření adresáře pro nahrávání, pokud neexistuje
    const uploadsDir = path.join(__dirname, '../../uploads/photos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generování unikátního názvu souboru
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Zápis souboru na disk
    fs.writeFileSync(filePath, req.file.buffer);

    // Zajistit, aby pole photos existovalo
    if (!user.photos) {
      user.photos = [];
    }

    // Přidání odkazu na fotografii k uživateli
    user.photos.push({ imagePath: fileName, date: new Date() });
    await user.save();

    // Nastavení zprávy o úspěchu
    res.flash('success', 'Photo uploaded successfully!');

    return res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    res.formError('photoForm', 'Server error. Please try again.');
    return res.redirect('/user/profile');
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
    
    // Příprava dat pro graf váhy
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
    res.flash('error', 'Unable to load progress. Please try again.');
    return res.redirect('/user/profile');
  }
};