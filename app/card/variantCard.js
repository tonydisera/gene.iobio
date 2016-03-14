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

VariantCard.prototype.setAffectedStatus = function(theAffectedStatus) {
	this.model.setAffectedStatus(theAffectedStatus);
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

VariantCard.prototype.promiseCacheVariants = function(ref, geneObject, transcript) {
	return this.model.promiseCacheVariants(ref, geneObject, transcript);
}

VariantCard.prototype.isCached = function(geneName, transcript) {
	return this.model.isCached(geneName, transcript);
}

VariantCard.prototype.hide = function() {
	this.cardSelector.addClass("hide");
}

VariantCard.prototype.isolateVariants = function(variants) {
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
				    		me.unpin();
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
							hideCoordinateFrame();
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
				    		me.unpin();
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
		this.cardSelector.find("#missing-variant-count").text("");
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
	this.cardSelector.find('#missing-variant-count-label').addClass("");
	this.cardSelector.find('#missing-variant-count').text("");
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

	this.d3CardSelector.select('#shrink-button').classed("disabled", shrink);
	this.d3CardSelector.select('#expand-button').classed("disabled", !shrink);
	this.d3CardSelector.select('#minimize-button').classed("disabled", false);

}

VariantCard.prototype.minimizeCard = function(minimize) {
	this.d3CardSelector.select('#variant-right-labels').classed("hide", minimize);
	this.d3CardSelector.select('#vcf-chart-label').classed("hide", minimize);
	this.d3CardSelector.select('#variant-right-labels').classed("hide", minimize);

	this.d3CardSelector.select('#variant-panel-' + this.cardIndex).classed("hide", minimize);
	this.cardSelector.css("padding-bottom", minimize ? "4px" : "10px");

	this.d3CardSelector.select('#shrink-button').classed("disabled", false);
	this.d3CardSelector.select('#expand-button').classed("disabled", false);
	this.d3CardSelector.select('#minimize-button').classed("disabled", true);
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
	this.model.promiseGetVariantsOnly(window.gene, window.selectedTranscript).then( function(data) {
		callback(data);
	});
}

VariantCard.prototype.clearWarnings = function() {
	this.cardSelector.find("#multiple-sample-warning").addClass("hide");
	this.cardSelector.find('#no-variants-warning').addClass("hide");
	this.cardSelector.find('#clinvar-warning').addClass("hide");
	this.cardSelector.find('#no-ref-found-warning').addClass("hide");
	this.cardSelector.find('#error-warning').addClass("hide");
	this.cardSelector.find('#missing-variant-count-label').addClass("hide");
	this.cardSelector.find('#missing-variant-count').addClass("hide");
	
}

/* 
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
VariantCard.prototype.loadTracksForGene = function (classifyClazz, callbackDataLoaded, callbackVariantsDisplayed) {
	var me = this;
	
	// Reset any previous locked variant
	this.clickedVariant = null;
	window.hideCircleRelatedVariants();
	this.unpin();

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



VariantCard.prototype.getBookmarkedVariant = function(variantProxy, data) {
	theVcfData = data != null ? data : this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
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
	        me.cardSelector.find('#vcf-variant-count').text(me.model.getVariantCount(theVcfData));	

			me.clearWarnings();		

	        if (me.model.hasCalledVariants()) {
		        me.cardSelector.find('#missing-variant-count-label').removeClass("hide");
				me.cardSelector.find('#missing-variant-count').removeClass("hide");
				me.cardSelector.find('#missing-variant-count').text(me.model.getCalledVariantCount());	        	
	        }	


			// Show the proband's (cached) freebayes variants (loaded with inheritance) 
			if (me.model.isBamLoaded()) {
				me._fillFreebayesChart(me.model.getCalledVariants(), 
									   regionStart ? regionStart : window.gene.start, 
									   regionEnd ? regionEnd : window.gene.end);
			}	
			filterCard.autoSetFilters();
			var filteredVcfData = this.filterVariants(theVcfData);
			me._fillVariantChart(filteredVcfData, 
	  							 regionStart ? regionStart : window.gene.start, 
	  							 regionEnd ? regionEnd : window.gene.end);


			promiseDetermineInheritance(null, onVariantsDisplayed).then(function() {
				var filteredVcfData = this.filterVariants(theVcfData);
				me.cardSelector.find('#displayed-variant-count').text(me.model.getVariantCount(filteredVcfData));
				
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
	   	    genesCard.hideGeneBadgeLoading(window.gene.gene_name);
   	    }

	} else {

		if (me.isViewable()) {
			me.cardSelector.find('.vcfloader').removeClass("hide");
			var annotationEngines = filterCard.getAnnotationScheme().toLowerCase() == "vep" ? "VEP" : "SnpEff and VEP";
			me.cardSelector.find('.vcfloader .loader-label').text("Annotating variants with " + annotationEngines);
			me.cardSelector.find("#region-flag").addClass("hide");			
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

					filterCard.autoSetFilters();
						
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
						genesCard.refreshCurrentGeneBadge();
					}

			    }

			}, function(error) {
				me.cardSelector.find('.vcfloader').addClass("hide");

				if (me.getRelationship() == 'proband') {
	   	 		   genesCard.hideGeneBadgeLoading(window.gene.gene_name);
				   genesCard.refreshCurrentGeneBadge(error);
   	    		}
				
				if (error && error == "missing reference") {
					me._displayRefNotFoundWarning();
				} else if (error && error.toLowerCase() == "no variants") {
					if (me.isViewable()) {
					   $('#matrix-track').addClass("hide");
					    me.cardSelector.find("#vcf-track").addClass("hide");
					    me.cardSelector.find('#vcf-variant-count-label').addClass("hide");
					    me.cardSelector.find("#vcf-variant-count").text("");
					    me.cardSelector.find('.vcfloader').addClass("hide");
					    me.cardSelector.find('#error-warning #message').text(error);
					    me.cardSelector.find('#error-warning').removeClass("hide");	

					    if (getProbandVariantCard().isLoaded()) {
						    $("#matrix-panel .loader").addClass("hide");
							getProbandVariantCard().fillFeatureMatrix(regionStart, regionEnd);
					    }
					}

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

	this.cardSelector.find('#displayed-variant-count').text(this.model.getVariantCount(data));

	this.cardSelector.find('#zoom-region-chart').css("visibility", "visible");

	resizeCardWidths();

	if (this.getRelationship() == 'proband' && data.features.length > 0) {
	    $('#filter-and-rank-card').removeClass("hide");
	    $('#matrix-track').removeClass("hide");		
	}

   	this.d3CardSelector.select("#vcf-variants .x.axis .tick text").style("text-anchor", "start");


   	// Fill in the feature matrix for the proband variant card.
   	if (!bypassFeatureMatrix) {
	   	if ( this.getRelationship() == 'proband') {
	   		window.matrixCard.setFeatureMatrixSource(data);
	   	}
	}

	bookmarkCard.flagBookmarks(getProbandVariantCard(), window.gene);



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
	// Don't show the feature matrix (rank card) if there are no variants for the proband
	var theVcfData = this.model.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (this.getRelationship() == 'proband' && theVcfData.features != null && theVcfData.features.length == 0) {
		$('#filter-and-rank-card').addClass("hide");
    	$('#matrix-track').addClass("hide");
    	return;
	}


	$('#filter-and-rank-card').removeClass("hide");
    $('#matrix-track').removeClass("hide");
	if (firstTimeShowVariants) {
		firstTimeShowVariants = false;
	}

	var filteredVcfData = this.model.isVcfLoaded() ? 
	       this.filterVariants() 
	     : this.filterCalledVariants();
	
	window.matrixCard.fillFeatureMatrix(filteredVcfData);
}

VariantCard.prototype.sortFeatureMatrix = function() {

	var filteredVcfData = this.model.isVcfLoaded() ? 
	       this.filterVariants() 
	     : this.filterCalledVariants();
	
	window.matrixCard.fillFeatureMatrix(filteredVcfData, true);
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

		$('#recall-card .' + this.getRelationship() + '.covloader').removeClass("hide");
		$('#recall-card .' + this.getRelationship() + '.call-variants-count').addClass("hide");

	}

	this.model.promiseCallVariants(
		regionStart,
		regionEnd,
		function() {
			// After variants have been been called from alignments...
	    	me.cardSelector.find('.vcfloader').removeClass("hide");
	    	var annotationEngine = filterCard.getAnnotationScheme().toLowerCase() == "vep" ? "VEP" : "SnpEff and VEP";
			me.cardSelector.find('.vcfloader .loader-label').text("Annotating variants with " + annotationEngine);

		},
		function(data) {

			// After variants have been annotated with clinvar...
			// Once all variant cards have freebayes variants,
			// the app will determine in the inheritance mode
			// for the freebayes variants
			promiseDetermineInheritance(promiseFullTrioCalledVariants).then( function() {
				//me.model.loadTrioInfoForCalledVariants();

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
		// After variants have been called from alignments and annotated from snpEff/VEP...
		// Show the called variant count
		me.cardSelector.find('#missing-variant-count-label').removeClass("hide");
		me.cardSelector.find('#missing-variant-count').removeClass("hide");
		me.cardSelector.find('#missing-variant-count').text(me.model.getCalledVariantCount());
		$('#recall-card .' + me.getRelationship() + '.covloader').addClass("hide");
		$('#recall-card .' + me.getRelationship() + '.call-variants-count').removeClass("hide");
		$('#recall-card .' + me.getRelationship() + '.call-variants-count').text(me.model.getCalledVariantCount() + " variants called for " + me.getRelationship());



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
		$('#recall-card .' + me.getRelationship() + '.covloader').addClass("hide");

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

	// Show a badge when the intronic variants have been removed
	if (data.intronsExcludedCount != null && data.intronsExcludedCount > 0) {
		me.cardSelector.find("#too-many-variants-flag").removeClass("hide");
		me.cardSelector.find("#excluded-variant-count").text(data.intronsExcludedCount);
	}

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

	// Iterate through the filters to see which badges to turn on in the variant card.
	// First we need to gather all filters for the same field (for exampe, there might be
	// a MODERATE and HIGH filter).  If any of the filters for the same
	// field are turned on, we want to show the filter badge.
	var annotStates = {};
	for (key in filterObject.annotsToInclude) {
		var annot = filterObject.annotsToInclude[key];
		var states = annotStates[annot.key];
		if (states == null) {
			states = {};
		}
		states[annot.state] = annot.state;
		annotStates[annot.key] = states;
	}
	for (key in annotStates) {
		var states = annotStates[key];
		var filterOn = false;
		for (state in states) {
			if (state == "true") {
				filterOn = true;
			}
		}
		if (filterOn) {
			me.cardSelector.find("#" + key + "-flag").removeClass("hide");
			me.cardSelector.find("#displayed-variant-count").removeClass("hide");
		}  else {
			me.cardSelector.find("#" + key + "-flag").addClass("hide");
		}

	}

	return filteredData;

}


VariantCard.prototype.determineMaxAlleleCount = function() {
	this.model.determineMaxAlleleCount();
}

VariantCard.prototype.populateEffectFilters = function() {
	this.model.populateEffectFilters();
}



VariantCard.prototype.promiseCompareVariants = function(theVcfData, compareAttribute, 
	matchAttribute, matchFunction, noMatchFunction ) {

	return this.model.promiseCompareVariants(theVcfData, compareAttribute, 
		matchAttribute, matchFunction, noMatchFunction);
}

VariantCard.prototype.adjustTooltip = function(variant) {
	var me = this;
	// Check the fb called variants first.  If present, circle and don't
	// show X for missing variant on vcf variant chart.
	var matchingVariant = null;
	var tooltip = null;
	if (this.fbChart != null && this.model.hasCalledVariants()) {
		var container = this.d3CardSelector.selectAll('#fb-variants svg');
		matchingVariant = this.fbChart.showCircle()(variant, container, false, true);
		if (matchingVariant) {
			tooltip = this.d3CardSelector.select("#fb-variants .tooltip");
		}
		
	}
	if (this.vcfChart != null) {
		var container = this.d3CardSelector.selectAll('#vcf-variants svg');;
		matchingVariant = this.vcfChart.showCircle()(variant, container, false, true);
		if (matchingVariant ) {
			tooltip = this.d3CardSelector.select("#vcf-variants .tooltip");
		}
	}
	if (tooltip) {
		this.showTooltip(tooltip, matchingVariant, this, false);		
	}

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
	var me = this;


	// Only show the tooltip for the chart user mouses over / click
    if (this != sourceVariantCard) {
    	return;
    }

	if (lock && !$("#slider-left").hasClass("hide")) {
		showSidebar("Examine");
		examineCard.showVariant(variant);
		me.model.promiseGetVariantExtraAnnotations(window.gene, window.selectedTranscript, variant)
		        .then( function(refreshedVariant) {
					examineCard.showVariant(refreshedVariant, true);
		        });

	}

	if (lock) {
		matrixCard.unpin(true);
	}

	matrixCard.clearSelections();
	matrixCard.highlightVariant(variant);
	
	var x = variant.screenX;
	var y = variant.screenY;
	if (!$("#slider-left").hasClass("hide")) {
		x -= ($("#slider-left").width() + 32);
	}

    tooltip.transition()        
           .duration(1000)      
           .style("opacity", .9)
           .style("z-index", 20)
           .style("pointer-events", "all");

	
    if (this == sourceVariantCard) {
		tooltip.html(me.variantTooltipHTML(variant));
    } else {
    	tooltip.html(me.variantTooltipMinimalHTML(variant));
    }
	tooltip.select("#unpin").on('click', function() {
		me.unpin();
	});
	tooltip.select("#examine").on('click', function() {
		showSidebar("Examine");
		examineCard.showVariant(variant);
		me.model.promiseGetVariantExtraAnnotations(window.gene, window.selectedTranscript, variant)
		        .then( function(refreshedVariant) {
					examineCard.showVariant(refreshedVariant, true);
		        });
	});

	var selection = tooltip.select("#coverage-svg");
	me.createAlleleCountSVGTrio(selection, variant);


	var impactList =  (filterCard.annotationScheme == null || filterCard.annotationScheme.toLowerCase() == 'snpeff' ? variant.impact : variant.vepImpact);
	for (impact in impactList) {
		var theClazz = 'impact_' + impact;	
		$(tooltip[0]).find(".tooltip-title:eq(0)").prepend("<svg class=\"impact-badge\" height=\"11\" width=\"11\">");
		var selection = tooltip.select('.impact-badge').data([{width:10, height:10,clazz: theClazz,  type: variant.type}]);
		matrixCard.showImpactBadge(selection);	

	}
	if (variant.isBookmark) {
		$(tooltip[0]).find(".tooltip-title:eq(0)").prepend("<svg class=\"bookmark-badge\" height=\"16\" width=\"35\">");
		var selection = tooltip.select('.bookmark-badge').data([{clazz: "bookmark"}]);
		matrixCard.showBookmarkSymbol(selection);
	}
	if (variant.inheritance && variant.inheritance != '') {
		var clazz = matrixCard.inheritanceMap[variant.inheritance].clazz;
		var symbolFunction = matrixCard.inheritanceMap[variant.inheritance].symbolFunction;
		$(tooltip[0]).find(".tooltip-title:contains('inheritance')").prepend("<svg class=\"inheritance-badge\" height=\"12\" width=\"14\">");
		var options = {width:18, height:20, transform: 'translate(-2,-2)'};
		var selection = tooltip.select('.inheritance-badge').data([{clazz: clazz}]);
		symbolFunction(selection, options);		
	}	

	for (key in variant.vepSIFT) {
		if (matrixCard.siftMap[key]) {
			var clazz = matrixCard.siftMap[key].clazz;
			if (clazz) {
				if (!tooltip.select(".sift").empty()) {
					$(tooltip[0]).find(".sift").prepend("<svg class=\"sift-badge\" height=\"12\" width=\"13\">");
					var selection = tooltip.select('.sift-badge').data([{width:11, height:11, transform: 'translate(0,1)', clazz: clazz }]);					
					matrixCard.showSiftSymbol(selection);				
				}
			}			
		}

	}

	for (key in variant.vepPolyPhen) {
		if (matrixCard.polyphenMap[key]) {
			var clazz = matrixCard.polyphenMap[key].clazz;
			if (clazz) {
				if (!tooltip.select(".polyphen").empty()) {
					$(tooltip[0]).find(".polyphen").prepend("<svg class=\"polyphen-badge\" height=\"12\" width=\"12\">");
					var selection = tooltip.select('.polyphen-badge').data([{width:10, height:10, transform: 'translate(0,2)', clazz: clazz }]);					
					matrixCard.showPolyPhenSymbol(selection);				
				}
			}
		}
	}

 	var w = 300;
	var h = d3.round(tooltip[0][0].offsetHeight);


	/*
    if (x < w) {
    	tooltip.classed("arrow-down-left", true);
		tooltip.classed("arrow-down-right", false);
		tooltip.style("width", w + "px")
		       .style("left", x - 22 + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h - 18) + "px");   

    } else {
	  tooltip.classed("arrow-down-left", false);
	  tooltip.classed("arrow-down-right", true);
      tooltip.style("width", w + "px")
             .style("left", (x - w) + 16 + "px") 
             .style("text-align", 'left')    
             .style("top", (y - h - 18) + "px");   
    }
    */


    if (x < w) {
    	tooltip.classed("left-arrow", true);
		tooltip.classed("right-arrow", false);
		tooltip.style("width", w + "px")
		       .style("left", d3.round(x+13) + "px") 
		       .style("text-align", 'left')    
		       .style("top", d3.round(y - h - 19) + "px");   

    } else {
	  tooltip.classed("left-arrow", false);
	  tooltip.classed("right-arrow", true);
      tooltip.style("width", w + "px")
             .style("left", d3.round(x - w - 20) + "px") 
             .style("text-align", 'left')    
             .style("top", d3.round(y - h - 20) + "px");   
    }



    if (lock) {
      tooltip.style("pointer-events", "all");
    } else {
      tooltip.style("pointer-events", "none");          
    }

    //tooltip.on('click', function() {
	//	me.unpin();
	//});

	


	

}

