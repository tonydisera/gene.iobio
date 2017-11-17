//
// Global Variables
//


// Engine for gene search suggestions
var gene_engine = new Bloodhound({
	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	local: [],
	limit: 200
});

// the video (embedded youtube) that is currently playing
var videoPlayer = null;

// Handlebar templates
var dataCardEntryTemplate = null;
var variantCardTemplate = null;
var knownVariantsNavTemplateHTML = null;
var filterCardTemplateHTML = null;
var genesCardTemplateHTML = null;
var bookmarkTemplateHTML = null;
var recallTemplateHTML = null;
var eduTourTemplateHTML = null;
var iconbarTemplate = null;
var tourTemplate = null;
var introTemplate = null;
var legendTemplate = null;
var navbarTemplate = null;
var modalsTemplate = null;
var filterAffectedTemplate = null;
var welcomePanelTemplate = null;

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
var geneUserVisits = {};
var genePhenotypes = {};
var geneToLatestTranscript = {};
var refseqOnly = {};
var gencodeOnly = {};
var allKnownGeneNames = {};


var loadedUrl = false;


// Transcript data and chart
var selectedTranscript = null;
var transcriptCodingRegions = {};
var transcriptChart =  null;
var transcriptViewMode = "single";
var transcriptMenuChart = null;
var transcriptPanelHeight = null;
var transcriptCollapse = true;
var geneSource = "gencode";


var hideKnownVariants = true;
var hideKnownVariantsCard = true;
var knownVariantsChart = null;
var knownVariantsChartType = 'exon-bar';
var knownVariantsAreaChart = null;
var knownVariantsBarChart = null;
var KNOWN_VARIANTS_BIN_SPAN  = {'bar': +6, 'exon-bar': +2,  'area': +6};
var KNOWN_VARIANTS_BAR_WIDTH = {'bar': +6, 'exon-bar': +6,  'area': +6};


var firstTimeShowVariants = true;
var readyToHideIntro = false;
var keepShowingIntro = false;

var affectedInfo = null;


// bookmark card
var bookmarkCard = new BookmarkCard();

// data card
var dataCard = new DataCard();

// filter card
var filterCard = new FilterCard();

// genes card
var genesCard = new GenesCard();

// variant tooltip
var variantTooltip = new VariantTooltip();

// matrix card
var matrixCard = new MatrixCard();

var welcomePanel = new WelcomePanel();




// cache helper
var cacheHelper = null;
var launchTimestampToClear = null;

// genomeBuild helper
var genomeBuildHelper = null;

// generic annotation
var genericAnnotation = new GenericAnnotation();

// legend
var legend = new Legend();


// clicked variant
var clickedVariant = null;
var clickedVariantCard = null;


// Format the start and end positions with commas
var formatRegion = d3.format(",");

// variant card
var variantCards = [];

// variant cards for unaffected and affected sibs
var variantCardsSibs = {'affected': [], 'unaffected': []};

var fulfilledTrioPromise = false;

var variantExporter = null;

// freebayes settings
var fbSettings = {
	'visited': false,
	'arguments': {
		'useSuggestedVariants':     {value: true,  defaultValue: true},
		'limitToSuggestedVariants': {value: false, defaultValue: false, argName: '-l',                    isFlag: true},
		'minMappingQual':           {value: 0,     defaultValue: 0,     argName: '--min-mapping-quality'},
		'minCoverage':              {value: 0,     defaultValue: 0,     argName: '--min-coverage'},
		'useDupReads':              {value: false, defaultValue: false, argName: '--use-duplicate-reads', isFlag: true}
	}
}



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


$(document).ready(function(){

	initHub();

	determineStyle();

	if (detectIE() != false) {
		alert("Warning. Gene.iobio has been tested and verified on Chrome, Firefox, and Safari browsers.  Please run gene.iobio from one of these browsers.");
	}

	alertify.defaults.glossary.title = "";
	alertify.defaults.theme.ok = 'btn btn-default btn-raised';
	alertify.defaults.theme.cancel = 'btn btn-default btn-raised';

	// Initialize material bootstrap
	$.material.init();

	addCloseListeners();

	detectWindowResize();

		// Load handlebar templates
	promiseLoadTemplates()
	 .then(function() {

		// Now init genome builder helper
		genomeBuildHelper = new GenomeBuildHelper();
		return genomeBuildHelper.promiseInit({DEFAULT_BUILD: null})
		 .then(function() {
			var buildName = genomeBuildHelper.getCurrentBuildName();
			$('#build-link').text(buildName && buildName.length > 0 ? buildName : "");
		 });
	 })
	 .then(function() {
		// now init cache
		return promiseInitCache();
	 })
	 .then(function() {
	 		// cache is initialized
	 		showWelcomePanel();

	 },
	 function(error) {
		alertify.alert("Unable to initialize gene.iobio due to following error: " + error);
	 })


});

$(window).load(function() {
	// Window is loaded.  Now we perform init().  We hold off
	// on doing this to delay longer running loading of genes.json.
	init();
})

function onYouTubeIframeAPIReady() {
}

function initHub() {
    // Hub api URL
	var api =  "https://staging.frameshift.io/apiv1";

	// Parse params
	var params = {};
	window.location.hash
		.slice(1)
		.split('&')
		.forEach(function(pair) {
			var [param, value] = pair.split('=');
			params[param] = value;
		})
	var { sample_uuid, access_token, token_type } = params;

	// Remove Access token from url
	// ... omitted... too lazy to figure this out

	if ( sample_uuid != undefined ){
		// Save access token to local storage, so it can be used on browser refreshes
		localStorage.setItem('hub-iobio-tkn', token_type + ' ' + access_token);

		// Get files
		$.ajax({
			url: api + '/samples/'+sample_uuid+'/files',
			type: 'GET',
			contentType: 'application/json',
			headers: {
				'Authorization': localStorage.getItem('hub-iobio-tkn')
			}
		}).then(appendHubFileNamesToURL);
	}
}

// Get sample name, gene(?), build(?) from ajax call and then only call this for each file?
function appendHubFileNamesToURL(res) {
	res.data.forEach(function(file) {
		var {uri, name, type } = file;
		updateUrl(type+"0", uri);
		updateUrl("name0", name.split(".")[0]);
		updateUrl("sample0", name.split(".")[0]);
		updateUrl("genes","RAI1,AIRE,MYLK2,PDGFB,PDHA1");
		updateUrl("gene","RAI1");
		updateUrl("build","GRCh37");
	})
}


