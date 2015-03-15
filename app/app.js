//
// Global Variables
//
//var geneiobio_server = "http://localhost:3000/";
var geneiobio_server = "http://geneinfo.iobio.io/";


// Engine for gene search suggestions
var gene_engine = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  local: [],
  limit: 10
});

// the variant filter panel
var trackLegendTemplate = Handlebars.compile($('#track-legend-template').html());	
var variantCardTemplate = Handlebars.compile($('#variant-card-template').html());

// A view finder, showing a single transcript which
// is a union of all transcripts.  This chart
// allows the user to select a sub-region of the
// gene and view all of the tracks at this zoomed in
// level.
var viewFinderChart = null;

// The x-axis for the zoomed-in region (the region
// selected in the view finder.)
var zoomRegionChart = null;

// The selected (sub-) region of the gene.  Null
// when there is not an active selection.
var regionStart = null;
var regionEnd = null;

// Transcript data and chart
var gene = '';
var selectedTranscript = null;
var transcriptChart =  null;
var transcriptViewMode = "single";
var transcriptMenuChart = null;
var transcriptPanelHeight = null;
var transcriptCollapse = true;

// filters

// Filters
clickedAnnotIds = new Object();
var annotsToInclude = new Object();
var afMin = null;
var afMax = null;
var coverageMin = 10;



// feature matrix (ranked variants)
var featureVcfData = null;
var featureMatrix  = null;
var showClinVarSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(7,7)")
	         .append("use")
	         .attr("xlink:href", "#clinvar-symbol");
};
var showAfSymbol = function(selection) {
	selection.append("g")
	         .attr("class", selection.datum().clazz)
	         .attr("transform", "translate(7,7)")
	         .append("use")
	         .attr("xlink:href", "#af-symbol")
	         .style("fill", function(d,i) {
	         	if (selection.datum().clazz == 'af_notpresent') {
	         		return "rgb(217, 240, 163)";
	         	} else if (selection.datum().clazz == 'af_unique') {
	         		return "rgb(173, 221, 142)";
	         	} else if (selection.datum().clazz == 'af_rare') {
	         		return "rgb(65, 171, 93)";
	         	} else if (selection.datum().clazz == 'af_uncommon') {
	         		return "rgb(35, 132, 67)";
	         	} else if (selection.datum().clazz == 'af_common') {
	         		return "rgb(0, 104, 55)";
	         	}
	         })
	         .attr("width", function(d,i) {
	         	if (selection.datum().clazz == 'af_notpresent') {
	         		return "8";
	         	} else if (selection.datum().clazz == 'af_unique') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'af_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'af_common') {
	         		return "20";
	         	}
	         })
	         .attr("height", function(d,i) {
	         	if (selection.datum().clazz == 'af_notpresent') {
	         		return "8";
	         	} else if (selection.datum().clazz == 'af_unique') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'af_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'af_common') {
	         		return "20";
	         	}
	         });
};
var showRecessiveSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(0,3)")
	         .append("use")
	         .attr("xlink:href", '#recessive-symbol');
};
var showDeNovoSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(0,3)")
	         .append("use")
	         .attr("xlink:href", '#denovo-symbol');
	
};
var showNoInheritSymbol = function (selection) {
	
};
var clinvarMap     = {  Y: {value: 1, clazz: 'clinvar', symbolFunction: showClinVarSymbol},
                        N: {value: 2, clazz: ''}
                     };
var impactMap      = {  HIGH:     {value: 1, clazz: 'impact_HIGH'},    
                        MODERATE: {value: 2, clazz: 'impact_MODERATE'},  
                        MODIFIER: {value: 3, clazz: 'impact_MODIFIER'},
                        LOW:      {value: 4, clazz: 'impact_LOW'}
                     };
var inheritanceMap = {  denovo:    {value: 1, clazz: 'denovo',    symbolFunction: showDeNovoSymbol},  
                        recessive: {value: 2, clazz: 'recessive', symbolFunction: showRecessiveSymbol},
                        none:      {value: 3, clazz: 'noinherit', symbolFunction: showNoInheritSymbol}
                     };
// For af range, value must be > min and <= max
var afMap          = [ {min: -3,   max: -1,  value: +1,  clazz: 'af_notpresent', symbolFunction: showAfSymbol},	
                       {min: -1,   max: +0,  value: +2,  clazz: 'af_unique',     symbolFunction: showAfSymbol},	
                       {min: +0,   max: +.1, value: +3,  clazz: 'af_rare',       symbolFunction: showAfSymbol},	
                       {min: +.1,  max: +.5, value: +4,  clazz: 'af_uncommon',   symbolFunction: showAfSymbol},	
                       {min: +.5,  max: +1,  value: +5,  clazz: 'af_commmon',    symbolFunction: showAfSymbol},	
                      ];


