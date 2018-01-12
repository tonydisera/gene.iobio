 function GenesCard() {
  this.geneBarChart = null;
  this.NUMBER_PHENOLYZER_GENES = 300;
  this.NUMBER_PHENOLYZER_GENES_OFFLINE = 20;
  this.GENES_PER_PAGE_DEFAULT = 40;
  this.GENES_PER_PAGE = isLevelBasic || isLevelEdu ? 99999 :  this.GENES_PER_PAGE_DEFAULT;
  this.ACMG_GENES = ["BRCA1", "BRCA2", "TP53", "STK11", "MLH1", "MSH2", "MSH6", "PMS2", "APC", "MUTYH", "VHL", "MEN1", "RET", "PTEN", "RB1", "SDHD", "SDHAF2", "SDHC", "SDHB", "TSC1", "TSC2", "WT1", "NF2", "COL3A1", "FBN1", "TGFBR1", "TGFBR2", "SMAD3", "ACTA2", "MYH11", "MYBPC3", "MYH7", "TNNT2", "TNNI3", "TPM1", "MYL3", "ACTC1", "PRKAG2", "GLA", "MYL2", "LMNA", "RYR2", "PKP2", "DSP", "DSC2", "TMEM43", "DSG2", "KCNQ1", "KCNH2", "SCN5A", "LDLR", "APOB", "PCSK9", "RYR1", "CACNA1S", "ATP7B", "BMPR1A", "SMAD4", "OTC"];
  this.currentPageNumber = 1;
  this.geneNameLoading = null;
  this.sortedGeneNames = null;
  this.geneToDangerSummaryMap = {};
  this.legend = null;

  this.LOW_COVERAGE_OPTION    = "insufficient coverage";
  this.HARMFUL_VARIANTS_OPTION = "harmful variants";

  this.geneSortOptions = [
        {value: this.HARMFUL_VARIANTS_OPTION,  disabled: false},
        {value: this.LOW_COVERAGE_OPTION,      disabled: false},
        {value: "gene name",                   disabled: false},
        {value: "(original order)",            disabled: false}
  ];
  this.geneSortIcons = {};
  this.geneSortIcons[this.HARMFUL_VARIANTS_OPTION] = '<svg id="gene-badge-harmful-variant" width="15" height="14" class="glyph dropdown-item">'
               + '<g transform="translate(0,1)">'
               + '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lightning-symbol" width="13" height="13" style="pointer-events: none; fill: rgb(173, 73, 74);">'
               + '</use>'
               + '</g>'
               + '</svg>';
  this.geneSortIcons[this.LOW_COVERAGE_OPTION] = '<i id="gene-badge-coverage-problem" class="dropdown-item material-icons glyph" >error</i>';

  this.phenolyzerGenes = [];
  this.geneUserVisits = {};
  this.geneNames = []


}

GenesCard.prototype.split = function( val )  {
  return val.replace(/^\s+|\s+$/g, "").split( /;\n*/ );
}

GenesCard.prototype.extractLast = function( term ) {
  return this.split( term ).pop();
}

GenesCard.prototype.init = function() {
  var me = this;

  var hpoUrl = hpoServer + "hot/lookup";


  if (isLevelBasic) {
    $("#genes-card #legend-placeholder").html(templateUtil.legendBasicTemplate());
    this.legend = new Legend();
    legend.init();
  }

   // init bootpag
    $('#gene-page-selection').bootpag({
        total: 0,
        maxVisible: 0
    }).on("page", function(event, pageNumber){
         me._goToPage(pageNumber, me.getGeneNames());
    });



  $('#select-gene-sort').selectize({
      valueField: 'value',
      labelField: 'value',
      disabledField: 'disabled',
      create: false,
      options: me.geneSortOptions,
      items: [
         me.HARMFUL_VARIANTS_OPTION
      ],
      render: {
      option: function(data, escape) {
        var clazz = 'option';
        var style = "";
        if (data.hasOwnProperty("disabled") && data.disabled) {
          clazz += ' disabled';
          style =  'pointer-events:none;opacity: 0.5;'
        }
        var option = '<div class="' + clazz + '" style="' + style + '">';
        option    += me.geneSortIcons.hasOwnProperty(data.value) ? me.geneSortIcons[data.value] : '';
        option    += '<span>' + escape(data.value) + '</span>'
        option    += '</div>';
        return option;
      },
      item: function(data, escape) {
        var clazz = 'option';
        var style = "";
        if (data.hasOwnProperty("disabled") && data.disabled) {
          clazz += ' disabled';
          style =  'pointer-events:none;opacity: 0.5;'
        }
        var item = '<div class="' + clazz + '" style="' + style + '">';
        item    += me.geneSortIcons.hasOwnProperty(data.value) ? me.geneSortIcons[data.value] : '';
        item    += '<span>' + escape(data.value) + '</span>'
        item    += '</div>';
        return item;
      }
    }
  });
  $('#select-gene-sort')[0].selectize.on('item_add', function(selectedValue) {
    me.sortGenes(selectedValue);
  });
  $('#select-gene-sort')[0].selectize.on('dropdown_open', function() {
    $('#select-gene-sort')[0].selectize.setValue("");
  });

  $('#phenolyzer-select-range-end').val(isLevelEdu ? 5 : 10);
  if (isLevelEdu) {
    $('#select-phenotypes').attr("placeholder", "Enter symptoms...")
  } else {

    if (isLevelBasic) {
      $('#select-phenotypes').attr("placeholder", "Name of condition")
    }

      // Selectize combo for phenotype terms
    $('#select-phenotypes').selectize({
      //plugins: ['remove_button'],
        valueField: 'value',
        labelField: 'value',
        searchField: 'value',
        create: true,
        maxItems: isLevelBasic ? 1 : null,
        maxOptions: 500,
        load: function(query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: hpoUrl + '?term='+encodeURIComponent(query),
                type: 'GET',
                error: function() {
                    callback();
                },
                success: function(res) {
                  if (!query.length) return callback();
                    callback(res);
                }
            });
        }
    });
    $('#select-phenotypes')[0].selectize.on("item_add", function(value, item) {
      $('#select-phenotypes')[0].selectize.close();
      if (isLevelBasic) {
        // Clear out the gene search box
        $('#enter-gene-name-sidebar').val("")

        // Get the phenolyzer genes based on the condition typed in or selected
        me.getPhenolyzerGenes(value);
      }
    });

  }




  // Detect when get genes dropdown opens so that
  // we can prime the textarea with the genes already
  // selected
  $('#get-genes-dropdown').click(function () {
      if($(this).hasClass('open')) {
          // dropdown just closed
      } else {
        // dropdown will open
        me.initCopyPasteGenes();
        setTimeout(function() {
        $('#genes-to-copy').focus();
      }, 0);

      }
  });

  // Stop event propogation to get genes dropdown
  // so that clicks in text area for copy/paste
  // don't cause dropdown to close
  $('#get-genes-dropdown ul li#copy-paste-li').on('click', function(event){
      //The event won't be propagated to the document NODE and
      // therefore events delegated to document won't be fired
      event.stopPropagation();
  });
  // Enter in copy/paste textarea should function as newline
  $('#get-genes-dropdown ul li#copy-paste-li').keyup(function(event){

    if((event.which== 13) && ($(event.target)[0]== $("textarea#genes-to-copy")[0])) {
      event.stopPropagation();
    }
  });


  // When the manage-genes dropdown opens, init the edit genes text area
  $('#manage-genes-dropdown').click(function () {
      if($(this).find(".btn-group").hasClass('open')) {
          // dropdown just closed
      } else {
        // dropdown will open
        me.initEditGenes();
        setTimeout(function() {
        $('#genes-to-edit').focus();
      }, 0);

      }
  });
  // Prevent dropdown from automatically closing when user clicks on anywhere inside the dropdown
  $('#manage-genes-dropdown .dropdown-menu').click( function(event) {
      event.stopPropagation();
    });
  // Stop event propogation to manage-genes dropdown
  // so that clicks in text area for copy/paste
  // don't cause dropdown to close
  $('#manage-genes-dropdown ul li#edit-list-li').on('click', function(event){
      //The event won't be propagated to the document NODE and
      // therefore events delegated to document won't be fired
      event.stopPropagation();
  });
  // Enter in edit genes textarea should function as newline
  $('#manage-genes-dropdown ul li#edit-list-li').keyup(function(event){

    if((event.which== 13) && ($(event.target)[0]== $("textarea#genes-to-edit")[0])) {
      event.stopPropagation();
    }
  });


  if (isLevelEdu || isLevelBasic) {
    eduTourCheckPhenolyzer();
  }
  cacheHelper.showAnalyzeAllProgress();


}

GenesCard.prototype.disableGeneSortOption = function(name, disable) {
  this.geneSortOptions.forEach(function(option) {
    if (option.value == name) {
      option.disabled = disable;
      $('#select-gene-sort')[0].selectize.updateOption(name, option);
    }
  })
}

GenesCard.prototype.showAnalyzeAllButton = function(hideAll = false) {
  if (hideAll) {
    $('#call-variants-dropdown').addClass("hide");
    $('#analyze-all-genes').addClass("hide");
  } else {

    if (isAlignmentsOnly()) {
      $("#call-variants-dropdown").removeClass("hide");
      $("#call-variants-dropdown a").removeClass("disabled");
      $("#analyze-all-genes").addClass("hide");
      $("#analyzed-progress-bar").removeClass("no-alignments");

      $("#coverage-thresholds").removeClass("hide");
      $("#button-low-coverage").removeClass("disabled");
      this.disableGeneSortOption(this.LOW_COVERAGE_OPTION, false);

    } else {
      $("#analyze-all-genes").removeClass("hide");
      if (getProbandVariantCard().isBamLoaded()) {
        $("#call-variants-dropdown").removeClass("hide");
        $("#call-variants-dropdown a").removeClass("disabled");
        $("#analyzed-progress-bar").removeClass("no-alignments");

        $("#coverage-thresholds").removeClass("hide");
        $("#button-low-coverage").removeClass("disabled");
        this.disableGeneSortOption(this.LOW_COVERAGE_OPTION, false);

      } else {
        $("#call-variants-dropdown").removeClass("hide");
        $("#call-variants-dropdown a").addClass("disabled");
        $("#analyzed-progress-bar").addClass("no-alignments");

        $("#coverage-thresholds").addClass("hide");
        $("#button-low-coverage").addClass("disabled");
        this.disableGeneSortOption(this.LOW_COVERAGE_OPTION, true);

      }
    }
  }


}

