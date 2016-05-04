//
// Global Variables
//


// Engine for gene search suggestions
var gene_engine = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  local: [],
  limit: 20
});

// Handlebar templates
var dataCardEntryTemplate = null;
var variantCardTemplate = null;
var filterCardTemplateHTML = null;
var genesCardTemplateHTML = null;
var bookmarkTemplateHTML = null;
var examineTemplateHTML = null;
var recallTemplateHTML = null;
var helpTemplateHTML = null;
var eduTourTemplateHTML = null;
var iconbarTemplate = null;
var tourTemplate = null;


// The selected (sub-) region of the gene.  Null
// when there is not an active selection.
var regionStart = null;
var regionEnd = null;
var GENE_REGION_BUFFER = 1000;
var GENE_REGION_BUFFER_MAX = 50000;

// Genes
var gene = '';
var geneNames = [];
var phenolyzerGenes = [];
var geneObjects = {};
var geneAnnots = {};
var genePhenotypes = {};
var geneToLatestTranscript = {};
var genesToCache = [];

var loadedUrl = false;


// Transcript data and chart
var selectedTranscript = null;
var selectedTranscriptCodingRegions = [];
var transcriptChart =  null;
var transcriptViewMode = "single";
var transcriptMenuChart = null;
var transcriptPanelHeight = null;
var transcriptCollapse = true;
var geneSource = "gencode";

var firstTimeGeneLoaded = true;
var firstTimeShowVariants = true;


var bookmarkCard = new BookmarkCard();

// data card
var dataCard = new DataCard();

// filter card
var filterCard = new FilterCard();

// genes card
var genesCard = new GenesCard();

// examine variant card
var examineCard = new ExamineCard();

// matrix card
var matrixCard = new MatrixCard();


// clicked variant
var clickedVariant = null;


// Format the start and end positions with commas
var formatRegion = d3.format(",");

// variant card
var variantCards = [];

// variant cards for unaffected and affected sibs 
var variantCardsSibs = {'affected': [], 'unaffected': []};
var variantCardsSibsTransient = [];

var fulfilledTrioPromise = false;

// The smaller the region, the wider we can
// make the rect of each variant
var widthFactors = [
	{'regionStart':     0, 'regionEnd':    8000,  'factor': 6},
	{'regionStart':  8001, 'regionEnd':   10000,  'factor': 5},
	{'regionStart': 10001, 'regionEnd':   15000,  'factor': 4},
	{'regionStart': 15001, 'regionEnd':   20000,  'factor': 3},
	{'regionStart': 20001, 'regionEnd':   30000,  'factor': 2},
	{'regionStart': 30001, 'regionEnd': 90000000,  'factor': 1},
];

var pageGuide = null;
var pageGuideBookmarks = null;
var pageGuidePhenolyzer = null;
var pageGuideEduTour1 = null;
var pageGuideEduTour2 = null;


$(document).ready(function(){

	if (detectIE() != false) {
		alert("Warning. Gene.iobio has been tested and verified on Chrome, Firefox, and Safari browsers.  Please run gene.iobio from one of these browsers.");
	}

	// Compile handlebar templates, when all are loaded
	// call init();
	var promises = [];
	promises.push(promiseLoadTemplate('templates/dataCardEntryTemplate.hbs').then(function(compiledTemplate) {
		dataCardEntryTemplate = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/filterSlidebarTemplate.hbs').then(function(compiledTemplate) {
	//promises.push(promiseLoadTemplate('templates/filterCancerTemplate.hbs').then(function(compiledTemplate) {
		filterCardTemplateHTML = compiledTemplate();
	}));
	promises.push(promiseLoadTemplate('templates/variantCardTemplate.hbs').then(function(compiledTemplate) {
		variantCardTemplate = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/geneBadgeTemplate.hbs').then(function(compiledTemplate) {
		geneBadgeTemplate = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/genesCardTemplate.hbs').then(function(compiledTemplate) {
		genesCardTemplateHTML = compiledTemplate();
	}));
	promises.push(promiseLoadTemplate('templates/bookmarkCardTemplate.hbs').then(function(compiledTemplate) {
		bookmarkTemplateHTML = compiledTemplate();
	}));
	promises.push(promiseLoadTemplate('templates/examineCardTemplate.hbs').then(function(compiledTemplate) {
		examineTemplateHTML = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/recallCardTemplate.hbs').then(function(compiledTemplate) {
		recallTemplateHTML = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/helpCardTemplate.hbs').then(function(compiledTemplate) {
		helpTemplateHTML = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/eduTourCardTemplate.hbs').then(function(compiledTemplate) {
		eduTourTemplateHTML = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/iconbarTemplate.hbs').then(function(compiledTemplate) {
		iconbarTemplate = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/tourTemplate.hbs').then(function(compiledTemplate) {
		tourTemplate = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/svgGlyphsTemplate.hbs').then(function(compiledTemplate) {
		svgGlyphsTemplate = compiledTemplate;
	}));

	Promise.all(promises).then(function() {
		init();
	});

	
});

function promiseLoadTemplate(templateName) {
	return new Promise( function(resolve, reject) {
		$.get(templateName, function (data) {    
		    resolve(Handlebars.compile(data));
		}, 'html');
	});
	
}



