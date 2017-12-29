// Constructor
function VariantCard() {

  this.model = null;

    this.vcfChart = null;
  this.zoomRegionChart = null;
  this.bamDepthChart = null;

  this.cardSelector = null;
  this.d3CardSelector = null;
  this.cardIndex = null;
}

VariantCard.prototype.getSampleNamesToGenotype = function() {
  var sampleNames = null;
  if (this.getRelationship() == 'proband') {
    sampleNames = [];
    getAffectedInfo().forEach(function(info) {
      sampleNames.push(info.variantCard.getSampleName());
    })
  }
  return sampleNames;
}

VariantCard.prototype.getSampleIdentifier = function(sampleName) {
  return this.model.getSampleIdentifier(sampleName);
}

VariantCard.prototype.getName = function() {
  return this.model.getName();
}

VariantCard.prototype.getRelationship = function() {
  return this.model.getRelationship();
}

VariantCard.prototype.isAffected = function() {
  return this.model.isAffected();
}

VariantCard.prototype.setName = function(theName) {
  this.model.setName(theName);
}

VariantCard.prototype.setRelationship = function(theRelationship) {
  this.model.setRelationship(theRelationship);
}

VariantCard.prototype.setAffectedStatus = function(theAffectedStatus) {
  this.model.setAffectedStatus(theAffectedStatus);
}

VariantCard.prototype.setSampleName = function(sampleName) {
  this.model.setSampleName(sampleName);
  if (this.isViewable()) {
    this.setVariantCardLabel();
  }
}

VariantCard.prototype.setGeneratedSampleName = function(sampleName) {
  this.model.setGeneratedSampleName(sampleName);
}


VariantCard.prototype.getSampleName = function() {
  return this.model.getSampleName();
}

VariantCard.prototype.setDefaultSampleName = function(sampleName) {
  this.model.setDefaultSampleName(sampleName);
}

VariantCard.prototype.getDefaultSampleName = function() {
  return this.model.getDefaultSampleName();
}

VariantCard.prototype.getCardIndex = function() {
  return this.cardIndex;
}

VariantCard.prototype.isViewable = function() {
  return this.model.relationship != 'sibling';
}

VariantCard.prototype.isInheritanceLoaded = function() {
  return this.model.isInheritanceLoaded();
}

VariantCard.prototype.isReadyToLoad = function() {
  return this.model.isReadyToLoad();
}

VariantCard.prototype.isLoaded = function() {
  return this.model.isLoaded();
}

VariantCard.prototype.hasDataSources = function() {
  return this.model.isReadyToLoad();
}


VariantCard.prototype.isBamLoaded = function() {
  return this.model.isBamLoaded();
}

VariantCard.prototype.promiseVariantsHaveBeenCalled = function() {
  return this.model.promiseVariantsHaveBeenCalled();
}

VariantCard.prototype.getRelationship = function() {
  return this.model.getRelationship();
}


VariantCard.prototype.promiseSummarizeDanger = function(geneName, data, options, geneCoverageAll) {
  var me = this;
  return new Promise(function(resolve, reject) {
    var dangerSummary = VariantModel._summarizeDanger(geneName, data, options, geneCoverageAll);
    me.model.promiseCacheDangerSummary(dangerSummary, geneName).then(function() {
      resolve(dangerSummary);
    },
    function(error) {
      reject(error);
    })
  })
}

VariantCard.prototype.promiseSummarizeError = function(geneName, error) {
  var me = this;
  return new Promise(function(resolve, reject) {
    var dangerSummary = VariantModel.summarizeError(error);
    me.model.promiseCacheDangerSummary(dangerSummary, geneName)
     .then(function() {
      resolve(dangerSummary);
     },
     function(error) {
      reject(error);
     })
  })
}

VariantCard.prototype.promiseGetDangerSummary = function(geneName) {
  return this.model.promiseGetDangerSummary(geneName);
}

VariantCard.prototype.promiseIsCached = function(geneName, transcript) {
  return this.model.promiseIsCached(geneName, transcript);
}

VariantCard.prototype.hide = function() {
  this.cardSelector.addClass("hide");
}

VariantCard.prototype.isolateVariants = function(variants) {
  if (variants != null && variants.length > 0) {
    this.d3CardSelector.selectAll("#vcf-variants .variant")
        .style("opacity", .1);
    this.d3CardSelector.selectAll("#vcf-variants .variant")
        .filter( function(d,i) {
          var found = false;
          variants.forEach(function(variant) {
              if (d.start == variant.start
                && d.end == variant.end
                && d.ref == variant.ref
                && d.alt == variant.alt
                && d.type.toLowerCase() == variant.type.toLowerCase()) {
                found = true;
              }
          });
          return found;
         })
         .style("opacity", 1);

    this.d3CardSelector.selectAll("#fb-variants .variant")
        .style("opacity", .1);
    this.d3CardSelector.selectAll("#fb-variants .variant")
        .filter( function(d,i) {
          var found = false;
          variants.forEach(function(variant) {
              if (d.start == variant.start
                && d.end == variant.end
                && d.ref == variant.ref
                && d.alt == variant.alt
                && d.type.toLowerCase() == variant.type.toLowerCase()) {
                found = true;
              }
          });
          return found;
         })
         .style("opacity", 1);
  } else {
    this.d3CardSelector.selectAll("#vcf-variants .variant")
          .style("opacity", 1);
      this.d3CardSelector.selectAll("#fb-variants .variant")
          .style("opacity", 1);
  }

}