GenesCard.prototype.setOrderBy = function(sortBy) {
  $('#select-gene-sort')[0].selectize.setValue(sortBy);
}

GenesCard.prototype.sortGenes = function(sortBy, setDropdown) {
  var me = this;
  me.sortedGeneNames = null;
  if (sortBy == null) {
    sortBy = $('#select-gene-sort')[0].selectize.getValue();
    if (sortBy == "") {
      // If the dropdown is empty, set to 'harmful variants'
      $('#select-gene-sort')[0].selectize.setValue(me.HARMFUL_VARIANTS_OPTION);
      sortBy = me.HARMFUL_VARIANTS_OPTION;
    }
  } else if (setDropdown) {
    $('#select-gene-sort')[0].selectize.setValue(sortBy);
  }


  if (sortBy.indexOf("gene name") >= 0) {
    me.sortedGeneNames = me.geneNames.slice().sort();
    me._initPaging(me.sortedGeneNames, true);

  } else {
    me._promiseMapDangerSummaries()
     .then(function() {
      if (sortBy.indexOf(me.HARMFUL_VARIANTS_OPTION) >= 0) {
        me.sortedGeneNames = me.geneNames.slice().sort(GenesCard.compareDangerSummary);
      } else if (sortBy.indexOf(me.LOW_COVERAGE_OPTION) >= 0) {
        me.sortedGeneNames = me.geneNames.slice().sort(GenesCard.compareDangerSummaryByLowCoverage);
      }
      me._initPaging(me.sortedGeneNames, true);

     })

  }

}

GenesCard.prototype._promiseMapDangerSummaries = function() {
  var me = this;

  me.geneToDangerSummaryMap = {};

  return new Promise(function(resolve, reject) {
    var promises = [];
    me.geneNames.forEach(function(geneName) {
      var dangerSummary = me.geneToDangerSummaryMap[geneName];
      if (dangerSummary == null) {
        var promise = getProbandVariantCard().promiseGetDangerSummary(geneName)
        .then( function(ds) {
          me.geneToDangerSummaryMap[geneName] = ds;
        }, function(error) {
          console.log("Error in GenesCard._promiseMapDangerSummaries(): " + error)
          reject(error);
        });
        promises.push(promise);
      }
    })

    Promise.all(promises).then(function() {
      resolve();
    });

  });


}

GenesCard.prototype.getGeneNames = function() {
  var me = this;
  if (me.sortedGeneNames && me.sortedGeneNames.length == me.geneNames.length) {
    return me.sortedGeneNames;
  } else {
    return me.geneNames;
  }
}

GenesCard.prototype.pageNumberForGene = function(geneName) {
  var theGeneNames = this.getGeneNames();
  var position = theGeneNames.indexOf(geneName) + 1;
  return Math.ceil(position / this.GENES_PER_PAGE);
}

GenesCard.prototype.getPageCount = function() {
  return Math.ceil(this.geneNames.length / this.GENES_PER_PAGE);
}

GenesCard.compareDangerSummary = function(geneName1, geneName2) {

  var danger1 = genesCard.geneToDangerSummaryMap[geneName1];
  var danger2 = genesCard.geneToDangerSummaryMap[geneName2];

  if (danger1 == null && danger2 == null) {
    return 0;
  } else if (danger2 == null) {
    return -1;
  } else if (danger1 == null) {
    return 1;
  }

  var dangers = [danger1, danger2];


  // lowests (non-zero) harmful variant level  = highest relevance
  var harmfulVariantValues = [9999, 9999];
  dangers.forEach(function(danger, index) {
    if (danger.harmfulVariantsLevel) {
      harmfulVariantValues[index] = danger.harmfulVariantsLevel;
    }
  });
  if (harmfulVariantValues[0] !== harmfulVariantValues[1]) {
    return harmfulVariantValues[0] - harmfulVariantValues[1];
  }

  // lowest clinvar value = highest relevance
  var clinvarValues = [9999, 9999];
  dangers.forEach(function(danger, index) {
    if (danger.CLINVAR) {
      for (key in danger.CLINVAR) {
        var showBadge = matrixCard.clinvarMap[key].badge;
        if (showBadge) {
          clinvarValues[index] = danger.CLINVAR[key].value;
        }
      }
    }
  });
  if (clinvarValues[0] !== clinvarValues[1]) {
    return clinvarValues[0] - clinvarValues[1];
  }

  // sift
  var siftValues = [9999, 9999];
  dangers.forEach(function(danger, index) {
    if (danger.SIFT) {
      for (key in danger.SIFT) {
        var siftClass = Object.keys(danger.SIFT[key])[0];
        var showBadge = matrixCard.siftMap[siftClass].badge;
        if (showBadge) {
          siftValues[index] = matrixCard.siftMap[siftClass].value;
        }
      }
    }
  });
  if (siftValues[0] !== siftValues[1]) {
    return siftValues[0] - siftValues[1];
  }

  // polyphen
  var polyphenValues = [9999, 9999];
  dangers.forEach(function(danger, index) {
    if (danger.POLYPHEN) {
      for (key in danger.POLYPHEN) {
        var polyphenClass = Object.keys(danger.POLYPHEN[key])[0];
        var showBadge = matrixCard.polyphenMap[polyphenClass].badge;
        if (showBadge) {
          polyphenValues[index] = matrixCard.polyphenMap[polyphenClass].value;
        }
      }
    }
  });
  if (polyphenValues[0] !== polyphenValues[1]) {
    return polyphenValues[0] - polyphenValues[1];
  }

  // lowest impact value = highest relevance
  var impactValues = [9999, 9999];
  dangers.forEach(function(danger, index) {
    if (danger.IMPACT) {
      for (key in danger.IMPACT) {
        impactValues[index] = matrixCard.impactMap[key].value;
      }
    }
  });
  if (impactValues[0] !== impactValues[1]) {
    return impactValues[0] - impactValues[1];
  }

  // lowest allele frequency = highest relevance
  var afValues = [9999,9999];
  dangers.forEach(function(danger, index) {
    if (danger.AF && Object.keys(danger.AF).length > 0) {
      var clazz   = Object.keys(danger.AF)[0];
      var afValue  = danger.AF[clazz].value;
      afValues[index] = afValue;
    }
  });
  if (afValues[0] !== afValues[1]) {
    return afValues[0] - afValues[1];
  }



  if (geneName1 < geneName2) {
    return -1;
  } else if (geneName2 < geneName1) {
    return 1;
  }
  return 0;
}


GenesCard.compareDangerSummaryByLowCoverage = function(geneName1, geneName2) {
  var danger1 = genesCard.geneToDangerSummaryMap[geneName1];
  var danger2 = genesCard.geneToDangerSummaryMap[geneName2];


  if (danger1 == null && danger2 == null) {
    return 0;
  } else if (danger2 == null) {
    return -1;
  } else if (danger1 == null) {
    return 1;
  }

  geneCoverageProblem1 = danger1.geneCoverageProblem ? danger1.geneCoverageProblem : false;
  geneCoverageProblem2 = danger2.geneCoverageProblem ? danger2.geneCoverageProblem : false;


  if (geneCoverageProblem1 == geneCoverageProblem2) {
    if (geneName1 < geneName2) {
      return -1;
    } else if (geneName2 < geneName1) {
      return 1;
    } else {
      return 0;
    }
  } else if (geneCoverageProblem1) {
    return -1;
  } else if (geneCoverageProblem2) {
    return 1;
  }

}


GenesCard.prototype.initCopyPasteGenes = function() {
  var me = this;
  if (me.geneNames.length == 0 || me.geneNames == null) {
    $('#genes-to-copy').val("");
  } else {
    $('#genes-to-copy').val(me.geneNames.join(", "));
  }
}

GenesCard.prototype.initEditGenes = function() {
  var me = this;
  if (me.geneNames.length == 0 || me.geneNames == null) {
    $('#genes-to-edit').val("");
  } else {
    $('#genes-to-edit').val(me.geneNames.join(", "));
  }
}

GenesCard.prototype.pageToGene = function(geneName) {
  var me = this;

  if (me.geneNames && me.geneNames.length > this.GENES_PER_PAGE) {
    var pos = me.geneNames.indexOf(geneName) + 1;
    if (pos > this.GENES_PER_PAGE) {
      var pageNumber = Math.ceil(pos / this.GENES_PER_PAGE);
      this.currentPageNumber = pageNumber;
      me._initPaging(me.geneNames);
    } else {
      this.currentPageNumber = 1;
      me._initPaging(me.geneNames);
    }
  }
}

GenesCard.prototype.viewDefaultsGenesPerPage = function() {
  var me = this;
  me.GENES_PER_PAGE = this.GENES_PER_PAGE_DEFAULT;
  $('#gene-badge-container').removeClass("view-all");
  me._initPaging(me.getGeneNames(), true);
}

GenesCard.prototype.viewAllGenes = function() {
  var me = this;
  me.GENES_PER_PAGE = 1000000;
  me._initPaging(me.getGeneNames(), true);
  $('#gene-badge-container').addClass("view-all");
}

