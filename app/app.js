//
// Global Variables
//
var geneiobio_server = "http://localhost:3000/";

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

// The x-axis for the gene region
var regionChart = null;

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

// bam data (read coverage) and area chart.
var bamData = null;
var bamDepthChart = null;

// VCF track 
var vcfChart = null;
var vcfData = null;

// Freebayes (called) variants track
var fbChart = null;
var fbData = null;

var variantCounts = null;
var clickedAnnotIds = new Object();

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

    $('#variant-legend').html(trackLegendTemplate());

	loadGeneWidget();
	$('#bloodhound .typeahead').focus();
	
	// Setup event handlers for File input
	$('#bam-file').on('change', onBamFilesSelected);
	$('#vcf-file').on('change', onVcfFilesSelected);	

	// init vcf.iobio
	window.vcf = vcfiobio();


	// Create region chart; an x-axis of the gene region
	regionChart = regionD3()
			    .width(1000)
			    .height(0)
			    .margin({top: 0, right: 0, bottom: 22, left: 0});

	// Create the view finder chart which is a single transcript
	// that represents the union of all transcripts for a gene.
	// The user will be able to select a region on this chart,
	// causing all of the tracks to zoom to this selected region.
	/*
	viewFinderChart = geneD3()
	    .width(1000)
	    .margin({top: 20, right: 0, bottom: 10, left: 0})
	    .showXAxis(false)
	    .showBrush(true)
	    .trackHeight(22)
        .on("d3brush", function(brush) {

        	$('#zoom-region-track').css("display", "flex");

			if (!brush.empty()) {
				regionStart = d3.round(brush.extent()[0]);
				regionEnd   = d3.round(brush.extent()[1]);
			} else {
				// Treat a click as a region selection on the entire gene region.
				// That way, we won't recall the variants and re-read the bam and
				// vcf files, but instead just use the data already gathered for 
				// the entire gene region;
				regionStart = window.gene.start;
				regionEnd   = window.gene.end;
			}

			var selection = d3.select("#zoom-region-chart").datum([]);
	  		zoomRegionChart.regionStart(regionStart);
			zoomRegionChart.regionEnd(regionEnd);
       		zoomRegionChart(selection);

       		$('#zoom-region-start').val(formatRegion(regionStart) );
       		$('#zoom-region-end').val(formatRegion(regionEnd));

       		showTranscripts(regionStart, regionEnd);
			showBamDepth(regionStart, regionEnd);
	    	showVariants(regionStart, regionEnd);
	    	callVariants(regionStart, regionEnd);
		});	
*/

	// Create transcript chart
	transcriptChart = geneD3()
	    .width(1000)
	    .widthPercent("100%")
	    .heightPercent("100%")
	    .margin({top: 10, right: 0, bottom: 20, left: 0})
	    .showXAxis(false)
	    .showBrush(true)
	    .trackHeight(16)
	    .cdsHeight(12)
	    .showLabel(false)
	    .on("d3brush", function(brush) {

			if (!brush.empty()) {
				regionStart = d3.round(brush.extent()[0]);
				regionEnd   = d3.round(brush.extent()[1]);
				$('#zoom-region-track').removeClass("hide");

				var selection = d3.select("#zoom-region-chart").datum([]);
		  		zoomRegionChart.regionStart(regionStart);
				zoomRegionChart.regionEnd(regionEnd);
	       		zoomRegionChart(selection);

	       		$('#zoom-region-start').val(formatRegion(regionStart) );
	       		$('#zoom-region-end').val(formatRegion(regionEnd));

			} else {
				// Treat a click as a region selection on the entire gene region.
				// That way, we won't recall the variants and re-read the bam and
				// vcf files, but instead just use the data already gathered for 
				// the entire gene region;
				regionStart = window.gene.start;
				regionEnd   = window.gene.end;
				$('#zoom-region-track').addClass("hide");
			}

       		//showTranscripts(regionStart, regionEnd);
			showBamDepth(regionStart, regionEnd);
			showVariants(regionStart, regionEnd);
	    	callVariants(regionStart, regionEnd);

	    	



		});	

    transcriptMenuChart = geneD3()
	    .width(600)
	    .margin({top: 5, right: 5, bottom: 5, left: 120})
	    .showXAxis(true)
	    .showBrush(false)
	    .trackHeight(12)
	    .cdsHeight(8)
	    .showLabel(true)
	    .on("d3selected", function(d) {
	    	window.selectedTranscript = d;
	    	showTranscripts();
	    });



	// This is an x-axis for the selected region		    
	zoomRegionChart = regionD3()
			    .width(1000)
			    .height(0)
			    .margin({top: 0, right: 0, bottom: 19, left: 0});

	// Create the coverage chart
	bamDepthChart = lineD3()
	                    .width(1000)
	                    .height( 70 )
	                    .widthPercent("100%")
	                    .heightPercent("100%")
	                    .kind("area")
						.margin( {top: 0, right: 0, bottom: 20, left: 0} )
						.showXAxis(true)
						.showYAxis(false)
						.showTooltip(true)
						.pos( function(d) { return d[0] })
				   		.depth( function(d) { return d[1] });


	// Create the vcf track
	vcfChart = variantD3()
			    .width(1000)
			    .margin({top: 0, right: 0, bottom: 20, left: 0})
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

	// Create the freebayes variant chart
	fbChart = variantD3()
			    .width(1000)
			    .margin({top: 0, right: 0, bottom: 20, left: 0})
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
	initVariantLegend();

	// Initialize transcript view buttons
	initTranscriptControls();

	
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