function init() {
	var me = this;

	alertify.defaults.glossary.title = "";
	alertify.defaults.theme.ok = 'btn btn-default btn-raised';
	alertify.defaults.theme.cancel = 'btn btn-default btn-raised';

	$('#tour-placeholder').append(tourTemplate());
	$('#svg-glyphs-placeholder').append(svgGlyphsTemplate());

	// Clear the local cache
 	clearCache();
	

	$('#nav-edu-tour').append(eduTourTemplateHTML);
	eduTourNumber = getUrlParameter("tour");
	if (eduTourNumber == null || eduTourNumber == "") {
		eduTourNumber = "0";
	}
	if (eduTourNumber && eduTourNumber != '') {
		$('#edu-tour-' + eduTourNumber).removeClass("hide");
	}
	

    // Slide out panels
    $(iconbarTemplate()).insertBefore("#slider-left");
	$('#slider-left-content').append(filterCardTemplateHTML);
	$('#slider-left-content').append(genesCardTemplateHTML);
	$('#slider-left-content').append(bookmarkTemplateHTML);
	$('#slider-left-content').append(examineTemplateHTML);
	$('#slider-left-content').append(helpTemplateHTML);
	$('#slider-left-content').append(recallTemplateHTML);
	$('#close-slide-left').click(function() {
		closeSlideLeft();
	});

	initializeTours();

    // Encapsulate logic for animate.css into a jquery function
    $.fn.extend({
    animateIt: function (animationName, customClassName) {
    		$(this).removeClass("hide");
    		var additionalClass = customClassName ? ' ' + customClassName : '';
	        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	        $(this).addClass('animated ' + animationName + additionalClass).one(animationEnd, function() {
	            $(this).removeClass('animated ' + animationName);
	        });
	    }
	});
	$.fn.extend({
    animateSplash: function (animationName) {
    		$(this).removeClass("hide");
	        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
	            $(this).removeClass('animated ' + animationName);
	            //$('.twitter-typeahead').animateIt('tada', 'animate-delayed');	            
	        });
	    }
	});


	// For 'show variants' card
	//$('#select-color-scheme').selectize()
	//$('#select-intron-display').selectize()
	


	// Initialize data card
	dataCard = new DataCard();
	dataCard.init();


	
	
	// Set up the gene search widget
	loadGeneWidget();
	$('#bloodhound .typeahead').focus();

	
	// Create transcript chart
	transcriptChart = geneD3()
	    .width(1000)
	    .widthPercent("100%")
	    .heightPercent("100%")
	    .margin({top:20, right: 2, bottom: 0, left: 4})
	    .showXAxis(true)
	    .showBrush(true)
	    .trackHeight(16)
	    .cdsHeight(12)
	    .showLabel(false)
	    .on("d3brush", function(brush) {
	    	if (!brush.empty()) {
	    		$('#zoom-hint').text('To zoom out, click outside bounding box.');
				regionStart = d3.round(brush.extent()[0]);
				regionEnd   = d3.round(brush.extent()[1]);
				if (!selectedTranscript) {
					selectedTranscript = window.gene.transcripts.length > 0 ? window.gene.transcripts[0] : null;
					cacheCodingRegions();

				}
			} else {
	    		$('#zoom-hint').text('To zoom into region, drag over gene model.');
				regionStart = window.gene.start;
				regionEnd   = window.gene.end;
			}

			variantCards.forEach(function(variantCard) {
		    	variantCard.onBrush(brush);
		    });


			getProbandVariantCard().fillFeatureMatrix(regionStart, regionEnd);

		})
		.on("d3featuretooltip", function(featureObject, feature, tooltip) {
		    			var coord = getTooltipCoordinates(featureObject.node(), tooltip, false);
		    			tooltip.transition()        
			                   .duration(200)      
			                   .style("opacity", .9);   
				        tooltip.html(feature.feature_type + ': ' + addCommas(feature.start) + ' - ' + addCommas(feature.end))                                 
				               .style("left", coord.x  + "px") 
				               .style("text-align", 'left')    
				               .style("top", coord.y + "px");    
		 });	

    transcriptMenuChart = geneD3()
	    .width(600)
	    .margin({top: 5, right: 5, bottom: 5, left: 200})
	    .showXAxis(false)
	    .showBrush(false)
	    .trackHeight(12)
	    .cdsHeight(8)
	    .showLabel(true)
	    .on("d3selected", function(d) {
	    	window.selectedTranscript = d;
	    	geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
	    	cacheCodingRegions();

	    	showTranscripts();

			variantCards.forEach(function(variantCard) {
		    	variantCard.loadTracksForGene();
			});

	    });


	// Initialize material bootstrap
    $.material.init();

	// Initialize genes card
	genesCard = new GenesCard();
	genesCard.init();

	// Initialize Matrix card
	matrixCard = new MatrixCard();
	matrixCard.init();
	// Set the tooltip generator now that we have a variant card instance
	matrixCard.setTooltipGenerator(getProbandVariantCard().variantTooltipHTML);

	// Initialize the Filter card
	filterCard = new FilterCard();
	filterCard.init();

	// Initialize the bookmark card
	bookmarkCard = new BookmarkCard();
	bookmarkCard.init();

	// Initialize examine card
	examineCard = new ExamineCard();
	examineCard.init();





	// When the transcript set changes (either GenCode or RefSeq)
	
	$('#select-gene-source').selectize(
		{ 	onChange: function(value) {
				geneSource = value.toLowerCase().split(" transcript")[0];
				geneToLatestTranscript = {};
				genesCard.selectGene(window.gene.gene_name);
				$('#gene-source-box').toggleClass('hide');
			} 
		}
	);
    /*
    $('#select-gene-source').selectivity();
    $('#select-gene-source').on('change', function(event) {
    	geneSource = event.value.toLowerCase().split(" transcript")[0];
		geneToLatestTranscript = {};
		genesCard.selectGene(window.gene.gene_name);
		$('#gene-source-box').toggleClass('hide');
    });
	*/

	// Initialize transcript view buttons
	initTranscriptControls();

	// endsWith implementation
	if (typeof String.prototype.endsWith !== 'function') {
	    String.prototype.endsWith = function(suffix) {
	        return this.indexOf(suffix, this.length - suffix.length) !== -1;
	    };
	}


	$('.sidebar-button.selected').removeClass("selected");

	loadGeneFromUrl();

	if (isLevelEduTour) {
		checkForInactivity();
	}
	$("#cb1").click( function() {
	    alert($(this).attr("checked"));
	});
	$("#cb1").change( function() {
	    alert($(this).attr("checked"));
	});
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
		    width: "730px",
		    height: "238px"
		}, {"dom":{}}, {"dom":{}});	

	} else {
		$('.edu-tour-animation').addClass("hide");
	}
 
}

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
	    	'#edu-tour-2-label':             {audio: '#audio-test'},
//	    	'#edu-tour-2-label':             {audio: '#audio-test', animation: {name: 'EDGE-1020589079', showFunction: showEduTourAnimationNew, delay: 0}},
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

// Function from David Walsh: http://davidwalsh.name/css-animation-callback
function whichTransitionEvent(){
  var t,
      el = document.createElement("fakeelement");

  var transitions = {
    "transition"      : "transitionend",
    "OTransition"     : "oTransitionEnd",
    "MozTransition"   : "transitionend",
    "WebkitTransition": "webkitTransitionEnd"
  }

  for (t in transitions){
    if (el.style[t] !== undefined){
      return transitions[t];
    }
  }
}

function sidebarAdjustX(x) {	
	if (!$("#slider-left").hasClass("hide")) {
		var iconBarWidth = $("#slider-icon-bar").css("display") == "none" ? 0 : $("#slider-icon-bar").width();
		x -= ($("#slider-left").width() + iconBarWidth);
		x -= 1;
	}
	return x;
}

function getTooltipCoordinates(node, tooltip, adjustForVerticalScroll) {
	var coord = {};
	var tooltipWidth  = d3.round(tooltip.node().offsetWidth);
	var tooltipHeight = d3.round(tooltip.node().offsetHeight);	

	// Firefox doesn't consider the transform (slideout's shift left) with the getScreenCTM() method,
    // so instead the app will use getBoundingClientRect() method instead which does take into consideration
    // the transform. 
	var boundRect = node.getBoundingClientRect();   
	coord.width = boundRect.width;
	coord.height = boundRect.height;
    coord.x = sidebarAdjustX(d3.round(boundRect.left + (boundRect.width/2)));
    coord.y = d3.round(boundRect.top);
    if (adjustForVerticalScroll) {
    	coord.y += $(window).scrollTop();
    }

    // Position tooltip in the middle of the node
	coord.x = coord.x - (tooltipWidth/2);
	// Position tooltip above the node
	coord.y = coord.y - tooltipHeight;

	
	// If the tooltip will be cropped to the right, adjust its position
	// so that it is immediately to the left of the node
	if  ((coord.x + (tooltipWidth/2) + 100) > $('#proband-variant-card').width()) {
		coord.x -= tooltipWidth/2;
		coord.x -= 6;
		tooltip.classed("black-arrow-left", false);
		tooltip.classed("black-arrow-right", true);
	} else if (coord.x < tooltipWidth/2) {
		// If the tooltip will be cropped to the left, adjust its position
		// so that it is immediately to the right of the node
		coord.x += tooltipWidth/2;
		coord.x += 6;
		tooltip.classed("black-arrow-left", true);
		tooltip.classed("black-arrow-down-right", false);
	} else {
		// No cropping of tooltip on either side, just default to show tooltip
		// immediately to the left of the node
		coord.x += tooltipWidth/2;
		coord.x += 6;
		tooltip.classed("black-arrow-left", true);
		tooltip.classed("black-arrow-right", false);
	}

	 
	return coord;
}

function showCoordinateFrame(x) {
	var top = +$('#nav-section').outerHeight();
	top    += +$('#matrix-track').outerHeight();
	top    += 30;
	if (isLevelEduTour && $('#slider-left').hasClass("hide")) {
		top += 50;
	}

	var height = +$('#proband-variant-card').outerHeight();
	height    += +$('#other-variant-cards').outerHeight();

	var width =  +$('#coordinate-frame').outerWidth();

	x = sidebarAdjustX(x);
	
	var margins = dataCard.mode == 'trio' ? 10 : 20;

	$('#coordinate-frame').css("top", top);
	$('#coordinate-frame').css("height", height - margins);
	$('#coordinate-frame').css("left", x - d3.round(width/2) - 2);
	$('#coordinate-frame').css("opacity", 1);
}

function unpinAll() {
	clickedVariant = null;
	hideCoordinateFrame();
	matrixCard.hideTooltip();
	variantCards.forEach(function(variantCard) {
		variantCard.hideVariantCircle();
	});		
}

function hideCoordinateFrame() {
	$('#coordinate-frame').css("opacity", 0);
}


function readjustCards() {
	var top = +$('#nav-section').height();
	d3.select('#track-section').style("padding-top", top+3 + "px");
}


