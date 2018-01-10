function FilterCard() {
  this.clickedAnnotIds = new Object();
  this.annotsToInclude = new Object();

  this.snpEffEffects = new Object();
  this.vepConsequences = new Object();
  this.recFilters = new Object();

  this.annotationScheme = "vep";
  this.pathogenicityScheme = "clinvar";

  this.annotClasses     = ".type, .impact, ." + IMPACT_FIELD_TO_FILTER + ", .effect, .vepConsequence, .sift, .polyphen, .regulatory, .zygosity, .inheritance, .clinvar, .uasibs, .recfilter";
  this.annotClassLabels = "Type, Impact, VEP Impact, Effect, VEP Consequence, SIFT, PolyPhen, Regulatory, Zygosity, Inheritance mode, ClinVar, Unaffected Sibs, VCF Filter Status";

  this.applyLowCoverageFilter = false;

  // standard filters
  this.KNOWN_CAUSATIVE           = "known_causative";
  this.DENOVO                    = "denovo";
  this.RECESSIVE                 = "recessive";
  this.FUNCTIONAL_IMPACT         = "functional_impact";
  this.LOW_COVERAGE              = "low_coverage";

  this.geneCoverageMin           = 10;
  this.geneCoverageMean          = 30;
  this.geneCoverageMedian        = 30;

  this.affectedInfo              = null;

  this.cardSpecificFilters = {
    'known-variants': {
      clinvar_path:    {'key': 'clinvar', 'value': true,  clazz: 'clinvar_path',   display: 'Pathogenic' },
      clinvar_lpath:   {'key': 'clinvar', 'value': true,  clazz: 'clinvar_lpath',  display: 'Likely pathogenic' },
      clinvar_uc:      {'key': 'clinvar', 'value': true,  clazz: 'clinvar_uc',     display: 'Uncertain significance' },
      clinvar_cd:      {'key': 'clinvar', 'value': true,  clazz: 'clinvar_cd',     display: 'Conflicting data'},
      clinvar_unknown: {'key': 'clinvar', 'value': false, clazz: 'clinvar_other',  display: 'Other' },
      clinvar_benign:  {'key': 'clinvar', 'value': false, clazz: 'clinvar_benign', display: 'Benign'},
      clinvar_lbenign: {'key': 'clinvar', 'value': false, clazz: 'clinvar_lbenign',display: 'Likely benign' }
    }
  }
}


FilterCard.prototype.clearDataGeneratedFilters = function() {
  this.snpEffEffects = new Object();
  this.vepConsequences = new Object();
  $('#effect-filter-box .effect').remove();
  $('#effect-filter-box .vepConsequence').remove();


  this.recFilters = new Object();
  $('#rec-filter-box .recfilter').remove();
}

FilterCard.prototype.displayDataGeneratedFilters = function () {
  this.displayRecFilters();
  this.displayEffectFilters();
}

FilterCard.prototype.autoSetFilters = function() {

  this.displayRecFilters();
  this.initFilterListeners();
}

FilterCard.prototype.displayAffectedFilters = function() {
  var me = this;
  $('#present-in-affected').addClass("hide");
  $('#present-in-affected-heading').addClass("hide");
  $('#absent-in-unaffected').addClass("hide");
  $('#absent-in-unaffected-heading').addClass("hide");

    $('#present-in-affected').find(".checkbox").remove();
    $('#absent-in-unaffected').find(".checkbox").remove();

    var affectedInfo = getAffectedInfo();
    affectedInfo.filter(function(info) {
      return info.variantCard.isAffected();
    })
    .forEach(function(info) {
      if (info.variantCard.getRelationship() == 'proband') {
        info.filter = true;
      } else {
        $('#present-in-affected').removeClass("hide");
        $('#present-in-affected-heading').removeClass("hide");

        $('#present-in-affected').append(templateUtil.filterAffectedTemplate());
        var cb = $('#present-in-affected').find('.checkbox').last();
        cb.find('input').after("&nbsp;&nbsp;" + info.label);
        cb.attr("id", info.id)
        cb.click(function() {
          me.getAffectedFilterInfo(true);
          me.clearCurrentStandardFilter();
          window.filterVariants();
        })
      }
    })
    affectedInfo.filter(function(info) {
      return !info.variantCard.isAffected();
    })
    .forEach(function(info) {
      if (info.variantCard.getRelationship() == 'proband') {
        info.filter = false;
      } else {
        $('#absent-in-unaffected').removeClass("hide");
        $('#absent-in-unaffected-heading').removeClass("hide");
        $('#absent-in-unaffected').append(templateUtil.filterAffectedTemplate());
        var cb = $('#absent-in-unaffected').find('.checkbox').last();
        cb.find('input').after("&nbsp;&nbsp;" + info.label);
        cb.attr("id", info.id);
      cb.click(function() {
          me.getAffectedFilterInfo(true);
          me.clearCurrentStandardFilter();
          window.filterVariants();
        })
      }
    })
    me.getAffectedFilterInfo(true);
    $.material.init();
}

