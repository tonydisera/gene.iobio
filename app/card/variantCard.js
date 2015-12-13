// Constructor
function VariantCard() {

	this.model = null;

  	this.vcfChart = null;
	this.afChart = null;
	this.zoomRegionChart = null;
	this.bamDepthChart = null;	 

	this.cardSelector = null;
	this.d3CardSelector = null;
	this.cardIndex = null;
}



VariantCard.prototype.getName = function() {
	return this.model.getName();
}

VariantCard.prototype.getRelationship = function() {
	return this.model.getRelationship();
}

VariantCard.prototype.setName = function(theName) {
	this.model.setName(theName);
}

VariantCard.prototype.setRelationship = function(theRelationship) {
	this.model.setRelationship(theRelationship);
}

VariantCard.prototype.setSampleName = function(sampleName) {
	this.model.setSampleName(sampleName);
	var cardLabel = this.model.getName() == sampleName ? this.model.getName() : sampleName + " " + this.model.getName();
	if (this.isViewable()) {
		this.cardSelector.find('#variant-card-label').text(cardLabel);
	}
}

VariantCard.prototype.getSampleName = function() {
	return this.model.getSampleName();
}

VariantCard.prototype.setDefaultSampleName = function(sampleName) {
	this.model.setDefaultSampleName(sampleName);
}

VariantCard.prototype.getDefaultSampleName = function() {
	return this.model.getDefaultSampleName();
}

VariantCard.prototype.getCardIndex = function() {
	return this.cardIndex;
}

VariantCard.prototype.isViewable = function() {
	return this.model.relationship != 'sibling';
}

VariantCard.prototype.isReadyToLoad = function() {
	return this.model.isReadyToLoad();
}

VariantCard.prototype.isLoaded = function() {
	return this.model.isLoaded();
}

VariantCard.prototype.hasDataSources = function() {
	return this.model.isReadyToLoad();
}


VariantCard.prototype.isBamLoaded = function() {
	return this.model.isBamLoaded();
}

VariantCard.prototype.variantsHaveBeenCalled = function() {
	return this.model.variantsHaveBeenCalled();
}

VariantCard.prototype.getRelationship = function() {
	return this.model.getRelationship();
}

VariantCard.prototype.summarizeDanger = function(data) {
	return this.model.summarizeDanger(data);
}

VariantCard.prototype.promiseCacheVariants = function(geneName, ref, start, end, strand, transcript) {
	return this.model.promiseCacheVariants(geneName, ref, start, end, strand, transcript);
}

VariantCard.prototype.isCached = function(geneName, transcript) {
	return this.model.isCached(geneName, transcript);
}

VariantCard.prototype.hide = function() {
	this.cardSelector.addClass("hide");
}

VariantCard.prototype.highlightVariants = function(variants) {
	if (variants != null && variants.length > 0) {
		this.d3CardSelector.selectAll("#vcf-variants .variant")
		    .style("opacity", .1);
		this.d3CardSelector.selectAll("#vcf-variants .variant")
		    .filter( function(d,i) {
		     	var found = false;
		     	variants.forEach(function(variant) {
			        if (d.start == variant.start 
			        	&& d.end == variant.end 
			        	&& d.ref == variant.ref 
			        	&& d.alt == variant.alt 
			        	&& d.type.toLowerCase() == variant.type.toLowerCase()) {
			          found = true;
			        } 
		     	});
		     	return found;
		     })
		     .style("opacity", 1);  

		this.d3CardSelector.selectAll("#fb-variants .variant")
		    .style("opacity", .1);
		this.d3CardSelector.selectAll("#fb-variants .variant")
		    .filter( function(d,i) {
		     	var found = false;
		     	variants.forEach(function(variant) {
			        if (d.start == variant.start 
			        	&& d.end == variant.end 
			        	&& d.ref == variant.ref 
			        	&& d.alt == variant.alt 
			        	&& d.type.toLowerCase() == variant.type.toLowerCase()) {
			          found = true;
			        } 
		     	});
		     	return found;
		     })
		     .style("opacity", 1);  				
	} else {
		this.d3CardSelector.selectAll("#vcf-variants .variant")
     			.style("opacity", 1);
     	this.d3CardSelector.selectAll("#fb-variants .variant")
     			.style("opacity", 1);
	} 

}


VariantCard.prototype.init = function(cardSelector, d3CardSelector, cardIndex) {
	var me = this;	

	// init model
	this.model = new VariantModel();
	this.model.init();

	this.cardIndex = cardIndex;

	if (this.isViewable()) {
		this.cardSelector = cardSelector;
		this.d3CardSelector = d3CardSelector;

		this.cardSelector.find('#variant-panel').attr("id", "variant-panel-" + cardIndex);


		// This is an x-axis for the selected region		    
		this.zoomRegionChart = geneD3()
				    .widthPercent("100%")
				    .heightPercent("100%")
				    .width(1000)
				    .margin({top: 20, right: 2, bottom: 0, left: 4})
				    .showXAxis(false)
				    .showBrush(false)
				    .trackHeight(16)
				    .cdsHeight(12)
		    		.showLabel(false);


		// Create the coverage chart
		this.bamDepthChart = lineD3()
		                    .width(1000)
		                    .height( 35 )
		                    .widthPercent("100%")
		                    .heightPercent("100%")
		                    .kind("area")
							.margin( {top: 10, right: 2, bottom: 20, left: 4} )
							.showXAxis(true)
							.showYAxis(false)
							.showTooltip(true)
							.pos( function(d) { return d[0] })
					   		.depth( function(d) { return d[1] })
					   		.formatCircleText( function(pos, depth) {
					   			return depth + 'x' ;
					   		});


		// Create the vcf track
		this.vcfChart = variantD3()
				    .width(1000)
				    .margin({top: 0, right: 2, bottom: 16, left: 4})
				    .showXAxis(true)
				    .variantHeight(6)
				    .verticalPadding(2)
				    .showBrush(false)
				    .tooltipHTML(this.variantTooltipHTML)
				    .on("d3rendered", function() {
				    	
				    })
				    .on('d3click', function(d) {
				    	if (d != clickedVariant) {
					    	clickedVariant = d;
					    	me.showCoverageCircle(d, me);
					    	window.showCircleRelatedVariants(d, me);
				    	} else {
				    		me._unpin();
				    	}
					})			    
				    .on('d3mouseover', function(d) {
				    	if (clickedVariant == null) {
					    	me.showCoverageCircle(d, me);
					    	window.showCircleRelatedVariants(d, me);
				    	}
					})
					.on('d3mouseout', function() {
						if (clickedVariant == null) {
							me.hideCoverageCircle();
							window.hideCircleRelatedVariants();
						}

					});

		// The 'missing variants' chart, variants that freebayes found that were not in orginal
		// variant set from vcf
		this.fbChart = variantD3()
				    .width(1000)
				    .margin({top: 0, right: 2, bottom: 10, left: 4}) // bottom margin for missing variant x when no vcf variants loaded
				    .showXAxis(false)
				    .variantHeight(6)
				    .verticalPadding(2)
				    .showBrush(false)
				    .tooltipHTML(this.variantTooltipHTML)
				    .on("d3rendered", function() {
				    	
				    })	
				    .on('d3click', function(d) {
				    	if (d != clickedVariant) {
					    	clickedVariant = d;
					    	me.showCoverageCircle(d, me);
					    	window.showCircleRelatedVariants(d, me);
				    	} else {
				    		me._unpin();
				    	}
					})				    
				    .on('d3mouseover', function(d) {
						if (clickedVariant == null) {
					    	me.showCoverageCircle(d, me);
					    	window.showCircleRelatedVariants(d, me);
				    	}

					})
					.on('d3mouseout', function() {
						if (clickedVariant == null) {					    
							me.hideCoverageCircle();
							window.hideCircleRelatedVariants();
						}
					});
					

	 	// Create allele frequency chart
	 	// Allele freq chart)
		// TODO:  Replace this with actual frequency after af grabbed from population (1000G/ExAC)
	    this.afChart = histogramD3()
	                       .width(400)
	                       .height(70)
						   .margin( {left: 40, right: 0, top: 0, bottom: 20})
						   .xValue( function(d, i) { return d[0] })
						   .yValue( function(d, i) { return Math.log(d[1]) })
						   .yAxisLabel( "log(frequency)" );
						   
		this.afChart.formatXTick( function(d,i) {
			return (d * 2) + '%';
		});
		this.afChart.tooltipText( function(d, i) { 
			var value = vcfAfData[i][1];
			var lowerVal =  d[0]      * 2;
			var upperVal = (d[0] + 1) * 2;
			return  d3.round(value) + ' variants with ' + lowerVal + "-" + upperVal + '%' + ' AF ';
		});

		this.cardSelector.find('#shrink-button').on('click', function() {
			me.shrinkCard(true);
		});
		this.cardSelector.find('#expand-button').on('click', function() {
			me.shrinkCard(false);
		});
		this.cardSelector.find('#minimize-button').on('click', function() {
			me.minimizeCard(true);
		});


	}


};


