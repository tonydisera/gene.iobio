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
VariantCard.prototype.init = function(cardSelector, cardIndex) {
	var me = this;

	this.d3CardSelector = d3.selectAll("#variant-cards .variant-card").filter(function(d, i) { return i == +cardIndex; });
	this.cardSelector = cardSelector;
	this.cardIndex = cardIndex;

	this.cardSelector.find("#variant-link").attr("href", "#variant-panel-" + cardIndex);
	this.cardSelector.find('#variant-panel').attr("id", "variant-panel-" + cardIndex);

	this.cardSelector.find("#af-link").attr("href", "#af-" + cardIndex);
	this.cardSelector.find('#af').attr("id", "af-" + cardIndex);


	this.cardSelector.find("#vcf-file-info-link").attr("href", "#vcf-file-info-" + cardIndex);
	this.cardSelector.find('#vcf-file-info').attr("id", "vcf-file-info-" + cardIndex);


	this.cardSelector.find("#bam-file-info-link").attr("href", "#bam-name-" + cardIndex);
	this.cardSelector.find('#bam-name').attr("id", "bam-name-" + cardIndex);


	// init vcf.iobio
	this.vcf = vcfiobio();


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
				   		.depth( function(d) { return d[1] });


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


	this.cardSelector.find("#bam-track .loader").css("display", "block");
	this.cardSelector.find("#bam-track .loader-label").text("Loading File");

	this.bamFileOpened = true;
	this.cardSelector.find('#bam-name-' + this.cardIndex).text(bamFile.name);

	$('#datasource-dialog #bam-file-info').removeClass('hide');
	$('#datasource-dialog #bam-file-info').val(bamFile.name);


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
	this.cardSelector.find("#bam-track .loader-label").text("Streaming File")

	this.cardSelector.find('#bam-name-' + this.cardIndex).text(bamUrl);
    
    this.bam = new Bam(bamUrl);
    this.bamUrlEntered = true;
    this.getBamRefName = this.stripRefName;

}

VariantCard.prototype.onVcfFilesSelected = function(event) {
	var me = this;
	this.vcfFileOpened = true;

	this.cardSelector.find('#vcf-track').removeClass("hide");
	this.cardSelector.find('#vcf-variants').css("display", "none");
	this.cardSelector.find("#vcf-track .loader").css("display", "block");
	this.cardSelector.find('#vcf-track .loader-label').text("Loading File");


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
		});
	});

}

VariantCard.prototype.onVcfUrlEntered = function(vcfUrl) {
	
	this.cardSelector.find('#vcf-track').removeClass("hide");
	this.cardSelector.find('#vcf-variants').css("display", "none");
	this.cardSelector.find("#vcf-track .loader").css("display", "block");
	this.cardSelector.find('#vcf-track .loader-label').text("Streaming Variant Data");
 	this.cardSelector.find('#vcf-name').text(vcfUrl);
   
    this.vcf.openVcfUrl(vcfUrl);
    this.vcfUrlEntered = true;
    this.getVcfRefName = this.stripRefName;


}

