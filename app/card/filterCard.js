function FilterCard() {
	this.clickedAnnotIds = new Object();
	this.annotsToInclude = new Object();
	this.afMin = null;
	this.afMax = null;
	this.coverageMin = 10;


}



FilterCard.prototype.init = function() {
	var me = this;

	// Init panel based on handlebards template
	$('#filter-panel').html(filterCardTemplate());

	var filterCardSelector = $('#filter-track');
	filterCardSelector.find('#expand-button').on('click', function() {
		filterCardSelector.find('.fullview').removeClass("hide");
		filterCardSelector.css('min-width', "665px");
	});
	filterCardSelector.find('#minimize-button').on('click', function() {
		filterCardSelector.find('.fullview').addClass("hide");
		filterCardSelector.css('min-width', "185px");
	});



	// listen for enter key on af amount input range
	$('#af-amount-start').on('keydown', function() {
		if(event.keyCode == 13) {
			// We are filtering on range, so clear out the af level filters
			me.resetAfFilters("af1000glevel");
			me.resetAfFilters("afexaclevel");

			window.filterVariants();
	    }
	});
	$('#af-amount-end').on('keydown', function() {
		if(event.keyCode == 13) {
			// We are filtering on range, so clear out the af level filters
			me.resetAfFilters("af1000glevel");
			me.resetAfFilters("afexaclevel");


			window.filterVariants();
	    }
	});
	// listen for go button on af range
	$('#af-go-button').on('click', function() {
		// We are filtering on range, so clear out the af level filters
		me.resetAfFilters("af1000glevel");
		me.resetAfFilters("afexaclevel");

		window.filterVariants();
	});
	// listen for enter key on min coverage
	$('#coverage-min').on('keydown', function() {
		if(event.keyCode == 13) {
			window.filterVariants();
	    }
	});
	// listen for go button on coverage
	$('#coverage-go-button').on('click', function() {
		window.filterVariants();
	});



	d3.selectAll(".type, .impact, .effectCategory, .zygosity, .afexaclevel, .af1000glevel, .inheritance, .clinvar")
	  .on("mouseover", function(d) {  	  	
		var id = d3.select(this).attr("id");

		d3.selectAll(".variant")
		   .style("opacity", .1);

	    d3.selectAll(".variant")
	      .filter( function(d,i) {
	      	var theClasses = d3.select(this).attr("class");
	    	if (theClasses.indexOf(id) >= 0) {
	    		return true;
	    	} else {
	    		return false;
	    	}
	      })
	      .style("opacity", 1);
	  })
	  .on("mouseout", function(d) {
	  	d3.selectAll(".variant")
		   .style("opacity", 1);
	  })
	  .on("click", function(d) {
	  	var on = null;
	  	if (d3.select(this).attr("class").indexOf("current") >= 0) {
	  		on = false;
	  	} else {
	  		on = true;
	  	}
	  	var schemeClass = d3.select(this).attr("class");
	  	// strip out extraneous 'no color' and 'current' class
	  	// so that we are left with the attribute name of the
	  	// annotation we will be filtering on.
	  	if (schemeClass.indexOf('nocolor') >= 0) {
	  		var tokens = schemeClass.split(' ');
	  		tokens.forEach(function(clazz) {
	  			if (clazz != 'nocolor') {
	  				schemeClass = clazz;
	  			}
	  		})
	  	}
	  	if (schemeClass.indexOf('current') >= 0) {
	  		var tokens = schemeClass.split(' ');
	  		tokens.forEach(function(clazz) {
	  			if (clazz != 'current') {
	  				schemeClass = clazz;
	  			}
	  		})
	  	}

	  	// If af level clicked on, reset af range filter
	  	if (d3.select(this).attr("class").indexOf("af1000glevel") || 
	  		d3.select(this).attr("class").indexOf("afexaclevel")) {
	  		if (on) {
				me.resetAfRange();
	  		}
	  	}


	  	// Remove from or add to list of clicked ids
	  	me.clickedAnnotIds[d3.select(this).attr("id")] = on;
	  	me.annotsToInclude[d3.select(this).attr("id")] = {'key':   schemeClass , 
	  													  'value': d3.select(this).attr("id"),  
	  													  'state': on};

	  	d3.select(this).classed("current", on);
	  	window.filterVariants();
	  });

	  d3.selectAll('#impact-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", true);
	    	d3.select('#effect-scheme' ).classed("current", false);

	    	d3.selectAll(".impact").classed("nocolor", false);
	    	d3.selectAll(".effectCategory").classed("nocolor", true);

			window.variantCards.forEach(function(variantCard) {
				variantCard.variantClass(me.classifyByImpact);
		    	if (variantCard.getCardIndex() == 0) {
		    		window.filterVariants();
				}

			});


	    });
	  d3.selectAll('#effect-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme').classed("current", true);


	    	d3.selectAll(".impact").classed("nocolor", true);
	    	d3.selectAll(".effectCategory").classed("nocolor", false);

			window.variantCards.forEach(function(variantCard) {
		    	variantCard.variantClass(me.classifyByEffect);
		    	if (variantCard.getCardIndex() == 0) {
		    		window.filterVariants();
				}
			});


	    });
	   d3.selectAll('#afexac-scheme')
	    .on("click", function(d) {
	    	d3.select('#afexac-scheme' ).classed("current", true);
	    	d3.select('#af1000g-scheme' ).classed("current", false);

	    	d3.selectAll(".afexaclevel").classed("nocolor", false);
	    	d3.selectAll(".af1000glevel").classed("nocolor", true);

	    	// De-select an af1000g filters
	    	me.resetAfFilters("af1000glevel");
	    	me.resetAfRange();
	   
	    	window.filterVariants();

	    });
	   d3.selectAll('#af1000g-scheme')
	    .on("click", function(d) {
	    	d3.select('#afexac-scheme' ).classed("current", false);
	    	d3.select('#af1000g-scheme' ).classed("current", true);

	    	d3.selectAll(".afexaclevel").classed("nocolor", true);
	    	d3.selectAll(".af1000glevel").classed("nocolor", false);

	    	me.resetAfFilters("afexaclevel");
	    	me.resetAfRange();

	    	window.filterVariants();
	    });
	  
}