var matrixRows = [
	{name:'Impact'              ,order:0, index:0, match: 'exact', attribute: 'impact',      map: impactMap},
	{name:'ClinVar'             ,order:1, index:1, match: 'exact', attribute: 'clinvar',     map: clinvarMap },
	{name:'Inheritance'         ,order:2, index:2, match: 'exact', attribute: 'inheritance', map: inheritanceMap},
	{name:'AF (1000G)'          ,order:3, index:3, match: 'range', attribute: 'af1000G',     map: afMap},
	{name:'AF (ExAC)'           ,order:4, index:4, match: 'range', attribute: 'afExAC',      map: afMap}
];

var featureUnknown = 99;

var vcf1000G= null;
var vcfExAC = null;
var vcf1000GData = null;
var vcfExACData = null;
var vcf1000GUrl = "http://s3.amazonaws.com/vcf.files/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5.20130502.sites.vcf.gz";
var vcfExACUrl  = "http://s3.amazonaws.com/vcf.files/ExAC.r0.2.sites.vep.vcf.gz";


// Format the start and end positions with commas
var formatRegion = d3.format(",");

// variant card
var variantCards = [];

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
	init();
});


function init() {
	var me = this;

    $.material.init();

    $('#filter-panel').html(trackLegendTemplate());

	loadGeneWidget();
	$('#bloodhound .typeahead').focus();

	// listen for enter key on af amount input range
	$('#af-amount-start').on('keydown', function() {
		if(event.keyCode == 13) {
			filterVariants();
	    }
	});
	$('#af-amount-end').on('keydown', function() {
		if(event.keyCode == 13) {
			filterVariants();
	    }
	});
	// listen for enter key on min coverage
	$('#coverage-min').on('keydown', function() {
		if(event.keyCode == 13) {
			filterVariants();
	    }
	});

	
	
	// Create transcript chart
	transcriptChart = geneD3()
	    .width(1000)
	    .widthPercent("100%")
	    .heightPercent("100%")
	    .margin({top: 35, right: 4, bottom: 0, left: 4})
	    .showXAxis(true)
	    .showBrush(true)
	    .trackHeight(16)
	    .cdsHeight(12)
	    .showLabel(false)
	    .on("d3brush", function(brush) {
	    	if (!brush.empty()) {
				regionStart = d3.round(brush.extent()[0]);
				regionEnd   = d3.round(brush.extent()[1]);
				if (!selectedTranscript) {
					selectedTranscript = window.gene.transcripts.length > 0 ? window.gene.transcripts[0] : null;
				}
			} else {
				regionStart = window.gene.start;
				regionEnd   = window.gene.end;
			}

			variantCards.forEach(function(variantCard) {
		    	variantCard.onBrush(brush);
			});

		});	

    transcriptMenuChart = geneD3()
	    .width(600)
	    .margin({top: 5, right: 5, bottom: 5, left: 120})
	    .showXAxis(false)
	    .showBrush(false)
	    .trackHeight(12)
	    .cdsHeight(8)
	    .showLabel(true)
	    .on("d3selected", function(d) {
	    	window.selectedTranscript = d;
	    	showTranscripts();

			variantCards.forEach(function(variantCard) {
		    	variantCard.showBamDepth();
			});

	    });

	featureMatrix = featureMatrixD3()
					    .margin({top: 0, right: 4, bottom: 4, left: 24})
					    .cellSize(30)
					    .columnLabelHeight(90)
					    .rowLabelWidth(50)
					    .tooltipHTML(variantTooltipHTML)
					    .on('d3click', function(variant) {
					    	if (variantCards.length > 0) {
						    	variantCards[0].highlightVariants(d3.selectAll("#feature-matrix .col.current").data());
					    	}
					    })
					     .on('d3mouseover', function(variant) {
					    })
					    .on('d3mouseout', function() {
					    })
					    .on('d3rowup', function(i) {
					    	var column = null;
					    	var columnPrev = null;
					    	matrixRows.forEach(function(col) {
					    		if (col.order == i) {
					    			column = col;
					    		} else if (col.order == i - 1) {
					    			columnPrev = col;
					    		}
					    	});
					    	if (column && columnPrev) {
					    		column.order = column.order - 1;
					    		columnPrev.order = columnPrev.order + 1;
					    	}
					    	fillFeatureMatrix();
					    	
					    })
					    .on('d3rowdown', function(i) {
					    	var column = null;
					    	var columnNext = null;
					    	matrixRows.forEach(function(col) {
					    		if (col.order == i) {
					    			column = col;
					    		} else if (col.order == i + 1) {
					    			columnNext = col;
					    		}
					    	});
					    	if (column && columnNext) {
					    		column.order = column.order + 1;
					    		columnNext.order = columnNext.order - 1;
					    	}
					    	fillFeatureMatrix();

					    });

	// Initialize variant legend
	initFilterTrack();

	// Initialize transcript view buttons
	initTranscriptControls();

	initDataSourceDialog();

	// Autoload data specified in url
	loadUrlSources();	
}

function onCollapseTranscriptPanel() {
	transcriptCollapse = !transcriptCollapse;
	d3.select('#track-section').style("padding-top", transcriptCollapse ? transcriptPanelHeight + "px" : "89" + "px");

}