VariantCard.prototype.createAlleleCountSVGTrio = function(container, variant, barWidth) {
	var me = this;
	container.select("div.proband-alt-count").remove();
	
	me._appendReadCountHeading(container);

	var row = container.append("div")
	                   .attr("class", "proband-alt-count tooltip-row");
	row.append("div")
	   .attr("class", "proband-alt-count tooltip-header-small")
	   .html("<span class='tooltip-subtitle'>" + capitalizeFirstLetter(me.getRelationship()) + "</span>");
	row.append("div")
		   .attr("class", "tooltip-zygosity label " + variant.zygosity.toLowerCase())
		   .text(variant.zygosity ? capitalizeFirstLetter(variant.zygosity.toLowerCase()) : "");
	var column = row.append("div")
	                .attr("class", "proband-alt-count tooltip-allele-count-bar");
	
	this._appendAlleleCountSVG(column, variant.genotypeAltCount, variant.genotypeRefCount, variant.genotypeDepth, barWidth);
	
	if (dataCard.mode == 'trio' && this.getRelationship() == 'proband') {
		// Mother
		container.select("div.mother-alt-count").remove();
		row = container.append("div")
	                   .attr("class", "mother-alt-count tooltip-row");		

	    // If we have determined the inheritance for mother or father, show the allele count bars for the full trio
	    if ((variant.motherZygosity && variant.motherZygosity != '') || (variant.fatherZygosity && variant.fatherZygosity != null)) {
			row.append("div")
			   .attr("class", "mother-alt-count tooltip-header-small")
			   .html("<span class='tooltip-subtitle'>Mother</span>");
			row.append("div")
			   .attr("class", "tooltip-zygosity label " + (variant.motherZygosity != null ? variant.motherZygosity.toLowerCase() : ""))
			   .text(variant.motherZygosity ? capitalizeFirstLetter(variant.motherZygosity.toLowerCase()) : "");
			column = row.append("div")
			            .attr("class", "mother-alt-count tooltip-allele-count-bar")
			this._appendAlleleCountSVG(column, variant.genotypeAltCountMother, variant.genotypeRefCountMother, variant.genotypeDepthMother, barWidth);		

			// Father
			container.select("div.father-alt-count").remove();
			row = container.append("div")
		                   .attr("class", "father-alt-count tooltip-row");	
			row.append("div")
		       .attr("class", "father-alt-count tooltip-header-small")
		       .html("<span class='tooltip-subtitle'>Father</span>");
			row.append("div")
			   .attr("class",  "tooltip-zygosity label " + (variant.fatherZygosity != null ? variant.fatherZygosity.toLowerCase() : ""))
			   .text(variant.fatherZygosity ? capitalizeFirstLetter(variant.fatherZygosity.toLowerCase()) : "");
			column = row.append("div")
		                .attr("class", "father-alt-count tooltip-allele-count-bar")
			this._appendAlleleCountSVG(column, variant.genotypeAltCountFather, variant.genotypeRefCountFather, variant.genotypeDepthFather, barWidth);

	    }
	}
}

