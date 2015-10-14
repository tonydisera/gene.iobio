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
                        MODERATE: {value: 2, badge: false, clazz: 'impact_MODERATE', symbolFunction: this.showImpactSymbol},  
                        MODIFIER: {value: 3, badge: false, clazz: 'impact_MODIFIER', symbolFunction: this.showImpactSymbol},
                        LOW:      {value: 4, badge: false, clazz: 'impact_LOW',      symbolFunction: this.showImpactSymbol}
                     };
	this.siftMap = {  
                        deleterious:                 {value: 1, badge: true, clazz: 'sift_deleterious', symbolFunction: this.showSiftSymbol},
                        deleterious_low_confidence:  {value: 2, badge: true, clazz: 'sift_deleterious_low_confidence', symbolFunction: this.showSiftSymbol},
		                tolerated_low_confidence: {value: 3, badge: false, clazz: 'sift_tolerated_low_confidence',symbolFunction: this.showSiftSymbol},  
		                tolerated:    {value: 102, badge: false, clazz: 'sift_tolerated',symbolFunction: this.showSiftSymbol},  
                        none:         {value: 103, badge: false, clazz: ''}
                     };
	this.polyphenMap = {  
                        probably_damaging:    {value: 1, badge: true, clazz: 'polyphen_probably_damaging', symbolFunction: this.showPolyPhenSymbol},
		                possibly_damaging:    {value: 2, badge: true, clazz: 'polyphen_possibly_damaging', symbolFunction: this.showPolyPhenSymbol},  
                        benign:               {value: 103, badge: false, clazz: 'polyphen_benign',            symbolFunction:this.showPolyPhenSymbol},
                        none:                 {value: 104, badge: false, clazz: ''}
                     };
	this.inheritanceMap = {  
		                denovo:    {value: 1, badge: true, clazz: 'denovo',    symbolFunction: this.showDeNovoSymbol},  
                        recessive: {value: 2, badge: true, clazz: 'recessive', symbolFunction: this.showRecessiveSymbol},
                        none:      {value: 3, badge: false, clazz: 'noinherit', symbolFunction: this.showNoInheritSymbol}
                     };
	this.uaMap = {  
		                not_recessive_in_sibs: {value: 1,   badge: true, clazz: 'not_recessive_in_sibs', symbolFunction: this.showUnaffectedSymbol},  
                        none:                  {value: 104, badge: false, clazz: '',                      symbolFunction: ''}
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
	this.af1000gMap= [ {min: -1.1, max: +0,     value: +2,   badge: false, clazz: 'af1000g_unique',     symbolFunction: this.showAf1000gSymbol},	
                       {min: +0,    max: +.0001, value: +3,  badge: false, clazz: 'af1000g_uberrare',   symbolFunction: this.showAf1000gSymbol},	
                       {min: +.0001,max: +.001,  value: +4,  badge: false, clazz: 'af1000g_superrare',  symbolFunction: this.showAf1000gSymbol},	
                       {min: +.001, max: +.01,   value: +5,  badge: false, clazz: 'af1000g_rare',       symbolFunction: this.showAf1000gSymbol},	
                       {min: +.01,  max: +.05,   value: +6,  badge: false, clazz: 'af1000g_uncommon',   symbolFunction: this.showAf1000gSymbol},	
                       {min: +.05,  max: +1,     value: +7,  badge: false, clazz: 'af1000g_common',     symbolFunction: this.showAf1000gSymbol},	
                      ];                      



	this.matrixRows = [
		{name:'Pathogenicity - ClinVar'      ,order:0, index:1, match: 'exact', attribute: 'clinVarClinicalSignificance',     map: this.clinvarMap },
		{name:'Impact - SnpEff'              ,order:3, index:0, match: 'exact', attribute: 'impact',      map: this.impactMap},
		{name:'Not recessive in Unaff. Sibs' ,order:5, index:7, match: 'exact', attribute: 'ua',          map: this.uaMap},
		{name:'Inheritance Mode'             ,order:4, index:2, match: 'exact', attribute: 'inheritance', map: this.inheritanceMap},
		{name:'Allele Frequency - 1000G'     ,order:6, index:3, match: 'range', attribute: 'af1000G',     map: this.af1000gMap},
		{name:'Allele Frequency - ExAC'      ,order:7, index:4, match: 'range', attribute: 'afExAC',      map: this.afExacMap},
		{name:'Pathogenecity - SIFT'         ,order:2, index:5, match: 'exact', attribute: 'vepSIFT',     map: this.siftMap},
		{name:'Pathogengicity - PolyPhen'    ,order:1, index:6, match: 'exact', attribute: 'vepPolyPhen', map: this.polyphenMap}
	];

	this.matrixRowsNoUa = [
		{name:'Pathogenicity - ClinVar'      ,order:0, index:1, match: 'exact', attribute: 'clinVarClinicalSignificance',     map: this.clinvarMap },
		{name:'Impact - SnpEff'              ,order:3, index:0, match: 'exact', attribute: 'impact',      map: this.impactMap},
		{name:'Inheritance Mode'             ,order:4, index:2, match: 'exact', attribute: 'inheritance', map: this.inheritanceMap},
		{name:'Allele Frequency - 1000G'     ,order:5, index:3, match: 'range', attribute: 'af1000G',     map: this.af1000gMap},
		{name:'Allele Frequency - ExAC'      ,order:6, index:4, match: 'range', attribute: 'afExAC',      map: this.afExacMap},
		{name:'Pathogenecity - SIFT'         ,order:2, index:5, match: 'exact', attribute: 'vepSIFT',     map: this.siftMap},
		{name:'Pathogengicity - PolyPhen'    ,order:1, index:6, match: 'exact', attribute: 'vepPolyPhen', map: this.polyphenMap}
	];

	this.filteredMatrixRows = null;


	this.featureUnknown = 199;

}