FilterCard.prototype.getAffectedFilterInfo = function(forceRefresh=false) {
  var me = this;

  if (this.affectedInfo == null || forceRefresh) {
    this.affectedInfo = getAffectedInfo();
    forceRefresh = true;
  }

  if (forceRefresh) {
    this.affectedInfo.filter(function(info) {
        return info.variantCard.isAffected();
      })
      .forEach(function(info) {
        var cb = $('#present-in-affected').find("#" + info.id + " input");
        info.filter = (cb.is(":checked"));
      });

    this.affectedInfo.filter(function(info) {
        return !info.variantCard.isAffected();
      })
      .forEach(function(info) {
        var cb = $('#absent-in-unaffected').find("#" + info.id + " input");
        info.filter = (cb.is(":checked"));
      });

  }
    return this.affectedInfo;
}


FilterCard.prototype.clearAffectedFilters = function() {
  var me = this;

  if (this.affectedInfo) {
    this.affectedInfo.filter(function(info) {
        return info.variantCard.isAffected() && info.relationship != 'proband';
      })
      .forEach(function(info) {
        var cb = $('#present-in-affected').find("#" + info.id + " input");
        cb.prop('checked', false);
        info.filter = false;
      });

    this.affectedInfo.filter(function(info) {
        return !info.variantCard.isAffected();
      })
      .forEach(function(info) {
        var cb = $('#absent-in-unaffected').find("#" + info.id + " input");
        cb.prop('checked', false);
        info.filter = false;
      });


    this.affectedInfo = getAffectedInfo();
  }

    return this.affectedInfo;
}

/*
 * If a filter has been clicked after a standard filter has been selected,
 * unset the standard filter since the criteria has been changed
 */
FilterCard.prototype.clearCurrentStandardFilter = function() {
  if ($('.standard-filter-btn.current').length > 0) {
    $('.standard-filter-btn.current').parent().find("span.standard-filter-count .variant-count").addClass("hide");
    $('.standard-filter-btn.current').parent().find("span.standard-filter-count .variant-count").text("");
    $('.standard-filter-btn.current').removeClass("current");
  }
}


FilterCard.prototype.applyStandardFilter = function(button, filterName) {
  var me = this;
  filterCard.setStandardFilter(button, filterName);
  filterVariants();
}


FilterCard.prototype.resetStandardFilterCounts = function() {
  $('#standard-filter-panel span.standard-filter-count #loaded-variant-count').text("");
  $('#standard-filter-panel span.standard-filter-count #called-variant-count').text("");
  $('#standard-filter-panel span.standard-filter-count .variant-count').addClass("hide");
  $('#standard-filter-panel span.standard-filter-count #unanalyzed-warning').addClass("hide");
}

FilterCard.prototype.setStandardFilter = function(button, filterName) {
  var me = this;
  me.clearFilters();
  $(button).addClass('current');

  +$('#afhighest-range-filter #af-amount-start').val(0);
  +$('#afhighest-range-filter #af-amount-end').val(5);

  var annots = null;
  if (filterName == me.LOW_COVERAGE) {
    me.applyLowCoverageFilter = true;
  } else if (filterName == me.KNOWN_CAUSATIVE) {
    annots =  {
      clinvar_path:     {key: 'clinvar',       label: "ClinVar",           state: true, value: 'clinvar_path',     valueDisplay: 'pathogenic'},
      clinvar_lpath:    {key: 'clinvar',       label: "ClinVar",           state: true, value: 'clinvar_lpath',    valueDisplay: 'likely pathogenic'}
    }
  } else if (filterName == me.DENOVO) {
    annots =  {
      denovo:           {key: 'inheritance',   label: "Inheritance mode",  state: true, value: 'denovo',           valueDisplay: 'de novo'},
      HIGH:             {key: 'highestImpactVep',label: "VEP impact",      state: true, value: 'HIGH',             valueDisplay: 'high'},
      MODERATE:         {key: 'highestImpactVep',label: "VEP impact",      state: true, value: 'MODERATE',         valueDisplay: 'moderate'},
      clinvar_path:     {key: 'clinvar',         label: "ClinVar",           state: true, not: true, value: 'clinvar_path',     valueDisplay: 'pathogenic'},
      clinvar_lpath:    {key: 'clinvar',         label: "ClinVar",           state: true, not: true, value: 'clinvar_lpath',    valueDisplay: 'likely pathogenic'}
    }
  } else if (filterName == me.RECESSIVE) {
    annots =  {
      recessive:        {key: 'inheritance',   label: "Inheritance mode",  state: true, value: 'recessive',        valueDisplay: 'recessive'},
      HIGH:             {key: 'highestImpactVep',label: "VEP impact",      state: true, value: 'HIGH',             valueDisplay: 'high'},
      MODERATE:         {key: 'highestImpactVep',label: "VEP impact",      state: true, value: 'MODERATE',         valueDisplay: 'moderate'},
      clinvar_path:     {key: 'clinvar',         label: "ClinVar",           state: true, not: true, value: 'clinvar_path',     valueDisplay: 'pathogenic'},
      clinvar_lpath:    {key: 'clinvar',         label: "ClinVar",           state: true, not: true, value: 'clinvar_lpath',    valueDisplay: 'likely pathogenic'}
    }
  } else if (filterName == me.FUNCTIONAL_IMPACT) {
    annots =  {
      denovo:           {key: 'inheritance',     label: "Inheritance mode",  state: true, not: true, value: 'denovo',           valueDisplay: 'de novo'},
      recessive:        {key: 'inheritance',     label: "Inheritance mode",  state: true, not: true, value: 'recessive',        valueDisplay: 'recessive'},
      HIGH:             {key: 'highestImpactVep',label: "VEP impact",        state: true, value: 'HIGH',             valueDisplay: 'high'},
      MODERATE:         {key: 'highestImpactVep',label: "VEP impact",        state: true, value: 'MODERATE',         valueDisplay: 'moderate'},
      clinvar_path:     {key: 'clinvar',         label: "ClinVar",           state: true, not: true, value: 'clinvar_path',     valueDisplay: 'pathogenic'},
      clinvar_lpath:    {key: 'clinvar',         label: "ClinVar",           state: true, not: true, value: 'clinvar_lpath',    valueDisplay: 'likely pathogenic'}
    }
  }


  me.annotsToInclude = annots;
  for (var key in me.annotsToInclude) {
    var annot = me.annotsToInclude[key];
    d3.select('#filter-track #' + key + "." + annot.key).classed("current", true);
    if (annot.not) {
      d3.select('#filter-track #' + key + "." + annot.key).classed("not-equal", true);
    }
  }


}

