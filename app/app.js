//
// Global Variables
//
//var geneiobio_server = "http://localhost:3000/";
var geneiobio_server = "http://geneinfo.iobio.io/";
var phenolyzerServer = "http://nv-dev.iobio.io/phenolyzer/"


// Engine for gene search suggestions
var gene_engine = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  local: [],
  limit: 20
});

// Handlebar templates
var dataCardEntryTemplate = null;
var filterCardTemplate = null;
var variantCardTemplate = null;
var phenolyzerTemplate = null;


// The selected (sub-) region of the gene.  Null
// when there is not an active selection.
var regionStart = null;
var regionEnd = null;
var GENE_REGION_BUFFER = 1000;
var GENE_REGION_BUFFER_MAX = 50000;

// Transcript data and chart
var gene = '';
var geneNames = [];
var geneAnnots = {};
var loadedUrl = false;
var selectedTranscript = null;
var selectedTranscriptCodingRegions = [];
var transcriptChart =  null;
var transcriptViewMode = "single";
var transcriptMenuChart = null;
var transcriptPanelHeight = null;
var transcriptCollapse = true;
var firstTimeGeneLoaded = true;

// data card
var dataCard = new DataCard();

// filter card
var filterCard = new FilterCard();


// matrix card
var matrixCard = new MatrixCard();


// clicked variant
var clickedVariant = null;


// Format the start and end positions with commas
var formatRegion = d3.format(",");

// variant cardd
var variantCards = [];