function showSidebar(sidebar) {
	//closeSlideLeft(); 	


	if (sidebar == "Phenolyzer") {
		$('#search-dna-glyph').attr('fill', '#5d809d');	
	} else {
		$('#search-dna-glyph').attr('fill', 'white');	
	}


	$('.sidebar-button').removeClass('selected');
	if (sidebar == "Filter") {
		$('#slider-left-content #filter-track').toggleClass("hide", false);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);			
		$('#slider-left-content #recall-card').toggleClass("hide", true);	
		$('#slider-left-content #help-card').toggleClass("hide", true);	
		$('#button-show-filters').toggleClass('selected', true);			
	} else if (sidebar == "Phenolyzer") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", false);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);					
		$('#slider-left-content #recall-card').toggleClass("hide", true);	
		$('#slider-left-content #help-card').toggleClass("hide", true);	
		$('#button-show-phenolyzer').toggleClass('selected', true);	
	} else if (sidebar == "Bookmarks") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", false);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);			
		$('#slider-left-content #recall-card').toggleClass("hide", true);		
		$('#slider-left-content #help-card').toggleClass("hide", true);	
		$('#button-show-bookmarks').toggleClass('selected', true);		
		window.bookmarkCard.refreshBookmarkList();
	} else if (sidebar == "Examine") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", false);			
		$('#slider-left-content #recall-card').toggleClass("hide", true);	
		$('#slider-left-content #help-card').toggleClass("hide", true);	
		$('#button-show-examine').toggleClass('selected', true);			
	} else if (sidebar == "Recall") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);			
		$('#slider-left-content #recall-card').toggleClass("hide", false);	
		$('#slider-left-content #help-card').toggleClass("hide", true);	
		$('#button-find-missing-variants').toggleClass('selected', true);			
	} else if (sidebar == "Help") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);			
		$('#slider-left-content #recall-card').toggleClass("hide", true);	
		$('#slider-left-content #help-card').toggleClass("hide", false);	
		$('#button-show-help').toggleClass('selected', true);		
	} 


	if ($('#slider-left').hasClass("hide")) {
		$('#slider-left').removeClass("hide");
		$('.footer').addClass("hide");
		$('#close-slide-left').removeClass("hide");
		$('.sidebar-button').removeClass("closed");
		$('#slider-icon-bar').removeClass("closed");

		resizeCardWidths();

		$('#container').toggleClass('slide-left');
		$('#nav-section').css("left", "0px");

		var transitionEvent = whichTransitionEvent();
		$('.slide-left').one(transitionEvent, function(event) {
			readjustCards();

			
			$('#slider-left').trigger("open");

			if (!$('#splash').hasClass("hide") && !isDataLoaded() && (gene == null || gene == "") ) {
				//$('#splash-image').animateSplash('zoomIn');
			} 
			if (isDataLoaded() || (gene != null && gene != "")) {
				$('#splash').addClass("hide");
			}


		});

	} 



}



function showDataDialog() {
	$('#dataModal').modal('show')

}




function resizeCardWidths() {
	var windowWidth = $(window).width();
	var sliderWidth    = 0;
	if ($('#slider-left').hasClass("hide") == false) {
		sliderWidth = +$('#slider-left').width();
		$('#nav-section').css("width", "100%");
	} else {
		$('#nav-section').css("width", '');
	}
	
	$('#container').css('width', windowWidth - sliderWidth - (isLevelEdu ? 0 : 40));
	$('#matrix-panel').css('max-width', windowWidth - sliderWidth - (isLevelEdu ? 0 : 60));
	$('#matrix-panel').css('min-width', windowWidth - sliderWidth - (isLevelEdu ? 0 : 60));
}

function closeSlideLeft() {
	$('#nav-section').css("left", "32px");
	$('.footer').removeClass("hide");
	$('.slide-button').removeClass("hide");
	$('#close-slide-left').addClass("hide");
	$('#slider-left').addClass("hide");
	$('#slider-icon-bar').addClass("closed");

	$('#slide-buttons').removeClass('slide-left');
	$('#container').removeClass('slide-left');
	$('.sidebar-button.selected').removeClass("selected");
	$('.sidebar-button').addClass("closed");

	$('#search-dna-glyph').attr('fill', 'white');	

	resizeCardWidths();

	var transitionEvent = whichTransitionEvent();
	$('#container').one(transitionEvent, function(event) {
		readjustCards();
		$('#slider-left').trigger("close");
	});

}



/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function detectSafari() {
	return (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);
}


function getProbandVariantCard() {
	var probandCard = null;
	variantCards.forEach( function(variantCard) {
		if (variantCard.getRelationship() == 'proband') {
			probandCard = variantCard;
		}
	});
	return probandCard;
}

function getVariantCard(relationship) {
	var theCard = null;
	variantCards.forEach( function(variantCard) {
		if (variantCard.getRelationship() == relationship) {
			theCard = variantCard;
		}
	});
	return theCard;
}


function toggleSampleTrio(show) {
	if (show) {
		dataCard.mode = 'trio';
		$('#mother-data').removeClass("hide");
		$('#father-data').removeClass("hide");
		if ($('#proband-data').find('#vcf-sample-select option').length > 1) {
			$('#unaffected-sibs-box').removeClass("hide");
			$('#affected-sibs-box').removeClass("hide");
		} else {
			$('#unaffected-sibs-box').addClass("hide");
			$('#affected-sibs-box').addClass("hide");
		}
	} else {
		dataCard.mode = 'single';
		$('#mother-data').addClass("hide");
		$('#father-data').addClass("hide");
		$('#unaffected-sibs-box').addClass("hide");
		$('#affected-sibs-box').addClass("hide");
		var motherCard = null;
		var fatherCard = null;
		variantCards.forEach( function(variantCard) {
			if (variantCard.getRelationship() == 'mother') {
				motherCard = variantCard;
				motherCard.clearVcf();
				motherCard.hide();
				$('#mother-data').find('#vcf-file-info').val('');
				$('#mother-data').find('#vcf-url-input').val('');
				//dataCard.displayUrlBox($('#mother-data'));
				removeUrl("vcf1");
				removeUrl("bam1");
			} else if (variantCard.getRelationship() == 'father') {
				fatherCard = variantCard;
				fatherCard.clearVcf();
				fatherCard.hide();
				$('#father-data').find('#vcf-file-info').val('');
				$('#father-data').find('#vcf-url-input').val('');
				//dataCard.displayUrlBox($('#father-data'));
				removeUrl("vcf2");
				removeUrl("bam2");
			}
		});
		


	}
	enableLoadButton();

}

function loadGeneFromUrl() {
	// Get the gene parameger
	var gene = getUrlParameter('gene');

	// Get the gene list from the url.  Add the gene badges, selecting
	// the gene that was passed in the url parameter
	var genes = getUrlParameter("genes");
	if (genes != null && genes.length > 0) {
		geneNames = genes.split(",");
		$('#genes-to-copy').val(genes);
		genesCard.copyPasteGenes(gene);
	}

	// Load the gene
	var showTour = getUrlParameter('showTour');
	if (gene != undefined) {
		$('#bloodhound .typeahead.tt-input').val(gene).trigger('typeahead:selected', {"name": gene, loadFromUrl: true});
		genesCard._geneBadgeLoading(gene, true, true);
	} else {
		// Open the sidebar 
		if (isLevelEdu) {
			if (!isLevelEduTour || eduTourShowPhenolyzer[+eduTourNumber-1]) {
				showSidebar("Phenolyzer");
			}
			dataCard.loadDemoData();
		} else {
			showSidebar("Help");
		}
	

		if (showTour != null && showTour == 'Y') {
			//pageGuide.open();
		} else {
			//$('#tourWelcome').addClass("open");
		}

	}
	
}

