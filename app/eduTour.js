var pageGuide = null;
var pageGuideBookmarks = null;
var pageGuidePhenolyzer = null;
var pageGuideEduTour1 = null;
var pageGuideEduTour2 = null;

function initializeTours() {
    if (!isLevelEdu) {
	    // Initialize app tour
		pageGuide = tl.pg.init({ 
			'auto_refresh': true, 
			'custom_open_button': '#show-main-tour',
			'steps_element': '#tourMain',
			'track_events_cb': function(interactionName) {
				
			},
			'handle_doc_switch': function(currentTour, prevTour) {
				
			}
	    }); 
 	   // Initialize bookmarks tour
 		pageGuideBookmarks = tl.pg.init({ 
			'auto_refresh': true, 
			'custom_open_button': '#show-bookmarks-tour',
			'steps_element': '#tourBookmarks',
			'track_events_cb': function(interactionName) {
				
			},
			'handle_doc_switch': function(currentTour, prevTour) {
			}
	    });     	
 
        // Initialize phenolyzer tour
    	pageGuidePhenolyzer = tl.pg.init({ 
			'auto_refresh': true, 
			'custom_open_button': '#show-phenolyzer-tour',
			'steps_element': '#tourPhenolyzer',
			'track_events_cb': function(interactionName) {
				
			},
			'handle_doc_switch': function(currentTour, prevTour) {
			}
	    }); 

    }

 
	// Initialize colon cancer tour
	if (isLevelEdu) {
	    var eduTour1Steps = {
	    	'#edu-tour-label':    {audio: '#audio-test'},
	    	'#phenolyzer-search-box .selectize-control.single':    {},
	    	'#phenolyzer-results':         {audio: '#audio-test'},
	    	'#proband-variant-card #zoom-region-chart':  {audio: '#audio-test', height: '150px'},
//	    	'#proband-variant-card #zoom-region-chart':  {audio: '#audio-test', height: '150px', animation: {name: 'gene-model-animation', showFunction: showEduTourAnimation, delay:0}},
	    	'#gene-badge-container':       {},
	    	'#feature-matrix .col:eq(0)':  {audio: '#audio-bird'},
	    	'#children-buttons':           {},
	    	'.edu-tour-1-child-buttons':   {audio: '#audio-bird', close: true}
	    };
		pageGuideEduTour1 = tl.pg.init({ 
			'auto_refresh': true, 
			'custom_open_button': '#show-case1-tour',
			'steps_element': '#tourEduCase1',
			'track_events_cb': function(interactionName) {	

				if (interactionName == "PG.close") {
					completeTour();
				}

				for (key in eduTour1Steps) {
					var step = eduTour1Steps[key];
					if (step.audio) {
						$(step.audio)[0].pause();
					}
				}
			},
			'handle_doc_switch': function(currentTour, prevTour) {


				if (currentTour == '.edu-tour-1-child-buttons') {
					$('.edu-tour-1-child-buttons .edu-tour-button:eq(0)').addClass("emphasize");
					$('.edu-tour-1-child-buttons .edu-tour-button:eq(2)').addClass("emphasize");
				} else {
					$('.edu-tour-1-child-buttons .edu-tour-button').removeClass("emphasize");
				}

				var step = eduTour1Steps[currentTour];
				customizeEduTourStep(step);

				
			}
	    }); 

	    var eduTour2Steps = {
	    	'#edu-tour-2-label':             {audio: '#audio-test', height: '400px', animation: {name: 'EDGE-1020589079', showFunction: showEduTourAnimationNew, delay: 0}},
	    	'#feature-matrix .col:eq(2)':    {audio: '#audio-test'},
	    	'#button-load-john-data':        {},
	    	'#button-load-diego-data':       {},
	    	'#button-load-sarah-data':       {},
	    	'#edu-tour-2':                   {audio: '#audio-test', close: true}
	    };

		pageGuideEduTour2 = tl.pg.init({ 
			'auto_refresh': true, 
			'custom_open_button': '#show-case2-tour',
			'steps_element': '#tourEduCase2',
			'track_events_cb': function(interactionName) {
				if (interactionName == "PG.close") {
					completeTour();
				}
				for (key in eduTour2Steps) {
					var step = eduTour2Steps[key];
					if (step.audio) {
						$(step.audio)[0].pause();
					}
				}
			},
			'handle_doc_switch': function(currentTour, prevTour) {

				var step = eduTour2Steps[currentTour];
				customizeEduTourStep(step);

			}
	    }); 

	    if (eduTourNumber == "1") {
	    	pageGuideEduTour1.open();
	    } else if (eduTourNumber = "2") {
	    	pageGuideEduTour2.open();	    	
	    }
	}

}


