//
// Global Variables
//
//var geneiobio_server = "http://localhost:3000/";
var geneiobio_server = "http://geneinfo.iobio.io/";

// bam iobio
var bam = null;
var getBamRefName = null;
var bamFileOpened = false;
var bamUrlEntered = false;

// vcf iobio
var vcf = null;
var getVcfRefName = null;
var vcfFileOpened = false;
var vcfUrlEntered= false;

// BAM and BAI file names
var bamFile = null;
var baiFile = null;


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


// bam data (read coverage) and area chart.
var bamData = null;
var bamDepthChart = null;

// VCF track 
var vcfChart = null;
var vcfData = null;
var vcfAfData = null;
var afChart = null;

// Freebayes (called) variants track
var fbChart = null;
var fbData = null;

var variantCounts = null;
var clickedAnnotIds = new Object();

var afMin = null;
var afMax = null;

// The colors for the variant stats bar chart
var statsColors = {
	'same':    '#5A7BB8',
	'unique':  '#F65C44',
	'missing': 'rgb(255, 255, 255, 0)'
};

// The smaller the region, the wider we can
// make the rect of each variant
var widthFactors = [
	{'regionStart':     0, 'regionEnd':    8000,  'factor': 6},
	{'regionStart':  8001, 'regionEnd':   10000,  'factor': 5},
	{'regionStart': 10001, 'regionEnd':   15000,  'factor': 4},
	{'regionStart': 15001, 'regionEnd':   20000,  'factor': 3},
	{'regionStart': 20001, 'regionEnd':   30000,  'factor': 2},
	{'regionStart': 30001, 'regionEnd': 9000000,  'factor': 1},
];

// Format the start and end positions with commas
var formatRegion = d3.format(",");


// Engine for gene search suggestions
var gene_engine = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  local: [],
  limit: 10
});

var trackLegendTemplate = Handlebars.compile($('#track-legend-template').html());	



$(document).ready(function(){
	init();
});