function reloadGeneFromUrl(alreadyLoaded) {
	// Get the gene parameger
	var gene = getUrlParameter('gene');

	// Get the gene list from the url.  Add the gene badges, selecting
	// the gene that was passed in the url parameter
	var genes = getUrlParameter("genes");
	if (genes != null && genes.length > 0) {
		geneNames = genes.split(",");
		$('#genes-to-copy').val(genes);
		genesCard.copyPasteGenes(gene);
	}

	$('#bloodhound .typeahead.tt-input').val(gene).trigger('typeahead:selected', {"name": gene, loadFromUrl: !alreadyLoaded});
	genesCard._geneBadgeLoading(gene, true, true);
}

function loadUrlSources() {

	var bam  = getUrlParameter(/bam*/);
	var vcf  = getUrlParameter(/vcf*/);	
	var rel  = getUrlParameter(/rel*/);
	var dsname = getUrlParameter(/name*/);	
	var sample = getUrlParameter(/sample*/);	
	var affectedSibsString = getUrlParameter("affectedSibs");
	var unaffectedSibsString = getUrlParameter("unaffectedSibs");

	// Initialize transcript chart and variant cards, but hold off on displaying 
	// the variant cards.
	if (!isLevelEdu) {
		loadTracksForGene(true);
	}



	if ((bam != null && Object.keys(bam).length > 1) || (vcf != null && Object.keys(vcf).length > 1)) {
		if (!isLevelEdu) {
			toggleSampleTrio(true);
		}
	} 


	// Now create variant cards for the affected and unaffected sibs
	if (affectedSibsString) {
		var affectedSibs = affectedSibsString.split(",");	
		window.loadSibs(affectedSibs, 'affected');	
	}
	if (unaffectedSibsString) {
		var unaffectedSibs = unaffectedSibsString.split(",");	
		window.loadSibs(unaffectedSibs, 'unaffected');	
	}

	if (bam != null) {
		Object.keys(bam).forEach(function(urlParameter) {
			var cardIndex = urlParameter.substring(3);
			var variantCard      = variantCards[+cardIndex];
			var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
			var panelSelector    = $(panelSelectorStr);
			panelSelector.find('#bam-url-input').val(bam[urlParameter]);
			panelSelector.find('#bam-url-input').removeClass("hide");
			dataCard.onBamUrlEntered(panelSelector);
		});
	}
	if (vcf != null) {
		Object.keys(vcf).forEach(function(urlParameter) {
			var cardIndex = urlParameter.substring(3);
			var variantCard      = variantCards[+cardIndex];
			var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
			var panelSelector    = $(panelSelectorStr);
			panelSelector.find('#url-input').val(vcf[urlParameter]);
			panelSelector.find('#url-input').removeClass("hide");
			dataCard.onVcfUrlEntered(panelSelector);
		});
	}
	if (dsname != null) {
		Object.keys(dsname).forEach(function(urlParameter) {
			var cardIndex = urlParameter.substring(4);
			var variantCard      = variantCards[+cardIndex];
			var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
			var panelSelector    = $(panelSelectorStr);
			panelSelector.find('#datasource-name').val(dsname[urlParameter]);
			dataCard.setDataSourceName(panelSelector);
		});
	}
	if (sample != null) {
		Object.keys(sample).forEach(function(urlParameter) {
			var cardIndex = urlParameter.substring(6);
			var variantCard = variantCards[+cardIndex];
			var sampleName = sample[urlParameter];
			variantCard.setSampleName(sampleName);
			variantCard.setDefaultSampleName(sampleName);
		});
	}
	
 
	if (vcf != null || bam != null) {
		if (isLevelEdu && $('#slider-left').hasClass("hide")) {
			if (!isLevelEduTour || eduTourShowPhenolyzer[+eduTourNumber-1]) {
				showSidebar("Phenolyzer");
			}
		}

		loadTracksForGene( false );
	} else {
		//showDataDialog();
	}

}

function initTranscriptControls() {


	var transcriptCardSelector = $('#transcript-card');
	transcriptCardSelector.find('#expand-button').on('click', function() {
		transcriptCardSelector.find('.fullview').removeClass("hide");
		transcriptCardSelector.find('#gene-name').css("margin-left", "0");
		transcriptCardSelector.find('#gene-name').css("margin-right", "0");
		transcriptCardSelector.css("margin-top", "0");

		transcriptCardSelector.find('#expand-button').addClass("disabled");
		transcriptCardSelector.find('#minimize-button').removeClass("disabled");
	});
	transcriptCardSelector.find('#minimize-button').on('click', function() {
		transcriptCardSelector.find('.fullview').addClass("hide");
		transcriptCardSelector.find('#gene-name').css("margin-right", "0");
		
		transcriptCardSelector.find('#expand-button').removeClass("disabled");
		transcriptCardSelector.find('#minimize-button').addClass("disabled");
	});


	$('#transcript-btn-group').data('open', false);

	$('#transcript-dropdown-button').click(function () {
        if ($('#transcript-btn-group').data('open')) {
            $('#transcript-btn-group').data('open', false);
            onCloseTranscriptMenuEvent();
        } else {
        	$('#transcript-btn-group').data('open', true);        	
        }
    });

    $(document).click(function () {
        if ($('#transcript-btn-group').data('open')) {
            $('#transcript-btn-group').data('open', false);
            onCloseTranscriptMenuEvent();
        }
    });
}



function onCloseTranscriptMenuEvent() {
	if (transcriptMenuChart.selectedTranscript() != null ) {
		if (selectedTranscript == null || selectedTranscript.transcript_id != transcriptMenuChart.selectedTranscript().transcript_id) {
			selectedTranscript = transcriptMenuChart.selectedTranscript();
			geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
			d3.selectAll("#gene-viz .transcript").remove();
		 	cacheCodingRegions();
		 	loadTracksForGene();
		 }		
	}

}

function getCanonicalTranscript(theGeneObject) {
	var geneObject = theGeneObject != null ? theGeneObject : window.gene;
	var canonical;	

	if (geneObject.transcripts == null || geneObject.transcripts.length == 0) {		
		return null;
	}
	var order = 0;
	geneObject.transcripts.forEach(function(transcript) {
		transcript.isCanonical = false;
		var cdsLength = 0;
		if (transcript.features != null) {
			transcript.features.forEach(function(feature) {
				if (feature.feature_type == 'CDS') {
					cdsLength += Math.abs(parseInt(feature.end) - parseInt(feature.start));
				}
			})			
			transcript.cdsLength = cdsLength;			
		} else {
			transcript.cdsLength = +0;
		}
		transcript.order = order++;

	});
	var sortedTranscripts = geneObject.transcripts.slice().sort(function(a, b) {
		var aType = +2;
		var bType = +2;
		if (a.hasOwnProperty("transcript_type") && a.transcript_type == 'protein_coding') {
			aType = +0;
		} else if (a.hasOwnProperty("gene_type") && a.gene_type == "gene")  {
			aType = +0;
		} else {
			aType = +1;
		}
		if (b.hasOwnProperty("transcript_type") && b.transcript_type == 'protein_coding') {
			bType = +0;
		} else if (b.hasOwnProperty("gene_type") && b.gene_type == "gene")  {
			bType = +0;
		} else {
			bType = +1;
		}


		var aLevel = +2;
		var bLevel = +2;
		if (geneSource.toLowerCase() == 'refseq') {
			if (a.transcript_id.indexOf("NM_") == 0 ) {
				aLevel = +0;
			} 
			if (b.transcript_id.indexOf("NM_") == 0 ) {
				bLevel = +0;
			} 
		} else {
			// Don't consider level for gencode as this seems to point to shorter transcripts many
			// of the times.
			//aLevel = +a.level;
			//bLevel = +b.level;
		}


		var aSource = +2;
		var bSource = +2;
		if (geneSource.toLowerCase() =='refseq') {
			if (a.annotation_source == 'BestRefSeq' ) {
				aSource = +0;
			}
			if (b.annotation_source == 'BestRefSeq' ) {
				bSource = +0;
			}
		}

		a.sort = aType + ' ' + aLevel + ' ' + aSource + ' ' + a.cdsLength + ' ' + a.order;
		b.sort = bType + ' ' + bLevel + ' ' + bSource + ' ' + b.cdsLength + ' ' + b.order;

		if (aType == bType) {
			if (aLevel == bLevel) {
				if (aSource == bSource) {
					if (+a.cdsLength == +b.cdsLength) {
						// If all other sort criteria is the same,
						// we will grab the first transcript listed
						// for the gene.
						if (a.order == b.order) {
							return 0;
						} else if (a.order < b.order) {
							return -1;
						} else {
							return 1;
						}
						return 0;
					} else if (+a.cdsLength > +b.cdsLength) {
						return -1;
					} else {
						return 1;
					}
				} else if ( aSource < bSource ) {
					return -1;
				} else {
					return 1;
				}
			} else if (aLevel < bLevel) {
				return -1;
			} else {
				return 1;
			}
		} else if (aType < bType) {
			return -1;
		} else {
			return 1;
		}
	});
	canonical = sortedTranscripts[0];
	canonical.isCanonical = true;
	return canonical;
}


