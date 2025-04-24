$(document).ready(function () {
    // When an activity is clicked, show the activity form.
    $("#activity-list li").on("click", function () {
      var activityType = $(this).data("type");
      $("#activityType").val(activityType);
      $("#selected-activity").text(
        activityType.charAt(0).toUpperCase() + activityType.slice(1)
      );
      // For custom activity, show extra field.
      if (activityType.toLowerCase() === "custom") {
        $("#customCalories").show();
      } else {
        $("#customCalories").hide();
      }
      $("#activity-form").show();
    });

    // AJAX: Submit the activity form.
    $("#activityForm").on("submit", function (e) {
      e.preventDefault();
      $.ajax({
        url: "/user/activity",
        method: "POST",
        data: $(this).serialize(),
        success: function (response) {
          alert("Activity saved successfully.");
          // Optionally, update the UI with new activity data.
          location.reload();
        },
        error: function (xhr) {
          var errMsg =
            xhr.responseJSON && xhr.responseJSON.error
              ? xhr.responseJSON.error
              : "Error saving activity";
          alert(errMsg);
        },
      });
    });
  });