function init() {
	var me = this;

    $.material.init();

   $( '#sidebar' ).simpleSidebar({
    settings: {
        opener: '#menu-button',
        wrapper: '#container'
    },
    sidebar: {
        align: 'left',
        width: 120,
        closingLinks: '#menu-button',
        style: {
            zIndex: 100
        }
    },
    mask: {
        style: {
            backgroundColor: 'transparent',
            opacity: 0,
            filter: 'Alpha(opacity=0)'
        }
    }
});
  

    $('#filter-panel').html(trackLegendTemplate());
    $('#sidebar').html(trackLegendTemplate());

	loadGeneWidget();
	$('#bloodhound .typeahead').focus();
	
	// Setup event handlers for File input
	$('#bam-file').on('change', onBamFilesSelected);
	$('#vcf-file').on('change', onVcfFilesSelected);	

	// init vcf.iobio
	window.vcf = vcfiobio();


	
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

				$('#bam-track').css("margin-top", "-70px");

				if (!selectedTranscript) {
					selectedTranscript = window.gene.transcripts.length > 0 ? window.gene.transcripts[0] : null;
				}
			    
			    var selection = d3.select("#zoom-region-chart").datum([selectedTranscript]);
		  		zoomRegionChart.regionStart(regionStart);
				zoomRegionChart.regionEnd(regionEnd);
				zoomRegionChart(selection);
	       		d3.select("#zoom-region-chart .x.axis .tick text").style("text-anchor", "start");

				$('#zoom-region-chart').removeClass("hide");

			} else {
				// Treat a click as a region selection on the entire gene region.
				// That way, we won't recall the variants and re-read the bam and
				// vcf files, but instead just use the data already gathered for 
				// the entire gene region;
				regionStart = window.gene.start;
				regionEnd   = window.gene.end;

				$('#bam-track').css("margin-top", "-30px");
				
				$('#zoom-region-chart').addClass("hide");
	       		var h = d3.select("#nav-section").node().offsetHeight;
	       		d3.select('#track-section').style("padding-top", h + "px");
			}

       		//showTranscripts(regionStart, regionEnd);
			showBamDepth(regionStart, regionEnd);
			showVariants(regionStart, regionEnd);
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
	    	showBamDepth();
	    });



	// This is an x-axis for the selected region		    
	zoomRegionChart = geneD3()
			    .widthPercent("100%")
			    .heightPercent("100%")
			    .width(1000)
			    .margin({top: 10, right: 4, bottom: 0, left: 4})
			    .showXAxis(false)
			    .showBrush(false)
			    .trackHeight(12)
			    .cdsHeight(12)
	    		.showLabel(false);

	// Create the coverage chart
	bamDepthChart = lineD3()
	                    .width(1000)
	                    .height( 35 )
	                    .widthPercent("100%")
	                    .heightPercent("100%")
	                    .kind("area")
						.margin( {top: 10, right: 4, bottom: 20, left: 4} )
						.showXAxis(true)
						.showYAxis(false)
						.showTooltip(true)
						.pos( function(d) { return d[0] })
				   		.depth( function(d) { return d[1] });


	// Create the vcf track
	vcfChart = variantD3()
			    .width(1000)
			    .margin({top: 0, right: 4, bottom: 16, left: 4})
			    .showXAxis(true)
			    .variantHeight(6)
			    .verticalPadding(2)
			    .showBrush(false)
			    .on("d3rendered", function() {
			    	applyVariantFilters();
					
			    })			    
			    .on('d3tooltip', function(start) {
			    	if (bamData) {
						bamDepthChart.showCircle()(start);
			    	}
				})
				.on('d3notooltip', function(start) {
					if (bamData){
						bamDepthChart.hideCircle()();
					}
				});

 	// Create allele frequency chart
 	// Allele freq chart)
    afChart = histogramD3()
                       .width(400)
                       .height(70)
					   .margin( {left: 40, right: 0, top: 0, bottom: 20})
					   .xValue( function(d, i) { return d[0] })
					   .yValue( function(d, i) { return Math.log(d[1]) })
					   .yAxisLabel( "log(frequency)" );
					   
	afChart.formatXTick( function(d,i) {
		return (d * 2) + '%';
	});
	afChart.tooltipText( function(d, i) { 
		var value = vcfAfData[i][1];
		var lowerVal =  d[0]      * 2;
		var upperVal = (d[0] + 1) * 2;
		return  d3.round(value) + ' variants with ' + lowerVal + "-" + upperVal + '%' + ' AF ';
	});


	// Create the freebayes variant chart
	fbChart = variantD3()
			    .width(1000)
			    .margin({top: 0, right: 4, bottom: 20, left: 4})
			    .showXAxis(true)
			    .variantHeight(6)
			    .verticalPadding(2)
			    .showBrush(false)
			    .on("d3rendered", function() {
				   applyVariantFilters();
			    })
			    .on('d3tooltip', function(start) {
			    	if (bamData) {
						bamDepthChart.showCircle()(start);
			    	}
				})
				.on('d3notooltip', function(start) {
					if (bamData){
						bamDepthChart.hideCircle()();
					}
				});


	// Initialize variant legend
	initFilterTrack();

	// Initialize transcript view buttons
	initTranscriptControls();

	
	
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

function onAfEnter(ele) {
    if(event.keyCode == 13) {
        filterVariantsByAf(); 
    }
}

