var IDLE_INTERVAL = 3000;  // (in milliseconds) Check for inactivity every 5 seconds 
var MAX_IDLE      = 40;    // After 2 minute (e.g. 3 * 40 seconds), prompt the user about inactivity
var IDLE_RESTART  = 10000; // (in milliseconds) Automatically restart app in no prompt action taken after 10 seconds
var idleTime = 0;
var idlePrompting = false;
var EXHIBIT_URL             = 'exhibit.html'


$(document).ready(function() {
	$.material.init();
	$("#exhibit-video").on("ended", function() {
		hideVideo();   	
		showCaseStudies();	
	});
	checkForInactivity();
});

function showVideo() {
	$('#video-container').removeClass('hide');
	$('#start-here').addClass('hide');
	$('h1').addClass('hide');
	$('h2').addClass('hide');
	playVideo();
}
function hideVideo() {
	$('#video-container').addClass('hide');
	$('#start-here').removeClass('hide');	
	$('h1').removeClass('hide');
	$('h2').removeClass('hide');
}
function playVideo() {
	$("#exhibit-video")[0].play();
	$("#play").addClass("disabled")
	$("#pause").removeClass("disabled")
	$("#stop").removeClass("disabled")
}
function pauseVideo() {
	$("#exhibit-video")[0].pause();
	$("#play").removeClass("disabled")
	$("#pause").addClass("disabled")
	$("#stop").removeClass("disabled")
}
function stopVideo() {
	$("#exhibit-video")[0].pause();
	hideVideo();
	$("#play").removeClass("disabled")
	$("#pause").addClass("disabled")
	$("#stop").removeClass("disabled")
}
function showCaseStudy(tourNumber) {
	var url = "../gene.iobio?tour=" + tourNumber;
	window.location.href = url;
}
function showNewCaseStudy() {
	var url = "../gene.iobio?tour=" + getUrlParameter("tour") + '&completedTour=' + getUrlParameter("completedTour");
	window.location.href = url;
}
function showCaseStudies() {
	var url = "exhibit-cases.html"
	window.location.href = url;
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    var hits = {};
    for (var i = 0; i < sURLVariables.length; i++) 
    {    	
        var sParameterName = sURLVariables[i].split('=');        
        if (typeof sParam == 'string' || sParam instanceof String) {
	        if (sParameterName[0] == sParam) 
	        {
	            return sParameterName[1];
	        }
	    } else {
	    	var matches = sParameterName[0].match(sParam);
	    	if ( matches != undefined && matches.length > 0 ) {
	    		hits[sParameterName[0]] = sParameterName[1];
	    	}
	    }
    }
    if (Object.keys(hits).length == 0)
    	return undefined;
    else
    	return hits;
}

function checkForInactivity() {
 	//Increment the idle time counter every second.
    var idleInterval = setInterval(timerIncrement, IDLE_INTERVAL); 

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });	
}

function timerIncrement() {
	if (idlePrompting) {
		return;
	}
    idleTime = idleTime + 1;
    if (idleTime > MAX_IDLE && !$('#video-container').hasClass("hide")) {
    	idlePrompting = true; 
    	// If the user hasn't pressed continue in the next x seconds, restart the app.
		setTimeout(restartApp, IDLE_RESTART);  //

    	
    	//alertify.set({ buttonReverse: true });
    	alertify.defaults.glossary.ok = "Yes, I want to continue.";
		alertify.alert("Warning", 
			"This app will restart in 10 seconds unless there is activity. Do you want to continue?", 
			function () {
				// okay
				idleTime = 0;
			    idlePrompting = false;
			}			
		 );

        
    }
}

function restartApp() {
	if (idleTime > MAX_IDLE) {
		//window.location.reload();
		startOver();
	}
}

function startOver() {

	window.location.href = EXHIBIT_URL;
}