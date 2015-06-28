function MatrixCard() {
	this.featureMatrix = null;
	this.featureVcfData = null;
	this.sourceVcfData = null;
	this.featureMatrix  = null;


	this.clinvarMap     = {  
						'pathogenic'            : {value: 1, clazz: 'clinvar_path', symbolFunction: this.showClinVarSymbol},
                        'likely_pathogenic'     : {value: 2, clazz: 'clinvar_lpath', symbolFunction: this.showClinVarSymbol},
                        'uncertain_significance': {value: 3, clazz: 'clinvar_uc', symbolFunction: this.showClinVarSymbol},
                        'benign'                : {value: 100, clazz: 'clinvar_benign', symbolFunction: this.showClinVarSymbol},
                        'likely_benign'         : {value: 101, clazz: 'clinvar_lbenign', symbolFunction: this.showClinVarSymbol},
                        'conflicting_data_from_submitters': {value: 121, clazz: 'clinvar_cd', symbolFunction: this.showClinVarSymbol},
						'conflicting_interpretations_of_pathogenicity':  {value: 121, clazz: 'clinvar_cd', symbolFunction: this.showClinVarSymbol},                       
                        'drug_response'         : {value: 131, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'confers_sensivity'     : {value: 131, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'risk_factor'           : {value: 131, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'other'                 : {value: 131, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'association'           : {value: 131, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'protective'            : {value: 131, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'not_provided'          : {value: 141, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'none'                  : {value: 151, clazz: ''}
                     };
	this.impactMap = {  HIGH:     {value: 1, clazz: 'impact_HIGH',     symbolFunction: this.showImpactSymbol},    
                        MODERATE: {value: 2, clazz: 'impact_MODERATE', symbolFunction: this.showImpactSymbol},  
                        MODIFIER: {value: 3, clazz: 'impact_MODIFIER', symbolFunction: this.showImpactSymbol},
                        LOW:      {value: 4, clazz: 'impact_LOW',      symbolFunction: this.showImpactSymbol}
                     };
	this.inheritanceMap = {  
		                denovo:    {value: 1, clazz: 'denovo',    symbolFunction: this.showDeNovoSymbol},  
                        recessive: {value: 2, clazz: 'recessive', symbolFunction: this.showRecessiveSymbol},
                        none:      {value: 3, clazz: 'noinherit', symbolFunction: this.showNoInheritSymbol}
                     };
	// For af range, value must be > min and <= max
	this.afExacMap = [ {min: -100.1, max: -100,   value: +99, clazz: 'afexac_unique_nc', symbolFunction: this.showAfExacSymbol},	
                       {min: -1.1,   max: +0,     value: +3,  clazz: 'afexac_unique',    symbolFunction: this.showAfExacSymbol},	
                       {min: +0,     max: +.0001, value: +3,  clazz: 'afexac_uberrare',   symbolFunction: this.showAfExacSymbol},	
                       {min: +.0001, max: +.001,  value: +4,  clazz: 'afexac_superrare',  symbolFunction: this.showAfExacSymbol},	
                       {min: +.001,  max: +.01,   value: +5,  clazz: 'afexac_rare',       symbolFunction: this.showAfExacSymbol},	
                       {min: +.01,   max: +.05,   value: +6,  clazz: 'afexac_uncommon',   symbolFunction: this.showAfExacSymbol},	
                       {min: +.05,   max: +1,     value: +7,  clazz: 'afexac_common',     symbolFunction: this.showAfExacSymbol},	
                      ];
	this.af1000gMap= [ {min: -1.1, max: +0,     value: +2,  clazz: 'af1000g_unique',     symbolFunction: this.showAf1000gSymbol},	
                       {min: +0,    max: +.0001, value: +3,  clazz: 'af1000g_uberrare',   symbolFunction: this.showAf1000gSymbol},	
                       {min: +.0001,max: +.001,  value: +4,  clazz: 'af1000g_superrare',  symbolFunction: this.showAf1000gSymbol},	
                       {min: +.001, max: +.01,   value: +5,  clazz: 'af1000g_rare',       symbolFunction: this.showAf1000gSymbol},	
                       {min: +.01,  max: +.05,   value: +6,  clazz: 'af1000g_uncommon',   symbolFunction: this.showAf1000gSymbol},	
                       {min: +.05,  max: +1,     value: +7,  clazz: 'af1000g_common',     symbolFunction: this.showAf1000gSymbol},	
                      ];                      



	this.matrixRows = [
		{name:'ClinVar'      ,order:0, index:1, match: 'exact', attribute: 'clinVarClinicalSignificance',     map: this.clinvarMap },
		{name:'Impact'       ,order:1, index:0, match: 'exact', attribute: 'impact',      map: this.impactMap},
		{name:'Inheritance'  ,order:2, index:2, match: 'exact', attribute: 'inheritance', map: this.inheritanceMap},
		{name:'AF (1000G)'   ,order:3, index:3, match: 'range', attribute: 'af1000G',     map: this.af1000gMap},
		{name:'AF (ExAC)'    ,order:4, index:4, match: 'range', attribute: 'afExAC',      map: this.afExacMap}
	];

	this.featureUnknown = 199;

}

MatrixCard.prototype.init = function() {
	var me = this;
	this.featureMatrix = featureMatrixD3()
				    .margin({top: 0, right: 40, bottom: 4, left: 24})
				    .cellSize(30)
				    .columnLabelHeight(100)
				    .rowLabelWidth(100)
				    .tooltipHTML(variantTooltipHTML)
				    .on('d3click', function(variant) {
				    	variantCards.forEach(function(variantCard) {
				    		variantCard.highlightVariants(d3.selectAll("#feature-matrix .col.current").data());
				    	});
				    })
				     .on('d3mouseover', function(variant) {
				    	variantCards.forEach(function(variantCard) {
				    		variantCard.showVariantCircle(variant);
				    	});
				    })
				    .on('d3mouseout', function() {
				    	variantCards.forEach(function(variantCard) {
				    		variantCard.hideVariantCircle();
				    	});
				    })
				    .on('d3rowup', function(i) {
				    	var column = null;
				    	var columnPrev = null;
				    	me.matrixRows.forEach(function(col) {
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
				    	me.matrixRows.forEach(function(col) {
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

MatrixCard.prototype.showFeatureMatrix = function(theVariantCard, theVcfData, regionStart, regionEnd, showInheritance) {
	var me = this;

	var windowWidth = $(window).width();
	var filterPanelWidth = $('#filter-track').width();
	$('#matrix-panel').css("max-width", (windowWidth - filterPanelWidth) - 60);

	//$("#matrix-track .inheritance.loader").css("display", "inline");
	$("#matrix-panel .loader").css("display", "block");
	$("#feature-matrix").addClass("hide");

	this.sourceVcfData = theVcfData;

	if (showInheritance) {
		// we need to compare the proband variants to mother and father variants to determine
		// the inheritance mode.  After this completes, we are ready to show the
		// feature matrix.

		window.compareVariantsToPedigree(theVcfData, function() {
			//$("#matrix-track .inheritance.loader").css("display", "none");
			me.fillFeatureMatrix(theVcfData);

		});
	} else {
		me.fillFeatureMatrix(theVcfData);
	}
	
}


MatrixCard.prototype.fillFeatureMatrix = function(theVcfData) {
	var me = this;

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
	this.matrixRows = this.matrixRows.sort(function(a, b) {
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
		for (var i = 0; i < me.matrixRows.length; i++) {
			features.push(null);
		}

		me.matrixRows.forEach( function(matrixRow) {
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
	  for (var i = 0; i < me.matrixRows.length; i++) {
		if (a.features[i].rank > 99  && b.features[i].rank > 99) {
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
	$("#matrix-panel .loader").css("display", "none");

	// Load the chart with the new data
	this.featureMatrix.matrixRows(this.matrixRows);
	var selection = d3.select("#feature-matrix").data([topFeatures]);  

    this.featureMatrix(selection, {showColumnLabels: false});

    // We have new properties to filter on (for inheritance), so refresh the 
    //proband variant chart.
	variantCards.forEach(function(variantCard) {
		if (variantCard.getRelationship() == 'proband') {
			variantCard.showVariants(regionStart, regionEnd);
		}
	});

	
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
	         .attr("transform", "translate(7,7)")
	         .append("use")
	         .attr("xlink:href", "#clinvar-symbol")
	         .attr("width", "16")
	         .attr("height", "16")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (selection.datum().clazz == 'clinvar_path') {
	         		return "#ad494A";
	         	} else if (selection.datum().clazz == 'clinvar_lpath') {
	         		return "#C07778";
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

MatrixCard.prototype.showAfExacSymbol = function(selection) {
	selection.append("g")
	         .attr("class", selection.datum().clazz)
	         .attr("transform", "translate(7,7)")
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
	         .attr("transform", "translate(7,7)")
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
	         .attr("transform", "translate(0,3)")
	         .append("use")
	         .attr("xlink:href", '#recessive-symbol')
	         .style("pointer-events", "none");

};

MatrixCard.prototype.sshowDeNovoSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(0,3)")
	         .append("use")
	         .attr("xlink:href", '#denovo-symbol')
	         .style("pointer-events", "none");
	
};

MatrixCard.prototype.showNoInheritSymbol = function (selection) {
	
};

MatrixCard.prototype.showImpactSymbol = function(selection) {
	selection.append("g")
	         .attr("transform", "translate(9,9)")
	         .append("rect")
	         .attr("width", 10)
	         .attr("height", 10)
	         .attr("class", "filter-symbol " + selection.datum().clazz)
	         .style("pointer-events", "none");

}
