//
// Global Variables
//
//var geneiobio_server = "http://localhost:3000/";
//var geneiobio_server = "http://geneinfo.iobio.io/";
var geneiobio_server = "http://nv-dev.iobio.io/geneinfo/";
var phenolyzerServer = "http://nv-dev.iobio.io/phenolyzer/"
//var phenolyzerServer = "https://services.iobio.io/phenolyzer/"


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
var iconbarTemplate = null;


// The selected (sub-) region of the gene.  Null
// when there is not an active selection.
var regionStart = null;
var regionEnd = null;
var GENE_REGION_BUFFER = 1000;
var GENE_REGION_BUFFER_MAX = 50000;

// Transcript data and chart
var gene = '';
var geneNames = [];
var phenolyzerGenes = [];
var geneObjects = {};
var geneAnnots = {};
var geneToLatestTranscript = {};
var genesToCache = [];
var geneSource = "gencode";
var loadedUrl = false;
var selectedTranscript = null;
var selectedTranscriptCodingRegions = [];
var transcriptChart =  null;
var transcriptViewMode = "single";
var transcriptMenuChart = null;
var transcriptPanelHeight = null;
var transcriptCollapse = true;
var firstTimeGeneLoaded = true;
var firstTimeShowVariants = true;


var bookmarkCard = new BookmarkCard();

// data card
var dataCard = new DataCard();

// filter card
var filterCard = new FilterCard();

// genes card
var genesCard = new GenesCard();


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
	promises.push(promiseLoadTemplate('templates/iconbarTemplate.hbs').then(function(compiledTemplate) {
		iconbarTemplate = compiledTemplate;
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
 	clearCache();


	// Initialize material bootstrap
    $.material.init();

    // Initialize app tour
	pageGuide = tl.pg.init({ 
		'auto_refresh': true, 
		'custom_open_button': '.open_page_guide' 
    }); 


	// For 'show variants' card
	$('#select-color-scheme').chosen({width: "120px;font-size:10px;background-color:white;margin-bottom:2px;", disable_search_threshold: 10});
	$('#select-intron-display').chosen({width: "120px;font-size:10px;background-color:white;margin-bottom:2px;", disable_search_threshold: 10});
	

    // Slide out panels
    $(iconbarTemplate()).insertBefore("#slider-left");
	$('#select-gene-source').chosen({width: "140px;float:left;margin-left:10px;padding-right:5px;font-size:11px;background-color:white;", disable_search_threshold: 10});
	$('#slider-left-content').html(filterCardTemplateHTML);		
	$('#slider-left-content').append(genesCardTemplateHTML);
	$('#slider-left-content').append(bookmarkTemplateHTML);
	$('#slider-left-content').append(examineTemplateHTML);
	$('#slider-left-content').append(recallTemplateHTML);
	$('#close-slide-left').click(function() {
		closeSlideLeft();
	});


	// Initialize data card
	dataCard = new DataCard();
	dataCard.init();


	
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
	    	geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
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

	 // Initialize the bookmark card
	 bookmarkCard = new BookmarkCard();
	 bookmarkCard.init();


	// Initialize transcript view buttons
	initTranscriptControls();

	// endsWith implementation
	if (typeof String.prototype.endsWith !== 'function') {
	    String.prototype.endsWith = function(suffix) {
	        return this.indexOf(suffix, this.length - suffix.length) !== -1;
	    };
	}


	
	// for testing phenolyzer bar chart
	/*
	phenolyzerGenes = [
	{geneName: 'RAI1', score: +.93, selected: "true"}, 
	{geneName:'BRCA2', score: +.50, selected: "true"}, 
	{geneName: 'BRCA1', score: +.33 }];
	showGenesSlideLeft();
	*/
	
	$('.sidebar-button.selected').removeClass("selected");

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


function readjustCards() {
	var top = +$('#nav-section').height();
	d3.select('#track-section').style("padding-top", top+5 + "px");
}

function changeSidebar(sidebar) {
	$('.sidebar-button').removeClass('selected');
	if (sidebar == "Filter") {
		$('#slider-left-content #filter-track').toggleClass("hide", false);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);			
		$('#slider-left-content #recall-card').toggleClass("hide", true);	
		$('#button-show-filters').toggleClass('selected', true);			
	} else if (sidebar == "Phenolyzer") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", false);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);					
		$('#slider-left-content #recall-card').toggleClass("hide", true);	
		$('#button-show-phenolyzer').toggleClass('selected', true);		
	} else if (sidebar == "Bookmarks") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", false);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);			
		$('#slider-left-content #recall-card').toggleClass("hide", true);		
		$('#button-show-bookmarks').toggleClass('selected', true);		
		window.bookmarkCard.refreshBookmarkList();
	} else if (sidebar == "Examine") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", false);			
		$('#slider-left-content #recall-card').toggleClass("hide", true);	
		$('#button-show-examine').toggleClass('selected', true);			
	} else if (sidebar == "Recall") {
		$('#slider-left-content #filter-track').toggleClass("hide", true);	
		$('#slider-left-content #genes-card').toggleClass("hide", true);	
		$('#slider-left-content #bookmark-card').toggleClass("hide", true);	
		$('#slider-left-content #examine-card').toggleClass("hide", true);			
		$('#slider-left-content #recall-card').toggleClass("hide", false);	
		$('#button-find-missing-variants').toggleClass('selected', true);			
	}

}