function initVariantLegend() {
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
	    		|| theParentClasses.indexOf("compare") >= 0) {
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
	    	d3.select('#compare-scheme').classed("current", false);

	    	vcfChart.clazz(classifyByImpact);
	    	fbChart.clazz(classifyByImpact);

	    	showVariants(regionStart, regionEnd);
	    	callVariants(regionStart, regionEnd);
	    });
	  d3.selectAll('#effect-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme' ).classed("current", true);
	    	d3.select('#compare-scheme').classed("current", false);


	    	vcfChart.clazz(classifyByEffect);
	    	fbChart.clazz(classifyByEffect);

	    	showVariants(regionStart, regionEnd);
	    	callVariants(regionStart, regionEnd);
	    });
	   d3.selectAll('#compare-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme' ).classed("current", false);
	    	d3.select('#compare-scheme').classed("current", true);


	    	vcfChart.clazz(classifyByCompare);
	    	fbChart.clazz(classifyByCompare);

	    	showVariants(regionStart, regionEnd);
	    	callVariants(regionStart, regionEnd);

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
    
    return  'variant ' + d.type.toLowerCase() + effects + impacts + ' ' + d.consensus + ' ' + 'compare_'+d.consensus; 
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

    $('#gene-track').removeClass("hide");
	$('#view-finder-track').removeClass("hide");

	$('#add-vcf-track').css("visibility", "visible");
	$('#vcf-track').removeClass("hide");

	$('#add-bam-track').css("visibility", "visible");
	$('#bam-track').removeClass("hide");

	$('#zoom-region-track').addClass("hide");

	gene.regionStart = formatRegion(window.gene.start);
	gene.regionEnd   = formatRegion(window.gene.end);

    $('#gene-name').text(window.gene.gene_name + " " + window.gene.chr);   
    $('#gene-region-info').text(window.gene.regionStart + "-" + window.gene.regionEnd);


    // Show the x-Axis of the gene region
    var selection = d3.select("#region-chart").datum([]);
	regionChart.regionStart(+window.gene.start);
	regionChart.regionEnd(+window.gene.end);
	regionChart(selection);


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
	callVariants();


	d3.select("#region-chart .x.axis .tick text").style("text-anchor", "start");

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

    	// TODO:  Need to pick the selected transcript. 
    	// For now, just getting the last one.
    	transcripts = [selectedTranscript];
	} 


	selection = d3.select("#gene-viz").datum(transcripts);    
	transcriptChart(selection);

	selection = d3.select("#transcript-menu-item").datum(window.gene.transcripts);
	transcriptMenuChart(selection);

}


function onBamFileButtonClicked() {	
	$('#bam-url-input-group').css('visibility', 'hidden');
}

function onBamFilesSelected(event) {
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
		
		// Show the read coverage 
		this.showBamDepth();

	
		if (regionStart && regionEnd) {
			this.showBamDepth(regionStart, regionEnd);
		}
	});
}

function onBamUrlEntered() {

	var bamUrl = $('#bam-url-input').val();

	$('#bam-url-input-group').css('visibility', 'hidden');
    
    window.bam = new Bam(bamUrl);
    window.bamUrlEntered = true;
    window.getBamRefName = stripRefName;



    // Show the vcf variants.  
	this.showBamDepth();

}