FilterCard.prototype.setStandardFilterCount = function(field, counts, notAnalyzedCount, clearStandardFilterCounts) {
  var me = this;
  if (this.hasFilters()) {
    if ($('#standard-filter-panel .standard-filter-btn.current').attr("id") == "button-low-coverage" && field == 'called') {
      // we bypass 'called' variant counts for the coverage filter
    } else {
      var filterCountSelector = 'span.standard-filter-count #' + field + '-variant-count';
      // If a standard filter has been applied, update its counts
      if (clearStandardFilterCounts) {
        $('#standard-filter-panel .standard-filter-btn').parent().find(filterCountSelector).text("");
        $('#standard-filter-panel .standard-filter-btn').parent().find(filterCountSelector).addClass('hide');
      }
      if ($('#standard-filter-panel .standard-filter-btn.current').length > 0) {
        $('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).text(counts.pass);
        $('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).attr("title", counts.pass + (counts.pass == 1 ? " gene contains " : " genes contain ") + field + " variants that pass this filter");
        $('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).removeClass('hide');
        if (counts.pass == 0) {
          $('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).addClass("none");
        } else {
          $('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).removeClass("none");
        }

      }
    }
  }


  // Show a "some genes not analyzed" warning symbol next to standard filters.  Make sure
  // to exclude loaded variants from the warning when only alignments were provided
  if (notAnalyzedCount > 0 && (!getProbandVariantCard().model.isAlignmentsOnly() || field == 'called')) {
    var filterCountId = field + '-variant-count';
    $('#standard-filter-panel .variant-count').each( function(i,val) {
      if ($(val).attr('id') == filterCountId) {
        if ($(val).hasClass("hide")) {
          $(val).parent().find('#unanalyzed-' + field + '-warning').addClass("hide");
        } else {
          $(val).parent().find('#unanalyzed-' + field + '-warning').removeClass("hide");
        }
      }
    })
  } else {
    $('#standard-filter-panel .standard-filter-btn.current').parent().find('#unanalyzed-' + field + '-warning').addClass("hide");
  }


}

FilterCard.prototype.getFilterObject = function() {
  var me = this;
  // For mygene2 beginner mode, return a fixed filter of AF < 1% and PASS filter.
  if (isLevelBasic) {
    var annots =  {
      clinvar_path:     {key: 'clinvar',       state: true, value: 'clinvar_path'},
      clinvar_lpath:    {key: 'clinvar',       state: true, value: 'clinvar_lpath'}
    }
    //annots.PASS = {key: 'recfilter', state: true, value: 'PASS'};

    return { afMin: 0, afMax: .01, annotsToInclude: annots };
  }

  var afMin = $('#afhighest-range-filter #af-amount-start').val() != '' ? +$('#afhighest-range-filter #af-amount-start').val() / 100 : null;
  var afMax = $('#afhighest-range-filter #af-amount-end').val()   != '' ? +$('#afhighest-range-filter #af-amount-end').val()   / 100 : null;

  return {
    'coverageMin': +$('#coverage-min').val(),
    'afMin': afMin,
    'afMax': afMax,
    'annotsToInclude': this.annotsToInclude,
    'exonicOnly': $('#exonic-only-cb').is(":checked"),
    'loadedVariants': $('#loaded-variants-cb').is(":checked"),
    'calledVariants': $('#called-variants-cb').is(":checked"),
    'affectedInfo': me.getAffectedFilterInfo(true)
  };
}


FilterCard.prototype.onSelectAnnotationScheme = function() {
  this.annotationScheme = $("#select-annotation-scheme")[0].selectize.getValue();

  $('#effect-scheme .name').text(this.annotationScheme.toLowerCase() ==  'snpeff' ? 'Effect' : 'Consequence');
  this.displayEffectFilters();
  window.matrixCard.setRowLabelById("impact", isLevelEdu ? "Impact" : "Impact (" + this.annotationScheme + ")" );
  window.matrixCard.setRowAttributeById("impact", this.annotationScheme.toLowerCase() == 'snpeff' ? 'impact' : IMPACT_FIELD_TO_COLOR );
  window.loadTracksForGene();

}

FilterCard.prototype.getAnnotationScheme = function() {
  return this.annotationScheme;
}

FilterCard.prototype.setAnnotationScheme = function(scheme) {
  this.annotationScheme = scheme;
    $('#select-annotation-scheme')[0].selectize.setValue(scheme, true);

  $('#effect-scheme .name').text(this.annotationScheme.toLowerCase() ==  'snpeff' ? 'Effect' : 'Consequence');
  d3.select('#filter-card .impact').classed(IMPACT_FIELD_TO_FILTER,this.annotationScheme.toLowerCase() == 'vep');
  d3.select('#filter-card .' + IMPACT_FIELD_TO_FILTER).classed('impact',!this.annotationScheme.toLowerCase() == 'vep');
  this.displayEffectFilters();
  window.matrixCard.setRowLabelById("impact", isLevelEdu ? "Impact" : "Impact (" + this.annotationScheme + ")");
  window.matrixCard.setRowAttributeById("impact", this.annotationScheme.toLowerCase() == 'snpeff' ? 'impact' : IMPACT_FIELD_TO_COLOR );
}





FilterCard.prototype.init = function() {
  var me = this;

  me.annotClassMap = {};
  var annotLabels = me.annotClassLabels.split(", ");
  var idx = 0;
  me.annotClasses.split(", ").forEach(function(classToken) {
    var clazz = classToken.slice(1);
    var clazzLabel = annotLabels[idx];
    me.annotClassMap[clazz] = clazzLabel;
    idx++;
  });


  var filterCardSelector = $('#filter-track');
  filterCardSelector.find('#expand-button').on('click', function() {
    filterCardSelector.find('.fullview').removeClass("hide");
    //filterCardSelector.css('min-width', "665px");
  });
  filterCardSelector.find('#minimize-button').on('click', function() {
    filterCardSelector.find('.fullview').addClass("hide");
    //filterCardSelector.css('min-width', "185px");
  });


  $('#select-annotation-scheme').selectize(
    { create: true }
  );
  $('#select-annotation-scheme')[0].selectize.on('change', function() {
    me.onSelectAnnotationScheme();
  });


  // Default annotation scheme to VEP
  this.setAnnotationScheme("VEP");

  // Se coverage thresholds and listen when thresholds change
  $('#gene-coverage-min').val(this.geneCoverageMin);
  $('#gene-coverage-median').val(this.geneCoverageMedian);
  $('#gene-coverage-mean').val(this.geneCoverageMean);
  $('#gene-coverage-min').on('change', function() {
    me.geneCoverageMin = $('#gene-coverage-min').val();
  })
  $('#gene-coverage-median').on('change', function() {
    me.geneCoverageMedian = $('#gene-coverage-median').val();
  })
  $('#gene-coverage-mean').on('change', function() {
    me.geneCoverageMean = $('#gene-coverage-mean').val();
  })

  // listen for enter key on af amount input range
  $('#af-amount-start').on('keydown', function() {
    if(event.keyCode == 13) {
      window.filterVariants();
      }
  });
  $('#af-amount-end').on('keydown', function() {
    if(event.keyCode == 13) {
      window.filterVariants();
      }
  });
  // listen for go button on af range
  $('#afhighest-range-filter #af-go-button').on('click', function() {
    me.clearCurrentStandardFilter();

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
    me.clearCurrentStandardFilter();

    window.filterVariants();
  });
  // listen to checkbox for filtering exonic only variants
  $('#exonic-only-cb').click(function() {
    me.clearCurrentStandardFilter();
    window.filterVariants();
  });
  // listen to loaded variants checkbox
  $('#loaded-variants-cb').click(function() {
    me.clearCurrentStandardFilter();
    window.filterVariants();
  });
  // listen to called variants checkbox
  $('#called-variants-cb').click(function() {
    me.clearCurrentStandardFilter();
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
        variantCard.setVariantColorClass(me.classifyByImpact);
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
          variantCard.setVariantColorClass(me.classifyByEffect);
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
          variantCard.setVariantColorClass(me.classifyByZygosity);
      });
        window.filterVariants();


      });


      this.initFilterListeners();

}

FilterCard.prototype.initFilterListeners = function(filterSelector, theAnnotClassMap) {
  var me = this;

  filterSelector = filterSelector ? filterSelector : me.annotClasses;
  theAnnotClassMap = theAnnotClassMap ? theAnnotClassMap : me.annotClassMap;

  d3.select('#filter-track').selectAll(filterSelector)
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
      var clazzes = d3.select(this).attr("class");
      var schemeClass = null;
      var schemeLabel = "";
      clazzes.split(" ").forEach(function(classToken) {
        if (theAnnotClassMap[classToken]) {
          schemeClass = classToken;
          schemeLabel = theAnnotClassMap[classToken];
        }
      });



      // Remove from or add to list of clicked ids
      me.clickedAnnotIds[d3.select(this).attr("id")] = on;
      var valueDisplay =  "";
      if (!d3.select(this).select("text").empty()) {
        valueDisplay = d3.select(this).select("text").text();
      } else if (!d3.select(this).empty() > 0 ) {
        valueDisplay = d3.select(this).text();
      } else {
        valueDisplay = d3.select(this).attr("id");
      }

      var theValue = d3.select(this).attr("id");
      if (schemeClass == "recfilter" && d3.select(this).attr("id") == 'unassigned') {
        theValue = ".";
      }
      me.annotsToInclude[d3.select(this).attr("id")] = {'key':   schemeClass ,
                                'label': schemeLabel,
                                'value': theValue,
                                'valueDisplay': valueDisplay,
                                'state': on};

      d3.select(this).classed("current", on);
      if (!on) {
        d3.select(this).classed("not-equal", false);
      }

      me.clearCurrentStandardFilter();

      window.filterVariants();
    });

}

FilterCard.prototype.setExonicOnlyFilter = function(on) {
  if (on == null) {
    on  = true;
  }
  $('#exonic-only-cb').prop('checked', on);
  this.displayFilterSummary();
}




FilterCard.prototype.clearFilters = function() {

  this.clickedAnnotIds = [];
  this.annotsToInclude = {};

  this.applyLowCoverageFilter = false;

  $('#filter-progress').addClass("hide");
  $('#filter-progress .text').text("");
  $('#filter-progress .bar').css("width", "0%");


  d3.selectAll('.standard-filter-btn').classed('current', false);

  d3.selectAll('#filter-track .recfilter').classed('current', false);
  d3.select('#recfilter-flag').classed("hide", true);

  d3.selectAll('#filter-track .highestImpactVep').classed('current', false);
  d3.selectAll('#filter-track .vepImpact').classed('current', false);
  d3.selectAll('#filter-track .vepConsequence').classed('current', false);
  d3.selectAll('#filter-track .impact').classed('current', false);
  d3.selectAll('#filter-track .effect').classed('current', false);
  d3.selectAll('#filter-track .type').classed('current', false);
  d3.selectAll('#filter-track .zygosity').classed('current', false);
  d3.selectAll('#filter-track .sift').classed('current', false);
  d3.selectAll('#filter-track .polyphen').classed('current', false);
  d3.selectAll('#filter-track .clinvar').classed('current', false);
  d3.selectAll('#filter-track .clinvar').classed('not-equal', false);
  d3.selectAll('#filter-track .inheritance').classed('current', false);
  d3.selectAll('#filter-track .inheritance').classed('not-equal', false);
  d3.selectAll('#filter-track .regulatory').classed('current', false);
  d3.selectAll('#filter-track .uasibs').classed('current', false);
  $('#afhighest-range-filter #af-amount-start').val("");
  $('#afhighest-range-filter #af-amount-end').val("");
  $('#coverage-min').val('');
  this.setExonicOnlyFilter(false);

  this.clearAffectedFilters();

}

FilterCard.prototype.resetAfRange = function() {
  $('#af-amount-start').val("");
  $('#af-amount-end').val("");
}


FilterCard.prototype.enableFilters = function() {
  d3.selectAll(".impact").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".highestImpactVep").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".vepImpact").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".type").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".zygosity").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".effect").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".vepConsequence").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".sift").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".polyphen").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".regulatory").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".inheritance").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });
  d3.selectAll(".clinvar").each( function(d,i) {
    d3.select(this).classed("inactive", false);
  });

  $("#af-range-filter").removeClass("hide");
  $("#coverage-filter").removeClass("hide");
}

