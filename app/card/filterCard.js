function FilterCard() {
	this.clickedAnnotIds = new Object();
	this.annotsToInclude = new Object();
	this.afMin = null;
	this.afMax = null;
	this.coverageMin = 10;
	this.snpEffEffects = new Object();
	this.vepConsequences = new Object();
	this.annotationScheme = "snpEff";
	this.pathogenicityScheme = "clinvar";
	this.afScheme = "exac";

}


FilterCard.prototype.onSelectAnnotationScheme = function() {
	this.annotationScheme = $( "#select-annotation-scheme option:selected" ).text();
	$('#effect-scheme .name').text(this.annotationScheme ==  'snpEff' ? 'Effect' : 'Consequence');
	window.matrixCard.setRowLabel("Impact", "Impact - " + this.annotationScheme );
	window.loadTracksForGene();

}

FilterCard.prototype.getAnnotationScheme = function() {
	return this.annotationScheme;
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
	d3.selectAll("#filter-track .afexaclevel").classed("hide", this.afScheme != "exac");
	d3.selectAll("#filter-track .af1000glevel").classed("hide", this.afScheme != "1000 genomes");
	d3.selectAll("#filter-track .afexaclevel-panel").classed("hide", this.afScheme != "exac");
	d3.selectAll("#filter-track .af1000glevel-panel").classed("hide", this.afScheme != "1000 genomes");
}

FilterCard.prototype.init = function() {
	var me = this;

	// Init panel based on handlebards template
	$('#slider-left').html(filterCardTemplate());

	var filterCardSelector = $('#filter-track');
	filterCardSelector.find('#expand-button').on('click', function() {
		filterCardSelector.find('.fullview').removeClass("hide");
		//filterCardSelector.css('min-width', "665px");
	});
	filterCardSelector.find('#minimize-button').on('click', function() {
		filterCardSelector.find('.fullview').addClass("hide");
		//filterCardSelector.css('min-width', "185px");
	});


	$('#select-annotation-scheme').chosen({width: "65px;font-size:10px;", disable_search_threshold: 10});
	$('#select-pathogenicity-scheme').chosen({width: "110px;font-size:10px;", disable_search_threshold: 10});
	$('#select-af-scheme').chosen({width: "110px;font-size:10px;", disable_search_threshold: 10});


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

	    this.initFilterListeners();
	  
}

FilterCard.prototype.initFilterListeners = function() {
	var me = this;
	d3.selectAll(".type, .impact, .effect, .sift, .polyphen, .regulatory, .zygosity, .afexaclevel, .af1000glevel, .inheritance, .clinvar, .uasibs")
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
	var me = this;

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
	d3.selectAll(".sift").each( function(d,i) {
		var sift = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + sift)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".polyphen").each( function(d,i) {
		var polyphen = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + polyphen)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".regulatory").each( function(d,i) {
		var reg = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + reg)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});

	$('#effect-filter-box .effect').remove();
	var nocolor = $('#effect-filter-box #effect-scheme').hasClass("current") ? "" : "nocolor";
	var values = this.annotationScheme == 'snpEff' ? this.snpEffEffects : this.vepConsequences;
	var field  = this.annotationScheme == 'snpEff' ? 'effect' : 'vepConsequence';
	for (key in values) {
		var count = d3.selectAll('#vcf-variants .variant')
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

			var svgElem = '<svg id="' + key + '" class="effect ' + nocolor + '" width="80" height="12" transform="translate(0,0)">' +
                          '<text class="name" x="9" y="6" style="fill-opacity: 1;font-size: 9px;">' + me.capitalizeFirstLetter(key.split("_gene_variant").join("").split("_variant").join("").split("_").join(" ")) + '</text>' +
        				  '<rect class="filter-symbol  effect_' + key + '" rx="1" ry="1" x="1" width="5" y="0" height="5" style="opacity: 1;"></rect>' +
      					  '</svg>';
      		$('#effect-filter-box').append(svgElem);
		}
	};
	this.initFilterListeners();
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
	
	var effectList = (this.annotationScheme == null || this.annotationScheme == 'snpEff' ? d.effect : d.vepConsequence);
    for (key in effectList) {
      effects += " " + key;
    }
    var impactList =  (this.annotationScheme == null || this.annotationScheme == 'snpEff' ? d.impact : d.vepImpact);
    for (key in impactList) {
      impacts += " " + key;
      colorimpacts += " " + 'impact_'+key;
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
	
	return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + d.inheritance.toLowerCase() + ' ua_' + d.ua + ' '  + sift + ' ' + polyphen + ' ' + regulatory + ' ' + d.afexaclevel + ' ' + d.af1000glevel + ' ' + d.clinvar + ' ' + impacts + ' ' + effects + ' ' + d.consensus + ' ' + colorimpacts; 
}

FilterCard.prototype.classifyByEffect = function(d) { 
	var effects = "";
	var coloreffects = "";
	var impacts = "";
	var sift = "";
	var polyphen = "";
	var regulatory = "";
	
	var effectList = (this.annotationScheme == null || this.annotationScheme == 'snpEff' ? d.effect : d.vepConsequence);
    for (key in effectList) {
      effects += " " + key;
      coloreffects += " " + 'effect_'+key;
    }
    var impactList =  (this.annotationScheme == null || this.annotationScheme == 'snpEff' ? d.impact : d.vepImpact);
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
    
    return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + + d.inheritance.toLowerCase() + ' ua_' + d.ua + ' ' + sift + ' ' + polyphen + ' ' + regulatory + ' ' +  d.afexaclevel+ ' ' + d.af1000glevel + ' ' + d.clinvar + ' ' + effects + ' ' + impacts + ' ' + d.consensus + ' ' + coloreffects; 
}


FilterCard.prototype.classifyByZygosity = function(d) { 
	var effects = "";
	var impacts = "";
	var sift = "";
	var polyphen = "";
	var regulatory = "";
	var colorzygs = "";
	
	var effectList =  (this.annotationScheme == null || this.annotationScheme == 'snpEff' ? d.effect : d.vepEffect);
	for (key in effectList) {
      effects += " " + key;
      effects += " " + key;
    }
    var impactList =  (this.annotationScheme == null || this.annotationScheme == 'snpEff' ? d.impact : d.vepImpact);
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
    
    return  'variant ' + d.type.toLowerCase() + ' ' + 'zyg_'+d.zygosity.toLowerCase() + ' ' + d.inheritance.toLowerCase() + ' ua_' + d.ua + ' ' + sift + ' ' + polyphen + ' ' + regulatory + ' ' +  d.afexaclevel+ ' ' + d.af1000glevel + ' ' + d.clinvar + ' ' + effects + ' ' + impacts + ' ' + d.consensus + ' '; 
}





