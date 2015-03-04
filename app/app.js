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

var featureMatrix = null;
var matrixColumns = [
	'High impact',
	'Sufficient coverage',
	'Called in realtime by Freebayes',
	'Variant not present in unaffected',
	'Hom proband, het parent(s)',
	'Not in 1000G',
	'Not in ExAC'
];

var vcf1000GData = null;
var vcfExACData = null;
var vcf1000GUrl = "http://s3.amazonaws.com/vcf.files/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5.20130502.sites.vcf.gz";
var vcfExACUrl  = "http://s3.amazonaws.com/vcf.files/ExAC.r0.2.sites.vep.vcf.gz";

var depthThreshold = 4;


// Filters
this.clickedAnnotIds = new Object();

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

// Format the start and end positions with commas
var formatRegion = d3.format(",");


// variant card
var variantCards = [];



$(document).ready(function(){
	init();
});


function init() {
	var me = this;

    $.material.init();

    $('#filter-panel').html(trackLegendTemplate());

	loadGeneWidget();
	$('#bloodhound .typeahead').focus();
	
	
	// Create transcript chart
	transcriptChart = geneD3()
	    .width(1000)
	    .widthPercent("100%")
	    .heightPercent("100%")
	    .margin({top: 20, right: 4, bottom: 0, left: 4})
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
		    	variantCard.onD3Brush(brush);
			});

			transcriptPanelHeight = d3.select("#nav-section").node().offsetHeight;
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
					    .cellSize(20)
					    .columnLabelHeight(90)
					    .rowLabelWidth(160)
					    .tooltipHTML(variantTooltipHTML)
					    .on('d3click', function(variant) {
					    	if (variantCards.length > 0) {
						    	variantCards[0].highlightVariant(variant);
					    	}
					    })
					     .on('d3mouseover', function(variant) {
					    	if (variantCards.length > 0) {
						    	variantCards[0].highlightVariant();
					    	}
					    })
					    .on('d3mouseout', function() {
					    	if (variantCards.length > 0) {
						    	variantCards[0].highlightVariant();
					    	}
					    });

	// Initialize variant legend
	initFilterTrack();

	// Initialize transcript view buttons
	initTranscriptControls();

	initDataSourceDialog();

	// Autoload data specified in url
	var gene = getUrlParameter('gene');
	if (gene != undefined) {
		// load gene
		$('#bloodhound .typeahead.tt-input').val(gene).trigger('typeahead:selected', {"name": gene});
		var bam = getUrlParameter('bam') || '';
		var vcf = getUrlParameter('vcf') || '';
		if (bam != '' || vcf != '') {
			initVariantCards();
			$('#bam-url-input').val(bam)							
			$('#url-input').val(vcf);			
			loadDataSources();
		}
	}

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



