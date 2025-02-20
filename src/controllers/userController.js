const User = require('../models/User');
const Activity = require('../models/Activity');

exports.registerGet = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.loginGet = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerPost = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.render('register', {
      title: 'Register',
      error: 'Passwords do not match.'
    });
  }

  try {
    // Create and save the new user.
    // The schema's pre-save hook will handle hashing the password.
    const user = new User({ username, email, password });
    await user.save();

    // Redirect to login page after successful registration.
    res.redirect('/user/login');
  } catch (error) {
    console.error('Error during registration:', error);
    // Optionally pass error details to your view to inform the user.
    res.render('register', {
      title: 'Register',
      error: 'Registration failed. Please try again.'
    });
  }
};

exports.loginPost = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid username or password.'
      });
    }

    // Compare the supplied password with the hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid username or password.'
      });
    }

    // If password is matched, login is successful. Store user details in session and redirect to profile page.
    req.session.userId = user._id;

    res.redirect('/user/profile');

  } catch (error) {
    console.error('Error during login:', error);
    res.render('login', {
      title: 'Login',
      error: 'Login failed. Please try again.'
    });
  }
};

exports.profileGet = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/user/login');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/user/login');
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's activities
    const activities = await Activity.find({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const totalCaloriesBurned = activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0);

    res.render('profile', { 
      title: 'Profile', 
      user, 
      activities, // Pass activities to EJS
      totalCaloriesBurned
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};



exports.saveWeight = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).redirect('/user/login');
    }

    const { weight } = req.body;
    if (!weight) {
      return res.status(400).send('Weight is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).redirect('/user/login');
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if weight has already been logged today
    const alreadyLogged = user.weights.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (alreadyLogged) {
      const activities = await Activity.find({
        user: userId,
        date: { $gte: today, $lt: tomorrow }
      });

      const totalCaloriesBurned = activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0);

      return res.render('profile', { 
        title: 'Profile', 
        user, 
        totalCaloriesBurned,
        activities,
        error: 'You have already logged your weight for today.' 
      });
    }

    // Add new weight entry
    user.weights.push({ value: weight, date: new Date() });
    await user.save();

    const activities = await Activity.find({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const totalCaloriesBurned = activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0);

    res.render('profile', { title: 'Profile', user, totalCaloriesBurned, activities });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.setCalorieGoal = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).redirect('/user/login');
    }

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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's activities
    const activities = await Activity.find({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const totalCaloriesBurned = activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0);

    res.render('profile', { title: 'Profile', user, totalCaloriesBurned, activities });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


exports.logoutGet = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Error destroying session:', error);
      // Optionally redirect back to profile if session destroy fails
      return res.redirect('/user/profile');
    }
    // Clear the cookie set by the session middleware
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
exports.saveActivity = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { activityType, duration, burnedCalories } = req.body;
    if (!activityType || !duration) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the most recent weight entry if exists.
    let userWeight = user.weights && user.weights.length > 0
      ? user.weights[user.weights.length - 1].value
      : null;

    let calories;
    if (activityType.toLowerCase() === 'custom') {
      if (!burnedCalories) {
        return res.status(400).json({ error: 'Please provide the calories burned for custom activity' });
      }
      calories = Number(burnedCalories);
    } else {
      if (!userWeight) {
        return res.status(400).json({ error: 'Please log your weight first to calculate calories burned' });
      }
      // Define MET values for known cardio activities.
      const mets = {
        running: 9,
        cycling: 8,
        swimming: 8.5,
        walking: 3.8
      };
      // Default MET if not found
      const met = mets[activityType.toLowerCase()] || 5;
      // Calculate burned calories: weight (kg) * MET * (duration in hours)
      calories = userWeight * met * (Number(duration) / 60);
    }

    // Create and save the new activity record.
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