GenesCard.prototype._goToPage = function(pageNumber, theGeneNames) {
  var me = this;
  if (theGeneNames == null) {
    theGeneNames = me.geneNames;
  }

  this.currentPageNumber = pageNumber;
  $('#gene-badge-container #gene-badge').remove();
  var end     = (this.GENES_PER_PAGE * pageNumber);
  var start   = end - this.GENES_PER_PAGE;
  // Create a gene badge for each gene name in the comma separated list.
  for(var i = start; i < Math.min(end, theGeneNames.length); i++) {
    var name = theGeneNames[i];
    // Only add the gene badge if it does not already exist
    var existingBadge = me._getGeneBadge(name);
    if ($(existingBadge).length == 0) {
      me.addGeneBadge(name, true);
    } else {
      me._setBookmarkBadge(name);
    }
    // Indicate the loading glyph if app is in the middle
    // of caching variants for this gene
    if (me.geneNameLoading && name == me.geneNameLoading) {
      me._geneBadgeLoading(name, true);
    }
    // If the danger summary has already been determined,
    // set the appropriate gene badges.
    getProbandVariantCard().promiseGetDangerSummary(name)
     .then(function (geneSummary) {

      if (geneSummary && geneSummary.error == null) {
        me.setGeneBadgeGlyphs(geneSummary.geneName, geneSummary);
      } else if (geneSummary && geneSummary.error) {
        me.setGeneBadgeWarning(geneSummary.geneName);
      }
      if (geneSummary && me.geneUserVisits[geneSummary.geneName]) {
        me.flagUserVisitedGene(geneSummary.geneName);
      }
      if (geneSummary && cacheHelper.isGeneInProgress(geneSummary.geneName)) {
        me.showGeneBadgeLoading(geneSummary.geneName, true);
      }

     })
  }

}

GenesCard.prototype._initPaging = function(theGeneNames, exhibitStartOver) {
  var me = this;
  var pageCount = Math.ceil(theGeneNames.length / this.GENES_PER_PAGE);
  if (theGeneNames.length > this.GENES_PER_PAGE) {
    this.currentPageNumber = exhibitStartOver ? 1 : Math.min(me.currentPageNumber, pageCount);
    $('#gene-page-control').removeClass("hide");
    $('#gene-paging-links').removeClass("hide");
    $('#gene-badge-container').addClass("page-control")
    $('#gene-page-selection').bootpag({
      page: me.currentPageNumber,
          total: pageCount,
          maxVisible: pageCount
      });
    this._goToPage(this.currentPageNumber, theGeneNames);
  } else if (theGeneNames.length > 0) {
    if (this.GENES_PER_PAGE > this.GENES_PER_PAGE_DEFAULT) {
      $('#gene-page-control').removeClass("hide");
      $('#gene-paging-links').removeClass("hide");
      $('#gene-badge-container').addClass("page-control")
    } else {
      $('#gene-page-control').addClass("hide");
      $('#gene-paging-links').addClass("hide");
      $('#gene-badge-container').removeClass("page-control")
    }
    $('#gene-page-selection').html("");
    this.currentPageNumber = 1;
    this._goToPage(this.currentPageNumber, theGeneNames);
    $('#gene-page-selection').html("");
  } else {
    $('#gene-page-control').addClass("hide");
    $('#gene-paging-links').addClass("hide");
    $('#gene-badge-container').removeClass("page-control")
    $('#gene-page-selection').html("");
  }

}

GenesCard.prototype.editGenes = function() {
  var genesString = $('#genes-to-edit').val();
  this.copyPasteGenes(null, false, genesString);
  $('#manage-genes-dropdown .btn-group').removeClass('open');
}

GenesCard.prototype.copyPasteGenes = function(geneNameToSelect, selectTheGene, genesString) {
  var me = this;

  geneCard.resetGeneDropdown();

  if (genesString == null) {
    genesString = $('#genes-to-copy').val();
  }
  // trim newline at very end
  genesString = genesString.replace(/\s*$/, "");
  var geneNameList = genesString.split(/(?:\s+|,\s+|,|^W|\n)/g);

  me.geneNames = [];
  var unknownGeneNames = {};
  var duplicateGeneNames = {};
  geneNameList.forEach( function(geneName) {
    if (geneName.trim().length > 0) {
      if (geneModel.isKnownGene(geneName)) {
        if (me.geneNames.indexOf(geneName.trim().toUpperCase()) < 0) {
          me.geneNames.push(geneName.trim().toUpperCase());
        } else {
          duplicateGeneNames[geneName.trim().toUpperCase()] = true;
        }
      } else {
        unknownGeneNames[geneName.trim().toUpperCase()] = true;
      }
    }
  });

  if (Object.keys(unknownGeneNames).length > 0) {
    var message = "Bypassing unknown genes: " + Object.keys(unknownGeneNames).join(", ") + ".";
    alertify.alert(message);
  }

  if (Object.keys(duplicateGeneNames).length > 0) {
    var message = "Bypassing duplicate gene name(s): " + Object.keys(duplicateGeneNames).join(", ") + ".";
    alertify.alert(message);
  }

  if (CacheHelper.useLocalStorage()) {
    if (global_maxGeneCount && me.geneNames.length > global_maxGeneCount) {
      var bypassedCount = me.geneNames.length - global_maxGeneCount;
      me.geneNames = me.geneNames.slice(0, global_maxGeneCount);
      alertify.alert("Due to browser cache limitations, only the first " + global_maxGeneCount
        + " genes were added. "
        + bypassedCount.toString()
        + " "
        + (bypassedCount == 1 ? "gene" : "genes")
        +  " bypassed.");
    }

  }

  // Remove gene badges not specified in the text area
  var geneBadgesToRemove = [];
  var refreshStandardFilterCounts = false;

  $('#gene-badge-container #gene-badge').each( function(index, value) {
    var badge =  $(this);
    var badgeGeneName = badge.find('#gene-badge-name').text();

    // If this badge does not correspond to a name in the gene list,
    // flag it to be removed
    if (me.geneNames.indexOf(badgeGeneName) < 0) {
      geneBadgesToRemove.push(badgeGeneName);
      refreshStandardFilterCounts = true;

    }

  });
  geneBadgesToRemove.forEach( function(geneName) {
    var gb = me._getGeneBadge(geneName);
    gb.remove();
    me._removeGeneHousekeeping(geneName, false, false);
  });



  if (me.geneNames.length > 0) {
    $('#clear-gene-list').removeClass("hide");
    $('#manage-cache-link').removeClass("hide");

  } else {
    $('#gene-badge-container #done-analyze-all-genes').addClass("hide");
    $('#clear-gene-list').addClass("hide");
    $('#manage-cache-link').addClass("hide");
  }
  me.showAnalyzeAllButton(me.geneNames.length == 0);

  this._initPaging(me.geneNames, true);

  // Create a gene badge for each gene name in the comma separated list.
  for(var i = 0; i < Math.min(me.geneNames.length, this.GENES_PER_PAGE); i++) {
    var name = me.geneNames[i];
    // Only add the gene badge if it does not already exist
    var existingBadge = me._getGeneBadge(name);
    if ($(existingBadge).length == 0) {
      me.addGeneBadge(name, true);
      refreshStandardFilterCounts = true;
    } else {
        me._setBookmarkBadge(name);
      }
    }

  // If we are loading from the url, just add the class 'selected' to the gene specified in the
  // url.  Otherwise if we are performing copy/paste from the dropdown, select the first gene in the list
  if (me.geneNames.length > 0 && geneNameToSelect && me.geneNames.indexOf(geneNameToSelect) >= 0) {
    var geneBadge = me._getGeneBadge(geneNameToSelect);
    geneBadge.addClass("selected");
    if (isLevelBasic) {
      geneCard.selectGeneInDropdown(geneNameToSelect, selectTheGene);
    } else if (isMygene2 || isLevelEdu ) {
      me.selectGene(geneNameToSelect);
    }

  } else if (me.geneNames.length > 0 && geneNameToSelect == null) {
    me.selectGene(me.geneNames[0]);
    if (isLevelBasic) {
      geneCard.selectGeneInDropdown(me.geneNames[0], selectTheGene);
    }
  }

  me._onGeneBadgeUpdate(true);

  cacheHelper.showAnalyzeAllProgress(refreshStandardFilterCounts);

  $('#get-genes-dropdown .btn-group').removeClass('open');
}