VariantCard.prototype._appendReadCountHeading = function(container) {
	var svg = container.append("div")		
		           	   .style("padding-top", "5px")
				       .append("svg")
				       .attr("width", 190)
	           		   .attr("height", "20");
	svg.append("text")
		   .attr("x", "0")
		   .attr("y", "14")
		   .attr("anchor", "start")		 
		   .attr("class", "tooltip-section-header")
		   .text("Read Counts");	  	           		   

	var g = svg.append("g")
	           .attr("transform", "translate(70,0)");

	g.append("text")
		   .attr("x", "13")
		   .attr("y", "9")
		   .attr("class", "alt-count-under")
		   .attr("anchor", "start")
		   .text("alt");	           		   
	g.append("text")
		   .attr("x", "37")
		   .attr("y", "9")
		   .attr("class", "other-count-under")
		   .attr("anchor", "start")
		   .text("other");	           		   
	g.append("text")
		   .attr("x", "70")
		   .attr("y", "9")
		   .attr("class", "ref-count")
		   .attr("anchor", "start")
		   .text("ref");	
	g.append("text")
		   .attr("x", "90")
		   .attr("y", "14")
		   .attr("class", "ref-count")
		   .attr("anchor", "start")
		   .text("total");	  		              		   

	g.append("rect")
	   .attr("x", "1")
	   .attr("y", "10")
	   .attr("height", 4)
	   .attr("width",28)
	   .attr("class", "alt-count");
	g.append("rect")
	   .attr("x", "29")
	   .attr("y", "10")
	   .attr("height", 4)
	   .attr("width",28)
	   .attr("class", "other-count");
	g.append("rect")
	   .attr("x", "57")
	   .attr("y", "10")
	   .attr("height", 4)
	   .attr("width",28)
	   .attr("class", "ref-count");

}

