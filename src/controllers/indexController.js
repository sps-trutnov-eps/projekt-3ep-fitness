exports.index = (req, res) => {
  const loggedIn = !!req.session.userId;
  res.render('index', { title: 'Home Page', loggedIn });
};