// Handle ACMG56 genes.
GenesCard.prototype.ACMGGenes = function(geneNameToSelect) {
  var me = this;

  $('#get-acmg-genes .gene-badge-loader').removeClass("hide");

  me.geneNames = me.ACMG_GENES.slice(0);

  // Remove gene badges not specified in the text area
  var geneBadgesToRemove = [];
  $('#gene-badge-container #gene-badge').each( function(index, value) {
    var badge =  $(this);
    var badgeGeneName = badge.find('#gene-badge-name').text();

    // If this badge does not correspond to a name in the gene list,
    // flag it to be removed
    if (me.geneNames.indexOf(badgeGeneName) < 0) {
      geneBadgesToRemove.push(badgeGeneName);
    }

  });
  geneBadgesToRemove.forEach( function(geneName) {
    var gb = me._getGeneBadge(geneName);
    gb.remove();
    me._removeGeneHousekeeping(geneName);
  });



  if (me.geneNames.length > 0) {
    $('#clear-gene-list').removeClass("hide");
    $('#manage-cache-link').removeClass("hide");
  } else {
    $('#gene-badge-container #done-analyze-all-genes').addClass("hide");
    $('#clear-gene-list').addClass("hide");
    $('#manage-cache-link').addClass("hide");
  }
  me.showAnalyzeAllButton(me.geneNames.length == 0);

  // Create a gene badge for each gene name in the comma separated list.
  for(var i = 0; i < me.geneNames.length; i++) {
    var name = me.geneNames[i];
    // Only add the gene badge if it does not already exist
    var existingBadge = me._getGeneBadge(name);
    if ($(existingBadge).length == 0) {
      me.addGeneBadge(name, true);
    }
  }
  this._initPaging(me.geneNames, true);

  // If we are loading from the url, just add the class 'selected' to the gene specified in the
  // url.  Otherwise if we are performing copy/paste from the dropdown, select the first gene in the list
  if (me.geneNames.length > 0 && geneNameToSelect && me.geneNames.indexOf(geneNameToSelect) >= 0) {
    var geneBadge = me._getGeneBadge(geneNameToSelect);
    geneBadge.addClass("selected");
    if (hasDataSources()) {
      me._setGeneBadgeLoading(geneBadge, true);
    }
  } else if (me.geneNames.length > 0 && geneNameToSelect == null) {
    me.selectGene(me.geneNames[0]);
  }

  me._onGeneBadgeUpdate(true);

  cacheHelper.showAnalyzeAllProgress();

  $('#get-genes-dropdown .btn-group').removeClass('open');

  $('#get-acmg-genes .gene-badge-loader').addClass("hide");


}

GenesCard.prototype.getPhenolyzerGenes = function(phenotype) {
  var me = this;

  me.showGenesSlideLeft();

  $('.phenolyzer.loader .loader-label').text("Phenolyzer job submitted...")
  $('.phenolyzer.loader').removeClass("hide");
  $("#phenolyzer-timeout-message").addClass("hide");
  $('#phenolyzer-heading').addClass("hide");

  var searchTerms = phenotype != null && phenotype != "" ? phenotype :
            $('#select-phenotypes')[0].selectize.getValue().join(";");
  $("#phenolyzer-search-term").text(searchTerms);

  // Get rid of newlines
  searchTerms = searchTerms.split("\n").join("")
  // Change space to _
  searchTerms = searchTerms.split(" ").join("_");
  // Remove ending delimiter
  if (searchTerms.lastIndexOf(";") == searchTerms.length-1) {
    searchTerms = searchTerms.substring(0, searchTerms.length - 1);
  }
  // Replace ; with @ to delimit different search terms
  searchTerms = searchTerms.split(";").join("@");

  d3.select('#phenolyzer-results svg').remove();
    me.phenolyzerGenes = [];

    if (isOffline) {
      if (isLevelEdu) {
      this._getPhenolyzerGenesExhibit(searchTerms)
      } else {
      this._getPhenolyzerGenesBasic(searchTerms)
      }
    } else {
    this._getPhenolyzerGenesAdvanced(phenolyzerServer + '?term=' + searchTerms);
    }


}




/*
*  This method will utilize Yi's cool caching and queueing mechanisms
*  for Phenolyzer, built on Amazon's distributed hash tables (Dynamo)
*  and Message queuing service.
*/
GenesCard.prototype._getPhenolyzerGenesAdvanced = function(url) {
  var me = this;

  $('#phenolyzer-no-results-message').addClass("hide");

  $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function( data ) {
        if (data == "") {
          me.showGenesSlideLeft();
          $('.phenolyzer.loader').addClass("hide");
          $("#phenolyzer-timeout-message").removeClass("hide");
        } else if (data.record == 'queued') {
          $('.phenolyzer.loader .loader-label').text("Phenolyzer job queued...")
          setTimeout(function() {
              me._getPhenolyzerGenesAdvanced(url);
            }, 5000);
        } else if (data.record == 'pending') {
          $('.phenolyzer.loader .loader-label').text("Running Phenolyzer...")
          setTimeout(function() {
              me._getPhenolyzerGenesAdvanced(url);
            }, 5000);
        } else {
          $('.phenolyzer.loader').addClass("hide");
          $('#phenolyzer-heading').removeClass("hide");

          var selectedEnd   = +$('#phenolyzer-select-range-end').val();
          me._parsePhenolyzerData(data.record, selectedEnd, me.NUMBER_PHENOLYZER_GENES);

          me._phenolyzerPromptKeepGenes(function() {
            me.showGenesSlideLeft();

            me.showGenesSlideLeft();

            me.refreshSelectedPhenolyzerGenes();

          })
        }

        },
        fail: function() {
          closeSlideLeft();
          $('.phenolyzer.loader').addClass("hide");
          alert("An error occurred in Phenolyzer iobio services. " + thrownError);
        }



  });

  $('#get-genes-dropdown .btn-group').removeClass('open');

}


GenesCard.prototype._phenolyzerPromptKeepGenes = function(callback) {
  var me = this;

  var selectedPhenoGenes = me.phenolyzerGenes.filter( function(phenGene) { return phenGene.selected == true});

  if (me.phenolyzerGenes.length == 0) {
    $('#phenolyzer-no-results-message').removeClass("hide");
    $('.phenolyzer.loader').addClass("hide");
  } else if (!isLevelEdu && !isLevelBasic && me.geneNames.length > 0 && me.phenolyzerGenes.length > 0 && selectedPhenoGenes.length > 0) {
    alertify.confirm("",
      "Do you want to replace or add to genes?",
      function (e) {
        // user wants to replace genes
        me._clearGenesImpl();
        alertify.defaults.glossary.ok = 'OK';
        alertify.defaults.glossary.cancel = 'Cancel';
        callback();
      },
      function() {
        // user wants to keep genes
        alertify.defaults.glossary.ok = 'OK';
        alertify.defaults.glossary.cancel = 'Cancel';
        callback();
      }

    ).set('labels', {ok:'Replace', cancel:'Add'});
  } else {
    callback();
  }


}

/*
*
* For the exhibit version of gene.iobio, there is a dropdown of phenotype terms.
*  So for this use case, the few phenolyzer results are cached in a file
*  on the local server instance.  If for some reason, the file cannot be loaded,
*  the code falls back to a normal Phenolyzer http service request.
*/
GenesCard.prototype._getPhenolyzerGenesExhibit = function(searchTerms) {
  var me = this;
  var data = "";

  // First see if there is a file on the local instance server containing the ranked
  // genes for this particular phenotype search term.
  $.ajax(
    {
        type: "GET",
        url: OFFLINE_PHENOLYZER_CACHE_URL + searchTerms.split(' ').join("_") + '.txt',
        dataType: "text",
        success: function(data) {
          me.showGenesSlideLeft();
          $('.phenolyzer.loader').addClass("hide");
          $('#phenolyzer-heading').removeClass("hide");

          var selectedEnd   = +$('#phenolyzer-select-range-end').val();
          me._parsePhenolyzerData(data, selectedEnd, me.NUMBER_PHENOLYZER_GENES_OFFLINE);

          me.showGenesSlideLeft();
          me.refreshSelectedPhenolyzerGenes();
       },
       error: function(error) {
        // We didn't find the phenolyzer cached data for the phenotype search term,
        // so call the Phenolyzer service to get the ranked list of genes.
        me._getPhenolyzerGenesBasic(searchTerms);
     }
  });
}

/*
*  For non-amazon instances of IOBIO, use the basic Phenolyzer service to
*  return a ranked gene list based on a phenotype (or a list of phenotypes).*
*/
GenesCard.prototype._getPhenolyzerGenesBasic = function(searchTerms) {
  var me = this;
  var phenolyzerUrl = phenolyzerOnlyServer + '?cmd=' + searchTerms;
  $.ajax(
    {
      url: phenolyzerUrl,
      error: function (xhr, ajaxOptions, thrownError) {
        closeSlideLeft();
        $('.phenolyzer.loader').addClass("hide");
        alert("An error occurred in Phenolyzer iobio services. " + thrownError);
      }
    }
    )
   .done(function(data) {

    me.showGenesSlideLeft();
    $('.phenolyzer.loader').addClass("hide");
    $('#phenolyzer-heading').removeClass("hide");

    var selectedEnd   = +$('#phenolyzer-select-range-end').val();
    me._parsePhenolyzerData(data, selectedEnd, me.NUMBER_PHENOLYZER_GENES);

    me.showGenesSlideLeft();

    me.refreshSelectedPhenolyzerGenes();

  });
}


GenesCard.prototype._parsePhenolyzerData = function(data, selectedEnd, numberPhenolyzerGenes) {
  var me = this;
  var count = 0;
  data.split("\n").forEach( function(rec) {
    var fields = rec.split("\t");
    if (fields.length > 2) {
      var geneName               = fields[1];
      if (count < numberPhenolyzerGenes) {
        var rank                 = fields[0];
        var score                = fields[3];
        var haploInsuffScore     = fields[5];
        var geneIntoleranceScore = fields[6];
        var selected             = count < selectedEnd ? true : false;
        me.phenolyzerGenes.push({rank: rank, geneName: geneName, score: score, haploInsuffScore: haploInsuffScore, geneIntoleranceScore: geneIntoleranceScore, selected: selected});
      }
      count++;

    }
  });
}

GenesCard.prototype.isPhenolyzerGene = function(geneName) {
  var foundGenes = me.phenolyzerGenes.filter( function(phenGene) {
    return phenGene.selected && phenGene.geneName == geneName;
  });
  return foundGenes.length > 0;
}

GenesCard.prototype.highlightPhenolyzerGenes = function() {
  var me = this;
  $('#gene-badge-container #gene-badge').each( function(index, value) {
    var badge =  $(this);
    var badgeGeneName = badge.find('#gene-badge-name').text();
    if (me.isPhenolyzerGene(badgeGeneName)) {
      badge.addClass("phenolyzer");
    } else {
      badge.removeClass("phenolyzer");
    }
  });
}