function filterVariantsByAf() {
	var me = this;

	var lowerVal = $('#af-amount-start').val() / 100;
	var upperVal = $('#af-amount-end').val() / 100;
	   
	var filteredFeatures = vcfData.features.filter(function(d) {
		return (d.af >= lowerVal && d.af <= upperVal);
	});

	var splitByZyg = vcfData.hetCount > 0 && vcfData.homCount > 0;

	maxLevel = me._pileupVariants(vcfChart, splitByZyg, filteredFeatures, 
		regionStart ? regionStart : window.gene.start, 
		regionEnd   ? regionEnd   : window.gene.end);		

	var vcfDataFiltered = {	count: vcfData.count,
							countMatch: vcfData.countMatch,
							countUnique: vcfData.countUnique,
							end: regionEnd,
							features: filteredFeatures,
							maxLevel: maxLevel + 1,
							name: vcfData.name,
							start: regionStart,
							strand: vcfData.strand,
							variantRegionStart: regionStart
						};

	me.fillVariantChart(vcfDataFiltered, regionStart, regionEnd);
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

	    	vcfChart.clazz(classifyByImpact);
	    	fbChart.clazz(classifyByImpact);

			if (vcfData) {
				fillVariantChart(vcfData, regionStart, regionEnd);
	    	} 
	    });
	  d3.selectAll('#effect-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme' ).classed("current", true);


	    	d3.selectAll(".impact").classed("nocolor", true);
	    	d3.selectAll(".effect").classed("nocolor", false);

	    	vcfChart.clazz(classifyByEffect);
	    	fbChart.clazz(classifyByEffect);

	    	if (vcfData) {
				fillVariantChart(vcfData, regionStart, regionEnd);
	    	} 
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
	vcfData = null;
	fbData = null;

	$('#transcript-card').removeClass("hide");
	transcriptPanelHeight = d3.select("#nav-section").node().offsetHeight;

    $('#gene-track').removeClass("hide");
	$('#view-finder-track').removeClass("hide");

	$('#add-vcf-track').css("visibility", "visible");

	$('#add-bam-track').css("visibility", "visible");


	$('#datasource-button').css("visibility", "visible");
	$('#transcript-btn-group').removeClass("hide");

	d3.select('#impact-scheme').classed("current", true);
	d3.select('#effect-scheme' ).classed("current", false);
	d3.selectAll(".impact").classed("nocolor", false);
	d3.selectAll(".effect").classed("nocolor", true);
	d3.selectAll(".compare").classed("nocolor", true);
	vcfChart.clazz(classifyByImpact);


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
	/*
	var selection = d3.select("#view-finder-chart").datum([transcript]);
	viewFinderChart.regionStart(+window.gene.start);
	viewFinderChart.regionEnd(+window.gene.end);
	viewFinderChart(selection);
	*/


	if (bam || vcf) {	       			
		selection = d3.select("#zoom-region-chart").datum([]);
		zoomRegionChart.regionStart(+window.gene.start);
		zoomRegionChart.regionEnd(+window.gene.end);
		zoomRegionChart(selection);
	}

	fbData = null;
	bamData = null;
	vcfData = null;

	// Load the read coverage and variant charts.  If a bam hasn't been
	// loaded, the read coverage chart and called variant charts are
	// not rendered.  If the vcf file hasn't been loaded, the vcf variant
	// chart is not rendered.
	showTranscripts();
	showBamDepth();
	showVariants();


	d3.select("#region-chart .x.axis .tick text").style("text-anchor", "start");

	var h = d3.select("#nav-section").node().offsetHeight;
	d3.select('#track-section').style("padding-top", h + "px");


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
	$("#bam-track .loader").css("display", "block");
	$("#bam-track .loader-label").text("Loading File")

	var me = this;
	window.bamFileOpened = true;
	if (event.target.files.length != 2) {
	   alert('must select both a .bam and .bai file');
	   return;
	}

	var fileType0 = /[^.]+$/.exec(event.target.files[0].name)[0];
	var fileType1 = /[^.]+$/.exec(event.target.files[1].name)[0];

	if (fileType0 == 'bam' && fileType1 == 'bai') {
	    bamFile = event.target.files[0];
	    baiFile = event.target.files[1];
	 } else if (fileType1 == 'bam' && fileType0 == 'bai') {
	    bamFile = event.target.files[1];
	    baiFile = event.target.files[0];
	 } else {
	    alert('must select both a .bam and .bai file');
	 }

	$('#bam-name').text(bamFile.name);
	$('#bam-file-info').removeClass('hide');
	$('#bam-file-info').val(bamFile.name);


	window.bam = new Bam( bamFile, { bai: baiFile });
	window.getBamRefName = null;
	window.bam.getReferencesWithReads(function(ref) {

		// Figure out if whe need to strip 'ch' or 'chr' from ref name to
		// match to bam reference names
		ref.forEach(function(ref) {
			if (getBamRefName == null) {
		 		if (ref.name == gene.chr) {
		 			window.getBamRefName = getRefName;
		 		} else if (ref.name == stripRefName(gene.chr)) {
		 			window.getBamRefName = stripRefName;
		 		}
			}
		});
	
	});
}