VariantCard.prototype.init = function(cardSelector, d3CardSelector, cardIndex) {
  var me = this;

  // init model
  if (this.model == null) {
    this.model = new VariantModel();
  }
  this.model.init();

  this.cardIndex = cardIndex;

  if (this.isViewable()) {
    this.cardSelector = cardSelector;
    this.d3CardSelector = d3CardSelector;


    // If the we are in guided tour mode, then clicking anywhere in the variant card unlocks
    // any locked variant.
    if (isLevelEdu) {
      me.cardSelector.on('click', function() {
        //me.unpin();

      });
    }

    this.cardSelector.find('#variant-panel').attr("id", "variant-panel-" + cardIndex);


    // This is an x-axis for the selected region
    this.zoomRegionChart = geneD3()
            .widthPercent("100%")
            .heightPercent("100%")
            .width($('#container').innerWidth())
            .margin({top: 0, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 18, left: isLevelBasic || isLevelEdu ? 9 : 4})
            .showXAxis(true)
            .showBrush(false)
            .trackHeight(isLevelEdu || isLevelBasic ? 32 : 16)
            .cdsHeight(isLevelEdu || isLevelBasic ? 24 : 12)
            .showLabel(false)
            .featureClass( function(d,i) {
              return d.feature_type.toLowerCase() + (d.danger[me.getRelationship()] ? " danger" : "");
            })
            .on("d3featuretooltip", function(featureObject, feature, tooltip, lock=false, onClose=null) {
            me.showExonTooltip(featureObject, feature, tooltip, lock, onClose);
            })




    // Create the coverage chart
    this.bamDepthChart = lineD3()
                        .width($('#container').innerWidth())
                        .height( 50 )
                        .widthPercent("100%")
                        .heightPercent("100%")
                        .kind("area")
              .margin( {top: 22, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 20, left: isLevelBasic || isLevelEdu ? 9 : 4} )
              .showXAxis(true)
              .showYAxis(true)
              .yAxisLine(false)
              .yTicks(3)
              .yTickFormat(function(val) {
                if (val == 0) {
                  return "";
                } else {
                  return val + "x";
                }
              })
              .regionGlyph(function(d,i,regionX) {
                var parent = d3.select(this.parentNode);
                var exonId = 'exon' + d.exon_number.replace("/", "-");
                if (parent.select("g#" + exonId).empty()) {
                    parent.append('g')
                          .attr("id", exonId)
                          .attr('class',      'region-glyph coverage-problem-glyph')
                          .attr('transform',  'translate(' + (regionX - 12) + ',-16)')
                          .data([d])
                          .append('use')
                          .attr('height',     '22')
                          .attr('width',      '22')
                          .attr('href', '#long-arrow-down-symbol')
                          .attr('xlink','http://www.w3.org/1999/xlink')
                          .data([d]);
                }
              })
              .showTooltip(true)
              .pos( function(d) { return d[0] })
                .depth( function(d) { return d[1] })
                .formatCircleText( function(pos, depth) {
                  return depth + 'x' ;
                })
                .on("d3regiontooltip", function(featureObject, feature, tooltip, lock, onClose) {
                me.showExonTooltip(featureObject, feature, tooltip, lock, onClose);
                })
                .on("d3horizontallineclick", function(label) {
                showSidebar('Filter')
                  $('#filter-track #coverage-thresholds').addClass('attention');
                })


    // Create the vcf track
    this.vcfChart = variantD3()
            .width($('#container').innerWidth())
            .margin({top: 0, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 5, left: isLevelBasic || isLevelEdu ? 9 : 4})
            .showXAxis(true)
            .xTickFormat(function(val) {
              return "";
            })
            .variantHeight(isLevelEdu  || isLevelBasic ? EDU_TOUR_VARIANT_SIZE : 8)
            .verticalPadding(2)
            .showBrush(false)
            .tooltipHTML(variantTooltip.formatContent)
            .on("d3rendered", function() {

            })
            .on('d3click', function(d) {
              if (d != clickedVariant) {
                clickedVariant = isLevelBasic ? null : d;
                clickedVariantCard = me;
                me.showCoverageCircle(d, me);
                window.showCircleRelatedVariants(d, me);
              } else {
                me.unpin();
              }
          })
            .on('d3mouseover', function(d) {
              if (clickedVariant == null) {
                me.showCoverageCircle(d, me);
                window.showCircleRelatedVariants(d, me);
              }
          })
          .on('d3mouseout', function() {
            if (clickedVariant == null) {
              hideCoordinateFrame();
              me.hideCoverageCircle();
              window.hideCircleRelatedVariants();
              matrixCard.clearSelections();
            }

          });
    this.vcfChart.clazz(this.getDefaultVariantColorClass());

    // The 'missing variants' chart, variants that freebayes found that were not in orginal
    // variant set from vcf
    this.fbChart = variantD3()
            .width($('#container').innerWidth())
            .margin({top: 0, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 5, left: isLevelBasic || isLevelEdu ? 9 : 4}) // bottom margin for missing variant x when no vcf variants loaded
            .showXAxis(false)
            .variantHeight(8)
            .verticalPadding(2)
            .showBrush(false)
            .tooltipHTML(variantTooltip.formatContent)
            .on("d3rendered", function() {

            })
            .on('d3click', function(d) {
              if (d != clickedVariant) {
                clickedVariant = isLevelBasic ? null : d;
                clickedVariantCard = me;
                me.showCoverageCircle(d, me);
                window.showCircleRelatedVariants(d, me);
              } else {
                me.unpin();
              }
          })
            .on('d3mouseover', function(d) {
            if (clickedVariant == null) {
                me.showCoverageCircle(d, me);
                window.showCircleRelatedVariants(d, me);
              }

          })
          .on('d3mouseout', function() {
            if (clickedVariant == null) {
              me.hideCoverageCircle();
              window.hideCircleRelatedVariants();
              matrixCard.clearSelections();
            }
          });
    this.fbChart.clazz(this.getDefaultVariantColorClass());


    this.cardSelector.find('#shrink-button').on('click', function() {
      me.shrinkCard(true);
    });
    this.cardSelector.find('#expand-button').on('click', function() {
      me.shrinkCard(false);
    });
    this.cardSelector.find('#minimize-button').on('click', function() {
      me.minimizeCard(true);
    });


    // Listen for side bar open and close events and adjust the position
    // of the tooltip and the variant circle if a variant is 'locked'.
    $('#slider-left').on("open", function() {
      if (clickedVariant) {
        me.adjustTooltip(clickedVariant);
      }
    });
    $('#slider-left').on("close", function() {
      if (clickedVariant) {
        me.adjustTooltip(clickedVariant);
      }
    });


  }


};



VariantCard.prototype.showExonTooltip = function(featureObject, feature, tooltip, lock, onClose) {
  var me = this;


  if (lock) {
    tooltip.style("pointer-events", "all");
  } else {
    tooltip.style("pointer-events", "none");
  }

  var coverageRow = function(fieldName, coverageVal, covFields) {
    var row = '<div>';
    row += '<span style="padding-left:10px;width:60px;display:inline-block">' + fieldName   + '</span>';
    row += '<span style="width:40px;display:inline-block">' + d3.round(coverageVal) + '</span>';
    row += '<span class="' + (covFields[fieldName] ? 'danger' : '') + '">' + (covFields[fieldName] ? covFields[fieldName]: '') + '</span>';
    row += "</div>";
    return row;
  }

  var html = '<div>'
           + '<span id="exon-tooltip-title"' + (lock ? 'style="margin-top:8px">' : '>') + (feature.hasOwnProperty("exon_number") ? "Exon " + feature.exon_number : "") + '</span>'
           + (lock ? '<a href="javascript:void(0)" id="exon-tooltip-close">X</a>' : '')
           + '</div>';
    html     += '<div style="clear:both">' + feature.feature_type + ' ' + addCommas(feature.start) + ' - ' + addCommas(feature.end) + '</div>';
    if (feature.geneCoverage && feature.geneCoverage[me.getRelationship()]) {
      var covFields = filterCard.whichLowCoverage(feature.geneCoverage[me.getRelationship()]);
      html += "<div style='margin-top:4px'>" + "Coverage:"
           +  coverageRow('min',    feature.geneCoverage[me.getRelationship()].min, covFields)
           +  coverageRow('median', feature.geneCoverage[me.getRelationship()].median, covFields)
           +  coverageRow('mean',   feature.geneCoverage[me.getRelationship()].mean, covFields)
           +  coverageRow('max',    feature.geneCoverage[me.getRelationship()].max, covFields)
           +  coverageRow('sd',     feature.geneCoverage[me.getRelationship()].sd, covFields)

    }
    if (lock) {
      html += '<div style="text-align:right;margin-top:8px">'
      + '<a href="javascript:void(0)" id="exon-tooltip-thresholds" class="danger" style="float:left"  >Set cutoffs</a>'
      + '</div>'
    }
    tooltip.html(html);
    if (lock) {
      tooltip.select("#exon-tooltip-thresholds").on("click", function() {
        showSidebar('Filter')
        $('#filter-track #coverage-thresholds').addClass('attention');
      })
      if (onClose) {
        tooltip.select("#exon-tooltip-close").on("click", function() {
          if (onClose) {
            onClose();
          }
        })
      }
    }

    var coord = getTooltipCoordinates(featureObject.node(), tooltip, true);
    tooltip.style("left", coord.x + "px")
           .style("text-align", 'left')
           .style("top", (coord.y-60) + "px");
  tooltip.transition()
           .duration(200)
           .style("opacity", .9);
}


VariantCard.prototype.onBamFilesSelected = function(event, callback) {
  this.model.promiseBamFilesSelected(event).then( function(fileName) {
    callback(fileName);
  });
}

VariantCard.prototype.onBamUrlEntered = function(bamUrl, baiUrl, callback) {
  this.model.onBamUrlEntered(bamUrl, baiUrl, function(success) {
    if (success) {
      if (bamUrl == null || bamUrl.trim() == "") {
        this.cardSelector.find("#bam-track").addClass("hide");
        this.cardSelector.find(".covloader").addClass("hide");
        this.cardSelector.find(".fbloader").addClass("hide");
        this.cardSelector.find('#zoom-region-chart').addClass("hide");

        this.cardSelector.find("#fb-chart-label").addClass("hide");
        this.cardSelector.find("#fb-separator").addClass("hide");
        this.cardSelector.find("#fb-variants").addClass("hide");
        this.cardSelector.find("#called-variant-count").text("");
      }
    }
    if (callback) {
      callback(success);
    }

  });
}

VariantCard.prototype.onVcfFilesSelected = function(event, callback, callbackError) {
  var me = this;
  if (this.isViewable()) {
    this.cardSelector.find('#vcf-track').removeClass("hide");
    this.cardSelector.find('#vcf-variants').css("display", "none");
    this.cardSelector.find(".vcfloader").addClass("hide");
    this.cardSelector.find(".fbloader").addClass("hide");
  }
  this.model.promiseVcfFilesSelected(event)
            .then(function(resolveObject) {
        me.cardSelector.find('#vcf-name').text(resolveObject.fileName);
        callback(resolveObject.fileName, resolveObject.sampleNames);
            },
            function(error) {
        if (callbackError) {
          callbackError(error);
        }
            });

}