FilterCard.prototype.disableFilters = function() {
}

FilterCard.prototype.enableClinvarFilters = function(theVcfData) {
}

FilterCard.prototype.enableInheritanceFilters = function(theVcfData) {
}

FilterCard.prototype.enableCoverageFilters = function() {
}



FilterCard.prototype.enableVariantFilters = function(fullRefresh) {
  if (dataCard.mode == "trio") {
    d3.selectAll("#filter-track .inheritance").classed("inactive", false);
    d3.select("#filter-track #button-denovo-vus").classed("disabled", false);
    d3.select("#filter-track #button-recessive-vus").classed("disabled", false);
  } else {
    d3.selectAll("#filter-track .inheritance").classed("inactive", true);
    d3.select("#filter-track #button-denovo-vus").classed("disabled", true);
    d3.select("#filter-track #button-recessive-vus").classed("disabled", true);
    d3.selectAll("#filter-track .inheritance").classed("current", false);
  }
  this.displayEffectFilters();
  this.initFilterListeners();
}

FilterCard.prototype.displayEffectFilters = function() {
  var me = this;

  var nocolor    = $('#effect-filter-box #effect-scheme').hasClass("current") ? "" : "nocolor";
  var values     = this.annotationScheme.toLowerCase() == 'snpeff' ? this.snpEffEffects : this.vepConsequences;
  var field      = this.annotationScheme.toLowerCase() == 'snpeff' ? 'effect' : 'vepConsequence';
  var fieldLabel = this.annotationScheme.toLowerCase() == 'snpeff' ? 'Effect' : 'VEP Consequence';

  var effectKeys = Object.keys(values).sort();

  effectKeys.forEach( function(key) {
    if ($('#filter-track svg#' +key).length == 0) {
      var effectLabel = me.capitalizeFirstLetter(key.split("_gene_variant").join("").split("_variant").join("").split("_").join(" "));
      var svgElem = null;
      if (effectLabel.length < 50) {
        svgElem = '<svg id="' + key + '" class="' + field + ' ' + nocolor + '" width="180" height="15" transform="translate(0,0)">' +
                        '<g transform="translate(1,2)">' +
                        '<text class="name" x="9" y="9" style="fill-opacity: 1;font-size: 9px;">' + effectLabel + '</text>' +
                '<rect class="filter-symbol  effect_' + key + '" rx="1" ry="1" x="1" width="5" y="2" height="5" style="opacity: 1;"></rect>' +
                '</g>' +
                '</svg>';

      } else {
        // find first space after 20th character
        var pos = -1;
        for (var i = 50; i < effectLabel.length; i++) {
          if (pos == -1 && effectLabel[i] == " ") {
            pos = i;
          }
        }
        if (pos <= 0) {
          pos = Math.round(effectLabel.length / 2);
        }
        var label1 = effectLabel.substring(0, pos);
        var label2 = effectLabel.substring(pos+1, effectLabel.length);
        svgElem = '<svg id="' + key + '" class="' + field + ' ' + nocolor + '" width="180" height="26" transform="translate(0,0)">' +
                  '<g transform="translate(1,2)">' +
                        '<text class="name" x="9" y="7" style="fill-opacity: 1;font-size: 9px;">' + label1 + '</text>' +
                        '<text class="name" x="9" y="17" style="fill-opacity: 1;font-size: 9px;">' + label2 + '</text>' +
                '<rect class="filter-symbol  effect_' + key + '" rx="1" ry="1" x="1" width="5" y="2" height="5" style="opacity: 1;"></rect>' +
                '</g>' +
                '</svg>';

      }

        $('#effect-filters').append(svgElem);

    }
  });
  me.initFilterListeners("." + field, {field: fieldLabel} )
}