function initDataSourceDialog() {
	// listen for data sources open event
	$( "#datasource-dialog" ).on('shown.bs.modal', function (e) {
		initVariantCards();

  	});
}

function moveDataSourcesButton() {
	$('#add-datasource-button').css('display', 'none');
	$('#datasource-button').css('visibility', 'visible');
}

function loadUrlSources() {
	var gene = getUrlParameter('gene');
	if (gene != undefined) {
		// move data source button
		moveDataSourcesButton();
		// load gene
		$('#bloodhound .typeahead.tt-input').val(gene).trigger('typeahead:selected', {"name": gene, callback:function(){
				// run after gene has been loaded
				// initialize variant cards
				initVariantCards();
				var addVC = false;

				// load bam and vcf sources
				// get all bam and vcf url params in hash
				var bam = getUrlParameter(/bam*/);
				var vcf = getUrlParameter(/vcf*/);		
				// load all bams and vcfs that have a bam pair
				if (bam != undefined) {
					Object.keys(bam).forEach(function(name) {
						if (addVC) addVariantCard();
						else addVC = true;
						$('#bam-url-input').val(bam[name])
						onBamUrlEntered();

						// check if there is a corresponding vcf file
						var vcfName = 'vcf' + name.replace('bam','');
						if( vcf && vcf[vcfName] != undefined ) {
							$('#url-input').val(vcf[vcfName]);
							delete vcf[vcfName];
							onVcfUrlEntered();
						}
											
						// load 
						loadDataSources();
					})
				}		
				// load vcfs that don't have a bam pair
				if (vcf != undefined) {
					Object.keys(vcf).forEach(function(name) {
						if (addVC) addVariantCard();
						else addVC = true;
						$('#url-input').val(vcf[name]);
						loadDataSources();
					});
				}
			}
		});		
	}
}

function selectVariantCard(cardIndex) {
	$('#datasource-dialog #card-index').val(+cardIndex);
	initDataSourceFields();

}

function initVariantCards() {
	if (variantCards.length == 0) {
		addVariantCard();
		$('#datasource-dialog #card-index').val(0);

	} else {
		$('#variant-card-buttons').removeClass("hide");
	}
	
	initDataSourceFields();
}

function initDataSourceFields() {
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];


	if (variantCard.getBamName().indexOf("http") == 0) {
		$('#datasource-dialog #bam-file-info').addClass("hide");
		$('#datasource-dialog #bam-url-input').removeClass("hide");
		$('#datasource-dialog #bam-url-input').val(variantCard.getBamName());
	} else {
		$('#datasource-dialog #bam-url-input').addClass("hide");
		$('#datasource-dialog #bam-file-info').removeClass("hide");
		$('#datasource-dialog #bam-file-info').val(variantCard.getBamName());
	}

	if (variantCard.getVcfName().indexOf("http") == 0) {
		$('#datasource-dialog #vcf-file-info').addClass("hide");
		$('#datasource-dialog #url-input').removeClass("hide");
		$('#datasource-dialog #url-input').val(variantCard.getVcfName());
	} else {
		$('#datasource-dialog #url-input').addClass("hide");
		$('#datasource-dialog #vcf-file-info').removeClass("hide");
		$('#datasource-dialog #vcf-file-info').val(variantCard.getVcfName());
	}	
	$('#datasource-dialog #datasource-name').val(variantCard.getName());
	var rel = variantCard.getRelationship();	
	$('.material-dropdown li[value="' + rel + '"]').click();	
}

function initTranscriptControls() {

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
	d3.selectAll("#gene-viz .transcript").remove();
 	selectedTranscript = transcriptMenuChart.selectedTranscript();
 	loadTracksForGene();
}


function clearFilters() {
	clickedAnnotIds = [];
	annotsToInclude = [];
	d3.selectAll('#filter-track .impact').classed('current', false);
	d3.selectAll('#filter-track .effect').classed('current', false);
	d3.selectAll('#filter-track .type').classed('current', false);
	d3.selectAll('#filter-track .zygosity').classed('current', false);
	$('af-amount-start').val(0);
	$('af-amount-end').val(100);
	$('coverage-min').val('');
}