VariantCard.prototype.loadDataSources = function(dataSourceName) {
	this.name = dataSourceName;

	var cache = this.cardSelector.find('#variant-link').children();
   	this.cardSelector.find('#variant-link').text(dataSourceName).append(cache);
   	this.cardSelector.find('#variant-link').attr("aria-expanded", true);
   	this.cardSelector.find('#variant-panel-' + this.cardIndex).attr("aria-expanded", true);
   	this.cardSelector.find('#variant-panel-' + this.cardIndex).addClass("in");


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
		this.showVariants(regionStart, regionEnd);
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

/* 
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
VariantCard.prototype.loadTracksForGene = function (classifyClazz) {

	this.vcfData = null;
	this.fbData = null;

	this.vcfChart.clazz(classifyClazz);


	if (this.bam || this.vcf) {	       			
		selection = this.d3CardSelector.select("#zoom-region-chart").datum([]);
		this.zoomRegionChart.regionStart(+window.gene.start);
		this.zoomRegionChart.regionEnd(+window.gene.end);
		this.zoomRegionChart(selection);
	}

	this.fbData = null;
	this.bamData = null;
	this.vcfData = null;

	// Load the read coverage and variant charts.  If a bam hasn't been
	// loaded, the read coverage chart and called variant charts are
	// not rendered.  If the vcf file hasn't been loaded, the vcf variant
	// chart is not rendered.
	$("#feature-matrix").addClass("hide");
	this.showBamDepth();
	this.showVariants();

}

VariantCard.prototype.onD3Brush = function(brush) {
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
	

	if (regionStart && regionEnd) {

		// The user has selected a region.  Filter the existing bam data
		// to return only records in the specified region.
		var filteredData = this.bamData.filter(function(d) { 
			return (d[0] >= regionStart && d[0] <= regionEnd);
		}); 
		
		this.fillBamChart(filteredData, regionStart, regionEnd);

	} else {

		// A gene has been selected.  Read the bam file to obtain
		// the read converage.
		var refName = this.getBamRefName(window.gene.chr);
	 	this.bam.getCoverageForRegion(refName, window.gene.start, window.gene.end, 
	 		1000, 
	 		function(data) {
				me.bamData = data;
				
				me.cardSelector.find("#bam-track .loader-label").text("Loading Chart")

				me.fillBamChart(me.bamData, window.gene.start, window.gene.end);
			});
	}




}

VariantCard.prototype.fillBamChart = function(data, regionStart, regionEnd) {
	this.cardSelector.find("#bam-track .loader").css("display", "none");
    this.cardSelector.find('#bam-name-' + this.cardIndex).removeClass("hide");		
	this.cardSelector.find('#bam-depth').removeClass("hide");

	this.bamDepthChart.xStart(regionStart);
	this.bamDepthChart.xEnd(regionEnd);

	this.bamDepthChart(this.d3CardSelector.select("#bam-depth").datum(data));		
	this.d3CardSelector.select("#bam-depth .x.axis .tick text").style("text-anchor", "start");
}

VariantCard.prototype.showVariants = function(regionStart, regionEnd) {
	var me = this;

	if (this.vcf && this.vcfUrlEntered) {

	} else if (this.vcf == null || 
		(!this.vcfFileOpened) ||
	    (this.vcfFileOpened && this.getVcfRefName == null)) {
		return;
	}

	this.cardSelector.removeClass("hide");
	this.cardSelector.find('#vcf-track').removeClass("hide");
	this.cardSelector.find('#vcf-variants').css("display", "none");
	this.cardSelector.find("#vcf-track .loader").css("display", "block");
	this.cardSelector.find('#vcf-name').addClass("hide");		




	if( regionStart && regionEnd) {

		// The user has selected a region to zoom into.  Filter the
		// variants based on the selected region
		var filteredFeatures = this.vcfData.features.filter(function(d) {
			return (d.start >= regionStart && d.start <= regionEnd);
		});

		var splitByZyg = this.vcfData.hetCount > 0 && this.vcfData.homCount > 0;

		maxLevel = this._pileupVariants(this.vcfChart, splitByZyg, filteredFeatures, regionStart, regionEnd);		

		var vcfDataFiltered = {	count: this.vcfData.count,
								countMatch: this.vcfData.countMatch,
								countUnique: this.vcfData.countUnique,
								end: regionEnd,
								features: filteredFeatures,
								maxLevel: maxLevel + 1,
								name: this.vcfData.name,
								start: regionStart,
								strand: this.vcfData.strand,
								variantRegionStart: regionStart
							};

		this.fillVariantChart(vcfDataFiltered, regionStart, regionEnd);
	
	} else {

	    this.cardSelector.find('#vcf-track .loader-label').text("Annotating Variants in realtime");

		// A gene has been selected.  Read the variants for the gene region.
		var refName = this.getVcfRefName(window.gene.chr);
		this.vcf.getVariants(refName, 
							   window.gene.start, 
	                           window.gene.end, 
	                           window.gene.strand, 
	                           window.selectedTranscript,
	                           this.afMin,
	                           this.afMax,
	                           function(data) {
	        me.vcfData = data;

	        var splitByZyg = me.vcfData.hetCount > 0 && me.vcfData.homCount > 0;

	        maxLevel = me._pileupVariants(me.vcfChart, splitByZyg, data.features, window.gene.start, window.gene.end);
			data.maxLevel = maxLevel + 1;
	   	    me.cardSelector.find('#vcf-track .loader-label').text("Loading chart");
			me.fillVariantChart(data, window.gene.start, window.gene.end);

		});	

	}

	// Get the vcf stats for this region
	this.vcfAfData = null;
	this.cardSelector.find('#af').addClass("hide");		
	var regionParm = {'name': this.getVcfRefName(window.gene.chr), 
					  'start': regionStart ? regionStart : window.gene.start, 
					  'end':   regionEnd   ? regionEnd   : window.gene.end
					 };
	this.vcf.getStats(null, regionParm, {}, function(stats) {
		// Alelle Frequency
		var afObj = stats.af_hist;
		vcfAfData = me.vcf.jsonToArray2D(afObj);	
		var afSelection = me.d3CardSelector.select("#vcf-af-chart")
						    .datum(vcfAfData);
		var afOptions = {outliers: true, averageLine: false};		
		me.cardSelector.find('#af').removeClass("hide");			    
		me.afChart.call(afSelection, afSelection, afOptions);	
	});

}

VariantCard.prototype._pileupVariants = function(theChart, splitByZyg, features, start, end) {
	if (splitByZyg) {
		return this._pileupVariantsByZygosity(theChart, features, start, end);
	} else {
		theChart.dividerLevel(null);
		return this._pileupVariantsImpl(theChart, features, start, end);
	}

} 

VariantCard.prototype._pileupVariantsByZygosity = function(theChart, features, start, end) {
	var spacing = 6;
	var featuresHet = features.filter(function(d) {
		return d.zygosity == null || d.zygosity == 'HET';
	});
	var maxLevelHet = this._pileupVariantsImpl(theChart, featuresHet, start, end);

	var featuresHom = features.filter(function(d) {
		return d.zygosity != null && d.zygosity == 'HOM';
	});
	var maxLevelHom = this._pileupVariantsImpl(theChart, featuresHom, start, end);

	featuresHom.forEach( function(d) {
		d.level = maxLevelHet + spacing + d.level;
	});
	theChart.dividerLevel(maxLevelHet + (spacing/2));
	
	return maxLevelHet + spacing + maxLevelHom;
}

VariantCard.prototype._pileupVariantsImpl = function(theChart, features, start, end) {
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

   	//  TODO:  Change this so that we can indicate proband/primary variant card
   	if ( this.cardIndex == 0) {
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

		// Hide the stats.  Don't show until comparisons between call sets
		// is finished.
		//this.cardSelector.find('#fb-stats').css("display", "none");
		//this.cardSelector.find('#fb-count').css("display", "none");

		this.cardSelector.find("#vcf-track .loader").removeClass("hide");
		this.cardSelector.find("#vcf-track .loader").css("display", "block");

		this.cardSelector.find('#vcf-track .loader-label').text("Calling Variants with Freebayes");


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
			
			me.cardSelector.find("#vcf-track .loader-label").text("Annotating Variants in realtime")

			// Annotate the fb variatns
			me.vcf.annotateVcfRecords(fbRecs, window.gene.start, window.gene.end, 
				window.gene.strand, window.selectedTranscript, function(data){

				me.fbData = data;

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


			        var splitByZyg = me.vcfData.hetCount > 0 && me.vcfData.homCount > 0;


			        maxLevel = me._pileupVariants(me.vcfChart, splitByZyg, me.vcfData.features, gene.start, gene.end);
					me.vcfData.maxLevel = maxLevel + 1;

			    	me.fillVariantChart(me.vcfData, window.gene.start, window.gene.end);
					
			    });

			});
			
		});


	}

} 



VariantCard.prototype.classifyVariants = function(clazz) {
	this.vcfChart.clazz(clazz);

	if (this.vcfData) {
		this.fillVariantChart(this.vcfData, regionStart, regionEnd);
	} 

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



VariantCard.prototype.filterVariants = function() {
	var me = this;
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
	   
	var filteredFeatures = this.vcfData.features.filter(function(d) {
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
 			meetsCoverage = d.combinedDepth >= coverageMin;
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
				if (me._isDictionary(annotValue)) {
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


		return meetsAf && meetsCoverage && meetsAnnot;
	});

	var splitByZyg = this.vcfData.hetCount > 0 && this.vcfData.homCount > 0;

	var maxLevel = this._pileupVariants(this.vcfChart, splitByZyg, filteredFeatures, 
		regionStart ? regionStart : window.gene.start, 
		regionEnd   ? regionEnd   : window.gene.end);		

	var vcfDataFiltered = {	count: this.vcfData.count,
							countMatch: this.vcfData.countMatch,
							countUnique: this.vcfData.countUnique,
							end: regionEnd,
							features: filteredFeatures,
							maxLevel: maxLevel + 1,
							name: this.vcfData.name,
							start: regionStart,
							strand: this.vcfData.strand,
							variantRegionStart: regionStart
						};

	this.fillVariantChart(vcfDataFiltered, regionStart, regionEnd);
}

VariantCard.prototype._isDictionary = function(obj) {
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