function initFilterTrack() {


	d3.selectAll(".type, .impact, .effect, .compare")
	  .on("mouseover", function(d) {  	  	
		var id = d3.select(this).attr("id");

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

	    d3.selectAll(".variant")
	      .filter( function(d,i) {
	    	var theClasses = d3.select(this).attr("class");
	    	var theParentClasses = d3.select(this.parentNode).attr("class");
	    	if (theParentClasses.indexOf("impact") >= 0 
	    		|| theParentClasses.indexOf("effect") >= 0
	    		|| theParentClasses.indexOf("compare") >= 0
	    		|| theParentClasses.indexOf("type") >= 0)  {
	    		return false;
	    	} else if (theClasses.indexOf(id) >= 0) {
	    		return false;
	    	} else {
	    		var aClickedId = false;
	    		for (key in clickedAnnotIds) {
	    			var on = clickedAnnotIds[key];
	    			if (on && theClasses.indexOf(key) >= 0) {
	    				aClickedId = true;
	    			}
	    		}
	    		if (aClickedId) {
	    			return false;

	    		} else {
		    		return true;
	    		}
	    	}
	      })
	      .style("opacity", .1);
		
	  })
	  .on("mouseout", function(d) {
	  	applyVariantFilters();
	  })
	  .on("click", function(d) {
	  	var on = null;
	  	if (d3.select(this).attr("class").indexOf("current") >= 0) {
	  		on = false;
	  	} else {
	  		on = true;
	  	}
	  	// Remove from or add to list of clicked ids
	  	window.clickedAnnotIds[d3.select(this).attr("id")] = on;

	  	d3.select(this).classed("current", on);
	  	applyVariantFilters();
	  });

	  d3.selectAll('#impact-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", true);
	    	d3.select('#effect-scheme' ).classed("current", false);

	    	d3.selectAll(".impact").classed("nocolor", false);
	    	d3.selectAll(".effect").classed("nocolor", true);

			variantCards.forEach(function(variantCard) {
				variantCard.classifyVariants(classifyByImpact, regionStart, regionEnd);
			});


	    });
	  d3.selectAll('#effect-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme' ).classed("current", true);


	    	d3.selectAll(".impact").classed("nocolor", true);
	    	d3.selectAll(".effect").classed("nocolor", false);

			variantCards.forEach(function(variantCard) {
		    	variantCard.classifyVariants(classifyByEffect, regionStart, regionEnd);
			});


	    });
	  
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
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
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
	
	return  'variant ' + d.type.toLowerCase() + impacts + effects + ' ' + d.consensus + ' ' + colorimpacts; 
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
    
    return  'variant ' + d.type.toLowerCase() + effects + impacts + ' ' + d.consensus + ' ' + coloreffects; 
}
function classifyByCompare(d) { 
	var effects = "";
	var impacts = "";
	
    for (key in d.effectCategory) {
      effects += " " + key;
    }
    for (key in d.impact) {
      impacts += " " + key;
    }
    
    return  'variant ' + d.type.toLowerCase() + effects + impacts + ' ' + d.consensus + ' ' + 'compare_' + d.consensus; 
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
    			|| theParentClasses.indexOf("effect ") >= 0 
    			|| theParentClasses.indexOf("compare ") >= 0 ) {
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
		    	window.selectedTranscript = null;
		    	loadTracksForGene();
		    	// add gene to url params
		    	updateUrl('gene', window.gene.gene_name);

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

	$('#transcript-card').removeClass("hide");
	transcriptPanelHeight = d3.select("#nav-section").node().offsetHeight;

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
	d3.selectAll(".effect").classed("nocolor", true);
	d3.selectAll(".compare").classed("nocolor", true);
	
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
	updateUrl('bam', $('#bam-url-input').val());
	variantCard.setDirty();
}

function displayBamUrlBox() {
	$('#bam-file-info').addClass('hide');
    $('#bam-file-info').val('');
    $('#datasource-dialog #bam-url-input').removeClass("hide");
    $("#datasource-dialog #bam-url-input").focus();
    $('#datasource-dialog #bam-url-input').val('http://s3.amazonaws.com/1000genomes/data/HG04141/alignment/HG04141.mapped.ILLUMINA.bwa.BEB.low_coverage.20130415.bam');
	

}

function displayUrlBox() {
    $('#url-input').val('http://s3.amazonaws.com/vcf.files/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5.20130502.sites.vcf.gz');
	$("#url-input").removeClass('hide');
    $("#url-input").focus();
    $('#datasource-dialog #vcf-file-info').addClass('hide');
    $('#datasource-dialog #vcf-file-info').val('');

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
	updateUrl('vcf', vcfUrl);
	variantCard.setDirty();
}


function setDataSourceName() {	
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];

	var dsName = $('#datasource-name').val();
	variantCard.setName(dsName);
	$('#variant-card-button-' + cardIndex ).text(dsName);

}


function loadDataSources() {	
	if ($('#bam-url-input').val() != '') {
		onBamUrlEntered();
	}
	if ($('#url-input').val() != '') {
		onVcfUrlEntered();
	}

	var dataSourceName = $('#datasource-name').val();

	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];


	variantCards.forEach( function(variantCard) {
		if (variantCard.isDirty()) {
			variantCard.loadDataSources(dataSourceName);
			variantCard.setDirty(false);
		}
	});


}

function showFeatureMatrix(theVariantCard, theVcfData) {

	$("#matrix-track .loader").css("display", "block");
	$("#matrix-track .loader-label").text("Analyzing Variants");
	$("#feature-matrix").addClass("hide");

	_getPopulationVariants(theVariantCard, theVcfData, fillFeatureMatrix);	
}

