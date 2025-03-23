const User = require('../models/User');

exports.registerGet = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.loginGet = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerPost = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', {
      title: 'Register',
      error: 'Passwords do not match.'
    });
  }

  try {
    const user = new User({ username, email, password });
    await user.save();
    res.redirect('/user/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.render('register', {
      title: 'Register',
      error: 'Registration failed. Please try again.'
    });
  }
};

exports.loginPost = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid username or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid username or password.'
      });
    }

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

exports.logoutGet = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Error destroying session:', error);
      return res.redirect('/user/profile');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};