function getCanonicalTranscriptOld(theGeneObject) {
	var geneObject = theGeneObject != null ? theGeneObject : window.gene;
	var canonical;
	var maxCdsLength = 0;
	geneObject.transcripts.forEach(function(transcript) {
		var cdsLength = 0;
		if (transcript.features != null) {
			transcript.features.forEach(function(feature) {
				if (feature.feature_type == 'CDS') {
					cdsLength += Math.abs(parseInt(feature.end) - parseInt(feature.start));
				}
			})
			if (cdsLength > maxCdsLength) {
				maxCdsLength = cdsLength;
				canonical = transcript;
			}
			transcript.cdsLength = cdsLength;			
		}

	});

	if (canonical == null) {
		// If we didn't find the canonical (transcripts didn't have features), just
		// grab the first transcript to use as the canonical one.
		if (geneObject.transcripts != null && geneObject.transcripts.length > 0)
		canonical = geneObject.transcripts[0];
	}
	canonical.isCanonical = true;
	return canonical;
}

function cacheCodingRegions() {
	selectedTranscriptCodingRegions.length = 0;

	if (window.selectedTranscript != null && window.selectedTranscript.features != null) {
		window.selectedTranscript.features.forEach( function(feature) {
			if (feature.feature_type == 'CDS' || feature.feature_type == 'UTR') {
				selectedTranscriptCodingRegions.push({start: feature.start, end: feature.end});
			}
		});		
	}

}


function cacheGenes() {
	if (genesToCache != null && genesToCache.length > 0) {
		return;
	}
	genesToCache = [];
	geneNames.forEach(function(geneName) {
		if (geneName != window.gene.gene_name) {
			genesToCache.push(geneName);
		}
	})

	cacheNextGene(genesToCache);

}


function cacheNextGene(genesToCache) {
	if (genesToCache.length == 0) {
		return;
	}

	var geneName = genesToCache[0];
	

	var url = geneiobio_server + 'api/gene/' + geneName;
	url += "?source=" + geneSource;
		
	$.ajax({
	    url: url,
	    jsonp: "callback",
	    type: "GET",
	    dataType: "jsonp",
	    success: function( response ) {

	    	if (response[0].hasOwnProperty('gene_name')) {

		    	var geneObject = response[0];
		    	adjustGeneRegion(geneObject);
		    	var transcript = getCanonicalTranscript(geneObject);
		    	window.geneObjects[geneObject.gene_name] = geneObject;
			    genesCard._geneBadgeLoading(geneObject.gene_name, true);


			    
		    	variantCards.forEach(function(variantCard) {

		    		if (dataCard.mode == 'trio' || variantCard == getProbandVariantCard()) {
			    		variantCard.promiseCacheVariants(
			    			geneObject.chr,
			    			geneObject, 
						 	transcript)
			    		.then( function(vcfData) {
			    			if (isCachedForCards(geneObject.gene_name, transcript)) {
			    				vc = getProbandVariantCard();
			    				var probandVcfData = vc.model.getVcfDataForGene(geneObject, transcript);
			    				var dangerObject = vc.summarizeDanger(probandVcfData);
								
								genesCard._geneBadgeLoading(geneObject.gene_name, false);
								if (probandVcfData.features.length == 0) {
			    					genesCard._setGeneBadgeWarning(geneObject.gene_name);
			    				} else {
			    					genesCard._setGeneBadgeGlyphs(geneObject.gene_name, dangerObject, false);
								}
			    				
								if (genesToCache.indexOf(geneObject.gene_name) >= 0) {
									genesToCache.shift();
				    				cacheNextGene(genesToCache);									
								}
			    			}

			    		}, function(error) {
			    			genesCard._setGeneBadgeError(geneObject.gene_name);			    				
			    			if (genesToCache.indexOf(geneObject.gene_name) >= 0) {
			    				var message = error.hasOwnProperty("message") ? error.message : error;
				    			console.log("problem caching data for gene " + geneObject.gene_name + ". " + message);
				    			genesCard._geneBadgeLoading(geneObject.gene_name, false);

				    			genesToCache.shift();
					    		cacheNextGene(genesToCache);					
			    			}
			    		});

		    		}

		    	});	
		    }
		}
	});
				

}


function hasDataSources() {
	var hasDataSource = false;
	variantCards.forEach( function(variantCard) {
		if (variantCard.hasDataSources()) {
			hasDataSource = true;
		}
	});
	return hasDataSource;
}

function isCachedForCards(geneName, transcript) {
	var count = 0;
	variantCards.forEach( function(variantCard) {
		if (variantCard.isCached(geneName, transcript)) {
			count++;
		}
	});
	if (dataCard.mode == 'single') {
		return count == 1;
	} else {
		return count == variantCards.length;
	}
}




function clearCache() {
	if (localStorage) {
		localStorage.clear();
	}
	
	//window.geneObjects = {};
	//window.geneAnnots = {};
	//window.gene = null;
	//window.selectedTranscript = null;
	window.genesToCache = [];
}


function adjustGeneRegionBuffer() {
	if (+$('#gene-region-buffer-input').val() > GENE_REGION_BUFFER_MAX) {
		alert("Up to 50 kb upstream/downstream regions can be displayed.")
	} else {
		GENE_REGION_BUFFER = +$('#gene-region-buffer-input').val();
		$('#bloodhound .typeahead.tt-input').val(gene.gene_name).trigger('typeahead:selected', {"name": gene.gene_name, loadFromUrl: false});		
	}
	clearCache();

}


function adjustGeneRegion(geneObject) {
	if (geneObject.startOrig == null) {
		geneObject.startOrig = geneObject.start;
	}
	if (geneObject.endOrig == null) {
		geneObject.endOrig = geneObject.end;
	}
	// Open up gene region to include upstream and downstream region;
	geneObject.start = geneObject.startOrig < GENE_REGION_BUFFER ? 0 : geneObject.startOrig - GENE_REGION_BUFFER;
	// TODO: Don't go past length of reference
	geneObject.end   = geneObject.endOrig + GENE_REGION_BUFFER;

}


function updateUrl(paramName, value) {
	var params = {};
	// turn params into hash
	window.location.search.split('&').forEach(function(param){
		if (param != '') {
			param = param.split('?').length == 1 ? param : param.split('?')[1];
			var fields = param.split('=');
			params[fields[0]] = fields[1];
		}
	});
	params[paramName] = value;
	var search = [];
	Object.keys(params).forEach(function(key) {
		search.push(key + '=' + params[key]);
	})
    window.history.replaceState(null,null,'?'+search.join('&'));	
}

