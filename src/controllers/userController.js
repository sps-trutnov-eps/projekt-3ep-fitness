const User = require('../models/User');

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
    
    res.render('profile', { title: 'Profile', user });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.render('/', { 
      title: 'Home' 
    });
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

    // Získáme dnešní datum nastavené na půlnoc
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyLogged = user.weights.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (alreadyLogged) {
      return res.render('profile', { 
        title: 'Profile', 
        user, 
        error: 'You have already logged your weight for today.' 
      });
    }

    // Přidání nové váhy
    user.weights.push({ value: weight, date: new Date() });
    await user.save();

    res.render('profile', { title: 'Profile', user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