FilterCard.prototype.displayRecFilters = function() {
  var me = this;

  var recFilterCount = 0;
  var recFilterKeys = Object.keys(this.recFilters).sort(function(a,b) {
    if (a == 'PASS') {
      return -1;
    } else if (b == 'PASS') {
      return 1
    } else {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1
      } else {
        return 0;
      }
    }
  });

  recFilterKeys.forEach(function(key) {
    var elmId = key === "." ? "unassigned" : key;
    if ($('#filter-track #' + elmId).length == 0) {
      var label = key === "." ? ". unassigned" : key;
      recFilterCount++;
      var svgElem = '<svg id="' + elmId + '" class="recfilter" width="150" height="15" transform="translate(0,0)">' +
                  '<g transform="translate(1,2)">' +
                        '<text class="name" x="9" y="8" style="fill-opacity: 1;font-size: 9px;">' + me.capitalizeFirstLetter(label.toLowerCase()).split("-").join(" ") + '</text>' +
                '</g>' +
              '</svg>';
        $('#rec-filter-box').append(svgElem);
    }
  });
  me.initFilterListeners('.recfilter', {recfilter: 'VCF Filter Status'})
}

FilterCard.prototype.hasFilters = function() {
  if (this._getFilterString().length > 0) {
    return true;
  } else {
    return false;
  }
}


