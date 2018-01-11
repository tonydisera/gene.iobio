class GeneCard {
  constructor(geneModel) {
    this.transcriptChart = null;
    this.transcriptMenuChart  = null;
    this.transcriptViewMode = "single";
    this.geneModel = geneModel;


  }

  init() {
    let me = this;
    // Create transcript chart
    me.transcriptChart = geneD3()
      .width($('#container').innerWidth())
      .widthPercent("100%")
      .heightPercent("100%")
      .margin({top: isLevelBasic || isLevelEdu ? 0 : 20, right: isLevelBasic || isLevelEdu ? 7 : 2, bottom: 18, left: isLevelBasic || isLevelEdu ? 9 : 4})
      .showXAxis(true)
      .showBrush(true)
      .trackHeight(isLevelEdu || isLevelBasic ? 32 : 22)
      .cdsHeight(isLevelEdu  || isLevelBasic  ? 24 : 18)
      .showLabel(false)
      .featureClass( function(d,i) {
          return d.feature_type.toLowerCase();
      })
      .on("d3brush", function(brush) {
        hideCoordinateFrame();
        if (!brush.empty()) {
          $('#zoom-hint').text('To zoom out, click outside bounding box.');
          regionStart = d3.round(brush.extent()[0]);
          regionEnd   = d3.round(brush.extent()[1]);
          if (!selectedTranscript) {
            selectedTranscript = window.gene.transcripts.length > 0 ? window.gene.transcripts[0] : null;
            me.geneModel.getCodingRegions(selectedTranscript);
            me.geneModel.promiseMarkCodingRegions(window.gene, window.selectedTranscript);
          }
        } else {
            $('#zoom-hint').text('To zoom into region, drag over gene model.');
          regionStart = window.gene.start;
          regionEnd   = window.gene.end;
        }


        var cardCount = 0;
        showKnownVariantsCounts();

        getRelevantVariantCards().forEach(function(variantCard) {
          variantCard.onBrush(brush,
          function() {

            cardCount++;
            // Wait until all variant cards have finished with onBrush,
            // then fill feature matrix and circle variants.
            if (cardCount == getRelevantVariantCards().length) {
              getProbandVariantCard().promiseFillFeatureMatrix(regionStart, regionEnd)
              .then(function() {

                if (clickedVariant && clickedVariantCard) {
                  clickedVariantCard.showCoverageCircle(clickedVariant, clickedVariantCard);
                  window.showCircleRelatedVariants(clickedVariant, clickedVariantCard);
                  showCoordinateFrame(clickedVariant.screenX)
                }

              })
            }
          });

        });

      })
      .on("d3featuretooltip", function(featureObject, feature, tooltip) {
          var coord = getTooltipCoordinates(featureObject.node(), tooltip, false);
          tooltip.transition()
                     .duration(200)
                     .style("opacity", .9);
          tooltip.html(feature.feature_type + ': ' + util.addCommas(feature.start) + ' - ' + util.addCommas(feature.end))
                 .style("left", coord.x  + "px")
                 .style("text-align", 'left')
                 .style("top", coord.y + "px");
      });

    me.transcriptMenuChart = geneD3()
      .width(600)
      .margin({top: 5, right: 5, bottom: 5, left: 200})
      .widthPercent("100%")
      .heightPercent("100%")
      .showXAxis(false)
      .showBrush(false)
      .trackHeight(isLevelEdu || isLevelBasic  ? 36 : 20)
      .cdsHeight(isLevelEdu || isLevelBasic ? 24 : 10)
      .showLabel(true);



    var geneTrack = $('#gene-track');
    geneTrack.find('#expand-button').on('click', function() {
      geneTrack.find('.fullview').removeClass("hide");
      geneTrack.find('#gene-name').css("margin-left", "0");
      geneTrack.find('#gene-name').css("margin-right", "0");
      geneTrack.css("margin-top", "0");

      geneTrack.find('#expand-button').addClass("disabled");
      geneTrack.find('#minimize-button').removeClass("disabled");
    });
    geneTrack.find('#minimize-button').on('click', function() {
      geneTrack.find('.fullview').addClass("hide");
      geneTrack.find('#gene-name').css("margin-right", "0");

      geneTrack.find('#expand-button').removeClass("disabled");
      geneTrack.find('#minimize-button').addClass("disabled");
    });


    $('#select-gene-source').selectize({});
    $('#select-gene-source')[0].selectize.on('change', function(value) {
      me.geneModel.geneSource = value.toLowerCase().split(" transcript")[0];
      // When the user picks a different gene source from the dropdown,
      // this becomes the 'new' site gene source
      siteGeneSource = me.geneModel.geneSource;
      me.geneModel.geneToLatestTranscript = {};
      getRelevantVariantCards().forEach(function(vc) {
        // When switching from gencode->refseq or vice/versa,
        // the VEP tokens will be formatted in a different order,
        // so make sure we clear out the token indices
        vc.model.vcf.clearVepInfoFields();
      })
      if (window.gene) {
        genesCard.selectGene(window.gene.gene_name);
      }
    });


    $('#transcript-btn-group').data('open', false);

    $('#transcript-dropdown-button').click(
    function () {
        if ($('#transcript-btn-group').data('open')) {
            $('#transcript-btn-group').data('open', false);
            me.onCloseTranscriptMenuEvent();
        } else {
          $('#transcript-btn-group').data('open', true);
        }
    });

    $(document).click(function () {
      if ($('#transcript-btn-group').data('open')) {
          $('#transcript-btn-group').data('open', false);
          me.onCloseTranscriptMenuEvent();
      }
    });
  }

  showTranscripts(regionStart, regionEnd) {
    let me = this;

    var transcripts = null;


    if (regionStart && regionEnd) {
      me.transcriptChart.regionStart(regionStart);
      me.transcriptChart.regionEnd(regionEnd);
      // ???????  TODO:
      // Need change the regionstart and region end of transcripts
      // to stay within selected region.
      transcripts = window.gene.transcripts.filter(function(d) {
        if (d.end < regionStart && d.start > regionEnd ) {
          return false;
        } else {
          return false;
        }
      });

    } else {
      me.transcriptChart.regionStart(+window.gene.start);
      me.transcriptChart.regionEnd(+window.gene.end);
      transcripts = window.gene.transcripts;

      // TODO:  Need a way of selecting the transcript that you want to
      // use when determining the variant's effect and impact (snpEff annotation)
      // For now, let's just grab the first one in the list.
      if (!selectedTranscript) {
        selectedTranscript = me.geneModel.getCanonicalTranscript();
      }
        me.geneModel.promiseMarkCodingRegions(window.gene, window.selectedTranscript)
          .then(function() {
          me.geneModel.geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
          me.geneModel.getCodingRegions(window.selectedTranscript);
          });
    }


    if (me.transcriptViewMode == "single") {
      transcripts = [selectedTranscript];
    }


    let selection = d3.select("#gene-viz").datum(transcripts);
    me.transcriptChart(selection);

    d3.selectAll("#transcript-menu-item .transcript").remove();
    selection = d3.select("#transcript-menu-item").datum(window.gene.transcripts);
    me.transcriptMenuChart(selection);

      if (me.transcriptViewMode == "single") {
        var cache = $('#transcript-dropdown-button').children();
        $('#transcript-dropdown-button').text(selectedTranscript.transcript_id).append(cache);
        d3.select('#transcript-menu-item .transcript.current').classed("current", false);
        me.getTranscriptSelector(selectedTranscript).attr("class", "transcript current");
    }

    d3.select("#gene-viz .x.axis .tick text").style("text-anchor", "start");


    // Show the badge for the transcript type if it is not protein coding and it is different
    // than the gene type
    if (window.selectedTranscript == null || window.selectedTranscript.transcript_type == 'protein_coding'
     || window.selectedTranscript.transcript_type == 'mRNA'
     || window.selectedTranscript.transcript_type == 'transcript') {
      $('#non-protein-coding #transcript-type-badge').addClass("hide");
    } else {
      if (window.gene.gene_type != window.selectedTranscript.transcript_type) {
        $('#non-protein-coding #transcript-type-badge').removeClass("hide");
        var suffix = "";
        if (window.selectedTranscript.transcript_type.indexOf("transcript") < 0) {
          suffix = " transcript";
        }
        $('#non-protein-coding #transcript-type-badge').text(window.selectedTranscript.transcript_type + suffix);
      } else {
        $('#non-protein-coding #transcript-type-badge').addClass("hide");
      }
    }

  }

  getTranscriptSelector(selectedTranscript) {
    let me = this;
    var selector = '#transcript-menu-item #transcript_' + selectedTranscript.transcript_id.split(".").join("_");
    return $(selector);
  }


  onCloseTranscriptMenuEvent() {
    let me = this;
    if (me.transcriptMenuChart.selectedTranscript() != null ) {
      if (selectedTranscript == null || selectedTranscript.transcript_id != me.transcriptMenuChart.selectedTranscript().transcript_id) {
        selectedTranscript = me.transcriptMenuChart.selectedTranscript();
        me.selectCurrentTranscript();
       }
    }
  }



  selectTranscript(transcriptId) {
    let me = this;
    var found = false;
    hideCoordinateFrame();
    window.gene.transcripts.forEach(function(transcript) {
      if (transcript.transcript_id == transcriptId) {
        window.selectedTranscript = transcript;
        found = true;
      } else if (transcript.transcript_id.indexOf(transcriptId.toUpperCase()) == 0) {
        window.selectedTranscript = transcript;
        found = true;
      }
    })
    if (found) {
      me.selectCurrentTranscript();
    }
  }


  selectCurrentTranscript() {
    let me = this;
    me.geneModel.promiseMarkCodingRegions(window.gene, window.selectedTranscript)
      .then(function() {
        me.geneModel.geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
        d3.selectAll("#gene-viz .transcript rect").remove();
        geneModel.getCodingRegions(window.selectedTranscript);
        loadTracksForGene();
      })
  }



  checkGeneSource(geneName) {
    let me = this;
    $('#no-transcripts-badge').addClass("hide");

    var switchMsg = null;
    if (me.geneModel.refseqOnly[geneName] && me.geneModel.geneSource != 'refseq') {
      switchMsg = 'Gene ' + geneName + ' only in RefSeq.  Switching to this transcript set.';
      switchGeneSource('RefSeq Transcript');
    } else if (me.geneModel.gencodeOnly[geneName] && me.geneModel.geneSource != 'gencode') {
      switchMsg = 'Gene ' + geneName + ' only in Gencode.  Switching to this transcript set.';
      me.switchGeneSource('Gencode Transcript');
    } else {
      // In the case where the gene is valid in both gene sources,
      // check to see if the gene source needs to be set back to the preferred setting,
      // which will be either the site specific source or the  gene source
      // last selected from the dropdown
      me.resetGeneSource();
    }
    if (switchMsg) {
      //var msg = "<span style='font-size:18px'>" + switchMsg + "</span>";
      //alertify.set('notifier','position', 'top-right');
      //alertify.error(msg, 6);
      $('#non-protein-coding #no-transcripts-badge').removeClass("hide");
      $('#non-protein-coding #no-transcripts-badge').text(switchMsg);
    }
  }

  resetGeneSource() {
    let me = this;

    // Switch back to the site specific gene source (if provided),
    // but only if the user hasn't already selected a gene
    // source from the dropdown, which will override any default setting.
    if (typeof siteGeneSource !== 'undefined' && siteGeneSource) {
      if (siteGeneSource != me.geneModel.geneSource) {
        me.switchGeneSource(siteGeneSource.toLowerCase() == 'refseq' ? "RefSeq Transcript" : "Gencode Transcript");
      }
    }
  }


  switchGeneSource(newGeneSource) {
    let me = this;

    // turn off event handling - instead we want to manually set the
    // gene source value
    $('#select-gene-source')[0].selectize.off('change');


    $('#select-gene-source')[0].selectize.setValue(newGeneSource);
    me.geneModel.geneSource = newGeneSource.toLowerCase().split(" transcript")[0];


    // turn on event handling
    $('#select-gene-source')[0].selectize.on('change', function(value) {
      me.geneModel.geneSource = value.toLowerCase().split(" transcript")[0];
      // When the user picks a different gene source from the dropdown,
      // this becomes the 'new' site gene source
      siteGeneSource = me.geneModel.geneSource;
      me.geneModel.geneToLatestTranscript = {};
      if (window.gene) {
        genesCard.selectGene(window.gene.gene_name);
      }
    });
  }

  showGeneSummary(theGeneName) {
    let me = this;
    if (window.gene == null || theGeneName != window.gene.gene_name) {
      return;
    }
    var title = me.geneModel.geneNCBISummaries[theGeneName] ? "<span class='gene-title'>" + me.geneModel.geneNCBISummaries[theGeneName].description + ".</span>" : "";
    var summary = me.geneModel.geneNCBISummaries[theGeneName] ? title + "  " + me.geneModel.geneNCBISummaries[theGeneName].summary  : "";
    if (isLevelBasic && $('#gene-summary').text() != summary ) {
      $('#gene-summary').html(summary);
    }
  }


}