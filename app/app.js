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
var variantCard = null;



$(document).ready(function(){
	init();
});


function init() {
	var me = this;

    $.material.init();

    $('#filter-panel').html(trackLegendTemplate());

	loadGeneWidget();
	$('#bloodhound .typeahead').focus();
	
	// Setup event handlers for File input
	$('#bam-file').on('change', onBamFilesSelected);
	$('#vcf-file').on('change', onVcfFilesSelected);	

	
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

	    	variantCard.onD3Brush(brush);

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

	    	variantCard.showBamDepth();
	    });

	// Initialize variant legend
	initFilterTrack();

	// Initialize transcript view buttons
	initTranscriptControls();

	// Init variant card
    $('#variant-cards').append(variantCardTemplate());    
	variantCard = new VariantCard();
	variantCard.init($( "#variant-cards #variant-card:eq(0)" ));
	
}

function onCollapseTranscriptPanel() {
	transcriptCollapse = !transcriptCollapse;
	d3.select('#track-section').style("padding-top", transcriptCollapse ? transcriptPanelHeight + "px" : "89" + "px");

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

	    	variantCard.classifyVariants(classifyByImpact, regionStart, regionEnd);

	    });
	  d3.selectAll('#effect-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme' ).classed("current", true);


	    	d3.selectAll(".impact").classed("nocolor", true);
	    	d3.selectAll(".effect").classed("nocolor", false);

	    	variantCard.classifyVariants(classifyByEffect, regionStart, regionEnd);

	    });
	  
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

	// Attach initialized event to it
	$('.typeahead').on('keyup', function(event) {
		if (event.keyCode == 13) {
			var val = $(this).typeahead('val').toUpperCase();
			$(this).typeahead('close');
			$(this).trigger('typeahead:selected', {"name": val});				
		}				

	})
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

	variantCard.loadTracksForGene(classifyByImpact);

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


}

function getTranscriptSelector(selectedTranscript) {
	var selector = '#transcript-menu-item #transcript_' + selectedTranscript.transcript_id.split(".").join("_");
	return $(selector);
}


function onBamFileButtonClicked() {	
	$('#bam-url-input').addClass('hide');
	$('#bam-url-input').val('');
}

function onBamFilesSelected(event) {
	variantCard.onBamFilesSelected(event);
}


function onBamUrlEntered() {
	$('#bam-url-input').removeClass("hide");
	variantCard.onBamUrlEntered($('#bam-url-input').val());
}

function displayBamUrlBox() {
	$('#bam-name').addClass("hide");
    $('#bam-depth').addClass("hide");
 
	$('#bam-file-info').addClass('hide');
    $('#bam-file-info').val('');

    $('#bam-url-input').removeClass("hide");
    $("#bam-url-input").focus();

}

function displayUrlBox() {
    $('#url-input').val('http://s3.amazonaws.com/vcf.files/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5.20130502.sites.vcf.gz');
	$("#url-input").removeClass('hide');
    $("#url-input").focus();
    $('#vcf-file-info').addClass('hide');
    $('#vcf-file-info').val('');

}
function onVcfFileButtonClicked() {	
	$('#url-input').addClass('hide');
	$('#url-input').val('');
}

function onVcfFilesSelected(event) {
	variantCard.onVcfFilesSelected(event);
}

function onVcfUrlEntered() {
	var vcfUrl = $('#url-input').val();
	variantCard.onVcfUrlEntered(vcfUrl);
}

function loadDataSources() {
	if ($('#bam-url-input').val() != '') {
		onBamUrlEntered();
	}
	if ($('#url-input').val() != '') {
		onVcfUrlEntered();
	}

	var dataSourceName = $('#datasource-name').val();


	variantCard.loadDataSources(dataSourceName);

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






 