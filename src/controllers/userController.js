

exports.registerGet = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.loginGet = (req, res) => {
  res.render('login', { title: 'Login' });
};