function displayBamUrlBox() {
	$('#bam-url-input-group').css('visibility', 'visible');
    $("#bam-url-input").focus();

}

function displayUrlBox() {
	$('#url-input-group').css('visibility', 'visible');
    $("#url-input").focus();

}
function onVcfFileButtonClicked() {	
	$('#url-input-group').css('visibility', 'hidden');
}

function onVcfFilesSelected(event) {
	vcfFileOpened = true;

	$('#vcf-track').removeClass("hide");
	$('#vcf-variants').css("display", "none");
	$("#vcf-track .loader").css("display", "inline");

	window.vcf.openVcfFile( event, function(vcfFile) {


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

		});


	});
	
	 
}

function onVcfUrlEntered() {
	$('#vcf-track').removeClass("hide");
	$('#vcf-variants').css("display", "none");
	$("#vcf-track .loader").css("display", "inline");

	var vcfUrl = $('#url-input').val();

	$('#url-input-group').css('visibility', 'hidden');

    
    window.vcf.openVcfUrl(vcfUrl);
    window.vcfUrlEntered = true;
    window.getVcfRefName = stripRefName;



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

	$('#bam-track').removeClass("hide");
	

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

				fillBamChart(window.bamData, window.gene.start, window.gene.end);
			});
	}

	$('#fb-track').removeClass("hide");



}

function fillBamChart(data, regionStart, regionEnd) {

	window.bamDepthChart.xStart(regionStart);
	window.bamDepthChart.xEnd(regionEnd);

	window.bamDepthChart(d3.select("#bam-depth").datum(data));		
	d3.select("#bam-depth .x.axis .tick text").style("text-anchor", "start");
	
	window.scrollTo(0,document.body.scrollHeight);
}

function showVariants(regionStart, regionEnd) {
	if (window.vcf && window.vcfUrlEntered) {

	} else if (window.vcf == null || 
		(!window.vcfFileOpened) ||
	    (window.vcfFileOpened && window.getVcfRefName == null)) {
		return;
	}

	$('#vcf-track').removeClass("hide");
	$('#vcf-variants').css("display", "none");
	$("#vcf-track .loader").css("display", "inline");



	if( regionStart && regionEnd) {

		// The user has selected a region to zoom into.  Filter the
		// variants based on the selected region
		var filteredFeatures = vcfData.features.filter(function(d) {
			return (d.start >= regionStart && d.start <= regionEnd);
		});

		maxLevel = _pileupVariants(vcfChart, filteredFeatures, regionStart, regionEnd);		

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


		// A gene has been selected.  Read the variants for the gene region.
		var refName = window.getVcfRefName(window.gene.chr);
		window.vcf.getVariants(refName, 
							   window.gene.start, 
	                           window.gene.end, 
	                           window.gene.strand, 
	                           window.selectedTranscript,
	                           function(data) {
	        window.vcfData = data;

	        maxLevel = _pileupVariants(vcfChart, data.features, gene.start, gene.end);
			data.maxLevel = maxLevel + 1;

			var commonSchemeClass = d3.select("#compare-scheme").attr("class");
		    	if (commonSchemeClass == null) {
		    		commonSchemeClass = "";
		    	}
		    	if (fbData && commonSchemeClass.indexOf("current") >= 0) {
			    	vcf.compareVcfRecords(vcfData, fbData, function() {
				    	fillFreebayesChart(fbData, window.gene.start, window.gene.end);
				    	fillVariantChart(vcfData, window.gene.start, window.gene.end);
			    	});
				} else {
					fillVariantChart(data, window.gene.start, window.gene.end);
				}
		});		
	}


}