function onBamUrlEntered() {
	$("#bam-track .loader").css("display", "block");
	$("#bam-track .loader-label").text("Streaming File")

	$('#bam-url-input').removeClass("hide");
	var bamUrl = $('#bam-url-input').val();
	$('#bam-name').text(bamUrl);

    
    window.bam = new Bam(bamUrl);
    window.bamUrlEntered = true;
    window.getBamRefName = stripRefName;


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
	vcfFileOpened = true;

	$('#vcf-track').removeClass("hide");
	$('#vcf-variants').css("display", "none");
	$("#vcf-track .loader").css("display", "block");
	$('#vcf-track .loader-label').text("Loading File");


	window.vcf.openVcfFile( event, function(vcfFile) {

		$('#vcf-name').text(vcfFile.name);
		$('#vcf-file-info').removeClass('hide');
		$('#vcf-file-info').val(vcfFile.name);
		window.getVcfRefName = null;
		window.vcf.getReferenceNames(function(refNames) {

			// Figure out if whe need to strip 'ch' or 'chr' from ref name to
			// match to bam reference names
			refNames.forEach(function(refName) {				
				if (getVcfRefName == null) {
			 		if (refName == gene.chr) {
			 			window.getVcfRefName = getRefName;
			 		} else if (refName == stripRefName(gene.chr)) {
			 			window.getVcfRefName = stripRefName;
			 		}
				}
			});

		});


	});
	
	 
}

function onVcfUrlEntered() {
	$('#vcf-track').removeClass("hide");
	$('#vcf-variants').css("display", "none");
	$("#vcf-track .loader").css("display", "block");
	$('#vcf-track .loader-label').text("Streaming Variant Data");


	var vcfUrl = $('#url-input').val();
	$('#vcf-name').text(vcfUrl);


    
    window.vcf.openVcfUrl(vcfUrl);
    window.vcfUrlEntered = true;
    window.getVcfRefName = stripRefName;


}

function loadDataSources() {
	if ($('#bam-url-input').val() != '') {
		onBamUrlEntered();
	}
	if ($('#url-input').val() != '') {
		onVcfUrlEntered();
	}

	var dsName = $('#datasource-name').val();
	var cache = $('#variant-link').children();
   	$('#variant-link').text(dsName).append(cache);
   	$('#variant-link').attr("aria-expanded", true);
   	$('#variant-panel').attr("aria-expanded", true);
   	$('#variant-panel').addClass("in");


	// Show the read coverage 
	this.showBamDepth();


	if (regionStart && regionEnd) {
		this.showBamDepth(regionStart, regionEnd);
	}



    // Show the vcf variants.  
	this.showVariants();

	// If a sub-region of the gene was selected, 
	// show the read coverage and called variants
	// for the filtered region.  (Note: it is necessary
	// to first get the full data for read coverage and
	// the called variants so that subsequent selections
	// can just filter on the full data.)
	if (regionStart && regionEnd) {
		showVariants(regionStart, regionEnd);
	}
}


function getRefName(refName) {
	return refName;
}

function stripRefName(refName) {
	var tokens = refName.split("chr");
	var strippedName = refName;
	if (tokens.length > 1) {
		strippedName = tokens[1];
	} else {
		tokens = refName.split("ch");
		if (tokens.length > 1) {
			strippedName = tokens[1];
		}
	}
	return strippedName;
}

function showBamDepth(regionStart, regionEnd) {

	if (window.bam && window.bamUrlEntered) {

	} else if (window.bam == null || 
		(!window.bamFileOpened) ||
	    (window.bamFileOpened && window.getBamRefName == null)) {
		return;
	}

	$("#bam-track .loader").css("display", "block");

	$('#variant-card').removeClass("hide");
	$('#bam-track').removeClass("hide");
	$('#bam-depth').addClass("hide");
	$('#bam-name').addClass("hide");
	

	if (regionStart && regionEnd) {

		// The user has selected a region.  Filter the existing bam data
		// to return only records in the specified region.
		var filteredData = window.bamData.filter(function(d) { 
			return (d[0] >= regionStart && d[0] <= regionEnd);
		}); 
		
		fillBamChart(filteredData, regionStart, regionEnd);

	} else {

		// A gene has been selected.  Read the bam file to obtain
		// the read converage.
		var refName = window.getBamRefName(window.gene.chr);
	 	window.bam.getCoverageForRegion(refName, window.gene.start, window.gene.end, 
	 		1000, 
	 		function(data) {
				window.bamData = data;
				
				$("#bam-track .loader-label").text("Loading Chart")

				fillBamChart(window.bamData, window.gene.start, window.gene.end);
			});
	}




}

