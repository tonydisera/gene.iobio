function ExamineCard() {
	this.examinedVariant = null;
}

ExamineCard.prototype.init = function() {
}

ExamineCard.prototype.showVariant = function(variant, isRefresh) {
	// If this is a refresh (with the extra annotations, e.g. hgvs, rsid) check to see
	// if the examine card is still on the same variant.  This will work around the async
	// nature of the refresh in cases where the user has moved on to examining a new
	// variant before the prior variant is refreshed with the extra annotations.
	if (isRefresh) {
		if (this.examinedVariant) {
			if (this.examinedVariant.start != variant.start ||
				this.examinedVariant.alt != variant.alt ||
				this.examinedVariant.ref != variant.ref ) {
				return;
			}
		}
	}


	$('#examine-card #examine-card-content').html(getProbandVariantCard().variantDetailHTML(variant));

	if (variant.isBookmark) {
		$("#examine-card .tooltip-title").prepend("<svg class=\"bookmark-badge\" height=\"14\" width=\"15\">");
		var selection = d3.select('#examine-card .bookmark-badge').data([{clazz: "bookmark"}]);
		matrixCard.showBookmarkSymbol(selection);
	}
	var impactList =  (filterCard.annotationScheme == null || filterCard.annotationScheme.toLowerCase() == 'snpeff' ? variant.impact : variant.vepImpact);
	for (impact in impactList) {
		var theClazz = 'impact_' + impact;	
		$("#examine-card .tooltip-header:contains('Impact')").next().prepend("<svg class=\"impact-badge\" height=\"11\" width=\"11\">");
		var selection = d3.select('#examine-card .impact-badge ').data([{width:10, height:10,clazz: theClazz,  type: variant.type}]);
		matrixCard.showImpactBadge(selection);	

	}

    for (key in variant.clinVarClinicalSignificance) {
    	if (matrixCard.clinvarMap.hasOwnProperty(key)  && matrixCard.clinvarMap[key].badge == true) {
		    var clazz = matrixCard.clinvarMap[key].clazz;
		    var badge = matrixCard.clinvarMap[key].badge;
		    if (badge) {
				$("#examine-card .tooltip-header:contains('ClinVar')").next().prepend("<svg class=\"clinvar-badge\" height=\"12\" width=\"14\">");
				var selection = d3.select('#examine-card .clinvar-badge').data([{width:10, height:10, transform: 'translate(0,1)', clazz: clazz}]);
				matrixCard.showClinVarSymbol(selection);						    	
		    }
		}
	}

	for (key in variant.vepSIFT) {
		if (matrixCard.siftMap[key]) {
			var clazz = matrixCard.siftMap[key].clazz;
			if (clazz) {
				$("#examine-card .tooltip-header:contains('SIFT')").next().prepend("<svg class=\"sift-badge\" height=\"12\" width=\"13\">");
				var selection = d3.select('#examine-card .sift-badge').data([{width:11, height:11, transform: 'translate(0,1)', clazz: clazz }]);					
				matrixCard.showSiftSymbol(selection);				
			}			
		}

	}

	for (key in variant.vepPolyPhen) {
		if (matrixCard.polyphenMap[key]) {
			var clazz = matrixCard.polyphenMap[key].clazz;
			if (clazz) {
				$("#examine-card .tooltip-header:contains('PolyPhen')").next().prepend("<svg class=\"polyphen-badge\" height=\"12\" width=\"12\">");
				var selection = d3.select('#examine-card .polyphen-badge').data([{width:10, height:10, transform: 'translate(0,2)', clazz: clazz }]);					
				matrixCard.showPolyPhenSymbol(selection);				
			}
		}
	}



	if (variant.inheritance && variant.inheritance != '') {
		var clazz = matrixCard.inheritanceMap[variant.inheritance].clazz;
		var symbolFunction = matrixCard.inheritanceMap[variant.inheritance].symbolFunction;
		$("#examine-card .tooltip-title:contains('inheritance')").prepend("<svg class=\"inheritance-badge\" height=\"12\" width=\"14\">");
		var options = {width:18, height:20, transform: 'translate(-2,-2)'};
		var selection = d3.select('#examine-card .inheritance-badge').data([{clazz: clazz}]);
		symbolFunction(selection, options);		
	}	

	if (matrixCard.isNumeric(variant.afExAC)) {
		var rawValue = variant.afExAC;
		var afClazz = null;
		var afSymbolFunction = null;
		matrixCard.afExacMap.forEach( function(rangeEntry) {
			if (+rawValue > rangeEntry.min && +rawValue <= rangeEntry.max) {
				afClazz = rangeEntry.clazz;
				afSymbolFunction = rangeEntry.symbolFunction;
			}
		});
		if (afClazz) {
			$("#examine-card .tooltip-header:contains('Allele Freq ExAC')").next().prepend("<svg class=\"afexac-badge\" height=\"14\" width=\"15\">");
			var selection = d3.select('#examine-card .afexac-badge').data([{clazz: afClazz}]);
			afSymbolFunction(selection);		
		}		
	}
	
	if (matrixCard.isNumeric(variant.af1000G)) {
		var rawValue = variant.af1000G;
		var afClazz = null;
		var afSymbolFunction = null;
		matrixCard.afExacMap.forEach( function(rangeEntry) {
			if (+rawValue > rangeEntry.min && +rawValue <= rangeEntry.max) {
				afClazz = rangeEntry.clazz;
				afSymbolFunction = rangeEntry.symbolFunction;
			}
		});
		if (afClazz) {
			$("#examine-card .tooltip-header:contains('Allele Freq 1000G')").next().prepend("<svg class=\"af1000g-badge\" height=\"14\" width=\"15\">");
			var selection = d3.select('#examine-card .af1000g-badge').data([{clazz: afClazz}]);
			afSymbolFunction(selection);		
		}		
	}


	var selection = d3.select("#examine-card #coverage-svg");
	getProbandVariantCard().createAlleleCountSVGTrio(selection, variant, 95);

	// keep track of the variant that is current being examined
	this.examinedVariant = variant;
}