function _getPopulationVariants(theVariantCard, theVcfData, callback) {
	var me = this;
	if (window.vcf1000GData != null && window.vcfExACData != null) {
		callback(theVcfData);
	} else {
		var vcf1000G = vcfiobio();
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

	        vcf1000G.compareVcfRecords(theVcfData, window.vcf1000GData, function() {

			    var vcfExAC= vcfiobio();
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

			        vcfExAC.compareVcfRecords(theVcfData, window.vcfExACData, function(){
				        callback(theVcfData);
			        }, 'compareExAC' );
			    });


	        }, 'compare1000G' );

	    });



	}
}


function fillFeatureMatrix(vcfData) {

	
	// Fill all criteria array for each variant
	vcfData.features.forEach( function(variant) {
		var features = [0,0,0,0,0,0,0];

		// high impact
		for (var key in variant.impact) {
			if (key == 'HIGH') {
				features[0] = 1;
				break;
			} 
		}

		// adequate coverage
		if (variant.combinedDepth != null && variant.combinedDepth != '' && variant.combinedDepth >= depthThreshold) {
			features[1] = 1;
		}

		// unique freebayes call
		if (variant.consensus == 'unique2') {
			features[2] = 1;
		}

		// variant in proband, not present in unaffected relatives
		features[3] = 1;

		// hom variant in proband, het or non-existent in parents
		features[4] = 1;


		// variant not present in 1000 genomes
		features[5] = variant.compare1000G == 'unique1' ? 1 : 0;


		//variant not present in ExAC
		features[6] = variant.compareExAC == 'unique1' ? 1 : 0;

		variant.features = features;
	});
	// Sort the variants by the criteria that matches
	var sortedFeatures = vcfData.features.sort(function (a, b) {
	  var featuresA = a.features.join();
	  var featuresB = b.features.join();
	  if (featuresA < featuresB) {
	    return 1;
	  }
	  if (featuresA > featuresB) {
	    return -1;
	  }
	  // a must be equal to b
	  return 0;
	});
	// Get the top 50 variants
	//var topFeatures = sortedFeatures.splice(0, 50);
	var topFeatures = sortedFeatures;

	$("#feature-matrix").removeClass("hide");
	$("#matrix-track .loader").css("display", "none");

	// Load the chart with the new data
	featureMatrix.columnNames(matrixColumns);
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
	return (variant.type + ': ' 
	    	 	+ variant.start 
	    	 	+ (variant.end > variant.start+1 ?  ' - ' + variant.end : "")
	    	 	+ '<br>ref: ' + variant.ref 
				+ '<br>alt: ' + variant.alt
				+ '<br>effect: ' + effectDisplay
				+ '<br>impact: ' + impactDisplay 
				+ (variant.qual != '' ? ('<br>qual: ' +  variant.qual) : '') 
				+ (variant.filter != '.' ? ('<br>filter: ' + variant.filter) : '') 
				+ '<br>allele freq: ' + variant.af
				+ '<br>combined depth: ' + variant.combinedDepth 
				+ (variant.zygosity != null ? ('<br>zygosity: ' + variant.zygosity) : '')
	    	 );                    

}



function setVariantLegendCountsDEPRECATED() {
	variantCounts = new Object();

	// Count the number of variants for each impact.
	variantCounts.LOW = d3.selectAll("#vcf-variants .variant.LOW")[0].length;
	variantCounts.MODIFIER = d3.selectAll("#vcf-variants .variant.MODIFIER")[0].length;
	variantCounts.MODERATE = d3.selectAll("#vcf-variants .variant.MODERATE")[0].length;
	variantCounts.HIGH = d3.selectAll("#vcf-variants .variant.HIGH")[0].length;

/*
	if (d3.select("#impact-scheme").attr("class") == "current") {
		d3.selectAll(".impact").attr("class", function(d) {
			var theClasses = d3.select(this).attr("class");
			var baseClasses = "";
			if (theClasses.indexOf("current") >= 0) {
				baseClasses = "impact current";
			} else {
				baseClasses = "impact";
			}
			var impact = d3.select(this)[0][0].id;
			var count = variantCounts[impact];
			if (count == 0) {
				return baseClasses + " inactive";
			} else {
				return basesClasses;
			}
		});
	}
*/
	// TODO:  Need to do the same thing for effect.
}






 