FilterCard.prototype.getCardSpecificFilters = function(relationship) {
  var me = this;
  var specificFilters = [];

  var theFilterMap = me.cardSpecificFilters[relationship];

  if (theFilterMap) {
    for (var key in theFilterMap) {
      var theFilter = theFilterMap[key];
      specificFilters.push(theFilter);
    }
  }

  return specificFilters;
}

FilterCard.prototype.hasCardSpecificFilters = function(relationship) {
  return this.getCardSpecificFilters(relationship).filter(function(theFilter) {
    return theFilter.value == true;
  }).length > 0;
}

FilterCard.prototype.getCardSpecificFilter = function(relationship, id) {
  var theFilter = null;
  if (this.cardSpecificFilters[relationship]) {
    theFilter = this.cardSpecificFilters[relationship][id];
  }
  return theFilter;
}

FilterCard.prototype.setCardSpecificFilter = function(relationship, id, value) {
  var theFilter = this.getCardSpecificFilter(relationship, id, value);
  if (theFilter) {
    theFilter.value = value;
  }
}
FilterCard.prototype.clearCardSpecificFilters = function(relationship) {
  return this.getCardSpecificFilters(relationship).forEach(function(theFilter) {
    theFilter.value = false;
  })
}



FilterCard.prototype.refreshGeneCoverageBadges = function() {
  cacheHelper.promiseRefreshGeneBadgesGeneCoverage(true)
   .then(function() {
    $('#filter-track #coverage-thresholds').removeClass('attention');
    loadTracksForGene();

   }, function(error) {
    console.log("Problem encounted in FilterCard.refreshGeneCoverageBadges(): " + error);
   });
}


