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
    if (!weight || isNaN(weight) || weight < 0) {
      return res.status(400).send('Valid weight is required');
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).redirect('/user/login');
    }

    const { today } = getTodayDateRange();

    // Check if weight has already been logged today
    const alreadyLogged = user.weights.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (!alreadyLogged) {
      user.weights.push({ value: parseFloat(weight), date: new Date() });
      await user.save();
    }

    return res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
};

exports.setCalorieGoalPost = async (req, res) => {
  try {
    const userId = checkAuth(req, res);
    if (!userId) return;

    const { calorieGoal } = req.body;
    if (!calorieGoal || calorieGoal < 0) {
      return res.status(400).send('Invalid calorie goal');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).redirect('/user/login');
    }

    user.dailyCalorieGoal = calorieGoal;
    await user.save();

    return res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.saveActivityPost = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { activityType, duration, burnedCalories } = req.body;
    if (!activityType || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process the activity
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the most recent weight entry
    let userWeight = user.weights && user.weights.length > 0
      ? user.weights[user.weights.length - 1].value
      : null;

    let calories;
    if (activityType.toLowerCase() === 'custom') {
      if (!burnedCalories) {
        return res.status(400).json({ error: 'Please provide calories burned for custom activity' });
      }
      calories = Number(burnedCalories);
    } else {
      if (!userWeight) {
        return res.status(400).json({ error: 'Please log your weight first to calculate calories burned' });
      }
      
      // Define MET values for known cardio activities
      const mets = {
        running: 9,
        cycling: 8,
        swimming: 8.5,
        walking: 3.8
      };
      
      const met = mets[activityType.toLowerCase()] || 5;
      calories = userWeight * met * (Number(duration) / 60).toFixed(0);
    }

    // Create and save the new activity record
    const newActivity = new Activity({
      user: userId,
      type: activityType,
      duration: Number(duration),
      caloriesBurned: calories
    });
    await newActivity.save();

    res.json({ success: true, activity: newActivity });
  } catch (error) {
    console.error('Error saving activity:', error);
    res.status(500).json({ error: 'Server error' });
  }
};