function removeUrl(paramName) {
	var params = {};
	// turn params into hash, but leave out the specified parameter
	window.location.search.split('&').forEach(function(param){
		if (param.indexOf(paramName) == 0) {

		} else if (param != '') {
			param = param.split('?').length == 1 ? param : param.split('?')[1];
			var fields = param.split('=');
			params[fields[0]] = fields[1];
		}
	});
	var search = [];
	Object.keys(params).forEach(function(key) {
		search.push(key + '=' + params[key]);
	})
	window.history.replaceState(null,null,'?'+search.join('&'));

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



function loadGeneWidget() {
	// kicks off the loading/processing of `local` and `prefetch`
	gene_engine.initialize();


	var typeahead = $('#bloodhound .typeahead').typeahead({
	  hint: true,
	  highlight: true,
	  minLength: 1
	},
	{
	  name: 'name',
	  displayKey: 'name',
	  templates: {
	    empty: [
	      '<div class="empty-message">',
	      'no genes match the current query',
	      '</div>'
	    ].join('\n'),
	    suggestion: Handlebars.compile('<p><strong>{{name}}</strong></p>')
	  },
	  // `ttAdapter` wraps the suggestion engine in an adapter that
	  // is compatible with the typeahead jQuery plugin
	  source: gene_engine.ttAdapter()
	});
	
	typeahead.on('typeahead:selected',function(evt,data){	

		// Ignore second event triggered by loading gene widget from url parameter
		if (data.loadFromUrl && loadedUrl) {
			return;
		} else if (data.loadFromUrl) {
			loadedUrl = true;
		}
		
		if (data.name.indexOf(':') != -1) var searchType = 'region';
		else var searchType = 'gene';
		var url = geneiobio_server + 'api/' + searchType + '/' + data.name;
		url += "?source=" + geneSource;


		
		$.ajax({
		    url: url,
		    jsonp: "callback",
		    type: "GET",
		    dataType: "jsonp",
		    success: function( response ) {

		    	// We have successfully return the gene model data.
		    	// Load all of the tracks for the gene's region.
		    	window.gene = response[0];	
		    	adjustGeneRegion(window.gene);	

		    	// Add the gene badge
		    	genesCard.addGeneBadge(window.gene.gene_name);					
			    	
		    	    
		    	window.geneObjects[window.gene.gene_name] = window.gene;
		    	
		    	// set all searches to correct gene	
		    	$('.typeahead.tt-input').val(window.gene.gene_name);
		    	window.selectedTranscript = geneToLatestTranscript[window.gene.gene_name];
		    	

		    	if (data.loadFromUrl) {

		    		var bam  = getUrlParameter(/bam*/);
					var vcf  = getUrlParameter(/vcf*/);	

					if (vcf != null && vcf.length > 0) {
						firstTimeGeneLoaded = false;
					}

					if (bam == null && vcf == null) {
						// Open the 'About' sidebar by default if there is no data loaded when gene is launched
						if (isLevelEdu) {
							if (!isLevelEduTour || eduTourShowPhenolyzer[+eduTourNumber-1]) {
								showSidebar("Phenolyzer");
							}							
						} else {
							showSidebar("Help");
						}

						//$('#tourWelcome').addClass("open");
					}

			    	genesCard.updateGeneInfoLink(window.gene.gene_name);

		    		// Autoload data specified in url
					loadUrlSources();

					enableCallVariantsButton();						
		    	} else {
	
					$('#splash').addClass("hide");

					//$('#tourWelcome').removeClass("open");
					
			    	loadTracksForGene();
			    	// add gene to url params
			    	updateUrl('gene', window.gene.gene_name);


			    	genesCard.updateGeneInfoLink(window.gene.gene_name);



					if (firstTimeGeneLoaded && !hasDataSources()) {
						//showDataDialog();
						firstTimeGeneLoaded = false; 
					}

			    	if(data.callback != undefined) data.callback();

		    	}
		    	

	       	},
		    error: function( xhr, status, errorThrown ) {
		        
		        console.log( "Error: " + errorThrown );
		        console.log( "Status: " + status );
		        console.dir( xhr );
		    },
		    complete: function( xhr, status ) {
		    }
		});
	});	

	// check if gene_list is stored locally	
	var gene_list = localStorage.getItem("gene_list");
	if ( gene_list === null ) {
		// fetch gene list from server			
		$.ajax({url: 'gene_names.json'}).done(function(data, status, res) {
			gene_engine.add($.map(data, function(gene) { return { name: gene }; }));
			localStorage.setItem('gene_list', JSON.stringify(data));
		})
	} else {
		// grab gene list from localStorage			
		gene_engine.add(
			$.map(JSON.parse(gene_list), function(gene) { return { name: gene }; })
		);
	}	


}

/* 
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
function loadTracksForGene(bypassVariantCards) {

	if (window.gene == null || window.gene == "") {
		$('.twitter-typeahead').animateIt('tada');
		return;
	} 
	if (!bypassVariantCards && !isDataLoaded()) {
		$('#add-data-button').animateIt('tada', 'animate-twice');
	}
	
	regionStart = null;
	regionEnd = null;
	fulfilledTrioPromise = false;

	filterCard.snpEffEffects = new Object();
	filterCard.vepConsequences = new Object();
	filterCard.recFilters = new Object();

	$("#region-flag").addClass("hide");

	$("#coordinate-frame").css("opacity", 0);

	$('#transcript-card').removeClass("hide");
	$('#gene-region-buffer-input').removeClass("hide");
	$('#gene-plus-minus-label').removeClass("hide");	
	
    $('#gene-track').removeClass("hide");
    $('#view-finder-track').removeClass("hide");
	$('#transcript-btn-group').removeClass("hide");
	$('#feature-matrix .tooltip').css("opacity", 0);

	$('#recall-card .call-variants-count').addClass("hide");
	$('#recall-card .call-variants-count').text("");
	$('#recall-card .covloader').addClass("hide");

	d3.select("#region-chart .x.axis .tick text").style("text-anchor", "start");

	readjustCards();


	d3.select('#impact-scheme').classed("current", true);
	d3.select('#effect-scheme' ).classed("current", false);
	d3.selectAll(".impact").classed("nocolor", false);
	d3.selectAll(".effect").classed("nocolor", true);
	
	gene.regionStart = formatRegion(window.gene.start);
	gene.regionEnd   = formatRegion(window.gene.end);

    $('#gene-chr').text(isLevelEdu ? ' is located on chromosome ' + window.gene.chr.replace('chr', '') : window.gene.chr);
    $('#gene-name').text((isLevelEdu ? 'GENE ' : '') + window.gene.gene_name);   
    $('#gene-region').text(addCommas(window.gene.startOrig) + "-" + addCommas(window.gene.endOrig));


	if (window.gene.gene_type == 'protein_coding'  || window.gene.gene_type == 'gene') {
		$('#non-protein-coding #gene-type-badge').addClass("hide");
	} else {
		$('#non-protein-coding #gene-type-badge').removeClass("hide");
		$('#non-protein-coding #gene-type-badge').text(window.gene.gene_type);
	}
	
	if (window.gene.strand == '-') {
		$('#minus_strand').removeClass("hide");
	} else {
		$('#minus_strand').addClass("hide");
	}



	window.regionStart = window.gene.start;
	window.regionEnd   = window.gene.end;


   	// This will be the view finder, allowing the user to select
	// a subregion of the gene to zoom in on the tracks.
	// ??????  TODO:  Need to figure out the cannonical transcript.	
	var transcript = [];
	if (window.gene.transcripts && window.gene.transcripts.length > 0 ) {
		transcript = getCanonicalTranscript();
	}

	// Load the read coverage and variant charts.  If a bam hasn't been
	// loaded, the read coverage chart and called variant charts are
	// not rendered.  If the vcf file hasn't been loaded, the vcf variant
	// chart is not rendered.
	showTranscripts();

	// Show the badge for the transcript type if it is not protein coding and it is different
	// than the gene type
	if (window.selectedTranscript == null || window.selectedTranscript.transcript_type == 'protein_coding'
	 || window.selectedTranscript.transcript_type == 'mRNA'
	 || window.selectedTranscript.transcript_type == 'transcript') {
		$('#non-protein-coding #transcript-type-badge').addClass("hide");
	} else {
		if (window.gene.gene_type != window.selectedTranscript.transcript_type) {
			$('#non-protein-coding #transcript-type-badge').removeClass("hide");
			var suffix = "";
			if (window.selectedTranscript.transcript_type.indexOf("transcript") < 0) {
				suffix = " transcript";
			}
			$('#non-protein-coding #transcript-type-badge').text(window.selectedTranscript.transcript_type + suffix);
		} else {
			$('#non-protein-coding #transcript-type-badge').addClass("hide");
		}
	}

	$('#filter-and-rank-card').removeClass("hide");
 	$('#matrix-track').removeClass("hide");
 	if (isLevelEdu) {
	 	$('#rank-variants-title').text('Evaluated variants for ' + getProbandVariantCard().model.getName() );
 	}
	$("#matrix-panel .loader").removeClass("hide");
	$("#feature-matrix").addClass("hide");
	$("#feature-matrix-note").addClass("hide");
	readjustCards();

	filterCard.disableFilters();
	

	if (bypassVariantCards == null || !bypassVariantCards) {
	 	variantCards.forEach(function(variantCard) {
	 		if (dataCard.mode == 'single' && variantCard.getRelationship() != 'proband') {
				variantCard.hide();
			} else {
			 	variantCard.loadTracksForGene(filterCard.classifyByImpact);
			}
		});
	}
	

	transcriptPanelHeight = d3.select("#nav-section").node().offsetHeight;


	
}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}


function showTranscripts(regionStart, regionEnd) {

	var transcripts = null;
	

	if (regionStart && regionEnd) {
		transcriptChart.regionStart(regionStart);
		transcriptChart.regionEnd(regionEnd);
		// ???????  TODO:
		// Need change the regionstart and region end of transcripts
		// to stay within selected region.  
		transcripts = window.gene.transcripts.filter(function(d) {
			if (d.end < regionStart && d.start > regionEnd ) {
				return false;
			} else {				
				return false;
			}
		});

	} else {
		transcriptChart.regionStart(+window.gene.start);
		transcriptChart.regionEnd(+window.gene.end);
		transcripts = window.gene.transcripts;

		// TODO:  Need a way of selecting the transcript that you want to
		// use when determining the variant's effect and impact (snpEff annotation)
		// For now, let's just grab the first one in the list.
		if (!selectedTranscript) {
			selectedTranscript = getCanonicalTranscript();
			geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
			cacheCodingRegions();

		}
	}


	// Show the gene transcripts.
    // Compress the tracks if we have more than 10 transcripts
    if (transcripts.length > 10) {
    	transcriptChart.trackHeight(10);
    	transcriptChart.cdsHeight(8);
    } else {
    	transcriptChart.trackHeight(16);
    	transcriptChart.cdsHeight(12);
    }

    if (transcriptViewMode == "single") {
    	transcripts = [selectedTranscript];
	} 


	selection = d3.select("#gene-viz").datum(transcripts);    
	transcriptChart(selection);

	d3.selectAll("#transcript-menu-item .transcript").remove();
	selection = d3.select("#transcript-menu-item").datum(window.gene.transcripts);
	transcriptMenuChart(selection);

    if (transcriptViewMode == "single") {
    	var cache = $('#transcript-dropdown-button').children();
   		$('#transcript-dropdown-button').text(selectedTranscript.transcript_id).append(cache);
   		d3.select('#transcript-menu-item .transcript.current').classed("current", false);
   		getTranscriptSelector(selectedTranscript).attr("class", "transcript current");
	} 

	d3.select("#gene-viz .x.axis .tick text").style("text-anchor", "start");

	window.readjustCards();
}

function getTranscriptSelector(selectedTranscript) {
	var selector = '#transcript-menu-item #transcript_' + selectedTranscript.transcript_id.split(".").join("_");
	return $(selector);
}

function addVariantCard() {

	var variantCard = new VariantCard();
	variantCards.push(variantCard);	

	var cardIndex = variantCards.length - 1;
	var defaultName = " ";

	// TODO:  Should really test to make sure that first card is proband, but
	var cardSelectorString = null;
	if (cardIndex == 0) {
		
		$('#proband-variant-card').append(variantCardTemplate());  
		cardSelectorString = "#proband-variant-card .variant-card:eq(" + cardIndex + ")" ;

	} else {
		$('#other-variant-cards').append(variantCardTemplate());  
		cardSelectorString = "#other-variant-cards .variant-card:eq(" + (+cardIndex - 1) + ")" ;
	}

	var d3CardSelector = d3.selectAll(".variant-card").filter(function(d, i) { return i == +cardIndex; });


	variantCard.init($(cardSelectorString), d3CardSelector, cardIndex);
	variantCard.setName(defaultName);


}

function callVariants() {

	fulfilledTrioPromise = false;
	variantCards.forEach(function(vc) {
		vc.clearCalledVariants();
		vc.callVariants(regionStart, regionEnd);
	});
}

function enableCallVariantsButton() {
	var bamCount = 0;
	variantCards.forEach( function (vc) {
		if (vc.isBamLoaded()) {
			bamCount++;
		} 
	});
	if (bamCount > 0) {
		if (!isLevelEdu) {
			$('#button-find-missing-variants').removeClass("hide");
		}
	} else {
		$('#button-find-missing-variants').addClass("hide");
	}

}

function loadSibs(sibs, affectedStatus) {
	variantCardsSibs[affectedStatus] = [];

	if (sibs) {
		sibs.forEach( function(sibName) {
			var variantCard = new VariantCard();	

			variantCard.model          = new VariantModel();	


			variantCard.model.vcf            = getProbandVariantCard().model.vcf;
			variantCard.model.vcfUrlEntered  = getProbandVariantCard().model.vcfUrlEntered;
			variantCard.model.vcfFileOpened  = getProbandVariantCard().model.vcfFileOpened;	
			variantCard.model.getVcfRefName  = getProbandVariantCard().model.getVcfRefName;
			variantCard.model.vcfRefNamesMap = getProbandVariantCard().model.vcfRefNamesMap;


			variantCard.setRelationship("sibling");
			variantCard.setAffectedStatus(affectedStatus);
			variantCard.setSampleName(sibName);
			variantCard.setName(sibName);

			var cards = variantCardsSibs[affectedStatus];
			cards.push(variantCard);
		});		
	}

}


/**
 *  Every time app gets variant data back, th app determines (via promise) if we have
 *  the full trio of returned.  When this occurs, the app will compare the 
 *  proband variants to mother and father to flag recessive and de nove modes of
 *  inheritance.  Then the app will compare the proband variants to unaffected sibs
 *  to determine of any recessive variants on the proband are hom-ref or het-alt on the
 *  unaffected sibs.  These recessive variants on the proband are flagged, indicating
 *  that these variants are more likely to be causative.  (If any of the unaffected sibs
 *  reported the same recessive variant, the variant would unlikely be causative.)
 *  We also determine the max allele count across all variants in the trio so that
 *  the tooltip can show a scaled allele count bar, with the max width set to the
 *  highest total (alt + ref) allele count.
 *
 */
function promiseDetermineInheritance(promise) {	

	return new Promise( function(resolve, reject) {
		var thePromise = null;
		if (promise == null) {
			thePromise = promiseFullTrio;
		} else {
			thePromise = promise;
		}
		thePromise().then( function(probandVariantCard) {
			if (!fulfilledTrioPromise) {
				fulfilledTrioPromise = true;

				var probandVcfData = null;
				var motherVcfData = null;
				var fatherVcfData = null;
				variantCards.forEach( function(variantCard) {
					if (variantCard.getRelationship() == 'proband') {
						probandVcfData = variantCard.model.getVcfDataForGene(window.gene, window.selectedTranscript); 
					} else if (variantCard.getRelationship() == 'mother') {
						motherVcfData = variantCard.model.getVcfDataForGene(window.gene, window.selectedTranscript); 
					} else if (variantCard.getRelationship() == 'father') {
						fatherVcfData = variantCard.model.getVcfDataForGene(window.gene, window.selectedTranscript); 
					}
				});

				if (dataCard.mode == 'trio') {

					probandVariantCard.determineMaxAlleleCount();

					probandVariantCard.populateEffectFilters();

					probandVariantCard.refreshVariantChartAndMatrix();

					$("#matrix-panel .loader").removeClass("hide");
					$("#matrix-panel .loader .loader-label").text("Determining inheritance mode");
					$("#feature-matrix-note").addClass("hide");

					// we need to compare the proband variants to mother and father variants to determine
					// the inheritance mode.  After this completes, we are ready to show the
					// feature matrix.
					var trioModel = new VariantTrioModel(probandVcfData, motherVcfData, fatherVcfData);
					trioModel.compareVariantsToMotherFather(function() {

						probandVariantCard.determineMaxAlleleCount();
						
						probandVariantCard.refreshVariantChartAndMatrix();

						genesCard.refreshCurrentGeneBadge();

						$("#matrix-panel .loader").removeClass("hide");
						$("#matrix-panel .loader .loader-label").text("Reviewing affected and unaffected siblings");
						$("#feature-matrix-note").addClass("hide");
						determineSibStatus(trioModel, function() {
							$("#matrix-panel .loader").addClass("hide");
						    $("#matrix-panel .loader .loader-label").text("Ranking variants");
							$("#feature-matrix-note").removeClass("hide");
							probandVariantCard.refreshVariantChartAndMatrix();

							resolve();

						});


					});
				} else {
					probandVariantCard.determineMaxAlleleCount();

					probandVariantCard.populateEffectFilters();
					
					probandVariantCard.refreshVariantChartAndMatrix();	

					$("#matrix-panel .loader").addClass("hide");
					$("#feature-matrix-note").removeClass("hide");

					resolve();		
				}
			}


		},
		function(error) {
			// no need to deal with error since these are just the times
			// when we didn't yet have a full trio.
			
		});
	});
	


}



function promiseFullTrio() {
	return new Promise( function(resolve, reject) {
		var loaded = {};
		variantCards.forEach(function(vc) {
			if (vc.isLoaded()) {
				loaded[vc.getRelationship()] = vc;
			}
		});

		
		var uaSibsLoaded = true;

		if (dataCard.mode == 'trio' && loaded.proband != null
		    && loaded.mother  != null && loaded.father != null 
		    && uaSibsLoaded) {
			resolve(loaded.proband);
		} else if (dataCard.mode == 'single' && loaded.proband != null) {
			// Not sure if this is still needed for filter slide bar ?????
			var windowWidth = $(window).width();
		    var filterPanelWidth = $('#filter-track').width();

			resolve(loaded.proband);
		} else {
			reject();
		}
	});

}

function promiseFullTrioCalledVariants() {
	return new Promise( function(resolve, reject) {
		var loaded = {};
		variantCards.forEach(function(vc) {
			if (vc.isLoaded() && vc.variantsHaveBeenCalled()) {
				loaded[vc.getRelationship()] = vc;
			}
		});
		
		if (dataCard.mode == 'trio' && loaded.proband != null
		    && loaded.mother  != null && loaded.father != null) {
			resolve(loaded.proband);
		} else if (dataCard.mode == 'single' && loaded.proband != null) {
			resolve(loaded.proband);
		} else {
			reject();
		}
	});

}

function determineSibStatus(trioModel, onStatusUpdated) {
	var me = this;
	// Now compare the unaffected sibs to the variant to flag variants
	// common to unaffected sibs + proband
	variantCardsSibsTransient = [];
	me.variantCardsSibs['unaffected'].forEach( function(vc) {
		variantCardsSibsTransient.push(vc);
	})
	var sibsData = [];
	nextLoadSib(trioModel, 'unaffected', sibsData, function() {

		// Now compare the affected sibs to the variant to flag variants
		// common to unaffected sibs + proband
		variantCardsSibsTransient = [];
		me.variantCardsSibs['affected'].forEach( function(vc) {
			variantCardsSibsTransient.push(vc);
		})
		sibsData = [];
		sibsData.length = 0;

		nextLoadSib(trioModel, 'affected', sibsData, function() {
		 	onStatusUpdated();
		});


	});

}

function nextLoadSib(trioModel, affectedStatus, sibsData, onStatusUpdated) {
	if (variantCardsSibsTransient.length > 0) {
		variantCard = variantCardsSibsTransient.shift();

		variantCard.loadVariantsOnly( function(vcfData) {
			sibsData.push(vcfData)
			nextLoadSib(trioModel, affectedStatus, sibsData, onStatusUpdated);
		});		
	} else {
		var sibsCount = window.variantCardsSibs[affectedStatus].length;
		trioModel.determineSibsStatus(sibsData, affectedStatus, sibsCount, onStatusUpdated);
	}
}

function isDataLoaded() {
	var hasData = false;
	if (dataCard.mode == 'single') {
		if (getProbandVariantCard().isReadyToLoad()) {
			hasData = true;
		}
	} else if (dataCard.mode == 'trio') {
		if (getVariantCard('proband').isReadyToLoad() && getVariantCard('mother').isReadyToLoad() && getVariantCard('father').isReadyToLoad()) {
			hasData = true;
		}
	}
	return hasData;
}

function enableLoadButton() {
	var enable = false;

	var cards = {};
	variantCards.forEach(function(vc) {
		cards[vc.getRelationship()] = vc;
	});


	if (dataCard.mode == 'single') {
		if (cards['proband'].isReadyToLoad()) {
			enable = true;
		}
	} else if (dataCard.mode == 'trio') {
		if (cards['proband'].isReadyToLoad() && cards['mother'].isReadyToLoad() && cards['father'].isReadyToLoad()) {
			enable = true;
		}
	}
	if (enable) {
		$('#data-card').find('#ok-button').removeClass("disabled");
	} else {
		$('#data-card').find('#ok-button').addClass("disabled");
	}
}

function disableLoadButton() {
	$('#data-card').find('#ok-button').addClass("disabled");
	
}





function showCircleRelatedVariants(variant, sourceVariantCard) {
	variantCards.forEach( function(variantCard) {
		if (variantCard.isViewable()) {
			variantCard.hideVariantCircle();
			variantCard.showVariantCircle(variant, sourceVariantCard);
			variantCard.showCoverageCircle(variant, sourceVariantCard);
		}
	});
}

function hideCircleRelatedVariants() {
	variantCards.forEach( function(variantCard) {
		if (variantCard.isViewable()) {
			variantCard.hideVariantCircle();
			variantCard.hideCoverageCircle();
		}
	});
}




function orderVariantsByPosition(a, b) {
	var refAltA = a.type.toLowerCase() + " " + a.ref + "->" + a.alt;
	var refAltB = b.type.toLowerCase() + " " + b.ref + "->" + b.alt;

	if (a.start == b.start) {
		if (refAltA == refAltB) {
			return 0;
		} else if ( refAltA < refAltB ) {
			return -1;
		} else {
			return 1;
		}
	} else if (a.start < b.start) {
		return -1;
	} else {
		return 1;
	}
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function percentage(a) {
	var pct = a * 100;
	var places = 0;
	if (pct < .001) {
		places = 4;
	} else if (pct < .01) {
		places = 3;
	} else if (pct < .1) {
		places = 2
	} else if (pct < 1) {
		places = 1;
	} else {
		places = 0;
	}
	return round(pct, places) + "%";
}

function round(value, places) {
  return +(Math.round(value + "e+" + places)  + "e-" + places);
}

function splitArray(a, n) {
    var len = a.length,out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i + size));
        i += size;
    }
    return out;
}

function getRsId(variant) {
	var rsId = null;
	if (variant.hasOwnProperty('vepVariationIds') && variant.vepVariationIds != null) {
		for (var key in variant.vepVariationIds) {
			if (key != 0 && key != '') {
				var tokens = key.split("&");
				tokens.forEach( function(id) {
					if (id.indexOf("rs") == 0) {
						rsId = id;
					}
				});
			}
		}			
	}
	return rsId;		
}


function filterVariants() {
	variantCards.forEach( function(variantCard) {
		if (variantCard.isViewable()) {

			variantCard.filterVariants();
  			variantCard.filterCalledVariants();
  			
  			if (variantCard.getRelationship() == 'proband') {
		  		variantCard.fillFeatureMatrix(regionStart, regionEnd);
  			}
		}

	});

}


function bookmarkVariant() {
	if (clickedVariant) {
		this.bookmarkCard.bookmarkVariant(clickedVariant);
		this.bookmarkCard.refreshBookmarkList();
	} else if (examineCard.examinedVariant != null) {
		this.bookmarkCard.bookmarkVariant(examineCard.examinedVariant);
		this.bookmarkCard.refreshBookmarkList();
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
		//window.location.reload();
		startOver();
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


 