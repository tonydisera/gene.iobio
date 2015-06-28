// Create a variantCard class
// Constructor
function VariantCard() {

	this.vcf = null;
	this.bam = null;
  	this.vcfChart = null;
	this.vcfData = null;
	this.fbData = null;	
	this.vcfAfData = null;
	this.afChart = null;
	this.variantCounts = null;
	this.bamData = null;
	this.zoomRegionChart = null;
	this.bamDepthChart = null;	 
	this.bamUrlEntered = false;
	this.bamFileOpened = false;
	this.getBamRefName = null;
	this.getVcfRefName = null;
	this.cardSelector = null;
	this.d3CardSelector = null;
	this.cardIndex = null;
	this.name = null;
	this.dirty = false;
}

VariantCard.prototype.isLoaded = function() {
	return this.vcf != null && this.vcfData != null;
}

// class methods

VariantCard.prototype.setName = function(theName) {
	if (theName) {
		this.name = theName;
	} else {
		return theName;
	}
}

VariantCard.prototype.setRelationship = function(theRelationship) {
	if (theRelationship) {
		this.relationship = theRelationship;
	} else {
		return theRelationship;
	}
}

VariantCard.prototype.getCardIndex = function() {
	return this.cardIndex;
}

/*
 * Only the variant card for the primary variant set (e.g. proband) are
 * visualized.
 */
VariantCard.prototype.isViewable = function() {
	//return this.relationship != 'mother' && this.relationship != 'father';
	return true;
}

VariantCard.prototype.getRelationship = function() {
	return this.relationship;
}

