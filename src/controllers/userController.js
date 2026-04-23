const User = require('../models/User');
const Activity = require('../models/Activity');
const { getTodayDateRange, checkAuth } = require('../utils/helpers');

// Kontrolery vracející pohledy (views)
exports.profileGet = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    const { today, tomorrow } = getTodayDateRange();

    // Načtení dnešních aktivit
    const activities = await Activity.find({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const totalCaloriesBurned = activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0);
    
    // Příprava dat pro graf
    const weightChartLabels = user.weights.map(entry => entry.date.toDateString());
    const weightChartData = user.weights.map(entry => entry.value);
    
    res.render('profile', { 
      title: 'Profile', 
      user, 
      activities,
      totalCaloriesBurned,
      weightChartLabels,
      weightChartData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Kontrolery pro běžné odesílání formulářů
exports.saveWeightPost = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    const { weight } = req.body;
    const weightValue = Number(weight);
    
    // Uložení dat formuláře pro případ chyby
    res.saveFormData({ weight });
    
    if (isNaN(weightValue) || weightValue <= 0) {
      res.formError('weightForm', 'Please enter a valid weight');
      return res.redirect('/user/profile');
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    const { today } = getTodayDateRange();

    // Kontrola, zda již byla váha dnes zaznamenána
    const alreadyLogged = user.weights.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (alreadyLogged) {
      res.formError('weightForm', 'You have already logged your weight today');
      return res.redirect('/user/profile');
    }

    // Uložení záznamu o váze
    user.weights.push({ value: weightValue, date: new Date() });
    await user.save();
    
    // Nastavení zprávy o úspěchu
    res.flash('success', 'Weight saved successfully!');
    
    return res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    res.formError('weightForm', 'Server error. Please try again.');
    return res.redirect('/user/profile');
  }
};

exports.setCalorieGoalPost = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    const { calorieGoal } = req.body;
    
    // Uložení dat formuláře pro případ chyby
    res.saveFormData({ calorieGoal });
    
    // Převod na číslo a kontrola platnosti
    const goal = Number(calorieGoal);
    if (isNaN(goal) || goal <= 0) {
      res.formError('calorieForm', 'Please enter a valid calorie goal');
      return res.redirect('/user/profile');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    user.dailyCalorieGoal = goal;
    await user.save();

    // Nastavení zprávy o úspěchu
    res.flash('success', 'Calorie goal saved successfully!');

    return res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    res.formError('calorieForm', 'Server error. Please try again.');
    return res.redirect('/user/profile');
  }
};

exports.saveActivityPost = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    const { activityType, duration, burnedCalories } = req.body;
    
    // Uložení dat formuláře pro případ chyby
    res.saveFormData({ activityType, duration, burnedCalories });
    
    if (!activityType || !duration) {
      res.formError('activityForm', 'Activity type and duration are required');
      return res.redirect('/user/profile');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    // Výpočet kalorií
    let calories;
    let userWeight = user.weights && user.weights.length > 0
      ? user.weights[user.weights.length - 1].value
      : null;
      
    if (activityType.toLowerCase() === 'custom') {
      if (!burnedCalories || isNaN(Number(burnedCalories)) || Number(burnedCalories) <= 0) {
        res.formError('activityForm', 'Please provide a valid number of calories burned for custom activity');
        return res.redirect('/user/profile');
      }
      calories = Math.round(Number(burnedCalories));
    } else {
      if (!userWeight) {
        res.formError('activityForm', 'Please log your weight first to calculate calories burned');
        return res.redirect('/user/profile');
      }
      
      // Definice hodnot MET pro známé kardio aktivity
      const mets = {
        running: 9,
        cycling: 8,
        swimming: 8.5,
        walking: 3.8
      };
      
      const met = mets[activityType.toLowerCase()] || 5;
      calories = Math.round(userWeight * met * (Number(duration) / 60));
    }

    // Vytvoření a uložení nového záznamu o aktivitě
    const newActivity = new Activity({
      user: userId,
      type: activityType,
      duration: Number(duration),
      caloriesBurned: calories,
      date: new Date()  // Zajistit nastavení data
    });
    await newActivity.save();

    // Nastavení zprávy o úspěchu
    res.flash('success', 'Activity logged successfully!');
    
    return res.redirect('/user/profile');
  } catch (error) {
    console.error('Error saving activity:', error);
    res.formError('activityForm', 'Server error. Please try again.');
    return res.redirect('/user/profile');
  }
};