function showDataDialog() {
	$('#dataModal').modal('show')

}


function showSlideLeft() {


	$('#slider-left').removeClass("hide");
	$('.footer').addClass("hide");
	$('#close-slide-left').removeClass("hide");


	resizeCardWidths();

	$('#container').toggleClass('slide-left');
	$('#nav-section').css("left", "0px");

	var transitionEvent = whichTransitionEvent();
	$('.slide-left').one(transitionEvent, function(event) {
		readjustCards();
	});

}

function showSidebar(view) {
	closeSlideLeft(); 	
	changeSidebar(view);
	showSlideLeft();
}


function showGenesSlideLeft() {
	closeSlideLeft();
	changeSidebar('Phenolyzer');
	showSlideLeft();


	if (phenolyzerGenes && phenolyzerGenes.length > 0) {
		var geneBarChart = verticalBarChartD3()
							  .margin( {left:10, right: 10, top: 0, bottom: 0} )
		                      .xValue( function(d){ return +d.score })
							  .yValue( function(d){ return d.geneName })
							  .width(120)
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
		d3.select('#phenolyzer-results svg').remove();
		var selection = d3.select('#phenolyzer-results').data([phenolyzerGenes]);
		geneBarChart(selection, {shadowOnHover:true});		
	}

}


function resizeCardWidths() {
	var windowWidth = $(window).width();
	var sliderWidth    = 0;
	if ($('#slider-left').hasClass("hide") == false) {
		sliderWidth = +$('#slider-left').width();
	}
	
	$('#container').css('width', windowWidth - sliderWidth - 40);
	$('#matrix-panel').css('max-width', windowWidth - sliderWidth - 55);
	$('#matrix-panel').css('min-width', windowWidth - sliderWidth - 55);
}

