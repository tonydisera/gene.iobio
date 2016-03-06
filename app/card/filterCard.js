function FilterCard() {
	this.clickedAnnotIds = new Object();
	this.annotsToInclude = new Object();
	this.snpEffEffects = new Object();
	this.vepConsequences = new Object();
	this.recFilters = new Object();
	this.annotationScheme = "snpEff";
	this.pathogenicityScheme = "clinvar";
	this.afScheme = "exac";

}

FilterCard.prototype.getFilterObject = function() {
	var afMin = $('#af-amount-start').val() != '' ? +$('#af-amount-start').val() / 100 : null;
	var afMax = $('#af-amount-end').val()   != '' ? +$('#af-amount-end').val()   / 100 : null;

	var filterObject = {
		'coverageMin': +$('#coverage-min').val(),
		'afMin': afMin,
		'afMax': afMax,
		'afScheme' : this.afScheme,
		'annotsToInclude': this.annotsToInclude
    };

    return filterObject;
}


FilterCard.prototype.onSelectAnnotationScheme = function() {
	this.annotationScheme = $( "#select-annotation-scheme option:selected" ).text();

	$('#effect-scheme .name').text(this.annotationScheme.toLowerCase() ==  'snpeff' ? 'Effect' : 'Consequence');
	this.displayEffectFilters();
	window.matrixCard.setRowLabel("Impact", "Impact - " + this.annotationScheme );
	window.matrixCard.setRowAttribute("Impact", this.annotationScheme.toLowerCase() == 'snpeff' ? 'impact' : 'vepImpact' );
	window.loadTracksForGene();

}

FilterCard.prototype.getAnnotationScheme = function() {
	return this.annotationScheme;
}

FilterCard.prototype.setAnnotationScheme = function(scheme) {
	this.annotationScheme = scheme;
    $('#select-annotation-scheme').val(scheme);	
	$('#select-annotation-scheme').trigger("chosen:updated");	

	$('#effect-scheme .name').text(this.annotationScheme.toLowerCase() ==  'snpeff' ? 'Effect' : 'Consequence');
	this.displayEffectFilters();
	window.matrixCard.setRowLabel("Impact", "Impact - " + this.annotationScheme );
	window.matrixCard.setRowAttribute("Impact", this.annotationScheme.toLowerCase() == 'snpeff' ? 'impact' : 'vepImpact' );
}



FilterCard.prototype.onSelectPathogenicityScheme = function() {
	this.pathogenicityScheme = $( "#select-pathogenicity-scheme option:selected" ).text().toLowerCase();
	
	var filterCardSelector = $('#filter-track');
	d3.selectAll("#filter-track .clinvar").classed("hide", this.pathogenicityScheme != "clinvar");
	d3.selectAll("#filter-track .sift").classed("hide", this.pathogenicityScheme != "sift");
	d3.selectAll("#filter-track .polyphen").classed("hide", this.pathogenicityScheme != "polyphen");
}

FilterCard.prototype.onSelectAFScheme = function() {
	this.afScheme = $( "#select-af-scheme option:selected" ).text().toLowerCase();
	
	var filterCardSelector = $('#filter-track');
	d3.selectAll("#filter-track .afexaclevels").classed("hide", this.afScheme != "exac");
	d3.selectAll("#filter-track .af1000glevels").classed("hide", this.afScheme != "1000 genomes");
	d3.selectAll("#filter-track .afexaclevel-panel").classed("hide", this.afScheme != "exac");
	d3.selectAll("#filter-track .af1000glevel-panel").classed("hide", this.afScheme != "1000 genomes");
}