MatrixCard.prototype.setRowLabel = function(searchTerm, newRowLabel) {
	this.matrixRows.forEach( function (row) {
		if (row.name.indexOf(searchTerm) >= 0) {
			row.name = newRowLabel;
		}
	});
}

MatrixCard.prototype.setTooltipGenerator = function(tooltipFunction) {
	this.featureMatrix.tooltipHTML(tooltipFunction);

}

MatrixCard.prototype.init = function() {
	var me = this;

	this.featureMatrix = featureMatrixD3()
				    .margin({top: 0, right: 40, bottom: 4, left: 24})
				    .cellSize(27)
				    .columnLabelHeight(42)
				    .rowLabelWidth(140)
				    .on('d3click', function(variant) {
				    	
				    	me.showTooltip(variant);
				    	variantCards.forEach(function(variantCard) {
				    		variantCard.highlightVariants(d3.selectAll("#feature-matrix .col.current").data());
				    		variantCard.showCoverageCircle(variant, getProbandVariantCard());
				    	});
				    })
				     .on('d3mouseover', function(variant) {
				     	me.showTooltip(variant);
				    	variantCards.forEach(function(variantCard) {
				    		variantCard.showVariantCircle(variant);
				    		variantCard.showCoverageCircle(variant, getProbandVariantCard());
				    	});
				    })
				    .on('d3mouseout', function() {
				    	me.hideTooltip();
				    	variantCards.forEach(function(variantCard) {
				    		variantCard.hideVariantCircle();
				    	});
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
				    	me.fillFeatureMatrix();
				    	
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
				    	me.fillFeatureMatrix();

				    });

	var matrixCardSelector = $('#matrix-track');
	matrixCardSelector.find('#expand-button').on('click', function() {
		matrixCardSelector.find('.fullview').removeClass("hide");
	});
	matrixCardSelector.find('#minimize-button').on('click', function() {
		matrixCardSelector.find('.fullview').addClass("hide");
	});

}

MatrixCard.prototype.hideTooltip = function() {
	var tooltip = d3.select('#matrix-track .tooltip');
	tooltip.transition()        
           .duration(500)      
           .style("opacity", 0);   
}