function _pileupVariants(theChart, features, start, end) {
	features.forEach(function(v) {
		v.level = 0;
	});

	theChart.lowestWidth(4);
	var posToPixelFactor = Math.round((end - start) / vcfChart.width());
	var maxLevel = vcf.pileupVcfRecords(features, window.gene.start, posToPixelFactor, vcfChart.lowestWidth() + 1);
	console.log("pileup for " + features.length)
	console.log("maxlevel = " + maxLevel + " factor = " + posToPixelFactor);

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
	$('#vcf-variants').css("display", "inline");	
	$("#vcf-track .loader").css("display", "none");

	window.vcfChart.regionStart(regionStart);
	window.vcfChart.regionEnd(regionEnd);
	
	// Set the vertical layer count so that the height of the chart can be recalculated	                                	
	vcfChart.verticalLayers(data.maxLevel);

	// Load the chart with the new data
	var selection = d3.select("#vcf-variants").datum([data]);    
    vcfChart(selection);

    window.scrollTo(0,document.body.scrollHeight);

	$('#vcf-count').text(data.features.length + ' Variants');

    $('#filter-track').removeClass("hide");
    setVariantLegendCounts();
	    
   	d3.select("#vcf-variants .x.axis .tick text").style("text-anchor", "start");

   	if (fbData) {
   		$('#compare-legend').removeClass("hide");
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
	$('#fb-track').removeClass("hide");

	$("#fb-track .loader").css("display", "inline");

	$('#fb-variants').css("display", "none");


	var refName = window.getBamRefName(window.gene.chr);

	if (regionStart && regionEnd) {
		// The user has selected a region to zoom into.  Filter the
		// variants based on the selected region

		// Filter freebayes variants by region
		var filteredFeatures = fbData.features.filter(function(d) {
			return (d.start >= regionStart && d.start <= regionEnd);
		});

		maxLevel = _pileupVariants(fbChart, filteredFeatures, regionStart, regionEnd);

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

	} else {

		// A gene has been selected.  Read the variants for the gene region.

		// Hide the stats.  Don't show until comparisons between call sets
		// is finished.
		$('#fb-stats').css("display", "none");
		$('#fb-count').css("display", "none");

		// Call Freebayes variants
		window.bam.getFreebayesVariants(refName, 
			window.gene.start, 
			window.gene.end, 
			window.gene.strand, 
			function(vcfObjs) {

		    var vcfRecs = [];

		    vcfRecs.push('##fileformat=VCFv4.1');
			vcfRecs.push('##fileDate=20130402');
			vcfRecs.push('##source=freeBayes version 0.9.9');
			vcfRecs.push('##reference=/share/home/erik/references/Homo_sapiens_assembly19.fasta');
			vcfRecs.push('##phasing=none');
			vcfRecs.push('##commandline="freebayes -f /share/home/erik/references/Homo_sapiens_assembly19.fasta --min-alternate-fraction 0 --max-complex-gap 20 --pooled-continuous --genotype-qualities --stdin"');
			vcfRecs.push('##INFO=<ID=NS,Number=1,Type=Integer,Description="Number of samples with data">');

			vcfObjs.forEach( function(v) {
				vcfRec = [v.chrom, v.pos, v.id, v.ref, v.alt, v.qual, v.filter, v.info, v.format, v.genotypes ];
                vcfRecs.push(vcfRec.join("\t"));
			})
			

			window.vcf.annotateVcfRecords(vcfRecs, window.gene.start, window.gene.end, 
				window.gene.strand, window.selectedTranscript, function(data){
				fbData = data;

				maxLevel = _pileupVariants(fbChart, fbData.features, gene.start, gene.end);
				fbData.maxLevel = maxLevel + 1;		

				var commonSchemeClass = d3.select("#compare-scheme").attr("class");
		    	if (commonSchemeClass == null) {
		    		commonSchemeClass = "";
		    	}
		    	if (vcfData && commonSchemeClass.indexOf("current") >= 0) {
			    	vcf.compareVcfRecords(vcfData, fbData, function() {
				    	fillFreebayesChart(fbData, window.gene.start, window.gene.end);
				    	fillVariantChart(vcfData, window.gene.start, window.gene.end);
			    	});
				} else {
					fillFreebayesChart(fbData, window.gene.start, window.gene.end);
				}


			});
			
		});


	}

} 

function fillFreebayesChart(data, regionStart, regionEnd) {
	window.fbChart.regionStart(regionStart);
	window.fbChart.regionEnd(regionEnd);

	$('#fb-variants').css("display", "inline");
	$("#fb-track .loader").css("display", "none");
	$('#fb-legend').css("display", "block");		
	$('#fb-count').css("display", "inline-block");
	$('#fb-count').text(data.features.length + " variants");
	



	// Set the vertical layer count so that the height of the chart can be recalculated	         
	fbChart.showTransition(true);                       	
	fbChart.verticalLayers(data.maxLevel);

	// Load the chart with the new data
	var selection = d3.select("#fb-variants").datum([data]);    
    fbChart(selection);

    d3.select("#fb-variants .x.axis .tick text").style("text-anchor", "start");
    
    $('#filter-track').removeClass("hide");
	setVariantLegendCounts();

	if (vcfData) {
		$('#compare-legend').removeClass("hide");
	}

    window.scrollTo(0,document.body.scrollHeight);

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





 