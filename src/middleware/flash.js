/**
 * Middleware pro flash zprávy
 * Zpřístupňuje flash zprávy, chyby formulářů a zachovaná data formulářů pro šablony
 */
module.exports = (req, res, next) => {
  // Zpřístupnění flash zpráv pro šablony
  res.locals.flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;
  
  // Zpřístupnění chyb formulářů pro šablony
  res.locals.formErrors = req.session.formErrors;
  delete req.session.formErrors;
  
  // Zpřístupnění zachovaných dat formulářů pro šablony
  res.locals.formData = req.session.formData;
  delete req.session.formData;
  
  // Pomocná funkce pro nastavení flash zpráv z kontrolerů
  res.flash = function(type, message) {
    req.session.flashMessage = { type, message };
  };

  // Pomocná funkce pro nastavení chyb formulářů z kontrolerů  
  res.formError = function(form, message) {
    req.session.formErrors = { form, message };
  };
  
  // Pomocná funkce pro zachování dat formulářů mezi požadavky
  res.saveFormData = function(data) {
    req.session.formData = data;
  };
  
  next();
};