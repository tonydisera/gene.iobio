var pageGuide = null;
var pageGuideBookmarks = null;
var pageGuidePhenolyzer = null;
var pageGuideEduTour1 = null;
var pageGuideEduTour2 = null;
var edgeObject = null;

var eduTour1Steps = {
	'#edu-tour-label':                                  {index: 0, first: true, noElement: true, 
		audio: '#tour1-recording1',
		height: 'full', 		
		animation: {
			name: 'use-case01-scene01-v2', 
			clazz: 'EDGE-462912531',
		    width: "1200px",
		    height: "468px",
			container: "animation-container-1", 
			showFunction: showEduTourAnimationNew, 
			delay: 0}
		},
	'#phenolyzer-search-box .selectize-control.single': {index: 1, disableNext: true, correct: false},
	'#phenolyzer-results':                              {index: 2, 
		audio: '#tour1-recording2'
	},
	'#proband-variant-card #zoom-region-chart':         {index: 3, audio: '#tour1-recording3', height: '50px'},
	'#gene-badge-container':                            {index: 4, disableNext: true, correct: false},
	'rect.HIGH.stop_gained':                            {index: 5, audio: '#tour1-recording4'},
	'#children-buttons':                                {index: 6, disableNext: true, correct: false},
	'.edu-tour-1-child-buttons':                        {index: 7, close: true, noElement: true,
		audio: '#tour1-recording5', 
		height: 'full', 		
		animation: {
			name: 'use-case01-scene07-v1', 
			clazz: 'EDGE-462912531',
		    width: "1200px",
		    height: "468px",
			container: "animation-container-1", 
			showFunction: showEduTourAnimationNew, 
			delay: 0}
		}	
};

var eduTour2Steps = {
	'#edu-tour-2-label': { index: 0, first: true, noElement: true, audio: '#tour2-recording1',
	    height: 'full',
		animation: {
			name: 'use-case02-scene01-v1', 
			clazz: 'EDGE-462912531',
			width: "1200px",
		    height: "468px",
			container: "animation-container-1", 
			showFunction: showEduTourAnimationNew, 
			delay: 0
		}
	},
	'#edu-tour-2 #start-over':       {index: 1, noElement: true, audio: '#tour2-recording2',
	    height: 'full',
		animation: {
					name: 'use-case02-scene02-v1', 
					clazz: 'EDGE-462912531',
					width: "1200px",
				    height: "468px",
					container: "animation-container-1", 
					showFunction: showEduTourAnimationNew, 
					delay: 0
				}
		},
	'#proband-variant-card #vcf-track':      {index: 2, noElement: true},
	'#child-buttons-tour2':          {index: 3, disableNext: true, correct: false},
	'#edu-tour-2':                   {index: 4, noElement: true, audio: '#tour2-recording3', close: true}
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
					$('#button-load-father-data').addClass("emphasize");
					$('.edu-tour-1-child-buttons .edu-tour-button:eq(0)').addClass("emphasize");
					$('.edu-tour-1-child-buttons .edu-tour-button:eq(1)').addClass("healthy");
					$('.edu-tour-1-child-buttons .edu-tour-button:eq(2)').addClass("emphasize");
				} else {
					$('.edu-tour-1-child-buttons .edu-tour-button').removeClass("emphasize");
					$('.edu-tour-1-child-buttons .edu-tour-button').removeClass("healthy");
					$('#button-load-father-data').removeClass("emphasize");
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

				if (currentTour == "#proband-variant-card #vcf-track") {
					var variant = getProbandVariantCard().model.vcfData.features[2];
					var tooltip = getProbandVariantCard().d3CardSelector.select("#vcf-variants .tooltip");
					getProbandVariantCard().showTooltip(tooltip, variant, getProbandVariantCard(), false );
					getProbandVariantCard().showVariantCircle(variant, getProbandVariantCard());
				}

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
	if (step.noElement == true) {
		$('.tlypageguide_shadow')[step.index].style.visibility = 'hidden';
	} else {
		$('.tlypageguide_shadow')[step.index].style.visibility = 'visible';
	}

	if (step.disableNext == true && step.correct == false) {
		$('.pageguide-next').addClass("disabled");
	} else {
		$('.pageguide-next').removeClass("disabled");		
	}
	if (step.height) {
		if (step.height == 'full') {
			var stepHeight = window.innerHeight - 140;
			$('#tlyPageGuideMessages .tlypageguide_text').css("min-height", stepHeight);
		} else {
			$('#tlyPageGuideMessages .tlypageguide_text').css("min-height", step.height);
		}
	} else {
		$('#tlyPageGuideMessages .tlypageguide_text').css("min-height", "10px");					
	}
	if (step.animation) {
		setTimeout( function() {
			step.animation.showFunction(true, step)}, 
			step.animation.delay);
	} else {
		showEduTourAnimationNew(false);		
	}
	if (step.dialog) {
		$('#edu-tour-modal').modal('show');
	} else {
		$('#edu-tour-modal').modal("hide");
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

	if (step.animation  && isSelfContainedServer) {
		$('#pageguide-next-button').addClass("hide");
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
			eduTour1Steps['#phenolyzer-search-box .selectize-control.single'].correct = true;
			genesCard.getPhenolyzerGenes(phenotype);
			if (eduTourNumber == 1  && pageGuideEduTour1.cur_idx == 1) {
				pageGuideEduTour1.navigateForward();
			}
			
		} else {
			eduTour1Steps['#phenolyzer-search-box .selectize-control.single'].correct = false;
		}
	});			
}