function initFilterTrack() {


	d3.selectAll(".type, .impact, .effectCategory, .zygosity")
	  .on("mouseover", function(d) {  	  	
		var id = d3.select(this).attr("id");

		d3.selectAll(".variant")
		   .style("opacity", .1);

	    d3.selectAll(".variant")
	      .filter( function(d,i) {
	      	var theClasses = d3.select(this).attr("class");
	    	if (theClasses.indexOf(id) >= 0) {
	    		return true;
	    	} else {
	    		return false;
	    	}
	      })
	      .style("opacity", 1);
	  })
	  .on("mouseout", function(d) {
	  	d3.selectAll(".variant")
		   .style("opacity", 1);
	  })
	  .on("click", function(d) {
	  	var on = null;
	  	if (d3.select(this).attr("class").indexOf("current") >= 0) {
	  		on = false;
	  	} else {
	  		on = true;
	  	}
	  	var schemeClass = d3.select(this).attr("class");
	  	// strip out extraneous 'no color' and 'current' class
	  	// so that we are left with the attribute name of the
	  	// annotation we will be filtering on.
	  	if (schemeClass.indexOf('nocolor') >= 0) {
	  		var tokens = schemeClass.split(' ');
	  		tokens.forEach(function(clazz) {
	  			if (clazz != 'nocolor') {
	  				schemeClass = clazz;
	  			}
	  		})
	  	}
	  	if (schemeClass.indexOf('current') >= 0) {
	  		var tokens = schemeClass.split(' ');
	  		tokens.forEach(function(clazz) {
	  			if (clazz != 'current') {
	  				schemeClass = clazz;
	  			}
	  		})
	  	}


	  	// Remove from or add to list of clicked ids
	  	window.clickedAnnotIds[d3.select(this).attr("id")] = on;
	  	window.annotsToInclude[d3.select(this).attr("id")] = {'key':   schemeClass , 
	  														  'value': d3.select(this).attr("id"),  
	  														  'state': on};

	  	d3.select(this).classed("current", on);
	  	filterVariants();
	  });

	  d3.selectAll('#impact-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", true);
	    	d3.select('#effect-scheme' ).classed("current", false);

	    	d3.selectAll(".impact").classed("nocolor", false);
	    	d3.selectAll(".effectCategory").classed("nocolor", true);

			variantCards.forEach(function(variantCard) {
				variantCard.variantClass(classifyByImpact);
		    	if (variantCard.getCardIndex() == 0) {
			  		var filteredVcfData = variantCard.filterVariants();
			  		variantCard.fillVariantChart(filteredVcfData, regionStart, regionEnd);
				}

			});


	    });
	  d3.selectAll('#effect-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme' ).classed("current", true);


	    	d3.selectAll(".impact").classed("nocolor", true);
	    	d3.selectAll(".effectCategory").classed("nocolor", false);

			variantCards.forEach(function(variantCard) {
		    	variantCard.variantClass(classifyByEffect);
		    	if (variantCard.getCardIndex() == 0) {
			  		var filteredVcfData = variantCard.filterVariants();
			  		variantCard.fillVariantChart(filteredVcfData, regionStart, regionEnd);
				}
			});


	    });
	  
}

