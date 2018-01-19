class Timeout {
  constructor(path, startOverFunc) {
    this.path = path;
    this.startOver = startOverFunc;
    this.idlePrompting = null;
    this.idleTime = null;
  }

  checkForInactivity() {
    let me = this;
    //Increment the idle time counter every second.
    var idleInterval = setInterval(me._timerIncrement, IDLE_INTERVAL, me);

    //Zero the idle timer on mouse movement.
    $(window).mousemove(function (e) {
        me.idleTime = 0;
    });
    $(window).keypress(function (e) {
        me.idleTime = 0;
    });

  }

  _timerIncrement(me) {
    if (me.idlePrompting) {
      return;
    }
      // If we are on the exhibit welcome page, no need for timeout
      if (location.pathname.indexOf(me.path) >= 0) {
          me.idleTime = 0;
          return;
      }
      // If the video is playing, don't check for inactivity
      if ($('#video-container').length > 0 && !$('#video-container').hasClass("hide")) {
          me.idleTime = 0;
          return;
      }
      // If an animation is playing, don't check for inactivity
      if ($('.tour-animation-container').length > 0) {
          var hideCount = 0;
          $('.tour-animation-container').each(function() {
              if ($(this).hasClass("hide")) {
                  hideCount++;
              }
          });
          // If an animation container is shown (not all are hidden)
          // we reset the idle.
          if (hideCount < $('.tour-animation-container').length ) {
              me.idleTime = 0;
              return;

          }
      }


      me.idleTime = me.idleTime + 1;
      if (me.idleTime > MAX_IDLE ) {
        me.idlePrompting = true;
        // If the user hasn't pressed continue in the next x seconds, restart the app.
        setTimeout(me.forceRestartApp, IDLE_RESTART);  //


        //alertify.set({ buttonReverse: true });
        alertify.defaults.glossary.ok = "Yes, I want to continue.";
        alertify.alert("Warning",
        "This app will restart in 10 seconds unless there is activity. Do you want to continue?",
        function () {
          // okay
          me.idleTime = 0;
          me.idlePrompting = false;
        });
      }
  }

  restartApp() {
    let me = this;
    if (me.idleTime > MAX_IDLE) {
      //window.location.reload();
      me.startOver();
    }
  }

  forceRestartApp() {
    let me = this;
    me.startOver();
  }


}