GenesCard.prototype.refreshSelectedPhenolyzerGenes = function() {
  var me = this;
  var selectedPhenoGenes = me.phenolyzerGenes.filter( function(phenGene) { return phenGene.selected == true});




  // Don't throw away the genes we already have loaded, but do get rid of any that are
  // in the phenolyzer gene list as we want these to stay grouped (and order by rank).
  selectedPhenoGenes.forEach( function(phenoGene) {
    me.geneNames = me.geneNames.filter(function(geneName) {
      return geneName != phenoGene.geneName;
    })
    var gb = me._getGeneBadge(phenoGene.geneName);
    if (gb && gb.length > 0) {
      gb.remove();
    }
  });

  // Now create a comma delimited list of all existing genes + selected phenolyzer genes
  var genesString = me.geneNames.join(",");
  if (isLevelEdu || isLevelBasic) {
    genesString = "";
  }
  selectedPhenoGenes.forEach( function(g) {
    if (genesString.length > 0) {
      genesString += ",";
    }
    genesString += g.geneName;
  })
  $('#genes-to-copy').val(genesString);

  me.copyPasteGenes(selectedPhenoGenes.length > 0 ? selectedPhenoGenes[0].geneName : null, true);

  me.highlightPhenolyzerGenes();
}

GenesCard.prototype.refreshBookmarkedGenes = function(bookmarkedGenes) {
  var me = this;

  // Don't throw away the genes we already have loaded, but do get rid of any that are
  // in the bookmarked gene list as we want these to stay grouped (and order by rank).
  // The exception is phenolyzer genes.  Just keep them in the order already listed.
  var selectedPhenoGeneObject  = me.phenolyzerGenes
     .filter( function(phenGene) {
        return phenGene.selected == true
     })
     .reduce(function(object, phenoGene) {
        object[phenoGene.geneName] = phenoGene;
        return object;
    }, {});
  me.geneNames = me.geneNames.filter(function(geneName) {
    var bookmarkedGene = bookmarkedGenes[geneName];
    var phenolyzerGene = selectedPhenoGeneObject[geneName];
    var keep =  phenolyzerGene || !bookmarkedGene;
    if (!keep) {
      var gb = me._getGeneBadge(geneName);
      if (gb && gb.length > 0) {
        gb.remove();
      }
    }
    return keep;
  })

  // Now create a comma delimited list of all existing genes + selected phenolyzer genes
  var genesString = me.geneNames.join(",");
  for (var bookmarkedGene in bookmarkedGenes) {
    var phenolyzerGene = selectedPhenoGeneObject[bookmarkedGene];
    if (!phenolyzerGene) {
      if (genesString.length > 0) {
        genesString += ",";
      }
      genesString += bookmarkedGene;
    }
  }
  $('#genes-to-copy').val(genesString);

  me.copyPasteGenes();
}

GenesCard.prototype._onGeneBadgeUpdate = function(updateUrlParm) {
  var me = this;

  // Only show the gene badges if there is at least one gene in the list
  if (me.geneNames.length > 0) {
    $('#gene-badge-container').removeClass("hide");
  } else {
    $('#gene-badge-container').addClass("hide");
  }

  // Update the url with the gene list
  if (updateUrlParm) {
    util.updateUrl('genes', me.geneNames.join(","));
  }

}




GenesCard.prototype._promiseGetGeneSummary = function(geneBadgeSelector, geneName) {
  var me = this;

  // If the site is configured so that NO outside access is allowed to obtain
  // the gene summary from NCBI, just resolve with a null summary
  if (!accessNCBIGeneSummary) {
    return new Promise( function(resolve, reject) {
      resolve(null);
    });
  }

  return new Promise(function(resolve, reject) {

    geneModel.promiseGetNCBIGeneSummary(geneName)
    .then(function(geneInfo) {
      geneCard.showGeneSummary(geneName);
      d3.select(geneBadgeSelector).data([geneInfo]);
      resolve(geneInfo);
    },
    function(error) {
      reject(error);
    });

  })

}

GenesCard.prototype.removeGeneBadgeByName = function(theGeneName, performPaging=true, updateAnalyzedCounts=true) {
  var me = this;


  var index = me.geneNames.indexOf(theGeneName);
  if (index >= 0) {
    me.geneNames.splice(index, 1);
    var gb = me._getGeneBadge(theGeneName);
    gb.remove();
    me._onGeneBadgeUpdate();
  }

  me._removeGeneHousekeeping(theGeneName, performPaging, updateAnalyzedCounts);

}

GenesCard.prototype.clearGeneInfos = function() {
  var me = this;
  window.gene = null;
  window.selectedTranscript = null;
  me.geneNames.forEach(function(theGeneName) {
    me.clearGeneInfo(theGeneName);
  });
  me._hideCurrentGene();
}


GenesCard.prototype.clearGeneInfo = function(theGeneName) {
  var me = this;
  geneModel.clearGene(theGeneName);
  if (me.geneUserVisits && me.geneUserVisits.hasOwnProperty(theGeneName)) {
    delete me.geneUserVisits[theGeneName];
  }

}

GenesCard.prototype._removeGeneHousekeeping = function(theGeneName, performPaging=true, updateAnalyzedCounts=true) {
  me = this;
  if (window.gene && theGeneName == window.gene.gene_name) {
    me._hideCurrentGene();
  }

  cacheHelper.clearCacheForGene(theGeneName);
  me.clearGeneInfo(theGeneName);

  if (performPaging) {
    me.sortGenes();
  }

  if (updateAnalyzedCounts) {
    cacheHelper.showAnalyzeAllProgress(true);
  }

}


GenesCard.prototype._hideCurrentGene = function() {
  $('#gene-track').addClass("hide");
  $('#matrix-track').addClass("hide");
  $('.variant-card').addClass("hide");
  $('#known-variants-all-card').addClass("hide");
}


GenesCard.prototype.clearGenes = function(callbackOk, callbackCancel) {
  var me = this;
  // confirm dialog
  alertify.defaults.glossary.ok = 'OK';
  alertify.defaults.glossary.cancel = 'Cancel';
  alertify.confirm("Confirm",
    "Remove all genes currently listed?",
    function (e) {
      // user clicked "ok"
          me._clearGenesImpl();
          if (callbackOk) {
            callbackOk();
          }
    },
    function() {
      // user clicked cancel.
          if (callbackCancel) {
            callbackCancel();
          }
    }

  ).set('labels', {ok:'OK', cancel:'Cancel'});

}

GenesCard.prototype._clearGenesImpl = function() {
  var me = this;
  while (me.geneNames.length > 0) {
    var theGeneName = me.geneNames[0];

    me.geneNames.splice(0, 1);
    var gb = me._getGeneBadge(theGeneName);
    gb.remove();

    me._removeGeneHousekeeping(theGeneName, false, false);
  };
  window.gene = null;
  window.selectedTranscript = null;
  me.geneToDangerSummaryMap = {};
  me._hideCurrentGene();

  me._onGeneBadgeUpdate(true);
  me._initPaging(me.geneNames);

  filterCard.clearFilters();
  filterVariants();
  filterCard.resetStandardFilterCounts();

  cacheHelper.hideAnalyzeAllProgress();
}


GenesCard.prototype.removeGeneBadge = function(badgeElement) {
  var me = this;
  var theGeneName = $(badgeElement).parent().find("#gene-badge-name").text();
  alertify.confirm("",
    "Are you sure you want to remove gene " + theGeneName + "?",
    function (e) {
      // ok
      me.removeGeneBadgeImpl(badgeElement);
      me._onGeneBadgeUpdate(true);
    },
    function() {
      // cancel
    }

  ).set('labels', {ok:'OK', cancel:'Cancel'});

}


GenesCard.prototype.removeGeneBadgeImpl = function(badgeElement) {
  var me = this;

  var theGeneName = $(badgeElement).parent().find("#gene-badge-name").text();

  var index = me.geneNames.indexOf(theGeneName);
  if (index >= 0) {
    me.geneNames.splice(index, 1);
    $(badgeElement).remove();

    me._onGeneBadgeUpdate();
  }

  me._removeGeneHousekeeping(theGeneName);

}

GenesCard.prototype.addGene = function(geneName) {
  var me = this;

  if (CacheHelper.useLocalStorage()) {
    if (global_maxGeneCount && me.geneNames.length >= global_maxGeneCount) {
      alertify.alert("Cannot add gene " + geneName + ".  Only " + global_maxGeneCount + " can be added due to browse cache limitations.");
      return;
    }
  }

  geneName = geneName.toUpperCase();

  if (me.geneNames.indexOf(geneName) < 0) {
    me.geneNames.push(geneName);
  }

  me._onGeneBadgeUpdate(true);

  me.addGeneBadge(geneName);
  me.pageToGene(geneName);



}

GenesCard.prototype.addGeneBadge = function(geneName, bypassSelecting) {
  var me = this;

  $('#genes-control-track').removeClass("hide");
  $('#genes-panel').removeClass("hide");


  if (isLevelBasic) {
    geneCard.addGeneDropdownOption(geneName, bypassSelecting);
  }

  var gb = me._getGeneBadge(geneName);
  if (gb == null || gb.length == 0) {
    $('#gene-badge-container #after-genes').before(templateUtil.geneBadgeTemplate());
    $("#gene-badge-container #gene-badge").last().find('#gene-badge-name').text(geneName);
    var theGeneBadge = me._getGeneBadge(geneName);
    d3.select(theGeneBadge[0]).data([geneName]);

    d3.select(theGeneBadge.find("#gene-badge-name")[0])
      .on("mouseover", function(d,i) {
        var geneName = d3.select(this.parentNode.parentNode).datum()
        var geneAnnot = geneModel.geneNCBISummaries[geneName];

        var x = d3.event.pageX;
        var y = d3.event.pageY;
        if (geneAnnot && geneAnnot.description) {
          me.showTooltip(me.formatGeneDescriptionHTML(geneAnnot.description, geneAnnot.summary), x, y, 300);
        }
      })
      .on("mouseout", function(d,i) {
        me.hideTooltip();
      });

    me._setPhenotypeBadge(geneName);
    me._promiseGetGeneSummary(theGeneBadge, geneName);
    me._setBookmarkBadge(geneName);



    if (!bypassSelecting) {
      if (hasDataSources()) {
        me._setGeneBadgeLoading(theGeneBadge, true);
      }
      $("#gene-badge.selected").removeClass("selected");
      theGeneBadge.addClass("selected");
    }

    me.showAnalyzeAllButton();
    $('#clear-gene-list').removeClass("hide");
    $('#manage-cache-link').removeClass("hide");


  }
  me._onGeneBadgeUpdate();

}