VariantCard.prototype.clearVcf = function() {
  this.model.clearVcf(this.cardIndex);

  this.cardSelector.find('#vcf-track').addClass("hide");
  this.cardSelector.find('#vcf-variants').css("display", "none");
  this.cardSelector.find(".vcfloader").addClass("hide");
  this.cardSelector.find(".fbloader").addClass("hide");
  this.cardSelector.find('#vcf-variant-card-label').text("");
  this.cardSelector.find('#gene-box').text("");
  this.cardSelector.find('#gene-box').css("visibility", "hidden");


  this.cardSelector.find('#vcf-variant-count-label').addClass("hide");
  this.cardSelector.find('#vcf-variant-count').text("");
  this.cardSelector.find('#called-variant-count-label').addClass("");
  this.cardSelector.find('#called-variant-count').text("");
}

VariantCard.prototype.clearBam = function() {
  this.model.clearBam(this.cardIndex);
  this.cardSelector.find('#bam-track').addClass("hide");
}


VariantCard.prototype.onVcfUrlEntered = function(vcfUrl, tbiUrl, callback) {
  var me = this;
  if (me.isViewable()) {
    me.cardSelector.find('#vcf-track').removeClass("hide");
    me.cardSelector.find('#vcf-variants').css("display", "none");
    me.cardSelector.find(".vcfloader").addClass("hide");
    me.cardSelector.find(".fbloader").addClass("hide");

  }
  this.model.onVcfUrlEntered(vcfUrl, tbiUrl,
    function(success, samples) {
      callback(success, samples);
    });
}


VariantCard.prototype.showDataSources = function(dataSourceName) {
  this.model.setName(dataSourceName);
  $('#add-datasource-container').css('display', 'none');

    var title = isLevelBasic && this.model.getRelationship() == "proband" ? "" : this.model.getRelationship();
    if (!isLevelBasic) {
      if (title == null || title == '' || title == 'NONE') {
      title = 'Sample';
    }
    }

  this.setVariantCardLabel();
    this.cardSelector.find('#card-relationship-label').text(title);
    if (window.gene) {
      this.cardSelector.find('#gene-box').text('GENE ' + window.gene.gene_name);
    }

}

VariantCard.prototype.setVariantCardLabel = function() {

  if (isLevelEdu) {
    this.cardSelector.find('#variant-card-label').text(this.model.getName() + "'s Variants"  );
  } else if (isLevelBasic) {
    this.cardSelector.find('#variant-card-label').text(this.model.getName());
  } else {
    var label = "";
    if (this.getRelationship() == 'known-variants') {
      label = "CLINVAR VARIANTS"
      this.cardSelector.find('#card-relationship-label').text("");
    } else if (this.model.isGeneratedSampleName) {
      label = this.model.getName();
    } else {
      label =
          this.model.getName() == this.model.getSampleName()  ?
            this.model.getName() :
            this.model.getSampleName() + " " + this.model.getName()
    }

    this.cardSelector.find('#variant-card-label').text(label);
  }

}


VariantCard.prototype.loadBamDataSource = function(dataSourceName, callback) {
  var me = this;
  this.model.loadBamDataSource(dataSourceName, function() {
    me.showDataSources(dataSourceName);

    me.fillZoomRegionChart();

    callback();
  });
}

VariantCard.prototype.shrinkCard = function(shrink) {

  this.minimizeCard(false);
  this.d3CardSelector.select('#variant-right-labels').classed("hide", shrink);
  this.d3CardSelector.select('#vcf-chart-label').classed("hide", shrink);
  this.d3CardSelector.select('#variant-right-labels').classed("hide", shrink);

  this.d3CardSelector.select('#zoom-region-chart').classed("hide", shrink);
  this.d3CardSelector.select('#bam-track').classed("hide", shrink);

  this.cardSelector.css("padding-bottom", shrink ? "4px" : "10px");

  this.d3CardSelector.select('#shrink-button').classed("disabled", shrink);
  this.d3CardSelector.select('#expand-button').classed("disabled", !shrink);
  this.d3CardSelector.select('#minimize-button').classed("disabled", false);

}

VariantCard.prototype.minimizeCard = function(minimize) {
  this.d3CardSelector.select('#variant-right-labels').classed("hide", minimize);
  this.d3CardSelector.select('#vcf-chart-label').classed("hide", minimize);
  this.d3CardSelector.select('#variant-right-labels').classed("hide", minimize);

  this.d3CardSelector.select('#variant-panel-' + this.cardIndex).classed("hide", minimize);
  this.cardSelector.css("padding-bottom", minimize ? "4px" : "10px");

  this.d3CardSelector.select('#shrink-button').classed("disabled", false);
  this.d3CardSelector.select('#expand-button').classed("disabled", false);
  this.d3CardSelector.select('#minimize-button').classed("disabled", true);
}

VariantCard.prototype.clearBamChart = function() {
  this.cardSelector.find("#bam-depth svg").remove();
  this.cardSelector.find('#bam-depth').css("visibility", "hidden");
  this.cardSelector.find('#bam-chart-label').css("visibility", "hidden");
  this.cardSelector.find('#bam-chart-label').css("margin-bottom", "0px");
  this.cardSelector.find('#fb-chart-label').addClass("hide");
  this.cardSelector.find('#fb-separator').addClass("hide");
}

VariantCard.prototype.showBamProgress = function(message) {
  this.cardSelector.find("#bam-track").removeClass("hide");
  this.cardSelector.find(".covloader").removeClass("hide");
  this.cardSelector.find(".covloader .loader-label").text(message);
  this.cardSelector.find("#bam-depth").css("visibility", "hidden");
  this.cardSelector.find("#bam-chart-label").css("visibility", "hidden");
  this.cardSelector.find("#bam-chart-label").css("margin-bottom", "0px");
}

VariantCard.prototype.endBamProgress = function() {
  this.cardSelector.find("#bam-track").removeClass("hide");
  this.cardSelector.find(".covloader").addClass("hide");
  this.cardSelector.find(".covloader .loader-label").text("");

}

VariantCard.prototype.endVariantProgress = function() {
  this.cardSelector.find(".vcfloader").addClass("hide");
}



VariantCard.prototype.clearWarnings = function() {
  this.cardSelector.find("#multiple-sample-warning").addClass("hide");
  this.cardSelector.find('#no-variants-warning').addClass("hide");
  this.cardSelector.find('#clinvar-warning').addClass("hide");
  this.cardSelector.find('#no-ref-found-warning').addClass("hide");
  this.cardSelector.find('#error-warning').addClass("hide");
}

