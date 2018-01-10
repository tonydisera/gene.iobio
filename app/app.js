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

var siteConfig = {};

var clinvarGenes = {};

var util = new Util();
var templateUtil = new TemplateUtil();


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
var maxAlleleCount = 0;


// Endpoint commands (encapsulate API to IOBIO services)
var endpoint = null;


// bookmark card
var bookmarkCard = new BookmarkCard();

// data card
var dataCard = new DataCard();

// filter card
var filterCard = new FilterCard();

// genes card
var geneCard = new GeneCard();

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


  alertify.defaults.glossary.title = "";
  alertify.defaults.theme.ok = 'btn btn-default btn-raised';
  alertify.defaults.theme.cancel = 'btn btn-default btn-raised';

  determineStyle();

  if (util.detectIE() != false) {
    alert("Warning. Gene.iobio has been tested and verified on Chrome, Firefox, and Safari browsers.  Please run gene.iobio from one of these browsers.");
    alertify.alert("Warning. Gene.iobio has not been tested and verified on Internet Explorer.  Use the Google Chrome browser for the best performance of gene.iobio.");
  } else if (!util.isChrome()) {
    alertify.alert("Use the Google Chrome browser for the best performance of gene.iobio.");
  }

  initHub();

  // Initialize material bootstrap
  $.material.init();

  addCloseListeners();

  detectWindowResize();

    // Load handlebar templates
  templateUtil.promiseLoadTemplates(welcomePanel)
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
    return cacheHelper.promiseClearStaleCache();
   })
   .then(function() {
    // Instantiate helper class than encapsulates IOBIO commands
    endpoint = new EndpointCmd(useSSL, IOBIO, cacheHelper.launchTimestamp, genomeBuildHelper, util.getHumanRefNames)

    return cacheHelper.promiseCheckCacheSize();
   })
   .then(function() {
     return promiseLoadSiteConfig();
   })
   .then(function() {
     return promiseLoadClinvarGenes();
   })
   .then(function() {
      // Clear the local cache
      return cacheHelper.promiseClearCache();
   })
   .then(function() {
      showWelcomePanel();
      init();
   },
   function(error) {
      alertify.alert("Unable to initialize gene.iobio due to following error: " + error);
   })


});