MatrixCard.prototype.showTooltip = function(variant) {
	var tooltip = d3.select('#matrix-track .tooltip');
	tooltip.transition()        
	 .duration(1000)      
	 .style("opacity", .9);  

	tooltip.html(window.getProbandVariantCard().variantTooltipHTML(variant, "Click on column to isolate variant"));

	var selection = tooltip.select("#coverage-svg");
	window.getProbandVariantCard().createAlleleCountSVGTrio(selection, variant);
   

	var h = tooltip[0][0].offsetHeight;
	var w = 300;

	var x = variant.screenX;
	var y = variant.screenY;



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

MatrixCard.prototype.fillFeatureMatrix = function(theVcfData) {
	var me = this;

	// Figure out if we should show the unaffected sibs row
	this.filteredMatrixRows = this.matrixRows;
	this.matrixRows.forEach(function(mr) {
		if (mr.attribute == 'ua') {
			if (variantCardsUnaffectedSibs.length == 0) {
				me.filteredMatrixRows = me.matrixRowsNoUa;
			}
		}
	});
	

	var windowWidth = $(window).width();
	var filterPanelWidth = $('#filter-track').width();
	$('#matrix-panel').css("max-width", (windowWidth - filterPanelWidth) - 60);
	
	// Set the width so that scrolling works properly
	$('#feature-matrix').css('min-width', $('#matrix-panel').width());

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

	// Get the top 20 variants
	var topFeatures = null;
	if($('#matrixCheckboxAll').prop('checked')) {
		topFeatures = sortedFeatures.slice(0, sortedFeatures.length)
	} else if ($('#matrixCheckboxTop100').prop('checked')){
		topFeatures = sortedFeatures.slice(0, 100 );
	} else if ($('#matrixCheckboxTop20').prop('checked')){
		topFeatures = sortedFeatures.slice(0, 20 );
	}
	
	$("#feature-matrix").removeClass("hide");
	$("#feature-matrix-note").removeClass("hide");
	$("#matrix-panel .loader").addClass("hide");

	// Load the chart with the new data
	this.featureMatrix.matrixRows(this.filteredMatrixRows);
	var selection = d3.select("#feature-matrix").data([topFeatures]);  

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



MatrixCard.prototype.toggleMatrixCheckbox = function(element) {

	if (element.id == 'matrixCheckboxAll') {
		$('#matrixCheckboxTop20').prop("checked", false);
		$('#matrixCheckboxTop100').prop("checked", false);
	} else if (element.id == 'matrixCheckboxTop100') {
		$('#matrixCheckboxTop20').prop("checked", false);
		$('#matrixCheckboxAll').prop("checked", false);
	} else {
		$('#matrixCheckboxAll').prop("checked", false);
		$('#matrixCheckboxTop100').prop("checked", false);
	}
	this.fillFeatureMatrix();
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



MatrixCard.prototype.showClinVarSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", selection.datum().hasOwnProperty("transform") ? selection.datum().transform : "translate(5,5)")
	         .append("use")
	         .attr("xlink:href", "#clinvar-symbol")
	         .attr("width", selection.datum().hasOwnProperty("width") ? selection.datum().width : "16")
	         .attr("height", selection.datum().hasOwnProperty("height") ? selection.datum().height : "16")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (selection.datum().clazz == 'clinvar_path') {
	         		return "#ad494A";
	         	} else if (selection.datum().clazz == 'clinvar_lpath') {
	         		return "#FB7737";
	         	} else if (selection.datum().clazz == 'clinvar_uc') {
	         		return "rgba(231,186,82,1)";
	         	} else if (selection.datum().clazz == 'clinvar_benign') {
	         		return "rgba(181,207,107,1)";
	         	} else if (selection.datum().clazz == 'clinvar_lbenign') {
	         		return "rgba(156,194,49,1)";
	         	} else if (selection.datum().clazz == 'clinvar_other') {
	         		return "rgb(189,189,189)";
	         	} else if (selection.datum().clazz == 'clinvar_cd') {
	         		return "rgb(111, 182, 180)";
	         	}
	         });

};

MatrixCard.prototype.showPolyPhenSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", selection.datum().hasOwnProperty("transform") ? selection.datum().transform : "translate(5,5)")
	         .append("use")
	         .attr("xlink:href", "#biohazard-symbol")
	         .attr("width", selection.datum().hasOwnProperty("width") ? selection.datum().width : "16")
	         .attr("height", selection.datum().hasOwnProperty("height") ? selection.datum().height : "16")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (selection.datum().clazz == 'polyphen_probably_damaging') {
	         		return "#ad494A";
	         	} else if (selection.datum().clazz == 'polyphen_possibly_damaging') {
	         		return "#FB7737";
	         	} else if (selection.datum().clazz == 'polyphen_benign') {
	         		return "rgba(181, 207, 107,1)";
	         	} 
	         });

};