VariantCard.prototype.onBamFilesSelected = function(event, callback) {
	this.model.promiseBamFilesSelected(event).then( function(fileName) {
		callback(fileName);
	});
}

VariantCard.prototype.onBamUrlEntered = function(bamUrl) {
	this.model.onBamUrlEntered(bamUrl);
	if (bamUrl == null || bamUrl.trim() == "") {
		this.cardSelector.find("#bam-track").addClass("hide");
		this.cardSelector.find(".covloader").addClass("hide");
		this.cardSelector.find('#zoom-region-chart').css("visibility", "visible");

		this.cardSelector.find("#fb-chart-label").addClass("hide");
		this.cardSelector.find("#fb-separator").addClass("hide");
		this.cardSelector.find("#fb-variants").addClass("hide");
		this.cardSelector.find("#missing-variant-count").html("");
	}
}

VariantCard.prototype.onVcfFilesSelected = function(event, callback) {
	var me = this;
	if (this.isViewable()) {
		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find(".vcfloader").addClass("hide");
	}
	this.model.promiseVcfFilesSelected(
		event, 
		function(fileName) {
			me.cardSelector.find('#vcf-name').text(fileName);
		}).then( function(resolveObject) {			
			callback(resolveObject.fileName, resolveObject.sampleNames);		
		});
}

VariantCard.prototype.clearVcf = function() {
	this.model.clearVcf();

	this.cardSelector.find('#vcf-track').addClass("hide");
	this.cardSelector.find('#vcf-variants').css("display", "none");
	this.cardSelector.find(".vcfloader").addClass("hide");
	this.cardSelector.find('#vcf-variant-card-label').text("");
	this.cardSelector.find('#vcf-variant-count-label').addClass("hide");
	this.cardSelector.find('#vcf-variant-count').text("");
}

VariantCard.prototype.onVcfUrlEntered = function(vcfUrl, callback) {
	var me = this;
	if (me.isViewable()) {
		me.cardSelector.find('#vcf-track').removeClass("hide");
		me.cardSelector.find('#vcf-variants').css("display", "none");
		me.cardSelector.find(".vcfloader").addClass("hide");
	 
	}
	this.model.onVcfUrlEntered(vcfUrl, 
		function(success, samples) {
			callback(success, samples);
		});
}


VariantCard.prototype.showDataSources = function(dataSourceName) {
	this.model.setName(dataSourceName);
	$('#add-datasource-container').css('display', 'none');

	var title = this.model.getRelationship();
	if (title == null || title == '' || title == 'NONE') {
		title = 'Sample';
	}

   	this.cardSelector.find('#card-relationship-label').text(title);
   	this.cardSelector.find('#variant-card-label').text(
   	this.model.getName() == this.model.getSampleName() ? 
   		  this.model.getName() : this.model.getSampleName() + " " + this.model.getName());

}


VariantCard.prototype.loadBamDataSource = function(dataSourceName, callback) {
	var me = this;
	this.model.loadBamDataSource(dataSourceName, function() {
		me.showDataSources(dataSourceName);

		selection = me.d3CardSelector.select("#zoom-region-chart").datum([window.selectedTranscript]);
		me.zoomRegionChart.regionStart(+window.gene.start);
		me.zoomRegionChart.regionEnd(+window.gene.end);
		me.zoomRegionChart(selection);

		callback();
	});
}

VariantCard.prototype.shrinkCard = function(shrink) {

	this.minimizeCard(false);
	this.d3CardSelector.select('#variant-right-labels').classed("hide", shrink);
	this.d3CardSelector.select('#vcf-chart-label').classed("hide", shrink);
	this.d3CardSelector.select('#variant-right-labels').classed("hide", shrink);

	this.d3CardSelector.select('#zoom-region-chart').classed("hide", shrink);
	this.d3CardSelector.select('#bam-track').classed("hide", shrink);

	this.cardSelector.css("padding-bottom", shrink ? "4px" : "10px");

}

VariantCard.prototype.minimizeCard = function(minimize) {
	this.d3CardSelector.select('#variant-right-labels').classed("hide", minimize);
	this.d3CardSelector.select('#vcf-chart-label').classed("hide", minimize);
	this.d3CardSelector.select('#variant-right-labels').classed("hide", minimize);

	this.d3CardSelector.select('#variant-panel-' + this.cardIndex).classed("hide", minimize);
	this.cardSelector.css("padding-bottom", minimize ? "4px" : "10px");
}

VariantCard.prototype.showBamProgress = function(message) {
	this.cardSelector.find("#bam-track").removeClass("hide");
	this.cardSelector.find(".covloader").removeClass("hide");
	this.cardSelector.find(".covloader .loader-label").text(message);
	this.cardSelector.find("#bam-depth").css("visibility", "hidden");
	this.cardSelector.find("#bam-chart-label").css("visibility", "hidden");
}

VariantCard.prototype.endBamProgress = function() {
	this.cardSelector.find("#bam-track").removeClass("hide");
	this.cardSelector.find(".covloader").addClass("hide");
	this.cardSelector.find(".covloader .loader-label").text("");
	this.cardSelector.find("#bam-depth").css("visibility", "visible");
	this.cardSelector.find("#bam-chart-label").css("visibility", "visible");

}

VariantCard.prototype.endVariantProgress = function() {
	this.cardSelector.find(".vcfloader").addClass("hide");
}


/*
 * Load variant data only (for unaffected sibs). 
 * no variant card display
 */
VariantCard.prototype.loadVariantsOnly = function(callback) {
	this.model.promiseGetVariantsOnly().then( function(data) {
		callback();
	});
}

VariantCard.prototype.clearWarnings = function() {
	this.cardSelector.find("#multiple-sample-warning").addClass("hide");
	this.cardSelector.find('#no-variants-warning').addClass("hide");
	this.cardSelector.find('#clinvar-warning').addClass("hide");
	this.cardSelector.find('#no-ref-found-warning').addClass("hide");
	this.cardSelector.find('#error-warning').addClass("hide");
	this.cardSelector.find('#missing-variant-count-label').addClass("hide");	
}

