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

VariantCard.prototype.highlightVariants = function(variants) {
	if (variants != null && variants.length > 0) {
		this.d3CardSelector.selectAll("#vcf-variants .variant")
		    .style("opacity", .1);
		this.d3CardSelector.selectAll("#vcf-variants .variant")
		    .filter( function(d,i) {
		     	var found = false;
		     	variants.forEach(function(variant) {
			        if (d.start == variant.start && d.end == variant.end && d.type == variant.type) {
			          found = true;
			        } 
		     	});
		     	return found;
		     })
		     .style("opacity", 1);  			
	} else {
		this.d3CardSelector.selectAll("#vcf-variants .variant")
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
				    .margin({top: 10, right: 4, bottom: 0, left: 4})
				    .showXAxis(false)
				    .showBrush(false)
				    .trackHeight(12)
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
				    .on('d3mouseover', function(d) {
				    	if (me.bamData) {
							me.bamDepthChart.showCircle()(d.start);
				    	}
					})
					.on('d3mouseout', function() {
						if (me.bamData){
							me.bamDepthChart.hideCircle()();
						}
					});

	 	// Create allele frequency chart
	 	// Allele freq chart)
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

	}


};

VariantCard.prototype.onBamFilesSelected = function(event) {
	var me = this;


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

		$('#datasource-dialog #bam-file-info').removeClass('hide');
		$('#datasource-dialog #bam-file-info').val(bamFile.name);
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
		 		} else if (ref.name == me.stripRefName(gene.chr)) {
		 			me.getBamRefName = me.stripRefName;
		 		}
			}
		});
	
	});
}

VariantCard.prototype.onBamUrlEntered = function(bamUrl) {
	this.cardSelector.find("#bam-track .loader").css("display", "block");
	this.cardSelector.find("#bam-track .loader-label").text("Streaming Alignment File")

	this.cardSelector.find('#bam-name-' + this.cardIndex).text(bamUrl);
    
    this.bam = new Bam(bamUrl);
    this.bamUrlEntered = true;
    this.getBamRefName = this.stripRefName;

}

VariantCard.prototype.onVcfFilesSelected = function(event) {
	var me = this;
	this.vcfFileOpened = true;

	if (this.isViewable()) {
		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find("#vcf-track .loader").css("display", "block");
		this.cardSelector.find('#vcf-track .loader-label').text("Loading VCF");
	}

	this.vcf.openVcfFile( event, function(vcfFile) {

		me.cardSelector.find('#vcf-name').text(vcfFile.name);
		$('#datasource-dialog #vcf-file-info').removeClass('hide');
		$('#datasource-dialog #vcf-file-info').val(vcfFile.name);

		
		me.getVcfRefName = null;
		me.vcf.getReferenceNames(function(refNames) {

			// Figure out if whe need to strip 'ch' or 'chr' from ref name to
			// match to bam reference names
			refNames.forEach(function(refName) {				
				if (me.getVcfRefName == null) {
			 		if (refName == window.gene.chr) {
			 			me.getVcfRefName = me.getRefName;
			 		} else if (refName == me.stripRefName(gene.chr)) {
			 			me.getVcfRefName = me.stripRefName;
			 		}
				}
			});
			return callback();
		});

	});

}

VariantCard.prototype.onVcfUrlEntered = function(vcfUrl) {
	var me = this;
	
	if (this.isViewable()) {
		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find("#vcf-track .loader").css("display", "block");
		this.cardSelector.find('#vcf-track .loader-label').text("Streaming Variant Data");
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
	}
	if (!this.vcf.isFile()) {

		this.vcf.loadRemoteIndex(null, function(refData) {
	    	refData.forEach( function(ref) {
	    		if (me.getVcfRefName == null) {
			 		if (ref.name == window.gene.chr) {
			 			me.getVcfRefName = me.getRefName;
			 		} else if (ref.name == me.stripRefName(gene.chr)) {
			 			me.getVcfRefName = me.stripRefName;
			 		}
				}
	    	});
	    	return callback();
    	});
	} 
}

VariantCard.prototype.showDataSources = function(dataSourceName) {
		this.name = dataSourceName;
		$('#add-datasource-container').css('display', 'none');

		var cache = this.cardSelector.find('#variant-link').children();
	   	this.cardSelector.find('#variant-link').text(dataSourceName).append(cache);
	   	this.cardSelector.find('#variant-link').attr("aria-expanded", true);
	   	this.cardSelector.find('#variant-panel-' + this.cardIndex).attr("aria-expanded", true);
	   	this.cardSelector.find('#variant-panel-' + this.cardIndex).addClass("in");
<<<<<<< Updated upstream
}