FilterCard.prototype.filterGenes = function(callback) {
  var me = this;
  // After the filter has been applied to the current gene's variants,
  // refresh all of the gene badges based on the filter
  if (me.applyLowCoverageFilter) {
    genesCard.setOrderBy(genesCard.LOW_COVERAGE_OPTION);
    cacheHelper.promiseRefreshGeneBadgesGeneCoverage().then(function(geneCounts) {
      cacheHelper.showGeneCounts(geneCounts);
      if (callback) {
        callback();
      }
    }, function(error) {
      console.log("Problem encounted in FilterCard.filterGenes():  " + error);
      if (callback) {
        callback();
      }
    });
  } else {
    genesCard.setOrderBy(genesCard.HARMFUL_VARIANTS_OPTION);
    var geneCounts = cacheHelper.refreshGeneBadges(function() {
      cacheHelper.showAnalyzeAllProgress();
      if (callback) {
        callback();
      }
    });
  }
}



FilterCard.prototype._getFilterString = function() {
  var filterString = "";
  var filterObject = this.getFilterObject();


  var AND = function(filterString) {
    if (filterString.length > 0) {
      return   " <span class='filter-element'>and</span> ";
    } else {
      return "";
    }
  }

  var filterBox = function(filterString) {
    return "<span class=\"filter-flag filter-element label label-primary\">" + filterString + "</span>";
  }



  // When low coverage filter applied, we only filter on this, not any other criteria.
  if (this.applyLowCoverageFilter) {
    filterString += filterBox("Exon coverage min < " + this.geneCoverageMin + " OR median < " + this.geneCoverageMedian + " OR mean < " + this.geneCoverageMean);
    return filterString;
  }

  var affectedFilters = [];
  if (filterObject.affectedInfo) {
    affectedFilters = filterObject.affectedInfo.filter(function(info) {
      return info.filter && info.status == 'affected';
    });
    if (affectedFilters.length > 0) {
      var buf = "";
      affectedFilters.forEach(function(info) {
        if (buf.length > 0) {
          buf += ", ";
        }
        buf += info.label;
      })
      filterString +=  AND(filterString) + filterBox("Present in affected: " + buf);
    }
  }

  var unaffectedFilters = [];
  if (filterObject.affectedInfo) {
    unaffectedFilters = filterObject.affectedInfo.filter(function(info) {
      return info.filter  && info.status == 'unaffected';
    });
    if (unaffectedFilters.length > 0) {
      var buf = "";
      unaffectedFilters.forEach(function(info) {
        if (buf.length > 0) {
          buf += ", ";
        }
        buf += info.label;
      })
      filterString +=  AND(filterString) +  filterBox("Absent in unaffected: " + buf);
    }
  }

  if ($('#loaded-variants-cb').is(":checked") && !$('#called-variants-cb').is(":checked")) {
    filterString += AND(filterString) + filterBox("loaded variants only");
  }

  if ($('#called-variants-cb').is(":checked") && !$('#loaded-variants-cb').is(":checked")) {
    filterString += AND(filterString) + filterBox("called variants only");
  }

  if ($('#exonic-only-cb').is(":checked")) {
    filterString += AND(filterString) + filterBox("not intronic");
  }

  if (filterObject.afMin != null && filterObject.afMax != null) {
    if (filterObject.afMin >= 0 && filterObject.afMax < 1) {
      filterString += AND(filterString) + filterBox("Allele freqency between " + filterObject.afMin + " and  " + filterObject.afMax);
    }
  }

  if (filterObject.coverageMin && filterObject.coverageMin > 0) {
    if (filterString.length > 0) {
      filterString += AND(filterString) +  filterBox("coverage at least " + filterObject.coverageMin + "X");
    }
  }


  var annots = {};
  for (key in filterObject.annotsToInclude) {
    var annot = filterObject.annotsToInclude[key];
    if (annot.state) {
      var annotObject = annots[annot.key];
      if (annotObject == null) {
        annotObject = {values: [], label: annot.label};
        annots[annot.key] = annotObject;
      }
      annotObject.values.push((annot.not ? "NOT " : "") + annot.valueDisplay);
    }
  }

  for (key in annots) {
    var annotObject = annots[key];
    var theValues = "";
    annotObject.values.forEach(function(theValue) {
      if (theValues.length > 0) {
        theValues += ", "
      } else if (annotObject.values.length > 1) {
        theValues +=  "(";
      }
      theValues += theValue;
    });
    if (annotObject.values.length > 1) {
      theValues += ")";
    }

    filterString += AND(filterString) + filterBox(annotObject.label + '&nbsp;&nbsp;' + theValues);
  }
  return filterString;
}

