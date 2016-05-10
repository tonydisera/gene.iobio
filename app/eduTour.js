var pageGuide = null;
var pageGuideBookmarks = null;
var pageGuidePhenolyzer = null;
var pageGuideEduTour1 = null;
var pageGuideEduTour2 = null;

var eduTour1Steps = {
	'#edu-tour-label':                                  {index: 0, first: true, audio: '#tour1-recording1'},
	'#phenolyzer-search-box .selectize-control.single': {index: 1},
	'#phenolyzer-results':                              {index: 2, audio: '#tour1-recording2'},
	'#proband-variant-card #zoom-region-chart':         {index: 3, audio: '#tour1-recording3', height: '50px'},
	'#gene-badge-container':                            {index: 4 },
	'#feature-matrix .col:eq(0)':                       {index: 5, audio: '#tour1-recording4'},
	'#children-buttons':                                {index: 6 },
	'.edu-tour-1-child-buttons':                        {index: 7, audio: '#tour1-recording5', close: true}
};

var eduTour2Steps = {
	'#edu-tour-2-label': {
		index: 0, 
		first: true, 
		audio: '#tour2-recording1', 
		height: '400px', 
		animation: {
			clazz: 'EDGE-1020589079', 
			container: "tour2-animation1", 
			showFunction: showEduTourAnimationNew, 
			delay: 0}
	},
	'#feature-matrix .col:eq(2)':    {index: 1, audio: '#tour2-recording2'},
	'#button-load-john-data':        {index: 2},
	'#button-load-diego-data':       {index: 3},
	'#button-load-sarah-data':       {index: 4},
	'#edu-tour-2':                   {index: 5, audio: '#tour2-recording3', close: true}
};


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
						$(step.audio)[0].currentTime = 0;
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
				customizeEduTourStep(pageGuideEduTour1, step);

				
			}
	    }); 


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
						$(step.audio)[0].currentTime = 0;
					}
				}
			},
			'handle_doc_switch': function(currentTour, prevTour) {

				var step = eduTour2Steps[currentTour];
				customizeEduTourStep(pageGuideEduTour2, step);

			}
	    }); 

	    if (eduTourNumber == "1") {
	    	pageGuideEduTour1.open();
	    } else if (eduTourNumber = "2") {
	    	pageGuideEduTour2.open();	    	
	    }
	}

}


function customizeEduTourStep(pageGuide, step) {
	if (step.animation) {
		setTimeout( function() {step.animation.showFunction(true, step.animation.clazz, step.animation.container)}, step.animation.delay);
	} else {
		showEduTourAnimationNew(false);		
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
		// When audio finished, automatically move to next step
		$(audioSelector).on("ended", function() {
			if (!step.close && step.index == pageGuide.cur_idx) {
				pageGuide.navigateForward();
			}
		});			
	} else {
		$('#page-guide-listen-button').addClass('hide');										
	}
	if (step.first) {
		$('#pageguide-prev-button').addClass("hide");
	} else {
		$('#pageguide-prev-button').removeClass("hide");		
	}
	if (step.close) {
		$('#pageguide-close-button').removeClass("hide");
		$('#pageguide-next-button').addClass("hide");
	} else {
		$('#pageguide-close-button').addClass("hide");
		$('#pageguide-next-button').removeClass("hide");
	} 	
}

function eduTourCheckPhenolyzer() {
	$('#select-phenotype-edutour').selectize();
	$('#select-phenotype-edutour')[0].selectize.clear();
	$('#select-phenotype-edutour')[0].selectize.on('change', function() {
		var phenotype = $('#select-phenotype-edutour')[0].selectize.getValue().toLowerCase();
		var correct = true;
		if (isLevelEduTour && eduTourNumber == 1) {
			if (phenotype != 'colon_cancer') {
				alertify.error("Please select 'Colon cancer' to continue with this tour.")
				correct = false;
			}
		}
		if (correct) {
			genesCard.getPhenolyzerGenes(phenotype);
			if (eduTourNumber == 1  && pageGuideEduTour1.cur_idx == 1) {
				pageGuideEduTour1.navigateForward();
			}
			
		}
	});			
}

function eduTourCheckVariant(variant) {
	if (isLevelEduTour && eduTourNumber == "1" 
		&& pageGuideEduTour1.cur_idx == 4
		&& variant.vepImpact[HIGH] != "HIGH" 
		&& variant.start == 112116592 
		&& window.gene.gene_name == 'APC') {
		pageGuideEduTour1.navigateForward();
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

function showEduTourAnimationNew(show, clazz, container) {
	if (show) {
		$('#' + container).removeClass("hide");
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
		$('.tour-animation').addClass("hide");
		$('.tour-animation-container').addClass("hide");
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