GenesCard.prototype.showTooltip = function(html, screenX, screenY, width) {
  var me = this;
  var tooltip = d3.select('#gene-badge-tooltip');

  tooltip.style("z-index", 20);
  tooltip.transition()
   .duration(1000)
   .style("opacity", .9)
   .style("pointer-events", "all");

  tooltip.html(html);
  var h = tooltip[0][0].offsetHeight;
  var w = width;

  var x = screenX ;
  var y = screenY + 20;

  // If the tooltip, positioned at the cursor, is truncated
  // because its width exceeds the window size, just position
  // the tooltip in the middle of the window
  if ((x + w + 100) > window.outerWidth) {
    x = (window.outerWidth / 2) - (w / 2)
  }

  if (window.outerWidth - 100 < x + w) {
    tooltip.style("width", w + "px")
             .style("left", x - w + "px")
             .style("text-align", 'left')
             .style("top", y + "px")
             .style("z-index", 1032)
             .style("overflow-y", "hidden");


  } else {
    tooltip.style("width", w + "px")
             .style("left", x + "px")
             .style("text-align", 'left')
             .style("top", (y) + "px")
             .style("z-index", 1032)
             .style("overflow-y", "hidden");

  }
}

GenesCard.prototype.hideTooltip = function() {
  var tooltip = d3.select('#gene-badge-tooltip');
  tooltip.transition()
           .duration(500)
           .style("opacity", 0)
           .style("z-index", 0)
           .style("pointer-events", "none");
}

GenesCard.prototype.setBookmarkBadge = function(geneName) {
  this._setBookmarkBadge(geneName);
}

GenesCard.prototype._setBookmarkBadge = function(geneName) {
  var me = this;
  // If this gene is in the bookmarked genes, show the bookmark glyph
  var geneBadge = me._getGeneBadge(geneName);
  if (geneBadge) {
    geneBadge.find("#gene-badge-bookmark svg").remove();
    if (bookmarkCard.isBookmarkedGene(geneName)) {
      geneBadge.find('#gene-badge-bookmark').append("<svg class=\"bookmark-badge\" height=\"12\" width=\"12\">");
      var selection = d3.select(geneBadge.find('#gene-badge-bookmark .bookmark-badge')[0]).data([{translate: 'translate(3,2)', width:9, height:9, clazz: 'bookmark'}]);
      matrixCard.showBookmarkSymbol(selection);
    }
  }
}

GenesCard.prototype._setPhenotypeBadge = function(geneName) {
  var me = this;
  geneModel.promiseGetGenePhenotypes(geneName).then(function(data) {

      var phenotypes = data[0];
      var theGeneName = data[1];
      if (theGeneName != null && phenotypes != null && phenotypes.length > 0) {
        var geneBadge = me._getGeneBadge(theGeneName);
        geneBadge.find("#gene-badge-phenotype-symbol svg").remove();
        geneBadge.find("#gene-badge-phenotype-symbol").append("<svg class=\"phenotype-badge\" height=\"14\" width=\"14\">");
        var selection = d3.select(geneBadge.find('#gene-badge-phenotype-symbol .phenotype-badge')[0]).data([{width:13, height:13,clazz: 'phenotype', phenotypes: phenotypes}]);
        matrixCard.showPhenotypeSymbol(selection);
        selection.on("mouseover", function(d,i) {

          var symbol = d3.select(this);
          var matrix = symbol.node()
                         .getScreenCTM()
                         .translate(+symbol.node().getAttribute("cx"),+symbol.node().getAttribute("cy"));
                var screenX = window.pageXOffset + matrix.e - 20;
                var screenY = window.pageYOffset + matrix.f + 5;

          var htmlObject = me.formatPhenotypesHTML(d.phenotypes);
          me.showTooltip(htmlObject.html, screenX, screenY, htmlObject.width);

        });
        selection.on("mouseout", function(d,i) {
          me.hideTooltip();
        });
      }
    });
}

GenesCard.prototype.showGeneBadgeLoading = function(geneName) {
  var me = this;

  me._geneBadgeLoading(geneName, true);
}
GenesCard.prototype.hideGeneBadgeLoading = function(geneName) {
  var me = this;

  me._geneBadgeLoading(geneName, false);
}

GenesCard.prototype._setGeneBadgeLoading = function(geneBadge, show) {
  if (show) {
    geneBadge.find('.gene-badge-loader').removeClass("hide");
    geneBadge.addClass("loading");

  } else {
    geneBadge.find('.gene-badge-loader').addClass("hide");
    geneBadge.removeClass("loading");
  }
}

GenesCard.prototype._geneBadgeLoading = function(geneName, show, force) {
  var me = this;

  var geneBadge = me._getGeneBadge(geneName);
  if (show) {
    if (force || hasDataSources()) {
      if (geneBadge.length > 0) {
        me._setGeneBadgeLoading(geneBadge, true);
      }
      me.geneNameLoading = geneName;
    }
  } else {
    if (geneBadge.length > 0) {
      me._setGeneBadgeLoading(geneBadge, false);
    }
    me.geneNameLoading = null;
  }
}

GenesCard.prototype.setGeneBadgeWarning = function(geneName, select) {
  var me = this;

  var geneBadge = me._getGeneBadge(geneName);
  geneBadge.addClass("warning");
  geneBadge.addClass("visited");
  if (select) {
    geneBadge.addClass("selected");
  }
  geneBadge.find("#gene-badge-warning").removeClass("hide");
}

GenesCard.prototype._getGeneBadge = function(geneName) {
  if (geneName) {
    return $("#gene-badge-container #gene-badge-name"). filter(function() {
      if (geneName) {
          return $(this).text().toUpperCase() === geneName.toUpperCase();
      } else {
        return null;
      }
    }).parent().parent();
  }
}

GenesCard.prototype.setGeneBadgeError = function(geneName, select) {
  var me = this;
  var geneBadge = me._getGeneBadge(geneName);
  geneBadge.addClass("error");
  geneBadge.addClass("visited");
  if (select) {
    geneBadge.addClass("selected");
  }
}

GenesCard.prototype.clearGeneGlyphs = function(geneName) {
  var me = this;

  var geneBadge = me._getGeneBadge(geneName);
  me._setGeneBadgeLoading(geneBadge, false);
  geneBadge.find('#gene-badge-button #gene-badge-symbols svg').remove();
  geneBadge.removeClass("visited");
  geneBadge.removeClass("called");
  geneBadge.removeClass("has-called-variants");
  geneBadge.removeClass("selected");
  geneBadge.removeClass("has-coverage-problem");
  geneBadge.removeClass("has-harmful1-variant");
  geneBadge.removeClass("has-harmful2-variant");
  geneBadge.removeClass("has-harmful3-variant");
  geneBadge.removeClass("failed-filter");
}

