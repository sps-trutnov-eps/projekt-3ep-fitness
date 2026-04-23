// Společné pomocné funkce pro kontrolery

// Získat rozsah data pro dnešek (začátek dne do konce dne)
exports.getTodayDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

// Zkontrolovat, zda je uživatel autentizován
exports.checkAuth = (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect('/user/login');
    return null;
  }
  return userId;
};