function WelcomePanel() {
  this.videoPlayer = null;

  this.videoStyle = "position:absolute;width:100%;height:100%;left:0";



  this.videoConfigs = {
    'screencast-intro': {
      src: "https://www.youtube.com/embed/ormbcpKfJ6w?autoplay=1&rel=0&ecver=2&start=0",
      videoId: 'ormbcpKfJ6w',
      width: 623,
      height: 369,
      frameborder: "0",
      allowfullscreen: ""
    },
    'screencast-getting-started': {
      src: "https://www.youtube.com/embed/5g5wT1xDCfY?autoplay=1&rel=0&ecver=2",
      videoId: '5g5wT1xDCfY',
      width: 623,
      height: 369,
      frameborder: "0",
      allowfullscreen: ""
    },
    'screencast-coverage-analysis': {
      src: "https://www.youtube.com/embed/4VG1au5txn0?autoplay=1&rel=0&ecver=2",
      videoId: '4VG1au5txn0',
      width: 623,
      height: 369,
      frameborder: "0",
      allowfullscreen: ""
    },
    'screencast-saving-analysis': {
      src: "https://www.youtube.com/embed/JlXoBlWvniE?autoplay=1&rel=0&ecver=2",
      videoId: 'JlXoBlWvniE',
      width: 623,
      height: 369,
      frameborder: "0",
      allowfullscreen: ""
    },
    'screencast-multi-gene-analysis': {
      src: "https://www.youtube.com/embed/QiJ7wuN8LYQ?autoplay=1&rel=0&ecver=2",
      videoId: 'QiJ7wuN8LYQ',
      width: 623,
      height: 369,
      frameborder: "0",
      allowfullscreen: ""
    }
  }

}

WelcomePanel.prototype.init = function() {
  $('#welcome-panel-placeholder').append(templateUtil.welcomePanelTemplate());
}

WelcomePanel.prototype.playVideo = function(videoName) {
  var me = this;

  var videoContainer = $('#' + videoName);
  var config = this.videoConfigs[videoName];
  var videoFrame = videoName + "-iframe-placeholder";

  // Hide the welcome panel and show the video panel
  $('#welcome-area').addClass('hide');
  $('#screencast-panel').removeClass('hide');
  $('.video-container').addClass('hide');

  videoContainer.removeClass('hide');

  // Load the video if the iframe doesn't exist
  if (videoContainer.find("iframe").length == 0) {

    me.videoPlayer = new YT.Player(videoFrame, {
      height: config.height,
      width: config.width,
      videoId: config.videoId,
      playerVars: {
        start: 0,
        ecver: 2,
        autoplay: 1
      },
      events: {
        'onReady': WelcomePanel.onPlayerReady,
        'onStateChange': WelcomePanel.onPlayerStateChange
      }
    });
  } else {
    me.videoPlayer.seekTo(0);
    me.videoPlayer.playVideo();
  }


}

WelcomePanel.onPlayerReady = function(event) {
  event.target.playVideo();
}

WelcomePanel.onPlayerStateChange = function() {
  var eventData = JSON.parse(event.data);
  if (eventData && eventData.hasOwnProperty("info")) {
    if (eventData.info == YT.PlayerState.ENDED) {
      $('#welcome-area').removeClass('hide');
      $('#screencast-panel').addClass('hide');
    }
  }

}

WelcomePanel.prototype.stopVideo = function(videoName) {
  var me = this;

  me.videoPlayer.pauseVideo();
  $('#welcome-area').removeClass('hide');
  $('#screencast-panel').addClass('hide');



}