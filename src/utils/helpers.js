// Common utility functions for controllers

// Get today's date range (start of day to end of day)
exports.getTodayDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

// Check if user is authenticated
exports.checkAuth = (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect('/user/login');
    return null;
  }
  return userId;
};