FilterCard.prototype.init = function() {
	var me = this;


	var filterCardSelector = $('#filter-track');
	filterCardSelector.find('#expand-button').on('click', function() {
		filterCardSelector.find('.fullview').removeClass("hide");
		//filterCardSelector.css('min-width', "665px");
	});
	filterCardSelector.find('#minimize-button').on('click', function() {
		filterCardSelector.find('.fullview').addClass("hide");
		//filterCardSelector.css('min-width', "185px");
	});


	$('#select-annotation-scheme').chosen({width: "110px;font-size:10px;background-color:white;margin-bottom:2px;", disable_search_threshold: 10});
	$('#select-pathogenicity-scheme').chosen({width: "110px;font-size:10px;background-color:white;margin-bottom:2px;", disable_search_threshold: 10});
	$('#select-af-scheme').chosen({width: "115px;font-size:10px;background-color:white;margin-bottom:2px;", disable_search_threshold: 10});


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




	  d3.selectAll('#impact-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", true);
	    	d3.select('#effect-scheme' ).classed("current", false);
	    	d3.select('#zygosity-scheme').classed("current", false);

	    	d3.selectAll(".impact").classed("nocolor", false);
	    	d3.selectAll(".effect").classed("nocolor", true);
	    	d3.selectAll(".vepConsequence").classed("nocolor", true);
	    	d3.selectAll(".zygosity").classed("nocolor", true);

			window.variantCards.forEach(function(variantCard) {
				variantCard.variantClass(me.classifyByImpact);
			});
		    window.filterVariants();


	    });
	    d3.selectAll('#effect-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme').classed("current", true);
	    	d3.select('#zygosity-scheme').classed("current", false);


	    	d3.selectAll(".impact").classed("nocolor", true);
	    	d3.selectAll(".effect").classed("nocolor", false);
	    	d3.selectAll(".vepConsequence").classed("nocolor", false);
	    	d3.selectAll(".zygosity").classed("nocolor", true);

			window.variantCards.forEach(function(variantCard) {
		    	variantCard.variantClass(me.classifyByEffect);		    	
		  	});
			window.filterVariants();
		

	    });
		d3.selectAll('#zygosity-scheme')
	      .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme').classed("current", false);
	    	d3.select('#zygosity-scheme').classed("current", true);


	    	d3.selectAll(".impact").classed("nocolor", true);
	    	d3.selectAll(".effect").classed("nocolor", true);
	    	d3.selectAll(".vepConsequence").classed("nocolor", true);
	    	d3.selectAll(".zygosity").classed("nocolor", false);

			window.variantCards.forEach(function(variantCard) {
		    	variantCard.variantClass(me.classifyByZygosity);
			});
		    window.filterVariants();


	    });	    
	   d3.selectAll('#afexac-scheme')
	    .on("click", function(d) {
	    	d3.select('#afexac-scheme' ).classed("current", true);
	    	d3.select('#af1000g-scheme' ).classed("current", false);

	    	d3.selectAll(".afexaclevels").classed("nocolor", false);
	    	d3.selectAll(".af1000glevels").classed("nocolor", true);

	    	// De-select an af1000g filters
	    	me.resetAfFilters("af1000glevel");
	    	me.resetAfRange();
	   
	    	window.filterVariants();

	    });
	   d3.selectAll('#af1000g-scheme')
	    .on("click", function(d) {
	    	d3.select('#afexac-scheme' ).classed("current", false);
	    	d3.select('#af1000g-scheme' ).classed("current", true);

	    	d3.selectAll(".afexaclevels").classed("nocolor", true);
	    	d3.selectAll(".af1000glevels").classed("nocolor", false);

	    	me.resetAfFilters("afexaclevel");
	    	me.resetAfRange();

	    	window.filterVariants();
	    });

	    this.initFilterListeners();
	  
}

FilterCard.prototype.initFilterListeners = function() {
	var me = this;
	d3.selectAll(".type, .impact, .effect, .vepConsequence, .sift, .polyphen, .regulatory, .zygosity, .afexaclevels, .af1000glevels, .inheritance, .clinvar, .uasibs, .recfilter")
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

}