VariantCard.prototype.setDirty = function(flag) {
	if (flag == null) {
		this.dirty = true;
	} else {
		this.dirty = flag;
	}

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




VariantCard.prototype.isDirty = function() {
	return this.dirty;
}
VariantCard.prototype.init = function(cardSelector, d3CardSelector, cardIndex) {
	var me = this;	

	// init vcf.iobio
	this.vcf = vcfiobio();
	this.cardIndex = cardIndex;

	if (this.isViewable()) {
		this.cardSelector = cardSelector;
		this.d3CardSelector = d3CardSelector;

		this.cardSelector.find("#variant-link").attr("href", "#variant-panel-" + cardIndex);
		this.cardSelector.find('#variant-panel').attr("id", "variant-panel-" + cardIndex);

		this.cardSelector.find("#af-link").attr("href", "#af-" + cardIndex);
		this.cardSelector.find('#af').attr("id", "af-" + cardIndex);


		this.cardSelector.find("#vcf-file-info-link").attr("href", "#vcf-file-info-" + cardIndex);
		this.cardSelector.find('#vcf-file-info').attr("id", "vcf-file-info-" + cardIndex);


		this.cardSelector.find("#bam-file-info-link").attr("href", "#bam-name-" + cardIndex);
		this.cardSelector.find('#bam-name').attr("id", "bam-name-" + cardIndex);


		// This is an x-axis for the selected region		    
		this.zoomRegionChart = geneD3()
				    .widthPercent("100%")
				    .heightPercent("100%")
				    .width(1000)
				    .margin({top: 20, right: 4, bottom: 0, left: 4})
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
							.margin( {top: 10, right: 4, bottom: 20, left: 4} )
							.showXAxis(true)
							.showYAxis(false)
							.showTooltip(true)
							.pos( function(d) { return d[0] })
					   		.depth( function(d) { return d[1] })
					   		.formatCircleText( function(pos, depth) {
					   			return parseInt(depth) + 'x' ;
					   		});


		// Create the vcf track
		this.vcfChart = variantD3()
				    .width(1000)
				    .margin({top: 0, right: 4, bottom: 16, left: 4})
				    .showXAxis(true)
				    .variantHeight(6)
				    .verticalPadding(2)
				    .showBrush(false)
				    .tooltipHTML(variantTooltipHTML)
				    .on("d3rendered", function() {
				    	
				    })
				    .on('d3click', function(d) {
				    	if (d != clickedVariant) {
					    	clickedVariant = d;
					    	me.showCoverageCircle(d);
					    	window.showCircleRelatedVariants(d, me);
				    	} else {
				    		clickedVariant = null;
							me.hideCoverageCircle();
							window.hideCircleRelatedVariants();
				    	}
					})			    
				    .on('d3mouseover', function(d) {
				    	if (clickedVariant == null) {
					    	me.showCoverageCircle(d);
					    	window.showCircleRelatedVariants(d, me);
				    	}
					})
					.on('d3mouseout', function() {
						if (clickedVariant == null) {
							me.hideCoverageCircle();
							if (me.getRelationship() == 'proband') {
								window.hideCircleRelatedVariants();
							}
						}
					});

		// The 'missing variants' chart, variants that freebayes found that were not in orginal
		// variant set from vcf
		this.fbChart = variantD3()
				    .width(1000)
				    .margin({top: 0, right: 4, bottom: 0, left: 4})
				    .showXAxis(false)
				    .variantHeight(6)
				    .verticalPadding(2)
				    .showBrush(false)
				    .tooltipHTML(variantTooltipHTML)
				    .on("d3rendered", function() {
				    	
				    })			    
				    .on('d3mouseover', function(d) {
				    	me.showCoverageCircle(d);
				    	window.showCircleRelatedVariants(d, me);
					})
					.on('d3mouseout', function() {
						me.hideCoverageCircle();
						if (me.getRelationship() == 'proband') {
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

		// listen for click event for finding missing variants
		this.cardSelector.find('#button-find-missing-variants').on('click', function() {
			me.callVariants.apply(me, []);
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
	var me = this;

	this.bamData = null;
	this.fbData = null;


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
	    return;
	}
	this.bamFileOpened = true;


	if (this.isViewable()) {
		this.cardSelector.find("#bam-track .loader").css("display", "block");
		this.cardSelector.find("#bam-track .loader-label").text("Loading Alignment File");
		this.cardSelector.find('#bam-name-' + this.cardIndex).text(bamFile.name);
		this.cardSelector.find("#bam-depth").addClass("hide");

	}


	this.bam = new Bam( bamFile, { bai: baiFile });
	this.getBamRefName = null;
	this.bam.getReferencesWithReads(function(ref) {

		// Figure out if whe need to strip 'ch' or 'chr' from ref name to
		// match to bam reference names
		ref.forEach(function(ref) {
			if (me.getBamRefName == null) {
		 		if (ref.name == window.gene.chr) {
		 			me.getBamRefName = me.getRefName;
					if (callback) {
						callback(bamFile.name);
					}
		 		} else if (ref.name == me.stripRefName(gene.chr)) {
		 			me.getBamRefName = me.stripRefName;
		 			if (callback) {
						callback(bamFile.name);
					}

		 		}
			}
		});
	
	});
}

VariantCard.prototype.onBamUrlEntered = function(bamUrl) {
	this.bamData = null;
	this.fbData = null;

	if (bamUrl == null || bamUrl.trim() == "") {
		this.bamUrlEntered = false;
		this.bam = null;
		this.cardSelector.find("#bam-track").addClass("hide");
		this.cardSelector.find('#zoom-region-chart').css("visibility", "visible");
		this.cardSelector.find('#zoom-region-chart').css("margin-top", "-20px");
		this.cardSelector.find('#zoom-region-chart').css("margin-bottom", "0px");
	} else {
		this.bamUrlEntered = true;
		this.bam = new Bam(bamUrl);
	    this.bamUrlEntered = true;
		this.cardSelector.find("#bam-track .loader").css("display", "block");
		this.cardSelector.find("#bam-track .loader-label").text("Streaming Alignment File");
		this.cardSelector.find("#bam-depth").addClass("hide");
		this.cardSelector.find('#bam-name-' + this.cardIndex).text(bamUrl);
	}

    
    
    this.getBamRefName = this.stripRefName;

}

VariantCard.prototype.onVcfFilesSelected = function(event, callback) {
	var me = this;
	this.vcfFileOpened = true;
	this.vcfData = null;

	if (this.isViewable()) {
		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find(".vcfloader").css("display", "block");
		this.cardSelector.find('.vcfloader .loader-label').text("Loading VCF");
	}

	this.vcf.openVcfFile( event, function(vcfFile) {

		me.cardSelector.find('#vcf-name').text(vcfFile.name);
		me.getVcfRefName = null;
		me.vcf.getReferenceNames(function(refNames) {

			// Figure out if whe need to strip 'ch' or 'chr' from ref name to
			// match to bam reference names
			refNames.forEach(function(refName) {				
				if (me.getVcfRefName == null) {
			 		if (refName == window.gene.chr) {
			 			me.getVcfRefName = me.getRefName;
			 			if (callback) {
				 			callback(vcfFile.name);
			 			}
			 		} else if (refName == me.stripRefName(gene.chr)) {
			 			me.getVcfRefName = me.stripRefName;
			 			if (callback) {
				 			callback(vcfFile.name);
			 			}
			 		}

				}
			});
			
		});

	});

}

VariantCard.prototype.onVcfUrlEntered = function(vcfUrl) {
	var me = this;
	this.vcfData = null;
	
	if (this.isViewable()) {
		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find(".vcfloader").css("display", "block");
		this.cardSelector.find('.vcfloader .loader-label').text("Streaming Variant Data");
	 	this.cardSelector.find('#vcf-name').text(vcfUrl);
	}
   
    this.vcf.openVcfUrl(vcfUrl);
    this.vcfUrlEntered = true;
    this.getVcfRefName = null;

}


VariantCard.prototype.discoverVcfRefName = function(callback) {
	var me = this;
	if (this.getVcfRefName != null) {
		callback();
	} else {
		if (this.vcf.isFile()) {
			this.vcf.getReferenceNames(function(refNames) {
				var foundRef = false;
				refNames.forEach( function(refName) {
		    		if (me.getVcfRefName == null) {
				 		if (refName == window.gene.chr) {
				 			me.getVcfRefName = me.getRefName;
				 			foundRef = true;
					    	callback();
				 		} else if (refName == me.stripRefName(gene.chr)) {
				 			me.getVcfRefName = me.stripRefName;
				 			foundRef = true;
				 			callback();
				 		}
					}
					if (!foundRef && me.getVcfRefName == null) {
						me.cardSelector.find('#vcf-track').addClass("hide");
						me.cardSelector.find(".vcfloader").css("display", "none");
						$("#matrix-track .clinvar.loader").css("display", "none");
						$('#filter-track').addClass("hide");
					    $('#matrix-track').addClass("hide");
		
						clearFilters();
					}
		    	});

			});

		} else {

			this.vcf.loadRemoteIndex(null, function(refData) {
				var foundRef = false;
		    	refData.forEach( function(ref) {
		    		if (me.getVcfRefName == null) {
				 		if (ref.name == window.gene.chr) {
				 			me.getVcfRefName = me.getRefName;
				 			foundRef = true;
				 			callback();
				 		} else if (ref.name == me.stripRefName(gene.chr)) {
				 			me.getVcfRefName = me.stripRefName;
				 			foundRef = true;
				 			callback();
				 		}
					}
		    	});
		    	if (!foundRef && me.getVcfRefName == null) {
					me.cardSelector.find('#vcf-track').addClass("hide");
					me.cardSelector.find(".vcfloader").css("display", "none");
					$("#matrix-track .clinvar.loader").css("display", "none");
					$('#filter-track').addClass("hide");
				    $('#matrix-track').addClass("hide");

					clearFilters();
				} 
	    	});
		} 		
	}

}

VariantCard.prototype.showDataSources = function(dataSourceName) {
	this.name = dataSourceName;
	$('#add-datasource-container').css('display', 'none');

	var title = this.getRelationship().toUpperCase();
	if (title == null || title == '' || title == 'NONE') {
		title = 'Sample';
	}

   	this.cardSelector.find('#card-relationship-label').text(title);
   	this.cardSelector.find('#variant-card-label').text(dataSourceName);

}

VariantCard.prototype.loadDataSources = function(dataSourceName, callback) {
	var me = this;
	this.name = dataSourceName;

	if (window.gene == null) {
		callback();
		return;
	}

	if (!this.isDirty || !this.isViewable()) {
		this.isDirty = false;
		callback();
		return;
	}

	this.showDataSources(dataSourceName);

	this.cardSelector.find('#zoom-region-chart').css("visibility", "hidden");
	selection = this.d3CardSelector.select("#zoom-region-chart").datum([window.selectedTranscript]);
	this.zoomRegionChart.regionStart(+window.gene.start);
	this.zoomRegionChart.regionEnd(+window.gene.end);
	this.zoomRegionChart(selection);


	this.showBamDepth( regionStart, regionEnd, function() {
		me.showVariants( regionStart, regionEnd, function() {
			this.isDirty = false;
			if (callback) {
				callback();
			}
		});
	});
}

VariantCard.prototype.loadVcfDataSource = function(dataSourceName, callback) {
	var me = this;
	this.name = dataSourceName;

	if (window.gene == null) {
		callback();
		return;
	}

	if (!this.isDirty || !this.isViewable()) {
		this.isDirty = false;
		callback();
		return;
	}

	this.showDataSources(dataSourceName);

	this.cardSelector.find('#zoom-region-chart').css("visibility", "hidden");
	selection = this.d3CardSelector.select("#zoom-region-chart").datum([window.selectedTranscript]);
	this.zoomRegionChart.regionStart(+window.gene.start);
	this.zoomRegionChart.regionEnd(+window.gene.end);
	this.zoomRegionChart(selection);


	me.showVariants( regionStart, regionEnd, function() {
		this.isDirty = false;
		if (callback) {
			callback();
		}
	});
	
}
VariantCard.prototype.loadBamDataSource = function(dataSourceName, callback) {
	var me = this;

	this.name = dataSourceName;

	if (window.gene == null) {
		if (callback) {
			callback();
		}
		return;
	}

	if (!this.isDirty || !this.isViewable()) {
		this.isDirty = false;
		callback();
		return;
	}

	this.showDataSources(dataSourceName);

	selection = this.d3CardSelector.select("#zoom-region-chart").datum([window.selectedTranscript]);
	this.zoomRegionChart.regionStart(+window.gene.start);
	this.zoomRegionChart.regionEnd(+window.gene.end);
	this.zoomRegionChart(selection);


	this.showBamDepth( regionStart, regionEnd, function() {
		this.isDirty = false;
		if (callback) {
			callback();
		}
	});
}

VariantCard.prototype.getBamName = function() {
	return this.cardSelector.find('#bam-name-' + this.cardIndex).text();
}

VariantCard.prototype.getVcfName = function() {
	return this.cardSelector.find('#vcf-name').text();
}

VariantCard.prototype.getName = function() {
	return this.name;
}

VariantCard.prototype.getRelationship = function() {
	return this.relationship;
}

VariantCard.prototype.showVariantCircle = function(variant, sourceVariantCard) {
	// Check the fb called variants first.  If present, circle and don't
	// show X for missing variant on vcf variant chart.
	var matchingVariantFound = false;
	if (this.fbChart != null && this.fbData != null && this.fbData.features.length > 0) {
		var container = this.d3CardSelector.selectAll('#fb-variants svg');
		var parentContainer = this.d3CardSelector.selectAll('#fb-variants');
		matchingVariantFound = this.fbChart.showCircle()(variant, container, parentContainer, false, clickedVariant != null && this == sourceVariantCard);
	}
	if (this.vcfChart != null) {
		var container = this.d3CardSelector.selectAll('#vcf-variants svg');
		var parentContainer = this.d3CardSelector.selectAll('#vcf-variants');
		matchingVariantFound = this.vcfChart.showCircle()(variant, container, parentContainer, !matchingVariantFound, clickedVariant != null && this == sourceVariantCard);
	}
	
}

VariantCard.prototype.hideVariantCircle = function(variant) {
	if (this.vcfChart != null) {
		var container = this.d3CardSelector.selectAll('#vcf-variants svg');
		var parentContainer = this.d3CardSelector.selectAll('#vcf-variants');
		this.vcfChart.hideCircle()(container, parentContainer);
	}
	if (this.fbChart != null && this.fbData != null && this.fbData.features.length > 0) {
		var container = this.d3CardSelector.selectAll('#fb-variants svg');
		var parentContainer = this.d3CardSelector.selectAll('#fb-variants');
		this.fbChart.hideCircle()(container, parentContainer);
	}
}

VariantCard.prototype.showCoverageCircle = function(variant) {
	if (this.bamData) {
		this.bamDepthChart.showCircle()(variant.start);
    }
}

VariantCard.prototype.hideCoverageCircle = function() {
	if (this.bamData){
		this.bamDepthChart.hideCircle()();
	}	
}

VariantCard.prototype.shrinkCard = function(shrink) {

	this.minimizeCard(false);
	this.d3CardSelector.select('#button-find-missing-variants').classed("hide", shrink);
	this.d3CardSelector.select('#variant-right-labels').classed("hide", shrink);
	this.d3CardSelector.select('#vcf-chart-label').classed("hide", shrink);
	this.d3CardSelector.select('#variant-right-labels').classed("hide", shrink);

	this.d3CardSelector.select('#zoom-region-chart').classed("hide", shrink);
	this.d3CardSelector.select('#bam-track').classed("hide", shrink);

	this.cardSelector.css("padding-bottom", shrink ? "4px" : "10px");

}

VariantCard.prototype.minimizeCard = function(minimize) {
	this.d3CardSelector.select('#button-find-missing-variants').classed("hide", minimize);
	this.d3CardSelector.select('#variant-right-labels').classed("hide", minimize);
	this.d3CardSelector.select('#vcf-chart-label').classed("hide", minimize);
	this.d3CardSelector.select('#variant-right-labels').classed("hide", minimize);

	this.d3CardSelector.select('#variant-panel-' + this.cardIndex).classed("hide", minimize);
	this.cardSelector.css("padding-bottom", minimize ? "4px" : "10px");
}

/* 
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
VariantCard.prototype.loadTracksForGene = function (classifyClazz, callback) {
	var me = this;
	this.vcfData = null;
	this.fbData = null;
	this.bamData = null;

	if (this.isViewable()) {
		filterCard.clearFilters();

		this.vcfChart.clazz(classifyClazz);

		if (this.bam || this.vcf) {	      
			this.cardSelector.find('#zoom-region-chart').css("visibility", "hidden");
			selection = this.d3CardSelector.select("#zoom-region-chart").datum([window.selectedTranscript]);
			this.zoomRegionChart.regionStart(+window.gene.start);
			this.zoomRegionChart.regionEnd(+window.gene.end);
			this.zoomRegionChart(selection);

		}
		this.cardSelector.find('#bam-depth').addClass("hide");
		this.cardSelector.find('#bam-chart-label').addClass("hide");
		this.cardSelector.find('#button-find-missing-variants').css("visibility", "hidden");


    	me.cardSelector.find('#variant-badges').addClass("hide");
    	me.cardSelector.find('#displayed-variant-count').text("");
    	me.cardSelector.find('#vcf-variant-count').text("");
    	me.cardSelector.find('#missing-variant-count').text("");
    	me.cardSelector.find('#missing-variant-count-label').text("Find Missing Variants");


		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find('#vcf-chart-label').addClass("hide");
		this.cardSelector.find('#vcf-name').addClass("hide");		
		this.cardSelector.find(".vcfloader").css("display", "block");
		this.cardSelector.find('.vcfloader .loader-label').text("Loading Data for " + window.gene.gene_name)

		$("#feature-matrix").addClass("hide");


		// Load the read coverage and variant charts.  If a bam hasn't been
		// loaded, the read coverage chart and called variant charts are
		// not rendered.  If the vcf file hasn't been loaded, the vcf variant
		// chart is not rendered.
		this.showBamDepth( null, null, function() {
			me.showVariants( null, null, function() {
				this.isDirty = false;
				if (callback) {
					callback();
				}
		});
	});


		this.fillFreebayesChart(this.fbData, window.gene.start, window.gene.end);
	}
}

VariantCard.prototype.onBrush = function(brush) {
	//if (!brush.empty()) {

		//this.cardSelector.find('#bam-track').css("margin-top", "-70px");

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
		this.cardSelector.find(".vcfloader").css("display", "none");
		this.cardSelector.find('#vcf-name').removeClass("hide");		

	//} else {
		// Treat a click as a region selection on the entire gene region.
		// That way, we won't recall the variants and re-read the bam and
		// vcf files, but instead just use the data already gathered for 
		// the entire gene region;
		
		//this.cardSelector.find('#bam-track').css("margin-top", "-30px");
		
		//this.cardSelector.find('#zoom-region-chart').addClass("hide");
		//var h = $("#nav-section").height();
		//$('#track-section').css("padding-top", h + "px");
	//}

	

	this.showBamDepth(regionStart, regionEnd);
	this.showVariants(regionStart, regionEnd);
	this.showFreebayesVariants(regionStart, regionEnd);

}


VariantCard.prototype.showBamDepth = function(regionStart, regionEnd, callbackDataLoaded) {	
	var me = this;



	if (this.bam && this.bamUrlEntered) {

	} else if (this.bam == null || 
		(!this.bamFileOpened) ||
	    (this.bamFileOpened && this.getBamRefName == null)) {
		if (callbackDataLoaded) {
			callbackDataLoaded();
		}
		return;
	}


	this.cardSelector.removeClass("hide");
	this.cardSelector.find('#bam-track').removeClass("hide");
	this.cardSelector.find('#bam-name-' + this.cardIndex).addClass("hide");
	

	if (this.bamData) {
		if (regionStart && regionEnd) {
			var filteredData = this.bamData.filter(function(d) { 
				return (d[0] >= regionStart && d[0] <= regionEnd);
			}); 
			me.fillBamChart(filteredData, regionStart, regionEnd);
		} else {
			me.fillBamChart(me.bamData, window.gene.start, window.gene.end);
		}
		if (callbackDataLoaded) {
	   	    callbackDataLoaded();
   	    }
	} else {

		// A gene has been selected.  Read the bam file to obtain
		// the read converage.
		var refName = this.getBamRefName(window.gene.chr);
	 	this.bam.getCoverageForRegionChunked(refName, window.gene.start, window.gene.end, 
	 		0, 
	 		function(data) {
	 			if (data == null) {
	 				return;
	 			}
				me.bamData = data;

				me.cardSelector.find("#bam-track .loader-label").text("Loading Coverage Chart")

				if (regionStart && regionEnd) {
					var filteredData = me.bamData.filter(function(d) { 
						return (d[0] >= regionStart && d[0] <= regionEnd);
					}); 
					me.fillBamChart(filteredData, regionStart, regionEnd);
				} else {
					me.fillBamChart(me.bamData, window.gene.start, window.gene.end);
				}
				
				if (callbackDataLoaded) {
			   	    callbackDataLoaded();
		   	    }

			});
	}




}


VariantCard.prototype.getBamDepthAtPos = function(pos) {
	var data = this.d3CardSelector.select("#bam-depth").datum();
	if (data == undefined) return null;

	var d;
    
	for (var i = 0; i < data.length - 1; i++) {
		if ( (pos >= data[i][0])  &&  (pos <= data[i+1][0]) ) {
	  		d = data[i];
	  		break;
		}
	}
	return d[1];
}


VariantCard.prototype.fillBamChart = function(data, regionStart, regionEnd) {
	if (this.isViewable()) {
		// Reduce down to 1000 points
		var factor = d3.round(data.length / 1000);
        var reducedData = this.bam.reducePoints(data, factor, function(d) {return d[0]}, function(d) {return d[1]});

		this.cardSelector.find("#bam-track .loader").css("display", "none");
	    this.cardSelector.find('#bam-name-' + this.cardIndex).removeClass("hide");		
		this.cardSelector.find('#bam-depth').removeClass("hide");
		this.cardSelector.find('#bam-chart-label').removeClass("hide");
		this.cardSelector.find('#button-find-missing-variants').css("visibility", "visible");

		if (this.cardSelector.find('.vcfloader .loader-label').text().indexOf("Loading Data for") == 0) {
			this.cardSelector.find(".vcfloader").css("display", "none");
		}



		this.bamDepthChart.xStart(regionStart);
		this.bamDepthChart.xEnd(regionEnd);

		// Decide if we should show the x-axis.
		this.bamDepthChart.showXAxis(!(this.vcf && this.vcf.hasFileOrUrl()));
		this.bamDepthChart.margin(!(this.vcf && this.vcf.hasFileOrUrl()) ? {top: 10, right: 4, bottom: 20, left: 4} : {top: 10, right: 4, bottom: 0, left: 4} );
	
		this.bamDepthChart(this.d3CardSelector.select("#bam-depth").datum(reducedData));		
		this.d3CardSelector.select("#bam-depth .x.axis .tick text").style("text-anchor", "start");

		this.cardSelector.find('#zoom-region-chart').css("visibility", "visible");
		this.cardSelector.find('#zoom-region-chart').css("margin-top", "5px");
		this.cardSelector.find('#zoom-region-chart').css("margin-bottom", "-90px");


	}
}

VariantCard.prototype.showFreebayesVariants = function(regionStart, regionEnd) {
	if (this.fbData == null) {
		return;
	}

	if (this.isViewable()) {
		var fbDataFiltered = {features: null};
		fbDataFiltered.features = this.fbData.features.filter(function(d) {
			return (d.start >= regionStart && d.start <= regionEnd);
		});
		var filteredVcfData = this.filterVariants(fbDataFiltered, this.fbChart);
		if (regionStart && regionEnd)
  			this.fillFreebayesChart(filteredVcfData, regionStart, regionEnd);
  		else
  			this.fillFreebayesChart(filteredVcfData, window.gene.start, window.gene.end);
	}
}

VariantCard.prototype.showVariants = function(regionStart, regionEnd, callbackDataLoaded) {
	
	var me = this;

	if (this.vcf && this.vcfUrlEntered) {

	} else if (this.vcf && this.vcfFileOpened) {

	} else {
		if (callbackDataLoaded) {
			callbackDataLoaded();
		}
		return;
	}

	if (this.isViewable()) {
		this.cardSelector.removeClass("hide");
		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find(".vcfloader").css("display", "block");
		this.cardSelector.find('#vcf-name').addClass("hide");		
	}


	if( this.vcfData) {

		// The user has selected a region to zoom into.  Filter the
		// variants based on the selected region
		if (this.isViewable()) {
			var filteredVcfData = this.filterVariants();
			me.cardSelector.find('#displayed-variant-count').text(filteredVcfData.features.length != null ? filteredVcfData.features.length : "0");
			if (regionStart && regionEnd)
	  			this.fillVariantChart(filteredVcfData, regionStart, regionEnd);
	  		else
	  			this.fillVariantChart(filteredVcfData, window.gene.start, window.gene.end);
		}
		if (callbackDataLoaded) {
	   	    callbackDataLoaded();
   	    }

	
	} else {

		if (this.isViewable()) {
		    this.cardSelector.find('.vcfloader .loader-label').text("Annotating Variants with snpEff in realtime");
		}



		// A gene has been selected.  Read the variants for the gene region.
		this.discoverVcfRefName( function() {

			if (me.getRelationship() == 'proband') {
				$("#matrix-track .clinvar.loader").css("display", "inline");
			}

			me.vcf.getVariants(me.getVcfRefName(window.gene.chr), 
							   window.gene.start, 
	                           window.gene.end, 
	                           window.gene.strand, 
	                           window.selectedTranscript,
	                           this.afMin,
	                           this.afMax,
	                           function(data) {
		        me.vcfData = data;

		        if (me.vcfData == null || me.vcfData.features == null || me.vcfData.features.length == 0) {
					me.cardSelector.find(".vcfloader").css("display", "none");
					$("#matrix-track .clinvar.loader").css("display", "none");
					$('#filter-track').addClass("hide");
				    $('#matrix-track').addClass("hide");
				    me.cardSelector.find("#vcf-track").addClass("hide");
				    me.cardSelector.find("#vcf-variant-count").text("");
				    me.cardSelector.find("#button-find-missing-variants").addClass("hide");
		
				} else {

			        me.cardSelector.find('#vcf-variant-count').text(me.vcfData.features.length != null ? me.vcfData.features.length : "0");

			        // We have the AFs from 1000G and ExAC.  Now set the level so that variants
			        // can be filtered by range.
			        me.determineVariantAfLevels(me.vcfData);

			   	    if (me.isViewable()) {
				   	    me.cardSelector.find('.vcfloader .loader-label').text("Loading variant chart");
				   	    var filteredVcfData = me.filterVariants();
				   	    if (regionStart && regionEnd)
					  		me.fillVariantChart(filteredVcfData, regionStart, regionEnd);
					  	else
					  		me.fillVariantChart(filteredVcfData, window.gene.start, window.gene.end);
					  	
					  	filterCard.enableVariantFilters(true);
					  	
			   	    }
			   	    if (callbackDataLoaded) {
				   	    callbackDataLoaded();
			   	    }
				}

			},
			me.refreshVariantsWithClinvar.bind(me));	

		});

	}

	// Get the vcf stats for this region
	if (this.isViewable()) {
		this.vcfAfData = null;
		this.cardSelector.find('#af').addClass("hide");		
		/*
		this.discoverVcfRefName( function() {
			var regionParm = {'name': me.getVcfRefName(window.gene.chr), 
							  'start': regionStart ? regionStart : window.gene.start, 
							  'end':   regionEnd   ? regionEnd   : window.gene.end
							 };
			me.vcf.getStats(null, regionParm, {}, function(stats) {
				// Alelle Frequency
				var afObj = stats.af_hist;
				vcfAfData = me.vcf.jsonToArray2D(afObj);	
				var afSelection = me.d3CardSelector.select("#vcf-af-chart")
								    .datum(vcfAfData);
				var afOptions = {outliers: true, averageLine: false};		
				me.cardSelector.find('#af').removeClass("hide");			    
				me.afChart.call(afSelection, afSelection, afOptions);	
			});

		});
		*/
	}

}

VariantCard.prototype.determineVariantAfLevels = function(theVcfData) {
	var me = this;
    // Post processing:
    // We have the af1000g and afexac, so now determine the level for filtering
    // by range.  
    theVcfData.features.forEach(function(variant) {
    	// For ExAC levels, differentiate between af not found and in 
    	// coding region (level = private) and af not found and intronic (non-coding) 
    	// region (level = unknown)
    	if (variant.afExAC == 0) {
        	window.selectedTranscriptCodingRegions.forEach(function(codingRegion) {
        		if (variant.start >= codingRegion.start && variant.end <= codingRegion.end) {		        			
        		} else {
        			variant.afExAC = -100;
        		}
        	});
    	}

		matrixCard.afExacMap.forEach( function(rangeEntry) {
			if (+variant.afExAC > rangeEntry.min && +variant.afExAC <= rangeEntry.max) {
				variant.afexaclevel = rangeEntry.clazz;
			}
		});
		matrixCard.af1000gMap.forEach( function(rangeEntry) {
			if (+variant.af1000G > rangeEntry.min && +variant.af1000G <= rangeEntry.max) {
				variant.af1000glevel = rangeEntry.clazz;
			}
		});


	});

}



VariantCard.prototype._pileupVariants = function(theChart, features, start, end) {
	var me = this;
	features.forEach(function(v) {
		v.level = 0;
	});

	theChart.lowestWidth(4);
	var posToPixelFactor = Math.round((end - start) / this.vcfChart.width());
	var maxLevel = this.vcf.pileupVcfRecords(features, window.gene.start, posToPixelFactor, this.vcfChart.lowestWidth() + 1);


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
			maxLevel = me.vcf.pileupVcfRecords(features, start, factor, theChart.lowestWidth() + 1);
			if (maxLevel <= 50) {
				i = posToPixelFactor;
				break;
			}
		}
	}
	return maxLevel;
}

VariantCard.prototype.fillVariantChart = function(data, regionStart, regionEnd, bypassFeatureMatrix) {
	
	if (bypassFeatureMatrix == null) {
		bypassFeatureMatrix = false;
	}


	$('#vcf-legend').css("display", "block");		
	this.cardSelector.find('#vcf-chart-label').removeClass("hide");		
	this.cardSelector.find('#vcf-name').removeClass("hide");		
	this.cardSelector.find('#variant-badges').removeClass("hide");		
	this.cardSelector.find('#vcf-variants').css("display", "inline");	
	this.cardSelector.find(".vcfloader").css("display", "none");

	this.vcfChart.regionStart(regionStart);
	this.vcfChart.regionEnd(regionEnd);
	
	// Set the vertical layer count so that the height of the chart can be recalculated	     
	if (data.maxLevel == null) {
		data.maxLevel = d3.max(data.features, function(d) { return d.level; });
	}                           	
	this.vcfChart.verticalLayers(data.maxLevel);

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

    $('#filter-track').removeClass("hide");
    $('#matrix-track').removeClass("hide");
    
	    
   	this.d3CardSelector.select("#vcf-variants .x.axis .tick text").style("text-anchor", "start");

   	if (this.fbData) {
   		$('#compare-legend').removeClass("hide");
   	}

   	// Fill in the feature matrix for the proband variant card.
   	if (!bypassFeatureMatrix) {
	   	if ( this.getRelationship() == 'proband') {
	   		window.matrixCard.setFeatureMatrixSource(data);
	   	}
	}



}

VariantCard.prototype.showFeatureMatrix = function(showInheritance) {
	window.matrixCard.showFeatureMatrix(this, this.vcfData, regionStart, regionEnd, showInheritance);
}

VariantCard.prototype.fillFeatureMatrix = function(regionStart, regionEnd) {
	var filteredVcfData = this.filterVariants(this.vcfData);
	
	window.matrixCard.fillFeatureMatrix(filteredVcfData);
}

VariantCard.prototype.refreshVariantsWithClinvar = function(clinVars) {	
	var me = this;
	var recs = this.vcfData.features.sort(orderVariantsByPosition);
	var clinVarIds = clinVars.uids;

	for( var vcfIter = 0, clinIter = 0; vcfIter < recs.length && clinIter < clinVarIds.length; null) {
		var uid = clinVarIds[clinIter];
		var clinVarStart = clinVars[uid].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].start;
		var clinVarAlt   = clinVars[uid].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].alt;
		var clinVarRef   = clinVars[uid].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].ref;

		
		// compare curr variant and curr clinVar record
		if (recs[vcfIter].clinvarStart == clinVarStart) {			
			// add clinVar info to variant if it matches
			if (recs[vcfIter].clinvarAlt == clinVarAlt &&
				recs[vcfIter].clinvarRef == clinVarRef) {
				me.addClinVarInfoToVariant(recs[vcfIter], clinVars[uid]);
			}
			vcfIter++;
			clinIter++;
		} else if (recs[vcfIter].start < clinVarStart) {						
			vcfIter++;
		} else {
			clinIter++;
		}
	}
	filterCard.enableClinvarFilters(this.vcfData);

	this.showVariants(regionStart, regionEnd);
	if (this.getRelationship() == 'proband') {
		$("#matrix-track .clinvar.loader").css("display", "none");
		window.matrixCard.fillFeatureMatrix(this.vcfData);
	}

}