/* 
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
VariantCard.prototype.loadTracksForGene = function (classifyClazz, callbackDataLoaded, callbackVariantsDisplayed) {
	var me = this;
	
	// Reset any previous locked variant
	this.clickedVariant = null;
	window.hideCircleRelatedVariants();
	this._unpin();

	// Clear out the previous gene's data
	this.model.wipeGeneData();

	// Clear out the freebayes charts in the variant card
	this.cardSelector.find('#fb-chart-label').addClass("hide");
	this.cardSelector.find('#fb-separator').addClass("hide");
	this.d3CardSelector.select('#fb-variants svg').remove();
	this.clearWarnings();

	if (this.isViewable()) {
		filterCard.clearFilters();

		this.vcfChart.clazz(classifyClazz);
		this.fbChart.clazz(classifyClazz);

		if (this.model.isBamLoaded() || this.model.isVcfLoaded()) {	      
			this.cardSelector.find('#zoom-region-chart').css("visibility", "hidden");

			// Workaround.  For some reason, d3 doesn't clean up previous transcript
			// as expected.  So we will just force the svg to be removed so that we
			// start with a clean slate to avoid the bug where switching between transcripts
			// resulted in last transcripts features not clearing out.
			this.d3CardSelector.select('#zoom-region-chart svg').remove();

			selection = this.d3CardSelector.select("#zoom-region-chart").datum([window.selectedTranscript]);
			this.zoomRegionChart.regionStart(+window.gene.start);
			this.zoomRegionChart.regionEnd(+window.gene.end);
			this.zoomRegionChart(selection);

		}
		this.cardSelector.find('#bam-depth').css("visibility", "hidden");
		this.cardSelector.find('#bam-chart-label').css("visibility", "hidden");


    	this.cardSelector.find('#displayed-variant-count').text("");
    	this.cardSelector.find('#vcf-variant-count-label').addClass("hide");
    	this.cardSelector.find('#vcf-variant-count').text("");
    	this.cardSelector.find('#missing-variant-count').text("");


		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find('#vcf-chart-label').addClass("hide");
		this.cardSelector.find('#vcf-name').addClass("hide");	

		this.cardSelector.find('#fb-variants').addClass("hide");

		$("#feature-matrix").addClass("hide");
		$("#feature-matrix-note").addClass("hide");

		if (this.model.isVcfLoaded()) {
			this.cardSelector.find(".vcfloader").removeClass("hide");
			this.cardSelector.find(".vcfloader .loader-label").text("Loading variants for gene")			
		} else {
			$("#filter-and-rank-card").addClass("hide");
		}



		// Load the read coverage and variant charts.  If a bam hasn't been
		// loaded, the read coverage chart and called variant charts are
		// not rendered.  If the vcf file hasn't been loaded, the vcf variant
		// chart is not rendered.
		me._showVariants( regionStart, 
			regionEnd, 
			function() {	
				me._showBamDepth( regionStart, regionEnd );
				if (callbackDataLoaded) {
					callbackDataLoaded(me);
				};
			},
			function() {
			  	if (callbackVariantsDisplayed) {
			  		callbackVariantsDisplayed(me);
			  	}
			 });

	}
}

VariantCard.prototype.setLoadState = function(theState) {
	var theVcfData = this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (theVcfData) {
		this.model.setLoadState(theVcfData, theState);
	}
}

VariantCard.prototype.onBrush = function(brush) {
	if (brush.empty()) {
		this.cardSelector.find("#region-flag").addClass("hide");
		// Only remove if no other filter flags are on
		if (this.cardSelector.find(".filter-flag.hide").length == this.cardSelector.find(".filter-flag").length) {
			this.cardSelector.find("#displayed-variant-count").addClass("hide");
		}
	} else {
		this.cardSelector.find("#region-flag").removeClass("hide");
		this.cardSelector.find("#displayed-variant-count").removeClass("hide");
	}

	// Filter the gene model to only show 'features' in selected region
	var filteredTranscript =  $.extend({}, window.selectedTranscript);
	filteredTranscript.features = window.selectedTranscript.features.filter(function(d) {
		  var inRegion = (d.start >= regionStart && d.start <= regionEnd)
                         || (d.end >= regionStart && d.end <= regionEnd) ;
          return inRegion;

	});

    var selection = this.d3CardSelector.select("#zoom-region-chart").datum([filteredTranscript]);
	this.zoomRegionChart.regionStart(!brush.empty() ? regionStart : window.gene.start);
	this.zoomRegionChart.regionEnd(!brush.empty() ? regionEnd : window.gene.end);
	this.zoomRegionChart(selection);
	this.d3CardSelector.select("#zoom-region-chart .x.axis .tick text").style("text-anchor", "start");

	this.cardSelector.find('#zoom-region-chart').css("visibility", "visible");

	this.cardSelector.find('#vcf-track').removeClass("hide");
	this.cardSelector.find('#vcf-variants').css("display", "block");
	this.cardSelector.find(".vcfloader").addClass("hide");
	this.cardSelector.find('#vcf-name').removeClass("hide");		

	this._showBamDepth(regionStart, regionEnd);
	this._showVariants(regionStart, regionEnd);
	this._showFreebayesVariants(regionStart, regionEnd);
}


VariantCard.prototype._showFreebayesVariants = function(regionStart, regionEnd) {
	if (!this.model.hasCalledVariants()) {
		return;
	}

	if (this.isViewable()) {
		var fbDataFiltered = this.model.getCalledVariants(regionStart, regionEnd);
		var filteredVcfData = this.filterVariants(fbDataFiltered, this.fbChart);
		if (regionStart && regionEnd)
  			this._fillFreebayesChart(filteredVcfData, regionStart, regionEnd);
  		else
  			this._fillFreebayesChart(filteredVcfData, window.gene.start, window.gene.end);
	}
}


VariantCard.prototype._showBamDepth = function(regionStart, regionEnd, callbackDataLoaded) {	
	var me = this;


	if (!this.model.isBamLoaded()) {
		// We can still apply the filter coverage if the vcf has the read depth in the
		// genotype field, so go ahead and show the coverage range filter.
		filterCard.enableCoverageFilters();
		if (callbackDataLoaded) {
			callbackDataLoaded();
		}
		return;
	}


	if (this.isViewable()) {
		this.cardSelector.removeClass("hide");
	}

	var coverage = this.model.getBamDataForGene(window.gene);
	var theVcfData = this.model.getVcfDataForGene(window.gene, selectedTranscript);
	if (coverage != null) {
		me.endBamProgress();
		if (regionStart && regionEnd) {
			var filteredData = me.model.filterBamDataByRegion(coverage, regionStart, regionEnd);
			me._fillBamChart(filteredData, regionStart, regionEnd);
		} else {
			me._fillBamChart(coverage, window.gene.start, window.gene.end);
		}
		if (callbackDataLoaded) {
	   	    callbackDataLoaded();
   	    }
	} else {

		// If we have varaitns, get coverage for every variant
		me.showBamProgress("Calculating coverage");

		
		this.model.getBamDepth(window.gene, window.selectedTranscript, function(coverageData) {
			me.endBamProgress();
			me._fillBamChart(coverageData, window.gene.start, window.gene.end);

			filterCard.enableCoverageFilters();
			me.refreshVariantChartAndMatrix(theVcfData);

			if (callbackDataLoaded) {
		   	    callbackDataLoaded();
	   	    }

		});

	}


}


VariantCard.prototype._fillBamChart = function(data, regionStart, regionEnd) {
	if (this.isViewable()) {
		// Reduce down to 1000 points
        var reducedData = this.model.reduceBamData(data, 1000);

		this.bamDepthChart.xStart(regionStart);
		this.bamDepthChart.xEnd(regionEnd);

		// Decide if we should show the x-axis.
		this.bamDepthChart.showXAxis(!(this.model.isVcfLoaded()));
		this.bamDepthChart.height(!(this.model.isVcfLoaded()) ? 65 : 45 );
		this.bamDepthChart.margin(!(this.model.isVcfLoaded()) ? {top: 10, right: 2, bottom: 20, left: 4} : {top: 10, right: 2, bottom: 0, left: 4} );
	
		this.bamDepthChart(this.d3CardSelector.select("#bam-depth").datum(reducedData));		
		this.d3CardSelector.select("#bam-depth .x.axis .tick text").style("text-anchor", "start");

		this.cardSelector.find('#zoom-region-chart').css("visibility", "visible");
	}
}



VariantCard.prototype.refreshVariantChartAndMatrix = function(theVcfData, onVariantsDisplayed) {
	var me = this;

	if (theVcfData == null) {
		theVcfData = this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
	}

	// Refresh feature matrix for proband card as soon as variants
	// inheritance mode determined and clinvar loaded
	this.model.promiseAnnotated(theVcfData)
	    .then(function() {	
	        // Show the freebayes variants if we have fb data
			if (me.model.isBamLoaded()) {
				me._fillFreebayesChart(me.model.getCalledVariants(), regionStart, regionEnd);
			}	

			if (me.model.getRelationship() == 'proband') {
				me.fillFeatureMatrix(regionStart, regionEnd);
			}
		},
		function(error) {			
		});

 	// Refresh variant charts when variants are annotated
 	// with clinvar, inheritance mode determined, and
 	// (if alignments provided) initialized with coverage 
 	// (depth) from alignments.
 	this.model.promiseAnnotatedAndCoverage(theVcfData)
 	    .then(function() {

			me.endVariantProgress();
			me._showVariants(regionStart, regionEnd, null, onVariantsDisplayed);


			// Refresh the feature matrix after clinvar AND the coverage has
			// been loaded
			if (me.model.getRelationship() == 'proband') {
				me.fillFeatureMatrix(regionStart, regionEnd);
			}

 		},
 		function(error) {
 		});

}



VariantCard.prototype.getBookmarkedVariant = function(variantProxy) {
	var theVcfData = this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (theVcfData == null) {
		return null;
	}
	var theVariant = null;
	theVcfData.features.forEach( function (d) {
       if (d.start == variantProxy.start 
          && d.ref == variantProxy.ref 
          && d.alt == variantProxy.alt) {
          theVariant = d;
       }
    });	
    return theVariant;
}


VariantCard.prototype._showVariants = function(regionStart, regionEnd, onVcfData, onVariantsDisplayed) {
	var me = this;

	if (!this.model.isVcfReadyToLoad()) {
		if (onVcfData) {
			onVcfData();
		}
		return;
	}

	if (this.isViewable()) {
		this.cardSelector.removeClass("hide");
		this.cardSelector.find('#vcf-track').removeClass("hide");
	}

	var theVcfData = this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (theVcfData) {
		// The user has selected a region to zoom into.  Filter the
		// variants based on the selected region
		if (this.isViewable()) {
			me.cardSelector.find('.vcfloader').addClass("hide");
			me.cardSelector.find('#vcf-variant-count-label').removeClass("hide");
	        me.cardSelector.find('#vcf-variant-count').text(theVcfData.features.length);		
			me.clearWarnings();		

			// Show the proband's (cached) freebayes variants (loaded with inheritance) 
			if (me.model.isBamLoaded()) {
				me._fillFreebayesChart(me.model.getCalledVariants(), 
									   regionStart ? regionStart : window.gene.start, 
									   regionEnd ? regionEnd : window.gene.end);
			}	


			promiseDetermineInheritance(null, onVariantsDisplayed).then(function() {
				var filteredVcfData = this.filterVariants(theVcfData);
				me.cardSelector.find('#displayed-variant-count').text(filteredVcfData != null && filteredVcfData.features.length != null ? filteredVcfData.features.length : "0");
				
				filterCard.enableVariantFilters(true);
				filterCard.enableClinvarFilters(theVcfData);
				

	  			me._fillVariantChart(filteredVcfData, 
	  								 regionStart ? regionStart : window.gene.start, 
	  								 regionEnd ? regionEnd : window.gene.end);

	  			// Show the proband's (cached) freebayes variants (loaded with inheritance) 
				if (me.model.isBamLoaded()) {
					me._fillFreebayesChart(me.model.getCalledVariants(), 
										   regionStart ? regionStart : window.gene.start, 
										   regionEnd ? regionEnd : window.gene.end);
				}	

				if (onVariantsDisplayed) {
					onVariantsDisplayed();
				}

			}, function(error) {
				console.log("an error occurred when determine inheritance. " + error);
			})	    	

			
		}
		if (onVcfData) {
	   	    onVcfData();
   	    }
   	    if (me.getRelationship() == 'proband') {
	   	    window.hideGeneBadgeLoading(window.gene.gene_name);
   	    }

	} else {

		if (me.isViewable()) {
			me.cardSelector.find('.vcfloader').removeClass("hide");
			me.cardSelector.find('.vcfloader .loader-label').text("Annotating variants with SnpEff and VEP");			
		}

		//  The user has entered a gene.  Get the annotated variants.
		var theGene =  $.extend({}, window.gene);
		var theTranscript = $.extend({}, window.selectedTranscript);
		this.model.promiseGetVariants(theGene, theTranscript, regionStart, regionEnd,
			function(data) {
				// When variants annotated with snpEff and VEP...

				if (me.isViewable()) {
					// show the 'Loading Clinvar' progress 
				 	me.cardSelector.find('.vcfloader').removeClass("hide");
					me.cardSelector.find('.vcfloader .loader-label').text("Accessing ClinVar");
					me.cardSelector.find('#clinvar-warning').addClass("hide");		

					// We have variants, so show them now even though we still
					// don't have clinvar annotations nor coverage
					// Here we call this method again and since we
					// have vcf data, the variant chart will be filled
					me._showVariants(regionStart ? regionStart : window.gene.start, 
									 regionEnd ? regionEnd : window.gene.end,
									 onVcfData,
									 onVariantsDisplayed);	
					filterCard.enableVariantFilters(true);
						
				}
				if (onVcfData) {
				    onVcfData();
			    }
				
			}).then ( function(data) {
				// After clinvar data retrieved...

			    if (me.isViewable()) {
			    	// Show the variant count
					me.cardSelector.find('#vcf-variant-count-label').removeClass("hide");
			        me.cardSelector.find('#vcf-variant-count').text(me.model.getVariantCount());				    	
					me.cardSelector.find('.vcfloader').addClass("hide");
				    

			        //var filteredVcfData = me.filterVariants();
		  			//me._fillVariantChart(data, window.gene.start, window.gene.end);

		  			// Here we call this method again and since we
					// have vcf data, the variant chart will be filled
		  			me._showVariants(regionStart ? regionStart : window.gene.start, 
									 regionEnd ? regionEnd : window.gene.end,
									 onVcfData,
									 onVariantsDisplayed);

		  			// Enable the variant filters 
		  			if (me.getRelationship() == 'proband') {
				    	filterCard.enableClinvarFilters(data);
				    }

				    // Indicate that we have refreshed variants
					me.refreshVariantChartAndMatrix(data, onVariantsDisplayed);

					// Show the 'Call from alignments' button if we a bam file/url was specified
					if (me.isBamLoaded() && me.isViewable()) {
						me.cardSelector.find('#button-find-missing-variants').removeClass("hide");
					} else {
						me.cardSelector.find('#button-find-missing-variants').addClass("hide");						
					}	 				
			   	    if (me.getRelationship() == 'proband') {
						window.refreshCurrentGeneBadge();
					}

			    }

			}, function(error) {
				me.cardSelector.find('.vcfloader').addClass("hide");

				if (me.getRelationship() == 'proband') {
	   	 		   window.hideGeneBadgeLoading(window.gene.gene_name);
   	    		}
				
				if (error == "missing reference") {
					me._displayRefNotFoundWarning();
				} else {
					console.log(error);
					if (me.isViewable()) {
					   $('#matrix-track').addClass("hide");
					    me.cardSelector.find("#vcf-track").addClass("hide");
					    me.cardSelector.find('#vcf-variant-count-label').addClass("hide");
					    me.cardSelector.find("#vcf-variant-count").text("");
					    me.cardSelector.find('.vcfloader').addClass("hide");
					    me.cardSelector.find('#error-warning #message').text(error);
					    me.cardSelector.find('#error-warning').removeClass("hide");	
					}
				}
				

			});
	}
}




VariantCard.prototype._fillVariantChart = function(data, regionStart, regionEnd, bypassFeatureMatrix) {
	
	if (bypassFeatureMatrix == null) {
		bypassFeatureMatrix = false;
	}

	if (data == null || data.features == null) {
		return;
	}


	$('#vcf-legend').css("display", "block");		
	this.cardSelector.find('#vcf-chart-label').removeClass("hide");		
	this.cardSelector.find('#vcf-name').removeClass("hide");		
	this.cardSelector.find('#vcf-variants').css("display", "inline");	

	this.vcfChart.regionStart(regionStart);
	this.vcfChart.regionEnd(regionEnd);
	
	// Set the vertical layer count so that the height of the chart can be recalculated	     
	if (data.maxLevel == null) {
		data.maxLevel = d3.max(data.features, function(d) { return d.level; });
	}                           	
	this.vcfChart.verticalLayers(data.maxLevel);
	this.vcfChart.lowestWidth(data.featureWidth);

	// Filter out freebayes data for showing in variant chart since these variants
	// show in there own chart above the loaded variants.
	var dataWithoutFB = $.extend({}, data);
	//if (bypassFeatureMatrix) {
		dataWithoutFB.features = data.features.filter( function(feature) {
			return feature.fbCalled == null;
		 });
	//}

	// Load the chart with the new data
	var selection = this.d3CardSelector.select("#vcf-variants").datum([dataWithoutFB]);    
    this.vcfChart(selection);

	this.cardSelector.find('#displayed-variant-count').text(data.features.length);

	this.cardSelector.find('#zoom-region-chart').css("visibility", "visible");

	resizeCardWidths();

    $('#filter-and-rank-card').removeClass("hide");
    //$('#filter-track').removeClass("hide");
    $('#matrix-track').removeClass("hide");
    // todo $('#variant-control-track').removeClass("hide");

   	this.d3CardSelector.select("#vcf-variants .x.axis .tick text").style("text-anchor", "start");


   	// Fill in the feature matrix for the proband variant card.
   	if (!bypassFeatureMatrix) {
	   	if ( this.getRelationship() == 'proband') {
	   		window.matrixCard.setFeatureMatrixSource(data);
	   	}
	}



}

VariantCard.prototype._displayRefNotFoundWarning = function() {
	this.cardSelector.find('#vcf-track').addClass("hide");
	this.cardSelector.find(".vcfloader").addClass("hide");
	//$('#filter-track').addClass("hide");
	$('#matrix-track').addClass("hide");
	// todo $('#variant-control-track').addClass("hide");
	this.cardSelector.find('#no-ref-found-warning #message').text("Unable to find reference " + window.gene.chr + " in vcf header.");
	this.cardSelector.find('#no-ref-found-warning').removeClass("hide");

	filterCard.clearFilters();	
}


VariantCard.prototype.fillFeatureMatrix = function(regionStart, regionEnd) {
	$('#filter-and-rank-card').removeClass("hide");
    //$('#filter-track').removeClass("hide");
    $('#matrix-track').removeClass("hide");
	// todo $('#variant-control-track').removeClass("hide");
	if (firstTimeShowVariants) {
		showSidebar("Filter");
		firstTimeShowVariants = false;
	}

	var filteredVcfData = this.model.isVcfLoaded() ? 
	       this.filterVariants() 
	     : this.filterCalledVariants();
	
	window.matrixCard.fillFeatureMatrix(filteredVcfData);
}


VariantCard.prototype._fillFreebayesChart = function(data, regionStart, regionEnd) {
	var me = this;
	
	if (data) {
		this.cardSelector.find('#fb-chart-label').removeClass("hide");
		this.cardSelector.find('#fb-separator').removeClass("hide");
		this.cardSelector.find('#fb-variants').removeClass("hide");

		this.fbChart.regionStart(regionStart);
		this.fbChart.regionEnd(regionEnd);
	
		// Set the vertical layer count so that the height of the chart can be recalculated	    
		this.fbChart.verticalLayers(data.maxLevel);
		this.fbChart.lowestWidth(data.featureWidth);

		// Load the chart with the new data
		var selection = this.d3CardSelector.select("#fb-variants").datum([data]);    
	    this.fbChart(selection);

		this.cardSelector.find('.vcfloader').addClass("hide");

	   	this.d3CardSelector.select("#fb-variants .x.axis .tick text").style("text-anchor", "start");


	}  else {
		this.cardSelector.find('#fb-chart-label').addClass("hide");
		this.cardSelector.find('#fb-separator').addClass("hide");
		this.d3CardSelector.select('#fb-variants svg').remove();
	}                      	

	

}


VariantCard.prototype.callVariants = function(regionStart, regionEnd) {
	var me = this;

	if (this.isViewable()) {
		this.cardSelector.find("#vcf-track").removeClass("hide");
		this.cardSelector.find(".vcfloader").removeClass("hide");
		this.cardSelector.find('.vcfloader .loader-label').text("Calling Variants with Freebayes");
	}

	this.model.promiseCallVariants(
		regionStart,
		regionEnd,
		function() {
			// After variants have been been called from alignments...
	    	me.cardSelector.find('.vcfloader').removeClass("hide");
			me.cardSelector.find('.vcfloader .loader-label').text("Annotating variants with SnpEff and VEP");

		},
		function(data) {

			// After variants have been annotated with clinvar...
			// Once all variant cards have freebayes variants,
			// the app will determine in the inheritance mode
			// for the freebayes variants
			promiseDetermineInheritance(promiseFullTrioCalledVariants).then( function() {
				//me.model.loadTrioInfoForCalledVariants();

				// After variants have been called from alignments and annotated from snpEff/VEP...
				// Show the called variant count
				me.cardSelector.find('#missing-variant-count-label').removeClass("hide");
				me.cardSelector.find('#missing-variant-count').removeClass("hide");
				me.cardSelector.find('#missing-variant-count').text(me.model.getCalledVariantCount());

				// Show loading clinvar progress....
		    	me.cardSelector.find('.vcfloader').removeClass("hide");
				me.cardSelector.find('.vcfloader .loader-label').text("Accessing ClinVar");
				me.cardSelector.find('#clinvar-warning').addClass("hide");

				// Show the called variants
				me._fillFreebayesChart(me.model.fbData, regionStart, regionEnd);

				// Enable the variant filters based on the new union of 
				// vcf variants + called variants
				filterCard.enableVariantFilters(true);
				filterCard.enableInheritanceFilters(me.model.getVcfDataForGene(window.gene, window.selectedTranscript));

			}, function(error) {
				console.log("error when determining inheritance for called variants. " + error);
			});

			

	}).then( function(data) {

		// Hide the clinvar loader
		me.cardSelector.find('.vcfloader').addClass("hide");

		// Show the called variants
		me._fillFreebayesChart(data, regionStart, regionEnd);

		// If this is the proband card, refresh the feature matrix to
		// show union of vcf variants and called variants
		if (me.getRelationship() == 'proband') {
			me.fillFeatureMatrix(regionStart, regionEnd);
		}
		// Enable the clinvar filter
		filterCard.enableClinvarFilters(me.model.getVcfDataForGene(window.gene, window.selectedTranscript));

	}, function(error) {

		console.log(error);
		me.cardSelector.find('.vcfloader').addClass("hide");
		me.cardSelector.find('#clinvar-warning').removeClass("hide");
	});


} 

VariantCard.prototype.updateCalledVariantsWithInheritance = function() {
	this.model.updateCalledVariantsWithInheritance();
}



VariantCard.prototype.variantClass = function(clazz) {
	this.vcfChart.clazz(clazz);
	this.fbChart.clazz(clazz);
}


VariantCard.prototype.filterCalledVariants = function() {
	if (this.model.hasCalledVariants()) {
		var filteredFBData = this._filterVariants(this.model.getCalledVariants(), this.fbChart);
		this._fillFreebayesChart(filteredFBData, regionStart, regionEnd, true);
		return filteredFBData;
	}  else {
		return null;
	}
}

VariantCard.prototype.filterVariants = function(theVcfData) {
	if (this.model.isVcfLoaded()) {
		var data = theVcfData ? theVcfData : this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
		var filteredVcfData = this._filterVariants(data, this.vcfChart);
		this._fillVariantChart(filteredVcfData, regionStart, regionEnd);	
		return filteredVcfData;
	} else {
		return null;
	}
}


VariantCard.prototype._filterVariants = function(dataToFilter, theChart) {
	var me = this;

	var data = dataToFilter ? dataToFilter : this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (data == null || data.features == null || data.features.length == 0) {
		return;
	}

	this.clickedVariant = null;
	window.hideCircleRelatedVariants();

	me.cardSelector.find(".filter-flag").addClass("hide");

	// Only hide displayed variant count if we haven't already zoomed
	if (this.cardSelector.find("#region-flag.hide").length > 0) {
		this.cardSelector.find("#displayed-variant-count").addClass("hide");
	}

	// Filter variants
	var filterObject = filterCard.getFilterObject();
	var filteredData = this.model.filterVariants(data, filterObject);

	// Set the filter badges 
	if (filterCard.afScheme == 'exac') {
		afField = "afExAC";
	} else {
		afField = "af1000G";
	}
	var afLowerVal = filterObject.afMin;
	var afUpperVal = filterObject.afMax;
	if (afLowerVal != null && afUpperVal != null) {
		if (afLowerVal <= 0 && afUpperVal == 1) {
			// We are not filtering on af if the range is 0-1
			me.cardSelector.find("#" + afField.toLowerCase() + "range-flag").addClass("hide");
		} else {
			// We are filtering on af range.  show the filter flag
			me.cardSelector.find("#" + afField.toLowerCase() + "range-flag").removeClass("hide");
			me.cardSelector.find("#displayed-variant-count").removeClass("hide");
		}
	} else {
		me.cardSelector.find("#" + afField.toLowerCase() + "range-flag").addClass("hide");
	}

	if (filterObject.coverageMin && filterObject.coverageMin > 0) {
		me.cardSelector.find("#coverage-flag").removeClass("hide");
		me.cardSelector.find("#displayed-variant-count").removeClass("hide");
	}
	for (key in filterObject.annotsToInclude) {
		var annot = filterObject.annotsToInclude[key];
		if (annot.state) {
			me.cardSelector.find("#" + annot.key + "-flag").removeClass("hide");
			me.cardSelector.find("#displayed-variant-count").removeClass("hide");
		}  else {
			me.cardSelector.find("#" + annot.key + "-flag").addClass("hide");
		}
	}
	return filteredData;

}

VariantCard.prototype.determineUnaffectedSibsStatus = function() {
	this.model.determineUnaffectedSibsStatus();

}


VariantCard.prototype.determineMaxAlleleCount = function() {
	this.model.determineMaxAlleleCount();
}



VariantCard.prototype.promiseCompareVariants = function(theVcfData, compareAttribute, 
	matchAttribute, matchFunction, noMatchFunction ) {

	return this.model.promiseCompareVariants(theVcfData, compareAttribute, 
		matchAttribute, matchFunction, noMatchFunction);
}


VariantCard.prototype.showVariantCircle = function(variant, sourceVariantCard) {
	var me = this;
	// Check the fb called variants first.  If present, circle and don't
	// show X for missing variant on vcf variant chart.
	var matchingVariant = null;
	var indicateMissingVariant = false;
	if (this.fbChart != null && this.model.hasCalledVariants()) {
		var container = this.d3CardSelector.selectAll('#fb-variants svg');
		var lock = clickedVariant != null && this == sourceVariantCard;
			
		// Show the missing variant on the fbchart if we just have variants from those
		// called from alignments (no vcf variants loaded)	
		if (!me.model.isVcfLoaded()) {
			indicateMissingVariant = true;
		}

		matchingVariant = this.fbChart.showCircle()(variant, container, indicateMissingVariant, lock);


		if (matchingVariant && sourceVariantCard) {
			var tooltip = this.d3CardSelector.select("#fb-variants .tooltip");
			this.showTooltip(tooltip, matchingVariant, sourceVariantCard, lock);		
		}
		
	}
	if (this.vcfChart != null) {
		var container = this.d3CardSelector.selectAll('#vcf-variants svg');;
		var lock = clickedVariant != null && this == sourceVariantCard;

		// Only show the X for missing variant if we didn't already find the variant in
		// the fb variants
		var indicateMissingVariant = matchingVariant == null ? true : false;
	
		matchingVariant = this.vcfChart.showCircle()(variant, container, indicateMissingVariant, lock);

		if (matchingVariant && sourceVariantCard) {
			var tooltip = this.d3CardSelector.select("#vcf-variants .tooltip");
			this.showTooltip(tooltip, matchingVariant, sourceVariantCard, lock);

		}
		
	}
	
}

VariantCard.prototype.showTooltip = function(tooltip, variant, sourceVariantCard, lock) {
	var x;
	var y;

	if (this == sourceVariantCard) {
		x = d3.event.pageX;
		y = d3.event.pageY;
	} else {
		x = variant.screenX;
		y = variant.screenY;
	}

	if (!$("#slider-left").hasClass("hide")) {
		x += 40;
	}



	var me = this;
	tooltip.transition()        
       .duration(1000)      
       .style("opacity", 0);


    tooltip.transition()        
           .duration(1000)      
           .style("opacity", .9)
           .style("z-index", 20)
           .style("pointer-events", "all");

	 var w = 300;
	 var h = tooltip[0][0].offsetHeight;

    if (this == sourceVariantCard) {
		tooltip.html(this.variantTooltipHTML(variant));
    } else {
    	tooltip.html(this.variantTooltipMinimalHTML(variant));
    }
	tooltip.select("#unpin").on('click', function() {
		me._unpin();
	});

	var selection = tooltip.select("#coverage-svg");
	this.createAlleleCountSVGTrio(selection, variant);
   
	var windowWidth = $(window).width();

	if (!$("#slider-left").hasClass("hide")) {
		if ((x + w) > windowWidth) {
	       tooltip.style("width", w + "px")
	             .style("left", x - (w*2) + "px") 
	             .style("text-align", 'left')    
	             .style("top", (y - h) + "px");   


		} else {
 			tooltip.style("width", w + "px")
	             .style("left", (x - w) + "px") 
	             .style("text-align", 'left')    
	             .style("top", (y - h) + "px");   
		}
	} else {
	    if (x < w) {
			cond = 2;
	      tooltip.style("width", w + "px")
	             .style("left", x + "px") 
	             .style("text-align", 'left')    
	             .style("top", (y - h) + "px");   

	    } else {
	    	cond = 3;
	      tooltip.style("width", w + "px")
	             .style("left", (x - w) + "px") 
	             .style("text-align", 'left')    
	             .style("top", (y - h) + "px");   
	    }

	}

    if (lock) {
      tooltip.style("pointer-events", "all");
    } else {
      tooltip.style("pointer-events", "none");          
    }

    tooltip.on('click', function() {
		me._unpin();
	});

}

VariantCard.prototype.createAlleleCountSVGTrio = function(container, variant) {
	container.select("div.proband-alt-count").remove();
	var row = container.append("div")
	                   .attr("class", "proband-alt-count tooltip-row");
	row.append("div")
	   .attr("class", "proband-alt-count tooltip-header")
	   .text("Proband Allele Count");
	var column = row.append("div")
	                .attr("class", "proband-alt-count tooltip-value");
	
	this._appendAlleleCountSVG(column, variant.genotypeAltCount, variant.genotypeRefCount, variant.genotypeDepth);

	if (dataCard.mode == 'trio' && this.getRelationship() == 'proband') {
		// Mother
		container.select("div.mother-alt-count").remove();
		row = container.append("div")
	                   .attr("class", "mother-alt-count tooltip-row");		

		row.append("div")
		   .attr("class", "mother-alt-count tooltip-header")
		   .text("Mother");
		column = row.append("div")
		            .attr("class", "mother-alt-count tooltip-value")
		this._appendAlleleCountSVG(column, variant.genotypeAltCountMother, variant.genotypeRefCountMother, variant.genotypeDepthMother);		

		// Father
		container.select("div.father-alt-count").remove();
		row = container.append("div")
	                   .attr("class", "father-alt-count tooltip-row");	
		row.append("div")
	       .attr("class", "father-alt-count tooltip-header")
	       .text("Father");
		column = row.append("div")
	                .attr("class", "father-alt-count tooltip-value")
		this._appendAlleleCountSVG(column, variant.genotypeAltCountFather, variant.genotypeRefCountFather, variant.genotypeDepthMother);
	}
}

VariantCard.prototype._appendAlleleCountSVG = function(container, genotypeAltCount, genotypeRefCount, genotypeDepth) {
	var MAX_BAR_WIDTH = 140;
	var BAR_WIDTH = 0;
	if ((genotypeDepth == null || genotypeDepth == '') && (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0)) {
		container.text("n/a");
		return;
	}

	if (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0) {
		BAR_WIDTH = MAX_BAR_WIDTH * (genotypeDepth / getProbandVariantCard().getMaxAlleleCount());
		container.select("svg").remove();
		var svg = container
	            .append("svg")
	            .attr("width", BAR_WIDTH + 20)
	            .attr("height", "12");
		svg.append("rect")
		   .attr("x", "1")
  	  	   .attr("y", "1")
  		   .attr("height", 10)
		   .attr("width",BAR_WIDTH + 10)
		   .attr("class", "alt-count");
		
		svg.append("text")
		   .attr("x", BAR_WIDTH + 5)
		   .attr("y", "9")
		   .text(genotypeDepth);

		var g = svg.append("g")
		           .attr("transform", "translate(0,0)");
		g.append("text")
		    .attr("x", BAR_WIDTH / 2)
		    .attr("y", "9")
		    .attr("text-anchor", "middle")
		    .attr("class", "alt-count")
	   		.text("?");
		return;
	} 

	var totalCount = +genotypeRefCount + +genotypeAltCount;
	BAR_WIDTH = MAX_BAR_WIDTH * (totalCount / getProbandVariantCard().getMaxAlleleCount());
	var altPercent = +genotypeAltCount / totalCount;
	var altWidth = d3.round(altPercent * BAR_WIDTH);
	var refWidth = BAR_WIDTH - altWidth;

	var separateLineForLabel = altWidth / 2 < 5;

	container.select("svg").remove();
	var svg = container
	            .append("svg")
	            .attr("width", BAR_WIDTH + 20)
	            .attr("height", separateLineForLabel ? "21" : "12");
	
	svg.append("rect")
	 .attr("x", "1")
	 .attr("y", "1")
	 .attr("height", 10)
	 .attr("width",altWidth)
	 .attr("class", "alt-count");
	if (refWidth > 0) {
		svg.append("rect")
		 .attr("x", altWidth)
		 .attr("y", "1")
		 .attr("height", 10)
		 .attr("width", refWidth)
		 .attr("class", "ref-count");		
	}
	svg.append("text")
	   .attr("x", BAR_WIDTH + 5)
	   .attr("y", "9")
	   .text(totalCount);

	 var g = svg.append("g")
	            .attr("transform", (separateLineForLabel ? "translate(5,10)" : "translate(0,0)"));
	 g.append("text")
	   .attr("x", altWidth / 2)
	   .attr("y", "9")
	   .attr("text-anchor", "middle")
	   .attr("class", "alt-count")
	   .text(genotypeAltCount);
	
	 
}



VariantCard.prototype.hideVariantCircle = function(variant) {
	if (this.vcfChart != null) {
		var container = this.d3CardSelector.selectAll('#vcf-variants svg');
		var parentContainer = this.d3CardSelector.selectAll('#vcf-variants');
		this.vcfChart.hideCircle()(container, parentContainer);
	}
	if (this.fbChart != null && this.model.hasCalledVariants()) {
		var container = this.d3CardSelector.selectAll('#fb-variants svg');
		var parentContainer = this.d3CardSelector.selectAll('#fb-variants');
		this.fbChart.hideCircle()(container, parentContainer);
	}
}

VariantCard.prototype.showCoverageCircle = function(variant, sourceVariantCard) {
	if (this.model.getBamDataForGene(window.gene) != null) {
		var bamDepth = null;
		if (sourceVariantCard == this && variant.genotypeDepth != null && variant.genotypeDepth != '') {
			bamDepth = variant.genotypeDepth;
		} else {
			var matchingVariant = this.model.getMatchingVariant(variant);
			if (matchingVariant != null) {
				bamDepth = matchingVariant.genotypeDepth;
			}
		}
		this.bamDepthChart.showCircle()(variant.start, bamDepth);
    }
}

VariantCard.prototype.hideCoverageCircle = function() {
	if (this.model.getBamDataForGene(window.gene) != null){
		this.bamDepthChart.hideCircle()();
	}	
}

VariantCard.prototype.getMaxAlleleCount = function() {
	var theVcfData = this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (theVcfData == null) {
		return null;
	}
	var count = theVcfData.maxAlleleCount;
	if (!count) {
		this.determineMaxAlleleCount();
		count = theVcfData.maxAlleleCount;
	}
	return count;
}



VariantCard.prototype.variantTooltipHTML = function(variant, pinMessage) {
	var me = this;

	var effectDisplay = "";
	for (var key in variant.effect) {
	if (effectDisplay.length > 0) {
	  	effectDisplay += ", ";
	}
		// Strip out "_" from effect
		var tokens = key.split("_");
		effectDisplay += tokens.join(" ");
	}    
	var impactDisplay = "";
	for (var key in variant.impact) {
		if (impactDisplay.length > 0) {
		  	impactDisplay += ", ";
		}
		impactDisplay += key;
	} 
	var clinSigDisplay = "";
	for (var key in variant.clinVarClinicalSignificance) {
		if (key != 'none') {
			if (clinSigDisplay.length > 0) {
			  	clinSigDisplay += ", ";
			}
			clinSigDisplay += key.split("_").join(" ");
		}
	}
	var phenotypeDisplay = "";
	for (var key in variant.clinVarPhenotype) {
		if (key != 'not_specified') {
			if (phenotypeDisplay.length > 0) {
			  	phenotypeDisplay += ", ";
			}
			phenotypeDisplay += key.split("_").join(" ");
		}
	}      
	//var coord = variant.start + (variant.end > variant.start+1 ?  '-' + variant.end : "");
	var coord = gene.chr + ":" + variant.start;
	var refalt = variant.ref + "->" + variant.alt;
	if (variant.ref == '' && variant.alt == '') {
		refalt = '(' + variant.len + ' bp)';
	}

	var clinvarUrl = "";
	if (variant.clinVarUid != null && variant.clinVarUid != '') {
		var url = 'http://www.ncbi.nlm.nih.gov/clinvar/variation/' + variant.clinVarUid;
		clinvarUrl = '<a href="' + url + '" target="_new"' + '>' + clinSigDisplay + '</a>';
	}

	var zygosity = "";
	if (variant.zygosity.toLowerCase() == 'het') {
		zygosity = "Heterozygous";
	} else if (variant.zygosity.toLowerCase() == 'hom') {
		zygosity = "Homozygous";
	}

	var vepImpactDisplay = "";
	for (var key in variant.vepImpact) {
		if (vepImpactDisplay.length > 0) {
		  	vepImpactDisplay += ", ";
		}
		vepImpactDisplay += key;
	} 
	var vepConsequenceDisplay = "";
	for (var key in variant.vepConsequence) {
		if (vepConsequenceDisplay.length > 0) {
		  	vepConsequenceDisplay += ", ";
		}
		vepConsequenceDisplay += key.split("_").join(" ");
	}     	
	var vepHGVScDisplay = "";
	for (var key in variant.vepHGVSc) {
		if (vepHGVScDisplay.length > 0) {
		  	vepHGVScDisplay += ", ";
		}
		vepHGVScDisplay += key;
	}   
	var vepHGVSpDisplay = "";
	for (var key in variant.vepHGVSp) {
		if (vepHGVSpDisplay.length > 0) {
		  	vepHGVSpDisplay += ", ";
		}
		vepHGVSpDisplay += key;
	}   
	var vepSIFTDisplay = "";
	for (var key in variant.vepSIFT) {
		if (vepSIFTDisplay.length > 0) {
		  	vepSIFTDisplay += ", ";
		}
		vepSIFTDisplay += key;
	} 
	var vepPolyPhenDisplay = "";
	for (var key in variant.vepPolyPhen) {
		if (vepPolyPhenDisplay.length > 0) {
		  	vepPolyPhenDisplay += ", ";
		}
		vepPolyPhenDisplay += key;
	} 
	
	var vepRegDisplay = "";
	for (var key in variant.regulatory) {
		// Bypass motif-based features
		if (key.indexOf("mot_") == 0) {
			continue;
 		}
 		if (vepRegDisplay.length > 0) {
		  	vepRegDisplay += ", ";
		}
		var value = variant.regulatory[key];
		vepRegDisplay += value;
	} 
	var vepRegMotifDisplay = "";
	if (variant.vepRegs) {
		for (var i = 0; i < variant.vepRegs.length; i++) {
			vr = variant.vepRegs[i];
			if (vr.motifName != null && vr.motifName != '') {
				
				if (vepRegMotifDisplay.length > 0) {
				  	vepRegMotifDisplay += ", ";
				}

				var tokens = vr.motifName.split(":");
				var baseMotifName;
				if (tokens.length == 2) {
					baseMotifName = tokens[1];
				}

				var regUrl = "http://jaspar.genereg.net/cgi-bin/jaspar_db.pl?ID=" + baseMotifName + "&rm=present&collection=CORE"
				vepRegMotifDisplay += '<a href="' + regUrl + '" target="_motif">' + vr.motifName + '</a>';
			}
		} 		
	}

	var dbSnpUrl = "";
	for (var key in variant.vepVariationIds) {
		if (key != 0 && key != '') {
			var tokens = key.split("&");
			tokens.forEach( function(id) {
				if (id.indexOf("rs") == 0) {
					if (dbSnpUrl.length > 0) {
						dbSnpUrl += ",";
					}
					var url1 = "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=" + id;
					dbSnpUrl +=  '<a href="' + url1 + '" target="_dbsnp"' + '>' + id + '</a>';					
				}
			});
		}
	};

	
	
	return (
		  me._tooltipHeaderRow(variant.type.toUpperCase(), refalt, coord, dbSnpUrl)
		+ me._tooltipHeaderRow(zygosity, '', '', '')

		+ me._tooltipRow((filterCard.getAnnotationScheme() == null || filterCard.getAnnotationScheme() == 'snpEff' ? 'SnpEff Impact &amp; Effect' : 'VEP Impact &amp; Effect'),  
				        (filterCard.getAnnotationScheme() == null || filterCard.getAnnotationScheme() == 'snpEff' ? impactDisplay + ', ' + effectDisplay : vepImpactDisplay + ' ' + vepConsequenceDisplay),
				        "5px")
		+ me._tooltipRow('SIFT', vepSIFTDisplay)
		+ me._tooltipRow('PolyPhen', vepPolyPhenDisplay)
		+ me._tooltipRowURL('Regulatory', vepRegDisplay)
		+ me._tooltipRowURL('Motif', vepRegMotifDisplay)
		+ me._tooltipRow('Inheritance',  variant.inheritance == 'none' ? '' : variant.inheritance)
		+ me._tooltipRow('ClinVar', clinvarUrl)
		+ me._tooltipRow('', phenotypeDisplay)
		+ me._tooltipRowAF('Allele Freq', (variant.afExAC == -100 ? "n/a" : variant.afExAC), variant.af1000G)
		+ me._tooltipRow('HGVSc', vepHGVScDisplay)
		+ me._tooltipRow('HGVSp', vepHGVSpDisplay)
		+ me._tooltipRow('Qual &amp; Filter', variant.qual + ', ' + variant.filter) 
		+ me._tooltipRowAlleleCounts() 
		+ me._unpinRow(pinMessage)
	);                  

	        

}


VariantCard.prototype.variantTooltipMinimalHTML = function(variant) {
	var me = this;

	var zygosity = "";
	if (variant.zygosity.toLowerCase() == 'het') {
		zygosity = "Heterozygous";
	} else if (variant.zygosity.toLowerCase() == 'hom') {
		zygosity = "Homozygous";
	}
	
	
	return (
		me._tooltipRow('Zygosity',  zygosity)
		+ me._tooltipRow('Qual &amp; Filter', variant.qual + ', ' + variant.filter) 
		);
              

}


VariantCard.prototype._unpinRow = function(pinMessage) {
	if (pinMessage == null) {
		pinMessage = 'Click on variant to lock tooltip';
	}
	if (window.clickedVariant) {
		return '<div class="row" style="margin-bottom: -2px;margin-top: 18px !important;font-size: 11px;">'
		  + '<div class="col-md-4" style="text-align:left;">' +  '<a href="javascript:void(0)">Examine </a>' +  '</div>'
		  + '<div class="col-md-4" style="text-align:left;">' +   '<a href="javascript:void(0)" onclick="bookmarkVariant(\'' + this.getRelationship() + '\')">Bookmark</a>' + '</div>'
		  + '<div class="col-md-4" style="text-align:right;">' + '<a id="unpin" href="javascript:void(0)">unlock</a>' + '</div>'
		  + '</div>';
		

	} else {
		return '<div class="row">'
		  + '<div class="col-md-12" style="text-align:right;">' +  '<em>' + pinMessage + '</em>' + '</div>'
		  + '</div>';
	}
}

VariantCard.prototype._tooltipBlankRow = function() {
	return '<div class="row">'
	  + '<div class="col-md-12">' + '  ' + '</div>'
	  + '</div>';
}

VariantCard.prototype._tooltipHeaderRow = function(value1, value2, value3, value4) {
	return '<div class="row">'
	      + '<div class="col-md-12 tooltip-title" style="text-align:center">' + value1 + ' ' + value2 + ' ' + value3 +  ' ' + value4 + '</div>'
	      + '</div>';	
}

VariantCard.prototype._tooltipRow = function(label, value, paddingTop, alwaysShow) {
	if (alwaysShow || (value && value != '')) {
		var style = paddingTop ? ' style="padding-top:' + paddingTop + '" '  : '';
		return '<div class="tooltip-row"' + style + '>'
		      + '<div class="tooltip-header" style="text-align:right">' + label + '</div>'
		      + '<div class="tooltip-value">' + value.toLowerCase() + '</div>'
		      + '</div>';
	} else {
		return "";
	}
}

VariantCard.prototype._tooltipRowURL = function(label, value, paddingTop, alwaysShow) {
	if (alwaysShow || (value && value != '')) {
		var style = paddingTop ? ' style="padding-top:' + paddingTop + '" '  : '';
		return '<div class="tooltip-row"' + style + '>'
		      + '<div class="tooltip-header" style="text-align:right">' + label + '</div>'
		      + '<div class="tooltip-value">' + value + '</div>'
		      + '</div>';
	} else {
		return "";
	}
}

VariantCard.prototype._tooltipRowAF = function(label, afExAC, af1000g) {
	return '<div class="tooltip-row">'
		      + '<div class="tooltip-header" style="text-align:right">' + label + '</div>'
		      + '<div class="tooltip-value">' + 'ExAC: ' + afExAC  + '    1000G: ' + af1000g + '</div>'
		 + '</div>';
}

VariantCard.prototype._tooltipRowAlleleCounts = function(label) {
	return '<div  id="coverage-svg">'
		 + '</div>';
}

VariantCard.prototype.addBookmarkFlag = function(variant, key, singleFlag) {
	if (variant == null) {
		return;
	}

	// Remove the current indicator from the bookmark flag
	this.d3CardSelector.selectAll('#vcf-track .bookmark.current').classed("current", false);

	// If we are just flagging one bookmarked variants, get rid of all previously shown flags
	// for this gene
	if (singleFlag) {
		this.d3CardSelector.selectAll('#vcf-track .bookmark').remove();
	}

	var container = null;
	if (variant.fbCalled == 'Y') {
		// Check to see if the bookmark flag for this variant already exists
		var isEmpty = this.d3CardSelector.selectAll("#fb-variants svg .bookmark#" + key).empty();

		// If the flag isn't present, add it to the freebayes variant
		if (isEmpty) {
			container = this.d3CardSelector.selectAll('#fb-variants svg');
			this.fbChart.addBookmark(container, variant, key);
		}
	} else {
		// Check to see if the bookmark flag for this variant already exists
		var isEmpty = this.d3CardSelector.selectAll("#vcf-variants svg .bookmark#" + key).empty();

		// If the flag isn't present, add it to the vcf variant
		if (isEmpty) {
			container = this.d3CardSelector.selectAll('#vcf-variants svg');
			this.vcfChart.addBookmark(container, variant, key);
		}
	}

	if (singleFlag) {
		this.d3CardSelector.selectAll("#vcf-track .bookmark#" + key).classed("current", true);
	}
}

VariantCard.prototype.unpin = function() {
	this._unpin();
}


VariantCard.prototype._unpin = function() {
	clickedVariant = null;
	this.hideCoverageCircle();
	window.hideCircleRelatedVariants();	
}