FilterCard.prototype.clearFilters = function() {
	this.clickedAnnotIds = [];
	this.annotsToInclude = [];
	d3.selectAll('#filter-track .impact').classed('current', false);
	d3.selectAll('#filter-track .effect').classed('current', false);
	d3.selectAll('#filter-track .vepConsequence').classed('current', false);
	d3.selectAll('#filter-track .type').classed('current', false);
	d3.selectAll('#filter-track .zygosity').classed('current', false);
	d3.selectAll('#filter-track .sift').classed('current', false);
	d3.selectAll('#filter-track .polyphen').classed('current', false);
	d3.selectAll('#filter-track .regulatory').classed('current', false);
	d3.selectAll('#filter-track .uasibs').classed('current', false);
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
	d3.selectAll(".effect").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".sift").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".polyphen").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".regulatory").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".afexaclevels").each( function(d,i) {		
		d3.select(this).classed("inactive", true);
	});
	d3.selectAll(".af1000glevels").each( function(d,i) {		
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
	if (theVcfData == null || theVcfData.features == null) {
		return;
	}
	
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
	var me = this;

	d3.selectAll(".impact").each( function(d,i) {
		var impact = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-track .variant.' + impact)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".type").each( function(d,i) {
		var type = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-track .variant.' + type)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".zygosity").each( function(d,i) {
		var zygosity = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-track .variant.' + zygosity)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".sift").each( function(d,i) {
		var sift = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-track .variant.' + sift)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".polyphen").each( function(d,i) {
		var polyphen = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-track .variant.' + polyphen)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".regulatory").each( function(d,i) {
		var reg = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-track .variant.' + reg)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});

	this.displayEffectFilters();
	this.displayRecFilters();
	this.initFilterListeners();
	d3.selectAll(".afexaclevels").each( function(d,i) {
		var afexaclevel = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-track .variant.' + afexaclevel)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".af1000glevels").each( function(d,i) {
		var af1000glevel = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-track .variant.' + af1000glevel)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	$("#af-range-filter").removeClass("hide");

}

FilterCard.prototype.displayEffectFilters = function() {
	var me = this;
	$('#effect-filter-box .effect').remove();
	$('#effect-filter-box .vepConsequence').remove();
	var nocolor = $('#effect-filter-box #effect-scheme').hasClass("current") ? "" : "nocolor";
	var values = this.annotationScheme.toLowerCase() == 'snpeff' ? this.snpEffEffects : this.vepConsequences;
	var field  = this.annotationScheme.toLowerCase() == 'snpeff' ? 'effect' : 'vepConsequence';

	var effectKeys = Object.keys(values).sort();

	effectKeys.forEach( function(key) {
		var count = d3.selectAll('#vcf-track .variant')
		              .filter( function(d,i) {
		              	var match = false; 
		              	for (ef in d[field]) {
		              		if (ef == key) {
		              			match = true;
		              		}
		              	}
		              	return match;
		              })[0].length;

		if (count > 0) {

			var svgElem = '<svg id="' + key + '" class="' + field + ' ' + nocolor + '" width="100" height="15" transform="translate(0,0)">' +
                          '<text class="name" x="9" y="6" style="fill-opacity: 1;font-size: 9px;">' + me.capitalizeFirstLetter(key.split("_gene_variant").join("").split("_variant").join("").split("_").join(" ")) + '</text>' +
        				  '<rect class="filter-symbol  effect_' + key + '" rx="1" ry="1" x="1" width="5" y="0" height="5" style="opacity: 1;"></rect>' +
      					  '</svg>';
      		$('#effect-filter-box').append(svgElem);
		}
	});	
}

FilterCard.prototype.displayRecFilters = function() {
	var me = this;
	$('#rec-filter-box .recfilter').remove();

	var recFilterCount = 0;
	var recFilterKeys = Object.keys(this.recFilters).sort();
	
	recFilterKeys.forEach(function(key) {
		var count = d3.selectAll('#vcf-track .variant')
		              .filter( function(d,i) {
		              	var match = false; 
		              	if (d.recfilter == key) {
		              		match = true;
		              	}
		              	return match;
		              })[0].length;

		if (count > 0) {
			recFilterCount++;
			//var label = key == "." ? "(NOT PASSED)" : key;
			label = key;
			var svgElem = '<svg id="' + key + '" class="recfilter" width="120" height="12" transform="translate(0,0)">' +
                          '<text class="name" x="9" y="6" style="fill-opacity: 1;font-size: 9px;">' + me.capitalizeFirstLetter(label) + '</text>' +
      					  '</svg>';
      		$('#rec-filter-box').append(svgElem);
      	}
	});
	if (recFilterCount > 0) {
		$('#rec-filter-panel').removeClass("hide");
	} else {
		$('#rec-filter-panel').addClass("hide");		
	}	
}

FilterCard.prototype.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

FilterCard.prototype.classifyByImpact = function(d) {
	var impacts = "";
	var colorimpacts = "";
	var effects = "";
	var sift = "";
	var polyphen = "";
	var regulatory = "";

	// this is not FilterCard because we are calling class function within d3 
	var annotationScheme = filterCard.annotationScheme;

	var effectList = (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.effect : d.vepConsequence);	
	for (key in effectList) {
      if (annotationScheme.toLowerCase() == 'vep' && key.indexOf("&") > 0) {
      	var tokens = key.split("&");
      	tokens.forEach( function(token) {
	      effects += " " + token;
    		
      	});
      } else {
	      effects += " " + key;	      
      }
    }
    var impactList =  (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.impact : d.vepImpact);
    for (key in impactList) {
      impacts += " " + key;
      colorimpacts += " " + 'impact_'+key;
    }
    if (colorimpacts == "") {
    	colorimpacts = "impact_none";
    }
    for (key in d.sift) {
    	sift += " " + key;		
    }
    for (key in d.polyphen) {
    	polyphen += " " + key;		
    }
    for (key in d.regulatory) {
    	regulatory += " " + key;		
    }

    var af1000g = Object.keys(d.af1000glevels).join(" ");
    var afexac = Object.keys(d.afexaclevels).join(" ");
	
	return  'variant ' + d.type.toLowerCase()  + ' ' + d.zygosity.toLowerCase() + ' ' + d.inheritance.toLowerCase() + ' ua_' + d.ua + ' '  + sift + ' ' + polyphen + ' ' + regulatory + 'recfilter_' + d.recfilter + ' ' + afexac + ' ' + af1000g + ' ' + d.clinvar + ' ' + impacts + ' ' + effects + ' ' + d.consensus + ' ' + colorimpacts; 
}

FilterCard.prototype.classifyByEffect = function(d) { 
	var effects = "";
	var coloreffects = "";
	var impacts = "";
	var sift = "";
	var polyphen = "";
	var regulatory = "";

	// this is not FilterCard because we are calling class function within d3 
	var annotationScheme = filterCard.annotationScheme;
	
	
	var effectList = (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.effect : d.vepConsequence);
    for (key in effectList) {
      if (annotationScheme.toLowerCase() == 'vep' && key.indexOf("&") > 0) {
      	var tokens = key.split("&");
      	tokens.forEach( function(token) {
      	  effects += " " + token;
	      coloreffects += " effect_" + token;      		
      	});
      } else {
      	  effects += " " + key;
	      coloreffects += " effect_" + key;
      }
    }
    if (coloreffects == "") {
    	coloreffects = "effect_none";
    }
    var impactList =  (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.impact : d.vepImpact);
    for (key in impactList) {
      impacts += " " + key;
    }
    for (key in d.sift) {
    	sift += " " + key;		
    }
    for (key in d.polyphen) {
    	polyphen += " " + key;		
    }
    for (key in d.regulatory) {
    	regulatory += " " + key;		
    }

    var af1000g = Object.keys(d.af1000glevels).join(" ");
    var afexac = Object.keys(d.afexaclevels).join(" ");

    
    return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + + d.inheritance.toLowerCase() + ' ua_' + d.ua + ' ' + sift + ' ' + polyphen + ' ' + regulatory + ' ' + 'recfilter_' + d.recfilter +  afexac + ' ' + af1000g + ' ' + d.clinvar + ' ' + effects + ' ' + impacts + ' ' + d.consensus + ' ' + coloreffects; 
}


FilterCard.prototype.classifyByZygosity = function(d) { 
	var effects = "";
	var impacts = "";
	var sift = "";
	var polyphen = "";
	var regulatory = "";
	var colorzygs = "";

	// this is not FilterCard because we are calling class function within d3 
	var annotationScheme = filterCard.annotationScheme;
	
	
	var effectList =  (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.effect : d.vepEffect);
	for (key in effectList) {
      if (annotationScheme.toLowerCase() == 'vep' && key.indexOf("&") > 0) {
      	var tokens = key.split("&");
      	tokens.forEach( function(token) {
	      effects += " " + token;	     
      	});
      } else {
	      effects += " " + key;
      }
    }
    var impactList =  (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.impact : d.vepImpact);
    for (key in impactList) {
      impacts += " " + key;
    }
    for (key in d.sift) {
    	sift += " " + key;		
    }
    for (key in d.polyphen) {
    	polyphen += " " + key;		
    }
    for (key in d.regulatory) {
    	regulatory += " " + key;		
    }
    var af1000g = Object.keys(d.af1000glevels).join(" ");
    var afexac = Object.keys(d.afexaclevels).join(" ");

    
    return  'variant ' + d.type.toLowerCase() + ' ' + 'zyg_'+d.zygosity.toLowerCase() + ' ' + d.inheritance.toLowerCase() + ' ua_' + d.ua + ' ' + sift + ' ' + polyphen + ' ' + regulatory + ' ' + 'recfilter_' + d.recfilter +  afexac + ' ' + af1000g + ' ' + d.clinvar + ' ' + effects + ' ' + impacts + ' ' + d.consensus + ' '; 
}