GenesCard.prototype.setGeneBadgeGlyphs = function(geneName, dangerObject, select) {
  var me = this;

  var geneBadge = me._getGeneBadge(geneName);
  // If the gene badge is not present because it is on a different page,
  // just bypass.
  if (geneBadge == null || geneBadge.length == 0) {
    return;
  }


  geneBadge.find('#gene-badge-circle').removeClass('btn-success');
  geneBadge.find('#gene-badge-circle').removeClass('mdi-action-done');
  geneBadge.find('#gene-badge-circle').removeClass('btn-default');

  me._setGeneBadgeLoading(geneBadge, false);

  geneBadge.find('#gene-badge-danger-count').removeClass("impact_HIGH");
  geneBadge.find('#gene-badge-danger-count').removeClass("impact_MODERATE");
  geneBadge.find('#gene-badge-danger-count').removeClass("impact_MODIFIER");
  geneBadge.find('#gene-badge-danger-count').removeClass("impact_LOW");
  geneBadge.find('#gene-badge-button #gene-badge-symbols svg').remove();

  geneBadge.addClass("visited");
  if (select) {
    geneBadge.addClass("selected");
  }

  geneBadge.removeClass("error");
  geneBadge.removeClass("warning");

  if (dangerObject.ERROR) {
    geneBadge.addClass("error");
  }
  if (dangerObject.WARNING) {
    geneBadge.addClass("warning");
  }

  geneBadge.removeClass("failed-filter");
  if (dangerObject.failedFilter) {
    geneBadge.addClass("failed-filter");
  }

  geneBadge.removeClass("called");
  geneBadge.removeClass("has-called-variants");
  if (dangerObject.CALLED && dangerObject.calledCount > 0) {
    geneBadge.addClass("has-called-variants");
  } else if (dangerObject.CALLED) {
    geneBadge.addClass("called");
  }

  geneBadge.removeClass("has-coverage-problem");
  if (dangerObject.geneCoverageProblem) {
    geneBadge.addClass("has-coverage-problem");

    var selection = d3.select(geneBadge.find('#gene-badge-coverage-problem')[0]).data([{ 'geneCoverageInfo': dangerObject.geneCoverageInfo }]);
    selection.on("mouseover", function(d,i) {
      if (d && d.hasOwnProperty("geneCoverageInfo") && Object.keys(d.geneCoverageInfo).length > 0) {
        var x = d3.event.pageX;
        var y = d3.event.pageY;
        var message = "";
        // There are many exons with low coverage.  Just show number of low coverage exons per sample.
        var counts = {'proband': 0, 'mother': 0, 'father': 0};
        for (exon in d.geneCoverageInfo) {
          for (rel in d.geneCoverageInfo[exon]) {
            if (rel) {
              counts[rel]++;
            }
          }
        }
        for (var rel in counts) {
          if (counts[rel]) {
            if (message.length > 0) {
              message += ", ";
            } else {
              message += 'Gene ' + geneName + "<br>";
              message += "Insufficient coverage in "
            }
            message += counts[rel] + (counts[rel] == 1 ? " exon" : " exons") + " for " + rel;
          }
        }
        me.showTooltip(message, x, y, 330);
      }
    })
    .on("mouseout", function(d,i) {
      me.hideTooltip();
    });
  }


  // Indicate if gene has a bookmared variants
  me._setBookmarkBadge(geneName);

  geneBadge.removeClass("has-harmful1-variant");
  geneBadge.removeClass("has-harmful2-variant");
  geneBadge.removeClass("has-harmful3-variant");

  if (dangerObject.harmfulVariantsInfo && dangerObject.harmfulVariantsInfo.length > 0) {

    var harmfulVariantClazz = "has-harmful"        + dangerObject.harmfulVariantsLevel + "-variant";
    var harmfulVariantBadge = "gene-badge-harmful" + dangerObject.harmfulVariantsLevel + "-variant";
    geneBadge.addClass(harmfulVariantClazz);


    var selection = d3.select(geneBadge.find('#' + harmfulVariantBadge)[0]).data([{ 'harmfulVariantsInfo': dangerObject.harmfulVariantsInfo }]);
    selection.on("mouseover", function(d,i) {
      if (d && d.hasOwnProperty("harmfulVariantsInfo") && d.harmfulVariantsInfo.length > 0) {
        var x = d3.event.pageX;
        var y = d3.event.pageY;
        var message = "";
        d.harmfulVariantsInfo.forEach(function(variantInfo) {
          if (message.length == 0) {
            message += 'Gene ' + geneName + "<br>";
          }
          message += "<div style='display:table'>"
                  +  "<div style='display:table-cell;margin-left:3px;vertical-align:top'> - </div>"
                  +  "<div style='display:table-cell;margin-left:6px'>" + "Contains rare ";

          var desc = "";
          var inherit = "";
          if (variantInfo.clinvar) {
            desc = variantInfo.clinvar + " ClinVar";
          } else if (variantInfo.sift || variantInfo.polyphen) {
            if (variantInfo.sift) {
              desc = variantInfo.sift  + " SIFT";
            }
            if (variantInfo.polyphen) {
              if (desc.length > 0) {
                desc += ", ";
              }
              desc = variantInfo.polyphen  + " PolyPhen";
            }
          } else if (variantInfo.impact) {
            desc  += variantInfo.impact + " VEP impact";
          }
          if (variantInfo.inheritance) {
            if (variantInfo.inheritance == 'denovo') {
              variantInfo.inheritance = 'de novo';
            }
            inherit += matrixCard.getInheritanceLabel(inheritance) + " ";

          }

          message += inherit + desc + " variant.</div></div>"
        });
        me.showTooltip(message, x, y, 350);
      }
    })
    .on("mouseout", function(d,i) {
      me.hideTooltip();
    });

    if (SHOW_INHERITANCE_GLYPH_FOR_GENE) {
      var harmfulVariantInheritance = {};
      dangerObject.harmfulVariantsInfo.forEach(function(variantInfo) {
        if (variantInfo.hasOwnProperty("inheritance") && variantInfo.inheritance) {
          harmfulVariantInheritance[variantInfo.inheritance] = true;
        }
      })
      if (Object.keys(harmfulVariantInheritance).length > 0) {

        var symbolIndex = 0;
        for (var inheritance in harmfulVariantInheritance) {
          var symbolFunction = matrixCard.inheritanceMap[inheritance].symbolFunction;
          var inheritanceDisplay = matrixCard.getInheritanceLabel(inheritance)
          geneBadge.find('#gene-badge-symbols').append("<svg class=\"inheritance-badge\" height=\"15\" width=\"15\">");
          var options = {width:15, height:15, transform: 'translate(0,0)'};
          var selection = d3.select(geneBadge.find('#gene-badge-symbols .inheritance-badge')[symbolIndex]).data([{clazz: inheritance, display: inheritanceDisplay}]);
          symbolFunction(selection, options);
          symbolIndex++;
          selection.on("mouseover", function(d,i) {
            var x = d3.event.pageX;
            var y = d3.event.pageY;
            me.showTooltip(d.display + " inheritance mode", x, y, 170);
          })
          .on("mouseout", function(d,i) {
              me.hideTooltip();
          });

        }
      }

    }

  }






}

GenesCard.prototype._setGeneBadgeDetailedGlyphs = function(geneBadge, dangerObject) {

  // Now set danger badges
  if (dangerObject.CLINVAR) {
    var dangerClinvar = dangerObject.CLINVAR;
    if (dangerClinvar) {
      for (key in dangerClinvar) {
        var clinvarObject = dangerClinvar[key];
        geneBadge.find('#gene-badge-symbols').append("<svg class=\"clinvar-badge\" height=\"13\" width=\"14\">");
        var selection = d3.select(geneBadge.find('#gene-badge-symbols .clinvar-badge')[0]).data([{width:10, height:10, transform: 'translate(0,0)', clinvarName: key, clinvarObject: clinvarObject, clazz: clinvarObject.clazz}]);
        matrixCard.showClinVarSymbol(selection);
        selection.on("mouseover", function(d,i) {
                var x = d3.event.pageX;
                var y = d3.event.pageY;
                me.showTooltip("ClinVar " + d.clinvarName.split("_").join(" "), x, y, 150);
              })
              .on("mouseout", function(d,i) {
                  me.hideTooltip();
              });
      }
    }

  }

  if (dangerObject.POLYPHEN) {
    var dangerPolyphen = dangerObject.POLYPHEN;
    if (dangerPolyphen != null) {
      var symbolIndex = 0;
      for (clazz in dangerPolyphen) {
        var polyphenObject = dangerPolyphen[clazz];
        geneBadge.find('#gene-badge-symbols').append("<svg class=\"polyphen-badge\" height=\"12\" width=\"12\">");
        var selection = d3.select(geneBadge.find('#gene-badge-symbols .polyphen-badge')[symbolIndex]).data([{width:10, height:10, transform: 'translate(0,0)', clazz: clazz, polyphenObject: polyphenObject}]);
        matrixCard.showPolyPhenSymbol(selection);
        symbolIndex++;
        selection.on("mouseover", function(d,i) {
                var maxPolyphen = "PolyPhen ";
                for (key in d.polyphenObject) {
                  maxPolyphen += key + " ";
                  var transcriptObject = d.polyphenObject[key];
                  for (key in transcriptObject) {
                    maxPolyphen += key + " ";
                  }
                }
                var x = d3.event.pageX;
                var y = d3.event.pageY;
                me.showTooltip(maxPolyphen.split("_").join(" "), x, y, 170);
              })
              .on("mouseout", function(d,i) {
                  me.hideTooltip();
              });
      }
    }

  }

  if (dangerObject.SIFT) {
    var dangerSift = dangerObject.SIFT;
    if (dangerSift != null) {
      var symbolIndex = 0;
      for (clazz in dangerSift) {
        var siftObject = dangerSift[clazz];
        geneBadge.find('#gene-badge-symbols').append("<svg class=\"sift-badge\" height=\"12\" width=\"13\">");
        var selection = d3.select(geneBadge.find('#gene-badge-symbols .sift-badge')[symbolIndex]).data([{width:11, height:11, transform: 'translate(0,0)', clazz: clazz, siftObject: siftObject }]);
        matrixCard.showSiftSymbol(selection);
        symbolIndex++;
        selection.on("mouseover", function(d,i) {
                var maxSift = "SIFT ";
                for (key in d.siftObject) {
                  maxSift += key + " ";
                  var transcriptObject = d.siftObject[key];
                  for (key in transcriptObject) {
                    maxSift += key + " ";
                  }
                }
                var x = d3.event.pageX;
                var y = d3.event.pageY;
                me.showTooltip(maxSift.split("_").join(" "), x, y, 150);
              })
              .on("mouseout", function(d,i) {
                  me.hideTooltip();
              });

      }
    }

  }



  if (dangerObject.IMPACT) {
    var impactClasses = dangerObject.IMPACT;
    var symbolIndex = 0;
    for (impactClass in impactClasses) {
      var types = impactClasses[impactClass];
      for (type in types) {
        var theClazz = 'impact_' + impactClass;
        var effectObject = types[type];
        geneBadge.find('#gene-badge-symbols').append("<svg class=\"impact-badge\" height=\"12\" width=\"12\">");
        var selection = d3.select(geneBadge.find('#gene-badge-symbols .impact-badge')[symbolIndex]).data([{width:10, height:10, clazz: theClazz, type:  type, effectObject: effectObject}]);
        symbolIndex++;
        matrixCard.showImpactBadge(selection);
        selection.on("mouseover", function(d,i) {
                var maxEffect = "";
                for (effectKey in d.effectObject) {
                  var transcriptObject = d.effectObject[effectKey];
                  if (Object.keys(transcriptObject).length > 0) {
                    for (key in transcriptObject) {
                      maxEffect += "<div>";
                      maxEffect += effectKey + " ";
                      maxEffect += "(located on non-canonical transcript " + key + ") ";
                      maxEffect += "</div>";
                    }
                  } else {
                      maxEffect += "<div>";
                      maxEffect += effectKey;
                      maxEffect += "</div>";
                  }
                }
                var x = d3.event.pageX;
                var y = d3.event.pageY;

                var annotScheme = filterCard.annotationScheme.toLowerCase() ==  'snpeff' ? 'SnpEff Effect' : 'VEP Consequence';
                me.showTooltip(annotScheme + " " + maxEffect.split("_").join(" "), x, y, maxEffect.length > 70 ? 350 : 120);
              })
              .on("mouseout", function(d,i) {
                  me.hideTooltip();
              });
      }
    }
  }


  if (dangerObject.INHERITANCE) {
    var inheritanceClasses = dangerObject.INHERITANCE;
    if (inheritanceClasses != null) {
      var symbolIndex = 0;
      for (key in inheritanceClasses) {
        var inheritanceValue = inheritanceClasses[key];
        var clazz = key;
        var symbolFunction = matrixCard.inheritanceMap[inheritanceValue].symbolFunction;
        geneBadge.find('#gene-badge-symbols').append("<svg class=\"inheritance-badge\" height=\"12\" width=\"14\">");
        var options = {width:18, height:20, transform: 'translate(-2,-2)'};
        var selection = d3.select(geneBadge.find('#gene-badge-symbols .inheritance-badge')[symbolIndex]).data([{clazz: clazz}]);
        symbolFunction(selection, options);
        symbolIndex++;
        selection.on("mouseover", function(d,i) {

                var x = d3.event.pageX;
                var y = d3.event.pageY;
                me.showTooltip(d.clazz + " inheritance mode", x, y, 170);
              })
              .on("mouseout", function(d,i) {
                  me.hideTooltip();
              });
      }
    }

  }

}

