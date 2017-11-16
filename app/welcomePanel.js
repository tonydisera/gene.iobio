function WelcomePanel() {

	this.videoStyle = "position:absolute;width:100%;height:100%;left:0";



	this.videoConfigs = {
		'screencast-intro': {
			src: "https://www.youtube.com/embed/ormbcpKfJ6w?autoplay=1&rel=0&ecver=2&start=0",
			width: 480,
			height: 369,
			frameborder: "0",
			allowfullscreen: ""
		},
		'screencast-getting-started': {
			src: "https://www.youtube.com/embed/5g5wT1xDCfY?autoplay=1&rel=0&ecver=2",
			width: 480,
			height: 369,
			frameborder: "0",
			allowfullscreen: ""
		},
		'screencast-coverage-analysis': {
			src: "https://www.youtube.com/embed/4VG1au5txn0?autoplay=1&rel=0&ecver=2",
			width: 480,
			height: 369,
			frameborder: "0",
			allowfullscreen: ""
		},
		'screencast-saving-analysis': {
			src: "https://www.youtube.com/embed/JlXoBlWvniE?autoplay=1&rel=0&ecver=2",
			width: 480,
			height: 369,
			frameborder: "0",
			allowfullscreen: ""
		},
		'screencast-multi-gene-analysis': {
			src: "https://www.youtube.com/embed/QiJ7wuN8LYQ?autoplay=1&rel=0&ecver=2",
			width: 480,
			height: 369,
			frameborder: "0",
			allowfullscreen: ""
		}
	}
}

WelcomePanel.prototype.init = function() {
	$('#welcome-panel-placeholder').append(welcomePanelTemplate());
}

WelcomePanel.prototype.playVideo = function(videoName) {
	var me = this;

	var videoContainer = $('#' + videoName);
	var config = this.videoConfigs[videoName];

	// Load the video if the iframe doesn't exist
	if (videoContainer.find("iframe").length == 0) {
		var iframe = $("<iframe/>",
		{
			"class":           "screencast-video",
			"src":             config.src,
			"frameborder":     config.frameborder,
			"allowfullscreen": config.allowfullscreen,
			"style":           me.videoStyle
		});
		iframe.attr("width", config.width);
		iframe.attr("height", config.height);

		videoContainer.find(".iframe-placeholder").append(iframe);
	}


	// Hide the welcome panel and show the video panel
	$('#welcome-area').addClass('hide');
	$('#screencast-panel').removeClass('hide');
	$('.video-container').addClass('hide');
	videoContainer.removeClass('hide');

}

WelcomePanel.prototype.stopVideo = function(videoName) {
	var me = this;

	var videoContainer = $('#' + videoName);
	$('#welcome-area').removeClass('hide');
	$('#screencast-panel').addClass('hide');

	// TODO - Should be able to stop video AND audio.
	// Until this is figured out, just deleting iframe
	// instead as a workaround.
	//videoContainer.find('.screencast-video').stop();
	videoContainer.find("iframe").remove();


}