/*
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
VariantCard.prototype.promiseShowVariants = function () {
  var me = this;

  return new Promise( function(resolve, reject) {

    // Clear out previous variant data and set up variant card
    // to show that loading messages.
    if (me.isViewable()) {

      // Load the variant chart.
      me._showVariants(regionStart, regionEnd,
      function() {
        readjustCards();
        resolve();
      },
      true);
    } else {
      resolve();
    }


  });


}


VariantCard.prototype.prepareToShowVariants = function() {
  var me = this;

  me.cardSelector.removeClass("hide");

  // Reset any previous locked variant
  clickedVariant = null;
  clickedVariantCard = null;
  me.unpin();


  // Clear out the previous gene's data
  me.model.wipeGeneData();

  me.cardSelector.find(".filter-flag").addClass("hide");
  me.clearWarnings();

  if (me.isViewable()) {
    //filterCard.clearFilters();

    me.fillZoomRegionChart();


      me.cardSelector.find('#displayed-variant-count-label').addClass("hide");
      me.cardSelector.find('#displayed-variant-count-label-simple').css("visibility", "hidden");
      me.cardSelector.find('#displayed-variant-count-label-basic').addClass("hide");
      me.cardSelector.find('#displayed-variant-count').text("");
      me.cardSelector.find('#vcf-variant-count-label').addClass("hide");
      me.cardSelector.find('#vcf-variant-count').text("");
      me.cardSelector.find('#called-variant-count-label').addClass("hide");
      me.cardSelector.find('#called-variant-count').text("");
      me.cardSelector.find('#coverage-problem-alert').addClass("hide");
      me.cardSelector.find('#gene-box').text("");
      me.cardSelector.find('#gene-box').css("visibility", "hidden");
      if (isLevelEdu && eduTourNumber == "1") {
        me.cardSelector.find("#gene-box").addClass("deemphasize");
      }



    me.cardSelector.find('#vcf-track').removeClass("hide");
    me.cardSelector.find('#vcf-variants').css("display", "none");
    me.cardSelector.find('#vcf-chart-label').addClass("hide");
    me.cardSelector.find('#vcf-name').addClass("hide");

    me.cardSelector.find('#fb-variants').addClass("hide");

    if (me.getRelationship() == 'proband') {
      $("#feature-matrix").addClass("hide");
      $("#feature-matrix-note").addClass("hide");
      $('#move-rows').addClass("hide");
    }

    if (me.model.isVcfLoaded()) {
      me.cardSelector.find(".vcfloader").removeClass("hide");
      me.cardSelector.find(".vcfloader .loader-label").text("Loading variants for gene")
    } else {
      $("#filter-and-rank-card").addClass("hide");
    }
  }
}


VariantCard.prototype.onBrush = function(brush, callback) {
  var me = this;
  if (brush.empty()) {
    this.cardSelector.find("#region-flag").addClass("hide");
    // Only remove if no other filter flags are on
    if (this.cardSelector.find(".filter-flag.hide").length == this.cardSelector.find(".filter-flag").length) {
      this.cardSelector.find('#displayed-variant-count-label').addClass("hide");
      this.cardSelector.find("#displayed-variant-count").addClass("hide");
        this.cardSelector.find('#displayed-variant-count-label-simple').css("visibility", "hidden");
        this.cardSelector.find('#displayed-variant-count-label-basic').addClass("hide");
    }
  } else {
    this.cardSelector.find("#region-flag").removeClass("hide");
    this.cardSelector.find('#displayed-variant-count-label').removeClass("hide");
    this.cardSelector.find("#displayed-variant-count").removeClass("hide");
    this.cardSelector.find('#displayed-variant-count-label-simple').css("visibility", "visible");
    if (isLevelBasic) {
      this.cardSelector.find('#displayed-variant-count-label-basic').removeClass("hide");
    }


  }

  // Filter the gene model to only show 'features' in selected region
  var filteredTranscript =  $.extend({}, window.selectedTranscript);
  filteredTranscript.features = window.selectedTranscript.features.filter(function(d) {
      var inRegion = (d.start >= regionStart && d.start <= regionEnd)
                         || (d.end >= regionStart && d.end <= regionEnd) ;
          return inRegion;

  });


  this.fillZoomRegionChart(filteredTranscript, !brush.empty() ? regionStart : window.gene.start, !brush.empty() ? regionEnd : window.gene.end);


  this.cardSelector.find('#vcf-track').removeClass("hide");
  this.cardSelector.find('#vcf-variants').css("display", "block");
  this.cardSelector.find(".vcfloader").addClass("hide");
  this.cardSelector.find(".fbloader").addClass("hide");
  this.cardSelector.find('#vcf-name').removeClass("hide");

  this._showBamDepth(regionStart, regionEnd);
  this.highlightLowCoverageRegions(window.selectedTranscript,regionStart, regionEnd, filterCard.geneCoverageMedian);

  this._showVariants(regionStart, regionEnd,
    function() {
      me.promiseFilterAndShowCalledVariants(regionStart, regionEnd)
       .then(function(data) {
        if (callback) {
          callback();
        }
       })
    },
    null, true);
}


VariantCard.prototype.promiseLoadBamDepth = function() {
  var me = this;

  return new Promise( function(resolve, reject) {
    if (!me.model.isBamLoaded()) {
      resolve(null);
    }

    me.model.promiseGetBamData(window.gene)
     .then(function(coverage) {
      if (coverage != null) {
        genesCard.hideGeneBadgeLoading(window.gene.gene_name);
        resolve(coverage);
      } else {
        // If we have variant, get coverage for every variant
        me.showBamProgress("Calculating coverage");
        me.model.getBamDepth(window.gene, window.selectedTranscript, function(coverageData) {
          me.endBamProgress();
          genesCard.hideGeneBadgeLoading(window.gene.gene_name);
          resolve(coverageData);
        });
      }

     },
     function(error) {
      var msg = "A problem occurred in VariantCard.promiseLoadBamDepth(): " + error;
      reject(msg);
     })
  });

}

VariantCard.prototype.showBamDepth = function(maxDepth, callbackDataLoaded) {
  this._showBamDepth(regionStart, regionEnd, maxDepth, callbackDataLoaded);
}

VariantCard.prototype.highlightLowCoverageRegions = function(transcript, regionStart, regionEnd) {
  var me = this;
  if (this.model.isBamLoaded()) {
    var dangerRegions = [];
    transcript.features
          .filter( function(feature) {
              var meetsRegion = true;
              if (regionStart && regionEnd) {
                meetsRegion = feature.start >= regionStart && feature.end <= regionEnd;
              }
            return meetsRegion && feature.feature_type == 'CDS' || feature.feature_type == 'UTR';
          })
          .forEach(function(feature) {
            if (feature.danger[me.getRelationship()]) {
              dangerRegions.push(feature)
            }
          })
    this.bamDepthChart.highlightRegions(dangerRegions, {}, regionStart, regionEnd, filterCard.geneCoverageMedian);
    this.d3CardSelector.select('#coverage-problem-alert').classed("hide", dangerRegions.length == 0);
  }
}

VariantCard.prototype._showBamDepth = function(regionStart, regionEnd, maxDepth, callbackDataLoaded) {
  var me = this;

  filterCard.enableCoverageFilters();

  if (!this.model.isBamLoaded()) {
    // We can still apply the filter coverage if the vcf has the read depth in the
    // genotype field, so go ahead and show the coverage range filter.
    this.cardSelector.find("#bam-track").addClass("hide");
    filterCard.enableCoverageFilters();
    if (callbackDataLoaded) {
      callbackDataLoaded(me);
    }
    return;
  }

  this.cardSelector.find("#bam-depth").css("visibility", "visible");
  this.cardSelector.find("#bam-chart-label").css("visibility", "visible");
  this.cardSelector.find("#bam-chart-label").css("margin-bottom", "-12px");


  if (this.isViewable()) {
    this.cardSelector.removeClass("hide");
  }

  this.model.promiseGetBamData(window.gene)
   .then(function(coverage){
    me.model.promiseGetVcfData(window.gene, selectedTranscript)
     .then(function(data) {
      var theVcfData = data.vcfData;
      if (coverage != null) {
        me.endBamProgress();
        if (regionStart && regionEnd) {
          var filteredData = me.model.filterBamDataByRegion(coverage, regionStart, regionEnd);
          me._fillBamChart(filteredData, regionStart, regionEnd, maxDepth);
        } else {
          me._fillBamChart(coverage, window.gene.start, window.gene.end, maxDepth);
        }

        if (callbackDataLoaded) {
              callbackDataLoaded(me);
            }
      } else {

        // If we have variants, get coverage for every variant
        me.showBamProgress("Calculating coverage");


        me.model.getBamDepth(window.gene, window.selectedTranscript, function(coverageData) {
          me.endBamProgress();
          me._fillBamChart(coverageData, window.gene.start, window.gene.end, maxDepth);

          if (callbackDataLoaded) {
                callbackDataLoaded(me);
              }

        });

      }

     })


   },
   function(error) {
    me.endBamProgress();
    console.log("A problem occurred in VariantCard._showBamDepth(): " + error);
   });


}

VariantCard.prototype.fillZoomRegionChart = function(filteredTranscript, start, end) {
  var me = this;

  var theTranscript = filteredTranscript ? filteredTranscript : window.selectedTranscript;
  var start = start ? start : window.gene.start;
  var end   = end   ? end   : window.gene.end;


  if (me.getRelationship() == 'known-variants' || me.model.isBamLoaded() || me.model.isVcfLoaded()) {

    // Workaround.  For some reason, d3 doesn't clean up previous transcript
    // as expected.  So we will just force the svg to be removed so that we
    // start with a clean slate to avoid the bug where switching between transcripts
    // resulted in last transcripts features not clearing out.
    me.d3CardSelector.select('#zoom-region-chart svg').remove();
    me.cardSelector.find("#zoom-region-chart").removeClass("hide");

    selection = me.d3CardSelector.select("#zoom-region-chart").datum([theTranscript]);
    me.zoomRegionChart.regionStart(+start);
    me.zoomRegionChart.regionEnd(+end);
    me.zoomRegionChart(selection);

  }

    if (filteredTranscript) {
    this.d3CardSelector.select("#zoom-region-chart .x.axis .tick text").style("text-anchor", "start");
  }

}


VariantCard.prototype._fillBamChart = function(data, regionStart, regionEnd, maxDepth) {
  if (this.isViewable()) {
    // Reduce down to 1000 points
        var reducedData = this.model.reduceBamData(data, 1000);

    this.bamDepthChart.xStart(regionStart);
    this.bamDepthChart.xEnd(regionEnd);

    // Decide if we should show the x-axis.
    this.bamDepthChart.showXAxis(!(this.model.isVcfLoaded()));
    this.bamDepthChart.height(!(this.model.isVcfLoaded()) ? 75 : 55 );
    this.bamDepthChart.margin(!(this.model.isVcfLoaded()) ? {top: 16, right: 2, bottom: 20, left: 4} : {top: 16, right: 2, bottom: 0, left: 4} );

    // Detemine the y-scale be setting the maxDepth accross all samples
    if (maxDepth) {
      this.bamDepthChart.maxDepth(maxDepth);
    }

    this.bamDepthChart(this.d3CardSelector.select("#bam-depth").datum(reducedData));
    this.d3CardSelector.select("#bam-depth .x.axis .tick text").style("text-anchor", "start");

    this.bamDepthChart.showHorizontalLine(filterCard.geneCoverageMedian, "cutoff", "threshold" );
  }
}

/*
*  This method is invoked with the variants have been fully annotated, including
*  vep, clinvar, coverage (from alignments), and inheritance (for trio).
*
*/
VariantCard.prototype.promiseShowFinalizedVariants = function() {
  var me = this;

  return new Promise(function(resolve, reject) {
    me.endVariantProgress();

    me._showVariants(regionStart, regionEnd, null, false);

    me.promiseVariantsHaveBeenCalled()
    .then(function(variantsHaveBeenCalled) {
      if (me.model.getRelationship() == 'proband' && (me.model.isVcfLoaded() || (isAlignmentsOnly() && variantsHaveBeenCalled))) {
        me.promiseFillFeatureMatrix(regionStart, regionEnd).then(function() {
          resolve();
        })
      } else {
        resolve();
      }

    })


  })

}



