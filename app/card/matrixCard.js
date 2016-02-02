function MatrixCard() {
	this.featureMatrix = null;
	this.featureVcfData = null;
	this.sourceVcfData = null;
	this.featureMatrix  = null;


	this.clinvarMap     = {  
						'pathogenic'            : {value: 1,   badge: true, clazz: 'clinvar_path', symbolFunction: this.showClinVarSymbol},
                        'likely_pathogenic'     : {value: 2,   badge: true, clazz: 'clinvar_lpath', symbolFunction: this.showClinVarSymbol},
                        'uncertain_significance': {value: 3,   badge: true, clazz: 'clinvar_uc', symbolFunction: this.showClinVarSymbol},
                        'benign'                : {value: 100, badge: false, clazz: 'clinvar_benign', symbolFunction: this.showClinVarSymbol},
                        'likely_benign'         : {value: 101, badge: false, clazz: 'clinvar_lbenign', symbolFunction: this.showClinVarSymbol},
                        'conflicting_data_from_submitters': {value: 121, badge: false, clazz: 'clinvar_cd', symbolFunction: this.showClinVarSymbol},
						'conflicting_interpretations_of_pathogenicity':  {value: 121, badge: true, clazz: 'clinvar_cd', symbolFunction: this.showClinVarSymbol},                       
                        'drug_response'         : {value: 131, badge: false, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'confers_sensivity'     : {value: 131, badge: false, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'risk_factor'           : {value: 131, badge: false, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'other'                 : {value: 131, badge: false, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'association'           : {value: 131, badge: false, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'protective'            : {value: 131, badge: false, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'not_provided'          : {value: 141, badge: false, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'none'                  : {value: 151, badge: false, clazz: ''}
                     };
	this.impactMap = {  HIGH:     {value: 1, badge: true, clazz: 'impact_HIGH',     symbolFunction: this.showImpactSymbol},    
                        MODERATE: {value: 2, badge: true, clazz: 'impact_MODERATE', symbolFunction: this.showImpactSymbol},  
                        MODIFIER: {value: 3, badge: false, clazz: 'impact_MODIFIER', symbolFunction: this.showImpactSymbol},
                        LOW:      {value: 4, badge: false, clazz: 'impact_LOW',      symbolFunction: this.showImpactSymbol}
                     };
	this.siftMap = {  
                        deleterious:                 {value: 1, badge: true, clazz: 'sift_deleterious', symbolFunction: this.showSiftSymbol},
                        deleterious_low_confidence:  {value: 2, badge: true, clazz: 'sift_deleterious_low_confidence', symbolFunction: this.showSiftSymbol},
		                tolerated_low_confidence: {value: 3, badge: false, clazz: 'sift_tolerated_low_confidence',symbolFunction: this.showSiftSymbol},  
		                tolerated:    {value: 102, badge: false, clazz: 'sift_tolerated',symbolFunction: this.showSiftSymbol},  
                        unknown:      {value: 103, badge: false, clazz: ''},
                        none:         {value: 103, badge: false, clazz: ''}
                     };
	this.polyphenMap = {  
                        probably_damaging:    {value: 1, badge: true, clazz: 'polyphen_probably_damaging', symbolFunction: this.showPolyPhenSymbol},
		                possibly_damaging:    {value: 2, badge: true, clazz: 'polyphen_possibly_damaging', symbolFunction: this.showPolyPhenSymbol},  
                        benign:               {value: 103, badge: false, clazz: 'polyphen_benign',            symbolFunction:this.showPolyPhenSymbol},
                        unknown:              {value: 104, badge: false, clazz: ''},
                        none:                 {value: 104, badge: false, clazz: ''}
                     };
	this.inheritanceMap = {  
		                denovo:    {value: 1, badge: true, clazz: 'denovo',    symbolFunction: this.showDeNovoSymbol},  
                        recessive: {value: 2, badge: true, clazz: 'recessive', symbolFunction: this.showRecessiveSymbol},
                        none:      {value: 3, badge: false, clazz: 'noinherit', symbolFunction: this.showNoInheritSymbol}
                     };
	this.bookmarkMap = {  
		                Y: {value: 1, badge: true,  clazz: 'bookmark',  symbolFunction: this.showBookmarkSymbol},  
                        N: {value: 2, badge: false, clazz: '',          symbolFunction: this.showBookmarkSymbol}
                     };
	this.unaffectedMap = {  
		                recessive_none: {value: 1,   badge: true,  clazz: 'unaffected', symbolFunction: this.showSibNotRecessiveSymbol},  
                        recessive_some: {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.showSibRecessiveSymbol},
                        recessive_all:  {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.showSibRecessiveSymbol},
                        present_some:   {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.showSibPresentSymbol},
                        present_all:    {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.showSibPresentSymbol},
                        present_none:   {value: 104, badge: false, clazz: 'unaffected', symbolFunction: ''},
                        none:           {value: 104, badge: false, clazz: 'unaffected', symbolFunction: ''}
                 };
	this.affectedMap = {  
		                recessive_all:  {value: 1,   badge: true,  clazz: 'affected',  symbolFunction: this.showSibRecessiveSymbol},  
                        recessive_some: {value: 2,   badge: true,  clazz: 'affected',  symbolFunction: this.showSibRecessiveSymbol},
                        present_all:    {value: 3,   badge: true,  clazz: 'affected',  symbolFunction: this.showSibPresentSymbol},
                        present_some:   {value: 4,   badge: true,  clazz: 'affected',  symbolFunction: this.showSibPresentSymbol},
                        present_none:   {value: 104, badge: false, clazz: 'affected',  symbolFunction: ''},
                        none:           {value: 104, badge: false, clazz: 'affected',  symbolFunction: ''}
                 };
	// For af range, value must be > min and <= max
	this.afExacMap = [ {min: -100.1, max: -100,   value: +99, badge: false, clazz: 'afexac_unique_nc', symbolFunction: this.showAfExacSymbol},	
                       {min: -1.1,   max: +0,     value: +3,  badge: false, clazz: 'afexac_unique',    symbolFunction: this.showAfExacSymbol},	
                       {min: +0,     max: +.0001, value: +3,  badge: false, clazz: 'afexac_uberrare',   symbolFunction: this.showAfExacSymbol},	
                       {min: +.0001, max: +.001,  value: +4,  badge: false, clazz: 'afexac_superrare',  symbolFunction: this.showAfExacSymbol},	
                       {min: +.001,  max: +.01,   value: +5,  badge: false, clazz: 'afexac_rare',       symbolFunction: this.showAfExacSymbol},	
                       {min: +.01,   max: +.05,   value: +6,  badge: false, clazz: 'afexac_uncommon',   symbolFunction: this.showAfExacSymbol},	
                       {min: +.05,   max: +1,     value: +7,  badge: false, clazz: 'afexac_common',     symbolFunction: this.showAfExacSymbol},	
                      ];
	this.af1000gMap= [ {min: -1.1,   max: +0,     value: +2,  badge: false, clazz: 'af1000g_unique',     symbolFunction: this.showAf1000gSymbol},	
                       {min: -1.1,   max: +.0001, value: +3,  badge: false, clazz: 'af1000g_uberrare',   symbolFunction: this.showAf1000gSymbol},	
                       {min: -1.1,   max: +.001,  value: +4,  badge: false, clazz: 'af1000g_superrare',  symbolFunction: this.showAf1000gSymbol},	
                       {min: -1.1,   max: +.01,   value: +5,  badge: false, clazz: 'af1000g_rare',       symbolFunction: this.showAf1000gSymbol},	
                       {min: +.01,   max: +.05,   value: +6,  badge: false, clazz: 'af1000g_uncommon',   symbolFunction: this.showAf1000gSymbol},	
                       {min: +.05,   max: +1,     value: +7,  badge: false, clazz: 'af1000g_common',     symbolFunction: this.showAf1000gSymbol},	
                      ];                      



	this.matrixRows = [
		{name:'Bookmark'                     ,order:3, index:9, match: 'exact', attribute: 'isBookmark',     map: this.bookmarkMap },
		{name:'Pathogenicity - ClinVar'      ,order:0, index:1, match: 'exact', attribute: 'clinVarClinicalSignificance',     map: this.clinvarMap },
		{name:'Impact - SnpEff'              ,order:4, index:0, match: 'exact', attribute: 'impact',      map: this.impactMap},
		{name:'Unaffected Siblings'          ,order:7, index:8, match: 'exact', attribute: 'unaffectedSibs',  map: this.unaffectedMap},
		{name:'Affected Siblings'            ,order:6, index:7, match: 'exact', attribute: 'affectedSibs',  map: this.affectedMap},
		{name:'Inheritance Mode'             ,order:5, index:2, match: 'exact', attribute: 'inheritance', map: this.inheritanceMap},
		{name:'Allele Frequency - 1000G'     ,order:8, index:3, match: 'range', attribute: 'af1000G',     map: this.af1000gMap},
		{name:'Allele Frequency - ExAC'      ,order:9, index:4, match: 'range', attribute: 'afExAC',      map: this.afExacMap},
		{name:'Pathogenecity - SIFT'         ,order:2, index:5, match: 'exact', attribute: 'vepSIFT',     map: this.siftMap},
		{name:'Pathogengicity - PolyPhen'    ,order:1, index:6, match: 'exact', attribute: 'vepPolyPhen', map: this.polyphenMap}
	];


	this.filteredMatrixRows = null;


	this.featureUnknown = 199;

}

MatrixCard.prototype.removeRow = function(searchTerm, theMatrixRows) {
	var delIdx = -1;
	var idx = 0;
	var removedOrder = -1;
	theMatrixRows.forEach( function (row) {
		if (row.name.indexOf(searchTerm) >= 0) {
			delIdx = idx;
			removedOrder = row.order;
		}
		idx++;
	});

	if (delIdx >= 0) {
		theMatrixRows.splice(delIdx, 1);
		theMatrixRows.forEach( function(row) {
			if (+row.order > +removedOrder) {
				row.order--;
			}
		});
	} 
}

MatrixCard.prototype.setRowLabel = function(searchTerm, newRowLabel) {
	this.matrixRows.forEach( function (row) {
		if (row.name.indexOf(searchTerm) >= 0) {
			row.name = newRowLabel;
		}
	});
	
}

MatrixCard.prototype.setRowAttribute = function(searchTerm, newRowAttribute) {
	this.matrixRows.forEach( function (row) {
		if (row.name.indexOf(searchTerm) >= 0) {
			row.attribute = newRowAttribute;
		}
	});
	
}

MatrixCard.prototype.getRowAttribute = function(searchTerm) {
	var attribute = "";
	this.matrixRows.forEach( function (row) {
		if (row.name.indexOf(searchTerm) >= 0) {
			attribute = row.attribute;
		}
	});	
	return attribute;
}


MatrixCard.prototype.setTooltipGenerator = function(tooltipFunction) {
	this.featureMatrix.tooltipHTML(tooltipFunction);

}


MatrixCard.prototype.getVariantLabel = function(d, i) {
	var rsId = getRsId(d);
	if (rsId != null) {
		return rsId;
	} else {
		return d.type + ' ' + d.start;
	}
}

MatrixCard.prototype.init = function() {
	var me = this;

	this.featureMatrix = featureMatrixD3()
				    .margin({top: 0, right: 40, bottom: 4, left: 24})
				    .cellSize(18)
				    .columnLabelHeight(67)
				    .rowLabelWidth(140)
				    .columnLabel( me.getVariantLabel )
				    .on('d3click', function(variant) {
				    	if (variant ==  null) {
				    		me.unpin();
				    	} else {
					    	if (variant != clickedVariant) {
					    		clickedVariant = variant;
					    		me.showTooltip(variant, true);
						    	variantCards.forEach(function(variantCard) {
						    		variantCard.showVariantCircle(variant);
						    		variantCard.showCoverageCircle(variant, getProbandVariantCard());
						    	});
						    	
					    	} else {
					    		me.unpin();
					    	}				    		
				    	}
				    	
				    })
				     .on('d3mouseover', function(variant) {
				     	if (clickedVariant == null) {
				     		me.showTooltip(variant);
					    	variantCards.forEach(function(variantCard) {
					    		variantCard.showVariantCircle(variant);
					    		variantCard.showCoverageCircle(variant, getProbandVariantCard());
					    	});
					    	
				     	}
				    })
				    .on('d3mouseout', function() {
				    	if (clickedVariant == null) {
				    		me.hideTooltip();
					    	variantCards.forEach(function(variantCard) {
					    		variantCard.hideVariantCircle();
					    	});				    		
					    	
				    	}
				    })
				    .on('d3rowup', function(i) {
				    	var column = null;
				    	var columnPrev = null;
				    	me.filteredMatrixRows.forEach(function(col) {
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
				    	getProbandVariantCard().sortFeatureMatrix();
				    	
				    })
				    .on('d3rowdown', function(i) {
				    	var column = null;
				    	var columnNext = null;
				    	me.filteredMatrixRows.forEach(function(col) {
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
				    	getProbandVariantCard().sortFeatureMatrix();

				    });

	var matrixCardSelector = $('#matrix-track');
	matrixCardSelector.find('#expand-button').on('click', function() {
		matrixCardSelector.find('.fullview').removeClass("hide");
	});
	matrixCardSelector.find('#minimize-button').on('click', function() {
		matrixCardSelector.find('.fullview').addClass("hide");
	});

}


MatrixCard.prototype.unpin = function(saveClickedVariant) {
	if (!saveClickedVariant) {
		clickedVariant = null;
	}

	this.hideTooltip();

	variantCards.forEach(function(variantCard) {
		variantCard.hideCoverageCircle();
	});

}

MatrixCard.prototype._isolateVariants = function() {
	variantCards.forEach(function(variantCard) {
		variantCard.isolateVariants(d3.selectAll("#feature-matrix .col.current").data());
	});

}


MatrixCard.prototype.hideTooltip = function() {
	var tooltip = d3.select('#matrix-track .tooltip');
	tooltip.transition()        
           .duration(500)      
           .style("opacity", 0)
           .style("z-index", 0)
           .style("pointer-events", "none");
}


MatrixCard.prototype.showTooltip = function(variant, lock) {
	var me = this;


	if (lock && !$("#slider-left").hasClass("hide")) {
		showSidebar("Examine");
		examineCard.showVariant(variant);		
		getProbandVariantCard().model.promiseGetVariantExtraAnnotations(window.gene, window.selectedTranscript, variant)
        .then( function(refreshedVariant) {
			examineCard.showVariant(refreshedVariant, true);
        });
	}

	if (lock) {
		getProbandVariantCard().unpin(true);
	}

	var tooltip = d3.select('#matrix-track .tooltip');
	tooltip.style("z-index", 20);
	tooltip.transition()        
	 .duration(1000)      
	 .style("opacity", .9)	
	 .style("pointer-events", "all");

	tooltip.html(window.getProbandVariantCard().variantTooltipHTML(variant, "Click on column to lock tooltip"));

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

	var selection = tooltip.select("#coverage-svg");
	window.getProbandVariantCard().createAlleleCountSVGTrio(selection, variant);
   
	tooltip.select("#unpin").on('click', function() {
		me.unpin();
	});
	tooltip.select("#examine").on('click', function() {
		showSidebar("Examine");
		examineCard.showVariant(variant);
		getProbandVariantCard().model.promiseGetVariantExtraAnnotations(window.gene, window.selectedTranscript, variant)
        .then( function(refreshedVariant) {
			examineCard.showVariant(refreshedVariant, true);
        });
	});

	var h = tooltip[0][0].offsetHeight;
	var w = 300;

	var x = variant.screenX;
	var y = variant.screenY + 10;

	if (x < w) {
		tooltip.style("width", w + "px")
		       .style("left", x + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h) + "px");   

	} else {

		tooltip.style("width", w + "px")
		       .style("left", (x - w) + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h) + "px");   
	}	
}

MatrixCard.prototype.fillFeatureMatrix = function(theVcfData, partialRefresh) {
	var me = this;

	if (theVcfData == null) {
		return;
	}


	// Flag any bookmarked variants
    bookmarkCard.determineVariantBookmarks(theVcfData, window.gene);


	// Figure out if we should show the unaffected sibs row
	if (partialRefresh == null || !partialRefresh) {
		this.filteredMatrixRows = $.extend(true, [], this.matrixRows);	
		if (variantCardsSibs['affected'] == null || variantCardsSibs['affected'].length == 0) {
			me.removeRow('Affected Siblings', me.filteredMatrixRows);
		}
		if (variantCardsSibs['unaffected'] == null || variantCardsSibs['unaffected'].length == 0) {
			me.removeRow('Unaffected Siblings', me.filteredMatrixRows);
		}
	}
	
	resizeCardWidths();

	if (theVcfData != null) {
		this.featureVcfData = {};
		this.featureVcfData.features = [];
		theVcfData.features.forEach(function(variant) {
			me.featureVcfData.features.push($.extend({}, variant));
		});
	}

	// Sort the matrix columns
	this.filteredMatrixRows = this.filteredMatrixRows.sort(function(a, b) {
		if (a.order == b.order) {
			return 0;
		} else if (a.order < b.order) {
			return -1;
		} else {
			return 1;
		}
	});
	
	// Fill all features used in feature matrix for each variant
	this.featureVcfData.features.forEach( function(variant) {
		var features = [];
		for (var i = 0; i < me.filteredMatrixRows.length; i++) {
			features.push(null);
		}

		me.filteredMatrixRows.forEach( function(matrixRow) {
			var rawValue = variant[matrixRow.attribute];
			var theValue    = null;
			var mappedValue = null;
			var mappedClazz = null;
			var symbolFunction = null;
			// Don't fill in clinvar for now
			if (matrixRow.attribute == 'clinvar') {
				rawValue = 'N';
			} 
			if (rawValue != null && rawValue != "") {
				if (matrixRow.match == 'exact') {
					// We are going to get the mapped value through exact match,
					// so this will involve a simple associative array lookup.
					// Some features (like impact) are multi-value and are stored in a
					// an associative array.  In this case, we loop through the feature
					// values, keeping the lowest (more important) mapped value.
					if (me.isDictionary(rawValue)) {
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
					if (me.isNumeric(rawValue)) {
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
				                    'rank': (mappedValue ? mappedValue : me.featureUnknown), 
				                    'clazz': mappedClazz,
				                    'symbolFunction': symbolFunction
				                  };
		});

		variant.features = features;
	});
	// Sort the variants by the criteria that matches
	var sortedFeatures = this.featureVcfData.features.sort(function (a, b) {
	  var featuresA = "";
	  var featuresB = "";

	  // The features have been initialized in the same order as
	  // the matrix column order. In each interation,
	  // exit with -1 or 1 if we have non-matching values;
	  // otherwise, go to next iteration.  After iterating
	  // through every column, if we haven't exited the
	  // loop, that means all features of a and b match
	  // so return 0;
	  for (var i = 0; i < me.filteredMatrixRows.length; i++) {
	  	if (a.features[i] == null) {
	  		return 1;
	  	} else if (b.features[i] == null) {
	  		return -1;
	  	} else if (a.features[i].rank > 99  && b.features[i].rank > 99) {
	  		// In this case, we don't consider the rank and will look at the next feature for ordering
	  	} else if (a.features[i].rank > 99) {
	  		return 1;
	  	} else if (b.features[i].rank > 99) {
	  		return -1;
	  	} else if (a.features[i].rank < b.features[i].rank) {
	  		return -1;
	  	} else if (a.features[i].rank > b.features[i].rank) {
			return 1;
		} else {
		}
	  }
	  return 0;
	});

	$("#feature-matrix").removeClass("hide");
	$("#feature-matrix-note").removeClass("hide");
	//$("#matrix-panel .loader").addClass("hide");

	// Load the chart with the new data
	this.featureMatrix.matrixRows(this.filteredMatrixRows);
	var selection = d3.select("#feature-matrix").data([sortedFeatures]);  

    this.featureMatrix(selection, {showColumnLabels: true});

    // We have new properties to filter on (for inheritance), so refresh the 
    //proband variant chart.
	/*variantCards.forEach(function(variantCard) {
		if (variantCard.getRelationship() == 'proband') {
			variantCard.showVariants(regionStart, regionEnd);
		}
	});*/
	
	
}

MatrixCard.prototype.setFeatureMatrixSource = function(theVcfData) {
	this.sourceVcfData = theVcfData;
}





MatrixCard.prototype.isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

MatrixCard.prototype.isDictionary = function(obj) {
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



MatrixCard.prototype.showClinVarSymbol = function (selection, options) {
	var width = "14";
	var height = "14";
	var transform =  "translate(2,2)";
	var clazz = null;
	if (options) {
		if (options.width) {
			width = options.width;
		}
		if (options.height) {
			height = options.height;
		}
		if (options.transform) {
			transform = options.transform;
		}
		if (options.clazz) {
			clazz = options.clazz;
		}
	} else {
		if (selection.datum().width) {
			width = selection.datum().width;
		}
		if (selection.datum().height) {
			height = selection.datum().height;
		}
		if (selection.datum().transform) {
			transform = selection.datum().transform;
		}
		if (selection.datum().clazz) {
			clazz = selection.datum().clazz;
		}
	}

	selection.append("g")
	         .attr("transform", transform)
	         .append("use")
	         .attr("xlink:href", "#clinvar-symbol")
	         .attr("width", width)
	         .attr("height", height)
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (clazz == 'clinvar_path') {
	         		return "#ad494A";
	         	} else if (clazz == 'clinvar_lpath') {
	         		return "#FB7737";
	         	} else if (clazz == 'clinvar_uc') {
	         		return "rgba(231,186,82,1)";
	         	} else if (clazz == 'clinvar_benign') {
	         		return "rgba(181,207,107,1)";
	         	} else if (clazz == 'clinvar_lbenign') {
	         		return "rgba(156,194,49,1)";
	         	} else if (clazz == 'clinvar_other') {
	         		return "rgb(189,189,189)";
	         	} else if (clazz == 'clinvar_cd') {
	         		return "rgb(111, 182, 180)";
	         	}
	         });

};

MatrixCard.prototype.showPolyPhenSymbol = function (selection, options) {
	selection.append("g")
	         .attr("transform", options ? options.transform : (selection.datum().hasOwnProperty("transform") ? selection.datum().transform : "translate(2,2)"))
	         .append("use")
	         .attr("xlink:href", "#biohazard-symbol")
	         .attr("width", options ? options.width : (selection.datum().hasOwnProperty("width") ? selection.datum().width : "14"))
	         .attr("height", options ? options.height : (selection.datum().hasOwnProperty("height") ? selection.datum().height : "14"))
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {
	         	var clazz = options ? options.clazz : selection.datum().clazz;

	         	if (clazz == 'polyphen_probably_damaging') {
	         		return "#ad494A";
	         	} else if (clazz == 'polyphen_possibly_damaging') {
	         		return "#FB7737";
	         	} else if (clazz == 'polyphen_benign') {
	         		return "rgba(181, 207, 107,1)";
	         	} 
	         });

};

MatrixCard.prototype.showSiftSymbol = function (selection, options) {
	selection.append("g")
	         .attr("transform", options ? options.transform : (selection.datum().hasOwnProperty("transform") ? selection.datum().transform : "translate(2,2)"))
	         .append("use")
	         .attr("xlink:href", "#danger-symbol")
	         .attr("width", options ? options.width : (selection.datum().hasOwnProperty("width") ? selection.datum().width : "14"))
	         .attr("height", selection.datum().hasOwnProperty("height") ? selection.datum().height : "14")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {

				var clazz = options ? options.clazz : selection.datum().clazz;

	         	if (clazz == 'sift_deleterious') {
	         		return "#ad494A";
	         	} else if (clazz == 'sift_deleterious_low_confidence') {
	         		return "#FB7737";
	         	} else if (clazz == 'sift_tolerated_low_confidence') {
	         		return "rgba(231,186,82,1)";
	         	} else if (clazz == 'sift_tolerated') {
	         		return "rgba(181, 207, 107,1)";
	         	} 
	         });

};
MatrixCard.prototype.showAfExacSymbol = function(selection) {
	selection.append("g")
	         .attr("class", selection.datum().clazz)
	         .attr("transform", function(d,i) {
	         	if (selection.datum().clazz == 'afexac_unique_nc') {
	         		return "translate(4,4)";
	         	} else if (selection.datum().clazz == 'afexac_unique') {
	         		return "translate(4,4)";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "translate(3,3)";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "translate(2,2)";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "translate(2,2)";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "translate(2,2)";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "translate(1,1)";
	         	}
	         	
	         })
	         .append("use")
	         .attr("xlink:href", "#af-symbol")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (selection.datum().clazz == 'afexac_unique_nc') {
	         		return "none";
	         	} else if (selection.datum().clazz == 'afexac_unique') {
	         		return "rgb(215,48,39)";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "rgb(252,141,89)";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "rgb(203,174,95)";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "rgb(158,186,194)";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "rgb(145,191,219)";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "rgb(69,117,180)";
	         	}
	         })
	         .style("stroke", function(d,i) {
	         	if (selection.datum().clazz == 'afexac_unique_nc') {
	         		return "black";
	         	} else {
	         		return "none";
	         	}
	         })
	         .attr("width", function(d,i) {
	         	if (selection.datum().clazz == 'afexac_unique_nc') {
	         		return "9";
	         	} else if (selection.datum().clazz == 'afexac_unique') {
	         		return "9";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "14";
	         	}
	         })
	         .attr("height", function(d,i) {
	         	if (selection.datum().clazz == 'afexac_unique_nc') {
	         		return "9";
	         	} else if (selection.datum().clazz == 'afexac_unique') {
	         		return "9";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "14";
	         	}
	         });
};

MatrixCard.prototype.showAf1000gSymbol = function(selection) {
	selection.append("g")
	         .attr("class", selection.datum().clazz)
	          .attr("transform", function(d,i) {
	         	if (selection.datum().clazz == 'af100g_unique_nc') {
	         		return "translate(4,4)";
	         	} else if (selection.datum().clazz == 'af1000g_unique') {
	         		return "translate(4,4)";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "translate(3,3)";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "translate(2,2)";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "translate(2,2)";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "translate(1,1)";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "translate(0,0)";
	         	}
	         	
	         })
	         .append("use")
	         .attr("xlink:href", "#af-symbol")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         if (selection.datum().clazz == 'af1000g_unique') {
	         		return "rgb(215,48,39)";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "rgb(252,141,89)";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "rgb(203,174,95)";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "rgb(158,186,194)";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "rgb(145,191,219)";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "rgb(69,117,180)";
	         	}
	         })
	         .attr("width", function(d,i) {
	         	if (selection.datum().clazz == 'af1000g_unique') {
	         		return "9";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "9";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "14";
	         	}
	         })
	         .attr("height", function(d,i) {
	         	if (selection.datum().clazz == 'af1000g_unique') {
	         		return "9";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "9";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "14";
	         	}
	         });
};

MatrixCard.prototype.showRecessiveSymbol = function (selection, options) {

	selection.append("g")
	         .attr("transform", options ? options.transform : "translate(0,0)")
	         .append("use")
	         .attr("xlink:href", '#recessive-symbol')
	         .attr("width", options ? options.width : "20")
	         .attr("height", options ? options.height : "20")
	         .style("pointer-events", "none");
};

MatrixCard.prototype.showDeNovoSymbol = function (selection, options) {
	selection.append("g")
	         .attr("transform", options ? options.transform : "translate(-1,0)")
	         .append("use")
	         .attr("xlink:href", '#denovo-symbol')
	         .attr("width", options ? options.width : "20")
	         .attr("height", options ? options.height : "20")
	         .style("pointer-events", "none");
	
};

MatrixCard.prototype.showSibNotRecessiveSymbol = function (selection, options) {
	selection.append("g")
	         .attr("transform", options ? options.transform : "translate(0,0)")
	         .append("use")
	         .attr("xlink:href", '#recessive-symbol')
	         .attr("width", options ? options.width : "20")
	         .attr("height", options ? options.height : "20")
	         .style("pointer-events", "none");

	selection.append("line")
	         .attr("x1", 2)
	         .attr("y1", 2)
	         .attr("x2", 15)
	         .attr("y2", 15)
	         .style("stroke-width", "2px")
	         .style("stroke", "rgb(144, 148, 169)");


};


MatrixCard.prototype.showSibRecessiveSymbol = function (selection) {
	var options = {};
	if (selection.datum() != null && selection.datum().value == 'recessive_some') {
		options.transform = "translate(1,2)";
		options.width = "17";
		options.height = "17";
	} else {
		options.transform = "translate(0,0)";
		options.width = "22";
		options.height = "22";
	}

	selection.append("g")
	         .attr("transform", options.transform)
	         .append("use")
	         .attr("xlink:href", '#recessive-symbol')
	         .attr("width", options.width)
	         .attr("height", options.height)
	         .style("pointer-events", "none");



};

MatrixCard.prototype.showSibPresentSymbol = function (selection) {
	selection.append("g")
	         .attr("transform",  selection.datum() && selection.datum().value == 'present_all' ? "translate(1,1)" : "translate(3,3)")
	         .append("use")
	         .attr("xlink:href", '#checkmark-symbol')
	         .attr("width",  selection.datum() && selection.datum().value == 'present_all' ? "15" : "10")
	         .attr("height", selection.datum() && selection.datum().value == 'present_all' ? "15" : "10")
	         .attr("fill",   selection.datum() && selection.datum().clazz == 'affected' ? "#81A966": "#ABAFC1")
	         .style("pointer-events", "none");
};

MatrixCard.prototype.showNoInheritSymbol = function (selection) {
	
};

MatrixCard.prototype.getSymbol = function(d,i) {
	 
};

MatrixCard.prototype.showBookmarkSymbol = function(selection) {
	var me = this;

	var width = selection.datum().width ? selection.datum().width : 12;
	var height = selection.datum().height ? selection.datum().width : 12;
	var translate = selection.datum().translate ? selection.datum().translate : "translate(0,1)";
    
	if (selection.datum().clazz != '') {
		selection.append("g")
			 .attr("class", selection.datum().clazz)
	         .attr("transform", translate)
	         .append("use")
	         .attr("xlink:href", '#bookmark-symbol')
	         .attr("width",  width)
	         .attr("height", height);
	         
	}


}

MatrixCard.prototype.showPhenotypeSymbol = function(selection) {
	var me = this;

	var width = selection.datum().width ? selection.datum().width : 13;
	var height = selection.datum().height ? selection.datum().width : 13;
	var translate = selection.datum().translate ? selection.datum().translate : "translate(0,1)";

    
	if (selection.datum().clazz != '') {
		selection.append("g")
			 .attr("class", selection.datum().clazz)
	         .attr("transform", translate)
	         .append("use")
	         .attr("xlink:href", '#phenotype-symbol')
	         .attr("width",  width)
	         .attr("height", height);
	         
	}


}

MatrixCard.prototype.showImpactSymbol = function(selection) {
	var me = this;
	var type = d3.select(selection.node().parentNode).datum().type;
	var symbolScale = d3.scale.linear()
                    .domain([1,6])
                    .range([10,40]);

    var symbolSize = symbolScale(6);
     
	if (type.toUpperCase() == 'SNP' || type.toUpperCase() == 'MNP') {
		selection.append("g")
		         .attr("transform", "translate(4,4)")
		         .append("rect")
		         .attr("width", 8)
		         .attr("height", 8)
		         .attr("class", "filter-symbol " + selection.datum().clazz)
		         .style("pointer-events", "none");		
	} else {
		selection
		  .append("g")
		  .attr("transform", "translate(8,8)")
		  .append('path')
          .attr("d", function(d,i) { 
          	return d3.svg
                     .symbol()
                     .size(symbolSize)
                     .type( function(d,i) {
                     	if (type.toUpperCase() == 'DEL') {
						    return 'triangle-up';
						} else if (type.toUpperCase() == 'INS') {
						    return  'circle';
						} else if (type.toUpperCase() == 'COMPLEX') {
						    return 'diamond';
						} else {
							return 'square';
						}
                     })();
          })
          .attr("class", "filter-symbol " + selection.datum().clazz);
	}

}


MatrixCard.prototype.showImpactBadge = function(selection, variant, impactClazz) {
	var me = this;
	var type = null;
	var transform1 = "translate(1,3)";
	var transform2 = "translate(5,6)";
	var clazz = null;
	if (variant) {
		type = variant.type;
		clazz = impactClazz ? impactClazz : (variant.impact && variant.impact.length > 0 ? "impact_" + variant.impact[0].toUpperCase() : "");
	} else {
		type = selection.datum().type;
		transform1 = selection.datum().hasOwnProperty("transform") ? selection.datum().transform : "translate(1,3)";
		transform2 =  selection.datum().hasOwnProperty("transform") ? selection.datum().transform : "translate(5,6)";
		clazz = selection.datum().clazz;
	}
	var symbolScale = d3.scale.linear()
                    .domain([1,6])
                    .range([10,40]);

    var symbolSize = symbolScale(6);
     
	if (type.toUpperCase() == 'SNP') {
		selection.append("g")
		          .attr("transform", transform1)
		         .append("rect")
		         .attr("width", 8)
		         .attr("height", 8)
		         .attr("class", "filter-symbol " + clazz)
		         .style("pointer-events", "none");		
	} else {
		selection
		  .append("g")
		  .attr("transform", transform2)
		  .append('path')
          .attr("d", function(d,i) { 
          	return d3.svg
                     .symbol()
                     .size(symbolSize)
                     .type( function(d,i) {
                     	if (type.toUpperCase() == 'DEL') {
						    return 'triangle-up';
						} else if (type.toUpperCase() == 'INS') {
						    return  'circle';
						} else if (type.toUpperCase() == 'COMPLEX') {
						    return 'diamond';
						}
                     })();
          })
          .attr("class", "filter-symbol " + clazz);
	}

}
