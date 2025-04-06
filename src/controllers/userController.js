const User = require('../models/User');
const Activity = require('../models/Activity');
const { getTodayDateRange, checkAuth } = require('../utils/helpers');

// View-returning controllers
exports.profileGet = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    const { today, tomorrow } = getTodayDateRange();

    // Fetch today's activities
    const activities = await Activity.find({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const totalCaloriesBurned = activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0);
    
    // Prepare chart data
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

// Regular form submission controllers
exports.saveWeightPost = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    const { weight } = req.body;
    const weightValue = Number(weight);
    
    if (isNaN(weightValue) || weightValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid weight'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    const { today } = getTodayDateRange();

    // Check if weight has already been logged today
    const alreadyLogged = user.weights.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (alreadyLogged) {
      return res.status(400).json({
        success: false,
        message: 'You have already logged your weight today'
      });
    }

    // Save the weight entry
    user.weights.push({ value: weightValue, date: new Date() });
    await user.save();

    return res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

exports.setCalorieGoalPost = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    const { calorieGoal } = req.body;
    
    // Convert to number and check validity
    const goal = Number(calorieGoal);
    if (isNaN(goal) || goal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid calorie goal'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    user.dailyCalorieGoal = goal;
    await user.save();

    return res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

exports.saveActivityPost = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    console.log('Activity data received:', req.body); // Debug log

    const { activityType, duration, burnedCalories } = req.body;
    if (!activityType || !duration) {
      return res.status(400).json({ 
        success: false,
        message: 'Activity type and duration are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    // Calculate calories...
    let calories;
    let userWeight = user.weights && user.weights.length > 0
      ? user.weights[user.weights.length - 1].value
      : null;
      
    if (activityType.toLowerCase() === 'custom') {
      if (!burnedCalories || isNaN(Number(burnedCalories)) || Number(burnedCalories) <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Please provide a valid number of calories burned for custom activity'
        });
      }
      calories = Math.round(Number(burnedCalories));
    } else {
      if (!userWeight) {
        return res.status(400).json({ 
          success: false,
          message: 'Please log your weight first to calculate calories burned'
        });
      }
      
      // Define MET values for known cardio activities
      const mets = {
        running: 9,
        cycling: 8,
        swimming: 8.5,
        walking: 3.8
      };
      
      const met = mets[activityType.toLowerCase()] || 5;
      calories = Math.round(userWeight * met * (Number(duration) / 60));
    }

    // Create and save the new activity record
    const newActivity = new Activity({
      user: userId,
      type: activityType,
      duration: Number(duration),
      caloriesBurned: calories
    });
    await newActivity.save();

    return res.redirect('/user/profile');
  } catch (error) {
    console.error('Error saving activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};