FilterCard.prototype.clearFilters = function() {
	this.clickedAnnotIds = [];
	this.annotsToInclude = [];
	d3.selectAll('#filter-track .impact').classed('current', false);
	d3.selectAll('#filter-track .effect').classed('current', false);
	d3.selectAll('#filter-track .type').classed('current', false);
	d3.selectAll('#filter-track .zygosity').classed('current', false);
	$('af-amount-start').val(0);
	$('af-amount-end').val(100);
	$('coverage-min').val('');
}

FilterCard.prototype.resetAfRange = function() {
	$('#af-amount-start').val("0");
	$('#af-amount-end').val("100");	

	$("#af1000grange-flag").addClass("hide");
	$("#afexacrange-flag").addClass("hide");


}

FilterCard.prototype.resetAfFilters = function(scheme) {
	var me = this;

	// De-select af level filters
	d3.selectAll("." + scheme).classed("current", false);

	d3.selectAll("." + scheme).each(function(d,i) {
		var id = d3.select(this).attr("id");
		me.clickedAnnotIds[id] = false;
  		me.annotsToInclude[id] = {'key':   scheme, 
									'value': id,  
									'state': false};

	});
}

FilterCard.prototype.disableFilters = function() {
	d3.selectAll(".impact").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".type").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".zygosity").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".effectCategory").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".afexaclevel").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".af1000glevel").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".inheritance").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".clinvar").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});

	$("#af-range-filter").addClass("hide");
	$("#coverage-filter").addClass("hide");
}

FilterCard.prototype.enableClinvarFilters = function(theVcfData) {
	
	var clinvarVariantMap = {};
	theVcfData.features.forEach( function(variant) {
		if (variant.clinvar != null && variant.clinvar != '' && variant.clinvar != 'none') {
			clinvarVariantMap[variant.clinvar] = 'Y';
		}
	});
	d3.selectAll(".clinvar").each( function(d,i) {
		var clinvar = d3.select(this).attr("id");
		var clinvarPresent = clinvarVariantMap[clinvar];
		d3.select(this).classed("inactive", clinvarPresent == null);
	});

}