GenesCard.prototype.selectGeneBadge = function(badgeElement) {
  var me = this;

  var badge = $(badgeElement).parent();
  if (badge) {
    var theGeneName = badge.find("#gene-badge-name").text();
    me.selectGene(theGeneName, function() {

    });
  }

}

GenesCard.prototype.flagUserVisitedGene = function(geneName) {
  var me = this;
  var geneBadge = me._getGeneBadge(geneName);
  geneBadge.find("#gene-badge-button").addClass("user-visited");
  me.geneUserVisits[geneName] = true;
}

GenesCard.prototype.setSelectedGene = function(geneName) {
  var me = this;

  $("#gene-badge.selected").removeClass("selected");
  var geneBadge = me._getGeneBadge(geneName);
  geneBadge.addClass("selected");

  $("#gene-badge.loading").each( function(index, value) {
    var geneName = $(this).find("#gene-badge-name").text();
    // Turn off 'loading' animation for non-selected genes,
    // except for genes currently being analyzed in background.
    if (cacheHelper.cacheQueue.indexOf(geneName) < 0) {
      me._setGeneBadgeLoading($(this), false);
    }
  });
  if (hasDataSources()) {
    me._setGeneBadgeLoading(geneBadge, true);
  }
}

GenesCard.prototype.selectGene = function(geneName, callback, callbackVariantsLoaded) {
  var me = this;

  if (geneName == null || geneName.length == 0) {
    return;
  }

  // If necessary, switch from gencode to refseq or vice versa if this gene
  // only has transcripts in only one of the gene sets
  geneCard.checkGeneSource(geneName);

  geneSearch.setValue(geneName);
  me.setSelectedGene(geneName);

  geneModel.promiseGetGeneObject(geneName).then(function(theGeneObject) {

      // We have successfully return the gene model data.
      // Load all of the tracks for the gene's region.
      window.gene = theGeneObject;

      if (!validateGeneTranscripts()) {
        return;
      }

      adjustGeneRegion(window.gene);

      window.selectedTranscript = geneModel.geneToLatestTranscript[window.gene.gene_name];

      util.updateUrl('gene', window.gene.gene_name);

      if (!isLevelBasic) {
        loadTracksForGene(false, function() {
          if (callbackVariantsLoaded) {
            callbackVariantsLoaded();
          }
        });
      }

      me.updateGeneInfoLink(window.gene.gene_name, function() {
      if (!hasDataSources()) {
        firstTimeGeneLoaded = false;
      }
      if (callback) {
        callback();
      }
      });
  },
  function(error) {
    alertify.alert(error)
    me.removeGeneBadgeByName(geneName);

  });
}



GenesCard.prototype.updateGeneInfoLink = function(geneName, callback) {
  var me = this;

  var setSelectedGeneLink = function(geneAnnot) {
    $('#gene-track #bloodhound #enter-gene-name').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
    $('#gene-track #gene-name').attr("href", 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + geneAnnot.name);
    $('#gene-track #gene-name').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
  }
  var geneAnnot = geneModel.geneNCBISummaries[geneName];
  if (geneAnnot == null) {
    var geneBadge = me._getGeneBadge(geneName);
    me._promiseGetGeneSummary(geneBadge, geneName).then( function(data) {
      if (data) {
        geneAnnot = data;
        setSelectedGeneLink(geneAnnot);
      }
      if (callback) {
        callback.call(me);
      }
    }, function(error) {
      console.log("error getting gene annot gene gene badge selected. " + error)
    });

  } else {
    setSelectedGeneLink(geneAnnot);
    if (callback) {
      callback.call(me);
    }
  }

}




GenesCard.prototype.showGenesSlideLeft = function() {
  var me = this;

  showSidebar('Phenolyzer');


  if (me.phenolyzerGenes && me.phenolyzerGenes.length > 0) {
    this.geneBarChart = geneListD3()
                .margin( {left:10, right: 10, top: 0, bottom: 0} )
                          .xValue( function(d){ return +d.score })
                .yValue( function(d){ return d.geneName })
                .width(isLevelEdu ? 110 : 180)
                .barHeight(14)
                .labelWidth(60)
                .gap(3)
                .on('d3click', function(phenolyzerGene) {
                  if (phenolyzerGene.selected) {
                    me.addGene(phenolyzerGene.geneName);
                    me._initPaging(me.geneNames);
                    me.highlightPhenolyzerGenes();
                  } else {
                    me.removeGeneBadgeByName(phenolyzerGene.geneName);
                    me._initPaging(me.geneNames);
                    me.highlightPhenolyzerGenes();
                  }
                  cacheHelper.showAnalyzeAllProgress();

                });
    d3.select('#phenolyzer-results svg').remove();
    var selection = d3.select('#phenolyzer-results').data([me.phenolyzerGenes]);
    this.geneBarChart(selection, {shadowOnHover:true, simpleGeneList: isLevelEdu});
  }

}


GenesCard.prototype.selectPhenolyzerGeneRange = function(addGenes=true) {
  var me = this;
  var start = 0;
  var end   = +$('#phenolyzer-select-range-end').val();

  var oldPhenoGenesToRemove = [];

  for (var i = 0; i < me.phenolyzerGenes.length; i++) {
    if (me.phenolyzerGenes[i].selected && (i < start || i >= end)) {
      oldPhenoGenesToRemove.push(me.phenolyzerGenes[i].geneName);
    }
    me.phenolyzerGenes[i].selected = false;
  }
  for (var i = start; i < end; i++) {
    me.phenolyzerGenes[i].selected = true;
  }

  me.geneNames = me.geneNames.filter(function(geneName) {
    // keep genes not in the list of old pheno genes that
    // are no longer in the selected range
    return oldPhenoGenesToRemove.indexOf(geneName) < 0;
  });

  var selection = d3.select('#phenolyzer-results').data([me.phenolyzerGenes]);
  this.geneBarChart(selection, {shadowOnHover:false});

  if (addGenes) {
    this.refreshSelectedPhenolyzerGenes();
  }
}

GenesCard.prototype.deselectPhenolyzerGenes = function() {
  var me = this;
  for (var i = 0; i < me.phenolyzerGenes.length; i++) {
    if (me.phenolyzerGenes[i].selected) {
      me.removeGeneBadgeByName(me.phenolyzerGenes[i].geneName, false, false);
    }
    me.phenolyzerGenes[i].selected = false;
  }
  var selection = d3.select('#phenolyzer-results').data([me.phenolyzerGenes]);
  this.geneBarChart(selection, {shadowOnHover:false});

  me.sortGenes();


}

GenesCard.prototype.formatGeneDescriptionHTML = function(title, description) {
  var html = "";
  html += "<div style='text-align:center;'>NCBI summary</div>";
  html += "<div style='text-align:center;padding-bottom:4px;'>";
  html += "  <span style='font-weight:bold'>" + title + "</span>";
  html += "</div>";
  html += "<div style='text-align:left'>";
  html += description;
  html += "</div>";
  return html;
}

GenesCard.prototype.formatPhenotypesHTML = function(phenotypes) {
  var html = "";
    html += "<div style='font-size:13px;font-weight:bold;text-align:center;padding-bottom:4px;'>HPO gene-to-phenotype</div>";
  if (phenotypes.length < 20) {
    phenotypes.forEach(function(phenotype) {
      html += "<div style='max-width:200px'>";
      html += phenotype.hpo_term_name;
      html += "</div>";

    });
    return {width: 200, html: html};
  } else {
    var phenotypeCols = util.splitArray(phenotypes, 4);
    phenotypeCols.forEach(function(phenotypeElements) {
      html += "<div style='float:left;max-width:130px;margin-right:5px;font-size:11px;'>";
        phenotypeElements.forEach(function(phenotype) {
          html += "<div>";
          html += phenotype.hpo_term_name;
          html += "</div>";

        });
      html += "</div>";

    });

  }

  return {width: 560, html: html};
}