// variant cards for unaffected sibs 
var variantCardsUnaffectedSibs = [];
var variantCardsUnaffectedSibsTransient = [];

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
		filterCardTemplate = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/variantCardTemplate.hbs').then(function(compiledTemplate) {
		variantCardTemplate = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/geneBadgeTemplate.hbs').then(function(compiledTemplate) {
		geneBadgeTemplate = compiledTemplate;
	}));
	promises.push(promiseLoadTemplate('templates/phenolyzerTemplate.hbs').then(function(compiledTemplate) {
		phenolyzerTemplate = compiledTemplate;
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

	// Clear the local cache
 	if (localStorage) {
       localStorage.clear(); 		
 	}


	// Initialize material bootstrap
    $.material.init();

    // Initialize app tour
	pageGuide = tl.pg.init({ 
		'auto_refresh': true, 
		'custom_open_button': '.open_page_guide' 
    }); 

	// Initialize data card
	dataCard = new DataCard();
	dataCard.init();

	// Stop event propogation to get genes dropdown
	// so that clicks in text area for copy/paste
	// don't cause dropdown to close
	$('#get-genes-dropdown ul li#copy-paste-li').on('click', function(event){
	    //The event won't be propagated to the document NODE and 
	    // therefore events delegated to document won't be fired
	    event.stopPropagation();
	});
	// Enter in copy/paste textarea should function as submit
	$('#get-genes-dropdown ul li#copy-paste-li').keyup(function(event){

		if((event.which== 13) && ($(event.target)[0]== $("textarea#genes-to-copy")[0])) {
			event.stopPropagation();
			copyPasteGenes();
		}
	});
	$('#get-genes-dropdown ul li#phenolyzer-li').on('click', function(event){
	    //The event won't be propagated to the document NODE and 
	    // therefore events delegated to document won't be fired
	    event.stopPropagation();
	});
	// Enter in copy/paste textarea should function as submit
	$('#get-genes-dropdown ul li#phenolyzer-li').keyup(function(event){

		if((event.which== 13) && ($(event.target)[0]== $("textarea#phenolyzer-search-terms")[0])) {
			event.stopPropagation();
			getPhenolyzerGenes();
		}
	});

	// Detect when get genes dropdown opens so that
	// we can prime the textarea with the genes already
	// selected
	$('#get-genes-dropdown').click(function () {
	    if($(this).hasClass('open')) {
	        // dropdown just closed
	    } else {
	    	// dropdown will open
	    	initCopyPasteGenes();
	    	setTimeout(function() {
			  $('#genes-to-copy').focus();
			}, 0);
	    	
	    }
	});


	
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

			var probandVariantCard = null;
			variantCards.forEach(function(variantCard) {
		    	variantCard.onBrush(brush);
		    	if (variantCard.getRelationship() == 'proband') {
		    		probandVariantCard = variantCard;
		    	}
			});
			if (probandVariantCard) {
				probandVariantCard.fillFeatureMatrix(regionStart, regionEnd);
			}

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
	    	cacheCodingRegions();

	    	showTranscripts();

			variantCards.forEach(function(variantCard) {
		    	variantCard.loadTracksForGene();
			});

	    });



	 // Initialize Matrix card
	 matrixCard = new MatrixCard();
	 matrixCard.init();
	 // Set the tooltip generator now that we have a variant card instance
	 matrixCard.setTooltipGenerator(getProbandVariantCard().variantTooltipHTML);

	 // Initialize the Filter card
	 filterCard = new FilterCard();
	 filterCard.init();


	// Initialize transcript view buttons
	initTranscriptControls();

	// endsWith implementation
	if (typeof String.prototype.endsWith !== 'function') {
	    String.prototype.endsWith = function(suffix) {
	        return this.indexOf(suffix, this.length - suffix.length) !== -1;
	    };
	}

	// Slide out panels
	$('.main').click(function() {
	});
	$('#close-slide-left').click(function() {
		closeFilterSlideLeft();
	});
	$('#close-slide-left-phenolyzer').click(function() {
		closePhenolyzerSlideLeft();
	});
	$('#close-slide-top').click(function() {
		closeSampleSlideDown();
	});

	// for testing phenolyzer bar chart
	/*
	phenolyzerGenes = [
	{geneName: 'RAI1', score: +.93, selected: "true"}, 
	{geneName:'BRCA2', score: +.50, selected: "true"}, 
	{geneName: 'BRCA1', score: +.33 }];
	showPhenolyzerSlideLeft();
	*/
	

	loadGeneFromUrl();
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


function adjustDatacardSlider() {
	var top = +$('#nav-section').height();
	var sliderTopHeight = +$('#slider-top').height();
	$('#slider-top').css('top', top);	
	$('#close-slide-top').css('top', (top + sliderTopHeight) - 37);	
	//$('#track-section').css('padding-top', (top + sliderTopHeight) + 5);	
}

function showSampleSlideDown() {
	
	$('#data-card').removeClass("hide");
	$('#slider-top').removeClass("hide");


	$('#slider-left').addClass("hide");
	$('.footer').addClass("hide");
	$('.slide-button').addClass("hide");
	$('#close-slide-top').removeClass("hide");

	$('#slide-buttons').toggleClass('slide-top');
	$('#track-section').toggleClass('slide-top');


	adjustDatacardSlider();


	var transitionEvent = whichTransitionEvent();
	$('#track-section').one(transitionEvent, function(event) {
		//var h = $("#nav-section").height();
		//var sliderTopHeight = +$('#slider-top').height();
		//$('#track-section').css("padding-top", (h + sliderTopHeight) + "px");
	});

}

function closeSampleSlideDown() {
	$('.footer').removeClass("hide");
	$('.slide-button').removeClass("hide");
	$('#close-slide-left').addClass("hide");
	$('#close-slide-left-phenolyzer').addClass("hide");
	$('#close-slide-top').addClass("hide");
	$('#slider-left').addClass("hide");
	$('#slider-left-phenolyzer').addClass("hide");
	$('#slider-top').addClass("hide");


	$('#slide-buttons').removeClass('slide-left');
	$('#container').removeClass('slide-left');

	$('#slide-buttons').removeClass('slide-top');
	$('#track-section').removeClass('slide-top');
}

function showFilterSlideLeft() {


	$('#slider-top').addClass("hide");
	$('#slider-left').removeClass("hide");
	$('.footer').addClass("hide");
	$('.slide-button').addClass("hide");
	$('#close-slide-left').removeClass("hide");


	resizeCardWidths();

	$('#slide-buttons').toggleClass('slide-left');
	$('#container').toggleClass('slide-left');

	var transitionEvent = whichTransitionEvent();
	$('.slide-left').one(transitionEvent, function(event) {
		var h = $("#nav-section").height();
		$('#track-section').css("padding-top", h + "px");
	});

}

function showPhenolyzerSlideLeft() {


	$('#slider-left-phenolyzer').html(phenolyzerTemplate());


	var geneBarChart = verticalBarChartD3()
						  .margin( {left:10, right: 10, top: 0, bottom: 0} )
	                      .xValue( function(d){ return +d.score })
						  .yValue( function(d){ return d.geneName })
						  .width(160)
						  .barHeight(15)
						  .labelWidth(60)
						  .gap(4)
						  .on('d3click', function(phenolyzerGene) {
						  	if (phenolyzerGene.selected) {
						  		addGeneBadge(phenolyzerGene.geneName, true);
						  	} else {
						  		removeGeneBadgeByName(phenolyzerGene.geneName);
						  	}
						  });

	var selection = d3.select('#phenolyzer-results').data([phenolyzerGenes]);
	geneBarChart(selection, {shadowOnHover:true});




	$('#slider-top').addClass("hide");
	$('#slider-left-phenolyzer').removeClass("hide");
	$('.footer').addClass("hide");
	$('.slide-button').addClass("hide");
	$('#close-slide-left-phenolyzer').removeClass("hide");


	resizeCardWidths();

	$('#slide-buttons').toggleClass('slide-left');
	$('#container').toggleClass('slide-left');

	var transitionEvent = whichTransitionEvent();
	$('.slide-left').one(transitionEvent, function(event) {
		var h = $("#nav-section").height();
		$('#track-section').css("padding-top", h + "px");
	});

}


function resizeCardWidths() {
	var windowWidth = $(window).width();
	var sliderWidth    = 0;
	if ($('#slider-left').hasClass("hide") == false) {
		sliderWidth = +$('#slider-left').width();
	}
	if ($('#slider-left-phenolyzer').hasClass("hide") == false) {
		sliderWidth = +$('#slider-left').width();
	}
	$('#container').css('width', windowWidth - sliderWidth - 10);
	$('#matrix-panel').css('max-width', windowWidth - sliderWidth - 35);
	$('#matrix-panel').css('min-width', windowWidth - sliderWidth - 35);
}

function closeFilterSlideLeft() {
	$('.footer').removeClass("hide");
	$('.slide-button').removeClass("hide");
	$('#close-slide-left').addClass("hide");
	$('#close-slide-top').addClass("hide");
	$('#slider-left').addClass("hide");
	$('#slider-top').addClass("hide");

	$('#slide-buttons').removeClass('slide-left');
	$('#container').removeClass('slide-left');

	$('#slide-buttons').removeClass('slide-top');
	$('#track-section').removeClass('slide-top');	

	resizeCardWidths();

	var transitionEvent = whichTransitionEvent();
	$('#container').one(transitionEvent, function(event) {
		var h = $("#nav-section").height();
		$('#track-section').css("padding-top", h + "px");
	});

}

function closePhenolyzerSlideLeft() {
	$('.footer').removeClass("hide");
	$('.slide-button').removeClass("hide");
	$('#close-slide-left-phenolyzer').addClass("hide");
	$('#close-slide-top').addClass("hide");
	$('#slider-left-phenolyzer').addClass("hide");
	$('#slider-top').addClass("hide");

	$('#slide-buttons').removeClass('slide-left');
	$('#container').removeClass('slide-left');

	$('#slide-buttons').removeClass('slide-top');
	$('#track-section').removeClass('slide-top');	

	resizeCardWidths();

	var transitionEvent = whichTransitionEvent();
	$('#container').one(transitionEvent, function(event) {
		var h = $("#nav-section").height();
		$('#track-section').css("padding-top", h + "px");
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


function getProbandVariantCard() {
	var probandCard = null;
	variantCards.forEach( function(variantCard) {
		if (variantCard.getRelationship() == 'proband') {
			probandCard = variantCard;
		}
	});
	return probandCard;
}


function onCollapseTranscriptPanel() {
	transcriptCollapse = !transcriptCollapse;
	d3.select('#track-section').style("padding-top", transcriptCollapse ? transcriptPanelHeight + "px" : "89" + "px");
	d3.select('#transcript-dropdown-button').classed("hide", !transcriptCollapse);

}

function toggleSampleTrio(show) {
	if (show) {
		dataCard.mode = 'trio';
		$('#mother-data').removeClass("hide");
		$('#father-data').removeClass("hide");
		$('#proband-data').css("width", "32%");
		if ($('#proband-data').find('#vcf-sample-select option').length > 1) {
			$('#unaffected-sibs-box').removeClass("hide");
		} else {
			$('#unaffected-sibs-box').addClass("hide");
		}
	} else {
		dataCard.mode = 'single';
		$('#proband-data').css("width", "60%");
		$('#mother-data').addClass("hide");
		$('#father-data').addClass("hide");
		$('#unaffected-sibs-box').addClass("hide");
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
		copyPasteGenes(gene);
	}

	// Load the gene
	var showTour = getUrlParameter('showTour');
	if (gene != undefined) {
		$('#bloodhound .typeahead.tt-input').val(gene).trigger('typeahead:selected', {"name": gene, loadFromUrl: true});
	} else {
		if (showTour != null && showTour == 'Y') {
			pageGuide.open();
		} else {
			$('#tourWelcome').addClass("open");
		}

	}
	
}

function loadUrlSources() {

	var bam  = getUrlParameter(/bam*/);
	var vcf  = getUrlParameter(/vcf*/);	
	var rel  = getUrlParameter(/rel*/);
	var dsname = getUrlParameter(/name*/);	
	var sample = getUrlParameter(/sample*/);



	// Initialize transcript chart and variant cards, but hold off on displaying 
	// the variant cards.
	loadTracksForGene(true);

	// get all bam and vcf url params in hash

	if ((bam != null && Object.keys(bam).length > 1) || (vcf != null && Object.keys(vcf).length > 1)) {
		toggleSampleTrio(true);
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
		loadTracksForGene();
	} else {
		showSampleSlideDown();
	}

}

function initTranscriptControls() {


	var transcriptCardSelector = $('#transcript-card');
	transcriptCardSelector.find('#expand-button').on('click', function() {
		transcriptCardSelector.find('.fullview').removeClass("hide");
		transcriptCardSelector.find('#gene-name').css("margin-left", "0");
		transcriptCardSelector.find('#gene-name').css("margin-right", "0");
		transcriptCardSelector.css("margin-top", "0");
		var windowWidth = $(window).width();
		if (windowWidth <= 800) {
			transcriptCardSelector.find('#region-track').css("cssText", "margin-left: 125px !important;");
		}
	});
	transcriptCardSelector.find('#minimize-button').on('click', function() {
		transcriptCardSelector.find('.fullview').addClass("hide");
		transcriptCardSelector.find('#gene-name').css("margin-right", "0");
		transcriptCardSelector.css("margin-top", "-10px");
		transcriptCardSelector.find('#region-track').css("cssText", "margin-left: 0px !important;");
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
			d3.selectAll("#gene-viz .transcript").remove();
		 	cacheCodingRegions();
		 	loadTracksForGene();
		 }		
	}

}

function getCanonicalTranscript() {
	var canonical;
	var maxCdsLength = 0;
	window.gene.transcripts.forEach(function(transcript) {
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
		}

	});

	if (canonical == null) {
		// If we didn't find the canonical (transcripts didn't have features), just
		// grab the first transcript to use as the canonical one.
		if (gene.transcripts != null && gene.transcripts.length > 0)
		canonical = gene.transcripts[0];
	}
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

function initCopyPasteGenes() {
	if (geneNames.length == 0 || geneNames == null) {
		$('#genes-to-copy').val("");
	} else {
		$('#genes-to-copy').val(geneNames.join(", "));
	}
}

function copyPasteGenes(geneNameToSelect) {
	var genesString = $('#genes-to-copy').val();
	// trim newline at very end
	genesString = genesString.replace(/\s*$/, "");
	var geneNameList = null;
	if (genesString.indexOf("\n") > 0) {
		geneNameList = genesString.split("\n");
	} else if (genesString.indexOf("\t") > 0 ) {
		geneNameList = genesString.split("\t");
	} else if (genesString.indexOf(",") > 0) {
		geneNameList = genesString.split(" ").join("").split(",");
	} else if (genesString.indexOf(" ") > 0) {
		geneNameList = genesString.split(" ");
	} else {
		geneNameList = [];
		geneNameList.push(genesString.trim());
	}

	geneNames = [];
	geneNameList.forEach( function(geneName) {
		if (geneName.trim().length > 0) {
			geneNames.push(geneName.trim().toUpperCase());
		}
	});

	// Remove gene badges not specified in the text area
	var geneBadgesToRemove = [];
	$('#gene-badge-container #gene-badge').each( function(index, value) {
		var badge =  $(this);
		var badgeGeneName = badge.find('#gene-badge-name').text();
		
		// If this badge does not correspond to a name in the gene list,
		// flag it to be removed		
		if (geneNames.indexOf(badgeGeneName) < 0) {
			geneBadgesToRemove.push(badgeGeneName);
		}

	});
	geneBadgesToRemove.forEach( function(geneName) {
		var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')";	
		$(selector).parent().parent().remove();
	});



	if (geneNames.length > 0) {
		$('#gene-badge-container #manage-gene-list').removeClass("hide");
	} else {
		$('#gene-badge-container #manage-gene-list').addClass("hide");
		$('#gene-badge-container #done-manage-gene-list').addClass("hide");
	}

	// Create a gene badge for each gene name in the comma separated list.
	for(var i = 0; i < geneNames.length; i++) {
		var name = geneNames[i];	
		// Only add the gene badge if it does not already exist
		var existingBadge = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + name + "')";	
		if ($(existingBadge).length == 0) {
			$('#gene-badge-container').append(geneBadgeTemplate());

			var newBadgeSelector = '#gene-badge-container #gene-badge:last-child';	
			$(newBadgeSelector).find('#gene-badge-name').text(name);
			promiseSetGeneAnnot($(newBadgeSelector), name);

		}

	}
	// If we are loading from the url, just add the class 'selected' to the gene specified in the 
	// url.  Otherwise if we are performing copy/paste from the dropdown, select the first gene in the list
	if (geneNames.length > 0 && geneNameToSelect && geneNames.indexOf(geneNameToSelect) >= 0) {
		var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneNameToSelect + "')").parent().parent();
		geneBadge.addClass("selected");
		geneBadge.find('.gene-badge-loader').removeClass('hide');
	} else if (geneNames.length > 0 && geneNameToSelect == null) {
		selectGene(geneNames[0]);
	}

	_onGeneBadgeUpdate();

	$('#get-genes-dropdown .btn-group').removeClass('open');
}

function getPhenolyzerGenes() {
	geneNames.length = 0;
	updateUrl('genes', geneNames.join(","));

	$('.phenolyzer.loader').removeClass("hide");
	var searchTerms = $('#phenolyzer-search-terms').val();
	var url = phenolyzerServer + '?cmd=' + searchTerms.split(" ").join("_");

	closePhenolyzerSlideLeft(); 
	closeFilterSlideLeft(); 

   	phenolyzerGenes = [];
	$.ajax( url ).done(function(data) {      
		$('.phenolyzer.loader').addClass("hide");
		var geneNamesString = "";
		var count = 0;
		data.split("\n").forEach( function(rec) {
			var fields = rec.split("\t");
			if (fields.length > 2) {
				var geneName  		         = fields[1];
				if (count < 30) {
					var rank                 = fields[0];
					var score                = fields[3];
					var haploInsuffScore     = fields[5];
					var geneIntoleranceScore = fields[6];
					var selected             = count <= 10 ? true : false;
					phenolyzerGenes.push({rank: rank, geneName: geneName, score: score, haploInsuffScore: haploInsuffScore, geneIntoleranceScore: geneIntoleranceScore, selected: selected});					
				}				
				count++;

			}
		});
		closePhenolyzerSlideLeft(); 
		closeFilterSlideLeft(); 

		showPhenolyzerSlideLeft();
		// Just show top 10 for now
		var selectedGenes = phenolyzerGenes.filter( function(phenGene) { return phenGene.selected == true});
		var genesString = "";
		selectedGenes.forEach( function(g) {
			if (genesString.length > 0) {
				genesString += ",";
			}
			genesString += g.geneName;
		})
		$('#genes-to-copy').val(genesString);
		copyPasteGenes();
	});

	$('#get-genes-dropdown .btn-group').removeClass('open');

}

function _onGeneBadgeUpdate() {
	// Only show the gene badges if there is more than one gene in the list
	if (geneNames.length > 1) {
		$('#gene-badge-container').removeClass("hide");
	} else {
		$('#gene-badge-container').addClass("hide");		
	}

	// Update the url with the gene list
	updateUrl('genes', geneNames.join(","));

}

function promiseSetGeneAnnot(geneBadgeSelector, name) {
	return new Promise( function(resolve, reject) {
		// Get the gene info (name, description) from ncbi
		promiseGetGeneAnnotation(name).then( function(geneAnnot) {
			geneBadgeSelector.find('#gene-badge-button').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
			geneAnnots[name] = geneAnnot;
			resolve(geneAnnot);

		}, function(error) {
			reject("problem getting gene info from ncbi. " + error);
		});

	});
}

function removeGeneBadgeByName(theGeneName) {
	var index = geneNames.indexOf(theGeneName);
	if (index >= 0) {
		geneNames.splice(index, 1);
		var geneBadgeName = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + theGeneName + "')";	
		$(geneBadgeName).parent().parent().remove();
		_onGeneBadgeUpdate();
	}

}


function removeGeneBadge(badgeElement) {
	var theGeneName = $(badgeElement).parent().find("#gene-badge-name").text();
	var index = geneNames.indexOf(theGeneName);
	if (index >= 0) {
		geneNames.splice(index, 1);
		$(badgeElement).parent().remove();

		_onGeneBadgeUpdate();
	}

}

function addGeneBadge(geneName, bypassSelecting) {
	var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')";	
	if ($(selector).length == 0) {
		$('#gene-badge-container').append(geneBadgeTemplate());
		$("#gene-badge-container #gene-badge:last-child").find('#gene-badge-name').text(geneName);

		promiseSetGeneAnnot($("#gene-badge-container #gene-badge:last-child"), geneName);

		geneNames.push(geneName);

		if (!bypassSelecting) {
			$(selector).parent().find('.gene-badge-loader').removeClass("hide");
			$("#gene-badge.selected").removeClass("selected");		
			$(selector).parent().parent().addClass("selected");			
		}

		$('#gene-badge-container #manage-gene-list').removeClass("hide");
	
	}
	_onGeneBadgeUpdate();

}

function refreshGeneBadges() {
	var dangerObject = getProbandVariantCard().summarizeDanger();
	_setGeneBadgeGlyphs(dangerObject);
			 	
}

function _setGeneBadgeGlyphs(dangerObject) {
	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + gene.gene_name + "')").parent().parent();
	geneBadge.find('#gene-badge-circle').removeClass('btn-success');
	geneBadge.find('#gene-badge-circle').removeClass('mdi-action-done');
	geneBadge.find('#gene-badge-circle').removeClass('btn-default');

	geneBadge.find('.gene-badge-loader').addClass('hide');

	geneBadge.find('#gene-badge-danger-count').removeClass("impact_HIGH");
	geneBadge.find('#gene-badge-danger-count').removeClass("impact_MODERATE");
	geneBadge.find('#gene-badge-danger-count').removeClass("impact_MODIFIER");
	geneBadge.find('#gene-badge-danger-count').removeClass("impact_LOW");
	geneBadge.find('#gene-badge-button svg').remove();

	geneBadge.addClass("visited");		
	geneBadge.addClass("selected");		
	
	var doneWithImpact = false;
	for (dangerKey in dangerObject) {
		if (dangerKey == 'HIGH' || dangerKey == 'MODERATE') {
			if (dangerObject[dangerKey] != 0 && !doneWithImpact) {
				geneBadge.find('#gene-badge-symbols').append(
				"<svg height=\"12\" width=\"14\"> <g transform=\"translate(1,3)\"> <rect width=\"7\" height=\"7\" class=\"filter-symbol " + "impact_" + dangerKey + "\" style=\"pointer-events: none;\"></rect></g></svg"
				);
				doneWithImpact = true;
			}						
		} else if (dangerKey == 'CLINVAR') {
			var clinvarLevel = dangerObject[dangerKey];
			if (clinvarLevel != null) {
				geneBadge.find('#gene-badge-symbols').append("<svg class=\"clinvar-badge\" height=\"12\" width=\"14\">");
				var selection = d3.select(geneBadge.find('#gene-badge-symbols .clinvar-badge')[0]).data([{width:10, height:10, transform: 'translate(0,1)', clazz: clinvarLevel}]);
				matrixCard.showClinVarSymbol(selection);				
			}

		} else if (dangerKey == 'SIFT') {
			var siftLevel = dangerObject[dangerKey];
			if (siftLevel != null) {
				geneBadge.find('#gene-badge-symbols').append("<svg class=\"sift-badge\" height=\"12\" width=\"14\">");
				var selection = d3.select(geneBadge.find('#gene-badge-symbols .sift-badge')[0]).data([{width:11, height:11, transform: 'translate(0,1)', clazz: siftLevel}]);
				matrixCard.showSiftSymbol(selection);				
			}

		} else if (dangerKey == 'POLYPHEN') {			
			var polyphenLevel = dangerObject[dangerKey];
			if (polyphenLevel != null) {
				geneBadge.find('#gene-badge-symbols').append("<svg class=\"polyphen-badge\" height=\"12\" width=\"14\">");
				var selection = d3.select(geneBadge.find('#gene-badge-symbols .polyphen-badge')[0]).data([{width:10, height:10, transform: 'translate(0,2)', clazz: polyphenLevel}]);
				matrixCard.showPolyPhenSymbol(selection);				
			}

		}
	}
}

function selectGeneBadge(badgeElement) {
	//var badge = $(badgeElement).parent().parent();
	var badge = $(badgeElement).parent();
	var theGeneName = badge.find("#gene-badge-name").text();	
	selectGene(theGeneName);

}

function selectGene(geneName) {
	$('.typeahead.tt-input').val(geneName);
	
	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
	
	$("#gene-badge.selected").removeClass("selected");
	geneBadge.addClass("selected");
	
	$(".gene-badge-loader").each( function(index, value) {
		$(this).addClass("hide");
	});
	geneBadge.find('.gene-badge-loader').removeClass('hide');


	var url = geneiobio_server + 'api/gene/' + geneName;
	
	$.ajax({
	    url: url,
	    jsonp: "callback",
	    type: "GET",
	    dataType: "jsonp",
	    success: function( response ) {

	    	if (response[0].hasOwnProperty('gene_name')) {
		    	// We have successfully return the gene model data.
		    	// Load all of the tracks for the gene's region.
		    	window.gene = response[0];		

		    	// Save off the original start and end before we adjust for upstream/downstream regions
		    	window.gene.startOrig = window.gene.start;
		    	window.gene.endOrig = window.gene.end;  
		    	window.selectedTranscript = null;

		    	updateUrl('gene', window.gene.gene_name);

		    	updateGeneInfoLink(window.gene.gene_name);

		    	loadTracksForGene();
	    	} else {
	    		alertify.error("Gene " + geneName + " not found.  Removing from list.", 
				      		    function (e) {
				     			});
			    var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')";	
				//$(selector).parent().remove();
				$(selector).parent().parent().remove();
				var index = geneNames.indexOf(geneName);
				geneNames.splice(index, 1);

	    	}

	    }
	 });
}

function updateGeneInfoLink(geneName) {
	var setSelectedGeneLink = function(geneAnnot) {
		$('#nav-section #bloodhound #enter-gene-name').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
		$('#nav-section #gene-name').attr("href", 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + geneAnnot.name);					
		$('#nav-section #gene-name').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
	}
	var geneAnnot = geneAnnots[geneName];
	if (geneAnnot == null) {
		var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
		promiseSetGeneAnnot(geneBadge, geneName).then( function(data) {
			geneAnnot = data;
			setSelectedGeneLink(geneAnnot)
		}, function(error) {
			console.log("error getting gene annot gene gene badge selected. " + error)
		});
	} else {
		setSelectedGeneLink(geneAnnot);
	}

}

function manageGeneList(manage) {
	if (manage) {
		$('#gene-badge-container').addClass('manage');
		$('#manage-gene-list').addClass('hide');
		$('#done-manage-gene-list').removeClass('hide');		
	} else {
		$('#gene-badge-container').removeClass('manage');
		$('#manage-gene-list').removeClass('hide');
		$('#done-manage-gene-list').addClass('hide');		
	}
}


function adjustGeneRegionBuffer() {
	if (+$('#gene-region-buffer-input').val() > GENE_REGION_BUFFER_MAX) {
		alert("Up to 50 kb upstream/downstream regions can be displayed.")
	} else {
		GENE_REGION_BUFFER = +$('#gene-region-buffer-input').val();
		$('#bloodhound .typeahead.tt-input').val(gene.gene_name).trigger('typeahead:selected', {"name": gene.gene_name, loadFromUrl: false});		
	}

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
	window.history.pushState({'index.html' : 'bar'},null,'?'+search.join('&'));	
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
	window.history.pushState({'index.html' : 'bar'},null,'?'+search.join('&'));	
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

		
		$.ajax({
		    url: url,
		    jsonp: "callback",
		    type: "GET",
		    dataType: "jsonp",
		    success: function( response ) {

		    	// We have successfully return the gene model data.
		    	// Load all of the tracks for the gene's region.
		    	window.gene = response[0];		

		    	// Add the gene badge
		    	addGeneBadge(window.gene.gene_name);					
			    	
		    	// Save off the original start and end before we adjust for upstream/downstream regions
		    	window.gene.startOrig = window.gene.start;
		    	window.gene.endOrig = window.gene.end;    
		    	
		    	// set all searches to correct gene	
		    	$('.typeahead.tt-input').val(window.gene.gene_name);
		    	window.selectedTranscript = null;
		    	

		    	if (data.loadFromUrl) {
		    		var bam  = getUrlParameter(/bam*/);
					var vcf  = getUrlParameter(/vcf*/);	

					if (bam == null && vcf == null) {
						$('#tourWelcome').addClass("open");
					}

			    	updateGeneInfoLink(window.gene.gene_name);

		    		// Autoload data specified in url
					loadUrlSources();

					enableCallVariantsButton();						
		    	} else {
	
					$('#tourWelcome').removeClass("open");
					
			    	loadTracksForGene();
			    	// add gene to url params
			    	updateUrl('gene', window.gene.gene_name);


			    	updateGeneInfoLink(window.gene.gene_name);



					if (firstTimeGeneLoaded) {
						showSampleSlideDown();
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

	regionStart = null;
	regionEnd = null;
	fulfilledTrioPromise = false;

	filterCard.snpEffEffects = new Object();
	filterCard.vepConsequences = new Object();

	$("#region-flag").addClass("hide");

//	$('#data-card').removeClass("hide");
	$('#transcript-card').removeClass("hide");

    $('#gene-track').removeClass("hide");
    $('#view-finder-track').removeClass("hide");
	//$('#datasource-button').css("visibility", "visible");
	$('#transcript-btn-group').removeClass("hide");

	d3.select("#region-chart .x.axis .tick text").style("text-anchor", "start");
	var h = d3.select("#nav-section").node().offsetHeight;
	d3.select('#track-section').style("padding-top", h + "px");


	d3.select('#impact-scheme').classed("current", true);
	d3.select('#effect-scheme' ).classed("current", false);
	d3.selectAll(".impact").classed("nocolor", false);
	d3.selectAll(".effect").classed("nocolor", true);
	
	gene.regionStart = formatRegion(window.gene.start);
	gene.regionEnd   = formatRegion(window.gene.end);

    $('#gene-chr').text(window.gene.chr);
    $('#gene-name').text(window.gene.gene_name);   
    $('#gene-region').text(window.gene.startOrig + "-" + window.gene.endOrig);


	if (window.gene.gene_type == 'protein_coding') {
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


    // Open up gene region to include upstream and downstream region;
	window.gene.start = window.gene.startOrig < GENE_REGION_BUFFER ? 0 : window.gene.startOrig - GENE_REGION_BUFFER;
	// TODO: Don't go past length of reference
	window.gene.end   = window.gene.endOrig + GENE_REGION_BUFFER;

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
	if (window.selectedTranscript == null || window.selectedTranscript.transcript_type == 'protein_coding') {
		$('#non-protein-coding #transcript-type-badge').addClass("hide");
	} else {
		if (window.gene.gene_type != window.selectedTranscript.transcript_type) {
			$('#non-protein-coding #transcript-type-badge').removeClass("hide");
			$('#non-protein-coding #transcript-type-badge').text(window.selectedTranscript.transcript_type + ' transcript');
		} else {
			$('#non-protein-coding #transcript-type-badge').addClass("hide");
		}
	}


	$("#matrix-panel .loader").removeClass("hide");
	$("#feature-matrix").addClass("hide");
	$("#feature-matrix-note").addClass("hide");



	filterCard.disableFilters();
	

	if (bypassVariantCards == null || !bypassVariantCards) {
	 	variantCards.forEach(function(variantCard) {
	 		if (dataCard.mode == 'single' && variantCard.getRelationship() != 'proband') {
				variantCard.hide();
			} else {
			 	variantCard.loadTracksForGene(filterCard.classifyByImpact, function(dangerCounts) {
			 	});
			}
		});
	}
	

	transcriptPanelHeight = d3.select("#nav-section").node().offsetHeight;


	
}

function promiseGetGeneAnnotation(geneName) {
    return new Promise( function(resolve, reject) {

      var url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&usehistory=y&retmode=json&term=";
      url += "(" + geneName + "[Gene name]" + " AND 9606[Taxonomy ID]";

      var clinvarVariants = null;
      $.ajax( url )
        .done(function(data) {        
          var webenv = data["esearchresult"]["webenv"];
          var queryKey = data["esearchresult"]["querykey"];
          var summaryUrl = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&query_key=" + queryKey + "&retmode=json&WebEnv=" + webenv + "&usehistory=y"
          $.ajax( summaryUrl )
            .done(function(sumData) { 
              
              if (sumData.result == null || sumData.result.uids.length == 0) {
                if (sumData.esummaryresult && sumData.esummaryresult.length > 0) {
                  sumData.esummaryresult.forEach( function(message) {
                    console.log(message);
                  });
                }
                reject("No data returned from eutils request " + summaryUrl);
                
              } else {
                var uid = sumData.result.uids[0];
                var geneInfo = sumData.result[uid];
                resolve(geneInfo);
              }
            })
            .fail(function() {
              reject('Error: gene info http request failed to get gene summary data');
            })
        })
        .fail(function() {
          reject('Error: gene info http request failed to get IDs');
        })
    });
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
				return true;
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
    	var cache = $('#transcript-dropdown-button').children();
   		$('#transcript-dropdown-button').text(selectedTranscript.transcript_id).append(cache);
   		getTranscriptSelector(selectedTranscript).attr("class", "transcript selected");
	} 


	selection = d3.select("#gene-viz").datum(transcripts);    
	transcriptChart(selection);

	selection = d3.select("#transcript-menu-item").datum(window.gene.transcripts);
	transcriptMenuChart(selection);

	d3.select("#gene-viz .x.axis .tick text").style("text-anchor", "start");

	// update track starting position after transcripts have been rendered
	var h = d3.select("#nav-section").node().offsetHeight;
	d3.select('#track-section').style("padding-top", h + "px");
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
		$('#button-find-missing-variants').removeClass("hide");
	} else {
		$('#button-find-missing-variants').addClass("hide");
	}

}

function loadUnaffectedSibs(unaffectedSibs) {
	variantCardsUnaffectedSibs.length = 0;

	if (unaffectedSibs) {
		unaffectedSibs.forEach( function( unaffectedSibName) {
			var variantCard = new VariantCard();	

			variantCard.model          = new VariantModel();	


			variantCard.model.vcf            = getProbandVariantCard().model.vcf;
			variantCard.model.vcfUrlEntered  = getProbandVariantCard().model.vcfUrlEntered;
			variantCard.model.vcfFileOpened  = getProbandVariantCard().model.vcfFileOpened;	
			variantCard.model.getVcfRefName  = getProbandVariantCard().model.getVcfRefName;
			variantCard.model.vcfRefNamesMap = getProbandVariantCard().model.vcfRefNamesMap;


			variantCard.setRelationship("sibling");
			variantCard.setSampleName(unaffectedSibName);
			variantCard.setName(unaffectedSibName);

			variantCardsUnaffectedSibs.push(variantCard);

			variantCard.loadVariantsOnly(function(vc) {
			});

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
				if (dataCard.mode == 'trio') {
					var windowWidth = $(window).width();
					var filterPanelWidth = $('#filter-track').width();
					//$('#matrix-panel').css("max-width", (windowWidth - filterPanelWidth) - 60);

					// we need to compare the proband variants to mother and father variants to determine
					// the inheritance mode.  After this completes, we are ready to show the
					// feature matrix.
					compareVariantsToPedigree(function() {

						probandVariantCard.determineMaxAlleleCount();
						
						probandVariantCard.onVariantDataChange();

						determineUnaffectedSibStatus();

						probandVariantCard.onVariantDataChange();

						resolve();

					});
				} else {
					var windowWidth = $(window).width();
					var filterPanelWidth = $('#filter-track').width();
					$('#matrix-panel').css("max-width", (windowWidth - filterPanelWidth) - 60);

					probandVariantCard.determineMaxAlleleCount();
					
					probandVariantCard.onVariantDataChange();	

					resolve();		
				}
			}


		},
		function(error) {
			// no need to deal with error since these are just the times
			// when we didn't yet have a full trio.
			reject(error);
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

		var uaCount = 0;
		variantCardsUnaffectedSibs.forEach(function(vc) {
			if (vc.isLoaded()) {
				uaCount++;
			}
		});

		var uaSibsLoaded = false;
		if (uaCount == variantCardsUnaffectedSibs.length) {
			uaSibsLoaded = true;
		}

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

function determineUnaffectedSibStatus() {
	// Now compare the unaffected sibs to the variant to flag variants
	// common to unaffected sibs + proband
	variantCardsUnaffectedSibsTransient = [];
	variantCardsUnaffectedSibs.forEach( function(vc) {
		variantCardsUnaffectedSibsTransient.push(vc);
	})
	nextCompareToUnaffectedSib();

	getProbandVariantCard().determineUnaffectedSibsStatus();
}

function nextCompareToUnaffectedSib() {
	if (variantCardsUnaffectedSibsTransient.length > 0) {
		variantCard = variantCardsUnaffectedSibsTransient.shift();

		variantCard.loadVariantsOnly( function(vc) {
			promiseComparedToUnaffectedSib(variantCard).then( function() {
				nextCompareToUnaffectedSib();
			});
		});		
	} 
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


function compareVariantsToPedigree(callback) {
	var probandVariantCard = null;
	var motherVariantCard = null;
	var fatherVariantCard = null;
	variantCards.forEach( function(variantCard) {
		if (variantCard.getRelationship() == 'proband') {
			probandVariantCard = variantCard; 
		} else if (variantCard.getRelationship() == 'mother') {
			motherVariantCard = variantCard;
		} else if (variantCard.getRelationship() == 'father') {
			fatherVariantCard = variantCard;
		}
	});

	var theVcfData = probandVariantCard.model.getVcfData();

	// Only continue with comparison if mother and father
	// variant cards are present
	if (motherVariantCard == null || fatherVariantCard == null) {
		callback(theVcfData);
		return;
	} 

	// Clear out the inheritance, mother/father zygosity, mother/father genotype fields 
	// stored in proband variants
	theVcfData.features.forEach(function(variant) {
		variant.compareMother = null;
		variant.compareFather = null;
		variant.inheritance = 'none';
		variant.fatherZygosity = null;
		variant.motherZygosity = null;
		variant.genotypeAltCountFather = null;
		variant.genotypeRefCountFather = null;
		variant.genotypeDepthFather    = null;
		variant.genotypeAltCountMother = null;
		variant.genotypeRefCountMother = null;
		variant.genotypeDepthMother    = null;

	});

	// Sort the variants
	theVcfData.features = theVcfData.features.sort(orderVariantsByPosition);

	// Compare the proband's variants to the mother's variants
	motherVariantCard.promiseCompareVariants(
		theVcfData,
	    // This is the attribute on variant a (proband) and variant b (mother)
		// that will store whether the variant is unique or matches.
    	'compareMother',
    	// This is the attribute on the proband variant that will store the
		// mother's zygosity in the case where the variant match
		'motherZygosity',
    	// This is the callback function called every time we find the same variant
    	// in both sets. Here we take the mother variant's af and store it in the
    	// proband's variant for further sorting/display in the feature matrix.
    	function(variantA, variantB) {
    		variantA.motherZygosity = variantB.zygosity != null ? variantB.zygosity : '';
    		variantA.genotypeAltCountMother = variantB.genotypeAltCount;
		    variantA.genotypeRefCountMother = variantB.genotypeRefCount;
		    variantA.genotypeDepthMother    = variantB.genotypeDepthMother;
		}
	).then( function() {

		 // Compare the proband variants to the father's variants
		 return fatherVariantCard.promiseCompareVariants(
		 	theVcfData, 
	       	 // This is the attribute on variant a (proband) and variant b (father)
	        // that will store whether the variant is unique or matches.
	        'compareFather',
	        // This is the attribute on the proband variant that will store the
	        // father's zygosity in the case where the variant match
	        'fatherZygosity',
	    	// This is the callback function called every time we find the same variant
	    	// in both sets. Here we take the father variant's zygosity and store it in the
	    	// proband's variant for further sorting/display in the feature matrix.
	        function(variantA, variantB) {
	        	variantA.fatherZygosity = variantB.zygosity != null ? variantB.zygosity : '';
	        	variantA.genotypeAltCountFather = variantB.genotypeAltCount;
	        	variantA.genotypeRefCountFather = variantB.genotypeRefCount;
			    variantA.genotypeDepthFather    = variantB.genotypeDepthFather;
	        });  	

	}, function(error) {
		console.log("error occured when comparing proband variants to mother?");
	}).then( function() {
		// This is the function that is called after the proband variants have been compared
	    // to the father variant set. 
	    
		// Fill in the af level on each variant.  Use the af in the vcf if
		// present, otherwise, use the 1000g af if present, otherwise use
		// the ExAC af.
		theVcfData.features.forEach(function(variant) {
			if (variant.zygosity != null && variant.zygosity.toLowerCase() == 'hom' 
				&& variant.motherZygosity != null && variant.motherZygosity.toLowerCase() == 'het' 
				&& variant.fatherZygosity != null && variant.fatherZygosity.toLowerCase() == 'het') {
				variant.inheritance = 'recessive';
			} else if (variant.compareMother == 'unique1' && variant.compareFather == 'unique1') {
				variant.inheritance = 'denovo';
			}
		});
		$("#matrix-panel .loader-label").text("Ranking variants");

		filterCard.enableInheritanceFilters(theVcfData);
			
			probandVariantCard.setLoadState('inheritance');
			fatherVariantCard.setLoadState('inheritance');
			motherVariantCard.setLoadState('inheritance');

		callback(theVcfData);
	},
	function(error) {
		console.log("error occured after comparison of proband to mother and father");
		
	});

}

function promiseComparedToUnaffectedSib(vcUnaffectedSib) {

	return new Promise( function(resolve, reject) {
		var theVcfData = getProbandVariantCard().model.getVcfData();

		theVcfData.features.forEach(function(variant) {
			if (variant.uasibsZygosity) {
				variant.uasibsZygosity[vcUnaffectedSib.name] = "none";		
			} else {
				variant.uasibsZygosity = {};
			}
		});

		theVcfData.features = theVcfData.features.sort(orderVariantsByPosition);

		var idx = 0;
		vcUnaffectedSib.promiseCompareVariants(
			theVcfData,			
			// This is the attribute on variant a (proband) and variant b (unaffected sib)
	        // that will store whether the variant is unique or matches.
	        null,
	        // This is the attribute on the proband variant that will store the
	        // zygosity in the case where the variant match
	        null,
	    	// This is the callback function called every time we find the same variant
	    	// in both sets. Here we take the father variant's zygosity and store it in the
	    	// proband's variant for further sorting/display in the feature matrix.
	        function(variantA, variantB) {
	        	variantA.uasibsZygosity[vcUnaffectedSib.name] = variantB.zygosity;
	        },
	        function(variantA, variantB) {
	        	if (variantA) {
	        		variantA.uasibsZygosity[vcUnaffectedSib.name] = "none";
	        	}
	        }
	     ).then( function() {
	     	resolve();
	     });

	});




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




 