function filterVariants() {
	if (variantCards.length > 0) {
  		var filteredVcfData = variantCards[0].filterVariants();
  		variantCards[0].fillVariantChart(filteredVcfData, regionStart, regionEnd);
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

function classifyByImpact(d) {
	var impacts = "";
	var colorimpacts = "";
	var effects = "";
	
	for (key in d.impact) {
	  impacts += " " + key;
	  colorimpacts += " " + 'impact_'+key;
	}
	for (key in d.effectCategory) {
	  effects += " " + key;
	}
	
	return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + impacts + effects + ' ' + d.consensus + ' ' + colorimpacts; 
}
function classifyByEffect(d) { 
	var effects = "";
	var coloreffects = "";
	var impacts = "";
	
    for (key in d.effectCategory) {
      effects += " " + key;
      coloreffects += " " + 'effect_'+key;
    }
    for (key in d.impact) {
      impacts += " " + key;
    }
    
    return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + effects + impacts + ' ' + d.consensus + ' ' + coloreffects; 
}

function applyVariantFilters() {

	// Find out if there are any filters set
  	var filtersApply = false;
  	for (key in clickedAnnotIds) {
		var on = clickedAnnotIds[key];
		if (on ) {
			filtersApply = true;
		}
	}

	// If there existing filters set, take
	// opacity of previous hover down to .1
	if (filtersApply) {

	  	d3.selectAll(".variant")
	  	   .filter( function(d,i) {
	    	var theClasses = d3.select(this).attr("class");
	    	var theParentClasses = d3.select(this.parentNode).attr("class");
	    	
	    	var aClickedId = false;
    		if (theParentClasses.indexOf("impact" ) >= 0 
    			|| theParentClasses.indexOf("effect") >= 0 
    			|| theParentClasses.indexOf("zygosity") >= 0 ) {
    			return false;
    		} else {
		    	for (key in clickedAnnotIds) {
	    			var on = clickedAnnotIds[key];
	    			if (on && theClasses.indexOf(key) >= 0) {
	    				aClickedId = true;
	    			}
	    		}
	    		if (aClickedId) {
	    			false
	    		} else {
		    		return true;
	    		}
    		}
	      })
	      .style("opacity", .1);
	     

	// Otherwise, if no filters exist, everything
	// is set back to opacity of 1.
	} else {
    	d3.selectAll(".variant").style("opacity", 1);
	}
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
		    	// set all searches to correct gene	
		    	$('.typeahead.tt-input').val(window.gene.gene_name);
		    	moveDataSourcesButton();
		    	
		    	window.selectedTranscript = null;
		    	loadTracksForGene();
		    	// add gene to url params
		    	updateUrl('gene', window.gene.gene_name);
		    	if(data.callback != undefined) data.callback();

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
function loadTracksForGene() {

	regionStart = null;
	regionEnd = null;
	window.vcf1000GData = null;
	window.vcfExACData = null;

	$('#transcript-card').removeClass("hide");

    $('#gene-track').removeClass("hide");
    $('#view-finder-track').removeClass("hide");
	$('#datasource-button').css("visibility", "visible");
	$('#transcript-btn-group').removeClass("hide");

	d3.select("#region-chart .x.axis .tick text").style("text-anchor", "start");
	var h = d3.select("#nav-section").node().offsetHeight;
	d3.select('#track-section').style("padding-top", h + "px");


	d3.select('#impact-scheme').classed("current", true);
	d3.select('#effect-scheme' ).classed("current", false);
	d3.selectAll(".impact").classed("nocolor", false);
	d3.selectAll(".effectCategory").classed("nocolor", true);
	
	gene.regionStart = formatRegion(window.gene.start);
	gene.regionEnd   = formatRegion(window.gene.end);

    $('#gene-name').text(window.gene.chr);   
    $('#gene-region-info').text(window.gene.regionStart + "-" + window.gene.regionEnd);


   	// This will be the view finder, allowing the user to select
	// a subregion of the gene to zoom in on the tracks.
	// ??????  TODO:  Need to figure out the cannonical transcript.	
	var transcript = [];
	if (window.gene.transcripts && window.gene.transcripts.length > 0 ) {
		transcript = window.gene.transcripts[0];
	}


	// Load the read coverage and variant charts.  If a bam hasn't been
	// loaded, the read coverage chart and called variant charts are
	// not rendered.  If the vcf file hasn't been loaded, the vcf variant
	// chart is not rendered.
	showTranscripts();
	
	variantCards.forEach(function(variantCard) {
		variantCard.loadTracksForGene(classifyByImpact);
	});

	transcriptPanelHeight = d3.select("#nav-section").node().offsetHeight;


	
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
			selectedTranscript = transcripts.length > 0 ? transcripts[0] : null;
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

	$('#variant-cards').append(variantCardTemplate());  
	var variantCard = new VariantCard();
	variantCards.push(variantCard);	

	var cardIndex = variantCards.length - 1;
	var defaultName = "sample " + (+cardIndex + 1);
	variantCard.setName(defaultName);

	var cardSelectorString = "#variant-cards .variant-card:eq(" + cardIndex + ")" ;
	variantCard.init($(cardSelectorString), cardIndex);


	$('#datasource-dialog #card-index').val(cardIndex);


	$('#datasource-dialog #datasource-name').val(defaultName);
	$('.material-dropdown li[value="none"]').click();	
	$('#datasource-dialog #bam-file-info').addClass("hide");
	$('#datasource-dialog #bam-url-input').addClass("hide");
	$('#datasource-dialog #vcf-file-info').addClass("hide");
	$('#datasource-dialog #url-input').addClass("hide");
	$('#datasource-dialog #bam-file-info').val("");
	$('#datasource-dialog #bam-url-input').val("");
	$('#datasource-dialog #vcf-file-info').val("");
	$('#datasource-dialog #url-input').val("");

	$('#datasource-dialog #bam-file-upload').val("");
	$('#datasource-dialog #vcf-file-upload').val("");
	


    $('#variant-card-buttons')
         .append($("<a></a>")
         .attr("id", "variant-card-button-" + cardIndex)
         .attr("href", "javascript:void(0)")
         .attr("onclick", 'selectVariantCard("'+ cardIndex + '")')
         .attr("class", "btn btn-default")
         .text(defaultName));


}


function onBamFileButtonClicked() {	
	$('#datasource-dialog #bam-file-info').removeClass("hide");

	$('#bam-url-input').addClass('hide');
	$('#bam-url-input').val('');
}

function onBamFilesSelected(event) {
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];
	variantCard.onBamFilesSelected(event);
	variantCard.setDirty();
}


function onBamUrlEntered() {
	$('#bam-url-input').removeClass("hide");

	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];
	variantCard.onBamUrlEntered($('#bam-url-input').val());	
	updateUrl('bam' + cardIndex, $('#bam-url-input').val());
	variantCard.setDirty();
}

function displayBamUrlBox() {
	$('#bam-file-info').addClass('hide');
    $('#bam-file-info').val('');
    $('#datasource-dialog #bam-url-input').removeClass("hide");
    $("#datasource-dialog #bam-url-input").focus();
    $('#datasource-dialog #bam-url-input').val('http://s3.amazonaws.com/1000genomes/data/HG04141/alignment/HG04141.mapped.ILLUMINA.bwa.BEB.low_coverage.20130415.bam');
    onBamUrlEntered();
	

}

function displayUrlBox() {
    $('#url-input').val('http://s3.amazonaws.com/vcf.files/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5.20130502.sites.vcf.gz');
	$("#url-input").removeClass('hide');
    $("#url-input").focus();
    $('#datasource-dialog #vcf-file-info').addClass('hide');
    $('#datasource-dialog #vcf-file-info').val('');
    onVcfUrlEntered();
}
function onVcfFileButtonClicked() {	
	$('#datasource-dialog #vcf-file-info').removeClass("hide");

	$('#url-input').addClass('hide');
	$('#url-input').val('');
}

function onVcfFilesSelected(event) {
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];
	variantCard.onVcfFilesSelected(event);
	variantCard.setDirty();
}

