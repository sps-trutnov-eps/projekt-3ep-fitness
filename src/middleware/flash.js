/**
 * Flash message middleware
 * Makes flash messages, form errors and preserved form data available to templates
 */
module.exports = (req, res, next) => {
  // Make flash messages available to templates
  res.locals.flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;
  
  // Make form errors available to templates
  res.locals.formErrors = req.session.formErrors;
  delete req.session.formErrors;
  
  // Make preserved form data available to templates
  res.locals.formData = req.session.formData;
  delete req.session.formData;
  
  // Helper function to set flash messages from controllers
  res.flash = function(type, message) {
    req.session.flashMessage = { type, message };
  };

  // Helper function to set form errors from controllers  
  res.formError = function(form, message) {
    req.session.formErrors = { form, message };
  };
  
  // Helper function to preserve form data between requests
  res.saveFormData = function(data) {
    req.session.formData = data;
  };
  
  next();
};