function promiseLoadTemplates()  {
	return new Promise(function(resolve, reject) {
		var promises = [];
		promises.push(promiseLoadTemplate('templates/welcomePanelTemplate.hbs').then(function(compiledTemplate) {
			welcomePanelTemplate = compiledTemplate;
			welcomePanel.init();

		}));
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
		promises.push(promiseLoadTemplate('templates/knownVariantsNavTemplate.hbs').then(function(compiledTemplate) {
			knownVariantsNavTemplateHTML = compiledTemplate();
		}));
		promises.push(promiseLoadTemplate('templates/recallCardTemplate.hbs').then(function(compiledTemplate) {
			recallTemplateHTML = compiledTemplate;
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
		promises.push(promiseLoadTemplate('templates/introTemplate.hbs').then(function(compiledTemplate) {
			introTemplate = compiledTemplate;
		}));
		promises.push(promiseLoadTemplate('templates/legendBasicTemplate.hbs').then(function(compiledTemplate) {
			legendBasicTemplate = compiledTemplate;
		}));
		promises.push(promiseLoadTemplate('templates/legendTemplate.hbs').then(function(compiledTemplate) {
			legendTemplate = compiledTemplate;
		}));
		promises.push(promiseLoadTemplate('templates/svgGlyphsTemplate.hbs').then(function(compiledTemplate) {
			svgGlyphsTemplate = compiledTemplate;
		}));
		promises.push(promiseLoadTemplate('templates/navbarTemplate.hbs').then(function(compiledTemplate) {
			navbarTemplate = compiledTemplate;
		}));
		promises.push(promiseLoadTemplate('templates/modalsTemplate.hbs').then(function(compiledTemplate) {
			modalsTemplate = compiledTemplate;
		}));
		promises.push(promiseLoadTemplate('templates/filterAffectedTemplate.hbs').then(function(compiledTemplate) {
			filterAffectedTemplate = compiledTemplate;
		}));


		Promise.all(promises).then(function() {
			resolve();
		},
		function(error) {
			reject(error);
		});


	})


}

function promiseLoadTemplate(templateName) {
	return new Promise( function(resolve, reject) {
		$.get(templateName, function (data) {
				resolve(Handlebars.compile(data));
		}, 'html');
	});

}

function determineStyle() {

	var mygene2Parm = getUrlParameter("mygene2");
	if ( mygene2Parm && mygene2Parm != "" ) {
		isMygene2   = mygene2Parm == "false" || mygene2Parm.toUpperCase() == "N" ? false : true;
	}
	var modeParm = getUrlParameter("mode");
	if (modeParm && modeParm != "") {
		isLevelBasic     = modeParm == "basic" ? true : false;
		isLevelEdu       = (modeParm == "edu" || modeParm == "edutour") ? true : false;
	}

	if (isLevelEdu) {
		changeSiteStylesheet("assets/css/site-edu.css");
	} else if (isMygene2 && isLevelBasic) {
		changeSiteStylesheet("assets/css/site-mygene2-basic.css");
	} else if (isMygene2) {
		changeSiteStylesheet("assets/css/site-mygene2-advanced.css");
	}

}


function promiseInitCache() {

	return new Promise(function(resolve, reject) {
		var loaderDisplay = new geneBadgeLoaderDisplay('#gene-badge-loading-display');
		cacheHelper = new CacheHelper(loaderDisplay);
		cacheHelper.promiseInit()
		 .then(function() {
			cacheHelper.isolateSession();
			resolve();
		 },
		 function(error) {
			var msg = "A problem occurred in promiseInitCache(): " + error;
			console.log(msg);
			reject(msg);
		 })
	})

}

function addCloseListeners() {

	if (!isLevelEdu && !isMygene2) {
		window.onbeforeunload = function (event) {
				launchTimestampToClear = cacheHelper.launchTimestamp;
				return "Are you sure you want to exit gene.iobio?";
		};
	}
	window.onunload = function () {
		cacheHelper.cleanupCacheOnClose();
	};
}


function init() {
	var me = this;

	variantExporter = new VariantExporter();

	$("[data-toggle=tooltip]").tooltip();





	cacheHelper.promiseCheckCacheSize()
	 .then(function() {
		if (allowFreebayesSettings) {
			$('#show-fb-settings').removeClass("hide");
		}


		// If we are using the gene.iobio education tour edition, automatically load
		// exhibit.html. Only do this automatically if the tour parameter hasn't been provided.
		if (isLevelEdu && !getUrlParameter("tour")) {
			var exhibitUrl = window.location.protocol + "\/\/" + window.location.hostname + window.location.pathname + "exhibit.html";
			window.location.assign(exhibitUrl);
			return;
		}


		if (isMygene2) {
			$('#intro').append(introTemplate());
			if (isLevelBasic) {
				$('#intro-link').addClass("hide");
				$('#intro-text').removeClass("hide");
			}

		}


		if (!isLevelEdu) {
			$('body').prepend(navbarTemplate());
		}



		$('#modals-placeholder').append(modalsTemplate());
		$('#tour-placeholder').append(tourTemplate());
		$('#svg-glyphs-placeholder').append(svgGlyphsTemplate());

		// Set version number on About menu and the Version dialog
		$('.version-number').text(version);


		// Clear the local cache
		cacheHelper.clearCache();


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




		// Initialize data card
		dataCard = new DataCard();
		dataCard.init();


		// Init known variants nav
		initKnownVariantsNav();


		// Create transcript chart
		transcriptChart = geneD3()
				.width($('#container').innerWidth())
				.widthPercent("100%")
				.heightPercent("100%")
				.margin({top: isLevelBasic || isLevelEdu ? 0 : 20, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 18, left: isLevelBasic || isLevelEdu ? 9 : 4})
				.showXAxis(true)
				.showBrush(true)
				.trackHeight(isLevelEdu || isLevelBasic ? 32 : 22)
				.cdsHeight(isLevelEdu  || isLevelBasic  ? 24 : 18)
				.showLabel(false)
			.featureClass( function(d,i) {
					return d.feature_type.toLowerCase();
			})
			.on("d3brush", function(brush) {
					hideCoordinateFrame();
					if (!brush.empty()) {
						$('#zoom-hint').text('To zoom out, click outside bounding box.');
					regionStart = d3.round(brush.extent()[0]);
					regionEnd   = d3.round(brush.extent()[1]);
					if (!selectedTranscript) {
						selectedTranscript = window.gene.transcripts.length > 0 ? window.gene.transcripts[0] : null;
						getCodingRegions(selectedTranscript);
							promiseMarkCodingRegions(window.gene, window.selectedTranscript);
					}
				} else {
						$('#zoom-hint').text('To zoom into region, drag over gene model.');
					regionStart = window.gene.start;
					regionEnd   = window.gene.end;
				}


				var cardCount = 0;
					showKnownVariantsCounts();

				getRelevantVariantCards().forEach(function(variantCard) {
						variantCard.onBrush(brush, function() {

						cardCount++;
						// Wait until all variant cards have finished with onBrush,
						// then fill feature matrix and circle variants.
						if (cardCount == getRelevantVariantCards().length) {
							getProbandVariantCard().fillFeatureMatrix(regionStart, regionEnd);
								if (clickedVariant && clickedVariantCard) {
								clickedVariantCard.showCoverageCircle(clickedVariant, clickedVariantCard);
								window.showCircleRelatedVariants(clickedVariant, clickedVariantCard);
								showCoordinateFrame(clickedVariant.screenX)
							}
						}
						});

					});



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
			.widthPercent("100%")
				.heightPercent("100%")
				.showXAxis(false)
				.showBrush(false)
				.trackHeight(isLevelEdu || isLevelBasic  ? 36 : 20)
				.cdsHeight(isLevelEdu || isLevelBasic ? 24 : 10)
				.showLabel(true);



		knownVariantsAreaChart = stackedAreaChartD3()
			.widthPercent("100%")
			.heightPercent("100%")
					.width($('#container').innerWidth())
			.height(50)
			.showXAxis(false)
			.xTickCount(0)
			.yTickCount(3)
			.xValue( function(d, i) { return d.point })
			.categories(['unknown', 'other', 'benign', 'path'])
				.margin( {top: 7, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 0, left: isLevelBasic || isLevelEdu ? 9 : 4} );

		knownVariantsBarChart = stackedBarChartD3()
			.widthPercent("100%")
			.heightPercent("100%")
					.width($('#container').innerWidth())
			.height(50)
			.showXAxis(false)
			.xTickCount(0)
			.yTickCount(3)
			.xValue( function(d, i) { return d.point })
			.xValueStart( function(d, i) { return d.start })
			.xValueEnd( function(d, i) { return d.end })
			.barWidthMin(4)
			.barHeightMin(3)
			.categories(['unknown', 'other', 'benign', 'path'])
				.margin( {top: 7, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 0, left: isLevelBasic || isLevelEdu ? 9 : 4} )
				.tooltipText( function(d,i) {
					return showKnownVariantsTooltip(d);
				});
		toggleKnownVariantsChart('bar');



			// Initialize variant tooltip
		variantTooltip = new VariantTooltip();

		// Initialize genes card
		genesCard = new GenesCard();
		genesCard.init();


		// Initialize Matrix card
		matrixCard = new MatrixCard();
		matrixCard.init();
		// Set the tooltip generator now that we have a variant card instance
		matrixCard.setTooltipGenerator(variantTooltip.formatContent);

		// Initialize the Filter card
		filterCard = new FilterCard();
		filterCard.init();

		// Initialize the bookmark card
		bookmarkCard = new BookmarkCard();
		bookmarkCard.init();


		// Initialize the legend content
		$('#legend-track #legend-placeholder').html(legendTemplate());

		// Initialize transcript view buttons
		initTranscriptControls();

		// endsWith implementation
		if (typeof String.prototype.endsWith !== 'function') {
				String.prototype.endsWith = function(suffix) {
						return this.indexOf(suffix, this.length - suffix.length) !== -1;
				};
		}


		$('.sidebar-button.selected').removeClass("selected");


		$('#select-gene-source').selectize({});
		$('#select-gene-source')[0].selectize.on('change', function(value) {
			geneSource = value.toLowerCase().split(" transcript")[0];
			// When the user picks a different gene source from the dropdown,
			// this becomes the 'new' site gene source
			siteGeneSource = geneSource;
			geneToLatestTranscript = {};
			getRelevantVariantCards().forEach(function(vc) {
				// When switching from gencode->refseq or vice/versa,
				// the VEP tokens will be formatted in a different order,
				// so make sure we clear out the token indices
				vc.model.vcf.clearVepInfoFields();
			})
			if (window.gene) {
				genesCard.selectGene(window.gene.gene_name);
			}
		});


		// Set up the gene search widget
		loadGeneWidgets( function(success) {
			if (success) {
				showGeneControls();
				loadGeneFromUrl();
			}
		});
		getGeneBloodhoundElement().focus();

		if (isLevelBasic) {
			$('#select-gene').selectize(
				{
					create: false,
					valueField: 'value',
						labelField: 'value',
						searchField: ['value'],
						maxOptions: 5000
					}
			);
			addGeneDropdownListener();
		}

		// In cases where timeout=true, restart app after n seconds of inactivity
		// (e.g. no mouse move, button click, etc.).
		if (hasTimeout) {
			checkForInactivity();
		}

		if (feedbackEmails != undefined && feedbackEmails != "") {
			$('#feedback-link').removeClass("hide");
			$('#feedback-link').on('click', showFeedback);
				$('#report-feedback-button').on('click', emailFeedback);
		}

	 })
}

function showGeneControls() {
	$('#main-nav-links').removeClass("hide");
	$('#welcome-area #load-demo-data').removeClass("disabled");
	$('#welcome-area #take-app-tour').removeClass("disabled");
}

function showGeneSummary(theGeneName) {
	if (window.gene == null || theGeneName != window.gene.gene_name) {
		return;
	}
	var title = geneAnnots[theGeneName] ? "<span class='gene-title'>" + geneAnnots[theGeneName].description + ".</span>" : "";
	var summary = geneAnnots[theGeneName] ? title + "  " + geneAnnots[theGeneName].summary  : "";
	if (isLevelBasic && $('#gene-summary').text() != summary ) {
		$('#gene-summary').html(summary);
	}
}

function initKnownVariantsNav() {

	$('#known-variants-all-card').find("#known-variants-nav-area").append(knownVariantsNavTemplateHTML);

	$('#select-known-variants-filter').selectize(
		{
			placeholder: 'Filter...',
				maxItems: null,
				valueField: 'value',
				labelField: 'display',
			plugins: ['remove_button'],
				persist: true,
				create: function(input) {
						return {
								value: input,
								text: input
						}
				}
		}
	);


	filterCard.getCardSpecificFilters('known-variants').forEach(function(theFilter) {
		$('#select-known-variants-filter')[0].selectize.addOption({value: theFilter.clazz, display: theFilter.display})
	})
	$('#select-known-variants-filter')[0].selectize.setValue(['clinvar_path', 'clinvar_lpath']);
	$('#select-known-variants-filter')[0].selectize.on('change', function(values) {
		filterCard.clearCardSpecificFilters('known-variants');
		if (values) {
			values.forEach(function(filterName) {
				filterCard.setCardSpecificFilter('known-variants', filterName, true);
			})
		}
		getVariantCard('known-variants').promiseFilterAndShowLoadedVariants();
	})

	var variantCard = getVariantCard('known-variants');
	if (variantCard == null) {
		variantCard = new VariantCard();
		variantCard.model                = new VariantModel();

		$('#known-variants-cards').append(variantCardTemplate());
		var cardSelectorString = "#known-variants-cards .variant-card";
		var d3CardSelector = d3.selectAll(cardSelectorString);

		variantCard.setRelationship("known-variants");
		variantCard.setAffectedStatus('unaffected');
		variantCard.setName('Clinvar variants');

		variantCard.init($(cardSelectorString), d3CardSelector, 0);


		variantCard.cardSelector.find('#vcf-variant-count-label').text("Clinvar variants")


		variantCard.setVariantCardLabel();
		variantCards.push(variantCard);
	}

}

function onKnownVariantsNav(value) {
	if (value == 'counts') {
		showKnownVariantsHistoChart(true);
		showKnownVariantsCounts();
		clearKnownVariantsCard();
	} else if (value == 'variants') {
		showKnownVariantsHistoChart(false);
		addKnownVariantsCard();
	} else if (value == 'none' || value == 'hide') {
		showKnownVariantsHistoChart(false);
		clearKnownVariantsCard();
		$('#known-variants-cards #vcf-track').addClass("hide");
		$('#known-variants-cards #variant-badges').addClass("hide");
		$('#known-variants-cards #zoom-region-chart').addClass("hide");
	}
}

function selectGeneInDropdown(theGeneName, select) {
	if (!select) {
		removeGeneDropdownListener();
	}

	$('#select-gene')[0].selectize.setValue(theGeneName);

	showGeneSummary(theGeneName);

	if (!select) {
		addGeneDropdownListener();
	}

}

function removeGeneDropdownListener() {
	$('#select-gene')[0].selectize.off('change');
}

function addGeneDropdownListener() {
	$('#select-gene')[0].selectize.on('change', function(value) {
		var geneName = value;
		genesCard.selectGene(geneName, function() {
			showGeneSummary(geneName, true);
			loadTracksForGene();
		});
	});

}


function validateGeneTranscripts() {
	if (window.gene.transcripts.length == 0) {
		$('#transcript-card').removeClass("hide");
		$('#transcript-btn-group').removeClass("hide");
		$('#non-protein-coding #no-transcripts-badge').removeClass("hide");
		$('#non-protein-coding #no-transcripts-badge').text("Unable to analyze gene.  No transcripts found.");
		$('#gene-viz svg').remove();
		$('#transcript-menu svg').remove();
		$('#transcript-dropdown-button').html("&nbsp;");
			$('#gene-chr').text(window.gene.chr);
			$('#gene-name').text(window.gene.gene_name);
			$('#gene-region').text(addCommas(window.gene.start) + "-" + addCommas(window.gene.end));
			genesCard.hideGeneBadgeLoading(window.gene.gene_name);
			genesCard.setGeneBadgeError(window.gene.gene_name);
			return false;
	} else {
		return true;
	}

}


function checkGeneSource(geneName) {
	$('#no-transcripts-badge').addClass("hide");


	var switchMsg = null;
	if (refseqOnly[geneName] && geneSource != 'refseq') {
		switchMsg = 'Gene ' + geneName + ' only in RefSeq.  Switching to this transcript set.';
		switchGeneSource('RefSeq Transcript');
	} else if (gencodeOnly[geneName] && geneSource != 'gencode') {
		switchMsg = 'Gene ' + geneName + ' only in Gencode.  Switching to this transcript set.';
		switchGeneSource('Gencode Transcript');
	} else {
		// In the case where the gene is valid in both gene sources,
		// check to see if the gene source needs to be set back to the preferred setting,
		// which will be either the site specific source or the  gene source
		// last selected from the dropdown
		resetGeneSource();
	}
	if (switchMsg) {
		//var msg = "<span style='font-size:18px'>" + switchMsg + "</span>";
		//alertify.set('notifier','position', 'top-right');
		//alertify.error(msg, 6);
		$('#non-protein-coding #no-transcripts-badge').removeClass("hide");
		$('#non-protein-coding #no-transcripts-badge').text(switchMsg);
	}
}

function resetGeneSource() {
	// Switch back to the site specific gene source (if provided),
	// but only if the user hasn't already selected a gene
	// source from the dropdown, which will override any default setting.
	if (typeof siteGeneSource !== 'undefined' && siteGeneSource) {
		if (siteGeneSource != geneSource) {
			switchGeneSource(siteGeneSource.toLowerCase() == 'refseq' ? "RefSeq Transcript" : "Gencode Transcript");
		}
	}
}


function switchGeneSource(newGeneSource) {

	// turn off event handling - instead we want to manually set the
	// gene source value
	$('#select-gene-source')[0].selectize.off('change');


	$('#select-gene-source')[0].selectize.setValue(newGeneSource);
	geneSource = newGeneSource.toLowerCase().split(" transcript")[0];


	// turn on event handling
	$('#select-gene-source')[0].selectize.on('change', function(value) {
		geneSource = value.toLowerCase().split(" transcript")[0];
		// When the user picks a different gene source from the dropdown,
		// this becomes the 'new' site gene source
		siteGeneSource = geneSource;
		geneToLatestTranscript = {};
		if (window.gene) {
			genesCard.selectGene(window.gene.gene_name);
		}
	});
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

function sidebarAdjustX(x, isRelative) {
	if (!$("#slider-left").hasClass("hide")) {
		var iconBarWidth = $("#slider-icon-bar").css("display") == "none" ? 0 : $("#slider-icon-bar").width();
		x -= ($("#slider-left").width() + iconBarWidth);
		x -= 1;
	} else if (isRelative != null && isRelative == true) {
		var iconBarWidth = $("#slider-icon-bar").css("display") == "none" ? 0 : $("#slider-icon-bar").width();
		x -= iconBarWidth;
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
	if  ((coord.x + (tooltipWidth/2) + 150) > $('#proband-variant-card').width()) {
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
	if (isLevelEdu && $('#slider-left').hasClass("hide")) {
		top += 50;
	}

	var height = +$('#proband-variant-card').outerHeight();
	height    += +$('#other-variant-cards').outerHeight();


	var width =  +$('#coordinate-frame').outerWidth();

	var topX = x;
	topX = sidebarAdjustX(topX, true);

	x = sidebarAdjustX(x);

	var margins = dataCard.mode == 'trio' ? 10 : 20;

	$('#coordinate-frame').css("top", top);
	$('#coordinate-frame').css("height", height - margins);
	$('#coordinate-frame').css("left", x - d3.round(width/2) - 2);
	$('#coordinate-frame').css("opacity", 1);

	if (regionStart == gene.start && regionEnd == gene.end) {

		var pointerWidth =  +$('#top-coordinate-frame').outerWidth();
		var paddingLeft = 10;
		var svgMarginLeft = isLevelEdu || isLevelBasic ? 9 : 4;
		$('#top-coordinate-frame').css("left", topX - d3.round(pointerWidth/2) - paddingLeft - svgMarginLeft);
		$('#top-coordinate-frame').removeClass("hide");
	}


}

function unpinAll() {
	clickedVariant = null;
	hideCoordinateFrame();
	matrixCard.hideTooltip();
	variantCards.forEach(function(variantCard) {
		variantCard.hideVariantCircle();
		variantCard.hideCoverageCircle();
	});
}

function hideCoordinateFrame() {
	$('#coordinate-frame').css("opacity", 0);
	$('#top-coordinate-frame').addClass("hide");
}


function readjustCards() {
	//if (isLevelEdu) {
	//  var top = +$('#nav-section').height();
	//  d3.select('#track-section').style("padding-top", top+6 + "px");
	//}
}


function showLegend() {
	$('#show-legend').addClass("hide");
	$('#legend-track').removeClass("hide");
	$('#matrix-track').css("width", "50%");
}

function hideLegend() {
	$('#show-legend').removeClass("hide");
	$('#legend-track').addClass("hide");
	$('#matrix-track').css("width", "100%");
}

function showSidebar(sidebar) {
	if (sidebar == "Phenolyzer") {
		$('#search-dna-glyph').attr('fill', '#5d809d');
	} else {
		$('#search-dna-glyph').attr('fill', 'white');
	}

	$('#slider-left .navbar').find('li').removeClass("active");
	$('#slider-left .navbar').find('li').addClass("hide");
	$('#slider-left .navbar').find('li#' + sidebar.toLowerCase() + "-tab").removeClass("hide");
	$('#slider-left .navbar').find('li#' + sidebar.toLowerCase() + "-tab").addClass("active");

	$('.sidebar-button').removeClass('selected');
	$('#slider-left-content #filter-track').toggleClass("hide", sidebar !== 'Filter');
	$('#slider-left-content #genes-card').toggleClass("hide", sidebar !== 'Phenolyzer');
	$('#slider-left-content #bookmark-card').toggleClass("hide", sidebar !== 'Bookmarks');
	$('#slider-left-content #recall-card').toggleClass("hide", sidebar !== 'Recall');
	$('#slider-left-content #help-card').toggleClass("hide", sidebar !== 'Help');

	if (sidebar == 'Bookmarks') {
		window.bookmarkCard.refreshBookmarkList();
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



function showDataDialog(activeTab, geneName) {

	if (geneName) {
		if (isKnownGene(geneName)) {
			getGeneBloodhoundInputElementForDataDialog().val(geneName);
			getGeneBloodhoundInputElementForDataDialog().trigger('typeahead:selected', {"name": geneName, loadFromUrl: true});
		}
	}

	if (activeTab && activeTab.length > 0) {
		var selector = '#dataModal a[href=\"#'+ activeTab + '\"]';
		$(selector).tab('show');
	}
	$('#dataModal').modal('show');
	if (genomeBuildHelper.getCurrentBuild() == null) {
		//$('#select-build-box .selectize-input').animateIt('tada', 'animate-twice');
	}

	$('#import-bookmarks-panel').removeClass("hide");

	dataCard.resetExportPanel();
	if (bookmarkCard.bookmarkedVariants && Object.keys(bookmarkCard.bookmarkedVariants).length > 0) {
		$('#export-bookmarks-panel').removeClass("hide");
	} else {
		$('#export-bookmarks-panel').addClass("hide");
	}
}

function showDataDialogImportBookmarks() {
	$('#dataModal a[href="#bookmarks"]').tab('show');
	$('#import-bookmarks-panel').removeClass("hide");
	$('#export-bookmarks-panel').addClass("hide");
	$('#dataModal').modal('show');
}
function showDataDialogExportBookmarks() {
	$('#dataModal a[href="#bookmarks"]').tab('show')
	$('#import-bookmarks-panel').addClass("hide");
	$('#export-bookmarks-panel').removeClass("hide");
	dataCard.resetExportPanel();
	$('#dataModal').modal('show');
}

function showFreebayesSettingsDialog(onClose) {
	if (allowFreebayesSettings) {
		fbSettings.onClose = onClose;
		fbSettings.visited = true;
		$('#fb-use-suggested-variants-cb').prop('checked', fbSettings.arguments.useSuggestedVariants.value);
		$('#fb-limit-to-suggested-variants-cb').prop('checked', fbSettings.arguments.limitToSuggestedVariants.value);
		$('#fb-min-mapping-qual'     ).val(fbSettings.arguments.minMappingQual.value);
		$('#fb-min-coverage'         ).val(fbSettings.arguments.minCoverage.value);
		$('#fb-use-dup-reads-cb'     ).prop('checked', fbSettings.arguments.useDupReads.value);

		$('#freebayes-settings-modal').modal("show");
	} else  {
		if (onClose) {
			onClose();
		}
	}
}

function saveFreebayesSettings() {
	fbSettings.arguments.useSuggestedVariants.value     = $('#fb-use-suggested-variants-cb').is(":checked");
	fbSettings.arguments.limitToSuggestedVariants.value = $('#fb-limit-to-suggested-variants-cb').is(":checked");
	fbSettings.arguments.minMappingQual.value           = $('#fb-min-mapping-qual').val();
	fbSettings.arguments.minCoverage.value              = $('#fb-min-coverage').val();
	fbSettings.arguments.useDupReads.value              = $('#fb-use-dup-reads-cb').is(":checked");

	if (fbSettings.onClose) {
		fbSettings.onClose();
	}

	$('#freebayes-settings-modal').modal("hide");
}

function detectWindowResize() {
	$(window).resize(function() {
			if(this.resizeTO) clearTimeout(this.resizeTO);
			this.resizeTO = setTimeout(function() {
					$(this).trigger('resizeEnd');
			}, 500);
	});

	$(window).bind('resizeEnd', function() {
		resizeCardWidths();
	});
}


function resizeCardWidths() {
	var windowWidth  = $(window).width();
	var windowHeight = $(window).height();
	var sliderWidth    = 0;
	if ($('#slider-left').hasClass("hide") == false) {
		sliderWidth = +$('#slider-left').width();
		$('#nav-section').css("width", "100%");
	} else {
		$('#nav-section').css("width", '');
	}

	$('#container').css('width', windowWidth - sliderWidth - (isLevelEdu || isLevelBasic ? 10 : 0));
	$('#matrix-panel').css('max-width', windowWidth - sliderWidth - (isLevelEdu  || isLevelBasic ? 0 : 60));
	$('#matrix-panel').css('min-width', windowWidth - sliderWidth - (isLevelEdu  || isLevelBasic ? 0 : 60));

	if (windowHeight < 700) {
		matrixCard.setCellSize('small');
	} else {
		matrixCard.setCellSize('large');
	}

	//$('#slider-left-content').css('height', window.innerHeight);
}

function closeSlideLeft() {

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
		if (Object.keys($('#proband-data #vcf-sample-select')[0].selectize.options).length > 0) {
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
	}
	enableLoadButton();

}

function clearMotherFatherData() {
	var motherCard = null;
	var fatherCard = null;
	if (dataCard.mode == 'single') {
		variantCards.forEach( function(variantCard) {
			if (variantCard.getRelationship() == 'mother') {
				motherCard = variantCard;
				motherCard.clearVcf();
				motherCard.clearBam();
				motherCard.hide();
				$('#mother-data').find('#vcf-file-info').val('');
				$('#mother-data').find('#vcf-url-input').val('');
				removeUrl("vcf1");
				removeUrl("bam1");
			} else if (variantCard.getRelationship() == 'father') {
				fatherCard = variantCard;
				fatherCard.clearVcf();
				fatherCard.clearBam();
				fatherCard.hide();
				$('#father-data').find('#vcf-file-info').val('');
				$('#father-data').find('#vcf-url-input').val('');
				removeUrl("vcf2");
				removeUrl("bam2");
			}
		});
	}

}

function getGeneBloodhoundElementForDataDialog() {
	return $('#bloodhound-data-dialog .typeahead');
}
function getGeneBloodhoundInputElementForDataDialog() {
	return $('#bloodhound-data-dialog .typeahead.tt-input');
}

function getGeneBloodhoundElement() {
	return isLevelBasic ? $('#bloodhound-sidebar .typeahead') : $('#bloodhound .typeahead');
}

function getGeneBloodhoundInputElement() {
	return isLevelBasic ? $('#bloodhound-sidebar .typeahead.tt-input') : $('#bloodhound .typeahead.tt-input');
}
function setGeneBloodhoundInputElement(geneName, loadFromUrl, trigger) {
	if (!isLevelBasic) {
		getGeneBloodhoundInputElement().val(geneName);
	}
	if (trigger) {
		getGeneBloodhoundInputElement().trigger('typeahead:selected', {"name": geneName, loadFromUrl: loadFromUrl});
	}
}

function loadGeneFromUrl() {
	// Get the species
	var species = getUrlParameter('species');
	if (species != null && species != "") {
		dataCard.setCurrentSpecies(species);
	}

	// Get the genome build
	var build = getUrlParameter('build');
	if (build != null && build != "") {
		dataCard.setCurrentBuild(build);
	}


	// Get the gene parameter
	var geneName = getUrlParameter('gene');
	if (geneName) {
		geneName = geneName.toUpperCase();
	}

	var theGeneSource = getUrlParameter("geneSource");
	if (theGeneSource != null && theGeneSource != "") {
		siteGeneSource = theGeneSource;
		switchGeneSource(theGeneSource.toLowerCase() == 'refseq' ? "RefSeq Transcript" : "Gencode Transcript");
	}

	var batchSize = getUrlParameter("batchSize");
	if (batchSize != null && batchSize != "") {
		DEFAULT_BATCH_SIZE = batchSize;
	}

	loadGeneNamesFromUrl(geneName);



	if (isMygene2) {
		if (isLevelBasic) {
			showSidebar("Phenolyzer");
		}
		dataCard.loadMygene2Data();
	} else if (isLevelEdu) {
		if (isLevelEdu && eduTourShowPhenolyzer[+eduTourNumber-1]) {
			showSidebar("Phenolyzer");
		}
		dataCard.loadDemoData();
	} else {

		// Load the gene
			if (geneName != undefined) {
			// If the species and build have been specified, type in the gene name; this will
			// trigger the event to get the gene info and then call loadUrlSources()
			if (genomeBuildHelper.getCurrentSpecies() && genomeBuildHelper.getCurrentBuild()) {
				if (isKnownGene(geneName)) {
					setGeneBloodhoundInputElement(geneName, true, true);
				}
			} else {
				// The build wasn't specified in the URL parameters, so force the user
				// to select the gemome build from the data dialog.
				loadUrlSources();
				showDataDialog(null, geneName);
			}
		} else {
			// If a gene wasn't provided, go ahead and just set the data sources, etc for
			// other url parameters.
			loadUrlSources();

		}


	}





}

function isKnownGene(geneName) {
	return allKnownGeneNames[geneName] || allKnownGeneNames[geneName.toUpperCase()]
}

function loadGeneNamesFromUrl(geneNameToSelect) {
	geneNames = [];
	var unknownGeneNames = {};

	// Add the gene to select to the gene list
	if (geneNameToSelect && geneNameToSelect.length > 0) {
		if (isKnownGene(geneNameToSelect)) {
			geneNames.push(geneNameToSelect.toUpperCase());
		} else {
			unknownGeneNames[geneNameToSelect] = true;
			geneNameToSelect = null;
		}
	}


	// If a gene list name was provided (e.g. ACMG, load these genes)
	var geneList = getUrlParameter("geneList");
	if (geneList != null && geneList.length > 0 && geneList == 'ACMG56') {
		genesCard.ACMG_GENES.sort().forEach(function(geneName) {
			if ( geneNames.indexOf(geneName.toUpperCase()) < 0 ) {
				geneNames.push(geneName.toUpperCase());
			}
		});
	}

	// Get the gene list from the url.  Add the gene badges, selecting
	// the gene that was passed in the url parameter
	var genes = getUrlParameter("genes");
	if (genes != null && genes.length > 0) {
		genes.split(",").forEach( function(geneName) {
			if ( geneNames.indexOf(geneName) < 0 ) {
				if (isKnownGene(geneName.toUpperCase())) {
					geneNames.push(geneName.toUpperCase());
				} else {
					unknownGeneNames[geneName] = true;
				}
			}
		});
	}

	if (geneNames.length > 0) {
		if (!geneNameToSelect) {
			geneNameToSelect = geneNames[0];
		}
		$('#genes-to-copy').val(geneNames.join(","));
		genesCard.copyPasteGenes(geneNameToSelect, true);
	}
	if (Object.keys(unknownGeneNames).length > 0) {
		var message = "Bypassing unknown genes: " + Object.keys(unknownGeneNames).join(", ") + ".";
		alertify.alert(message);
	}
}

function reloadGeneFromUrl() {

	// Get the gene parameger
	var gene = getUrlParameter('gene');

	// Get the gene list from the url.  Add the gene badges, selecting
	// the gene that was passed in the url parameter
	loadGeneNamesFromUrl(gene);

	if (isKnownGene(gene)) {
		setGeneBloodhoundInputElement(gene, true, true);
		genesCard._geneBadgeLoading(gene, true, true);
	}
}

function showWelcomePanel() {

	var bam  = getUrlParameter(/(bam)*/);
	var vcf  = getUrlParameter(/(vcf)*/);

	var bamCount = bam != null ? Object.keys(bam).length : 0;
	var vcfCount = vcf != null ? Object.keys(vcf).length : 0;

	if (bamCount == 0 && vcfCount == 0) {
		$('#welcome-area').removeClass("hide");
	} else {
		$('#welcome-area').addClass("hide");
	}


}

function loadUrlSources() {

	var bam      = getUrlParameter(/(bam)*/);
	var bai      = getUrlParameter(/(bai)*/);
	var vcf      = getUrlParameter(/(vcf)*/);
	var tbi      = getUrlParameter(/(tbi)*/);
	var rel      = getUrlParameter(/(rel)*/);
	var affected = getUrlParameter(/(affectedStatus)*/);
	var dsname   = getUrlParameter(/(name)*/);
	var sample   = getUrlParameter(/(sample)*/);
	var affectedSibsString = getUrlParameter("affectedSibs");
	var unaffectedSibsString = getUrlParameter("unaffectedSibs");


	// Initialize transcript chart and variant cards, but hold off on displaying
	// the variant cards.
	if (!isLevelEdu  && !isLevelBasic) {
		if (genomeBuildHelper.getCurrentSpecies() && genomeBuildHelper.getCurrentBuild()) {
			loadTracksForGene(true);

		}
	}



	if ((bam != null && Object.keys(bam).length > 1) || (vcf != null && Object.keys(vcf).length > 1)) {
		if (!isLevelEdu) {
			toggleSampleTrio(true);
		}
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
	if (affected != null) {
		Object.keys(affected).forEach(function(urlParameter) {
			var cardIndex = urlParameter.substring(14);
			var variantCard      = variantCards[+cardIndex];
			var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
			var panelSelector    = $(panelSelectorStr);
			var status = affected[urlParameter];
			panelSelector.find('#affected-cb').prop('checked', status == "true" ? true : false);
			dataCard.setAffected(panelSelector);
		});
	}

	var bamLoadedCount = 0;
	var vcfLoadedCount = 0;

	var bamCount = bam != null ? Object.keys(bam).length : 0;
	var vcfCount = vcf != null ? Object.keys(vcf).length : 0;


	var loadTracks = function() {
		if (vcf != null || bam != null) {
			// Only load tracks for genes if all bam and vcf urls loaded without error
			if (vcfCount == vcfLoadedCount && bamCount == bamLoadedCount) {

				window.setGeneratedSampleNames();

				// Now create variant cards for the affected and unaffected sibs
				if (affectedSibsString) {
					var affectedSibs = affectedSibsString.split(",");
					window.loadSibs(affectedSibs, 'affected');
				}
				if (unaffectedSibsString) {
					var unaffectedSibs = unaffectedSibsString.split(",");
					window.loadSibs(unaffectedSibs, 'unaffected');
				}

				if (sample != null) {
					Object.keys(sample).forEach(function(urlParameter) {
						var cardIndex = urlParameter.substring(6);
						var variantCard = variantCards[+cardIndex];
						var sampleName = sample[urlParameter];
						variantCard.setSampleName(sampleName);
						variantCard.setDefaultSampleName(sampleName);

						// When vcf Url was entered, sample dropdown was cleared and resulted
						// in the url parameter sample# getting clear.  Re-establish the
						// url to the pre- onVcfUrlUpdated parameters
						updateUrl('sample'+cardIndex, sampleName);
					});

				}


				genesCard.showAnalyzeAllButton();
				getAffectedInfo(true);
				filterCard.displayAffectedFilters();
				genericAnnotation.appendGenericFilters(getProbandVariantCard().model.getAnnotators());


				if (genomeBuildHelper.getCurrentSpecies() && genomeBuildHelper.getCurrentBuild()) {
					loadTracksForGene( false );
				}

				if ((isLevelEdu || isLevelBasic) && $('#slider-left').hasClass("hide")) {
					if (!isLevelEdu || eduTourShowPhenolyzer[+eduTourNumber-1]) {
						showSidebar("Phenolyzer");
					}
				}
			}
		}
	};


	if (vcf != null) {
		Object.keys(vcf).forEach(function(urlParameter) {
			var cardIndex = urlParameter.substring(3);
			var tbiUrl    = tbi && Object.keys(tbi).length > 0 ? decodeUrl(tbi["tbi"+cardIndex]) : null;
			var variantCard      = variantCards[+cardIndex];
			if (variantCard) {
				var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
				var panelSelector    = $(panelSelectorStr);
				var vcfUrl = decodeUrl(vcf[urlParameter]);
				panelSelector.find('#url-input').val(vcfUrl);
				panelSelector.find('#url-input').removeClass("hide");
				if (tbiUrl && tbiUrl != "") {
					panelSelector.find('#url-tbi-input').val(tbiUrl);
					panelSelector.find('#url-tbi-input').removeClass("hide");
					$('#separate-url-for-index-files-cb').prop('checked', true);
				}
				dataCard.onVcfUrlEntered(panelSelector, function(success) {
					if (success) {
						vcfLoadedCount++;
					}
					loadTracks();
				});
			}

		});
	}

	if (bam != null) {
		Object.keys(bam).forEach(function(urlParameter) {
			var cardIndex = urlParameter.substring(3);
			var baiUrl    = bai && Object.keys(bai).length > 0 ? decodeUrl(bai["bai"+cardIndex]) : null;
			var variantCard      = variantCards[+cardIndex];
			if (variantCard) {
				var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
				var panelSelector    = $(panelSelectorStr);
				panelSelector.find('#bam-url-input').val(decodeUrl(bam[urlParameter]));
				panelSelector.find('#bam-url-input').removeClass("hide");
				if (baiUrl && baiUrl != "") {
					panelSelector.find('#bai-url-input').val(baiUrl);
					panelSelector.find('#bai-url-input').removeClass("hide");
					$('#separate-url-for-index-files-cb').prop('checked', true);
				}
				dataCard.onBamUrlEntered(panelSelector, function(success) {
					if (success) {
						bamLoadedCount++;
					}
					loadTracks();
				});
			}
		});
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


function selectTranscript(transcriptId) {
	var found = false;
	hideCoordinateFrame();
	window.gene.transcripts.forEach(function(transcript) {
		if (transcript.transcript_id == transcriptId) {
			window.selectedTranscript = transcript;
			found = true;
		} else if (transcript.transcript_id.indexOf(transcriptId.toUpperCase()) == 0) {
			window.selectedTranscript = transcript;
			found = true;
		}
	})
	if (found) {
		selectCurrentTranscript();
	}
}


function onCloseTranscriptMenuEvent() {
	if (transcriptMenuChart.selectedTranscript() != null ) {
		if (selectedTranscript == null || selectedTranscript.transcript_id != transcriptMenuChart.selectedTranscript().transcript_id) {
			selectedTranscript = transcriptMenuChart.selectedTranscript();
			selectCurrentTranscript();
		 }

	}

}

function selectCurrentTranscript() {
	promiseMarkCodingRegions(window.gene, window.selectedTranscript)
		.then(function() {
			geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
			d3.selectAll("#gene-viz .transcript rect").remove();
			getCodingRegions(window.selectedTranscript);
			loadTracksForGene();
		})
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

function getCodingRegions(transcript) {
	if (transcript && transcript.features) {
		var codingRegions = transcriptCodingRegions[transcript.transcript_id];
		if (codingRegions) {
			return codingRegions;
		}
		codingRegions = [];
		transcript.features.forEach( function(feature) {
			if ($.inArray(feature.feature_type, ['EXON', 'CDS', 'UTR']) !== -1) {
				codingRegions.push({ start: feature.start, end: feature.end });
			}
		});
		transcriptCodingRegions[transcript.transcript_id] = codingRegions;
		return codingRegions;
	}
	return [];
}



function promiseMarkCodingRegions(geneObject, transcript) {
	var exonPromises = [];
	transcript.features.forEach(function(feature) {
		if (!feature.hasOwnProperty("danger")) {
			feature.danger = {proband: false, mother: false, father: false};
		}
		if (!feature.hasOwnProperty("geneCoverage")) {
			feature.geneCoverage = {proband: false, mother: false, father: false};
		}


		getRelevantVariantCards().forEach(function(vc) {
			var promise = vc.model.promiseGetCachedGeneCoverage(geneObject, transcript)
			 .then(function(geneCoverage) {
					if (geneCoverage) {
						var matchingFeatureCoverage = geneCoverage.filter(function(gc) {
							return feature.start == gc.start && feature.end == gc.end;
						});
						if (matchingFeatureCoverage.length > 0) {
							var gc = matchingFeatureCoverage[0];
							feature.geneCoverage[vc.getRelationship()] = gc;
							feature.danger[vc.getRelationship()] = filterCard.isLowCoverage(gc);
						} else {
							feature.danger[vc.getRelationship()]  = false;
						}
					} else {
						feature.danger[vc.getRelationship()] = false;
					}

			 })
			exonPromises.push(promise);
		})
	})

	return Promise.all(exonPromises).then(function() {
		var sortedExons = _getSortedExonsForTranscript(transcript);
		_setTranscriptExonNumbers(transcript, sortedExons);
	});
}

function _getSortedExonsForTranscript(transcript) {
	var sortedExons = transcript
		.features.filter(function(feature) {
			return feature.feature_type.toUpperCase() == 'EXON';
		})
		.sort(function(feature1, feature2) {

			var compare = 0;
			if (feature1.start < feature2.start) {
				compare = -1;
			} else if (feature1.start > feature2.start) {
				compare = 1;
			} else {
				compare = 0;
			}

			var strandMultiplier = transcript.strand == "+" ? 1 : -1;

			return compare * strandMultiplier;

		})

	var exonCount = 0;
	sortedExons.forEach(function(exon) {
		exonCount++
	})

	var exonNumber = 1;
	sortedExons.forEach(function(exon) {
		exon.exon_number = exonNumber + "/" + exonCount;
		exonNumber++;
	})
	return sortedExons;
}


function _setTranscriptExonNumbers(transcript, sortedExons) {
	// Set the exon number on each UTR and CDS within the corresponding exon
	transcript.features.forEach(function(feature) {
		if (feature.feature_type.toUpperCase() == 'CDS' || feature.feature_type.toUpperCase() == 'UTR') {
			sortedExons.forEach(function(exon) {
				if (feature.start >= exon.start && feature.end <= exon.end) {
					feature.exon_number = exon.exon_number;
				}
			})
		}
	})
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






function adjustGeneRegionBuffer() {
	if (+$('#gene-region-buffer-input').val() > GENE_REGION_BUFFER_MAX) {
		alert("Up to 50 kb upstream/downstream regions can be displayed.")
	} else {
		GENE_REGION_BUFFER = +$('#gene-region-buffer-input').val();
		setGeneBloodhoundInputElement(gene.gene_name, false, true);
	}
	cacheHelper.clearCache();

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


function switchToAdvancedMode() {
	changeSiteStylesheet("css/assets/site-mygene2-advanced.css");
	updateUrl("mygene2", "true");
	updateUrl("mode",    "advanced");
	location.reload();
}
function switchToBasicMode() {
	changeSiteStylesheet("css/assets/mygene2-basic.css");
	updateUrl("mygene2",  "true");
	updateUrl("mode",     "basic");
	location.reload();
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

		var matchExact = function(r, str) {
			var match = str.match(r);
			return match != null && str.indexOf(match[0]) == 0;
	}

	var getMatch = function(string, regex, index) {
			index || (index = 1); // default to the first capturing group
			var matches = [];
			var match = regex.exec(string);
			if (match && match.length > index && match[index]) {
				return match[index];
			} else {
				return null;
			}
		}


		for (var i = 0; i < sURLVariables.length; i++)
		{
				var sParameterName = sURLVariables[i].split('=');
				if (typeof sParam == 'string' || sParam instanceof String) {
					if (sParameterName[0] == sParam)
					{
							return sParameterName[1];
					}
			} else {
				var match = getMatch(sParameterName[0], sParam)
				if ( match) {
					hits[sParameterName[0]] = sParameterName[1];
				}
			}
		}
		if (Object.keys(hits).length == 0)
			return undefined;
		else
			return hits;
}


function promiseGetCachedGeneModel(geneName, resolveOnError=false) {
	return new Promise( function(resolve, reject) {
		var theGeneObject = window.geneObjects[geneName];
		if (theGeneObject) {
			resolve(theGeneObject);
		} else {
			promiseGetGeneModel(geneName).then(function(geneObject) {
				resolve(geneObject);
			},
			function(error) {
				if (resolveOnError) {
					resolve(null);
				} else {
					reject(error);
				}
			});
		}

	});
}


function promiseGetGeneModel(geneName) {
	return new Promise(function(resolve, reject) {

		var url = geneInfoServer + 'api/gene/' + geneName;

		// If current build not specified, default to GRCh37
		var buildName = genomeBuildHelper.getCurrentBuildName() ? genomeBuildHelper.getCurrentBuildName() : "GRCh37";
		$('#build-link').text(buildName);


		url += "?source="  + geneSource;
		url += "&species=" + genomeBuildHelper.getCurrentSpeciesLatinName();
		url += "&build="   + buildName;


		$.ajax({
				url: url,
				jsonp: "callback",
				type: "GET",
				dataType: "jsonp",
				success: function( response ) {
					if (response.length > 0 && response[0].hasOwnProperty('gene_name')) {
						var geneModel = response[0];
						resolve(geneModel);
					} else {
					console.log("Gene model for " + geneName + " not found.  Empty results returned from " + url);
						reject("Gene model for " + geneName + " not found.");
					}
				},
			error: function( xhr, status, errorThrown ) {

						console.log("Gene model for " +  geneName + " not found.  Error occurred.");
						console.log( "Error: " + errorThrown );
						console.log( "Status: " + status );
						console.log( xhr );
					reject("Error " + errorThrown + " occurred when attempting to get gene model for gene " + geneName);

				}
		});

	});
}



function loadGeneWidgets(callback) {
	// kicks off the loading/processing of `local` and `prefetch`
	gene_engine.initialize();


	var typeahead = getGeneBloodhoundElement().typeahead({
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

	var typeaheadDataDialog = getGeneBloodhoundElementForDataDialog().typeahead({
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

	var onGeneNameEntered = function(evt,data) {
		// Ignore second event triggered by loading gene widget from url parameter
		if (data.loadFromUrl && loadedUrl) {
			return;
		} else if (data.loadFromUrl) {
			loadedUrl = true;
		}

		var theGeneName = data.name;


		// If necessary, switch from gencode to refseq or vice versa if this gene
		// only has transcripts in only one of the gene sets
		checkGeneSource(theGeneName);

		promiseGetGeneModel(data.name).then( function(geneModel) {
				// We have successfully return the gene model data.
				// Load all of the tracks for the gene's region.
				window.gene = geneModel;

				adjustGeneRegion(window.gene);

				// Add the gene badge
				genesCard.addGene(window.gene.gene_name);
				cacheHelper.showAnalyzeAllProgress();


				window.geneObjects[window.gene.gene_name] = window.gene;

				// if the gene name was entered on the data dialog, enable/disable
				// the load button
				if (evt.currentTarget.id == 'enter-gene-name-data-dialog') {
					enableLoadButton();
				}

				if (!validateGeneTranscripts()) {
					return;
				}

				// set all searches to correct gene
				setGeneBloodhoundInputElement(window.gene.gene_name);
				window.selectedTranscript = geneToLatestTranscript[window.gene.gene_name];


				if (data.loadFromUrl) {

					var bam  = getUrlParameter(/(bam)*/);
				var vcf  = getUrlParameter(/(vcf)*/);


				if (bam == null && vcf == null) {
					// Open the 'About' sidebar by default if there is no data loaded when gene is launched
					if (isLevelEdu) {
						if (!isLevelEdu || eduTourShowPhenolyzer[+eduTourNumber-1]) {
							showSidebar("Phenolyzer");
						}
					} else if (isLevelBasic) {
						showSidebar("Phenolyzer");
					}
				}


				if (bam == null && vcf == null) {
					// Open the 'About' sidebar by default if there is no data loaded when gene is launched
					if (isLevelEdu) {
						if (!isLevelEdu || eduTourShowPhenolyzer[+eduTourNumber-1]) {
							showSidebar("Phenolyzer");
						}
					}
				}

				if (!isOffline) {
						genesCard.updateGeneInfoLink(window.gene.gene_name);
				}

					// Autoload data specified in url
				loadUrlSources();

				enableCallVariantsButton();
			} else {

				$('#splash').addClass("hide");

				genesCard.setSelectedGene(window.gene.gene_name);

				// Only load the variant data if the gene name was NOT entered
				// on the data dialog.
				if (evt.currentTarget.id != 'enter-gene-name-data-dialog') {
						loadTracksForGene();
				}

					// add gene to url params
					updateUrl('gene', window.gene.gene_name);

					if (!isOffline) {
						genesCard.updateGeneInfoLink(window.gene.gene_name);
					}

					if(data.callback != undefined) data.callback();

				}


		}, function(error) {
			alertify.alert(error);
			genesCard.removeGeneBadgeByName(theGeneName);

		});
	}

	typeahead.on('typeahead:selected',function(evt,data){
		onGeneNameEntered(evt,data);
	});
	typeaheadDataDialog.on('typeahead:selected',function(evt,data){
		onGeneNameEntered(evt,data);
	});


	loadFullGeneSet(callback);
}

function loadFullGeneSet(callback) {

	$.ajax({url: 'genes.json',
			data_type: 'json',
						success: function( data ) {
							var sortedGenes = getRidOfDuplicates(data);
							allKnownGeneNames = {};
							sortedGenes.forEach(function(geneObject) {
								if (geneObject && geneObject.name && geneObject.name.length > 0) {
									allKnownGeneNames[geneObject.name.toUpperCase()] = true;
								}
							})
							gene_engine.clear();
				gene_engine.add(sortedGenes);
				if (callback) {
					callback(true);
				}
					},
						error: function(xhr, ajaxOptions, thrownError) {
							console.log("failed to get genes.json " + thrownError);
							console.log(xhr.status);
							if (callback) {
								callback(false);
							}
						}
	})
}

function getRidOfDuplicates(genes) {
	var sortedGenes = genes.sort( function(g1, g2) {
		if (g1.gene_name < g2.gene_name) {
			return -1;
		} else if (g1.gene_name > g2.gene_name) {
			return 1;
		} else {
			return 0;
		}
	});
	// Flag gene objects with same name
	for (var i =0; i < sortedGenes.length - 1; i++) {
				var gene = sortedGenes[i];


				var nextGene = sortedGenes[i+1];
				if (i == 0) {
					gene.dup = false;
				}
				nextGene.dup = false;

				if (gene.gene_name == nextGene.gene_name && gene.refseq == nextGene.refseq && gene.gencode == nextGene.gencode) {
					nextGene.dup = true;
			}

			// Some more processing to gather unique gene sets and add field 'name'
				gene.name = gene.gene_name;
			if (gene.refseq != gene.gencode) {
				if (gene.refseq) {
					refseqOnly[gene.gene_name] = gene;
				} else {
					gencodeOnly[gene.gene_name] = gene;
				}
			}
	}
	return sortedGenes.filter(function(gene) {
		return gene.dup == false;
	});
}



/*
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
function loadTracksForGene(bypassVariantCards, callback) {

	hideIntro();
	if (window.gene == null || window.gene == "" && !isLevelBasic) {
		//$('.bloodhound .twitter-typeahead').animateIt('tada');
		return;
	}


	$('#nav-section').removeClass("hide");

	genesCard.showGeneBadgeLoading(window.gene.gene_name);

	if (!bypassVariantCards && !isDataLoaded()) {
		//$('#add-data-button').animateIt('tada', 'animate-twice');
		$('#add-data-button').addClass("attention");
	} else {
		$('#add-data-button').removeClass("attention");
	}

	regionStart = null;
	regionEnd = null;

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

	// If the 'variants' radio button was selected for Known Variants card, reset to
	// counts because getting the variants is costly for large genes
	if (!hideKnownVariantsCard) {
		clearKnownVariantsCard();
		$('#known-variants-nav-radio-buttons input:radio[name="known-variants-display-radio"]').filter('[value="counts"]').prop("checked", true);
		hideKnownVariants = false;
	}

	// Show the chart for known variants
	if (!bypassVariantCards) {
		$('#known-variants-all-card').removeClass("hide");
		showKnownVariantsCounts();
	}

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

	//$('#filter-and-rank-card').removeClass("hide");
	//$('#matrix-track').removeClass("hide");
	if (isLevelEdu) {
		$('#rank-variants-title').text('Evaluated variants for ' + getProbandVariantCard().model.getName() );
	} else if (isLevelBasic) {
		$('#rank-variants-title').text('Table of Variants');
	}
	//mat $("#matrix-panel .loader").removeClass("hide");
	$("#feature-matrix").addClass("hide");
	$("#feature-matrix-note").addClass("hide");
	$('#matrix-track .warning').addClass("hide");

	readjustCards();
	filterCard.disableFilters();
	transcriptPanelHeight = d3.select("#nav-section").node().offsetHeight;


	if (isAlignmentsOnly() && autocall == null) {
		shouldAutocall(function() {
			// Load the variant cards and feature matrix with the annotated variants and coverage
			loadTracksForGeneImpl(bypassVariantCards, callback);
		});
	} else {
		// Load the variant cards and feature matrix with the annotated variants and coverage
		loadTracksForGeneImpl(bypassVariantCards, callback);

	}

}


function promiseHasCachedCalledVariants(geneObject, transcript) {
	var cachedCount =  0;
	var promises = [];
	return new Promise(function(resolve, reject) {
		getRelevantVariantCards().forEach(function(vc) {
			var p = vc.model.promiseGetFbData(geneObject, transcript)
			 .then(function(data) {
				if (data.fbData) {
					cachedCount ++;
				}

			 })
			promises.push(p);
		});
		Promise.all(promises).then(function() {
			resolve(cachedCount == getRelevantVariantCards().length);
		})

	})
}

function isAlignmentsOnly(callback) {
	var cards = getRelevantVariantCards().filter(function(vc) {
		return vc.model.isAlignmentsOnly();
	});
	return cards.length == getRelevantVariantCards().length;
}


function samplesInSingleVcf() {
	var theVcfs = {};
	var cards = getRelevantVariantCards().forEach(function(vc) {
		if (!vc.model.isAlignmentsOnly()) {
			if (vc.model.vcfUrlEntered) {
				theVcfs[vc.model.vcf.getVcfURL()] = true;
			} else {
				theVcfs[vc.model.vcf.getVcfFile().name] = true;
			}

		}
	});
	return Object.keys(theVcfs).length == 1;
}


function promiseHasCalledVariants() {
	var promises = [];
	var count = 0;

	return new Promise(function(resolve, reject) {
		getRelevantVariantCards().forEach(function(vc) {
			var promise = vc.model.promiseHasCalledVariants().then(function(hasCalledVariants) {
				if (hasCalledVariants) {
					count++;
				}
			})
			promises.push(promise);
		});

		Promise.all(promises).then(function() {
			resolve(count == getRelevantVariantCards().length);
		})
	});

}

function showNavVariantLinks() {
	$('#call-variants-link').removeClass("hide");
	$('#variant-links-divider').removeClass("hide");
}

function loadTracksForGeneImpl(bypassVariantCards, callback) {
	var me = this;

	if (!hasDataSources()) {
		return;
	}

	unpinAll();

	genesCard.flagUserVisitedGene(window.gene.gene_name);
	$('#welcome-area').addClass("hide");

	getRelevantVariantCards().forEach(function(vc) {
		vc.prepareToShowVariants();
		vc.clearBamChart();
		if (dataCard.mode == 'single' && vc.getRelationship() != 'proband') {
			vc.hide();
		}
	});

	if (bypassVariantCards == null || !bypassVariantCards) {

		window.hideCircleRelatedVariants();


		// Load the variants in the variant cards first. After each sample's
		// variants are shown, load the coverage from the alignment file for
		// the sample. We load the variants first so that we can send in the
		// specific points of the variants to samtools mpileup to get the exact
		// coverage at each variant's position.  We load the coverage before showing
		// the coverage so that the max depth for all variant cards is determined
		// so that the coverage scales across all samples.
		var variantPromises = [];

		promiseGetCachedGeneCoverage(window.gene, window.selectedTranscript, true).then(function() {
				return promiseMarkCodingRegions(window.gene, window.selectedTranscript);

		}).then(function() {

			geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;


			if (isAlignmentsOnly() && autocall) {
				// Only alignment files are loaded and user, when prompted, responded
				// that variants should be autocalled when gene is selected.
				// First perform joint calling, then load the bam data (for coverage)
				// for each sample.
				var callPromise = promiseJointCallVariants(true).then(function() {
					showNavVariantLinks();
				})
				variantPromises.push(callPromise);

			} else if (dataCard.mode == 'trio' && samplesInSingleVcf()) {
				// We have a multi-sample vcf, so we only need to retrieve the vcf records once for
				// the proband and then obtain the genotypes for the mother/father and affected/unaffected
				// sibs.
				var variantPromise = getProbandVariantCard().model.promiseGetVariantsMultipleSamples(window.gene, window.selectedTranscript, getRelevantVariantCards())
										.then( function() {

						getRelevantVariantCards().forEach(function(vc) {

							// We have variants, either to load from a vcf or called from alignments and
							// optionally alignments.  First annotate the show the variants in the
							// variant cards and calcuate the coverage (if alignments provided).
							vc.promiseLoadAndShowVariants(true)
												.then( function() {

													if (vc.getRelationship() == 'proband') {
														showNavVariantLinks();
													}

								});

						});
				 });
				 variantPromises.push(variantPromise);


			} else {
				getRelevantVariantCards().forEach(function(vc) {

					if (vc.model.isVcfReadyToLoad() || vc.model.isLoaded()) {
						// We have variants, either to load from a vcf or called from alignments and
						// optionally alignments.  First annotate the show the variants in the
						// variant cards and calcuate the coverage (if alignments provided).
						var variantPromise = vc.promiseLoadAndShowVariants(true)
											.then( function() {

												if (vc.getRelationship() == 'proband') {
													showNavVariantLinks();
												}

							});
							variantPromises.push(variantPromise);

					}

				});

			}




			// For a trio, when all of the variants for the trio have been displayed and fully annotated
			// (including vep, clinvar, and coverage), compare the proband to mother and father
			// to determine inheritance and obtain the trio's allele counts.
			// Once inheritance is determined, show the feature matrix for the proband
			// and refresh the variants for all samples.  Now that all variants have been displayed,
			// get the bam depth and display it.  We do this last since we want to show the variants
			// in the ranked table as soon as possible.
			Promise.all(variantPromises).then(function() {

				var coveragePromises = [];
				var allMaxDepth = 0;
				fulfilledTrioPromise = false;


				// the variants are fully annotated so determine inheritance (if trio).
				// Also scale the coverage chart y-axis
				// based on the max depth of all sample's coverage data
				promiseDetermineInheritance(promiseFullTrio).then(function() {
					getRelevantVariantCards().forEach(function(vc) {
						// The inheritance has been determined for the trio, so now
						// show the variants and the feature matrix
						vc.showFinalizedVariants();
						if (vc.getRelationship() == 'proband' && callback) {
							callback();
						}
					})
				});

				// Get the bam depth for each sample.  Calculate the max depth
				// so that all coverage charts use the same y-Axis
				getRelevantVariantCards().forEach(function(vc) {
						var coveragePromise = vc.promiseLoadBamDepth()
														 .then( function(coverageData) {
												if (coverageData) {
													var max = d3.max(coverageData, function(d,i) { return d[1]});
													if (max > allMaxDepth) {
														allMaxDepth = max;
													}
												}

														 });
						coveragePromises.push(coveragePromise);
				});

				// When we have figured out the max bam depth, show the bam depth
				// for each sample
				Promise.all(coveragePromises).then(function() {
					// Show the coverage chart (if alignments provided)
					getRelevantVariantCards().forEach(function(variantCard) {
						variantCard.showBamDepth(allMaxDepth, function(theVariantCard) {
							theVariantCard.highlightLowCoverageRegions(window.selectedTranscript);
						});
					});
				});

			});






				});



	}

}

/*
*  Even though the app has initialize three variant cards, we only want to return
*  the proband variant card if this is a 'single' proband analyis.  For 'trio'
*  analysis, return all variant cards.
*/
function getRelevantVariantCards() {
	var rels = {'proband': true};
	if (dataCard.mode == 'trio') {
		rels.mother = true;
		rels.father = true;
	}

	if (!hideKnownVariantsCard) {
		rels['known-variants'] = true;
	}
	if (variantCards && variantCards.length > 0) {
		return variantCards.filter(function(vc) {
			return rels[vc.getRelationship()];
		})
	} else {
		return [];
	}
}

function setGeneratedSampleNames() {
	// Make sure each variant card has a sample name; otherwise, we can't address
	// the genotypes map later on.
	getRelevantVariantCards().forEach(function(vc) {
		if (vc.getSampleName() == null ||  vc.getSampleName() == '') {
			vc.setGeneratedSampleName(vc.getRelationship());
		}
	})
}

function getAffectedInfo (forceRefresh) {
	if (window.affectedInfo == null || forceRefresh) {
		window.affectedInfo = [];
		if (getRelevantVariantCards() && getRelevantVariantCards().length > 0) {
			getRelevantVariantCards().forEach(function(vc) {
				if (vc && vc.getRelationship() != 'known-variants') {
					var info = {};
					info.variantCard = vc;
					if (vc) {
						info.relationship = vc.getRelationship();
						info.status = vc.isAffected() ? 'affected' : 'unaffected';
						info.label = vc.getRelationship();

						info.id = info.status + "-_-" + vc.getRelationship() + "-_-" + vc.getSampleName();

						window.affectedInfo.push(info);
					}
				}
			})
			var sibIdx = 0;
			for (var status in variantCardsSibs) {
				var sibs = variantCardsSibs[status];
				sibs.forEach(function(vc) {
					var info = {};
					info.relationship = vc.getRelationship();
					info.status = status;
					info.variantCard = vc;
					info.label = vc.getRelationship() + " " + vc.getSampleName();
					info.id = info.status + "-_-" + vc.getRelationship() + "-_-" + vc.getSampleName();

					window.affectedInfo.push(info);
				})
			}
		}

	}
	return window.affectedInfo;
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
		}
			promiseMarkCodingRegions(window.gene, window.selectedTranscript)
				.then(function() {
				geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
				getCodingRegions(window.selectedTranscript);
				});
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

function addKnownVariantsCard()  {

//  $('#known-variants-cards #variant-badges').removeClass("hide");
	$('#select-known-variants-filter-box').removeClass("hide");


	var variantCard = getVariantCard('known-variants');
	var clinvarUrl = genomeBuildHelper.getBuildResource(genomeBuildHelper.RESOURCE_CLINVAR_VCF_S3);
	variantCard.model.onVcfUrlEntered(clinvarUrl, null, function() {
		variantCard.promiseLoadAndShowVariants(true);
	});

	hideKnownVariantsCard = false;

}


function clearKnownVariantsCard() {
	$('#known-variants-cards #vcf-track').addClass("hide");
	$('#known-variants-cards #variant-badges').addClass("hide");
	$('#select-known-variants-filter-box').addClass("hide");

	hideKnownVariantsCard = true;
}


function promiseJointCallVariants(checkCache=false) {
	return new Promise(function(resolve, reject) {
		jointCallVariants(checkCache, function() {
			resolve();
		})
	})
}

function jointCallVariants(checkCache=false, callback=null) {
	var me = this;

	var runIt = function(checkCache, callback) {
		if (fbSettings.visited) {
			me.jointCallVariantsImpl(checkCache, callback);
		} else {
			showFreebayesSettingsDialog(function() {
				me.jointCallVariantsImpl(checkCache, callback);
			})
		}

	}

	var attemptCount = 0;
	var waitForGene = function() {
		if (attemptCount > 5) {
			alertify.alert("Unable to call variants because a gene has not been selected");
			return;
		}
		setTimeout(function() {
			if (window.gene) {
				runIt(checkCache, callback);
			} else {
				attemptCount++;
				waitForGene();
			}
		}, 1000);

	}
	if (window.gene == null) {
		waitForGene();
	} else {
		runIt(checkCache, callback);
	}
}


function jointCallVariantsImpl(checkCache, callback) {

	cacheHelper.showCallAllProgress = true;

	var sampleIndex = 0;
	var jointVcfRecs = null;
	var translatedRefName = null;
	var cards = getRelevantVariantCards();

	genesCard.showGeneBadgeLoading(window.gene.gene_name);

	var showCallingProgress = function() {
		genesCard.showGeneBadgeLoading(window.gene.gene_name);
		getRelevantVariantCards().forEach(function(vc) {
			vc.showCallVariantsProgress('starting');
		});
	}

	var parseNextCalledVariants = function(afterParseCallback) {
		if (sampleIndex >= getRelevantVariantCards().length) {
			if (afterParseCallback) {
				afterParseCallback();
			}
			return;
		}
		var vc = getRelevantVariantCards()[sampleIndex];
		var sampleNamesToGenotype = vc.getSampleNamesToGenotype();
		vc.model.vcf.promiseParseVcfRecordsForASample(jointVcfRecs, translatedRefName, window.gene, window.selectedTranscript, matrixCard.clinvarMap, true, (sampleNamesToGenotype ? sampleNamesToGenotype.join(",") : null), sampleIndex, global_vepAF)
		 .then(function(data) {
					var theFbData = data[1];
					vc.model.promiseGetVcfData(window.gene, window.selectedTranscript)
					 .then(function(data) {
						var theVcfData = data.vcfData;

						var promise = null;
						if (data.model.isAlignmentsOnly() && theVcfData == null) {
							promise = data.model.promiseCacheDummyVcfDataAlignmentsOnly(theFbData, window.gene, window.selectedTranscript)
							 .then(function(data) {
							 		theVcfData = data;
							 		resolve();
							 })
						} else {
							promise = new Promise(function(resolve, reject) {
								if (theVcfData.loadState == null) {
									theVcfData.loadState = {};
								}
								theVcfData.loadState['called'] = true;
								theVcfData.loadState['clinvar'] = true;
								resolve();
							})
						}


						// Get the unique freebayes variants and set up the allele counts
						promise.then(function() {
							data.model.processFreebayesVariants(theFbData, theVcfData, function() {
							data.model.fbData = theFbData;
							data.model.vcfData = theVcfData;
							sampleIndex++;
							parseNextCalledVariants(afterParseCallback);
							});
						},
						function(error) {
							var msg = "A problem occurred in jointCallVariantsImpl(): " + error;
							console.log(msg);
							parseNextCalledVariants(afterParseCallback);
						});

					 })


		 });
	}

	var processFbTrio = function(callback) {
		fulfilledTrioPromise = false;
		promiseDetermineInheritance(promiseFullTrioCalledVariants).then( function() {

			window.hideCircleRelatedVariants();


			getRelevantVariantCards().forEach( function(vc) {

				// Reflect me new info in the freebayes variants.
				vc.model.loadCalledTrioGenotypes();

				// Show the counts
				vc.showCallVariantsProgress('counting');
				vc.showCallVariantsProgress('done');

				vc.promiseLoadAndShowVariants(false);

			});

			getProbandVariantCard().fillFeatureMatrix(regionStart, regionEnd);

			// Cache the updated the danger summary now that called variants are merged into
			// variant set
			cacheHelper.processCachedTrio(window.gene, window.selectedTranscript, true, false, function() {
				cacheHelper.showAnalyzeAllProgress();

				if (callback) {
					callback();
				}

			});





		});
	}

	promiseHasCachedCalledVariants(window.gene, window.selectedTranscript)
	 .then(function(hasCalledVariants) {

		if (checkCache && hasCalledVariants) {
			showCallingProgress();
			var promises = [];

			getRelevantVariantCards().forEach(function(vc) {
				var p = new Promise(function(resolve, reject) {

					var theFbData;
					var theVcfData;
					var theModel;


					vc.model.promiseGetFbData(window.gene, window.selectedTranscript)
					 .then(function(data) {
						theFbData = data.fbData;
						theModel = data.model;
						return the.promiseGetVcfData(window.gene, window.selectedTranscript);
					 })
					 .then(function(data) {
						theVcfData = data.vcfData;
						if (theVcfData == null) {
							theVcfData = {features: []};
						}

						// When only alignments provided, only the called variants were cached as "fbData".
						// So initialize the vcfData to 0 features.
						var promise = null;
						if (theFbData && theFbData.features.length > 0 && theVcfData.features.length == 0) {
							promise = theModel.promiseCacheDummyVcfDataAlignmentsOnly(theFbData, window.gene, window.selectedTranscript);
						} else {
							promise = new Promise(function(resolve, reject) {
								resolve();
							})
						}

						promise.then(function() {
							theModel.vcfData = theVcfData;
							theModel.fbData  = theFbData;

							resolve();

						})

					 },
					 function(error) {
						var msg = "A problem occurred in jointCallVariantsImpl(): " + error;
						console.log(msg);
						reject(msg);
					 })
				});
				promises.push(p);
			})
			Promise.all(promises).then(function() {
				processFbTrio(callback);
			})


		} else {
			var bams = [];
			getRelevantVariantCards().forEach(function(vc) {
				if (vc.getRelationship() != 'known-variants') {
					vc.clearCalledVariants();
					bams.push(vc.model.bam);
				}
			});

			showCallingProgress();

			getProbandVariantCard().model.bam.freebayesJointCall(
				window.gene,
				window.selectedTranscript,
				bams,
				window.geneSource == 'refseq' ? true : false,
				fbSettings.arguments,
				global_vepAF, // vep af
				function(theData, trRefName) {

					translatedRefName = trRefName;
					jointVcfRecs =  theData.split("\n");

					parseNextCalledVariants(function() {

						processFbTrio(callback);

					});
				}
			);

		}
	 })


}



function cacheJointCallVariants(geneObject, transcript, sourceVariant, callback) {


	var bams = [];
	var cards = getRelevantVariantCards();
	cards.forEach(function(vc) {
		if (vc.getRelationship() != 'known-variants') {
			bams.push(vc.model.bam);
		}
	});


	var sampleIndex = 0;
	var jointVcfRecs = null;
	var translatedRefName = null;

	var parseNextCalledVariants = function(theGeneObject, theTranscript, afterParseCallback) {
		if (sampleIndex >= cards.length) {
			if (afterParseCallback) {
				afterParseCallback(theGeneObject, theTranscript);
			}
			return;
		}
		var vc = cards[sampleIndex];
		var sampleNamesToGenotype = vc.getSampleNamesToGenotype();
		vc.model.vcf.promiseParseVcfRecordsForASample(jointVcfRecs, translatedRefName, theGeneObject, theTranscript, matrixCard.clinvarMap, true, (sampleNamesToGenotype ? sampleNamesToGenotype.join(",") : null), sampleIndex, global_vepAF)
									.then(function(data) {
										var theFbData = data[1];

										if (theFbData.loadState == null) {
											theFbData.loadState = {};
										}
										theFbData.loadState['called'] = true;
										theFbData.loadState['clinvar'] = true;

										theFbData.features.forEach(function(variant) {
											variant.fbCalled = "Y";
											variant.extraAnnot = true;
										})

								// Pileup the variants
								var pileupObject = vc.model._pileupVariants(theFbData.features, theGeneObject.start, theGeneObject.end);
						theFbData.maxLevel = pileupObject.maxLevel + 1;
						theFbData.featureWidth = pileupObject.featureWidth;

						vc.model._promiseCacheData(theFbData, "fbData", theGeneObject.gene_name, theTranscript)
						 .then(function() {
							// When only alignments provided, only the called variants were cached as "fbData".
							// So initialize the vcfData to 0 features.
							var promise = null;
							if (vc.model.isAlignmentsOnly()) {
								promise = vc.model.cacheDummyVcfDataAlignmentsOnly(theFbData, theGeneObject, theTranscript);
							} else {
								promise = new Promise(function(resolve, reject) {
									resolve();
								});
							}

							promise.then(function() {
								sampleIndex++;
								parseNextCalledVariants(theGeneObject, theTranscript, afterParseCallback);
							})

						 })
						});
	}

	var trioFbData = {};
	var trioModel = null;
	var parseNextExportVariant = function(theGeneObject, theTranscript, afterParseCallback) {
		if (sampleIndex >= cards.length) {
			if (afterParseCallback) {
				afterParseCallback(theGeneObject, theTranscript, trioFbData);
			}
			return;
		}
		var vc = cards[sampleIndex];
		var sampleNamesToGenotype = vc.getSampleNamesToGenotype();
		vc.model.vcf.promiseParseVcfRecordsForASample(jointVcfRecs, translatedRefName, theGeneObject, theTranscript, matrixCard.clinvarMap, true, (sampleNamesToGenotype ? sampleNamesToGenotype.join(",") : null), sampleIndex, global_vepAF)
									.then(function(data) {
										var theFbData = data[1];

										theFbData.features.forEach(function(variant) {
											variant.fbCalled = "Y";
										})

										var relationship = cards[sampleIndex].getRelationship();
										trioFbData[relationship] = theFbData;

						sampleIndex++;
						parseNextExportVariant(theGeneObject, theTranscript, afterParseCallback);
						});
	}
	getProbandVariantCard().model.bam.freebayesJointCall(
		geneObject,
		transcript,
		bams,
		window.geneSource == 'refseq' ? true : false,
		fbSettings.arguments,
		global_vepAF,    // vep af
		function(theData, trRefName, theGeneObject, theTranscript) {

			translatedRefName = trRefName;
			jointVcfRecs =  theData.split("\n");

			if (sourceVariant) {
				parseNextExportVariant(theGeneObject, theTranscript, function(theGeneObject1, theTranscript1, trioFbData) {
					if (callback) {
						trioModel = new VariantTrioModel(trioFbData.proband, trioFbData.mother, trioFbData.father);
						trioModel.compareVariantsToMotherFather(function() {
							var found = false;
							trioModel.probandVcfData.features.forEach(function(variant) {
								if (!found &&
									variant.chrom == sourceVariant.chrom &&
									variant.start == sourceVariant.start &&
									variant.ref == sourceVariant.ref &&
									variant.alt == variant.alt) {

									sourceVariant = variant;
									found = true;
								}
							});
							callback(theGeneObject1, theTranscript1, jointVcfRecs, translatedRefName, sourceVariant);
						});
					}
				});
			} else {
				parseNextCalledVariants(theGeneObject, theTranscript, function(theGeneObject1, theTranscript1) {
					if (callback) {
						callback(theGeneObject1, theTranscript1, jointVcfRecs, translatedRefName, null);
					}
				});
			}
		}
	);

}


function promiseGetCachedGeneCoverage(geneObject, transcript, showProgress = false) {

	return new Promise(function(resolve, reject) {
		var geneCoverageAll = {gene: geneObject, transcript: transcript, geneCoverage: {}};

		var promises = [];
		getRelevantVariantCards().forEach(function(vc) {
			if (vc.isBamLoaded()) {
				if (showProgress) {
					vc.showBamProgress("Analyzing coverage in coding regions");
				}
				var promise = vc.model.promiseGetGeneCoverage(geneObject, transcript)
				 .then(function(data) {
					var gc = data.geneCoverage;
					geneCoverageAll.geneCoverage[data.model.getRelationship()] = gc;
					if (showProgress) {
						getVariantCard(data.model.getRelationship()).endBamProgress();
					}
				 },
				 function(error) {
					reject(error);
				 })
				promises.push(promise);
			}

		})
		Promise.all(promises).then(function() {
			resolve(geneCoverageAll);
		})
	})

}




function shouldAutocall(callback) {
	if (isAlignmentsOnly() && autocall == null) {
		var message = "Would you like to auto-call variants from alignments when gene is selected?";
		alertify.confirm(message,
									function(){
								// OK pressed
								autocall = true;
								if (callback) {
									callback();
								}
							},
							function(){
								// Cancel pressed
								autocall = false;
								if (callback) {
									callback();
								}
							}).set('labels', {ok:'OK', cancel:'No, just show the coverage'});
	} else {
		if (callback) {
			callback();
		}
	}

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

			variantCard.model                = new VariantModel();


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

		var postInheritanceProcessing = function(theVcfData, probandVariantCard) {

			probandVariantCard.populateEffectFilters();

			probandVariantCard.promiseDetermineMaxAlleleCount()
			 .then(function() {
				// Enable inheritance filters
				filterCard.enableInheritanceFilters(theVcfData);


				$('#filter-and-rank-card').removeClass("hide");
				$('#matrix-track').removeClass("hide");

				$("#matrix-panel .loader").removeClass("hide");
				$("#matrix-panel .loader .loader-label").text("Reviewing affected and unaffected siblings");
				$("#feature-matrix-note").addClass("hide");

				getProbandVariantCard().model.postInheritanceParsing(theVcfData, window.gene, window.selectedTranscript, getAffectedInfo(), function() {
					$("#matrix-panel .loader").addClass("hide");
						$("#matrix-panel .loader .loader-label").text("Ranking variants");
					$("#feature-matrix-note").removeClass("hide");

					genesCard.refreshCurrentGeneBadge(null, null, function() {
						cacheHelper.showAnalyzeAllProgress();
					});

					resolve();

				});

			 })


		}

		thePromise().then( function(probandVariantCard) {
			if (!fulfilledTrioPromise) {
				fulfilledTrioPromise = true;

				var trioVcfData = {proband: null, mother: null, father: null};
				var trioFbData  = {proband: null, mother: null, father: null};

				var thePromises = [];
				getRelevantVariantCards().forEach(function(vc) {
					var p = new Promise(function(resolve, reject) {
						var theFbData = null;
						var theVcfData = null;
						var theModel = null;

						vc.model.promiseGetFbData(window.gene, window.selectedTranscript)
							 .then(function(data) {
							theFbData = data.fbData;
							theModel = data.model;
							return theModel.promiseGetVcfData(window.gene, window.selectedTranscript);
						 })
						 .then(function(data) {
							theVcfData = data.vcfData;
							if (theVcfData == null) {
								theVcfData = {features: []};
							}

							if (theFbData && theFbData.features.length > 0) {
								theVcfData = theModel.addCalledVariantsToVcfData(theVcfData, theFbData);
							}

							trioVcfData[theModel.getRelationship()] = theVcfData;
							trioFbData[theModel.getRelationship()] = theFbData;
							data.model.vcfData = theVcfData;
							data.model.fbData  = theFbData;

							resolve();
						 },
						 function(error) {
							var msg = "A problem occurred in promiseDetermineInheritance(): " + error;
							console.log(msg);
							reject(msg);
						 });

					 })

					thePromises.push(p);
				})

				Promise.all(thePromises).then(function() {
					if (dataCard.mode == 'trio' && (trioVcfData.proband == null || trioVcfData.mother == null || trioVcfData.father == null)) {
						genesCard.clearGeneGlyphs(window.gene.gene_name);
						genesCard.setGeneBadgeError(window.gene.gene_name);
						reject("Unable to determine inheritance for gene " + window.gene.gene_name + " because full trio data for gene is not available");
					} else if (dataCard.mode == 'trio') {



						$('#filter-and-rank-card').removeClass("hide");
						$('#matrix-track').removeClass("hide");

						$("#matrix-panel .loader").removeClass("hide");
						$("#matrix-panel .loader .loader-label").text("Determining inheritance mode");
						$("#feature-matrix-note").addClass("hide");

						// we need to compare the proband variants to mother and father variants to determine
						// the inheritance mode.  After this completes, we are ready to show the
						// feature matrix.
						// We only pass in the affected info if we need to sync up genotypes because samples
						// where in separate vcf files
						var affectedInfo = isAlignmentsOnly() || samplesInSingleVcf() ? null : getAffectedInfo();
						var trioModel = new VariantTrioModel(trioVcfData.proband, trioVcfData.mother, trioVcfData.father, null, affectedInfo);
						trioModel.compareVariantsToMotherFather(function() {
							getRelevantVariantCards().forEach(function(vc) {
								if (trioVcfData[vc.getRelationship()]) {
									vc.model.performAdditionalParsing(trioVcfData[vc.getRelationship()], window.selectedTranscript);
								}
							})
							postInheritanceProcessing(trioVcfData.proband, probandVariantCard);
						});

					} else {
						probandVariantCard.model.performAdditionalParsing(trioVcfData.proband, window.selectedTranscript);

						probandVariantCard.promiseDetermineMaxAlleleCount()
						 .then(function() {
							probandVariantCard.populateEffectFilters();

							//mat $("#matrix-panel .loader").addClass("hide");
							$("#feature-matrix-note").removeClass("hide");

							probandVariantCard.model._promiseCacheData(trioVcfData.proband, "vcfData", window.gene.gene_name, window.selectedTranscript)
							 .then(function() {
								genesCard.refreshCurrentGeneBadge(null, trioVcfData.proband, function() {
									resolve();
								});
							 },
							 function(error) {
								reject(error);
							 })



						 })

					}

				})

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
		var promises = [];
		variantCards.forEach(function(vc) {
			var p = vc.model.promiseGetVcfData(window.gene, window.selectedTranscript)
			 .then(function(data) {
				if (data.vcfData) {
					loaded[data.model.getRelationship()] = getVariantCard(data.model.getRelationship());
				}

			 })
			 promises.push(p);
		});

		Promise.all(promises).then(function() {

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
			} else if (isAlignmentsOnly()) {
				resolve(getProbandVariantCard());
			} else {
				reject();
			}

		})

	});

}

function promiseFullTrioCalledVariants() {
	return new Promise( function(resolve, reject) {
		var loaded = {};
		var promises = [];
		variantCards.forEach(function(vc) {
			if (vc.isLoaded()) {
				var promise = vc.promiseVariantsHaveBeenCalled()
				 .then(function(variantsHaveBeenCalled) {
					if (variantsHaveBeenCalled) {
						loaded[vc.getRelationship()] = vc;
					}
				 })
				 promises.push(promise);
			}
		});
		Promise.all(promises).then(function() {
			if (dataCard.mode == 'trio' && loaded.proband != null
					&& loaded.mother  != null && loaded.father != null) {
				resolve(loaded.proband);
			} else if (dataCard.mode == 'single' && loaded.proband != null) {
				resolve(loaded.proband);
			} else {
				reject();
			}

		})

	});

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
			if (window.gene) {
				$('#gene-name-data-dialog-box').removeClass("attention");
				if (genomeBuildHelper.getCurrentBuild()) {
					$('#select-build-box').removeClass("attention");
					enable = true;
				} else {
					$('#select-build-box').addClass("attention");
				}
			} else {
				$('#gene-name-data-dialog-box').addClass("attention");
			}
		}
	} else if (dataCard.mode == 'trio') {
		if (cards['proband'].isReadyToLoad() && cards['mother'].isReadyToLoad() && cards['father'].isReadyToLoad()) {
			if (window.gene) {
				$('#gene-name-data-dialog-box').removeClass("attention");
				if (genomeBuildHelper.getCurrentBuild()) {
					$('#select-build-box').removeClass("attention");
					enable = true;
				} else {
					$('#select-build-box').addClass("attention");
				}
			} else {
				$('#gene-name-data-dialog-box').addClass("attention");
			}
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



function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
}

function percentage(a, showSign=true) {
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
	return round(pct, places) + (showSign ? "%" : "");
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
	if (variant.vepVariationIds) {
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
	filterCard.startFilterProgress();
	setTimeout(function() {
				filterVariantsImpl();
		}, 100);
}

function filterVariantsImpl() {

	clickedVariant = null;
	matrixCard.unpin();

	filterCard.displayFilterSummary();
	variantCards.forEach( function(variantCard) {
		if (variantCard.isViewable()) {

			variantCard.unpin();
			if (window.gene) {
				variantCard.promiseFilterAndShowLoadedVariants()
				 .then(function() {
						variantCard.promiseFilterAndShowCalledVariants();
						if (variantCard.getRelationship() == 'proband') {
							variantCard.fillFeatureMatrix(regionStart, regionEnd);
						}
				 })

				}
		}

	});
	filterCard.filterGenes(function() {
		filterCard.endFilterProgress();
	});

}


function bookmarkVariant() {
	if (clickedVariant) {
		this.bookmarkCard.bookmarkVariant(clickedVariant);
		unpinAll();
	}
}

function removeBookmarkOnVariant() {
	if (clickedVariant) {
		var bookmarkKey = bookmarkCard.getBookmarkKey(gene.gene_name, window.selectedTranscript.transcript_id, gene.chr, clickedVariant.start, clickedVariant.ref, clickedVariant.alt);
		bookmarkCard.removeBookmark(bookmarkKey, clickedVariant);
	}
}

function hideIntro() {
	if (isMygene2 && !keepShowingIntro) {
		// If we are showing info on a gene and the intro panel still shows the full
		// intro text, hide it.
		if ($('#intro-text.hide').length == 0 && readyToHideIntro) {
			toggleIntro();
		}
		readyToHideIntro = true;
	}
}

function toggleIntro() {
	if ($('#intro-text.hide').length == 1) {
		$('#intro-text').removeClass("hide");
		$('#intro-link').addClass("hide");
	} else {
		$('#intro-text').addClass("hide");
		$('#intro-link').removeClass("hide");
	}
	readjustCards();

}

toggleKnownVariantsChart = function(chartType, refresh=false, button) {

	if (chartType == 'bar') {
		knownVariantsChart = knownVariantsBarChart;
		knownVariantsChart.xStart(null);
		knownVariantsChart.xEnd(null);
		knownVariantsChart.barWidth(KNOWN_VARIANTS_BAR_WIDTH[chartType]);

	} else if (chartType == 'exon-bar') {
		knownVariantsChart = knownVariantsBarChart;
		knownVariantsChart.xStart(window.gene.start);
		knownVariantsChart.xEnd(window.gene.end);
		knownVariantsChart.barWidth(KNOWN_VARIANTS_BAR_WIDTH[chartType]);

		// If previous chart has detailed histogram data, just recalculate bins
		if (knownVariantsChartType == 'bar' || knownVariantsChartType == 'area') {
			var selection = d3.select('#known-variants-chart');
			var binLength = Math.floor( ((+window.gene.end - +window.gene.start) / $('#transcript-panel #gene-viz').innerWidth()) * KNOWN_VARIANTS_BIN_SPAN[knownVariantsChartType]);
			var exonBins = getProbandVariantCard().model.binKnownVariantsByExons(window.gene, window.selectedTranscript, binLength, selection.datum());
			selection.datum(exonBins);
		}

	} else if (chartType == 'area') {
		knownVariantsChart = knownVariantsAreaChart;
	}


	if (refresh) {
		d3.select("#known-variants-chart svg").remove();
		if (button) {
			$('#known-variants-nav-chart-type .chart-type.selected').removeClass('selected');
			$(button).addClass('selected');
		}

		// No need to obtain counts for gene since prior data is interchangable between
		// area and barchart
		if ((knownVariantsChartType == 'bar' || knownVariantsChartType == 'area') &&
			(chartType == 'bar' || chartType == 'area')) {
			knownVariantsChartType = chartType;
			var selection = d3.select('#known-variants-chart');
			knownVariantsChart(selection, {transition: {'pushUp': true }} );
		} else {

			knownVariantsChartType = chartType;
			showKnownVariantsCounts();
		}

	}

}

showKnownVariantsHistoChart = function(show=true) {
	if (show) {
		hideKnownVariants = false;
		$('#known-variants-chart').removeClass("hide");
		$('#known-variants-nav-chart-type').removeClass("hide");
		$('#known-variants-cards #variant-badges').addClass("hide");
	} else {
		hideKnownVariants = true;
		$('#known-variants-chart').addClass("hide");
		$('#known-variants-nav-chart-type').addClass("hide");
		$('#known-variants-cards #variant-badges').removeClass("hide");
	}
}


showKnownVariantsCounts = function() {

	var vc = getVariantCard('known-variants');

	d3.select('#known-variants-chart svg').remove();
	if (hideKnownVariants) {
		return;
	}
	// This determines if the exon bar will span the width of the exon.
	var featureBarWidth = true;

	var theTranscript = null;
	var binLength = null;

	theTranscript =  $.extend({}, window.selectedTranscript);
	theTranscript.features = window.selectedTranscript.features.filter(function(d) {
			var inRegion = (d.start >= regionStart && d.start <= regionEnd)
												 || (d.end >= regionStart && d.end <= regionEnd) ;
					return inRegion;

	});
	vc.fillZoomRegionChart(theTranscript, regionStart, regionEnd);

	if (knownVariantsChartType != 'exon-bar') {
		theTranscript = null;
		binLength = Math.floor( ((+regionEnd - +regionStart) / $('#transcript-panel #gene-viz').innerWidth()) * KNOWN_VARIANTS_BIN_SPAN[knownVariantsChartType]);
	}

	if (knownVariantsChartType == 'exon-bar' || knownVariantsChartType == 'bar') {
		knownVariantsChart.xStart(regionStart);
		knownVariantsChart.xEnd(regionEnd);
	}


	$('#known-variants-nav-chart-type .loader').removeClass('hide');
	d3.select('#known-variants-chart svg').remove();
	getProbandVariantCard().model.promiseGetKnownVariants(window.gene, theTranscript, binLength).then(function(results) {

		results = results.filter(function(binObject) {
			return binObject.start >= regionStart && binObject.end <= regionEnd;
		})
		vc.cardSelector.removeClass("hide");
		$('#known-variants-chart').removeClass("hide");
		var selection = d3.select('#known-variants-chart').datum(results);


		knownVariantsChart(selection, {transition: {'pushUp': true}, 'featureBarWidth' : featureBarWidth} );
			$('#known-variants-nav-chart-type .loader').addClass('hide');

	})


}

showKnownVariantsTooltip = function(knownVariants) {
	var tooltipRow = function(valueObject) {
		var fieldName = Object.keys(valueObject)[0];
		var row = '<div>';
		row += '<span style="padding-left:10px;width:70px;display:inline-block">' + fieldName   + '</span>';
		row += '<span style="width:40px;display:inline-block">' + valueObject[fieldName] + '</span>';
		row += "</div>";
		return row;
	}
		var html = 'ClinVar variants: ';
		for (var i = knownVariants.values.length - 1; i >= 0; i--) {
		html += tooltipRow(knownVariants.values[i])
		}

		return html;
}



function switchGenotype(gt) {
	if (gt != null && gt.length == 3) {
		return gt[2] +  gt[0];
	} else {
		return gt;
	}

}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function showStackTrace(e) {
	var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
			.replace(/^\s+at\s+/gm, '')
			.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
			.split('\n');
	console.log(stack);
}

function getHumanRefNames(refName) {
		if (refName.indexOf("chr") == 0) {
			return "chr1 chr2 chr3 chr4 chr5 chr6 chr7 chr8 chr9 chr10 chr11 chr12 chr13 chr14 chr15 chr16 chr17 chr18 chr20 chr21 chr22 chrX chrY";
		} else {
			return "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 X Y";
		}
}

function formatCurrentDateTime(delim) {
	var theDelim = delim ? delim : '-';
	var theTimeDelim = delim ? delim : ':';
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!

	var yyyy = today.getFullYear();
	if(dd<10){
			dd='0'+dd
	}
	if(mm<10){
			mm='0'+mm
	}


	var hours = today.getHours();
	var minutes = today.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var theTime = hours + theTimeDelim + minutes + ampm;

	var today = mm + theDelim + dd + theDelim + yyyy + theDelim + theTime;
	return today;
}

function stripTranscriptPrefix(transcriptId) {
	if (transcriptId == null) {
		console.log("null transcript id")
		return "";
	}
	var nameTokens = transcriptId.split('.');
	return nameTokens.length > 0 ? nameTokens[0] : transcriptId;
}

function uniq(theArray) {
	 return Array.from(new Set(theArray));
}

function showFeedback() {

	$('#feedback-note').val("");

	if (feedbackAttachScreenCapture) {
		$('#feedback-screen-capture-area').removeClass("hide");
		$('#feedback-screen-capture').empty();
		$('#feedback-screen-capture').append(  "<div id='feedback-container' class='"       + "'></div>"  );

		$('#feedback-screen-capture #feedback-container').append(  $('#nav-section').html() );
		$('#feedback-screen-capture #feedback-container').append(  $('#track-section').html() );
		$('#feedback-screen-capture #feedback-container').append(  $('#proband-variant-card').html() );
		$('#feedback-screen-capture #feedback-container').append(  $('#other-variant-cards').html() );

		if (!$('#slider-left').hasClass('hide')) {
			$('#feedback-screen-capture').append(  "<div style='width:5px'></div>"  );
			$('#feedback-screen-capture').append(  "<div id='slider-left-content' class='"     + $('#slider-left-content').attr("class") + "'>"       + $('#slider-left-content').html()     + "</div");
		}
		$('#feedback-screen-capture').append(  $('#svg-glyphs-placeholder').html() );

		// Take out identifiers
		$('#feedback-screen-capture #variant-card-label').text("");


	} else {
		$('#feedback-screen-capture-area').addClass("hide");
	}
}

function emailFeedback() {

	// Change newlines to html breaks
	$.valHooks.textarea = {
			get: function(elem) {
					return elem.value.replace(/\r?\n/g, "<br>");
			}
	};

	var name = $('#feedback-name').val();
	var email = $('#feedback-email').val();
	var note  = $('#feedback-note').val();

	if (email == null || email.trim().length == 0) {
		$('#feedback-warning').text("Please specify an email");
		$('#feedback-warning').removeClass("hide");
		return;
	} else if (note == null || note.trim().length == 0) {
		$('#feedback-warning').text("Please fill in the description");
		$('#feedback-warning').removeClass("hide");
		return;
	} else {
		$('#feedback-warning').addClass("hide");
	}

	var htmlAttachment = null;

	if (feedbackAttachScreenCapture) {
		htmlAttachment    = '<html>';

		htmlAttachment    += '<head>';
			htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/bootstrap-material-design.css" type="text/css">';
			htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/bootstrap.css" type="text/css">';
			htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/gene.d3.css" type="text/css">';
			htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/google-fonts.css" type="text/css">';
			htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/material-icons.css" type="text/css">';
			htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/selectize.css" type="text/css">';
			htmlAttachment    += '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
			htmlAttachment    += '<link rel="stylesheet" href="http://localhost/gene.iobio/assets/css/site.css" type="text/css">';
			htmlAttachment    += '</head>';

		htmlAttachment    += "<body style='margin-bottom:0px'>";


		$('#feedback-screen-capture .pagination.bootpag .prev a').text("<<");
		$('#feedback-screen-capture .pagination.bootpag .next a').text(">>");
		$('#feedback-screen-capture #container').attr("width", "initial");

		htmlAttachment    += '<div id="feedback-screen-capture">';
		htmlAttachment    += $('#feedback-screen-capture').html();
		htmlAttachment    += '</div>'
		htmlAttachment    += '</body>'

		htmlAttachment    += '</html>';
	}

	sendFeedbackEmail(name, email, note, htmlAttachment);
	sendFeedbackReceivedEmail(email);

	if (feedbackAttachScreenCapture) {
		$('#feedback-screen-capture').empty();
	}

	$('#feedback-modal').modal('hide');
}

/*
*
*  Stream the app snapshot (html) to the emailServer which
*  will email a description of the problem along with an html file attachment
*  that is the snapshop of vcfiobio.
*/
function sendFeedbackEmail(name, email, note, htmlAttachment) {
	var client = BinaryClient(emailServer);

	// Strip of the #modal-report-problem from the URL
	var appURL = "";
	if (feedbackShowURL) {
		appURL = location.href;
		if (appURL.indexOf("#feedback-modal") > -1){
				appURL = appURL.substr(0, appURL.indexOf("#feedback-modal"));
		}
	}

	// Format the body of the email
	var htmlBody = '<span style="padding-right: 4px">Reported by:</span>' + name  + "<br><br>";
	htmlBody    += '<span style="padding-right: 4px">Email:</span>' + email  + "<br><br>";
	if (feedbackShowURL) {
		htmlBody +=  '<span style="padding-right: 51px">gene.iobio URL:</span>' + appURL + "<br><br>";
	}
	htmlBody += note + '<br><br>';

	var emailObject = {
			'from':     email,
			'to':       feedbackEmails,
			'subject':  'Feedback on gene.iobio',
			'body':     htmlBody
	 };
	 if (feedbackAttachScreenCapture && htmlAttachment) {
		emailObject.filename = 'gene.iobio.screencapture.' + formatCurrentDateTime('.') + '.html';
	 } else {
		emailObject.filename = '';
	 }

	client.on('open', function(stream){
		var stream = client.createStream(emailObject);
		if (feedbackAttachScreenCapture && htmlAttachment) {
			stream.write(htmlAttachment);
		}
		stream.end();
	});
}


function sendFeedbackReceivedEmail(email) {
	var client = BinaryClient(emailServer);

	// Format the body of the email
	var htmlBody = 'Thank you for your feedback on gene.iobio.  We will review your email as soon as possible.';
	htmlBody     += '<br><br>';
		htmlBody     += 'Best regards,<br>';
		htmlBody     += 'The IOBIO team';

	var emailObject = {
			'from':     feedbackEmails,
			'to':       email,
			'subject':  'gene.iobio feedback received',
			'body':     htmlBody
	 };

	client.on('open', function(stream){
		var stream = client.createStream(emailObject);
		stream.end();
	});
}

function changeSiteStylesheet(cssHref) {

		var oldlink = $("#site-stylesheet")[0];

		var newlink = document.createElement("link");
		newlink.setAttribute("rel",  "stylesheet");
		newlink.setAttribute("id",   "site-stylesheet");
		newlink.setAttribute("type", "text/css");
		newlink.setAttribute("href", cssHref);

		document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
}

function createDownloadLink(anchorSelector, str, fileName) {

	if(window.navigator.msSaveOrOpenBlob) {
		var fileData = [str];
		blobObject = new Blob(fileData);
		$(anchorSelector).click(function(){
			window.navigator.msSaveOrOpenBlob(blobObject, fileName);
		});
	} else {
		var url = "data:text/plain;charset=utf-8," + encodeURIComponent(str);
		$(anchorSelector).attr("download", fileName);
		$(anchorSelector).attr("href", url);
	}
	$(anchorSelector).animateIt('tada', 'animate-twice');
}

function goToHome() {
		var homeUrl = window.location.protocol + "\/\/" + window.location.hostname + window.location.pathname;
		window.location.assign(homeUrl);
}



/*
 *
 * Upload proband vcf file and run script to generate variant bookmarks for rare high-impat variants.
 *
 */
findRareVariants = function() {

	var closeDialog = function() {
		$('#find-rare-variants-modal').modal('hide');
	}

	var formData = new FormData();
	if (getProbandVariantCard().model.vcfUrlEntered) {
		formData.append("vcf-url", getProbandVariantCard().model.vcf.getVcfURL());
	} else {
		formData.append('vcf', getProbandVariantCard().model.vcf.getVcfFile());
			formData.append('tabix', getProbandVariantCard().model.vcf.getTabixFile());
	}
		formData.append('sample-name', getProbandVariantCard().getSampleName());
		formData.append('email-to', $('#email-to').val())

		var xhr = new XMLHttpRequest();
		xhr.open('POST', findRareVariantsServer, true);
	xhr.onload = function(e) {
			if (this.status == 200) {
				var theResponse = {};
					var tokens = this.response.split("\n");
					tokens.forEach(function(token) {
						var tag   = token.split(":")[0];
						var value = token.split(":")[1];
						theResponse[tag] = value;
					})
					if (theResponse.status && theResponse.status == 'success') {
						closeDialog();
						alertify.alert(theResponse.message);
					} else {
						alertify.alert(theResponse.message);
					}
			} else {
				alertify.alert("Error code " + this.status + " returned from server.");
			}
		};
	xhr.onprogress = function (e) {
			//if (e.lengthComputable) {
			//    console.log(e.loaded+  " / " + e.total)
			//}
	}
	xhr.onloadstart = function (e) {
	}
	xhr.onloadend = function (e) {
	}
		xhr.send(formData);  // multipart/form-data
}

function decodeUrl(url) {
	if (url && (url.slice(0,14) == 'https%3A%2F%2F' || url.slice(0,13) == 'http%3A%2F%2F'))
		return decodeURIComponent(url)
	else
		return url;
}


function formatDate(d) {
	var padMinutes = function(n) {
			return String("00" + n).slice(-2);
	}
	var formatHours = function(h) {
		if (+h > 12) {
			return +h - 12;
		} else {
			return h;
		}
	}
	var getAmPm = function(h) {
		if (+h > 12) {
			return 'pm';
		} else {
			return 'am';
		}
	}
	return d.getMonth() + "-" + d.getDay() + "-" + d.getFullYear() + " " + formatHours(d.getHours()) + ":" + padMinutes(d.getMinutes()) + " " + getAmPm(d.getHours());
}