function fillBamChart(data, regionStart, regionEnd) {
	$("#bam-track .loader").css("display", "none");
    $('#bam-name').removeClass("hide");		
	$('#bam-depth').removeClass("hide");

	window.bamDepthChart.xStart(regionStart);
	window.bamDepthChart.xEnd(regionEnd);

	window.bamDepthChart(d3.select("#bam-depth").datum(data));		
	d3.select("#bam-depth .x.axis .tick text").style("text-anchor", "start");

	//callVariants(regionStart, regionEnd);
	
//	window.scrollTo(0,document.body.scrollHeight);
}

function showVariants(regionStart, regionEnd) {
	if (window.vcf && window.vcfUrlEntered) {

	} else if (window.vcf == null || 
		(!window.vcfFileOpened) ||
	    (window.vcfFileOpened && window.getVcfRefName == null)) {
		return;
	}

	$('#variant-card').removeClass("hide");
	$('#vcf-track').removeClass("hide");
	$('#vcf-variants').css("display", "none");
	$("#vcf-track .loader").css("display", "block");
	$('#vcf-name').addClass("hide");		




	if( regionStart && regionEnd) {

		// The user has selected a region to zoom into.  Filter the
		// variants based on the selected region
		var filteredFeatures = vcfData.features.filter(function(d) {
			return (d.start >= regionStart && d.start <= regionEnd);
		});

		var splitByZyg = vcfData.hetCount > 0 && vcfData.homCount > 0;

		maxLevel = _pileupVariants(vcfChart, splitByZyg, filteredFeatures, regionStart, regionEnd);		

		var vcfDataFiltered = {	count: vcfData.count,
								countMatch: vcfData.countMatch,
								countUnique: vcfData.countUnique,
								end: regionEnd,
								features: filteredFeatures,
								maxLevel: maxLevel + 1,
								name: vcfData.name,
								start: regionStart,
								strand: vcfData.strand,
								variantRegionStart: regionStart
							};

		fillVariantChart(vcfDataFiltered, regionStart, regionEnd);
	
	} else {

	    $('#vcf-track .loader-label').text("Annotating Variants in realtime");

		// A gene has been selected.  Read the variants for the gene region.
		var refName = window.getVcfRefName(window.gene.chr);
		window.vcf.getVariants(refName, 
							   window.gene.start, 
	                           window.gene.end, 
	                           window.gene.strand, 
	                           window.selectedTranscript,
	                           window.afMin,
	                           window.afMax,
	                           function(data) {
	        window.vcfData = data;

	        var splitByZyg = vcfData.hetCount > 0 && vcfData.homCount > 0;

	        maxLevel = _pileupVariants(vcfChart, splitByZyg, data.features, gene.start, gene.end);
			data.maxLevel = maxLevel + 1;
	   	    $('#vcf-track .loader-label').text("Loading chart");
			fillVariantChart(data, window.gene.start, window.gene.end);

		});	

	}

	// Get the vcf stats for this region
	vcfAfData = null;
	$('#af').addClass("hide");		
	var regionParm = {'name': window.getVcfRefName(window.gene.chr), 
					  'start': regionStart ? regionStart : window.gene.start, 
					  'end':   regionEnd   ? regionEnd   : window.gene.end
					 };
	window.vcf.getStats(null, regionParm, {}, function(stats) {
		// Alelle Frequency
		var afObj = stats.af_hist;
		vcfAfData = vcf.jsonToArray2D(afObj);	
		var afSelection = d3.select("#vcf-af-chart")
						    .datum(vcfAfData);
		var afOptions = {outliers: true, averageLine: false};		
		$('#af').removeClass("hide");			    
		afChart(afSelection, afOptions);	
	});




}