function customizeEduTourStep(step) {
	if (step.animation) {
		setTimeout( function() {step.animation.showFunction(true, step.animation.name)}, step.animation.delay);
	} else {
		showEduTourAnimation(false);		
	}
	if (step.dialog) {
		$('#edu-tour-modal').modal('show');
	} else {
		$('#edu-tour-modal').modal("hide");
	}
	if (step.height) {
		$('#tlyPageGuideMessages .tlypageguide_text').css("min-height", step.height);
	} else {
		$('#tlyPageGuideMessages .tlypageguide_text').css("min-height", "10px");					
	}
	if (step.audio) {
		var audioSelector = step.audio;
		$(audioSelector)[0].play();					
	} else {
		$('#page-guide-listen-button').addClass('hide');										
	}
	if (step.close) {
		$('#pageguide-close-button').removeClass("hide");
		$('#pageguide-next-button').addClass("hide");
	} else {
		$('#pageguide-close-button').addClass("hide");
		$('#pageguide-next-button').removeClass("hide");
	} 	
}

function onEduTour1Check(checkbox) {
	var answer   = { "jimmy": true, "bobby": false, "sarah": true};
	var name     = checkbox[0].id;
	var checked  = checkbox[0].checked
	var answerLabel = $('#' + name + "-answer");
	// If the correct answer is "true"
	if (answer[name] == true) {
		if (answer[name] == checked) {
			answerLabel.css("visibility", "visible");	
		} else {
			answerLabel.css("visibility", "hidden");	
		}
	} else {
		if (answer[name] == checked) {
			answerLabel.css("visibility", "hidden");	
		} else {
			answerLabel.css("visibility", "visible");	
		}

	}
}

function showEduTourAnimation(show, id) {
	if (show) {
		$('#' + id).removeClass("hide");
		var canvas = document.getElementById(id);
		var exportRoot = new lib.genemodel();

		var stage = new createjs.Stage(canvas);
		stage.addChild(exportRoot);
		stage.update();

		createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.addEventListener("tick", stage);	
	} else {
		$('.edu-tour-animation').addClass("hide");
	}
		
}

function showEduTourAnimationNew(show, clazz) {
	if (show) {
		$('.' + clazz).removeClass("hide");

		AdobeEdge.loadComposition('anim-test-v1', clazz, {
		    scaleToFit: "both",
		    centerStage: "both",
		    	minW: "0px",
			    maxW: "undefined",
			    width: "1460px",
			    height: "468px"
		}, {"dom":{}}, {"dom":{}});	

	} else {
		$('.edu-tour-animation').addClass("hide");
	}
 
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
    if (idleTime > MAX_IDLE) {
    	idlePrompting = true; 
    	// If the user hasn't pressed continue in the next x seconds, restart the app.
		setInterval(restartApp, IDLE_RESTART);  //

    	
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
		
		if (isSelfContainedServer) {
			startOver();
		}
	}
}

function startOver() {
	if (isLevelEdu) {
		window.location.href = EXHIBIT_URL;
	} else {
		window.location.reload();
	}
}
function completeTour() {
	if (isLevelEdu) {
		var completedTour = getUrlParameter("completedTour");
		var url = null;
		if (completedTour != null && completedTour != "") {
			url = EXHIBIT_URL2;
		} else {
			url = EXHIBIT_URL1 + '?tour=' + (eduTourNumber == 1 ? 2 : 1) + '&completedTour=' + eduTourNumber;
		}
		window.location.href = url;
	} 
}