FilterCard.prototype.displayFilterSummary = function(filterString) {
  $("#filter-summary-track span.filter-element").remove();
  filterString = filterString ? filterString : this._getFilterString();
  if (filterString.length > 0) {
    $("#filter-summary-track").removeClass("hide")
    $('#filter-summary-track .loader').after(filterString);
  }
}

FilterCard.prototype.startFilterProgress = function() {
  if (this.hasFilters()) {
    $('#filter-summary-loader .loader-label').text("Applying filter")
  } else {
    $('#filter-summary-loader .loader-label').text("Clearing filter")
  }
  $('#filter-summary-loader').removeClass("hide");
}

FilterCard.prototype.endFilterProgress = function() {

  $('#filter-summary-loader').addClass("hide");

  if (this.hasFilters()) {
    $("#filter-summary-track").removeClass("hide")
  } else {
    $("#filter-summary-track").addClass("hide")
  }
}

FilterCard.prototype.isLowCoverage = function(gc) {
    return  +gc.min   < this.geneCoverageMin
    || +gc.median < this.geneCoverageMedian
    || +gc.mean   < this.geneCoverageMean;
}

FilterCard.prototype.whichLowCoverage = function(gc) {
  var fields = {};
  fields.min    = +gc.min    < this.geneCoverageMin    ? '< ' + this.geneCoverageMin : null;
  fields.median = +gc.median < this.geneCoverageMedian ? '< ' + this.geneCoverageMedian : null;
  fields.mean   = +gc.mean   < this.geneCoverageMean   ? '< ' + this.geneCoverageMean : null;
  return fields;
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
    var impactList =  (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.impact : d[IMPACT_FIELD_TO_FILTER]);
    for (key in impactList) {
      impacts += " " + key;
    }
    var colorImpactList =  (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.impact : d[IMPACT_FIELD_TO_COLOR]);
    for (key in colorImpactList) {
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

  return  'variant ' + d.type.toLowerCase()  + ' ' + d.zygosity.toLowerCase() + ' ' + (d.inheritance ? d.inheritance.toLowerCase() : "") + ' ua_' + d.ua + ' '  + sift + ' ' + polyphen + ' ' + regulatory +  ' ' + FilterCard.getRecFilterClazz(d) + ' ' + d.clinvar + ' ' + impacts + ' ' + effects + ' ' + d.consensus + ' ' + colorimpacts;
}

FilterCard.getRecFilterClazz = function(variant) {
  return ' recfilter_' + (variant.recfilter == "." ? "unassigned" : variant.recfilter);
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
    var impactList =  (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.impact : d[IMPACT_FIELD_TO_FILTER]);
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

    return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + + d.inheritance.toLowerCase() + ' ua_' + d.ua + ' ' + sift + ' ' + polyphen + ' ' + regulatory + ' ' + FilterCard.getRecFilterClazz(d)  + ' ' + d.clinvar + ' ' + effects + ' ' + impacts + ' ' + d.consensus + ' ' + coloreffects;
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
    var impactList =  (annotationScheme == null || annotationScheme.toLowerCase() == 'snpeff' ? d.impact : d[IMPACT_FIELD_TO_FILTER]);
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

    return  'variant ' + d.type.toLowerCase() + ' ' + 'zyg_'+ d.zygosity.toLowerCase() + ' ' + d.inheritance.toLowerCase() + ' ua_' + d.ua + ' ' + sift + ' ' + polyphen + ' ' + regulatory + ' ' + FilterCard.getRecFilterClazz(d) + ' '  + d.clinvar + ' ' + effects + ' ' + impacts + ' ' + d.consensus + ' ';
}


FilterCard.prototype.classifyByClinvar = function(d) {

  return  'variant ' + d.type.toLowerCase()  +  ' '  + d.clinvar + ' colorby_' + d.clinvar;
}