VariantCard.prototype._appendAlleleCountSVG = function(container, genotypeAltCount, genotypeRefCount, genotypeDepth, barWidth) {
	var MAX_BAR_WIDTH = barWidth ? barWidth : 200;
	var PADDING = 20;
	var BAR_WIDTH = 0;
	if ((genotypeDepth == null || genotypeDepth == '') && (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0)) {
		container.text("");
		var svg = container
	            .append("svg")
	            .attr("width", MAX_BAR_WIDTH + PADDING)
	            .attr("height", "21");
	    return;
	}

	if (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0) {
		BAR_WIDTH = d3.round(MAX_BAR_WIDTH * (genotypeDepth / getProbandVariantCard().getMaxAlleleCount()));
		container.select("svg").remove();
		var svg = container
	            .append("svg")
	            .attr("width", MAX_BAR_WIDTH + PADDING)
	            .attr("height", "12");
		svg.append("rect")
		   .attr("x", "1")
  	  	   .attr("y", "1")
  		   .attr("height", 10)
		   .attr("width",BAR_WIDTH)
		   .attr("class", "ref-count");
		
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
		    .attr("class", "ref-count")
	   		.text("?");
		return;
	} 

	var totalCount = genotypeDepth;
	var otherCount = totalCount - (+genotypeRefCount + +genotypeAltCount);

	// proportion the widths of alt, other (for multi-allelic), and ref
	BAR_WIDTH      = d3.round((MAX_BAR_WIDTH) * (totalCount / getProbandVariantCard().getMaxAlleleCount()));
	if (BAR_WIDTH < 10) {
		BAR_WIDTH = 10;
	}
	if (BAR_WIDTH > PADDING + 10) {
		BAR_WIDTH = BAR_WIDTH - PADDING;
	}
	var altPercent = +genotypeAltCount / totalCount;
	var altWidth   = d3.round(altPercent * BAR_WIDTH);
	var refPercent = +genotypeRefCount / totalCount;
	var refWidth   = d3.round(refPercent * BAR_WIDTH);
	var otherWidth = BAR_WIDTH - (altWidth+refWidth); 

	// Force a separate line if the bar width is too narrow for count to fit inside or
	// this is a multi-allelic.
	var separateLineForLabel = (altWidth > 0 && altWidth / 2 < 11) || (refWidth > 0 && refWidth / 2 < 11) || (otherWidth > 0);

	container.select("svg").remove();
	var svg = container
	            .append("svg")
	            .attr("width", MAX_BAR_WIDTH + PADDING)
	            .attr("height", separateLineForLabel ? "21" : "12");
	
	if (altWidth > 0) {
		svg.append("rect")
		 .attr("x", "1")
		 .attr("y", "1")
		 .attr("height", 10)
		 .attr("width",altWidth)
		 .attr("class", "alt-count");

	}

	if (otherWidth > 0) {
		svg.append("rect")
			 .attr("x", altWidth)
			 .attr("y", "1")
			 .attr("height", 10)
			 .attr("width", otherWidth)
			 .attr("class", "other-count");			
	}
	 
	if (refWidth > 0) {
		svg.append("rect")
		 .attr("x",  altWidth + otherWidth)
		 .attr("y", "1")
		 .attr("height", 10)
		 .attr("width", refWidth)
		 .attr("class", "ref-count");		
	}

	

	svg.append("text")
	   .attr("x", BAR_WIDTH + 5)
	   .attr("y", "9")
	   .text(totalCount);



	var altX = 0;
	var otherX = 0;
	var refX = 0;
	var g = svg.append("g")
	           .attr("transform", (separateLineForLabel ? "translate(-6,11)" : "translate(0,0)"));
	if (altWidth > 0) {
		var altX = d3.round(altWidth / 2);
		if (altX < 6) {
			altX = 6;
		}
		 g.append("text")
		   .attr("x", altX)
		   .attr("y", "9")
		   .attr("text-anchor", separateLineForLabel ? "start" : "middle")
		   .attr("class", separateLineForLabel ? "alt-count-under" : "alt-count")
		   .text(genotypeAltCount);

	}

 	if (otherCount > 0) {
 		otherX = altWidth  + d3.round(otherWidth / 2);
 		// Nudge the multi-allelic "other" count over to the right if it is
 		// too close to the alt count.
 		if (otherX - 11 < altX) {
 			otherX = altX + 10;
 		} 		
 		g.append("text")
		   .attr("x", otherX)
		   .attr("y", "9")
		   .attr("text-anchor", separateLineForLabel ? "start" : "middle")
		   .attr("class", separateLineForLabel ? "other-count-under" : "other-count")
		   .text(otherCount);

		var gNextLine = g.append("g")
		                 .attr("transform", "translate(-15,9)");
		svg.attr("height", 31);
		gNextLine.append("text")
		         .attr("x", otherX < 20 ? 20 : otherX)
				 .attr("y", "9")
				 .attr("text-anchor", "start")
				 .attr("class", "other-count-under" )
				 .text("(multi-allelic)");
	}	 
	if (genotypeRefCount > 0  && (altWidth > 0 || otherWidth > 0)) {
		refX = altWidth + otherWidth + d3.round(refWidth / 2);
		if (refX - 11 < otherX || refX - 11 < altX) {
			refX = refX + 10;
		}
		g.append("text")
			   .attr("x", refX)
			   .attr("y", "9")
			   .attr("text-anchor", separateLineForLabel ? "start" : "middle")
			   .attr("class", "ref-count")
			   .text(genotypeRefCount);
	}



	 
	
	 
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
	return this.variantDetailHTML(variant, pinMessage, 'tooltip');

}