FilterCard.prototype.enableInheritanceFilters = function(theVcfData) {
	var inheritanceVariantMap = {};
	theVcfData.features.forEach( function(variant) {
		if (variant.inheritance != null && variant.inheritance != '' && variant.inheritance != 'none') {
			inheritanceVariantMap[variant.inheritance] = 'Y';
		}
	});
	d3.selectAll(".inheritance").each( function(d,i) {
		var inheritance = d3.select(this).attr("id");
		var inheritancePresent = inheritanceVariantMap[inheritance];
		d3.select(this).classed("inactive", inheritancePresent == null);
	});
}

FilterCard.prototype.enableCoverageFilters = function() {
	$("#coverage-filter").removeClass("hide");
}



FilterCard.prototype.enableVariantFilters = function(fullRefresh) {

	d3.selectAll(".impact").each( function(d,i) {
		var impact = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + impact)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".type").each( function(d,i) {
		var type = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + type)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".zygosity").each( function(d,i) {
		var zygosity = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + zygosity)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".effectCategory").each( function(d,i) {
		var effect = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + effect)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".afexaclevel").each( function(d,i) {
		var afexaclevel = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + afexaclevel + ',' + '#fb-variants .variant.' + afexaclevel)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".af1000glevel").each( function(d,i) {
		var af1000glevel = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + af1000glevel)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	$("#af-range-filter").removeClass("hide");



	if (fullRefresh) {
		// First, move all elements out of the 'more' section
		$('#effect-filter-box #more-effect svg').each(function() {
	    	$(this).insertBefore($('#effect-filter-box #more-effect-link'));
	    });
	    // Now move only inactive elements into the 'more section'
	    $('#effect-filter-box .inactive').each(function() {
	    	$(this).prependTo($('#effect-filter-box #more-effect'));
	    });
	    // If we have more that 6 active elements, keep the
	    // first 6 where they are and move the remaining to the 
	    // 'more' section.  If we 6 or less active elements,
	    // just hide the 'more' link.
	    var allCount = d3.selectAll("#effect-filter-box .effectCategory")[0].length;
	    var inactiveCount = d3.selectAll("#effect-filter-box .effectCategory.inactive")[0].length;
	    var activeCount = allCount - inactiveCount;
	    if (activeCount >= 4) {
	    	$('#effect-filter-box #more-effect-link').removeClass('hide');
	    	// Keep six active elements where they are.  The remainder should go in the 
	    	// 'more' section
	    	var activeElements = $('#effect-filter-box > .effectCategory');
	    	for (var i = 4; i < activeCount; i++) {
	    		var activeElement = activeElements[i];
	    		$('#effect-filter-box #more-effect').append($(activeElement));
	    	}

	    } else {
	    	$('#effect-filter-box #more-effect-link').addClass('hide');

	    }
	}
}

FilterCard.prototype.classifyByImpact = function(d) {
	var impacts = "";
	var colorimpacts = "";
	var effects = "";
	
	for (key in d.impact) {
	  impacts += " " + key;
	  colorimpacts += " " + 'impact_'+key;
	}
	for (key in d.effectCategory) {
	  effects += " " + key;
	}
	
	return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + d.inheritance.toLowerCase() + ' ' + d.afexaclevel + ' ' + d.af1000glevel + ' ' + d.clinvar + ' ' + impacts + effects + ' ' + d.consensus + ' ' + colorimpacts; 
}

FilterCard.prototype.classifyByEffect = function(d) { 
	var effects = "";
	var coloreffects = "";
	var impacts = "";
	
    for (key in d.effectCategory) {
      effects += " " + key;
      coloreffects += " " + 'effect_'+key;
    }
    for (key in d.impact) {
      impacts += " " + key;
    }
    
    return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + + d.inheritance.toLowerCase() + ' ' + d.afexaclevel+ ' ' + d.af1000glevel + ' ' + d.clinvar + ' ' + effects + impacts + ' ' + d.consensus + ' ' + coloreffects; 
}