VariantCard.prototype.addClinVarInfoToVariant = function(variant, clinvar) {		
	variant.clinVarUid = clinvar.uid;

	if (!variant.clinVarAccession) {
		variant.clinVarAccession = clinvar.accession;
	}

	var clinSigObject = variant.clinVarClinicalSignificance;
	if (clinSigObject == null) {
		variant.clinVarClinicalSignificance = {"none": "Y"};
	}

	var clinSigString = clinvar.clinical_significance.description;
	var clinSigTokens = clinSigString.split(", ");
	clinSigTokens.forEach( function(clinSigToken) {
		if (clinSigToken != "") {		
			// Replace space with underlink
			clinSigToken = clinSigToken.split(" ").join("_").toLowerCase();
			variant.clinVarClinicalSignificance[clinSigToken] = 'Y';

			// Get the clinvar "classification" for the highest ranked clinvar 
			// designation. (e.g. "pathologic" trumps "benign");
			var mapEntry = matrixCard.clinvarMap[clinSigToken];
			if (mapEntry != null) {
				if (variant.clinvarRank == null || 
					mapEntry.value < variant.clinvarRank) {
					variant.clinvarRank = mapEntry.value;
					variant.clinvar = mapEntry.clazz;
				}
			}		
		}

	});



	var phenotype = variant.clinVarPhenotype;
	if (phenotype == null) {
		variant.clinVarPhenotype = {};
	}

	var phTokens = clinvar.trait_set.map(function(d) { return d.trait_name; }).join ('; ')
	if (phTokens != "") {
		var tokens = phTokens.split("; ");
		tokens.forEach(function(phToken) {
			// Replace space with underlink
			phToken = phToken.split(" ").join("_");
			variant.clinVarPhenotype[phToken.toLowerCase()] = 'Y';
		});
	}

	// if (variant.ncbiId) {
	// 	variant.ncbiId = clinvar.ncbiId;
	// }
	// if (!variant.hgvsG) {
	// 	variant.hgvsG = clinvar.hgvsG;
	// }	
}

