function ExamineCard() {
	this.examinedVariant = null;
}

ExamineCard.prototype.init = function() {
}

ExamineCard.prototype.showVariant = function(variant, isRefresh) {
	var me = this;
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

	me.injectVariantGlyphs(variant, '#examine-card');

	var selection = d3.select("#examine-card #coverage-svg");
	getProbandVariantCard().createAlleleCountSVGTrio(selection, variant, 90);

	// keep track of the variant that is current being examined
	this.examinedVariant = variant;
}

ExamineCard.prototype.injectVariantGlyphs = function(tooltip, variant, selector) {
	if (selector == ".tooltip") {
		var impactList =  (filterCard.annotationScheme == null || filterCard.annotationScheme.toLowerCase() == 'snpeff' ? variant.impact : variant[IMPACT_FIELD_TO_COLOR]);
		for (impact in impactList) {
			var theClazz = 'impact_' + impact;	
			if ($(tooltip[0]).find(".tooltip-title.main-header").length > 0) {
				$(tooltip[0]).find(".tooltip-title.main-header").prepend("<svg class=\"impact-badge\" height=\"11\" width=\"14\">");
				var selection = tooltip.select('.impact-badge').data([{width:10, height:10,clazz: theClazz,  type: variant.type}]);
				matrixCard.showImpactBadge(selection);					
			}

		}

		if ($(tooltip[0]).find(".tooltip-title.highest-impact-badge").length > 0) {
			var highestImpactList =  (filterCard.annotationScheme == null || filterCard.annotationScheme.toLowerCase() == 'snpeff' ? variant.highestImpact : variant.highestImpactVep);
			for (impact in highestImpactList) {
				var theClazz = 'impact_' + impact;	
				$(tooltip[0]).find(".tooltip-title.highest-impact-badge").prepend("<svg class=\"impact-badge\" height=\"11\" width=\"14\">");
				var selection = tooltip.select('.highest-impact-badge .impact-badge').data([{width:10, height:10,clazz: theClazz,  type: variant.type}]);
				matrixCard.showImpactBadge(selection);	
			}		
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
	} else {
		var translate = variant.type.toLowerCase() == "snp" || variant.type.toLowerCase() == "mnp" ? 'translate(0,2)' : 'translate(5,6)';
		
		var impactList =  (filterCard.annotationScheme == null || filterCard.annotationScheme.toLowerCase() == 'snpeff' ? variant.impact : variant[IMPACT_FIELD_TO_COLOR]);
		for (impact in impactList) {
			var theClazz = 'impact_' + impact;	
			$(selector + " .tooltip-value.impact-badge").prepend("<svg class=\"impact-badge\" style=\"float:left\" height=\"12\" width=\"14\">");
			var selection = d3.select(selector + ' .impact-badge svg.impact-badge ').data([{width:10, height:10,clazz: theClazz,  transform: translate, type: variant.type}]);
			matrixCard.showImpactBadge(selection);	
		}		

		if ($(selector + " .tooltip-value.highest-impact-badge").length > 0) {
			var highestImpactList =  (filterCard.annotationScheme == null || filterCard.annotationScheme.toLowerCase() == 'snpeff' ? variant.highestImpact : variant.highestImpactVep);
			for (impact in highestImpactList) {
				var theClazz = 'impact_' + impact;	
				$(selector + " .tooltip-value.highest-impact-badge").prepend("<svg class=\"impact-badge\" style=\"float:left\" height=\"12\" width=\"14\">");
				var selection = d3.select(selector + ' .highest-impact-badge svg.impact-badge').data([{width:10, height:10,clazz: theClazz, transform: translate, type: variant.type}]);
				matrixCard.showImpactBadge(selection);	
			}
		}

	}


    for (key in variant.clinVarClinicalSignificance) {
    	if (matrixCard.clinvarMap.hasOwnProperty(key)) {
		    var clazz = matrixCard.clinvarMap[key].clazz;
		    var badge = matrixCard.clinvarMap[key].examineBadge;
		    if (badge && $(selector + " .tooltip-header:contains('ClinVar')").length > 0) {
				$(selector + " .tooltip-header:contains('ClinVar')").next().prepend("<svg class=\"clinvar-badge\" style=\"float:left\"  height=\"12\" width=\"14\">");
				var selection = d3.select(selector + ' .clinvar-badge').data([{width:10, height:10, transform: 'translate(0,1)', clazz: clazz}]);
				matrixCard.showClinVarSymbol(selection);						    			    	
		    }
		}
	}

	for (key in variant.vepSIFT) {
		if (matrixCard.siftMap[key]) {
			var clazz = matrixCard.siftMap[key].clazz;
			if (clazz && $(selector + " .tooltip-header:contains('SIFT')").length > 0) {
				$(selector + " .tooltip-header:contains('SIFT')").next().prepend("<svg class=\"sift-badge\" style=\"float:left\"  height=\"12\" width=\"13\">");
				var selection = d3.select(selector + ' .sift-badge').data([{width:11, height:11, transform: 'translate(0,1)', clazz: clazz }]);					
				matrixCard.showSiftSymbol(selection);				
			}			
		}

	}

	for (key in variant.vepPolyPhen) {
		if (matrixCard.polyphenMap[key]) {
			var clazz = matrixCard.polyphenMap[key].clazz;
			if (clazz && $(selector + " .tooltip-header:contains('PolyPhen')").length > 0) {
				$(selector + " .tooltip-header:contains('PolyPhen')").next().prepend("<svg class=\"polyphen-badge\" style=\"float:left\"   height=\"12\" width=\"12\">");
				var selection = d3.select(selector + ' .polyphen-badge').data([{width:10, height:10, transform: 'translate(0,2)', clazz: clazz }]);					
				matrixCard.showPolyPhenSymbol(selection);				
			}
		}
	}



	if (variant.inheritance && variant.inheritance != '') {
		var clazz = matrixCard.inheritanceMap[variant.inheritance].clazz;
		var symbolFunction = matrixCard.inheritanceMap[variant.inheritance].symbolFunction;
		if ($(selector + " .tooltip-title:contains('inheritance')").length > 0) {
			$(selector + " .tooltip-title:contains('inheritance')").prepend("<svg class=\"inheritance-badge\"  height=\"20\" width=\"20\">");
			var options = {width:22, height:22, transform: 'translate(0,4)'};
			var selection = d3.select(selector + ' .inheritance-badge').data([{clazz: clazz}]);
			symbolFunction(selection, options);					
		}
	}	

	if (matrixCard.isNumeric(variant.afExAC)) {
		var rawValue = variant.afExAC;
		var afClazz = null;
		var afSymbolFunction = null;
		var lowestValue = 999;
		matrixCard.afExacMap.forEach( function(rangeEntry) {
			if (+rawValue > rangeEntry.min && +rawValue <= rangeEntry.max) {
				if (rangeEntry.value < lowestValue) {
					lowestValue = rangeEntry.value;
					afClazz = rangeEntry.clazz;
					afSymbolFunction = rangeEntry.symbolFunction;					
				}
			}
		});
		if (afClazz && $(selector + " .tooltip-header:contains('Allele Freq ExAC')").length > 0) {
			$(selector + " .tooltip-header:contains('Allele Freq ExAC')").next().prepend("<svg class=\"afexac-badge\" style=\"float:left\" height=\"14\" width=\"15\">");
			var selection = d3.select(selector + ' .afexac-badge').data([{clazz: afClazz}]);
			afSymbolFunction(selection, {transform: 'translate(2,0)'});		
		}		
	}
	
	if (matrixCard.isNumeric(variant.af1000G)) {
		var rawValue = variant.af1000G;
		var afClazz = null;
		var afSymbolFunction = null;
		var lowestValue = 999;
		matrixCard.afExacMap.forEach( function(rangeEntry) {
			if (+rawValue > rangeEntry.min && +rawValue <= rangeEntry.max) {
				if (rangeEntry.value < lowestValue) {
					lowestValue = rangeEntry.value;
					afClazz = rangeEntry.clazz;
					afSymbolFunction = rangeEntry.symbolFunction;
				}
			}
		});
		if (afClazz && $(selector + " .tooltip-header:contains('Allele Freq 1000G')").length > 0) {
			$(selector + " .tooltip-header:contains('Allele Freq 1000G')").next().prepend("<svg class=\"af1000g-badge\" style=\"float:left\" height=\"14\" width=\"15\">");
			var selection = d3.select(selector + ' .af1000g-badge').data([{clazz: afClazz}]);
			afSymbolFunction(selection, {transform: 'translate(2,0)'});		
		}		
	}	
}

ExamineCard.prototype.fillAndPositionTooltip = function(tooltip, variant, lock, screenX, screenY, variantCard, html) {
	var me = this;
	tooltip.style("z-index", 20);
	tooltip.transition()        
	 .duration(1000)      
	 .style("opacity", .9)	
	 .style("pointer-events", "all");

	if (isLevelEdu || isLevelBasic) {
		tooltip.classed("level-edu", "true");
	} 

	tooltip.classed("tooltip-wide", lock);
	
	if (html == null) {
		if (lock) {
			html = window.getProbandVariantCard().variantDetailHTML(variant, null, 'tooltip-wide');
		} else {	
			html = window.getProbandVariantCard().variantTooltipHTML(variant, "Click on column to lock tooltip")
		}		
	}
	tooltip.html(html);
	me.injectVariantGlyphs(tooltip, variant, lock ? '.tooltip-wide' : '.tooltip');

	
	if (variantCard == null) {
		variantCard = window.getProbandVariantCard();
	}
	var selection = tooltip.select("#coverage-svg");
	variantCard.createAlleleCountSVGTrio(selection, variant, lock ? 150 : null);


	var widthSimpleTooltip = 220;
	if ($(tooltip[0]).find('.col-sm-8').length > 0) {
		widthSimpleTooltip = 500;
	}

 	var w = isLevelEdu  || isLevelBasic ? widthSimpleTooltip : (lock ? 650 : 360);
	var h = d3.round(tooltip[0][0].offsetHeight);

	var x = screenX;
	var y = screenY -  +$('body #container').css('top').split("px")[0] + 10;
	if (y - h < 0) {
		y = h + 5;
	}

	x = sidebarAdjustX(x);


	if (isLevelEduTour && !$('#slider-left').hasClass('hide')) {
		y -= $('#nav-edu-tour').outerHeight();
	}

	if (x-33 > 0 && (x-33+w) < $('#matrix-panel').outerWidth()) {
		tooltip.classed("arrow-down-left", true);
		tooltip.classed("arrow-down-right", false);
		tooltip.classed("arrow-down-center", false);
		tooltip.style("width", w + "px")
		       .style("left", (x-33) + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h) + "px");   

	} else if (x - w > 0 ) {
		tooltip.classed("arrow-down-right", true);
		tooltip.classed("arrow-down-left", false);
		tooltip.classed("arrow-down-center", false);
		tooltip.style("width", w + "px")
		       .style("left", (x - w + 2) + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h) + "px");   
	}	else {
		tooltip.classed("arrow-down-right", false);
		tooltip.classed("arrow-down-left", false);
		tooltip.classed("arrow-down-center", true);
		tooltip.style("width", w + "px")
		       .style("left", (x - w/2) + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h) + "px");   
	}		

}