function _pileupVariants(theChart, splitByZyg, features, start, end) {
	if (splitByZyg) {
		return _pileupVariantsByZygosity(theChart, features, start, end);
	} else {
		theChart.dividerLevel(null);
		return _pileupVariantsImpl(theChart, features, start, end);
	}

} 

function _pileupVariantsByZygosity(theChart, features, start, end) {
	var spacing = 6;
	var featuresHet = features.filter(function(d) {
		return d.zygosity == null || d.zygosity == 'HET';
	});
	var maxLevelHet = _pileupVariantsImpl(theChart, featuresHet, start, end);

	var featuresHom = features.filter(function(d) {
		return d.zygosity != null && d.zygosity == 'HOM';
	});
	var maxLevelHom = _pileupVariantsImpl(theChart, featuresHom, start, end);

	featuresHom.forEach( function(d) {
		d.level = maxLevelHet + spacing + d.level;
	});
	theChart.dividerLevel(maxLevelHet + (spacing/2));
	
	return maxLevelHet + spacing + maxLevelHom;
}

function _pileupVariantsImpl(theChart, features, start, end) {
	features.forEach(function(v) {
		v.level = 0;
	});

	theChart.lowestWidth(4);
	var posToPixelFactor = Math.round((end - start) / vcfChart.width());
	var maxLevel = vcf.pileupVcfRecords(features, window.gene.start, posToPixelFactor, vcfChart.lowestWidth() + 1);


	if ( maxLevel > 30) {
		for( var i = 1; i < posToPixelFactor; i++) {
			// TODO:  Devise a more sensible approach to setting the min width.  We want the 
			// widest width possible without increasing the levels beyond 30.
			if (i > 4) {
				theChart.lowestWidth(1);
			} else if (i > 3) {
				theChart.lowestWidth(2);
			} else if (i > 2) {
				theChart.lowestWidth(3);
			} else {
				theChart.lowestWidth(4);
			}

			features.forEach(function(v) {
		  		v.level = 0;
			});
			var factor = posToPixelFactor / (i * 2);
			maxLevel = vcf.pileupVcfRecords(features, start, factor, theChart.lowestWidth() + 1);
			if (maxLevel <= 50) {
				i = posToPixelFactor;
				break;
			}
		}
	}
	return maxLevel;
}

function fillVariantChart(data, regionStart, regionEnd) {
	$('#vcf-legend').css("display", "block");		
	$('#vcf-count').css("display", "inline-block");		
	$('#vcf-name').removeClass("hide");		
	$('#af-link').removeClass("hide");
	$('#vcf-variants').css("display", "inline");	
	$("#vcf-track .loader").css("display", "none");

	window.vcfChart.regionStart(regionStart);
	window.vcfChart.regionEnd(regionEnd);
	
	// Set the vertical layer count so that the height of the chart can be recalculated	                                	
	vcfChart.verticalLayers(data.maxLevel);

	// Load the chart with the new data
	var selection = d3.select("#vcf-variants").datum([data]);    
    vcfChart(selection);

//    window.scrollTo(0,document.body.scrollHeight);

	$('#vcf-count').text(data.features.length + ' Variants');

    $('#filter-track').removeClass("hide");
    setVariantLegendCounts();
	    
   	d3.select("#vcf-variants .x.axis .tick text").style("text-anchor", "start");

   	if (fbData) {
   		$('#compare-legend').removeClass("hide");

   		// Remove from or add to list of clicked ids
	  	//window.clickedAnnotIds["unique2"] = true;
   		//d3.select("#unique2").classed("current", true);			
		//applyVariantFilters();    	
   	}




}