VariantCard.prototype.promiseGetBookmarkedVariant = function(variantProxy, data, geneObject, transcriptObject) {
  var me = this;

  var resolveIt = function(resolve, theVcfData) {
    if (theVcfData == null) {
      resolve(null);
    } else {
      var theVariant = null;
      theVcfData.features.forEach( function (d) {
           if (d.start == variantProxy.start
              && d.ref == variantProxy.ref
              && d.alt == variantProxy.alt) {
              theVariant = d;
           }
        });
        resolve(theVariant);
    }
  }

  return new Promise(function(resolve, reject) {
    geneObject = geneObject ? geneObject : window.gene;
    transcriptObject = transcriptObject ? transcriptObject: window.selectedTranscript;
    if (data != null) {
      resolveIt(resolve, data);
    } else {
      me.model.promiseGetVcfData(geneObject, transcriptObject)
       .then(function(data) {
        resolveIt(resolve, data.vcfData);
       })
    }


  });

}


VariantCard.prototype._showVariants = function(regionStart, regionEnd, onVariantsDisplayed, showTransition, isZoom) {
  var me = this;

  if (this.getRelationship() == 'known-variants' && hideKnownVariantsCard) {
    me.cardSelector.find("#variant-badges").addClass("hide");
    me.cardSelector.find('.vcfloader').addClass("hide");
    return;
  }
  if (this.getRelationship() == 'known-variants') {
    showKnownVariantsHistoChart(false);
  }


  if (this.isViewable()) {
    this.cardSelector.removeClass("hide");
    this.cardSelector.find('#vcf-track').removeClass("hide");
  }


  //this.model.promiseGetVcfData(window.gene, window.selectedTranscript)
  // .then(function(data) {
    //var theVcfData = data.vcfData;
    var theVcfData = me.model.vcfData;

    if (theVcfData) {

      // Set the current model's loaded and called variants based on the cached data.
      /*
      me.model.setLoadedVariants(theVcfData);
      if (me.model.isBamLoaded()) {
        me.model.promiseGetFbData(window.gene, window.selectedTranscript, true)
         .then(function(data) {
          var theFbData = data.fbData;
          me.model.setCalledVariants(theFbData);
          me.model.loadCalledTrioGenotypes();
         })

      }
      */


      // The user has selected a region to zoom into or the data has come back for a selected gene that
      // has now been cached.  Filter the  variants based on the selected region
      if (me.isViewable()) {
        me.cardSelector.find('.vcfloader').addClass("hide");
        me.cardSelector.find('#vcf-variant-count-label').removeClass("hide");
        me.model.promiseGetVariantCount(theVcfData)
         .then(function(count) {
              me.cardSelector.find('#vcf-variant-count').text(count);
         });

        me.clearWarnings();


        // Show the proband's (cached) freebayes variants (loaded with inheritance)
        if (me.model.isBamLoaded()) {
          me.model.promiseHasCalledVariants()
          .then(function(hasCalledVariants) {
            if (hasCalledVariants) {
              me.cardSelector.find('#called-variant-count-label').removeClass("hide");
              me.cardSelector.find('#called-variant-count').removeClass("hide");
              me.model.promiseGetCalledVariantCount().then(function(count) {
                me.cardSelector.find('#called-variant-count').text(count);
              })

            } else {
              me.model.promiseVariantsHaveBeenCalled()
              .then(function(variantsHaveBeenCalled) {
                if (variantsHaveBeenCalled) {
                  // If call variants has occurred but 0 variants returned.
                  me.cardSelector.find('#called-variant-count-label').removeClass("hide");
                  me.cardSelector.find('#called-variant-count').removeClass("hide");
                  me.cardSelector.find('#called-variant-count').text("0");
                }

              })
            }

            me.promiseFilterAndShowCalledVariants();

           })
        }

        me.populateRecFilters(theVcfData);
        if (!isZoom) {
          filterCard.autoSetFilters();
        }
        if (me.getRelationship() == 'proband') {
          me.model.pruneIntronVariants(theVcfData);
          }

          // Filter variants runs filter and then fills the variant chart.
        me.promiseFilterAndShowLoadedVariants(theVcfData, showTransition)
         .then(function(filteredVcfData) {

          me.cardSelector.find('#gene-box').css("visibility", "visible");
          me.cardSelector.find('#gene-box').text('GENE ' + window.gene.gene_name);

          // Now enable the filter controls that apply for the variants of this sample
          filterCard.enableVariantFilters(true);

          if (onVariantsDisplayed) {
                onVariantsDisplayed();
              }
              if (me.getRelationship() == 'proband') {
                genesCard.hideGeneBadgeLoading(window.gene.gene_name);
              }
         })


      }


    } else {
      genesCard._geneBadgeLoading(window.gene.gene_name, false);
    }

  //});

}




VariantCard.prototype._fillVariantChart = function(data, regionStart, regionEnd, bypassFeatureMatrix, showTransition) {

  if (bypassFeatureMatrix == null) {
    bypassFeatureMatrix = false;
  }

  if (data == null || data.features == null) {
    return;
  }

  if (this.getRelationship() == 'known-variants' && hideKnownVariantsCard) {
    return;
  }

  $('#vcf-legend').css("display", "block");
  this.cardSelector.find('#vcf-chart-label').removeClass("hide");
  this.cardSelector.find('#vcf-name').removeClass("hide");
  this.cardSelector.find('#vcf-variants').css("display", "inline");

  this.vcfChart.regionStart(regionStart);
  this.vcfChart.regionEnd(regionEnd);

  // Set the vertical layer count so that the height of the chart can be recalculated
  if (data.maxLevel == null) {
    data.maxLevel = d3.max(data.features, function(d) { return d.level; });
  }
  this.vcfChart.verticalLayers(data.maxLevel);
  this.vcfChart.lowestWidth(data.featureWidth);

  // Filter out freebayes data for showing in variant chart since these variants
  // show in there own chart above the loaded variants.
  var dataWithoutFB = $.extend({}, data);
  //if (bypassFeatureMatrix) {
    dataWithoutFB.features = data.features.filter( function(feature) {
      return feature.fbCalled == null;
     });
  //}

  // Load the chart with the new data
  var selection = this.d3CardSelector.select("#vcf-variants").datum([dataWithoutFB]);
  this.vcfChart.showTransition(showTransition);
    this.vcfChart(selection);


    if (isLevelEdu && eduTourNumber == "2") {
    this.cardSelector.find('#zoom-region-chart').addClass("hide");
    } else {
    this.cardSelector.find('#zoom-region-chart').removeClass("hide");
    }

  resizeCardWidths();

  if (this.getRelationship() == 'proband' && data.features.length > 0) {
      $('#filter-and-rank-card').removeClass("hide");
      $('#matrix-track').removeClass("hide");
  }

    this.d3CardSelector.select("#vcf-variants .x.axis .tick text").style("text-anchor", "start");


    // Fill in the feature matrix for the proband variant card.
    if (!bypassFeatureMatrix) {
      if ( this.getRelationship() == 'proband') {
        window.matrixCard.setFeatureMatrixSource(data);
      }
  }

  bookmarkCard.flagBookmarks(getProbandVariantCard(), window.gene, window.selectedTranscript);



}