function onVcfUrlEntered() {
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];

	var vcfUrl = $('#url-input').val();

	variantCard.onVcfUrlEntered(vcfUrl);
	updateUrl('vcf'+cardIndex, vcfUrl);
	variantCard.setDirty();
}


function setDataSourceName() {	
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];

	var dsName = $('#datasource-name').val();
	variantCard.setName(dsName);
	$('#variant-card-button-' + cardIndex ).text(dsName);

}

function setDataSourceRelationship() {		
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];

	var dsRelationship = $('#datasource-relationship').val();
	variantCard.setRelationship(dsRelationship);	
}

function loadNewDataSources() {
	// check if gene is selected
	if(window.gene && window.gene != "") {
		$('#datasource-dialog').modal('hide');
		loadDataSources();	
		// set search box back to no border
		$('#datasource-dialog .twitter-typeahead').css('border', 'none');		
	}
	else {
		$('#datasource-dialog .twitter-typeahead').css('border', '1px solid red');
	}
	
}

function loadDataSources() {	
	// hide add data button
	$('#add-datasource-container').css('display', 'none');

	variantCards.forEach( function(variantCard) {
		if (variantCard.isDirty()) {
			variantCard.loadDataSources(variantCard.getName());
			variantCard.setDirty(false);
		}
	});


}

function showFeatureMatrix(theVariantCard, theVcfData, regionStart, regionEnd) {

	$("#matrix-track .loader").css("display", "block");
	$("#matrix-track .loader-label").text("Analyzing Variants");
	$("#feature-matrix").addClass("hide");

	_getPopulationVariants(theVariantCard, theVcfData, regionStart, regionEnd, fillFeatureMatrix);	
}

function _getPopulationVariants(theVariantCard, theVcfData, regionStart, regionEnd, callback) {
	if (window.vcf1000GData && window.vcfExACData) {
		var filteredVcf1000GData = {};
		var filteredVcfExACData = {};
		filteredVcf1000GData.features = window.vcf1000GData.features.filter(function(variant) {
			return variant.start >= regionStart && variant.end <= regionEnd;
		});
		filteredVcfExACData.features = window.vcfExACData.features.filter(function(variant) {
			return variant.start >= regionStart && variant.end <= regionEnd;
		});
		compareVariantsToPopulation(theVcfData, filteredVcf1000GData, filteredVcfExACData, callback);

	} else {
		vcf1000G = vcfiobio();
		vcf1000G.openVcfUrl(this.vcf1000GUrl);
		var refName = theVariantCard.getVcfRefName(window.gene.chr);
		vcf1000G.getVariants(refName, 
							   window.gene.start, 
					           window.gene.end, 
					           window.gene.strand, 
					           window.selectedTranscript,
					           0,
					           1,
					           function(data) {
	        window.vcf1000GData = data;
	        window.vcf1000GData.features = window.vcf1000GData.features.sort(orderVariantsByPosition);

			vcfExAC= vcfiobio();
			vcfExAC.openVcfUrl(window.vcfExACUrl);
			vcfExAC.getVariants(refName, 
									   window.gene.start, 
							           window.gene.end, 
							           window.gene.strand, 
							           window.selectedTranscript,
							           0,
							           1,
							           function(data) {
			    window.vcfExACData = data;
			    window.vcfExACData.features = window.vcfExACData.features.sort(orderVariantsByPosition);

			    compareVariantsToPopulation(theVcfData, window.vcf1000GData, window.vcfExACData, callback);
			});

	    });
	}




}

