$(document).ready(function () {
    // Initialize flash message functionality
    initFlashMessages();
    
    // Activity selection functionality
    initActivityForm();
    
    // Check if there are form errors and the activity form should be shown
    handleFormErrors();
    
    // Handle scroll position restoration
    restoreScrollPosition();
    
    // Add form submission handlers to save scroll position
    setupFormScrollHandlers();
});

function initFlashMessages() {
  // Add click event for flash message close button
  $(".flash-message button").on("click", function() {
    $(this).parent().fadeOut(300);
  });
  
  // Auto-hide flash messages after 5 seconds
  setTimeout(function() {
    $(".flash-message").fadeOut(500);
  }, 5000);
}

function initActivityForm() {
  // When an activity is clicked, show the activity form
  $("#activity-list li").on("click", function () {
    var activityType = $(this).data("type");
    $("#activityType").val(activityType);
    $("#selected-activity").text(
      activityType.charAt(0).toUpperCase() + activityType.slice(1)
    );
    
    // For custom activity, show extra field
    if (activityType.toLowerCase() === "custom") {
      $("#customCalories").show();
    } else {
      $("#customCalories").hide();
    }
    
    $("#activity-form").show();
  });
}

function handleFormErrors() {
  // If we have activity form errors, show the form
  if (window.hasActivityFormError) {
    $("#activity-form").show();
    
    // If we have saved activity type info, restore the form state
    if (window.savedActivityType) {
      const activityType = window.savedActivityType;
      // restore hidden input so submission works
      $("#activityType").val(activityType.toLowerCase());
      $("#selected-activity").text(
        activityType.charAt(0).toUpperCase() + activityType.slice(1)
      );
      
      // Show custom calories field if needed
      if (window.isCustomActivity) {
        $("#customCalories").show();
      } else {
        $("#customCalories").hide();
      }
    }
  }
}

function setupFormScrollHandlers() {
  // Add submit event handler to all forms
  $('form').on('submit', function() {
    // Save the current scroll position in sessionStorage (more temporary than localStorage)
    sessionStorage.setItem('scrollPosition', window.scrollY);
    
    // Also save the form ID that was submitted
    sessionStorage.setItem('submittedFormId', this.id);
    
    // Save form state for activity form
    if (this.id === 'activityForm') {
      sessionStorage.setItem('selectedActivity', $('#selected-activity').text());
      sessionStorage.setItem('isCustomActivity', $('#customCalories').is(':visible'));
    }
  });
}

function restoreScrollPosition() {
  if (sessionStorage.getItem('scrollPosition')) {
    const savedPosition = parseInt(sessionStorage.getItem('scrollPosition'));
    const submittedFormId = sessionStorage.getItem('submittedFormId');
    window.scrollTo(0, savedPosition);

    if (submittedFormId === 'activityForm') {
      if (window.hasActivityFormError) {
        // existing code: restore and show form on error
        const selectedActivity = sessionStorage.getItem('selectedActivity');
        const isCustomActivity = sessionStorage.getItem('isCustomActivity') === 'true';
        if (selectedActivity) {
          $('#activity-form').show();
          $('#activityType').val(selectedActivity.toLowerCase());
          $('#selected-activity').text(selectedActivity);
          if (isCustomActivity) {
            $('#customCalories').show();
          } else {
            $('#customCalories').hide();
          }
        }
      } else {
        // close form on successful submission
        $('#activity-form').hide();
      }
    }

    // Clear the session storage values after use
    setTimeout(() => {
      sessionStorage.removeItem('scrollPosition');
      sessionStorage.removeItem('submittedFormId');
      sessionStorage.removeItem('selectedActivity');
      sessionStorage.removeItem('isCustomActivity');
    }, 1000);
  }
}