VariantCard.prototype.variantDetailHTML = function(variant, pinMessage, type) {
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
		if (key != 'none' && key != 'undefined') {
			if (clinSigDisplay.length > 0) {
			  	clinSigDisplay += ", ";
			}
			clinSigDisplay += key.split("_").join(" ");
		}
	}
	var phenotypeDisplay = "";
	for (var key in variant.clinVarPhenotype) {
		if (key != 'not_specified'  && key != 'undefined') {
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
	if (variant.zygosity && variant.zygosity.toLowerCase() == 'het') {
		zygosity = "Heterozygous";
	} else if (variant.zygosity && variant.zygosity.toLowerCase() == 'hom') {
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

	var inheritanceModeRow =  variant.inheritance == null || variant.inheritance == '' || variant.inheritance == 'none' 
	                          ? ''
						      : me._tooltipHeaderRow('<strong><em>' + variant.inheritance + ' inheritance</em></strong>', '', '', '');

	var impactLabel = filterCard.getAnnotationScheme() == null || filterCard.getAnnotationScheme() == 'snpEff' 
	                  ? effectDisplay 
					  : vepConsequenceDisplay;

	var siftLabel = vepSIFTDisplay != ''  && vepSIFTDisplay != 'unknown' 
	                ? 'SIFT ' + vepSIFTDisplay
	                : "";
	var polyphenLabel = vepPolyPhenDisplay != '' && vepPolyPhenDisplay != 'unknown' 
	                    ? 'PolyPhen ' + vepPolyPhenDisplay
	                    : "";
	var sep = siftLabel != '' && polyphenLabel != '' ? '&nbsp;&nbsp;&nbsp;&nbsp;' : ''
	var siftPolyphenRow = '';
	if (siftLabel || polyphenLabel) {
		 siftPolyphenRow = me._tooltipClassedRow(siftLabel + sep, 'sift', polyphenLabel, 'polyphen');
	}

	var clinvarRow = '';
	if (clinvarUrl != '') {
		clinvarRow = me._tooltipLongTextRow('ClinVar', clinvarUrl);
	}

	var clinvarPhenotypeRow = '';
	if (phenotypeDisplay != '') {
		clinvarPhenotypeRow = me._tooltipHeaderLeftJustifySimpleRow('ClinVar - ' + phenotypeDisplay);
	}
			
	var dbSnpId = getRsId(variant);	

	if (type == 'tooltip') {
		return (
			  me._tooltipHeaderRow(variant.type ? variant.type.toUpperCase() : "", refalt, coord, dbSnpId ? '    (' + dbSnpId  + ')' : '')
			+ me._tooltipHeaderRow(impactLabel, '', '', '')
			+ inheritanceModeRow
			+ siftPolyphenRow
			+ me._tooltipShortTextRow('Allele Freq ExAC', (variant.afExAC == -100 ? "n/a" : percentage(variant.afExAC)), 
									  'Allele Freq 1000G', percentage(variant.af1000G))
			+ clinvarPhenotypeRow
			+ me._tooltipRowAlleleCounts() 
			+ me._linksRow(pinMessage)
		);                  

	} else {
		return (
			  me._tooltipHeaderRow(variant.type ? variant.type.toUpperCase() : "", refalt, '   ', dbSnpUrl)
			+ me._tooltipHeaderRow(window.gene.gene_name, coord, '', '')
			+ inheritanceModeRow

			+ me._tooltipRow((filterCard.getAnnotationScheme() == null || filterCard.getAnnotationScheme() == 'snpEff' ? 'SnpEff Effect' : 'VEP Consequence'),  
					        (filterCard.getAnnotationScheme() == null || filterCard.getAnnotationScheme() == 'snpEff' ? effectDisplay : vepConsequenceDisplay),
					        "10px")
			+ me._tooltipRow((filterCard.getAnnotationScheme() == null || filterCard.getAnnotationScheme() == 'snpEff' ? 'Impact' : 'Impact'),  
					        (filterCard.getAnnotationScheme() == null || filterCard.getAnnotationScheme() == 'snpEff' ? impactDisplay : vepImpactDisplay))
			+ me._tooltipRow('SIFT', vepSIFTDisplay)
			+ me._tooltipRow('PolyPhen', vepPolyPhenDisplay)
			+ me._tooltipRow('ClinVar', clinvarUrl)
			+ me._tooltipRow('&nbsp;', phenotypeDisplay)
			+ me._tooltipRow('Allele Freq ExAC', (variant.afExAC == -100 ? "n/a" : percentage(variant.afExAC)))
			+ me._tooltipRow('Allele Freq 1000G', percentage(variant.af1000G))
			+ me._tooltipRowURL('Regulatory', vepRegDisplay)
			+ me._tooltipRow('HGVSc', vepHGVScDisplay)
			+ me._tooltipRow('HGVSp', vepHGVSpDisplay)
			+ me._tooltipRow('Qual', variant.qual) 
			+ me._tooltipRow('Filter', variant.recfilter) 
			+ me._tooltipRowAlleleCounts() 
			+ me._linksRow()
		);                  

	}
	

	        

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


VariantCard.prototype._linksRow = function(pinMessage) {
	if (pinMessage == null) {
		pinMessage = 'Click on variant to lock tooltip';
	}

	var examineCol = "";
	if ($("#slider-left").hasClass("hide")) {
		  examineCol = '<div class="col-sm-4" style="text-align:left;">' +  '<a id="examine" href="javascript:void(0)">Inspect </a>' +  '</div>'
	} else {
		  examineCol = '<div class="col-sm-4" style="text-align:left;"></div>'
	}

	var bookmarkBadge = '<svg class="bookmark-badge" height="11" width="82"><g class="bookmark" transform="translate(0,0)"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#bookmark-symbol" width="12" height="12"></use><text x="12" y="9" style="fill: black;">Bookmarked</text></g></svg>';
	showAsBookmarked = function(container) {
		$(container).parent().html(bookmarkBadge);
	};

	if (window.clickedVariant) {
		var bookmarkLink = null;
		if (window.clickedVariant.isBookmark) {
			return '<div class="row tooltip-footer">'
			  + examineCol
			  + '<div class="col-sm-4" id="bookmarkLink" style="text-align:left;">' +  bookmarkBadge  + '</div>'
			  + '<div class="col-sm-4" style="text-align:right;">' + '<a id="unpin" href="javascript:void(0)">unlock</a>' + '</div>'
			  + '</div>';

		} else {
			return '<div class="row tooltip-footer" style="">'
			  + examineCol
			  + '<div class="col-sm-4" style="text-align:left;">' +   '<a id="bookmarkLink" href="javascript:void(0)" onclick="bookmarkVariant();showAsBookmarked(this)">Bookmark</a>' + '</div>'
			  + '<div class="col-sm-4" style="text-align:right;">' + '<a id="unpin" href="javascript:void(0)">unlock</a>' + '</div>'
			  + '</div>';

		}
		
	} else {
		return '<div class="row tooltip-footer">'
		  + '<div class="col-md-12 tooltip-footer" style="text-align:right;">' +  '<em>' + pinMessage + '</em>' + '</div>'
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

VariantCard.prototype._tooltipHeaderLeftJustifyRow = function(value1, value2, value3, value4) {
	return '<div class="row">'
	      + '<div class="col-md-12 tooltip-title" style="text-align:left">' + value1 + ' ' + value2 + ' ' + value3 +  ' ' + value4 + '</div>'
	      + '</div>';	
}

VariantCard.prototype._tooltipHeaderLeftJustifySimpleRow = function(value1) {
	return '<div class="row">'
	      + '<div class="col-md-12 tooltip-title" style="text-align:left">' + value1 + '</div>'
	      + '</div>';	
}

VariantCard.prototype._tooltipClassedRow = function(value1, class1, value2, class2) {
	return '<div class="row">'
	      +  '<div class="col-md-12 tooltip-title" style="text-align:center">' 
	      +    "<span class='" + class1 + "'>" + value1 + '</span>' 
	      +    "<span class='" + class2 + "'>" + value2 + '</span>' 
	      +  '</div>'
	      + '</div>';	
}

VariantCard.prototype._tooltipLongTextRow = function(value1, value2) {
	return '<div class="row" style="padding-top:5px;">'
	      + '<div class="col-sm-2 tooltip-title" style="text-align:left;word-break:normal">' + value1  +'</div>'
	      + '<div class="col-sm-10 tooltip-title" style="text-align:left;word-break:normal">' + value2 + '</div>'
	      + '</div>';	
}
VariantCard.prototype._tooltipShortTextRow = function(value1, value2, value3, value4) {

	return '<div class="row" style="padding-top:5px;padding-bottom:5px;">'
	      + '<div class="col-sm-4 tooltip-label" style="text-align:right;word-break:normal;padding-right:5px;">' + value1  +'</div>'
	      + '<div class="col-sm-2 " style="text-align:left;word-break:normal;padding-left:0px;">' + value2 + '</div>'
	      + '<div class="col-sm-4 tooltip-label" style="text-align:right;word-break:normal;padding-right:5px;">' + value3  +'</div>'
	      + '<div class="col-sm-2 " style="text-align:left;word-break:normal;padding-left:0px">' + value4 + '</div>'
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

VariantCard.prototype.highlightBookmarkedVariants = function() {
	// This is too confusing because there is no easy way to reset
	// to show all variants in full opacity.
	// Until a better approach is implemented, just keep
	// the opacity at 1 on all variants.
	d3.selectAll("#proband-variant-card .variant")
		   .style("opacity", 1);

	d3.selectAll("#proband-variant-card .variant")
	      .filter( function(d,i) {
	      	return d.hasOwnProperty("isBookmark") && d.isBookmark == 'Y';
	      })
	      .style("opacity", 1);
}

VariantCard.prototype.removeBookmarkFlags = function() {
	// Remove the current indicator from the bookmark flag
	this.d3CardSelector.selectAll('#vcf-track .bookmark').remove();
}

VariantCard.prototype.removeBookmarkFlag = function(variant, key) {
	// Remove the current indicator from the bookmark flag
	if (variant.fbCalled == 'Y') {
		this.d3CardSelector.select("#fb-variants svg .bookmark#" + key).remove();
	} else {
		this.d3CardSelector.select("#vcf-variants svg .bookmark#" + key).remove();
	}

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
			variant.isBookmark = "Y";
			this.fbChart.addBookmark(container, variant, key);
		}
	} else {
		// Check to see if the bookmark flag for this variant already exists
		var isEmpty = this.d3CardSelector.selectAll("#vcf-variants svg .bookmark#" + key).empty();

		// If the flag isn't present, add it to the vcf variant
		if (isEmpty) {
			container = this.d3CardSelector.selectAll('#vcf-variants svg');
			variant.isBookmark = "Y";
			this.vcfChart.addBookmark(container, variant, key);
		}
	}

	//this.fillFeatureMatrix();

	if (singleFlag) {
		this.d3CardSelector.selectAll("#vcf-track .bookmark#" + key).classed("current", true);
	}
}



VariantCard.prototype.unpin = function(saveClickedVariant) {
	if (!saveClickedVariant) {
		clickedVariant = null;
	}
	this.hideCoverageCircle();
	window.hideCircleRelatedVariants();	
}