function orderVariantsByPosition(a, b) {
	var altRefA = a.alt + "->" + a.ref;
	var altRefB = b.alt + "->" + b.ref;

	if (a.start == b.start) {
		if (altRefA == altRefB) {
			return 0;
		} else if ( altRefA < altRefB ) {
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


function compareVariantsToPopulation(theVcfData, theVcf1000GData, theVcfExACData, callback) {
	theVcfData.features.forEach(function(variant) {
		variant.compare1000G = null;
		variant.compareExAC = null;
		variant.af1000G = -1;
		variant.afExAC= -1;
	});
	theVcf1000GData.features.forEach(function(variant) {
		variant.compare1000G = null;
		variant.compareExAC = null;
	});
	theVcfExACData.features.forEach(function(variant) {
		variant.compare1000G = null;
		variant.compareExAC = null;
	});
	theVcfData.features = theVcfData.features.sort(orderVariantsByPosition);

    window.vcf1000G.compareVcfRecords(theVcfData, theVcf1000GData, 
    	// This is the function that is called after all the variants have been compared
    	// to the 1000G variant set.  In this case, we now move on to comparing the
    	// proband variant set to the ExAC variant set.
    	function() {
	        window.vcfExAC.compareVcfRecords(theVcfData, theVcfExACData, 
	        	// This is the function that is called after the variants have been compared
	        	// to the ExAC population variant set. In this case, we have performed
	        	// all comparisons (1000G in outer function and ExAc in this function), so we 
	        	// can move on to building the feature matrix.
	        	function(){
		        	callback(theVcfData);
		        }, 
		        // This is the attribute on variant a (proband) and variant b (ExAC)
		        // that will store whether the variant is unique or matches.
		        'compareExAC',
		    	// This is the callback function called every time we find the same variant
		    	// in both sets. Here we take the ExAC variant's af and store it in the
		    	// proband's variant for further sorting/display in the feature matrix.
		        function(variantA, variantB) {
		        	variantA.afExAC = variantB.af;
		        	if (variantA.afExAC == null || variantA.afExAC == '') {
		        		variantA.afExAC = 0;
		        	}
		        });
    	}, 
    	// This is the attribute on variant a (proband) and variant b (1000G)
		// that will store whether the variant is unique or matches.
    	'compare1000G',
    	// This is the callback function called every time we find the same variant
    	// in both sets. Here we take the 1000G variant's af and store it in the
    	// proband's variant for further sorting/display in the feature matrix.
    	function(variantA, variantB) {
    		variantA.af1000G = variantB.af;
				if (variantA.af1000G == null || variantA.af1000G == '') {
	        		variantA.af1000G = 0;
	        	}

    	});

}


function fillFeatureMatrix(theVcfData) {
	if (theVcfData != null) {
		featureVcfData = {};
		featureVcfData.features = [];
		theVcfData.features.forEach(function(variant) {
			featureVcfData.features.push($.extend({}, variant));
		});
	}

	// Sort the matrix columns
	matrixRows = matrixRows.sort(function(a, b) {
		if (a.order == b.order) {
			return 0;
		} else if (a.order < b.order) {
			return -1;
		} else {
			return 1;
		}
	});
	
	// Fill all features used in feature matrix for each variant
	featureVcfData.features.forEach( function(variant) {
		var features = [];
		for (var i = 0; i < matrixRows.length; i++) {
			features.push(null);
		}

		matrixRows.forEach( function(matrixRow) {
			var rawValue = variant[matrixRow.attribute];
			var theValue    = null;
			var mappedValue = null;
			var mappedClazz = null;
			var symbolFunction = null;
			// Fake the clinvar, inheritance data for now
			if (matrixRow.attribute == 'clinvar') {
				rawValue = Math.random() > .5 ? 'Y' : 'N';
			} else if (matrixRow.attribute == 'inheritance') {
				if (Math.random() > .5) {
					rawValue = 'recessive';
				} else  {
					rawValue = 'denovo';
				} 
			}
			if (rawValue != null) {
				if (matrixRow.match == 'exact') {
					// We are going to get the mapped value through exact match,
					// so this will involve a simple associative array lookup.
					// Some features (like impact) are multi-value and are stored in a
					// an associative array.  In this case, we loop through the feature
					// values, keeping the lowest (more important) mapped value.
					if (isDictionary(rawValue)) {
						// Iterate through the objects in the associative array.
						// Keep the lowest mapped value
						for (val in rawValue) {
							var entry = matrixRow.map[val];
							if (entry != null && (mappedValue == null || entry.value < mappedValue)) {
								mappedValue = entry.value;
								mappedClazz = entry.clazz;
								symbolFunction = entry.symbolFunction;
								theValue = val;
							}
						}
					} else {
						mappedValue = matrixRow.map[rawValue].value;
						mappedClazz = matrixRow.map[rawValue].clazz;
						symbolFunction = matrixRow.map[rawValue].symbolFunction;
						theValue = rawValue;

					}
				} else if (matrixRow.match == 'range') {
					// If this feature is a range, get the mapped value be testing if the
					// value is within a min-max range.
					if (isNumeric(rawValue)) {
						theValue = d3.format(",.3%")(+rawValue);
						matrixRow.map.forEach( function(rangeEntry) {
							if (+rawValue > rangeEntry.min && +rawValue <= rangeEntry.max) {
								mappedValue = rangeEntry.value;
								mappedClazz = rangeEntry.clazz;
								symbolFunction = rangeEntry.symbolFunction;
							}
						});
					}
				}

			} else {
				rawValue = '';
				mappedClazz = '';
			}
			features[matrixRow.order] = { 
				                    'value': theValue, 
				                    'rank': (mappedValue ? mappedValue : featureUnknown), 
				                    'clazz': mappedClazz,
				                    'symbolFunction': symbolFunction
				                  };
		});

		variant.features = features;
	});
	// Sort the variants by the criteria that matches
	var sortedFeatures = featureVcfData.features.sort(function (a, b) {
	  var featuresA = "";
	  var featuresB = "";
	  
	  // The features have been initialized in the same order as
	  // the matrix column order. In each interation,
	  // exit with -1 or 1 if we have non-matching values;
	  // otherwise, go to next iteration.  After iterating
	  // through every column, if we haven't exited the
	  // loop, that means all features of a and b match
	  // so return 0;
	  for (var i = 0; i < matrixRows.length; i++) {
	  	if (a.features[i].rank < b.features[i].rank) {
	  		return -1;
	  	} else if (a.features[i].rank > b.features[i].rank) {
			return 1;
		} else {
		}
	  }
	  return 0;
	});

	// Get the top 30 variants
	var topFeatures = sortedFeatures.slice(0, 30);
	
	$("#feature-matrix").removeClass("hide");
	$("#matrix-track .loader").css("display", "none");

	// Load the chart with the new data
	featureMatrix.matrixRows(matrixRows);
	var selection = d3.select("#feature-matrix").data([topFeatures]);  

    this.featureMatrix(selection);
		
}

function variantTooltipHTML(variant, rowIndex) {

	var effectDisplay = "";
	for (var key in variant.effect) {
	if (effectDisplay.length > 0) {
	  	effectDisplay += ", ";
	}
		effectDisplay += key;
	}    
	var impactDisplay = "";
	for (var key in variant.impact) {
	if (impactDisplay.length > 0) {
	  	impactDisplay += ", ";
	}
		impactDisplay += key;
	}   
	var coord = variant.start + (variant.end > variant.start+1 ?  ' - ' + variant.end : "");
	var refalt = variant.ref + "->" + variant.alt;
	return (
		  tooltipRowNoLabel(variant.type + ' ' + coord + ' ' + refalt)
		+ tooltipRow('Impact', impactDisplay)
		+ tooltipRow('Effect', effectDisplay)
		+ tooltipRow('ClinVar', variant.clinvar )
		+ tooltipRow('Qual', variant.qual) 
		+ tooltipRow('Filter', variant.filter) 
		+ tooltipRow('Depth', variant.combinedDepth + ' (combined)') 
		+ tooltipRow('Zygosity', variant.zygosity)
		+ tooltipRow('Inheritance',  variant.inheritance)
		+ tooltipRow('AF', variant.af) 
		+ tooltipRow('&nbsp;1000G', variant.af1000G != -1 ? variant.af1000G : 'not present')
		+ tooltipRow('&nbsp;ExAC',  variant.afExAC  != -1 ? variant.afExAC  : 'not present')
	);                    

}

function tooltipRow(label, value) {
	if (value && value != '') {
		return '<div class="row">'
		      + '<div class="col-md-4">' + label + '</div>'
		      + '<div class="col-md-8">' + value + '</div>'
		      + '</div>';
	} else {
		return "";
	}
}
function tooltipRowNoLabel(value) {
	if (value && value != '') {
		return '<div class="row" style="text-align:center">'
		      + '<div class="col-md-12">' + value + '</div>'
		      + '</div>';
	} else {
		return "";
	}
}



function cullVariantFilters() {

	d3.selectAll(".impact").each( function(d,i) {
		var impact = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + impact)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".type").each( function(d,i) {
		var type = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + type)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".zygosity").each( function(d,i) {
		var zygosity = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + zygosity)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".effectCategory").each( function(d,i) {
		var effect = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + effect)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});

	// First, move all elements out of the 'more' section
	$('#effect-filter-box #more-effect svg').each(function() {
    	$(this).insertBefore($('#effect-filter-box #more-effect-link'));
    });
    // Now move only inactive elements into the 'more section'
    $('#effect-filter-box .inactive').each(function() {
    	$(this).prependTo($('#effect-filter-box #more-effect'));
    });
    // If we have more that 6 active elements, keep the
    // first 6 where they are and move the remaining to the 
    // 'more' section.  If we 6 or less active elements,
    // just hide the 'more' link.
    var allCount = d3.selectAll("#effect-filter-box .effectCategory")[0].length;
    var inactiveCount = d3.selectAll("#effect-filter-box .effectCategory.inactive")[0].length;
    var activeCount = allCount - inactiveCount;
    if (activeCount >= 4) {
    	$('#effect-filter-box #more-effect-link').removeClass('hide');
    	// Keep six active elements where they are.  The remainder should go in the 
    	// 'more' section
    	var activeElements = $('#effect-filter-box > .effectCategory');
    	for (var i = 4; i < activeCount; i++) {
    		var activeElement = activeElements[i];
    		$('#effect-filter-box #more-effect').append($(activeElement));
    	}

    } else {
    	$('#effect-filter-box #more-effect-link').addClass('hide');

    }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isDictionary(obj) {
  if(!obj) {
  	return false;
  } 
  if(Array.isArray(obj)) {
  	return false;
  }
  if (obj.constructor != Object) {
  	return false;
  }
  return true;
}






 