VariantCard.prototype.fillFreebayesChart = function(data, regionStart, regionEnd) {
	var me = this;
	
	if (data) {
		this.cardSelector.find('#fb-chart-label').removeClass("hide");
		this.cardSelector.find('#fb-separator').removeClass("hide");

		this.fbChart.regionStart(regionStart);
		this.fbChart.regionEnd(regionEnd);
	
		// Set the vertical layer count so that the height of the chart can be recalculated	    
		this.fbChart.verticalLayers(data.maxLevel);

		// Load the chart with the new data
		var selection = this.d3CardSelector.select("#fb-variants").datum([data]);    
	    this.fbChart(selection);

		this.cardSelector.find('#displayed-variant-count').text(this.vcfData.features.length);

		this.cardSelector.find('.vcfloader').css("display", "none");

	   	this.d3CardSelector.select("#fb-variants .x.axis .tick text").style("text-anchor", "start");


	}  else {
		this.cardSelector.find('#fb-chart-label').addClass("hide");
		this.cardSelector.find('#fb-separator').addClass("hide");
		this.d3CardSelector.select('#fb-variants svg').remove();
	}                      	

	

}

VariantCard.prototype.callVariants = function(regionStart, regionEnd) {
	var me = this;


	if (this.bam == null || this.getBamRefName == null) {
		return;
	}


	//var refName = this.getBamRefName(window.gene.chr);
	// TODO:  Need to evaluate bam header to determine if 'chr' should be stripped
	// from reference names
	var refName = window.gene.chr;

	if (this.fbData && regionStart && regionEnd) {
		

	} else {

		// A gene has been selected.  Read the variants for the gene region.

		if (this.isViewable()) {
			this.cardSelector.find("#vcf-track").removeClass("hide");
			this.cardSelector.find(".vcfloader").removeClass("hide");
			this.cardSelector.find(".vcfloader").css("display", "block");
			this.cardSelector.find('.vcfloader .loader-label').text("Calling Variants with Freebayes");
		}


		// Call Freebayes variants
		this.bam.getFreebayesVariants(refName, 
			window.gene.start, 
			window.gene.end, 
			window.gene.strand, 
			function(data) {

			if (data == null || data.length == 0) {
				return;
			}

			// Parse string into records
			var fbRecs = [];
			
			var contigHdrRecFound = false;
			var recs = data.split("\n");
			recs.forEach( function(rec) {
				if (rec.indexOf("##contig") == 0) {
					contigHdrRecFound = true;
				}
				// We need to inject in the contig header for downstream servers to function properly
				if (rec.indexOf("#CHROM") == 0 && !contigHdrRecFound) {
					//fbRecs.push("##contig=<ID=" + me.getBamRefName(refName) + ">");
				}
				fbRecs.push(rec);
			});



			
			
			
			if (me.isViewable()) {
				me.cardSelector.find(".vcfloader .loader-label").text("Annotating variants with snpEFF in realtime")

				// Annotate the fb variants
				me.vcf.annotateVcfRecords(fbRecs, me.getBamRefName(refName), window.gene.start, window.gene.end, 
					window.gene.strand, window.selectedTranscript, function(data){

				   	data.features.forEach( function(feature) {
				   		feature.fbCalled = 'Y';
				   	});

					me.fbData = data;

		        	me.determineVariantAfLevels(me.fbData);

					
        			// Flag the variants as called by Freebayes and add unique to vcf
        			// set
					me.vcfData.features = me.vcfData.features.filter( function(feature) {
				   		return feature.fbCalled == null;
				   	});

					// This may not be the first time we call freebayes, so to
					// avoid duplicate variants, get rid of the ones
					// we added last round.					
					me.vcfData.features = me.vcfData.features.filter( function(d) {
						return d.consensus != 'unique2';
					});	
						
					filterCard.enableVariantFilters(true);


					me.cardSelector.find('.vcfloader .loader-label').text("Comparing call sets");

					// We have to order the variants in both sets before comparing
					me.vcfData.features = me.vcfData.features.sort(orderVariantsByPosition);					
					me.fbData.features  = me.fbData.features.sort(orderVariantsByPosition);


					// Compare the variant sets, marking the variants as unique1 (only in vcf), 
					// unique2 (only in freebayes set), or common (in both sets).				
					me.vcf.compareVcfRecords(me.vcfData, me.fbData, function() {						

				    	// Add unique freebayes variants to vcfData
				    	me.fbData.features = me.fbData.features.filter(function(d) {
				    		return d.consensus == 'unique2';
				    	});
				    	me.cardSelector.find('#missing-variant-count').text(me.fbData.features.length);
				    	me.cardSelector.find('#missing-variant-count-label').text("Missing");

				    	// Add the unique freebayes variants to vcf data to include 
				    	// in feature matrix
				    	me.fbData.features.forEach( function(feature) {
					   		me.vcfData.features.push($.extend({}, feature));
					   	});
					   	// Figure out max level (lost for some reason)
					   	var maxLevel = 1;
					   	me.vcfData.features.forEach(function(feature) {
					   		if (feature.level > maxLevel) {
					   			maxLevel = feature.level;
					   		}
					   	});
					   	me.vcfData.maxLevel = maxLevel;

				        maxLevel = me._pileupVariants(me.fbChart, me.fbData.features, gene.start, gene.end);
						me.fbData.maxLevel = maxLevel + 1;

				  		
						me.cardSelector.find('.vcfloader .loader-label').text("Loading chart");

				    	me.fillFreebayesChart(me.fbData, window.gene.start, window.gene.end);

				    	
						// Figure out inheritance 
						promiseFullTrio();


						
				    });
				}, me.refreshVariantsWithClinvar.bind(me));
			}
			
		});

	}

} 



