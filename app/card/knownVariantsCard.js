class KnownVariantsCard {
  constructor() {
    this.VIZ_VARIANTS = 'variants';
    this.VIZ_COUNTS   = 'counts';
    this.VIZ_NONE     = 'none';

    this.CHART_TYPE_EXON = 'exon-bar';
    this.CHART_TYPE_AREA = 'area';
    this.CHART_TYPE_BAR  = 'bar';

    this.VARIANT_DISPLAY_THRESHOLD = 300;

    this.BIN_SPAN  = {'bar': +6, 'exon-bar': +2,  'area': +6};
    this.BAR_WIDTH = {'bar': +6, 'exon-bar': +6,  'area': +6};


    this.viz = this.VIZ_NONE;

    this.chart = null;
    this.chartType = this.CHART_TYPE_EXON;
    this.areaChart = null;
    this.barChart = null;

    this.tooManyVariants = false;
  }


  init() {
    let me = this;

    $('#known-variants-all-card').find("#known-variants-nav-area").append(templateUtil.knownVariantsNavTemplateHTML);

    $('#select-known-variants-filter').selectize(
      {
        placeholder: 'Filter...',
          maxItems: null,
          valueField: 'value',
          labelField: 'display',
        plugins: ['remove_button'],
          persist: true,
          create: function(input) {
              return {
                  value: input,
                  text: input
              }
          }
      }
    );


    filterCard.getCardSpecificFilters('known-variants').forEach(function(theFilter) {
      $('#select-known-variants-filter')[0].selectize.addOption({value: theFilter.clazz, display: theFilter.display})
    })
    $('#select-known-variants-filter')[0].selectize.setValue(['clinvar_path', 'clinvar_lpath']);
    $('#select-known-variants-filter')[0].selectize.on('change', function(values) {
      filterCard.clearCardSpecificFilters('known-variants');
      if (values) {
        values.forEach(function(filterName) {
          filterCard.setCardSpecificFilter('known-variants', filterName, true);
        })
      }
      getVariantCard('known-variants').promiseFilterAndShowLoadedVariants();
    })

    var variantCard = getVariantCard('known-variants');
    if (variantCard == null) {
      variantCard = new VariantCard();
      variantCard.model                = new VariantModel();

      $('#known-variants-cards').append(templateUtil.variantCardTemplate());
      var cardSelectorString = "#known-variants-cards .variant-card";
      var d3CardSelector = d3.selectAll(cardSelectorString);

      variantCard.setRelationship("known-variants");
      variantCard.setAffectedStatus('unaffected');
      variantCard.setName('Clinvar variants');

      variantCard.init($(cardSelectorString), d3CardSelector, 0);


      variantCard.cardSelector.find('#vcf-variant-count-label').text("Clinvar variants")


      variantCard.setVariantCardLabel();
      variantCards.push(variantCard);
    }

    me.areaChart = stackedAreaChartD3()
      .widthPercent("100%")
      .heightPercent("100%")
          .width($('#container').innerWidth())
      .height(50)
      .showXAxis(false)
      .xTickCount(0)
      .yTickCount(3)
      .xValue( function(d, i) { return d.point })
      .categories(['unknown', 'other', 'benign', 'path'])
        .margin( {top: 7, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 0, left: isLevelBasic || isLevelEdu ? 9 : 4} );

    me.barChart = stackedBarChartD3()
      .widthPercent("100%")
      .heightPercent("100%")
          .width($('#container').innerWidth())
      .height(50)
      .showXAxis(false)
      .xTickCount(0)
      .yTickCount(3)
      .xValue( function(d, i) { return d.point })
      .xValueStart( function(d, i) { return d.start })
      .xValueEnd( function(d, i) { return d.end })
      .barWidthMin(4)
      .barHeightMin(3)
      .categories(['unknown', 'other', 'benign', 'path'])
        .margin( {top: 7, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 0, left: isLevelBasic || isLevelEdu ? 9 : 4} )
        .tooltipText( function(d,i) {
          return me.showTooltip(d);
        });


    me.toggleChart(me.CHART_TYPE_BAR);


    $('#known-variants-cards #too-many-variants-alert button').on("click", function() {
      me.tooManyVariants = false;
      me.showVariantsViz();
    });

  }

  showViz(value) {
    let me = this;
    if (value == this.VIZ_COUNTS) {
      me.showCountsViz(true);
      me.drawCountsChart();
      me.hideVariantsViz();
    } else if (value == this.VIZ_VARIANTS) {
      me.showCountsViz(false);
      me.showVariantsViz();
    } else if (value == this.VIZ_NONE || value == 'hide') {
      me.showCountsViz(false);
      me.hideVariantsViz();
      $('#known-variants-cards #vcf-track').addClass("hide");
      $('#known-variants-cards #variant-badges').addClass("hide");
      $('#known-variants-cards #zoom-region-chart').addClass("hide");
    }
    this.viz = value;
  }

  beforeGeneLoaded(clinvarVariantCount) {
    let me = this;
    me.tooManyVariants = false;

    if (this.viz == this.VIZ_VARIANTS && clinvarVariantCount > this.VARIANT_DISPLAY_THRESHOLD) {
      me.tooManyVariants = true;
    }

    me.clearCard();

    $('#known-variants-all-card').removeClass("hide");

  }

  clearCard() {
    let me = this;
    $('#known-variants-cards #too-many-variants-alert').addClass("hide");
    $('#known-variants-cards #variant-badges').addClass("hide");
    $('#known-variants-cards #zoom-region-chart').addClass("hide");
    me.hideVariantsViz();
    me.showCountsViz(false);
  }

  onGeneLoaded() {
    let me = this;

    if (me.tooManyVariants) {
      $('#known-variants-cards #too-many-variants-alert').removeClass("hide");
      getVariantCard('known-variants').prepareToShowVariants();
      $('#known-variants-cards .loader').addClass("hide")
      me.hideVariantsViz();
    } else if (this.viz == this.VIZ_COUNTS) {
      // Show the chart for known variants
      me.drawCountsChart();
    }

  }

  shouldShowVariants() {
    let me = this;
    return me.viz == me.VIZ_VARIANTS && !me.tooManyVariants;
  }


  showVariantsViz()  {
    let me = this;

    me.tooManyVariants = false;

    $('#select-known-variants-filter-box').removeClass("hide");

    var variantCard = getVariantCard('known-variants');
    var clinvarUrl = genomeBuildHelper.getBuildResource(genomeBuildHelper.RESOURCE_CLINVAR_VCF_S3);
    variantCard.model.onVcfUrlEntered(clinvarUrl, null, function() {
      variantCard.prepareToShowVariants();
      variantCard.model.promiseAnnotateVariants(window.gene, window.selectedTranscript, [variantCard], false, false)
      .then(function() {
        variantCard.promiseShowVariants();
      })
    });
  }


  hideVariantsViz() {
    let me = this;
    $('#known-variants-cards #vcf-track').addClass("hide");
    $('#known-variants-cards #variant-badges').addClass("hide");
    $('#select-known-variants-filter-box').addClass("hide");
  }

  toggleChart(chartType, refresh=false, button) {
    let me = this;

    if (chartType == me.CHART_TYPE_BAR) {
      me.chart = me.barChart;
      me.chart.xStart(null);
      me.chart.xEnd(null);
      me.chart.barWidth(me.BAR_WIDTH[chartType]);

    } else if (chartType == me.CHART_TYPE_EXON) {
      me.chart = me.barChart;
      me.chart.xStart(window.gene.start);
      me.chart.xEnd(window.gene.end);
      me.chart.barWidth(me.BAR_WIDTH[chartType]);

      // If previous chart has detailed histogram data, just recalculate bins
      if (me.chartType == me.CHART_TYPE_BAR || me.chartType == me.CHART_TYPE_AREA) {
        var selection = d3.select('#known-variants-chart');
        var binLength = Math.floor( ((+window.gene.end - +window.gene.start) / $('#transcript-panel #gene-viz').innerWidth()) * me.BIN_SPAN[me.chartType]);
        var exonBins = getProbandVariantCard().model.binKnownVariantsByExons(window.gene, window.selectedTranscript, binLength, selection.datum());
        selection.datum(exonBins);
      }

    } else if (chartType == this.CHART_TYPE_AREA) {
      me.chart = me.areaChart;
    }


    if (refresh) {
      d3.select("#known-variants-chart svg").remove();
      if (button) {
        $('#known-variants-nav-chart-type .chart-type.selected').removeClass('selected');
        $(button).addClass('selected');
      }

      // No need to obtain counts for gene since prior data is interchangable between
      // area and barchart
      if ((me.chartType == me.CHART_TYPE_BAR || me.chartType == me.CHART_TYPE_AREA) &&
        (chartType == me.CHART_TYPE_BAR  || chartType == me.CHART_TYPE_AREA)) {
        me.chartType = chartType;
        var selection = d3.select('#known-variants-chart');
        me.chart(selection, {transition: {'pushUp': true }} );
      } else {

        me.chartType = chartType;
        me.drawCountsChart();
      }

    }

  }

  showCountsViz(show) {
    let me = this;
    if (show) {
      $('#known-variants-chart').removeClass("hide");
      $('#known-variants-nav-chart-type').removeClass("hide");
      $('#known-variants-cards #variant-badges').addClass("hide");
    } else {
      $('#known-variants-chart').addClass("hide");
      $('#known-variants-nav-chart-type').addClass("hide");
      $('#known-variants-cards #variant-badges').removeClass("hide");
    }
  }


  drawCountsChart() {
    $('#known-variants-cards #too-many-variants-alert').addClass("hide");

    let me = this;

    var vc = getVariantCard('known-variants');

    d3.select('#known-variants-chart svg').remove();

    // This determines if the exon bar will span the width of the exon.
    var featureBarWidth = true;

    var theTranscript = null;
    var binLength = null;

    theTranscript =  $.extend({}, window.selectedTranscript);
    theTranscript.features = window.selectedTranscript.features.filter(function(d) {
        var inRegion = (d.start >= regionStart && d.start <= regionEnd)
                           || (d.end >= regionStart && d.end <= regionEnd) ;
            return inRegion;

    });
    vc.fillZoomRegionChart(theTranscript, regionStart, regionEnd);

    if (me.chartType != me.CHART_TYPE_EXON) {
      theTranscript = null;
      binLength = Math.floor( ((+regionEnd - +regionStart) / $('#transcript-panel #gene-viz').innerWidth()) * me.BIN_SPAN[me.chartType]);
    }

    if (me.chartType == me.CHART_TYPE_EXON || me.chartType == me.CHART_TYPE_BAR) {
      me.chart.xStart(regionStart);
      me.chart.xEnd(regionEnd);
    }


    $('#known-variants-nav-chart-type .loader').removeClass('hide');
    d3.select('#known-variants-chart svg').remove();
    getProbandVariantCard().model.promiseGetKnownVariants(window.gene, theTranscript, binLength).then(function(results) {

      results = results.filter(function(binObject) {
        return binObject.start >= regionStart && binObject.end <= regionEnd;
      })
      vc.cardSelector.removeClass("hide");
      $('#known-variants-chart').removeClass("hide");
      var selection = d3.select('#known-variants-chart').datum(results);


      me.chart(selection, {transition: {'pushUp': true}, 'featureBarWidth' : featureBarWidth} );
        $('#known-variants-nav-chart-type .loader').addClass('hide');

    })


  }

  showTooltip(knownVariants) {
    let me = this;

    var tooltipRow = function(valueObject) {
      var fieldName = Object.keys(valueObject)[0];
      var row = '<div>';
      row += '<span style="padding-left:10px;width:70px;display:inline-block">' + fieldName   + '</span>';
      row += '<span style="width:40px;display:inline-block">' + valueObject[fieldName] + '</span>';
      row += "</div>";
      return row;
    }
      var html = 'ClinVar variants: ';
      for (var i = knownVariants.values.length - 1; i >= 0; i--) {
      html += tooltipRow(knownVariants.values[i])
      }

      return html;
  }



}