VariantCard.prototype.loadDataSources = function(dataSourceName) {
	this.name = dataSourceName;

	if (this.isViewable()) {
		this.showDataSources();

		// Show the read coverage 		
=======
	}

	// Show the read coverage 
	this.showBamDepth();
>>>>>>> Stashed changes

	if (this.isViewable()) {
		if (regionStart && regionEnd) {
			this.showBamDepth(regionStart, regionEnd);
		} else {
			this.showBamDepth();
		}
<<<<<<< Updated upstream
	    
=======
	}

    // Show the vcf variants.  
	this.showVariants();
>>>>>>> Stashed changes

	if (this.isViewable()) {
		// If a sub-region of the gene was selected, 
		// show the read coverage and called variants
		// for the filtered region.  (Note: it is necessary
		// to first get the full data for read coverage and
		// the called variants so that subsequent selections
		// can just filter on the full data.)
		if (regionStart && regionEnd) {
			this.showVariants(regionStart, regionEnd);
		} else {
			// Show the vcf variants.  
			this.showVariants();
		}
	}

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

/* 
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
VariantCard.prototype.loadTracksForGene = function (classifyClazz) {

	this.vcfData = null;
	this.fbData = null;
	this.bamData = null;

	if (this.isViewable()) {
		clearFilters();

		this.vcfChart.clazz(classifyClazz);

		if (this.bam || this.vcf) {	       			
			selection = this.d3CardSelector.select("#zoom-region-chart").datum([]);
			this.zoomRegionChart.regionStart(+window.gene.start);
			this.zoomRegionChart.regionEnd(+window.gene.end);
			this.zoomRegionChart(selection);
		}

		// Load the read coverage and variant charts.  If a bam hasn't been
		// loaded, the read coverage chart and called variant charts are
		// not rendered.  If the vcf file hasn't been loaded, the vcf variant
		// chart is not rendered.
		$("#feature-matrix").addClass("hide");
		if (this.bam)
			this.showBamDepth();
		if (this.vcfUrlEntered || this.vcfFileOpened)
			this.showVariants();
	}
}

VariantCard.prototype.onBrush = function(brush) {
	if (!brush.empty()) {

		this.cardSelector.find('#bam-track').css("margin-top", "-70px");

	    var selection = this.d3CardSelector.select("#zoom-region-chart").datum([window.selectedTranscript]);
		this.zoomRegionChart.regionStart(regionStart);
		this.zoomRegionChart.regionEnd(regionEnd);
		this.zoomRegionChart(selection);
		this.d3CardSelector.select("#zoom-region-chart .x.axis .tick text").style("text-anchor", "start");

		this.cardSelector.find('#zoom-region-chart').removeClass("hide");

	} else {
		// Treat a click as a region selection on the entire gene region.
		// That way, we won't recall the variants and re-read the bam and
		// vcf files, but instead just use the data already gathered for 
		// the entire gene region;
		this.cardSelector.find('#bam-track').css("margin-top", "-30px");
		
		this.cardSelector.find('#zoom-region-chart').addClass("hide");
		var h = $("#nav-section").height();
		$('#track-section').css("padding-top", h + "px");
	}

	

	this.showBamDepth(regionStart, regionEnd);
	this.showVariants(regionStart, regionEnd);

}


VariantCard.prototype.showBamDepth = function(regionStart, regionEnd) {	
	var me = this;

	if (this.bam && this.bamUrlEntered) {

	} else if (this.bam == null || 
		(!this.bamFileOpened) ||
	    (this.bamFileOpened && this.getBamRefName == null)) {
		return;
	}

	this.cardSelector.find("#bam-track .loader").css("display", "block");

	this.cardSelector.removeClass("hide");
	this.cardSelector.find('#bam-track').removeClass("hide");
	this.cardSelector.find('#bam-depth').addClass("hide");
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
	} else {

		// A gene has been selected.  Read the bam file to obtain
		// the read converage.
		var refName = this.getBamRefName(window.gene.chr);
	 	this.bam.getCoverageForRegion(refName, window.gene.start, window.gene.end, 
	 		1000, 
	 		function(data) {
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
	if (this.isViewable) {
		this.cardSelector.find("#bam-track .loader").css("display", "none");
	    this.cardSelector.find('#bam-name-' + this.cardIndex).removeClass("hide");		
		this.cardSelector.find('#bam-depth').removeClass("hide");

		this.bamDepthChart.xStart(regionStart);
		this.bamDepthChart.xEnd(regionEnd);

		this.bamDepthChart(this.d3CardSelector.select("#bam-depth").datum(data));		
		this.d3CardSelector.select("#bam-depth .x.axis .tick text").style("text-anchor", "start");

	}
}

VariantCard.prototype.showVariants = function(regionStart, regionEnd) {
	
	var me = this;

	if (this.vcf && this.vcfUrlEntered) {

	} else if (this.vcf && this.vcfFileOpened) {

	} else {
		return;
	}

	if (this.isViewable()) {
		this.cardSelector.removeClass("hide");
		this.cardSelector.find('#vcf-track').removeClass("hide");
		this.cardSelector.find('#vcf-variants').css("display", "none");
		this.cardSelector.find("#vcf-track .loader").css("display", "block");
		this.cardSelector.find('#vcf-name').addClass("hide");		
	}


	if( this.vcfData) {

		// The user has selected a region to zoom into.  Filter the
		// variants based on the selected region
		if (this.isViewable) {
			var filteredFeatures = this.vcfData.features.filter(function(d) {
				return (d.start >= regionStart && d.start <= regionEnd);
			});
				

			var filteredVcfData = this.filterVariants();
			if (regionStart && regionEnd)
	  			this.fillVariantChart(filteredVcfData, regionStart, regionEnd);
	  		else
	  			this.fillVariantChart(filteredVcfData, window.gene.start, window.gene.end);
		}
	
	} else {

		if (this.isViewable) {
		    this.cardSelector.find('#vcf-track .loader-label').text("Annotating Variants with snpEff in realtime");
		}

		// A gene has been selected.  Read the variants for the gene region.
		this.discoverVcfRefName( function() {
			me.vcf.getVariants(me.getVcfRefName(window.gene.chr), 
							   window.gene.start, 
	                           window.gene.end, 
	                           window.gene.strand, 
	                           window.selectedTranscript,
	                           this.afMin,
	                           this.afMax,
	                           function(data) {
		        me.vcfData = data;

		   	    if (me.isViewable()) {
			   	    me.cardSelector.find('#vcf-track .loader-label').text("Loading variant chart");
			   	    var filteredVcfData = this.filterVariants();
			   	    if (regionStart && regionEnd)
				  		me.fillVariantChart(filteredVcfData, regionStart, regionEnd);
				  	else
				  		me.fillVariantChart(filteredVcfData, window.gene.start, window.gene.end);
				  	if (me.getRelationship() == 'proband') {
				  		window.cullVariantFilters();
				  	}
		   	    }
			});	

		});

	}

	// Get the vcf stats for this region
	if (this.isViewable()) {
		this.vcfAfData = null;
		this.cardSelector.find('#af').addClass("hide");		
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
	}

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

VariantCard.prototype.fillVariantChart = function(data, regionStart, regionEnd) {
	if (data == null) {
		return;
	}

	$('#vcf-legend').css("display", "block");		
	this.cardSelector.find('#vcf-count').css("display", "inline-block");		
	this.cardSelector.find('#vcf-name').removeClass("hide");		
	this.cardSelector.find('#af-link').removeClass("hide");
	this.cardSelector.find('#vcf-variants').css("display", "inline");	
	this.cardSelector.find("#vcf-track .loader").css("display", "none");

	this.vcfChart.regionStart(regionStart);
	this.vcfChart.regionEnd(regionEnd);
	
	// Set the vertical layer count so that the height of the chart can be recalculated	                                	
	this.vcfChart.verticalLayers(data.maxLevel);

	// Load the chart with the new data
	var selection = this.d3CardSelector.select("#vcf-variants").datum([data]);    
    this.vcfChart(selection);

	this.cardSelector.find('#vcf-count').text(data.features.length + ' Variants');

    $('#filter-track').removeClass("hide");
    $('#matrix-track').removeClass("hide");
    
	    
   	this.d3CardSelector.select("#vcf-variants .x.axis .tick text").style("text-anchor", "start");

   	if (this.fbData) {
   		$('#compare-legend').removeClass("hide");
   	}

   	// Fill in the feature matrix for the proband variant card.
   	if ( this.getRelationship() == 'proband') {
   		window.showFeatureMatrix(this, data, regionStart, regionEnd);
   	}

}

VariantCard.prototype.callVariants = function(regionStart, regionEnd) {
	var me = this;


	if (this.bam == null || this.getBamRefName == null) {
		return;
	}


	var refName = this.getBamRefName(window.gene.chr);

	if (this.fbData && regionStart && regionEnd) {
		

	} else {

		// A gene has been selected.  Read the variants for the gene region.

		if (this.isViewable()) {
			this.cardSelector.find("#vcf-track").removeClass("hide");
			this.cardSelector.find("#vcf-track .loader").removeClass("hide");
			this.cardSelector.find("#vcf-track .loader").css("display", "block");
			this.cardSelector.find('#vcf-track .loader-label').text("Calling Variants with Freebayes");
		}


		// Call Freebayes variants
		this.bam.getFreebayesVariants(refName, 
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
			// determine whether refname has 'chr' in it or not
			if (fbVariants[0].chrom.slice(0,3) == 'chr')
				me.getVcfRefName = me.getRefName;
			else 
				me.getVcfRefName = me.stripRefName;
			
			if (me.isViewable()) {
				me.cardSelector.find("#vcf-track .loader-label").text("Annotating Variants with snpEFF in realtime")

				// Annotate the fb variatns
				me.vcf.annotateVcfRecords(fbRecs, window.gene.start, window.gene.end, 
					window.gene.strand, window.selectedTranscript, function(data){

					me.fbData = data;
					me.vcfData = me.vcfData || {
						'start': data.start, 'end': data.end, 'strand': data.strand, 
        				'variantRegionStart': data.variantRegionStart, 'name': 'vcf track', 
        				'homCount': 0, 'hetCount': 0,
        				'features': []
        			}

					// This may not be the first time we call freebayes, so to
					// avoid duplicate variants, get rid of the ones
					// we added last round.					
					me.vcfData.features = me.vcfData.features.filter( function(d) {
						return d.consensus != 'unique2';
					});					

					// Compare the variant sets, marking the variants as unique1 (only in vcf), 
					// unique2 (only in freebayes set), or common (in both sets).				
					me.vcf.compareVcfRecords(me.vcfData, me.fbData, function() {						

				    	// Add unique freebayes variants to vcfData
				    	me.fbData.features.forEach(function(d) {
				    		if (d.consensus == 'unique2') {
				    			me.vcfData.features.push(d);
				    			if (d.zygosity != null && d.zygosity == 'HET') {
				    				me.vcfData.hetCount++;
				    			} else if (d.zygosity != null && d.zygosity == 'HOM') {
				    				me.vcfData.homCount++;
				    			}
				    		}
				    	});


				        maxLevel = me._pileupVariants(me.vcfChart, me.vcfData.features, gene.start, gene.end);
						me.vcfData.maxLevel = maxLevel + 1;

				    	me.fillVariantChart(me.vcfData, window.gene.start, window.gene.end);
						
				    });
				});
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



VariantCard.prototype.filterVariants = function(dataToFilter) {
	var me = this;

	var data = dataToFilter ? dataToFilter : this.vcfData;


	var afLowerVal = null;
	var afUpperVal = null;
	if ($('#af-amount-start') != '' && $('#af-amount-end') != '') {
		afLowerVal  = +$('#af-amount-start').val() / 100;
		afUpperVal  = +$('#af-amount-end').val() / 100;
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
		if (afLowerVal != null && afUpperVal != null) {
			meetsAf =  (d.af >= afLowerVal && d.af <= afUpperVal);
		} else {
			meetsAf = true;
		}
		// TODO:  If combinedDepth not provided, access bam data to determine coverage for this
		// region of variant
		var meetsCoverage = true;
		if (coverageMin) {
			if (d.depth)
				meetsCoverage = d.depth >= coverageMin;
			else {
				meetsCoverage = me.getBamDepthAtPos(d.start) >= coverageMin;
			}
		}

		// Iterate through the clicked annotations for each variant. The variant
		// needs to match needs to match
		// at least one of the selected values (e.g. HIGH or MODERATE for IMPACT)
		// for each annotation (e.g. IMPACT and ZYGOSITY) to be included.
		var matchCount = 0;
		var evalAttributes = {};
		for (key in annotsToInclude) {
			var annot = annotsToInclude[key];
			if (annot.state) {
				if (evalAttributes[annot.key] == null) {
					evalAttributes[annot.key] = 0;
				}
				var annotValue = d[annot.key] ? d[annot.key] : '';				
				var match = false;
				if (isDictionary(annotValue)) {
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

	
	var maxLevel = this._pileupVariants(this.vcfChart, filteredFeatures, 
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
			 	var i = 0;
				me.vcfData.features.forEach( function(feature) {
					feature[compareAttribute] = '';
					feature.order = i++;
				});
				me.vcf.compareVcfRecords(theVcfData, me.vcfData, finishCallback, compareAttribute, matchCallback); 								 	
			 });
		});
		
	} else {
		this.vcfData.features = this.vcfData.features.sort(orderVariantsByPosition);
	 	var i = 0;
		this.vcfData.features.forEach( function(feature) {
			feature[compareAttribute] = '';
			feature.order = i++;
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