VariantCard.prototype.variantClass = function(clazz) {
	this.vcfChart.clazz(clazz);
}

VariantCard.prototype.getRefName = function(refName) {
	return refName;
}

VariantCard.prototype.stripRefName = function(refName) {
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

VariantCard.prototype.filterFreebayesVariants = function() {
	if (this.fbData != null) {
		return  this.filterVariants(this.fbData, this.fbChart)
	} else {
		return null;
	}
}



VariantCard.prototype.filterVariants = function(dataToFilter, theChart) {
	var me = this;

	me.cardSelector.find(".filter-flag").addClass("hide");

	// Only hide displayed variant count if we haven't already zoomed
	if (this.cardSelector.find("#region-flag.hide").length > 0) {
		this.cardSelector.find("#displayed-variant-count").addClass("hide");
	}


	var data = dataToFilter ? dataToFilter : this.vcfData;

	if (data == null || data.features == null || data.features.length == 0) {
		return;
	}

	if ($('#afexac-scheme').attr('class').indexOf("current") >= 0) {
		afField = "afExAC";
	} else {
		afField = "af1000G";
	}

	var afLowerVal = null;
	var afUpperVal = null;
	if ($('#af-amount-start') != '' && $('#af-amount-end') != '') {
		afLowerVal  = +$('#af-amount-start').val() / 100;
		afUpperVal  = +$('#af-amount-end').val() / 100;
	} 

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


	var coverageMin = null;
	if ($('#coverage-min') != '') {
		coverageMin = +$('#coverage-min').val();
	}
	   
	var filteredFeatures = data.features.filter(function(d) {

		var meetsRegion = true;
		if (window.regionStart != null && window.regionEnd != null ) {			
			meetsRegion = (d.start >= window.regionStart && d.start <= window.regionEnd);
		}

		var meetsAf = false;
		// Treat null and blank af as 0
		if (d[afField] == null || d[afField] == '') {
			variantAf = 0;
		} else {
			variantAf = d[afField];
		}
		if (afLowerVal != null && afUpperVal != null) {
			if (afLowerVal <= 0 && afUpperVal == 1) {
				meetsAf = true;
			} else {
				
				meetsAf =  (variantAf >= afLowerVal && variantAf <= afUpperVal);
			}
		} else {
			meetsAf = true;
		}

		// TODO:  If combinedDepth not provided, access bam data to determine coverage for this
		// region of variant
		var meetsCoverage = true;
		if (coverageMin) {
			me.cardSelector.find("#coverage-flag").removeClass("hide");
			me.cardSelector.find("#displayed-variant-count").removeClass("hide");
			if (d.genotypeDepth != null && d.genotypeDepth != '') {
				meetsCoverage = d.genotypeDepth >= coverageMin;
			} else {
				meetsCoverage = me.getBamDepthAtPos(d.start) >= coverageMin;
			}
		}

		// Iterate through the clicked annotations for each variant. The variant
		// needs to match needs to match
		// at least one of the selected values (e.g. HIGH or MODERATE for IMPACT)
		// for each annotation (e.g. IMPACT and ZYGOSITY) to be included.
		var matchCount = 0;
		var evalAttributes = {};
		for (key in filterCard.annotsToInclude) {
			var annot = filterCard.annotsToInclude[key];
			if (annot.state) {
				if (evalAttributes[annot.key] == null) {
					evalAttributes[annot.key] = 0;
				}
				me.cardSelector.find("#" + annot.key + "-flag").removeClass("hide");
				me.cardSelector.find("#displayed-variant-count").removeClass("hide");

				var annotValue = d[annot.key] ? d[annot.key] : '';				
				var match = false;
				if (matrixCard.isDictionary(annotValue)) {
					for (avKey in annotValue) {
						if (avKey.toLowerCase() == annot.value.toLowerCase()) {
							match = true;
						}
					}
				} else  if (annotValue.toLowerCase() == annot.value.toLowerCase()){
					match = true;
				}
				if (match) {
					var count = evalAttributes[annot.key];
					count++;
					evalAttributes[annot.key] = count;
				}
			} else {
				me.cardSelector.find("#" + annot.key + "-flag").addClass("hide");

			}
		}

		// If zero annots to evaluate, the variant meets the criteria.
		// If annots are to be evaluated, the variant must match
		// at least one value for each annot to consider.
		var meetsAnnot = true;
		for (key in evalAttributes) {
			var count = evalAttributes[key];
			if (count == 0) {
				meetsAnnot = false;
			}
		}


		return meetsRegion && meetsAf && meetsCoverage && meetsAnnot;
	});

	
	var maxLevel = this._pileupVariants(theChart ? theChart : this.vcfChart, 
		filteredFeatures, 
		regionStart ? regionStart : window.gene.start, 
		regionEnd   ? regionEnd   : window.gene.end);		

	var vcfDataFiltered = {	count: data.count,
							countMatch: data.countMatch,
							countUnique: data.countUnique,
							end: regionEnd,
							features: filteredFeatures,
							maxLevel: maxLevel + 1,
							name: data.name,
							start: regionStart,
							strand: data.strand,
							variantRegionStart: regionStart
						};
	return vcfDataFiltered;
}



VariantCard.prototype.compareVcfRecords = function(theVcfData, finishCallback, compareAttribute, matchAttribute, matchCallback ) {
	var me = this;

	if (this.vcfData == null) {
		this.discoverVcfRefName( function() {

			me.vcf.getVariants(me.getVcfRefName(window.gene.chr), 
			 window.gene.start, 
			 window.gene.end, 
			 window.gene.strand, 
			 window.selectedTranscript,
			 0,
			 1,
			 function(data) {
			 	me.vcfData = data;
			 	me.vcfData.features = me.vcfData.features.sort(orderVariantsByPosition);
				me.vcfData.features.forEach( function(feature) {
					feature[compareAttribute] = '';
				});
				me.vcf.compareVcfRecords(theVcfData, me.vcfData, finishCallback, compareAttribute, matchCallback); 								 	
			 });
		});
		
	} else {
		this.vcfData.features = this.vcfData.features.sort(orderVariantsByPosition);
		this.vcfData.features.forEach( function(feature) {
			feature[compareAttribute] = '';
		});
		this.vcf.compareVcfRecords(theVcfData, me.vcfData, finishCallback, compareAttribute, matchCallback); 	
	}


}



VariantCard.prototype.getWidthFactor = function(regionStart, regionEnd) {
	var regionSize = regionEnd - regionStart;
	var widthFactor = 1;
	widthFactors.forEach( function(wf) {
		if (regionSize >= wf.regionStart && regionSize <= wf.regionEnd) {
			widthFactor = wf.factor;
		}
	});
	return widthFactor;
}