VariantCard.prototype._displayRefNotFoundWarning = function() {
  this.cardSelector.find('#vcf-track').addClass("hide");
  this.cardSelector.find(".vcfloader").addClass("hide");
  $('#matrix-track').addClass("hide");
  this.cardSelector.find('#no-ref-found-warning #message').text("Unable to find reference " + window.gene.chr + " in vcf header.");
  this.cardSelector.find('#no-ref-found-warning').removeClass("hide");

  //filterCard.clearFilters();
}


VariantCard.prototype.promiseFillFeatureMatrix = function(regionStart, regionEnd) {
  var me = this;

  return new Promise(function(resolve, reject) {
    // Don't show the feature matrix (rank card) if there are no variants for the proband
    //me.model.promiseGetVcfData(window.gene, window.selectedTranscript).then(function(data) {
      //var theVcfData = data.vcfData;
      var theVcfData = me.vcfData;

      // If only alignments provided, only show feature matrix if variants have been called.
      if (isAlignmentsOnly() && (theVcfData == null || theVcfData.features.length == 0)) {
        if (!theVcfData || !theVcfData.loadState || !theVcfData.loadState['called']) {
          $('#matrix-track').addClass("hide");
          me.cardSelector.find('#vcf-variant-count-label').addClass("hide");
          me.cardSelector.find("#vcf-variant-count").text("");
          resolve();
        }
      }


      $('#filter-and-rank-card').removeClass("hide");
      $('#matrix-track').removeClass("hide");
      if (firstTimeShowVariants) {
        firstTimeShowVariants = false;
      }

      // Show called variants
      me.promiseFilterAndShowCalledVariants().then(function() {
        // Show feature matrix
        me._promiseFilterVariants().then(function(filteredVcfData) {
          window.matrixCard.promiseFillFeatureMatrix(filteredVcfData).then(function() {
            resolve();
          })
        });

      })

    //})

  })
}

VariantCard.prototype.sortFeatureMatrix = function() {
  var me = this;

  if (this.model.isVcfLoaded() ) {
    me.promiseFilterAndShowLoadedVariants()
     .then(function(filteredVcfData) {
      window.matrixCard.fillFeatureMatrix(filteredVcfData);
     })
  }  else {
       this.promiseFilterAndShowCalledVariants()
        .then(function(filteredVcfData) {
      window.matrixCard.fillFeatureMatrix(filteredVcfData);
        });
  }


}



VariantCard.prototype._fillFreebayesChart = function(data, regionStart, regionEnd) {
  var me = this;

  if (data) {
    this.cardSelector.find('#fb-chart-label').removeClass("hide");
    if (me.model.isVcfReadyToLoad()) {
      this.cardSelector.find('#fb-separator').removeClass("hide");

    } else {
      this.cardSelector.find('#fb-separator').addClass("hide");
    }

    this.cardSelector.find('#fb-variants').removeClass("hide");

    this.fbChart.regionStart(regionStart);
    this.fbChart.regionEnd(regionEnd);

    // Set the vertical layer count so that the height of the chart can be recalculated
    this.fbChart.verticalLayers(data.maxLevel);
    this.fbChart.lowestWidth(data.featureWidth);

    this.d3CardSelector.selectAll("#fb-variants").selectAll("svg").remove();

    // Load the chart with the new data
    var selection = this.d3CardSelector.select("#fb-variants").datum([data]);
      this.fbChart(selection);

    this.cardSelector.find('.vcfloader').addClass("hide");

      this.d3CardSelector.select("#fb-variants .x.axis .tick text").style("text-anchor", "start");


  }  else {
    this.cardSelector.find('#fb-chart-label').addClass("hide");
    this.cardSelector.find('#fb-separator').addClass("hide");
    this.d3CardSelector.select('#fb-variants svg').remove();
  }



}


VariantCard.prototype.showCallVariantsProgress = function(state, message) {
  var me = this;
  if (state == 'starting') {
    if (this.isViewable() && this.isBamLoaded()) {
      this.cardSelector.find("#vcf-track").removeClass("hide");
      this.cardSelector.find(".fbloader").removeClass("hide");
      this.cardSelector.find('.fbloader .loader-label').text("Calling Variants with Freebayes");

      $('#recall-card .' + this.getRelationship() + '.covloader').removeClass("hide");
      $('#recall-card .' + this.getRelationship() + '.call-variants-count').addClass("hide");

    }
  } else if (state == 'running') {
    // After variants have been been called from alignments...
      me.cardSelector.find('.fbloader').removeClass("hide");
    me.cardSelector.find('.fbloader .loader-label').text();

  } else if (state == 'counting') {
    // After variants have been called from alignments and annotated from snpEff/VEP...
    // Show the called variant count
    me.cardSelector.find('#called-variant-count-label').removeClass("hide");
    me.cardSelector.find('#called-variant-count').removeClass("hide");
    me.model.promiseGetCalledVariantCount().then(function(count) {
      me.cardSelector.find('#called-variant-count').text(count);
    })
    me.cardSelector.find('#displayed-called-variant-count-label').addClass("hide");
    me.cardSelector.find('#displayedcalled-variant-count').addClass("hide");
    $('#recall-card .' + me.getRelationship() + '.covloader').addClass("hide");
    $('#recall-card .' + me.getRelationship() + '.call-variants-count').removeClass("hide");
    me.model.promiseGetCalledVariantCount().then(function(count) {
      $('#recall-card .' + me.getRelationship() + '.call-variants-count').text(count + " variants called for " + me.getRelationship());
    })
  } else if (state == 'done') {
    me.cardSelector.find('.fbloader').addClass("hide");
  } else if (state == 'error') {
    me.cardSelector.find('.fbloader').addClass("hide");
    $('#recall-card .' + me.getRelationship() + '.covloader').addClass("hide");
    me.cardSelector.find('#freebayes-error').removeClass("hide");
  }
}



VariantCard.prototype.getDefaultVariantColorClass = function() {
  if (this.getRelationship() == 'known-variants') {
    return filterCard.classifyByClinvar;
  } else {
    return filterCard.classifyByImpact;
  }
}

VariantCard.prototype.setVariantColorClass = function(clazz) {
  var me = this;
  this.vcfChart.clazz(me.getRelationship() == 'known-variants' ? filterCard.classifyByClinvar : clazz);
  this.fbChart.clazz(me.getRelationship() == 'known-variants' ? filterCard.classifyByClinvar : clazz);
}