function closeSlideLeft() {
	$('#nav-section').css("left", "36px");
	$('.footer').removeClass("hide");
	$('.slide-button').removeClass("hide");
	$('#close-slide-left').addClass("hide");
	$('#slider-left').addClass("hide");

	$('#slide-buttons').removeClass('slide-left');
	$('#container').removeClass('slide-left');
	$('.sidebar-button.selected').removeClass("selected");


	resizeCardWidths();

	var transitionEvent = whichTransitionEvent();
	$('#container').one(transitionEvent, function(event) {
		readjustCards();
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


function toggleSampleTrio(show) {
	if (show) {
		dataCard.mode = 'trio';
		$('#mother-data').removeClass("hide");
		$('#father-data').removeClass("hide");
		$('#proband-data').css("width", "32%");
		if ($('#proband-data').find('#vcf-sample-select option').length > 1) {
			$('#unaffected-sibs-box').removeClass("hide");
			$('#affected-sibs-box').removeClass("hide");
		} else {
			$('#unaffected-sibs-box').addClass("hide");
			$('#affected-sibs-box').addClass("hide");
		}
	} else {
		dataCard.mode = 'single';
		$('#proband-data').css("width", "60%");
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
		copyPasteGenes(gene);
	}

	// Load the gene
	var showTour = getUrlParameter('showTour');
	if (gene != undefined) {
		$('#bloodhound .typeahead.tt-input').val(gene).trigger('typeahead:selected', {"name": gene, loadFromUrl: true});
		_geneBadgeLoading(gene, true, true);
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
	var affectedSibsString = getUrlParameter("affectedSibs");
	var unaffectedSibsString = getUrlParameter("unaffectedSibs");

	// Initialize transcript chart and variant cards, but hold off on displaying 
	// the variant cards.
	loadTracksForGene(true);


	// get all bam and vcf url params in hash

	if ((bam != null && Object.keys(bam).length > 1) || (vcf != null && Object.keys(vcf).length > 1)) {
		toggleSampleTrio(true);
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
		loadTracksForGene( false, function() {


		});
	} else {
		showDataDialog();
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
		//if (windowWidth <= 800) {
		//	transcriptCardSelector.find('#region-track').css("cssText", "margin-left: 125px !important;");
		//}
	});
	transcriptCardSelector.find('#minimize-button').on('click', function() {
		transcriptCardSelector.find('.fullview').addClass("hide");
		transcriptCardSelector.find('#gene-name').css("margin-right", "0");
		transcriptCardSelector.css("margin-top", "-10px");
		//transcriptCardSelector.find('#region-track').css("cssText", "margin-left: 0px !important;");
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
	geneSource = $( "#select-gene-source option:selected" ).text().toLowerCase().split(" transcript")[0];	
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
			    _geneBadgeLoading(geneObject.gene_name, true);


			    
		    	variantCards.forEach(function(variantCard) {

		    		if (dataCard.mode == 'trio' || variantCard == getProbandVariantCard()) {
			    		variantCard.promiseCacheVariants(
			    			geneObject.gene_name,
			    			geneObject.chr,
			    			geneObject.start, 
						 	geneObject.end, 
						 	geneObject.strand, 
						 	transcript)
			    		.then( function(vcfData) {
			    			if (isCachedForCards(geneObject.gene_name, transcript)) {
			    				vc = getProbandVariantCard();
			    				var probandVcfData = vc.model.getVcfDataForGene(geneObject, transcript);
			    				var dangerObject = vc.summarizeDanger(probandVcfData);
			    				_geneBadgeLoading(geneObject.gene_name, false);
								_setGeneBadgeGlyphs(geneObject.gene_name, dangerObject, false);

								if (genesToCache.indexOf(geneObject.gene_name) >= 0) {
									genesToCache.shift();
				    				cacheNextGene(genesToCache);									
								}
			    			}

			    		}, function(error) {
			    			if (genesToCache.indexOf(geneObject.gene_name) >= 0) {
				    			console.log("problem caching data for gene " + geneObject.gene_name + ". " + error);
				    			_geneBadgeLoading(geneObject.gene_name, false);

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

			d3.select($(existingBadge)).data([name]);
			$(existingBadge).mouseover(function() {
				var geneName = d3.select(this).text();
				var geneAnnot = geneAnnots[geneName];
				d3.select(this.parentNode.parentNode).select("#gene-badge-button").attr('title', geneAnnot.description + " - " + geneAnnot.summary);						

			});

			promiseSetGeneAnnot($(newBadgeSelector), name);

		}

	}
	// If we are loading from the url, just add the class 'selected' to the gene specified in the 
	// url.  Otherwise if we are performing copy/paste from the dropdown, select the first gene in the list
	if (geneNames.length > 0 && geneNameToSelect && geneNames.indexOf(geneNameToSelect) >= 0) {
		var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneNameToSelect + "')").parent().parent();
		geneBadge.addClass("selected");
		if (hasDataSources()) {
			geneBadge.find('.gene-badge-loader').removeClass('hide');
		}
	} else if (geneNames.length > 0 && geneNameToSelect == null) {
		selectGene(geneNames[0]);
	}

	_onGeneBadgeUpdate();

	$('#get-genes-dropdown .btn-group').removeClass('open');	
}

function getPhenolyzerGenes() {
	showGenesSlideLeft();

	geneNames.length = 0;
	updateUrl('genes', geneNames.join(","));

	$('.phenolyzer.loader').removeClass("hide");
	$("#phenolyzer-timeout-message").addClass("hide");
	$('#phenolyzer-heading').addClass("hide");

	var searchTerms = $('#phenolyzer-search-terms').val();
	$("#phenolyzer-search-term").text(searchTerms);	
	var url = phenolyzerServer + '?cmd=' + searchTerms.split(" ").join("_");
	d3.select('#phenolyzer-results svg').remove();
   	phenolyzerGenes = [];
	
	

	$.ajax( {
			url: url,
			error: function (xhr, ajaxOptions, thrownError) {
				closeSlideLeft(); 
				$('.phenolyzer.loader').addClass("hide");
				alert("An error occurred in Phenolyzer iobio services. " + thrownError);
			}
		}
	  )
	 .done(function(data) { 

	 	if (data == "") {			
			showGenesSlideLeft();
			$('.phenolyzer.loader').addClass("hide");
			$("#phenolyzer-timeout-message").removeClass("hide");
	 	}  else {
	 		showGenesSlideLeft();
			$('.phenolyzer.loader').addClass("hide");
			$('#phenolyzer-heading').removeClass("hide");
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
						var selected             = count <= 9 ? true : false;
						phenolyzerGenes.push({rank: rank, geneName: geneName, score: score, haploInsuffScore: haploInsuffScore, geneIntoleranceScore: geneIntoleranceScore, selected: selected});					
					}				
					count++;

				}
			});
			
			showGenesSlideLeft();
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
	 	}  

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
			//geneBadgeSelector.find('#gene-badge-button').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
			geneAnnots[name] = geneAnnot;
			d3.select(geneBadgeSelector).data([geneAnnot]);

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
		d3.select($(selector)).data([geneName]);
		$(selector).mouseover(function() {
			var geneName = d3.select(this).text();
			var geneAnnot = geneAnnots[geneName];
			d3.select(this.parentNode.parentNode).select("#gene-badge-button").attr('title', geneAnnot.description + " - " + geneAnnot.summary);						

		});

		promiseSetGeneAnnot($("#gene-badge-container #gene-badge:last-child"), geneName);

		geneNames.push(geneName);

		if (!bypassSelecting) {
			if (hasDataSources()) {
				$(selector).parent().find('.gene-badge-loader').removeClass("hide");
			}
			$("#gene-badge.selected").removeClass("selected");		
			$(selector).parent().parent().addClass("selected");			
		}

		$('#gene-badge-container #manage-gene-list').removeClass("hide");
	
	}
	_onGeneBadgeUpdate();

}

function refreshCurrentGeneBadge() {
	vc = getProbandVariantCard();
	var probandVcfData = vc.model.getVcfDataForGene(window.gene, window.selectedTranscript);
	var dangerObject = vc.summarizeDanger(probandVcfData);
	_setGeneBadgeGlyphs(window.gene.gene_name, dangerObject, true);
	bookmarkCard.refreshBookmarkList();
}

function hideGeneBadgeLoading(geneName) {
	_geneBadgeLoading(geneName, false);
}

function _geneBadgeLoading(geneName, show, force) {
	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
	if (show) {
		if (force || hasDataSources()) {
			geneBadge.find('.gene-badge-loader').removeClass("hide");
		}
	} else {
		geneBadge.find('.gene-badge-loader').addClass("hide");		
	}
}

function _setGeneBadgeGlyphs(geneName, dangerObject, select) {
	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
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
	if (select) {
		geneBadge.addClass("selected");		
	}	

	
	var doneWithImpact = false;
	for (dangerKey in dangerObject) {
		if (dangerKey == 'IMPACT') {
			var impactClasses = dangerObject[dangerKey];
			var symbolIndex = 0;
			for (impactClass in impactClasses) {
				var types = impactClasses[impactClass];
				for (type in types) {
					var theClazz = 'impact_' + impactClass;	
					var effectObject = types[type];
					geneBadge.find('#gene-badge-symbols').append("<svg class=\"impact-badge\" height=\"12\" width=\"14\">");
					var selection = d3.select(geneBadge.find('#gene-badge-symbols .impact-badge')[symbolIndex]).data([{width:10, height:10,clazz: theClazz, type:  type, effectObject: effectObject}]);
					symbolIndex++;
					matrixCard.showImpactBadge(selection);	
					selection.on("mouseover", function(d,i) {
						var maxEffect = "";
						for (key in d.effectObject) {
							maxEffect += key + " ";
							var transcriptObject = d.effectObject[key];
							for (key in transcriptObject) {
								maxEffect += key + " ";
							}
						}
						d3.select(this.parentNode.parentNode.parentNode).select("#gene-badge-button").attr('title', maxEffect);						
			
					});
				}
			}
		} else if (dangerKey == 'CLINVAR') {
			var clinvarLevel = dangerObject[dangerKey];
			if (clinvarLevel != null) {
				geneBadge.find('#gene-badge-symbols').append("<svg class=\"clinvar-badge\" height=\"12\" width=\"14\">");
				var selection = d3.select(geneBadge.find('#gene-badge-symbols .clinvar-badge')[0]).data([{width:10, height:10, transform: 'translate(0,1)', clazz: clinvarLevel}]);
				matrixCard.showClinVarSymbol(selection);				
			}

		} else if (dangerKey == 'SIFT') {
			var dangerSift = dangerObject[dangerKey];
			if (dangerSift != null) {
				for (clazz in dangerSift) {
					var siftObject = dangerSift[clazz];
					geneBadge.find('#gene-badge-symbols').append("<svg class=\"sift-badge\" height=\"12\" width=\"14\">");
					var selection = d3.select(geneBadge.find('#gene-badge-symbols .sift-badge')[0]).data([{width:11, height:11, transform: 'translate(0,1)', clazz: clazz, siftObject: siftObject }]);
					matrixCard.showSiftSymbol(selection);				
					selection.on("mouseover", function(d,i) {
						var maxSift = "SIFT ";
						for (key in d.siftObject) {
							maxSift += key + " ";
							var transcriptObject = d.siftObject[key];
							for (key in transcriptObject) {
								maxSift += key + " ";
							}
						}
						d3.select(this.parentNode.parentNode.parentNode).select("#gene-badge-button").attr('title', maxSift);						
			
					});

				}
			}

		} else if (dangerKey == 'POLYPHEN') {			
			var dangerPolyphen = dangerObject[dangerKey];
			if (dangerPolyphen != null) {
				for (clazz in dangerPolyphen) {
					var polyphenObject = dangerPolyphen[clazz];
					geneBadge.find('#gene-badge-symbols').append("<svg class=\"polyphen-badge\" height=\"12\" width=\"14\">");
					var selection = d3.select(geneBadge.find('#gene-badge-symbols .polyphen-badge')[0]).data([{width:10, height:10, transform: 'translate(0,2)', clazz: clazz, polyphenObject: polyphenObject}]);
					matrixCard.showPolyPhenSymbol(selection);	
					selection.on("mouseover", function(d,i) {
						var maxPolyphen = "PolyPhen ";
						for (key in d.polyphenObject) {
							maxPolyphen += key + " ";
							var transcriptObject = d.polyphenObject[key];
							for (key in transcriptObject) {
								maxPolyphen += key + " ";
							}
						}
						d3.select(this.parentNode.parentNode.parentNode).select("#gene-badge-button").attr('title', maxPolyphen);						
			
					});								
				}
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

function selectGene(geneName, callbackVariantsDisplayed) {
	$('.typeahead.tt-input').val(geneName);
	
	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
	
	$("#gene-badge.selected").removeClass("selected");
	geneBadge.addClass("selected");
	
	$(".gene-badge-loader").each( function(index, value) {
		$(this).addClass("hide");
	});
	if (hasDataSources()) {
		geneBadge.find('.gene-badge-loader').removeClass('hide');
	}


	var url = geneiobio_server + 'api/gene/' + geneName;
	geneSource = $( "#select-gene-source option:selected" ).text().toLowerCase().split(" transcript")[0];	
	url += "?source=" + geneSource;
	
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
		    	adjustGeneRegion(window.gene);	

		    	window.selectedTranscript = geneToLatestTranscript[window.gene.gene_name];
		    	window.geneObjects[window.gene.gene_name] = window.gene;	

		    	updateUrl('gene', window.gene.gene_name);

		    	updateGeneInfoLink(window.gene.gene_name);

				if (!hasDataSources()) {
					showDataDialog();
					firstTimeGeneLoaded = false; 
				}


		    	loadTracksForGene(false, null, callbackVariantsDisplayed);
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


function clearCache() {
	if (localStorage) {
		localStorage.clear();
	}
	
	window.geneObjects = {};
	window.geneAnnots = {};
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
		geneSource = $( "#select-gene-source option:selected" ).text().toLowerCase().split(" transcript")[0];	
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
		    	addGeneBadge(window.gene.gene_name);					
			    	
		    	    
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



					if (firstTimeGeneLoaded && !hasDataSources()) {
						showDataDialog();
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
function loadTracksForGene(bypassVariantCards, callbackDataLoaded, callbackVariantsDisplayed) {

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

	readjustCards();


	d3.select('#impact-scheme').classed("current", true);
	d3.select('#effect-scheme' ).classed("current", false);
	d3.selectAll(".impact").classed("nocolor", false);
	d3.selectAll(".effect").classed("nocolor", true);
	
	gene.regionStart = formatRegion(window.gene.start);
	gene.regionEnd   = formatRegion(window.gene.end);

    $('#gene-chr').text(window.gene.chr);
    $('#gene-name').text(window.gene.gene_name);   
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
			 	variantCard.loadTracksForGene(filterCard.classifyByImpact, 
			 		function(theVariantCard) {		
				 		if (callbackDataLoaded) {
				 			callbackDataLoaded(theVariantCard);
				 		}	 		
				 	},
			 		function(theVariantCard) {
			 			if (theVariantCard.getRelationship() == 'proband') {
			 				readjustCards();
			 			}
			 			if (callbackVariantsDisplayed) {
				 			callbackVariantsDisplayed(theVariantCard);
				 		}	 		
			 		});
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
function promiseDetermineInheritance(promise, onVariantsDisplayed) {	

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

					// we need to compare the proband variants to mother and father variants to determine
					// the inheritance mode.  After this completes, we are ready to show the
					// feature matrix.
					var trioModel = new VariantTrioModel(probandVcfData, motherVcfData, fatherVcfData);
					trioModel.compareVariantsToMotherFather(function() {
						
						probandVariantCard.refreshVariantChartAndMatrix();

						$("#matrix-panel .loader").removeClass("hide");
						$("#matrix-panel .loader .loader-label").text("Reviewing affected and unaffected siblings");
						determineSibStatus(trioModel, function() {
							$("#matrix-panel .loader").addClass("hide");
						    $("#matrix-panel .loader .loader-label").text("Ranking variants");
							probandVariantCard.refreshVariantChartAndMatrix(null, onVariantsDisplayed);

							resolve();

						});


					});
				} else {
					probandVariantCard.determineMaxAlleleCount();

					probandVariantCard.populateEffectFilters();
					
					probandVariantCard.refreshVariantChartAndMatrix(null, onVariantsDisplayed);	

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

	var theVcfData = probandVariantCard.model.getVcfDataForGene(window.gene, window.selectedTranscript);

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


function bookmarkVariant() {
	if (clickedVariant) {
		this.bookmarkCard.bookmarkVariant(clickedVariant);
		this.bookmarkCard.refreshBookmarkList();
	}
}




 