const User = require('../models/User');

exports.registerGet = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.loginGet = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerPost = async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  // preserve input on error
  res.saveFormData({ username });
  if (password !== confirmPassword) {
    res.formError('registerForm', 'Passwords do not match.');
    return res.redirect('/user/register');
  }
  try {
    const user = new User({ username, password });
    await user.save();
    // success feedback
    res.flash('success', 'Account created successfully. Please log in.');
    return res.redirect('/user/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.formError('registerForm', 'Registration failed. Please try again.');
    return res.redirect('/user/register');
  }
};

exports.loginPost = async (req, res) => {
  const { username, password } = req.body;
  // preserve input on error
  res.saveFormData({ username });
  try {
    const user = await User.findOne({ username }).exec();
    if (!user) {
      res.formError('loginForm', 'Invalid username or password.');
      return res.redirect('/user/login');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.formError('loginForm', 'Invalid username or password.');
      return res.redirect('/user/login');
    }
    req.session.userId = user._id;
    res.flash('success', 'Logged in successfully.');
    return res.redirect('/user/profile');
  } catch (error) {
    console.error('Error during login:', error);
    res.formError('loginForm', 'Login failed. Please try again.');
    return res.redirect('/user/login');
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