VariantCard.prototype.promiseFilterAndShowCalledVariants = function(regionStart, regionEnd) {
  var me = this;
  return new Promise(function(resolve, reject) {
    //me.model.promiseHasCalledVariants()
     //.then(function(hasCalledVariants) {

      if (me.model.fbData == null || me.model.fbData.features == null) {
        me.model.reconstituteFbData(me.model.vcfData);
      }

      if (me.model.fbData && me.model.fbData.features && me.model.fbData.features.length > 0) {
        me.cardSelector.find('.fbloader').addClass("hide");

        //me.model.promiseGetFbData(window.gene, window.selectedTranscript, true)
        //.then(function(data) {
          var theFbData = me.model.fbData;
          me._promiseFilterVariants(theFbData, me.fbChart)
          .then(function(filteredFBData) {

            // Only show the 'displayed variant' count if a variant filter is turned on.  Test for
            // this by checking if the number filter flags exceed those that are hidden
            if (filterCard.hasFilters() || filterCard.hasCardSpecificFilters(me.getRelationship())) {
              me.cardSelector.find('#displayed-called-variant-count-label').removeClass("hide");
              me.cardSelector.find('#displayed-called-variant-count').removeClass("hide");
              me.cardSelector.find('#displayed-called-variant-count').text(filteredFBData.features.length);
            } else {
              me.cardSelector.find('#displayed-called-variant-count-label').addClass("hide");
              me.cardSelector.find('#displayed-called-variant-count').addClass("hide");
              me.cardSelector.find('#displayed-called-variant-count').text("");
            }
            me._fillFreebayesChart(filteredFBData,
              regionStart ? regionStart : window.gene.start,
              regionEnd ? regionEnd : window.gene.end);

            resolve(filteredFBData);

          })

        //})
      }  else {
        resolve(null);
      }
     //},
     /*function(error) {
      var msg = "VariantCard.promiseFilterAndShowCalledVariants(): " + error;
      console.log(msg);
      reject(msg);
     });*/

  });


}


VariantCard.prototype.promiseFilterAndShowLoadedVariants = function(theVcfData, showTransition) {
  var me = this;

  var resolveIt = function(resolve, theVcfData) {
    me._promiseFilterVariants(theVcfData, me.vcfChart)
     .then(function(filteredVcfData) {
      // Only show the 'displayed variant' count if a variant filter is turned on.  Test for
      // this by checking if the number filter flags exceed those that are hidden
      if (filterCard.hasFilters() || filterCard.hasCardSpecificFilters(me.getRelationship()) ) {
        me.cardSelector.find('#displayed-variant-count-label').removeClass("hide");
        me.cardSelector.find('#displayed-variant-count').removeClass("hide");
        me.model.promiseGetVariantCount(filteredVcfData)
         .then(function(count) {
          me.cardSelector.find('#displayed-variant-count').text(count);
         })
        me.cardSelector.find('#displayed-variant-count-label-simple').css("visibility", "visible");
        if (isLevelBasic) {
          me.cardSelector.find('#displayed-variant-count-label-basic').removeClass("hide");
        }
      } else {
        me.cardSelector.find('#displayed-variant-count-label').addClass("hide");
        me.cardSelector.find('#displayed-variant-count').addClass("hide");
        me.cardSelector.find('#displayed-variant-count').text("");
        me.cardSelector.find('#displayed-variant-count-label-simple').css("visibility", "hidden");
        me.cardSelector.find('#displayed-variant-count-label-basic').addClass("hide");

      }
      me._fillVariantChart(filteredVcfData, regionStart, regionEnd, null, showTransition);
      resolve(filteredVcfData);


     })

  }


  return new Promise(function(resolve, reject) {
    if (me.model.isVcfLoaded()) {
      if (theVcfData) {
        resolveIt(resolve, theVcfData);
      } else {
        me.model.promiseGetVcfData(window.gene, window.selectedTranscript)
         .then(function(data) {
          resolveIt(resolve, data.vcfData);
         });

      }
    } else {
      resolve(null);
    }
  })


}


VariantCard.prototype._promiseFilterVariants = function(dataToFilter) {
  var me = this;

  var resolveIt = function(resolve, data) {
    // Filter variants
    if (data) {
      var filterObject = filterCard.getFilterObject();
      var filteredData = me.model.filterVariants(data, filterObject, window.gene.start, window.gene.end);
      resolve(filteredData);
    } else {
      resolve(null);
    }
  }


  return new Promise(function(resolve, reject) {
    if (dataToFilter) {
      resolveIt(resolve, dataToFilter);
    } else {
      me.model.promiseGetVcfData(window.gene, window.selectedTranscript)
       .then(function(data) {
        resolveIt(resolve, data.vcfData);
       })
    }
  })



}


VariantCard.prototype.populateEffectFilters = function() {
  this.model.populateEffectFilters();
}
VariantCard.prototype.populateRecFilters = function(theVcfData) {
  this.model._populateRecFilters(theVcfData.features);
}



VariantCard.prototype.promiseCompareVariants = function(theVcfData, compareAttribute,
  matchAttribute, matchFunction, noMatchFunction ) {

  return this.model.promiseCompareVariants(theVcfData, compareAttribute,
    matchAttribute, matchFunction, noMatchFunction);
}

VariantCard.prototype.adjustTooltip = function(variant) {
  var me = this;
  // Check the fb called variants first.  If present, circle and don't
  // show X for missing variant on vcf variant chart.
  var matchingVariant = null;
  var tooltip = null;
  if (this.fbChart != null) {
    this.model.promiseHasCalledVariants()
     .then(function(isTrue) {
      if (isTrue) {
        var container = this.d3CardSelector.selectAll('#fb-variants > svg');
        matchingVariant = this.fbChart.showCircle()(variant, container, false, true);
        if (matchingVariant) {
          tooltip = this.d3CardSelector.select("#fb-variants .tooltip");
        }
      }

     })

  }
  if (this.vcfChart != null) {
    var container = this.d3CardSelector.selectAll('#vcf-variants > svg');;
    matchingVariant = this.vcfChart.showCircle()(variant, container, false, true);
    if (matchingVariant ) {
      tooltip = this.d3CardSelector.select("#vcf-variants .tooltip");
    }
  }
  if (tooltip) {
    if (tooltip.style("opacity") != 0) {
      this._showTooltipImpl(tooltip, matchingVariant, this, clickedVariant != null);
    }
  }

}


VariantCard.prototype.showVariantCircle = function(variant, sourceVariantCard) {
  var me = this;
  // Check the fb called variants first.  If present, circle and don't
  // show X for missing variant on vcf variant chart.
  var matchingVariant = null;
  var indicateMissingVariant = false;
  this.model.promiseHasCalledVariants()
   .then(function(hasCalledVariants) {
    if (me.fbChart != null && hasCalledVariants) {
      var container = me.d3CardSelector.selectAll('#fb-variants > svg');
      var lock = clickedVariant != null && me == sourceVariantCard;

      // Show the missing variant on the fbchart if we just have variants from those
      // called from alignments (no vcf variants loaded)
      if (!me.model.isVcfLoaded()) {
        indicateMissingVariant = true;
      }

      matchingVariant = me.fbChart.showCircle()(variant, container, indicateMissingVariant, lock);


      if (matchingVariant && sourceVariantCard) {
        var tooltip = me.d3CardSelector.select("#fb-variants .tooltip");
        me.showTooltip(tooltip, matchingVariant, sourceVariantCard, lock);

      }

    }

    if (me.vcfChart != null  && !matchingVariant) {
      var container = me.d3CardSelector.selectAll('#vcf-variants > svg');;
      var lock = clickedVariant != null && me == sourceVariantCard;

      // Only show the X for missing variant if we didn't already find the variant in
      // the fb variants
      var indicateMissingVariant = matchingVariant == null ? true : false;

      matchingVariant = me.vcfChart.showCircle()(variant, container, indicateMissingVariant, lock);

      if (matchingVariant && sourceVariantCard) {
        var tooltip = me.d3CardSelector.select("#vcf-variants .tooltip");
        me.showTooltip(tooltip, matchingVariant, sourceVariantCard, lock);

      }

    }


   })

}



VariantCard.prototype.showTooltip = function(tooltip, variant, sourceVariantCard, lock) {
  var me = this;


  // Only show the tooltip for the chart user mouses over / click
    if (this != sourceVariantCard) {
      return;
    }

  // Don't show the tooltip for mygene2 beginner mode
  if (isLevelBasic) {
    return;
  }

  var screenX = variant.screenX;
  var screenY = variant.screenY;

  if (lock) {
    matrixCard.unpin(true);
    if (isLevelEdu) {
      eduTourCheckVariant(variant);
    }
  }

  if (me.getRelationship() == 'known-variants') {
    lock = false;
  }


  if (lock  && !isLevelEdu && !isLevelBasic)  {
    // Show tooltip before we have hgvs notations
    me._showTooltipImpl(tooltip, variant, sourceVariantCard, true);

    var showTooltipExtraAnnot = function(annotatedVariants, callbackNotFound) {
      var targetVariants = annotatedVariants.filter(function(v) {
        return clickedVariant &&
                 clickedVariant.start == v.start &&
                 clickedVariant.ref   == v.ref &&
                 clickedVariant.alt   == v.alt;
      });
      if (targetVariants.length > 0) {
        var annotatedVariant = targetVariants[0];
        annotatedVariant.screenX = screenX;
            annotatedVariant.screenY = screenY;
        me._showTooltipImpl(tooltip, annotatedVariant, sourceVariantCard, true);
      } else {
        if (callbackNotFound) {
          callbackNotFound();
        }
      }

    }


    me.model
        .promiseGetImpactfulVariantIds(window.gene, window.selectedTranscript)
      .then( function(annotatedVariants) {
        // If the clicked variant is in the list of annotated variants, show the
        // tooltip; otherwise, the callback will get the extra annots for this
        // specific variant
        showTooltipExtraAnnot(annotatedVariants, function() {
          // The clicked variant wasn't annotated in the batch of variants.  Get the
          // extra annots for this specific variant.
          getProbandVariantCard()
              .model.promiseGetVariantExtraAnnotations(window.gene, window.selectedTranscript, variant)
                .then( function(refreshedVariant) {
                  showTooltipExtraAnnot([refreshedVariant]);
                })
        })
        });


  } else {
    me._showTooltipImpl(tooltip, variant, sourceVariantCard, lock);
  }
}