function eduTourCheckVariant(variant) {
	if (isLevelEduTour && eduTourNumber == "1" 
		&& pageGuideEduTour1.cur_idx == 4
		&& variant.vepImpact[HIGH] != "HIGH" 
		&& variant.start == 112116592 
		&& window.gene.gene_name == 'APC') {
		eduTour1Steps['#gene-badge-container'].correct = true;			
		pageGuideEduTour1.navigateForward();
	} else {
		eduTour1Steps['#gene-badge-container'].correct = false;			

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
	if ($('#jimmy')[0].checked == answer['jimmy']
		&& $('#bobby')[0].checked == answer['bobby']
		&& $('#sarah')[0].checked == answer['sarah']) {
		eduTour1Steps['#children-buttons'].correct = true;	
		setTimeout(function() {
			pageGuideEduTour1.navigateForward();
		}, 2000);
	} else {
		eduTour1Steps['#children-buttons'].correct = false;			
	}
}

function onEduTour2Check(checkbox) {
	var answer   = { "john": 'lower', "diego": 'lowest', "anna": 'normal'};
	var checkboxId       = checkbox[0].id;
	var tokens  = checkboxId.split("-");
	var name    = tokens[0];
	var dosage  = tokens[1];
	var checked          = checkbox[0].checked
	var answerLabel      = $('#' + checkboxId + "-answer");
	var allAnswerLabels  = $('.' + name + "-answer");
	var allCheckboxes    = $('.' + name + "-checkbox");

	allCheckboxes.each(function(i,val) {
		if ($(this)[0].id == checkboxId) {

		} else {
			$(this)[0].checked = false;
		}
	})
	
	// Show if the answer is correct or incorrect
	allAnswerLabels.addClass("hide");
	if (checked) {
		answerLabel.removeClass("hide");	
	} else {
		answerLabel.addClass("hide");	
	}

	var correctCount = 0;
	for (var key in answer) {
		var dosage = answer[key];
		var selector = "#" + key + "-" + dosage;
		if ($(selector)[0].checked) {
			correctCount++;
		}
	}

	var stepSelector = '#child-buttons-tour2';
	if (correctCount == 3) {
		eduTour2Steps[stepSelector].correct = true;	
		//pageGuideEduTour2.navigateForward();
		$('#pageguide-next-button').removeClass("disabled");
	} else {
		eduTour2Steps[stepSelector].correct = false;	
		$('#pageguide-next-button').addClass("disabled");
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

function showEduTourAnimationNew(show, step) {
	if (show) {


		$('#' + step.animation.container).removeClass("hide");

		if (step.animation.edgeObject && step.animation.edgeObject.getStage()) {
			step.animation.edgeObject.getStage().play(0);
		} else {

			
			AdobeEdge.loadComposition(
				step.animation.name, 
				step.animation.clazz, {
				    scaleToFit: "both",
				    centerStage: "both",
				    minW: "0px",
				    maxW: "800px",
				    width:  step.animation.width,
				    height: step.animation.height
				}, 
				{"dom":{}}, 
				{"dom":{}}
			);
			step.animation.edgeObject = AdobeEdge.getComposition(step.animation.clazz);
		/*
			AdobeEdge.Symbol.bindElementAction(step.animation.clazz, step.animation.name, "document", "compositionReady", 
				function(sym, e) {
					alert('trigger');

				});
			var stage = $(step.animation.edgeObject.getStage());
			var rescale = '.5';
			stage.scale(.5);
		*/
			/*
			stage.css('transform', 'scale(' + rescale + ')');
			stage.css( '-o-transform', 'scale(' + rescale + ')');
			stage.css('-ms-transform', 'scale(' + rescale + ')');
			stage.css('-webkit-transform', 'scale(' + rescale + ')');
			stage.css('-moz-transform', 'scale(' + rescale + ')');
			stage.css('-o-transform', 'scale(' + rescale + ')');
			*/

		}

		return edgeObject;


	} else {
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