MatrixCard.prototype.showSiftSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", selection.datum().hasOwnProperty("transform") ? selection.datum().transform : "translate(5,5)")
	         .append("use")
	         .attr("xlink:href", "#danger-symbol")
	         .attr("width", selection.datum().hasOwnProperty("width") ? selection.datum().width : "16")
	         .attr("height", selection.datum().hasOwnProperty("height") ? selection.datum().height : "16")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (selection.datum().clazz == 'sift_deleterious') {
	         		return "#ad494A";
	         	} else if (selection.datum().clazz == 'sift_deleterious_low_confidence') {
	         		return "#FB7737";
	         	} else if (selection.datum().clazz == 'sift_tolerated_low_confidence') {
	         		return "rgba(231,186,82,1)";
	         	} else if (selection.datum().clazz == 'sift_tolerated') {
	         		return "rgba(181, 207, 107,1)";
	         	} 
	         });

};
MatrixCard.prototype.showAfExacSymbol = function(selection) {
	selection.append("g")
	         .attr("class", selection.datum().clazz)
	         .attr("transform", function(d,i) {
	         	if (selection.datum().clazz == 'afexac_unique_nc') {
	         		return "translate(7,7)";
	         	} else if (selection.datum().clazz == 'afexac_unique') {
	         		return "translate(7,7)";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "translate(6,6)";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "translate(5,5)";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "translate(5,5)";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "translate(4,4)";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "translate(3,3)";
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
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_unique') {
	         		return "11";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "20";
	         	}
	         })
	         .attr("height", function(d,i) {
	         	if (selection.datum().clazz == 'afexac_unique_nc') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_unique') {
	         		return "11";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "20";
	         	}
	         });
};

MatrixCard.prototype.showAf1000gSymbol = function(selection) {
	selection.append("g")
	         .attr("class", selection.datum().clazz)
	          .attr("transform", function(d,i) {
	         	if (selection.datum().clazz == 'af100g_unique_nc') {
	         		return "translate(7,7)";
	         	} else if (selection.datum().clazz == 'af1000g_unique') {
	         		return "translate(7,7)";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "translate(6,6)";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "translate(5,5)";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "translate(5,5)";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "translate(4,4)";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "translate(3,3)";
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
	         		return "11";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "20";
	         	}
	         })
	         .attr("height", function(d,i) {
	         	if (selection.datum().clazz == 'af1000g_unique') {
	         		return "11";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "20";
	         	}
	         });
};

MatrixCard.prototype.showRecessiveSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(0,2)")
	         .append("use")
	         .attr("xlink:href", '#recessive-symbol')
	         .attr("width", "27")
	         .attr("height", "27")
	         .style("pointer-events", "none");
};

MatrixCard.prototype.showDeNovoSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(0,2)")
	         .append("use")
	         .attr("xlink:href", '#denovo-symbol')
	         .attr("width", "27")
	         .attr("height", "27")
	         .style("pointer-events", "none");
	
};

MatrixCard.prototype.showUnaffectedSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(0,2)")
	         .append("use")
	         .attr("xlink:href", '#recessive-symbol')
	         .attr("width", "27")
	         .attr("height", "27")
	         .style("pointer-events", "none");

	selection.append("line")
	         .attr("x1", 5)
	         .attr("y1", 5)
	         .attr("x2", 20)
	         .attr("y2", 20)
	         .style("stroke-width", "2.5px")
	         .style("stroke", "rgba(168, 170, 177, 0.81)");


};

MatrixCard.prototype.showNoInheritSymbol = function (selection) {
	
};

MatrixCard.prototype.getSymbol = function(d,i) {
	 
};

MatrixCard.prototype.showImpactSymbol = function(selection) {
	var me = this;
	var type = d3.select(selection.node().parentNode).datum().type;
	if (type.toUpperCase() == 'SNP') {
		selection.append("g")
		         .attr("transform", "translate(9,9)")
		         .append("rect")
		         .attr("width", 10)
		         .attr("height", 10)
		         .attr("class", "filter-symbol " + selection.datum().clazz)
		         .style("pointer-events", "none");		
	} else {
		selection
		  .append("g")
		  .attr("transform", "translate(14,14)")
		  .append('path')
          .attr("d", function(d,i) { 
          	return d3.svg
                     .symbol()
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
          .attr("class", "filter-symbol " + selection.datum().clazz);
	}

}