function setVariantLegendCounts() {
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


function callVariants(regionStart, regionEnd) {


	if (window.bam == null || window.getBamRefName == null) {
		return;
	}


	var refName = window.getBamRefName(window.gene.chr);

	if (fbData && regionStart && regionEnd) {
		// The user has selected a region to zoom into.  Filter the
		// variants based on the selected region

		// Filter freebayes variants by region
		/*
		var filteredFeatures = fbData.features.filter(function(d) {
			return (d.start >= regionStart && d.start <= regionEnd);
		});

		var splitByZyg = fbData.hetCount > 0 && fbData.homCount > 0;

		maxLevel = _pileupVariants(fbChart, splitByZyg, filteredFeatures, regionStart, regionEnd);

		var fbDataFiltered = {	count: fbData.count,
								countMatch: fbData.countMatch,
								countUnique: fbData.countUnique,
								end: fbData.end,
								features: filteredFeatures,
								maxLevel: maxLevel + 1,
								name: fbData.name,
								start: fbData.start,
								strand: fbData.strand,
								variantRegionStart: fbData.variantRegionStart
							};


		fillFreebayesChart(fbDataFiltered, regionStart, regionEnd);
		*/

	} else {

		// A gene has been selected.  Read the variants for the gene region.

		// Hide the stats.  Don't show until comparisons between call sets
		// is finished.
		//$('#fb-stats').css("display", "none");
		//$('#fb-count').css("display", "none");

		$("#vcf-track .loader").removeClass("hide");
		$("#vcf-track .loader").css("display", "block");

		$('#vcf-track .loader-label').text("Calling Variants with Freebayes");


		// Call Freebayes variants
		window.bam.getFreebayesVariants(refName, 
			window.gene.start, 
			window.gene.end, 
			window.gene.strand, 
			function(fbVariants) {

		    var fbRecs = [];

		    fbRecs.push('##fileformat=VCFv4.1');
			fbRecs.push('##fileDate=20130402');
			fbRecs.push('##source=freeBayes version 0.9.9');
			fbRecs.push('##reference=/share/home/erik/references/Homo_sapiens_assembly19.fasta');
			fbRecs.push('##phasing=none');
			fbRecs.push('##commandline="freebayes -f /share/home/erik/references/Homo_sapiens_assembly19.fasta --min-alternate-fraction 0 --max-complex-gap 20 --pooled-continuous --genotype-qualities --stdin"');
			fbRecs.push('##INFO=<ID=NS,Number=1,Type=Integer,Description="Number of samples with data">');

			// Parse the fb vcf data into json variant objects
			fbVariants.forEach( function(v) {
				fbRec = [v.chrom, v.pos, v.id, v.ref, v.alt, v.qual, v.filter, v.info, v.format, v.genotypes ];
                fbRecs.push(fbRec.join("\t"));
			})
			
			$("#vcf-track .loader-label").text("Annotating Variants in realtime")

			// Annotate the fb variatns
			window.vcf.annotateVcfRecords(fbRecs, window.gene.start, window.gene.end, 
				window.gene.strand, window.selectedTranscript, function(data){

				fbData = data;

				// This may not be the first time we call freebayes, so to
				// avoid duplicate variants, get rid of the ones
				// we added last round.
				vcfData.features = vcfData.features.filter( function(d) {
					return d.consensus != 'unique2';
				});

				// Compare the variant sets, marking the variants as unique1 (only in vcf), 
				// unique2 (only in freebayes set), or common (in both sets).				
				vcf.compareVcfRecords(vcfData, fbData, function() {


			    	// Add unique freebayes variants to vcfData
			    	fbData.features.forEach(function(d) {
			    		if (d.consensus == 'unique2') {
			    			vcfData.features.push(d);
			    			if (d.zygosity != null && d.zygosity == 'HET') {
			    				vcfData.hetCount++;
			    			} else if (d.zygosity != null && d.zygosity == 'HOM') {
			    				vcfData.homCount++;
			    			}
			    		}
			    	});


			        var splitByZyg = vcfData.hetCount > 0 && vcfData.homCount > 0;


			        maxLevel = _pileupVariants(vcfChart, splitByZyg, vcfData.features, gene.start, gene.end);
					vcfData.maxLevel = maxLevel + 1;

			    	fillVariantChart(vcfData, window.gene.start, window.gene.end);
					
			    });

			});
			
		});


	}

} 




function getWidthFactor(regionStart, regionEnd) {
	var regionSize = regionEnd - regionStart;
	var widthFactor = 1;
	widthFactors.forEach( function(wf) {
		if (regionSize >= wf.regionStart && regionSize <= wf.regionEnd) {
			widthFactor = wf.factor;
		}
	});
	return widthFactor;
}





 