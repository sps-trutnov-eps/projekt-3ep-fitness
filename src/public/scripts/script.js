$(document).ready(function () {
    // Inicializace funkcionality flash zpráv
    initFlashMessages();
    
    // Funkcionalita výběru aktivity
    initActivityForm();
    
    // Kontrola, zda jsou chyby ve formuláři a zda má být zobrazen formulář aktivity
    handleFormErrors();
    
    // Zpracování obnovení pozice posunu (scroll)
    restoreScrollPosition();
    
    // Přidání obslužných rutin pro odeslání formuláře pro uložení pozice posunu
    setupFormScrollHandlers();
});

function initFlashMessages() {
  // Přidat událost kliknutí pro tlačítko zavření flash zprávy
  $(".flash-message button").on("click", function() {
    $(this).parent().fadeOut(300);
  });
  
  // Automatické skrytí flash zpráv po 5 sekundách
  setTimeout(function() {
    $(".flash-message").fadeOut(500);
  }, 5000);
}

function initActivityForm() {
  // Když je kliknuto na aktivitu, zobrazit formulář aktivity
  $("#activity-list li").on("click", function () {
    var activityType = $(this).data("type");
    $("#activityType").val(activityType);
    $("#selected-activity").text(
      activityType.charAt(0).toUpperCase() + activityType.slice(1)
    );
    
    // Pro vlastní (custom) aktivitu zobrazit pole navíc
    if (activityType.toLowerCase() === "custom") {
      $("#customCalories").show();
    } else {
      $("#customCalories").hide();
    }
    
    $("#activity-form").show();
  });
}

function handleFormErrors() {
  // Pokud máme chyby ve formuláři aktivity, zobrazit formulář
  if (window.hasActivityFormError) {
    $("#activity-form").show();
    
    // Pokud máme uložené informace o typu aktivity, obnovit stav formuláře
    if (window.savedActivityType) {
      const activityType = window.savedActivityType;
      // obnovit skrytý vstup, aby odeslání fungovalo
      $("#activityType").val(activityType.toLowerCase());
      $("#selected-activity").text(
        activityType.charAt(0).toUpperCase() + activityType.slice(1)
      );
      
      // V případě potřeby zobrazit pole pro vlastní kalorie
      if (window.isCustomActivity) {
        $("#customCalories").show();
      } else {
        $("#customCalories").hide();
      }
    }
  }
}

function setupFormScrollHandlers() {
  // Přidat obslužnou rutinu události odeslání ke všem formulářům
  $('form').on('submit', function() {
    // Uložit aktuální pozici posunu do sessionStorage (dočasnější než localStorage)
    sessionStorage.setItem('scrollPosition', window.scrollY);
    
    // Také uložit ID odeslaného formuláře
    sessionStorage.setItem('submittedFormId', this.id);
    
    // Uložit stav pro formulář aktivity
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
        // existující kód: obnovit a zobrazit formulář v případě chyby
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
        // zavřít formulář po úspěšném odeslání
        $('#activity-form').hide();
      }
    }

    // Vymazat hodnoty ze session storage po použití
    setTimeout(() => {
      sessionStorage.removeItem('scrollPosition');
      sessionStorage.removeItem('submittedFormId');
      sessionStorage.removeItem('selectedActivity');
      sessionStorage.removeItem('isCustomActivity');
    }, 1000);
  }
}