$(window).load(function() {
  // Window is loaded.  Now we perform init().  We hold off
  // on doing this to delay longer running loading of genes.json.
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

function promiseLoadSiteConfig() {

  var p = new Promise(function(resolve, reject) {

    $.ajax({
        url: global_siteConfigUrl,
        type: "GET",
        crossDomain: true,
        dataType: "json",
        success: function( res ) {
          siteConfig = res;
          resolve();
        },
        error: function( xhr, status, errorThrown ) {
          console.log( "Error: " + errorThrown );
          console.log( "Status: " + status );
          console.log( xhr );
          reject("Error " + errorThrown + " occurred in promiseLoadSiteConfig() when attempting get siteConfig.json ");
        }
    });

  });

}

function promiseLoadClinvarGenes() {

  var p = new Promise(function(resolve, reject) {

    clinvarGenes = {};

    $.ajax({
        url: global_clinvarGenesUrl,
        type: "GET",
        crossDomain: true,
        dataType: "text",
        success: function( res ) {
          if (res && res.length > 0) {
            recs = res.split("\n");
            var firstTime = true;
            recs.forEach(function(rec) {
              if (firstTime) {
                // ignore col headers
                firstTime = false;
              } else {
                var fields = rec.split("\t");
                clinvarGenes[fields[0]] = +fields[1];
              }
            })

            resolve();
          } else {
            reject("Empty results returned from promiseLoadClinvarGenes");

          }

        },
        error: function( xhr, status, errorThrown ) {
          console.log( "Error: " + errorThrown );
          console.log( "Status: " + status );
          console.log( xhr );
          reject("Error " + errorThrown + " occurred in promiseLoadClinvarGenes() when attempting get clinvar gene counts ");
        }
    });

  });

}

// Get sample name, gene(?), build(?) from ajax call and then only call this for each file?
function appendHubFileNamesToURL(res) {
  res.data.forEach(function(file) {
    var {uri, name, type } = file;
    util.updateUrl(type+"0", uri);
    util.updateUrl("name0", name.split(".")[0]);
    util.updateUrl("sample0", name.split(".")[0]);
    util.updateUrl("genes","RAI1,AIRE,MYLK2,PDGFB,PDHA1");
    util.updateUrl("gene","RAI1");
    util.updateUrl("build","GRCh37");
  })
}


function determineStyle() {

  var mygene2Parm = util.getUrlParameter("mygene2");
  if ( mygene2Parm && mygene2Parm != "" ) {
    isMygene2   = mygene2Parm == "false" || mygene2Parm.toUpperCase() == "N" ? false : true;
  }
  var modeParm = util.getUrlParameter("mode");
  if (modeParm && modeParm != "") {
    isLevelBasic     = modeParm == "basic" ? true : false;
    isLevelEdu       = (modeParm == "edu" || modeParm == "edutour") ? true : false;
  }

  if (isLevelEdu) {
    util.changeSiteStylesheet("assets/css/site-edu.css");
  } else if (isMygene2 && isLevelBasic) {
    util.changeSiteStylesheet("assets/css/site-mygene2-basic.css");
  } else if (isMygene2) {
    util.changeSiteStylesheet("assets/css/site-mygene2-advanced.css");
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

  variantExporter = new VariantExporter();

  $("[data-toggle=tooltip]").tooltip();

  if (allowFreebayesSettings) {
    $('#show-fb-settings').removeClass("hide");
  }

  // If we are using the gene.iobio education tour edition, automatically load
  // exhibit.html. Only do this automatically if the tour parameter hasn't been provided.
  if (isLevelEdu && !util.getUrlParameter("tour")) {
    var exhibitUrl = window.location.protocol + "\/\/" + window.location.hostname + window.location.pathname + "exhibit.html";
    window.location.assign(exhibitUrl);
    return;
  }

  attachTemplates();

  // Set version number on About menu and the Version dialog
  $('.version-number').text(version);

  eduTourNumber = util.getUrlParameter("tour");
  if (eduTourNumber == null || eduTourNumber == "") {
    eduTourNumber = "0";
  }
  if (eduTourNumber && eduTourNumber != '') {
    $('#edu-tour-' + eduTourNumber).removeClass("hide");
  }


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



  // Initialize data card
  dataCard = new DataCard();
  dataCard.init();


  // Init known variants nav
  initKnownVariantsNav();


  // Initialize gene card
  geneCard.init();

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

}

function attachTemplates() {
  $('#gene-card-placeholder').html(templateUtil.geneCardTemplate());
  $('#genes-control-card-placeholder').html(templateUtil.genesControlCardTemplate());

  if (isMygene2) {
    $('#intro').append(templateUtil.introTemplate());
    if (isLevelBasic) {
      $('#intro-link').addClass("hide");
      $('#intro-text').removeClass("hide");
    }

  }

  if (!isLevelEdu) {
    $('body').prepend(templateUtil.navbarTemplate());
  }

  $('#modals-placeholder').append(templateUtil.modalsTemplate());
  $('#tour-placeholder').append(templateUtil.tourTemplate());
  $('#svg-glyphs-placeholder').append(templateUtil.svgGlyphsTemplate());

  $('#nav-edu-tour').append(templateUtil.eduTourTemplateHTML);

  // Slide out panels
  $(templateUtil.iconbarTemplate()).insertBefore("#slider-left");
  $('#slider-left-content').append(templateUtil.filterCardTemplateHTML);
  $('#slider-left-content').append(templateUtil.genesCardTemplateHTML);
  $('#slider-left-content').append(templateUtil.bookmarkTemplateHTML);
  $('#slider-left-content').append(templateUtil.recallTemplateHTML);
  $('#close-slide-left').click(function() {
    closeSlideLeft();
  });


  // Initialize the legend content
  $('#legend-track #legend-placeholder').html(templateUtil.legendTemplate());

  $('#matrix-card-placeholder').html(templateUtil.matrixCardTemplate());

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

  $('#known-variants-all-card').find("#known-variants-nav-area").append(templateUtil.knownVariantsNavTemplateHTML);

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

    $('#known-variants-cards').append(templateUtil.variantCardTemplate());
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
    $('#transcript-btn-group').removeClass("hide");
    $('#non-protein-coding #no-transcripts-badge').removeClass("hide");
    $('#non-protein-coding #no-transcripts-badge').text("Unable to analyze gene.  No transcripts found.");
    $('#gene-viz svg').remove();
    $('#transcript-menu svg').remove();
    $('#transcript-dropdown-button').html("&nbsp;");
      $('#gene-chr').text(window.gene.chr);
      $('#gene-name').text(window.gene.gene_name);
      $('#gene-region').text(util.addCommas(window.gene.start) + "-" + util.addCommas(window.gene.end));
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
  var top = +$('#gene-track').outerHeight();
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
    $('#close-slide-left').removeClass("hide");
    $('.sidebar-button').removeClass("closed");
    $('#slider-icon-bar').removeClass("closed");

    resizeCardWidths();

    $('#container').toggleClass('slide-left');
    $('#gene-track').css("left", "0px");

    var transitionEvent = whichTransitionEvent();
    $('.slide-left').one(transitionEvent, function(event) {
      $('#slider-left').trigger("open");
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
    $('#gene-track').css("width", "100%");
  } else {
    $('#gene-track').css("width", '');
  }

  $('#container').css('width', windowWidth - sliderWidth - (isLevelEdu || isLevelBasic ? 10 : 0));
  $('#matrix-panel').css('max-width', windowWidth - sliderWidth - (isLevelEdu  || isLevelBasic ? 0 : 20));
  $('#matrix-panel').css('min-width', windowWidth - sliderWidth - (isLevelEdu  || isLevelBasic ? 0 : 20));

  if (windowHeight < 700) {
    matrixCard.setCellSize('small');
  } else {
    matrixCard.setCellSize('large');
  }

  //$('#slider-left-content').css('height', window.innerHeight);
}

function closeSlideLeft() {

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
    $('#slider-left').trigger("close");
  });
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
        util.removeUrl("vcf1");
        util.removeUrl("bam1");
      } else if (variantCard.getRelationship() == 'father') {
        fatherCard = variantCard;
        fatherCard.clearVcf();
        fatherCard.clearBam();
        fatherCard.hide();
        $('#father-data').find('#vcf-file-info').val('');
        $('#father-data').find('#vcf-url-input').val('');
        util.removeUrl("vcf2");
        util.removeUrl("bam2");
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
  var species = util.getUrlParameter('species');
  if (species != null && species != "") {
    dataCard.setCurrentSpecies(species);
  }

  // Get the genome build
  var build = util.getUrlParameter('build');
  if (build != null && build != "") {
    dataCard.setCurrentBuild(build);
  }


  // Get the gene parameter
  var geneName = util.getUrlParameter('gene');
  if (geneName) {
    geneName = geneName.toUpperCase();
  }

  var theGeneSource = util.getUrlParameter("geneSource");
  if (theGeneSource != null && theGeneSource != "") {
    siteGeneSource = theGeneSource;
    switchGeneSource(theGeneSource.toLowerCase() == 'refseq' ? "RefSeq Transcript" : "Gencode Transcript");
  }

  var batchSize = util.getUrlParameter("batchSize");
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
  var geneList = util.getUrlParameter("geneList");
  if (geneList != null && geneList.length > 0 && geneList == 'ACMG56') {
    genesCard.ACMG_GENES.sort().forEach(function(geneName) {
      if ( geneNames.indexOf(geneName.toUpperCase()) < 0 ) {
        geneNames.push(geneName.toUpperCase());
      }
    });
  }

  // Get the gene list from the url.  Add the gene badges, selecting
  // the gene that was passed in the url parameter
  var genes = util.getUrlParameter("genes");
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
  var gene = util.getUrlParameter('gene');

  // Get the gene list from the url.  Add the gene badges, selecting
  // the gene that was passed in the url parameter
  loadGeneNamesFromUrl(gene);

  if (isKnownGene(gene)) {
    setGeneBloodhoundInputElement(gene, true, true);
    genesCard._geneBadgeLoading(gene, true, true);
  }
}

function showWelcomePanel() {

  var bam  = util.getUrlParameter(/(bam)*/);
  var vcf  = util.getUrlParameter(/(vcf)*/);

  var bamCount = bam != null ? Object.keys(bam).length : 0;
  var vcfCount = vcf != null ? Object.keys(vcf).length : 0;

  if (bamCount == 0 && vcfCount == 0) {
    $('#welcome-area').removeClass("hide");
  } else {
    $('#welcome-area').addClass("hide");
  }


}

function loadUrlSources() {

  var bam      = util.getUrlParameter(/(bam)*/);
  var bai      = util.getUrlParameter(/(bai)*/);
  var vcf      = util.getUrlParameter(/(vcf)*/);
  var tbi      = util.getUrlParameter(/(tbi)*/);
  var rel      = util.getUrlParameter(/(rel)*/);
  var affected = util.getUrlParameter(/(affectedStatus)*/);
  var dsname   = util.getUrlParameter(/(name)*/);
  var sample   = util.getUrlParameter(/(sample)*/);
  var affectedSibsString = util.getUrlParameter("affectedSibs");
  var unaffectedSibsString = util.getUrlParameter("unaffectedSibs");


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
            util.updateUrl('sample'+cardIndex, sampleName);
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
      var tbiUrl    = tbi && Object.keys(tbi).length > 0 ? util.decodeUrl(tbi["tbi"+cardIndex]) : null;
      var variantCard      = variantCards[+cardIndex];
      if (variantCard) {
        var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
        var panelSelector    = $(panelSelectorStr);
        var vcfUrl = util.decodeUrl(vcf[urlParameter]);
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
      var baiUrl    = bai && Object.keys(bai).length > 0 ? util.decodeUrl(bai["bai"+cardIndex]) : null;
      var variantCard      = variantCards[+cardIndex];
      if (variantCard) {
        var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
        var panelSelector    = $(panelSelectorStr);
        panelSelector.find('#bam-url-input').val(util.decodeUrl(bam[urlParameter]));
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
  cacheHelper.promiseClearCache();

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
  util.changeSiteStylesheet("css/assets/site-mygene2-advanced.css");
  util.updateUrl("mygene2", "true");
  util.updateUrl("mode",    "advanced");
  location.reload();
}
function switchToBasicMode() {
  util.changeSiteStylesheet("css/assets/mygene2-basic.css");
  util.updateUrl("mygene2",  "true");
  util.updateUrl("mode",     "basic");
  location.reload();
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

          var bam  = util.getUrlParameter(/(bam)*/);
        var vcf  = util.getUrlParameter(/(vcf)*/);


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


        genesCard.setSelectedGene(window.gene.gene_name);

        // Only load the variant data if the gene name was NOT entered
        // on the data dialog.
        if (evt.currentTarget.id != 'enter-gene-name-data-dialog') {
            loadTracksForGene();
        }

          // add gene to url params
          util.updateUrl('gene', window.gene.gene_name);

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


  $('#gene-track').removeClass("hide");

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


  d3.select('#impact-scheme').classed("current", true);
  d3.select('#effect-scheme' ).classed("current", false);
  d3.selectAll(".impact").classed("nocolor", false);
  d3.selectAll(".effect").classed("nocolor", true);

  gene.regionStart = formatRegion(window.gene.start);
  gene.regionEnd   = formatRegion(window.gene.end);

    $('#gene-chr').text(isLevelEdu ? ' is located on chromosome ' + window.gene.chr.replace('chr', '') : window.gene.chr);
    $('#gene-name').text((isLevelEdu ? 'GENE ' : '') + window.gene.gene_name);
    $('#gene-region').text(util.addCommas(window.gene.startOrig) + "-" + util.addCommas(window.gene.endOrig));


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
    transcript = geneCard.getCanonicalTranscript();
  }

  // Load the read coverage and variant charts.  If a bam hasn't been
  // loaded, the read coverage chart and called variant charts are
  // not rendered.  If the vcf file hasn't been loaded, the vcf variant
  // chart is not rendered.
  geneCard.showTranscripts();

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


  //$('#filter-nd-rank-card').removeClass("hide");
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

  filterCard.disableFilters();


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
  var cardCount = 0;
  var count = 0;

  return new Promise(function(resolve, reject) {
    getRelevantVariantCards().forEach(function(vc) {
      if (vc.getRelationship() != 'known-variants') {
        cardCount ++;
        var promise = vc.model.promiseHasCalledVariants().then(function(hasCalledVariants) {
          if (hasCalledVariants) {
            count++;
          }
        })
        promises.push(promise);
      }
    });

    Promise.all(promises).then(function() {
      resolve(count == cardCount);
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
    var loadPromise = null;
    var displayPromises = [];
    var trioVcfData = null;
    var hasCalledVariants = null;

    promiseHasCalledVariants()
    .then(function(data) {
      hasCalledVariants = data;
      return promiseGetCachedGeneCoverage(window.gene, window.selectedTranscript, true)
    })
    .then(function() {
      return geneCard.promiseMarkCodingRegions(window.gene, window.selectedTranscript);
    })
    .then(function() {

      geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;


      if (isAlignmentsOnly() && autocall && !hasCalledVariants) {

        // Only alignment files are loaded and user, when prompted, responded
        // that variants should be autocalled when gene is selected.  Perform joint calling.
        loadPromise = promiseJointCallVariants(window.gene, window.selectedTranscript, null, {isBackground: false, checkCache: true})
        .then(function(data) {
          trioVcfData = data.trioVcfData;
        })

      } else {
        loadPromise = promiseAnnotateVariants(window.gene, window.selectedTranscript, dataCard.mode == 'trio' && samplesInSingleVcf(), false)
        .then( function(data) {
            trioVcfData = data;

            getRelevantVariantCards().forEach(function(vc) {
              if (!isAlignmentsOnly()) {
                displayPromises.push(vc.promiseShowVariants());
              }
            });
         });
      }



      // For a trio, when all of the variants for the trio have been displayed and fully annotated
      // (including vep, clinvar, and coverage), compare the proband to mother and father
      // to determine inheritance and obtain the trio's allele counts.
      // Once inheritance is determined, show the feature matrix for the proband
      // and refresh the variants for all samples.  Now that all variants have been displayed,
      // get the bam depth and display it.  We do this last since we want to show the variants
      // in the ranked table as soon as possible.
      loadPromise
      .then(function() {
        showNavVariantLinks();
        return Promise.all(displayPromises);
      })
      .then(function() {
        return promiseGetCachedGeneCoverage(window.gene, window.selectedTranscript, true);
      })
      .then(function() {

        var coveragePromises = [];
        var allMaxDepth = 0;

        // the variants are fully annotated so determine inheritance (if trio).
        promiseAnnotateInheritance(window.gene, window.selectedTranscript, trioVcfData, {isBackground: false, cacheData: true})
        .then(function(data) {

          // Now summarize the danger for the selected gene
          return promiseSummarizeDanger(window.gene, window.selectedTranscript, data.trioVcfData.proband);
        })
        .then(function() {

          // Now show the variant cards and the ranked variants table
          getRelevantVariantCards().forEach(function(vc) {
            vc.promiseShowFinalizedVariants().then(function() {
              if (vc.getRelationship() == 'proband' && callback) {
                callback();
              }
            })
          })
        });

        // Get the bam depth for each sample.  Calculate the max depth
        // so that all coverage charts use the same y-Axis
        getRelevantVariantCards().forEach(function(vc) {
            var cp = vc.promiseLoadBamDepth()
            .then( function(coverageData) {
              if (coverageData) {
                var max = d3.max(coverageData, function(d,i) { return d[1]});
                if (max > allMaxDepth) {
                  allMaxDepth = max;
                }
              }
            });
            coveragePromises.push(cp);
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

function promiseSummarizeDanger(geneObject, theTranscript, probandVcfData, options) {

  return new Promise(function(resolve, reject) {

    promiseGetCachedGeneCoverage(geneObject, theTranscript, false)
    .then(function(data) {

      var geneCoverageAll = data.geneCoverage;

      getProbandVariantCard().promiseGetDangerSummary(geneObject.gene_name)
      .then(function(dangerSummary) {

          // Summarize the danger for the gene based on the filtered annotated variants and gene coverage
          var filteredVcfData = null;
          var filteredFbData = null;
          if (probandVcfData.features && probandVcfData.features.length > 0) {
            filteredVcfData = getVariantCard('proband').model.filterVariants(probandVcfData, filterCard.getFilterObject(), geneObject.start, geneObject.end, true);
            filteredFbData = getVariantCard("proband").model.reconstituteFbData(filteredVcfData);
          }
          var theOptions = $.extend({}, options);
          if ((dangerSummary && dangerSummary.CALLED) || (filteredFbData && filteredFbData.features.length > 0)) {
              theOptions.CALLED = true;
          }

          return getProbandVariantCard().promiseSummarizeDanger(geneObject.gene_name, filteredVcfData, theOptions, geneCoverageAll);
      })
      .then(function(theDangerSummary) {

        genesCard.setGeneBadgeGlyphs(geneObject.gene_name, theDangerSummary, true);
        resolve();
      },
      function(error) {
        var msg = "An error occurred in promiseSummarizeDanger() when calling VariantCard.promiseGetDangerSummary(): " + error;
        console.log(msg);
        reject(msg);
      })


    },
    function(error) {
      var msg = "An error occurred in promiseSummarizeDanger() when calling promiseGetCachedGeneCoverage(): " + error;
      console.log(msg);
      reject(msg);
    });

  });


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


function addVariantCard() {

  var variantCard = new VariantCard();
  variantCards.push(variantCard);

  var cardIndex = variantCards.length - 1;
  var defaultName = " ";

  // TODO:  Should really test to make sure that first card is proband, but
  var cardSelectorString = null;
  if (cardIndex == 0) {

    $('#proband-variant-card').append(templateUtil.variantCardTemplate());
    cardSelectorString = "#proband-variant-card .variant-card:eq(" + cardIndex + ")" ;

  } else {
    $('#other-variant-cards').append(templateUtil.variantCardTemplate());
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
    variantCard.prepareToShowVariants();
    variantCard.model.promiseAnnotateVariants(window.gene, window.selectedTranscript, [variantCard], false, false)
    .then(function() {
      variantCard.promiseShowVariants();
    })
  });

  hideKnownVariantsCard = false;

}


function clearKnownVariantsCard() {
  $('#known-variants-cards #vcf-track').addClass("hide");
  $('#known-variants-cards #variant-badges').addClass("hide");
  $('#select-known-variants-filter-box').addClass("hide");

  hideKnownVariantsCard = true;
}


function getCurrentTrioVcfData() {
  var trioVcfData = {};
  getRelevantVariantCards().forEach(function(vc) {
    var theVcfData = vc.model.vcfData;
    if (vc.model.isAlignmentsOnly() &&  theVcfData == null) {
      theVcfData = {};
      theVcfData.features = [];
      theVcfData.loadState = {};
    }
    trioVcfData[vc.getRelationship()] = theVcfData;
  })
  return trioVcfData;
}



function promiseJointCallVariants(geneObject, theTranscript, loadedTrioVcfData, options) {
  var me = this;

  return new Promise(function(resolve, reject) {

    var showCallingProgress = function() {
      if (!options.isBackground) {
        genesCard.showGeneBadgeLoading(geneObject.gene_name);
        getRelevantVariantCards().forEach(function(vc) {
          vc.showCallVariantsProgress('starting');
        });

      }
    }

    var showCalledVariants = function() {
      if (!options.isBackground) {
        window.hideCircleRelatedVariants();
        getRelevantVariantCards().forEach( function(vc) {
          // Show the counts
          vc.showCallVariantsProgress('counting');
          vc.showCallVariantsProgress('done');
          vc.promiseShowVariants();
        });

        getProbandVariantCard().promiseFillFeatureMatrix(regionStart, regionEnd)
        .then(function() {
          cacheHelper.showAnalyzeAllProgress();
        })
      }
    }

    var refreshClinvarAnnots = function(trioFbData) {
      for (var rel in trioFbData) {
        trioFbData[rel].features.forEach(function (fbVariant) {
          if (fbVariant.source) {
            fbVariant.source.clinVarUid                  = fbVariant.clinVarUid;
            fbVariant.source.clinVarClinicalSignificance = fbVariant.clinVarClinicalSignificance;
            fbVariant.source.clinVarAccession            = fbVariant.clinVarAccession;
            fbVariant.source.clinvarRank                 = fbVariant.clinvarRank;
            fbVariant.source.clinvar                     = fbVariant.clinvar;
            fbVariant.source.clinVarPhenotype            = fbVariant.clinVarPhenotype;
            fbVariant.source.clinvarSubmissions          = fbVariant.clinvarSubmissions;
          }
        });
      }
    }

    var makeDummyVcfData = function() {
      return {'loadState': {}, 'features': []}
    }


    cacheHelper.showCallAllProgress = true;
    var trioFbData  = {'proband': null, 'mother': null, 'father': null};
    var trioVcfData = loadedTrioVcfData ? loadedTrioVcfData : null;

    promiseHasCachedCalledVariants(geneObject, theTranscript)
    .then(function(hasCalledVariants) {

      if (options.checkCache && hasCalledVariants) {
        showCallingProgress();
        var promises = [];

        getRelevantVariantCards().forEach(function(vc) {


          var theFbData;
          var theVcfData = trioVcfData && trioVcfData[vc.getRelationship()] ? trioVcfData[vc.getRelationship()] : null;
          var theModel;


          var p = vc.model.promiseGetFbData(geneObject, theTranscript)
          .then(function(data) {
            theFbData = data.fbData;
            theModel = data.model;
            if (theVcfData) {
              return Promise.resolve({'vcfData': theVcfData});
            } else {
              return the.promiseGetVcfData(geneObject, theTranscript);
            }
          })
          .then(function(data) {
            theVcfData = data.vcfData;
            if (theVcfData == null) {
              theVcfData = makeDummyVcfData();
            }

            // When only alignments provided, only the called variants were cached as "fbData".
            // So initialize the vcfData to 0 features.
            var promise = null;
            if (theFbData && theFbData.features.length > 0 && theVcfData.features.length == 0) {
              promise = theModel.promiseCacheDummyVcfDataAlignmentsOnly(theFbData, geneObject, theTranscript );
            } else {
              Promise.resolve();
            }

            promise.then(function() {
              if (!options.isBackground) {
                theModel.vcfData = theVcfData;
                theModel.fbData  = theFbData;
              }
              trioFbData[vc.getRelationship()] = theFbData;
              trioVcfData[vc.getRelationship()] = theVcfData;
            })

          },
          function(error) {
            var msg = "A problem occurred in jointCallVariantsImpl(): " + error;
            console.log(msg);
            reject(msg);
          })

          promises.push(p);
        })
        Promise.all(promises).then(function() {
          showCalledVariants();
            resolve({
              'gene': geneObject,
              'transcript': theTranscript,
              'jointVcfRecs': [],
              'trioVcfData': trioVcfData,
              'trioFbData': trioFbData,
              'refName': geneObject.chr,
              'sourceVariant': null});
        })


      } else {
        var bams = [];
        getRelevantVariantCards().forEach(function(vc) {
          if (vc.getRelationship() != 'known-variants') {
            bams.push(vc.model.bam);
          }
        });

        showCallingProgress();

        getProbandVariantCard().model.bam.freebayesJointCall(
          geneObject,
          theTranscript,
          bams,
          window.geneSource == 'refseq' ? true : false,
          fbSettings.arguments,
          global_vepAF, // vep af
          function(theData, trRefName) {

            var jointVcfRecs =  theData.split("\n");

            if (trioVcfData == null) {
              trioVcfData = {'proband': makeDummyVcfData(), 'mother': makeDummyVcfData(), 'father': makeDummyVcfData()};
            }

            // Parse the joint called variants back to variant models
            var data = me._parseCalledVariants(geneObject, theTranscript, trRefName, jointVcfRecs, trioVcfData, options)
            trioFbData = data.trioFbData;

            // Annotate called variants with clinvar
            promiseAnnotateWithClinvar(trioFbData, geneObject, theTranscript, true)
            .then(function() {

              refreshClinvarAnnots(trioFbData);

              // Determine inheritance across union of loaded and called variants
              promiseAnnotateInheritance(geneObject, theTranscript, trioVcfData, {isBackground: options.isBackground, cacheData: true})
              .then( function() {
                  getRelevantVariantCards().forEach(function(vc) {
                    vc.model.loadCalledTrioGenotypes(trioVcfData[vc.getRelationship()], trioFbData[vc.getRelationship()]);
                  })
                  // Summarize danger for gene
                 return promiseSummarizeDanger(geneObject, theTranscript, trioVcfData.proband, {'CALLED': true});
              })
              .then(function() {
                showCalledVariants();

                var refreshedSourceVariant = null;
                if (options.sourceVariant) {
                  trioVcfData.proband.features.forEach(function(variant) {
                    if (!refreshedSourceVariant &&
                      variant.chrom == options.sourceVariant.chrom &&
                      variant.start == options.sourceVariant.start &&
                      variant.ref == options.sourceVariant.ref &&
                      variant.alt == options.sourceVariant.alt) {

                      refreshedSourceVariant = variant;
                    }
                  })
                }

                resolve({
                  'gene': geneObject,
                  'transcript': theTranscript,
                  'jointVcfRecs': jointVcfRecs,
                  'trioVcfData': trioVcfData,
                  'trioFbData': trioFbData,
                  'refName': trRefName,
                  'sourceVariant': refreshedSourceVariant});
              })
            });
          }
        );

      }
    })
  })

}

function _parseCalledVariants(geneObject, theTranscript, translatedRefName, jointVcfRecs, trioVcfData, options) {

  var trioFbData  = {'proband': null, 'mother': null, 'father': null};
  var fbPromises = [];
  var idx = 0;

  getRelevantVariantCards().forEach(function(vc) {

    var sampleNamesToGenotype = vc.getSampleNamesToGenotype();

    var theVcfData = trioVcfData[vc.getRelationship()];
    theVcfData.loadState['called'] = true;

    var data = vc.model.vcf.parseVcfRecordsForASample(jointVcfRecs, translatedRefName, geneObject, theTranscript, matrixCard.clinvarMap, true, (sampleNamesToGenotype ? sampleNamesToGenotype.join(",") : null), idx, global_vepAF);

    var theFbData = data.results;
    theFbData.loadState['called'] = true;
    theFbData.features.forEach(function(variant) {
      variant.extraAnnot = true;
      variant.fbCalled = "Y";
      variant.extraAnnot = true;
    })

    if (options.isBackground) {
      var pileupObject = vc.model._pileupVariants(theFbData.features, geneObject.start, geneObject.end);
      theFbData.maxLevel = pileupObject.maxLevel + 1;
      theFbData.featureWidth = pileupObject.featureWidth;
    }


    // Flag the called variants
    theFbData.features.forEach( function(feature) {
      feature.fbCalled = 'Y';
      feature.extraAnnot = true;
    });

    // Filter the freebayes variants to only keep the ones
    // not present in the vcf variant set.
    vc.model._determineUniqueFreebayesVariants(geneObject, theTranscript, theVcfData, theFbData);


    // Show the snpEff effects / vep consequences in the filter card
    vc.model._populateEffectFilters(theFbData.features);

    // Determine the unique values in the VCF filter field
    vc.model._populateRecFilters(theFbData.features);


    if (!options.isBackground) {
      vc.model.fbData = theFbData;
      vc.model.vcfData = theVcfData;
    }
    trioFbData[vc.getRelationship()]  = theFbData;
    idx++;
  });

  return {'trioVcfData': trioVcfData, 'trioFbData': trioFbData};
}


function promiseAnnotateVariants(theGene, theTranscript, isMultiSample, isBackground, onVcfData) {
  return new Promise(function(resolve, reject) {
    var annotatePromises = [];
    var theResultMap = {};
    if (isMultiSample) {
      var p = getProbandVariantCard().model.promiseAnnotateVariants(theGene, theTranscript, getRelevantVariantCards(), isMultiSample, isBackground, onVcfData)
      .then(function(resultMap) {
        theResultMap = resultMap;
      })
      annotatePromises.push(p);
    } else {
      getRelevantVariantCards().forEach(function(vc) {
        if (vc.model.isVcfReadyToLoad() || vc.model.isLoaded()) {
          var p = vc.model.promiseAnnotateVariants(theGene, theTranscript, [vc], isMultiSample, isBackground, onVcfData)
          .then(function(resultMap) {
            for (var rel in resultMap) {
              theResultMap[rel] = resultMap[rel];
            }
          })
          annotatePromises.push(p);
        }
      })
    }

    Promise.all(annotatePromises)
    .then(function() {
      promiseAnnotateWithClinvar(theResultMap, theGene, theTranscript, isBackground)
      .then(function() {
        resolve(theResultMap);
      })
    });
  })
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

function promiseAnnotateInheritance(geneObject, theTranscript, trioVcfData, options={isBackground: false, cacheData: true}) {
  var me = this;

  return new Promise(function(resolve,reject) {

    if (isAlignmentsOnly() && !autocall && (trioVcfData == null || trioVcfData.proband == null)) {
        resolve({'trioVcfData': {'proband': {features: []}}, 'gene': geneObject, 'transcript': theTranscript});
    } else {

      if (!options.isBackground) {
        $('#filter-and-rank-card').removeClass("hide");
        $('#matrix-track').removeClass("hide");
        $("#feature-matrix-note").addClass("hide");
        if (dataCard.mode == 'trio') {
          $("#matrix-panel .loader").removeClass("hide");
          $("#matrix-panel .loader .loader-label").text("Determining inheritance mode");
        }
      }

      var calcMaxAlleleCount = function(theVcfData) {
        if (theVcfData && theVcfData.features) {
          theVcfData.features.forEach(function(theVariant) {
            if (theVariant.genotypeDepth) {
              if ((+theVariant.genotypeDepth) > maxAlleleCount) {
                maxAlleleCount = +theVariant.genotypeDepth;
              }
            }
          })
        }
      }


      if (dataCard.mode == 'single') {
        promiseCacheTrioVcfData(geneObject, theTranscript, CacheHelper.VCF_DATA, trioVcfData, options.cacheData)
        .then(function() {
          //resolve({'trioVcfData': trioVcfData, 'trioFbData': trioFbData, 'gene': geneObject, 'transcript': theTranscript});
          resolve({'trioVcfData': trioVcfData,'gene': geneObject, 'transcript': theTranscript});
        })
      } else {

        // Set the max allele count across all variants in the trio.  We use this to properly scale
        // the allele counts bars in the tooltip
        maxAlleleCount = 0;
        for(var rel in trioVcfData) {
          calcMaxAlleleCount(trioVcfData[rel]);
        }
        //for(var rel in trioFbData) {
        //  calcMaxAlleleCount(trioFbData[rel]);
        //}

        // Enable inheritance filters
        filterCard.enableInheritanceFilters(trioVcfData.proband);


        // We only pass in the affected info if we need to sync up genotypes because samples
        // where in separate vcf files
        var affectedInfo = getAffectedInfo();
        var affectedInfoToSync = isAlignmentsOnly() || samplesInSingleVcf() ? null : affectedInfo;

        var trioModel = new VariantTrioModel(trioVcfData.proband, trioVcfData.mother, trioVcfData.father, null, affectedInfoToSync);

        // Compare the mother and father variants to the proband, setting the inheritance
        // mode on the proband's variants
        trioModel.compareVariantsToMotherFather(function() {

          // Now set the affected status for the family on each variant of the proband
          getProbandVariantCard().model.determineAffectedStatus(trioVcfData.proband, geneObject, theTranscript, affectedInfo, function() {

            // Now that inheritance mode has been determined, we can assess each variant's impact
            getRelevantVariantCards().forEach(function(vc) {
              if (trioVcfData[vc.getRelationship()]) {
                vc.model.assessVariantImpact(trioVcfData[vc.getRelationship()], theTranscript);
              }
            })

            if (!options.isBackground) {
              $("#matrix-panel .loader").addClass("hide");
              $("#matrix-panel .loader .loader-label").text("Ranking variants");
              $("#feature-matrix-note").removeClass("hide");
            }

            promiseCacheTrioVcfData(geneObject, theTranscript, CacheHelper.VCF_DATA, trioVcfData, options.cacheData)
            .then(function() {
              //resolve({'trioVcfData': trioVcfData, 'trioFbData': trioFbData, 'gene': geneObject, 'transcript': theTranscript});
              resolve({'trioVcfData': trioVcfData, 'gene': geneObject, 'transcript': theTranscript});
            })
          });

        })
      }

    }


  })

}


function promiseCacheTrioVcfData(geneObject, theTranscript, dataKind, trioVcfData, cacheIt) {

  return new Promise(function(resolve, reject) {
    // Cache vcf data for trio
    var cachePromise = null;
    if (cacheIt) {
      var cachedPromises = [];
      getRelevantVariantCards().forEach(function(vc) {
        if (trioVcfData[vc.getRelationship()]) {
          console.log("caching " + geneObject.gene_name + " for " + vc.getRelationship());
          var p = vc.model._promiseCacheData(trioVcfData[vc.getRelationship()], dataKind, geneObject.gene_name, theTranscript);
          cachedPromises.push(p);
        }
      })
      Promise.all(cachedPromises).then(function() {
        resolve();
      })
    } else {
      resolve();
    }

  })

}





function promiseAnnotateWithClinvar(resultMap, geneObject, transcript, isBackground) {

  var formatClinvarKey = function(variant) {
    var delim = '^^';
    return variant.chrom + delim + variant.ref + delim + variant.alt + delim + variant.start + delim + variant.end;
  }

  var formatClinvarThinVariant = function(key) {
    var delim = '^^';
    var tokens = key.split(delim);
    return {'chrom': tokens[0], 'ref': tokens[1], 'alt': tokens[2], 'start': tokens[3], 'end': tokens[4]};
  }



  var refreshVariantsWithClinvarLookup = function(theVcfData, clinvarLookup) {
    theVcfData.features.forEach(function(variant) {
      var clinvarAnnot = clinvarLookup[formatClinvarKey(variant)];
      if (clinvarAnnot) {
        for (var key in clinvarAnnot) {
          variant[key] = clinvarAnnot[key];
        }
      }
    })
    if (theVcfData.loadState == null) {
      theVcfData.loadState = {};
    }
    theVcfData.loadState['clinvar'] = true;
  }



  return new Promise(function(resolve, reject) {

    // Combine the trio variants into one set of variants so that we can access clinvar once
    // instead of on a per sample basis
    var uniqueVariants = {};
    var unionVcfData = {features: []}
    for (var rel in resultMap) {
      var vcfData = resultMap[rel];
      if (!vcfData.loadState['clinvar']) {
       vcfData.features.forEach(function(feature) {
          uniqueVariants[formatClinvarKey(feature)] = true;
       })
      }
    }
    if (Object.keys(uniqueVariants).length == 0) {
      resolve();
    } else {

      for (var key in uniqueVariants) {
        unionVcfData.features.push(formatClinvarThinVariant(key));
      }

      var refreshVariantsFunction = isClinvarOffline || clinvarSource == 'vcf' ? getProbandVariantCard().model._refreshVariantsWithClinvarVCFRecs.bind(getProbandVariantCard().model, unionVcfData) : getProbandVariantCard().model._refreshVariantsWithClinvarEutils.bind(getProbandVariantCard().model, unionVcfData);

      getProbandVariantCard().model.vcf.promiseGetClinvarRecords(
          unionVcfData,
          getProbandVariantCard().model._stripRefName(geneObject.chr),
          geneObject,
          refreshVariantsFunction)
      .then(function() {

          // Create a hash lookup of all clinvar variants
          var clinvarLookup = {};
          unionVcfData.features.forEach(function(variant) {
            var clinvarAnnot = {};

            for (var key in getProbandVariantCard().model.vcf.getClinvarAnnots()) {
                clinvarAnnot[key] = variant[key];
                clinvarLookup[formatClinvarKey(variant)] = clinvarAnnot;
            }
          })

          var refreshPromises = [];

          // Use the clinvar variant lookup to initialize variants with clinvar annotations
          for (var rel in resultMap) {
            var vcfData = resultMap[rel];
            if (!vcfData.loadState['clinvar']) {
              var p = refreshVariantsWithClinvarLookup(vcfData, clinvarLookup);
              if (!isBackground) {
                getVariantCard(rel).model.vcfData = vcfData;
              }
              //var p = getVariantCard(rel).model._promiseCacheData(vcfData, CacheHelper.VCF_DATA, vcfData.gene.gene_name, vcfData.transcript);
              refreshPromises.push(p);
            }
          }

          Promise.all(refreshPromises)
          .then(function() {
            resolve(resultMap);
          },
          function(error) {
            reject(error);
          })

      })
    }


  })
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
              variantCard.promiseFillFeatureMatrix(regionStart, regionEnd);
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
    bookmarkCard.bookmarkVariant(clickedVariant);
    unpinAll();
  }
}

function flagBookmarkedVariant() {
  if (clickedVariant) {
    var bookmarkKey = bookmarkCard.getBookmarkKey(gene.gene_name, window.selectedTranscript.transcript_id, gene.chr, clickedVariant.start, clickedVariant.ref, clickedVariant.alt);
    if (bookmarkKey) {
      this.bookmarkCard.flagCurrentBookmark(bookmarkKey);
    }
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


function showFeedback() {

  $('#feedback-note').val("");

  if (feedbackAttachScreenCapture) {
    $('#feedback-screen-capture-area').removeClass("hide");
    $('#feedback-screen-capture').empty();
    $('#feedback-screen-capture').append(  "<div id='feedback-container' class='"       + "'></div>"  );

    $('#feedback-screen-capture #feedback-container').append(  $('#gene-track').html() );
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

  util.util.sendFeedbackEmail(name, email, note, htmlAttachment);
  util.util.sendFeedbackReceivedEmail(email);

  if (feedbackAttachScreenCapture) {
    $('#feedback-screen-capture').empty();
  }

  $('#feedback-modal').modal('hide');
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