VariantCard.prototype._showTooltipImpl = function(tooltip, variant, sourceVariantCard, lock) {
  var me = this;

  if (lock) {
    tooltip.style("pointer-events", "all");
  } else {
    tooltip.style("pointer-events", "none");
  }

  matrixCard.clearSelections();
  matrixCard.highlightVariant(variant);


  var x = variant.screenX;

  // The variant tooltip is inside the variant panel, so we have to subtract the width of
  // the sidepanel if it is showing
  x = sidebarAdjustX(x);


  var y = variant.screenY;

  var coord = {'x':                  x,
               'y':                  y,
               'height':             33,
               'parentWidth':        me.cardSelector.outerWidth(),
               'preferredPositions': [ {top:    ['center', 'right','left'  ]},
                                       {right:  ['middle', 'top',  'bottom']},
                                       {left:   ['middle', 'top',  'bottom']},
                                       {bottom: ['center', 'right','left'  ]} ] };


  variantTooltip.fillAndPositionTooltip(tooltip, variant, lock, coord, me);

  tooltip.select("#unpin").on('click', function() {
    me.unpin(null, true);
  });
  tooltip.select("#tooltip-scroll-up").on('click', function() {
    me.tooltipScroll("up");
  });
  tooltip.select("#tooltip-scroll-down").on('click', function() {
    me.tooltipScroll("down");
  });

}


VariantCard.prototype.hideVariantCircle = function(variant) {
  var me = this;
  if (this.vcfChart != null) {
    var container = this.d3CardSelector.selectAll('#vcf-variants > svg');
    var parentContainer = this.d3CardSelector.selectAll('#vcf-variants');
    this.vcfChart.hideCircle()(container, parentContainer);
  }
  if (this.fbChart != null) {
    this.model.promiseHasCalledVariants()
     .then(function(isTrue) {
      if (isTrue) {
        var container = me.d3CardSelector.selectAll('#fb-variants > svg');
        var parentContainer = me.d3CardSelector.selectAll('#fb-variants');
        me.fbChart.hideCircle()(container, parentContainer);

      }
     })
  }
}

VariantCard.prototype.showCoverageCircle = function(variant, sourceVariantCard) {
  var me = this;
  this.model.promiseGetBamData(window.gene)
   .then(function(coverage) {
     if (coverage != null) {
      var bamDepth = null;
      if (sourceVariantCard == me && variant.bamDepth != null && variant.bamDepth != '') {
        bamDepth = variant.bamDepth;
      } else {
        me.model.promiseGetMatchingVariant(variant)
         .then(function(matchingVariant) {
          if (matchingVariant != null) {
            bamDepth = matchingVariant.bamDepth;
            // If samtools mpileup didn't return coverage for this position, use the variant's depth
            // field.
            if (bamDepth == null || bamDepth == '') {
              bamDepth = matchingVariant.genotypeDepth;
            }
          }

         })
      }

      me.bamDepthChart.showCircle()(variant.start, bamDepth);
      }

   },
   function(error) {

   });
}

VariantCard.prototype.hideCoverageCircle = function() {
  var me = this;
  me.model.promiseGetBamData(window.gene)
   .then(function(coverage) {
    if (coverage) {
      me.bamDepthChart.hideCircle()();
    }

   })
}



VariantCard.prototype.highlightBookmarkedVariants = function() {
  // This is too confusing because there is no easy way to reset
  // to show all variants in full opacity.
  // Until a better approach is implemented, just keep
  // the opacity at 1 on all variants.
  d3.selectAll("#proband-variant-card .variant")
       .style("opacity", 1);

  d3.selectAll("#proband-variant-card .variant")
        .filter( function(d,i) {
          return d.hasOwnProperty("isBookmark") && d.isBookmark == 'Y';
        })
        .style("opacity", 1);
}


VariantCard.prototype.removeBookmarkFlags = function() {
  // Remove the current indicator from the bookmark flag
  this.d3CardSelector.selectAll('#vcf-track .bookmark').remove();
}

VariantCard.prototype.removeBookmarkFlag = function(variant, key) {
  // Remove the current indicator from the bookmark flag
  if (variant.fbCalled == 'Y') {
    this.d3CardSelector.select("#fb-variants > svg .bookmark#" + key).remove();
    var container = this.d3CardSelector.selectAll('#fb-variants > svg');
    this.fbChart.removeBookmark(container, variant);
  } else {
    this.d3CardSelector.select("#vcf-variants > svg .bookmark#" + key).remove();
    var container = this.d3CardSelector.selectAll('#vcf-variants > svg');
    this.vcfChart.removeBookmark(container, variant);
  }

}

VariantCard.prototype.addBookmarkFlag = function(variant, key, singleFlag) {
  if (variant == null) {
    return;
  }

  // Remove the current indicator from the bookmark flag
  this.d3CardSelector.selectAll('#vcf-track .bookmark.current').classed("current", false);

  // If we are just flagging one bookmarked variants, get rid of all previously shown flags
  // for this gene
  if (singleFlag) {
    this.d3CardSelector.selectAll('#vcf-track .bookmark').remove();
  }

  var container = null;
  if (variant.fbCalled == 'Y') {
    // Check to see if the bookmark flag for this variant already exists
    var isEmpty = this.d3CardSelector.selectAll("#fb-variants svg .bookmark#" + key).empty();

    // If the flag isn't present, add it to the freebayes variant
    if (isEmpty) {
      container = this.d3CardSelector.selectAll('#fb-variants svg');
      variant.isBookmark = "Y";
      this.fbChart.addBookmark(container, variant, key);
    }
  } else {
    // Check to see if the bookmark flag for this variant already exists
    var isEmpty = this.d3CardSelector.selectAll("#vcf-variants > svg .bookmark#" + key).empty();

    // If the flag isn't present, add it to the vcf variant
    if (isEmpty) {
      container = this.d3CardSelector.selectAll('#vcf-variants > svg');
      variant.isBookmark = "Y";
      this.vcfChart.addBookmark(container, variant, key);
    }
  }

  //this.fillFeatureMatrix();

  if (singleFlag) {
    this.d3CardSelector.selectAll("#vcf-track .bookmark#" + key).classed("current", true);
  }
}

VariantCard.prototype.tooltipScroll = function(direction) {
  variantTooltip.scroll(direction, "#vcf-variants .tooltip");
}



VariantCard.prototype.unpin = function(saveClickedVariant, unpinMatrixTooltip) {
  if (!saveClickedVariant) {
    clickedVariant = null;
    clickedVariantCard = null;
  }

  this._hideTooltip();
  this.hideCoverageCircle();
//  window.hideCircleRelatedVariants();
  window.hideCoordinateFrame();

  if (unpinMatrixTooltip) {
    matrixCard.unpin();
  }
}

VariantCard.prototype._hideTooltip = function() {
  var tooltip = this.d3CardSelector.select("#vcf-variants .tooltip");
  tooltip.transition()
           .duration(500)
           .style("opacity", 0)
           .style("z-index", 0)
           .style("pointer-events", "none");
  tooltip = this.d3CardSelector.select("#fb-variants .tooltip");
  tooltip.transition()
           .duration(500)
           .style("opacity", 0)
           .style("z-index", 0)
           .style("pointer-events", "none");

}


