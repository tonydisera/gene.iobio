//
// Global Variables
//



var siteConfig = {};


var utility = new Util();
var templateUtil = new TemplateUtil();

var exhibitTimeout = new Timeout("exhibit.html", exhibitStartOver);


// The selected (sub-) region of the gene.  Null
// when there is not an active selection.
var regionStart = null;
var regionEnd = null;
var GENE_REGION_BUFFER = 1000;
var GENE_REGION_BUFFER_MAX = 50000;

var geneSearch = new GeneSearch();

// genes card
var geneModel = new GeneModel();

// Selected gene
var gene = '';
// Selected transcript
var selectedTranscript = null;

// clicked variant
var clickedVariant = null;
var clickedVariantCard = null;


var loadedUrl = false;


var knownVariantsCard = new KnownVariantsCard();

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
var geneCard = new GeneCard(geneModel);

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

// variant card
var variantCards = [];

// variant cards for unaffected and affected sibs
var variantCardsSibs = {'affected': [], 'unaffected': []};


var variantExporter = null;

var freebayesSettings = new FreebayesSettings();


var feedback = null;

var edutour = null;


$(document).ready(function(){


  alertify.defaults.glossary.title = "";
  alertify.defaults.theme.ok = 'btn btn-default btn-raised';
  alertify.defaults.theme.cancel = 'btn btn-default btn-raised';

  determineStyle();



  initHub();


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
    endpoint = new EndpointCmd(useSSL, IOBIO, cacheHelper.launchTimestamp, genomeBuildHelper, utility.getHumanRefNames)

    return cacheHelper.promiseCheckCacheSize();
   })
   .then(function() {
     return promiseLoadSiteConfig();
   })
   .then(function() {
     return geneModel.promiseLoadClinvarGenes();
   })
   .then(function() {
      // Clear the local cache
      return cacheHelper.promiseClearCache();
   })
   .then(function() {
      showWelcomePanel();
      init();

      if (utility.detectIE() != false) {
        alertify.set('notifier', 'position', 'top-right');
        alertify.error("Warning. Gene.iobio has been tested and verified on Chrome, Firefox, and Safari browsers.  Please run gene.iobio from one of these browsers.", 0);
      } else if (!utility.isChrome()) {
        alertify.set('notifier', 'position', 'top-right');
        alertify.warning("Use the Google Chrome browser for the best performance of gene.iobio.", 10);
      }
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

// Get sample name, gene(?), build(?) from ajax call and then only call this for each file?
function appendHubFileNamesToURL(res) {
  res.data.forEach(function(file) {
    var {uri, name, type } = file;
    utility.updateUrl(type+"0", uri);
    utility.updateUrl("name0", name.split(".")[0]);
    utility.updateUrl("sample0", name.split(".")[0]);
    utility.updateUrl("genes","RAI1,AIRE,MYLK2,PDGFB,PDHA1");
    utility.updateUrl("gene","RAI1");
    utility.updateUrl("build","GRCh37");
  })
}


function determineStyle() {

  var mygene2Parm = utility.getUrlParameter("mygene2");
  if ( mygene2Parm && mygene2Parm != "" ) {
    isMygene2   = mygene2Parm == "false" || mygene2Parm.toUpperCase() == "N" ? false : true;
  }
  var modeParm = utility.getUrlParameter("mode");
  if (modeParm && modeParm != "") {
    isLevelBasic     = modeParm == "basic" ? true : false;
    isLevelEdu       = (modeParm == "edu" || modeParm == "edutour") ? true : false;
  }

  if (isLevelEdu) {
    utility.changeSiteStylesheet("assets/css/site-edu.css");
  } else if (isMygene2 && isLevelBasic) {
    utility.changeSiteStylesheet("assets/css/site-mygene2-basic.css");
  } else if (isMygene2) {
    utility.changeSiteStylesheet("assets/css/site-mygene2-advanced.css");
  }

}


function promiseInitCache() {

  return new Promise(function(resolve, reject) {
    cacheHelper = new CacheHelper();
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
  if (isLevelEdu && !utility.getUrlParameter("tour")) {
    var exhibitUrl = window.location.protocol + "\/\/" + window.location.hostname + window.location.pathname + "exhibit.html";
    window.location.assign(exhibitUrl);
    return;
  }

  attachTemplates();

  // Initialize material bootstrap
  $.material.init();


  var loaderDisplay = new geneBadgeLoaderDisplay('#gene-badge-loading-display');
  cacheHelper.setLoaderDisplay(loaderDisplay);


  // Set version number on About menu and the Version dialog
  $('.version-number').text(version);

  eduTourNumber = utility.getUrlParameter("tour");
  if (eduTourNumber == null || eduTourNumber == "") {
    eduTourNumber = "0";
  }
  if (eduTourNumber && eduTourNumber != '') {
    $('#edu-tour-' + eduTourNumber).removeClass("hide");
  }


  edutour = new EduTour();
  edutour.init();

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


  knownVariantsCard.init();



  // Initialize gene card
  geneCard.init();


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

  // Initialize gene search widget
  geneSearch.init();
  geneSearch.onSelect(function(geneName, currentTarget, loadFromUrl, callback) {
    geneCard.onGeneNameSelected(geneName, currentTarget, loadFromUrl, callback)
  });

  // Load the gene search widget with all of the gene names
  geneSearch.promiseLoad().then(function() {
    showGeneControls();
    loadGeneFromUrl();
  },
  function(error) {
    alertify.alert("Unable to load gene search with genes.");
  })



  // In cases where timeout=true, restart app after n seconds of inactivity
  // (e.g. no mouse move, button click, etc.).
  if (hasTimeout) {
    exhibitTimeout.checkForInactivity();
  }

  if (feedbackEmails != undefined && feedbackEmails != "") {
    feedback = new Feedback();
    feedback.init();
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
    $('#gene-region').text(utility.addCommas(window.gene.start) + "-" + utility.addCommas(window.gene.end));
    genesCard.hideGeneBadgeLoading(window.gene.gene_name);
    genesCard.setGeneBadgeError(window.gene.gene_name);
    return false;
  } else {
    return true;
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

    var transitionEvent = utility.whichTransitionEvent();
    $('.slide-left').one(transitionEvent, function(event) {
      $('#slider-left').trigger("open");
    });
  }
}



function showDataDialog(activeTab, geneName) {

  if (geneName) {
    if (geneModel.isKnownGene(geneName)) {
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
  $('#matrix-panel').css('max-width', windowWidth - sliderWidth - (isLevelEdu  || isLevelBasic ? 30 : 20));
  $('#matrix-panel').css('min-width', windowWidth - sliderWidth - (isLevelEdu  || isLevelBasic ? 30 : 20));

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

  var transitionEvent = utility.whichTransitionEvent();
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



function loadGeneFromUrl() {
  // Get the species
  var species = utility.getUrlParameter('species');
  if (species != null && species != "") {
    dataCard.setCurrentSpecies(species);
  }

  // Get the genome build
  var build = utility.getUrlParameter('build');
  if (build != null && build != "") {
    dataCard.setCurrentBuild(build);
  }


  // Get the gene parameter
  var geneName = utility.getUrlParameter('gene');
  if (geneName) {
    geneName = geneName.toUpperCase();
  }

  var theGeneSource = utility.getUrlParameter("geneSource");
  if (theGeneSource != null && theGeneSource != "") {
    siteGeneSource = theGeneSource;
    geneCard.switchGeneSource(theGeneSource.toLowerCase() == 'refseq' ? "RefSeq Transcript" : "Gencode Transcript");
  } else {
    geneCard.switchGeneSource(siteGeneSource.toLowerCase() == 'refseq' ? "RefSeq Transcript" : "Gencode Transcript");
  }

  var batchSize = utility.getUrlParameter("batchSize");
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
        if (geneModel.isKnownGene(geneName)) {
          geneSearch.setValue(geneName, true, true);
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



function loadGeneNamesFromUrl(geneNameToSelect) {
  genesCard.geneNames = [];
  var unknownGeneNames = {};

  // Add the gene to select to the gene list
  if (geneNameToSelect && geneNameToSelect.length > 0) {
    if (geneModel.isKnownGene(geneNameToSelect)) {
      genesCard.geneNames.push(geneNameToSelect.toUpperCase());
    } else {
      unknownGeneNames[geneNameToSelect] = true;
      geneNameToSelect = null;
    }
  }


  // If a gene list name was provided (e.g. ACMG, load these genes)
  var geneList = utility.getUrlParameter("geneList");
  if (geneList != null && geneList.length > 0 && geneList == 'ACMG56') {
    genesCard.ACMG_GENES.sort().forEach(function(geneName) {
      if ( genesCard.geneNames.indexOf(geneName.toUpperCase()) < 0 ) {
        genesCard.geneNames.push(geneName.toUpperCase());
      }
    });
  }

  // Get the gene list from the url.  Add the gene badges, selecting
  // the gene that was passed in the url parameter
  var genes = utility.getUrlParameter("genes");
  if (genes != null && genes.length > 0) {
    genes.split(",").forEach( function(geneName) {
      if ( genesCard.geneNames.indexOf(geneName) < 0 ) {
        if (geneModel.isKnownGene(geneName.toUpperCase())) {
          genesCard.geneNames.push(geneName.toUpperCase());
        } else {
          unknownGeneNames[geneName] = true;
        }
      }
    });
  }

  if (genesCard.geneNames.length > 0) {
    if (!geneNameToSelect) {
      geneNameToSelect = genesCard.geneNames[0];
    }
    $('#genes-to-copy').val(genesCard.geneNames.join(","));
    genesCard.copyPasteGenes(geneNameToSelect, true);
  }
  if (Object.keys(unknownGeneNames).length > 0) {
    var message = "Bypassing unknown genes: " + Object.keys(unknownGeneNames).join(", ") + ".";
    alertify.alert(message);
  }
}

function reloadGeneFromUrl() {

  // Get the gene parameger
  var gene = utility.getUrlParameter('gene');

  // Get the gene list from the url.  Add the gene badges, selecting
  // the gene that was passed in the url parameter
  loadGeneNamesFromUrl(gene);

  if (geneModel.isKnownGene(gene)) {
    geneSearch.setValue(gene, true, true);
    genesCard._geneBadgeLoading(gene, true, true);
  }
}

function showWelcomePanel() {

  var bam  = utility.getUrlParameter(/(bam)*/);
  var vcf  = utility.getUrlParameter(/(vcf)*/);

  var bamCount = bam != null ? Object.keys(bam).length : 0;
  var vcfCount = vcf != null ? Object.keys(vcf).length : 0;

  if (bamCount == 0 && vcfCount == 0) {
    $('#welcome-area').removeClass("hide");
  } else {
    $('#welcome-area').addClass("hide");
  }


}

function loadUrlSources() {

  var bam      = utility.getUrlParameter(/(bam)*/);
  var bai      = utility.getUrlParameter(/(bai)*/);
  var vcf      = utility.getUrlParameter(/(vcf)*/);
  var tbi      = utility.getUrlParameter(/(tbi)*/);
  var rel      = utility.getUrlParameter(/(rel)*/);
  var affected = utility.getUrlParameter(/(affectedStatus)*/);
  var dsname   = utility.getUrlParameter(/(name)*/);
  var sample   = utility.getUrlParameter(/(sample)*/);
  var affectedSibsString = utility.getUrlParameter("affectedSibs");
  var unaffectedSibsString = utility.getUrlParameter("unaffectedSibs");


  // Initialize transcript chart and variant cards, but hold off on displaying
  // the variant cards.
  if (!isLevelEdu  && !isLevelBasic) {
    if (genomeBuildHelper.getCurrentSpecies() && genomeBuildHelper.getCurrentBuild()) {
      loadTracksForGene(true);

    }
  }



  if ((bam != null && Object.keys(bam).length > 1) || (vcf != null && Object.keys(vcf).length > 1)) {
    if (!isLevelEdu) {
      dataCard.toggleSampleTrio(true);
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
            utility.updateUrl('sample'+cardIndex, sampleName);
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
      var tbiUrl    = tbi && Object.keys(tbi).length > 0 ? utility.decodeUrl(tbi["tbi"+cardIndex]) : null;
      var variantCard      = variantCards[+cardIndex];
      if (variantCard) {
        var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
        var panelSelector    = $(panelSelectorStr);
        var vcfUrl = utility.decodeUrl(vcf[urlParameter]);
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
      var baiUrl    = bai && Object.keys(bai).length > 0 ? utility.decodeUrl(bai["bai"+cardIndex]) : null;
      var variantCard      = variantCards[+cardIndex];
      if (variantCard) {
        var panelSelectorStr = '#' + variantCard.getRelationship() +  "-data";
        var panelSelector    = $(panelSelectorStr);
        panelSelector.find('#bam-url-input').val(utility.decodeUrl(bam[urlParameter]));
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






function switchToAdvancedMode() {
  utility.changeSiteStylesheet("css/assets/site-mygene2-advanced.css");
  utility.updateUrl("mygene2", "true");
  utility.updateUrl("mode",    "advanced");
  location.reload();
}
function switchToBasicMode() {
  utility.changeSiteStylesheet("css/assets/mygene2-basic.css");
  utility.updateUrl("mygene2",  "true");
  utility.updateUrl("mode",     "basic");
  location.reload();
}

/*
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
function loadTracksForGene(bypassVariantCards, callback) {

  toggleIntroCard(true);

  if (window.gene == null || window.gene == "" && !isLevelBasic) {
    return;
  }

  genesCard.showGeneBadgeLoading(window.gene.gene_name);

  if (!bypassVariantCards && !isDataLoaded()) {
    //$('#add-data-button').animateIt('tada', 'animate-twice');
    $('#add-data-button').addClass("attention");
  } else {
    $('#add-data-button').removeClass("attention");
  }

  window.regionStart = null;
  window.regionEnd = null;
  window.gene.regionStart = utility.formatRegion(window.gene.start);
  window.gene.regionEnd   = utility.formatRegion(window.gene.end);
  window.regionStart = window.gene.start;
  window.regionEnd   = window.gene.end;

  $("#region-flag").addClass("hide");
  $("#coordinate-frame").css("opacity", 0);


  filterCard.onGeneLoading();
  geneCard.onGeneLoading();
  matrixCard.onGeneLoading();


  // This will be the view finder, allowing the user to select
  // a subregion of the gene to zoom in on the tracks.
  var transcript = [];
  if (window.gene.transcripts && window.gene.transcripts.length > 0 ) {
    transcript = geneModel.getCanonicalTranscript();
  }

  // Load the read coverage and variant charts.  If a bam hasn't been
  // loaded, the read coverage chart and called variant charts are
  // not rendered.  If the vcf file hasn't been loaded, the vcf variant
  // chart is not rendered.
  geneCard.showTranscripts();

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
    if (!vc.model.isAlignmentsOnly() && vc.getRelationship() != 'known-variants') {
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

  knownVariantsCard.beforeGeneLoaded(geneModel.clinvarGenes[window.gene.gene_name]);

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
      return geneModel.promiseMarkCodingRegions(window.gene, window.selectedTranscript);
    })
    .then(function() {

      geneModel.geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;


      if (isAlignmentsOnly() && autocall && !hasCalledVariants) {

        // Only alignment files are loaded and user, when prompted, responded
        // that variants should be autocalled when gene is selected.  Perform joint calling.
        loadPromise = promiseJointCallVariants(window.gene, window.selectedTranscript, null, {isBackground: false, checkCache: true})
        .then(function(data) {
          trioVcfData = data.trioVcfData;
          knownVariantsCard.onGeneLoaded();
        })

      } else {
        loadPromise = promiseAnnotateVariants(window.gene, window.selectedTranscript, dataCard.mode == 'trio' && samplesInSingleVcf(), false)
        .then( function(data) {
            trioVcfData = data;

            knownVariantsCard.onGeneLoaded();

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

          cacheHelper.showAnalyzeAllProgress();


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

        genesCard.setGeneBadgeGlyphs(geneObject.gene_name, theDangerSummary, false);
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

  if (knownVariantsCard.viz == knownVariantsCard.VIZ_VARIANTS) {
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

    var endCallProgress = function() {
      if (!options.isBackground) {
        window.hideCircleRelatedVariants();
        getRelevantVariantCards().forEach( function(vc) {
          // Show the counts
          vc.showCallVariantsProgress('counting');
          vc.showCallVariantsProgress('done');
        });

      }
    }
    var refreshClinvarAnnots = function(trioFbData) {
      for (var rel in trioFbData) {
        if (trioFbData[rel]) {
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
          geneModel.geneSource == 'refseq' ? true : false,
          freebayesSettings.arguments,
          global_vepAF, // vep af
          function(theData, trRefName) {

            var jointVcfRecs =  theData.split("\n");

            if (trioVcfData == null) {
              trioVcfData = {'proband': makeDummyVcfData(), 'mother': makeDummyVcfData(), 'father': makeDummyVcfData()};
            }

            // Parse the joint called variants back to variant models
            var data = me._parseCalledVariants(geneObject, theTranscript, trRefName, jointVcfRecs, trioVcfData, options)

            if (data == null) {
              endCallProgress();
            } else {
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
  var emptyVcfData = false;

  getRelevantVariantCards().forEach(function(vc) {

    var sampleNamesToGenotype = vc.getSampleNamesToGenotype();

    var theVcfData = trioVcfData[vc.getRelationship()];
    if (emptyVcfData || theVcfData == null) {
      emptyVcfData = true;
    } else {

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
      vc.model.populateEffectFilters(theFbData.features);

      // Determine the unique values in the VCF filter field
      vc.model.populateRecFilters(theFbData.features);


      if (!options.isBackground) {
        vc.model.fbData = theFbData;
        vc.model.vcfData = theVcfData;
      }
      trioFbData[vc.getRelationship()]  = theFbData;
    }
    idx++;
  });

  if (emptyVcfData) {
    alertify.alert("Make sure selected gene has loaded before calling variants.")
    return null;
  } else {
    return {'trioVcfData': trioVcfData, 'trioFbData': trioFbData};
  }
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
          if (vc.getRelationship() != 'known-variants') {
            var p = vc.model.promiseAnnotateVariants(theGene, theTranscript, [vc], isMultiSample, isBackground, onVcfData)
            .then(function(resultMap) {
              for (var rel in resultMap) {
                theResultMap[rel] = resultMap[rel];
              }
            })
            annotatePromises.push(p);
          }
        }
      })
    }


    if (knownVariantsCard.shouldShowVariants()) {
      let p = getVariantCard('known-variants').model.promiseAnnotateVariants(theGene, theTranscript, [getVariantCard('known-variants')], false, isBackground)
      .then(function(resultMap) {
        for (var rel in resultMap) {
          theResultMap[rel] = resultMap[rel];
        }
      })
      annotatePromises.push(p);
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

  var resolveIt = function(resolve, trioVcfData, geneObject, theTranscript, options) {

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
      resolve({'trioVcfData': trioVcfData, 'gene': geneObject, 'transcript': theTranscript});
    })

  }

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

      if (dataCard.mode == 'single') {
        // Determine harmful variants, cache data, etc.
        resolveIt(resolve, trioVcfData, geneObject, theTranscript, options);
      } else {

        // Set the max allele count across all variants in the trio.  We use this to properly scale
        // the allele counts bars in the tooltip
        maxAlleleCount = 0;
        for(var rel in trioVcfData) {
          maxAlleleCount = VariantModel.calcMaxAlleleCount(trioVcfData[rel], maxAlleleCount);
        }


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

            // Determine harmful variants, cache data, etc.
            resolveIt(resolve, trioVcfData, geneObject, theTranscript, options);

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
      if (vcfData) {
        if (!vcfData.loadState['clinvar']) {
         vcfData.features.forEach(function(feature) {
            uniqueVariants[formatClinvarKey(feature)] = true;
         })
        }
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
          geneModel.clinvarGenes,
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
            if (vcfData) {
              if (!vcfData.loadState['clinvar']) {
                var p = refreshVariantsWithClinvarLookup(vcfData, clinvarLookup);
                if (!isBackground) {
                  getVariantCard(rel).model.vcfData = vcfData;
                }
                //var p = getVariantCard(rel).model._promiseCacheData(vcfData, CacheHelper.VCF_DATA, vcfData.gene.gene_name, vcfData.transcript);
                refreshPromises.push(p);
              }
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
    if (variantCard.isViewable() && variantCard.getRelationship() != 'known-variants') {

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


function toggleIntroCard(forceHide) {
  var firstGeneLoading = $('#proband-variant-card .variant-card.hide').length == 1;
  if (isMygene2 && !firstGeneLoading) {
    if ( forceHide || $('#intro-text.hide').length == 0) {
      $('#intro-text').addClass("hide");
      $('#intro-link').removeClass("hide");
    } else {
      $('#intro-text').removeClass("hide");
      $('#intro-link').addClass("hide");
    }
  }

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

function exhibitStartOver() {
  window.location.href = EXHIBIT_URL;
}
