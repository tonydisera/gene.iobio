class GeneCard {
  constructor() {
    this.transcriptChart = null;
    this.transcriptMenuChart  = null;
    this.transcriptViewMode = "single";
    this.transcriptCodingRegions = {};

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
            me.getCodingRegions(selectedTranscript);
            me.promiseMarkCodingRegions(window.gene, window.selectedTranscript);
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
        selectedTranscript = me.getCanonicalTranscript();
      }
        me.promiseMarkCodingRegions(window.gene, window.selectedTranscript)
          .then(function() {
          geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
          me.getCodingRegions(window.selectedTranscript);
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
        selectCurrentTranscript();
       }
    }
  }


  getCanonicalTranscript(theGeneObject) {
    let me = this;
    var geneObject = theGeneObject != null ? theGeneObject : window.gene;
    var canonical;

    if (geneObject.transcripts == null || geneObject.transcripts.length == 0) {
      return null;
    }
    var order = 0;
    geneObject.transcripts.forEach(function(transcript) {
      transcript.isCanonical = false;
      var cdsLength = 0;
      if (transcript.features != null) {
        transcript.features.forEach(function(feature) {
          if (feature.feature_type == 'CDS') {
            cdsLength += Math.abs(parseInt(feature.end) - parseInt(feature.start));
          }
        })
        transcript.cdsLength = cdsLength;
      } else {
        transcript.cdsLength = +0;
      }
      transcript.order = order++;

    });
    var sortedTranscripts = geneObject.transcripts.slice().sort(function(a, b) {
      var aType = +2;
      var bType = +2;
      if (a.hasOwnProperty("transcript_type") && a.transcript_type == 'protein_coding') {
        aType = +0;
      } else if (a.hasOwnProperty("gene_type") && a.gene_type == "gene")  {
        aType = +0;
      } else {
        aType = +1;
      }
      if (b.hasOwnProperty("transcript_type") && b.transcript_type == 'protein_coding') {
        bType = +0;
      } else if (b.hasOwnProperty("gene_type") && b.gene_type == "gene")  {
        bType = +0;
      } else {
        bType = +1;
      }


      var aLevel = +2;
      var bLevel = +2;
      if (geneSource.toLowerCase() == 'refseq') {
        if (a.transcript_id.indexOf("NM_") == 0 ) {
          aLevel = +0;
        }
        if (b.transcript_id.indexOf("NM_") == 0 ) {
          bLevel = +0;
        }
      } else {
        // Don't consider level for gencode as this seems to point to shorter transcripts many
        // of the times.
        //aLevel = +a.level;
        //bLevel = +b.level;
      }


      var aSource = +2;
      var bSource = +2;
      if (geneSource.toLowerCase() =='refseq') {
        if (a.annotation_source == 'BestRefSeq' ) {
          aSource = +0;
        }
        if (b.annotation_source == 'BestRefSeq' ) {
          bSource = +0;
        }
      }

      a.sort = aType + ' ' + aLevel + ' ' + aSource + ' ' + a.cdsLength + ' ' + a.order;
      b.sort = bType + ' ' + bLevel + ' ' + bSource + ' ' + b.cdsLength + ' ' + b.order;

      if (aType == bType) {
        if (aLevel == bLevel) {
          if (aSource == bSource) {
            if (+a.cdsLength == +b.cdsLength) {
              // If all other sort criteria is the same,
              // we will grab the first transcript listed
              // for the gene.
              if (a.order == b.order) {
                return 0;
              } else if (a.order < b.order) {
                return -1;
              } else {
                return 1;
              }
              return 0;
            } else if (+a.cdsLength > +b.cdsLength) {
              return -1;
            } else {
              return 1;
            }
          } else if ( aSource < bSource ) {
            return -1;
          } else {
            return 1;
          }
        } else if (aLevel < bLevel) {
          return -1;
        } else {
          return 1;
        }
      } else if (aType < bType) {
        return -1;
      } else {
        return 1;
      }
    });
    canonical = sortedTranscripts[0];
    canonical.isCanonical = true;
    return canonical;
  }


  getCanonicalTranscriptOld(theGeneObject) {
    let me = this;

    var geneObject = theGeneObject != null ? theGeneObject : window.gene;
    var canonical;
    var maxCdsLength = 0;
    geneObject.transcripts.forEach(function(transcript) {
      var cdsLength = 0;
      if (transcript.features != null) {
        transcript.features.forEach(function(feature) {
          if (feature.feature_type == 'CDS') {
            cdsLength += Math.abs(parseInt(feature.end) - parseInt(feature.start));
          }
        })
        if (cdsLength > maxCdsLength) {
          maxCdsLength = cdsLength;
          canonical = transcript;
        }
        transcript.cdsLength = cdsLength;
      }

    });

    if (canonical == null) {
      // If we didn't find the canonical (transcripts didn't have features), just
      // grab the first transcript to use as the canonical one.
      if (geneObject.transcripts != null && geneObject.transcripts.length > 0)
      canonical = geneObject.transcripts[0];
    }
    canonical.isCanonical = true;
    return canonical;
  }

  getCodingRegions(transcript) {
    let me = this;
    if (transcript && transcript.features) {
      var codingRegions = me.transcriptCodingRegions[transcript.transcript_id];
      if (codingRegions) {
        return codingRegions;
      }
      codingRegions = [];
      transcript.features.forEach( function(feature) {
        if ($.inArray(feature.feature_type, ['EXON', 'CDS', 'UTR']) !== -1) {
          codingRegions.push({ start: feature.start, end: feature.end });
        }
      });
      me.transcriptCodingRegions[transcript.transcript_id] = codingRegions;
      return codingRegions;
    }
    return [];
  }



  promiseMarkCodingRegions(geneObject, transcript) {
    let me = this;
    return new Promise(function(resolve, reject) {

      var exonPromises = [];
      transcript.features.forEach(function(feature) {
        if (!feature.hasOwnProperty("danger")) {
          feature.danger = {proband: false, mother: false, father: false};
        }
        if (!feature.hasOwnProperty("geneCoverage")) {
          feature.geneCoverage = {proband: false, mother: false, father: false};
        }


        getRelevantVariantCards().forEach(function(vc) {
          var promise = vc.model.promiseGetCachedGeneCoverage(geneObject, transcript)
           .then(function(geneCoverage) {
              if (geneCoverage) {
                var matchingFeatureCoverage = geneCoverage.filter(function(gc) {
                  return feature.start == gc.start && feature.end == gc.end;
                });
                if (matchingFeatureCoverage.length > 0) {
                  var gc = matchingFeatureCoverage[0];
                  feature.geneCoverage[vc.getRelationship()] = gc;
                  feature.danger[vc.getRelationship()] = filterCard.isLowCoverage(gc);
                } else {
                  feature.danger[vc.getRelationship()]  = false;
                }
              } else {
                feature.danger[vc.getRelationship()] = false;
              }

           })
          exonPromises.push(promise);
        })
      })

      Promise.all(exonPromises).then(function() {
        var sortedExons = me._getSortedExonsForTranscript(transcript);
        me._setTranscriptExonNumbers(transcript, sortedExons);
        resolve({'gene': geneObject, 'transcript': transcript});
      });
    })

  }

  _getSortedExonsForTranscript(transcript) {
    var sortedExons = transcript
      .features.filter(function(feature) {
        return feature.feature_type.toUpperCase() == 'EXON';
      })
      .sort(function(feature1, feature2) {

        var compare = 0;
        if (feature1.start < feature2.start) {
          compare = -1;
        } else if (feature1.start > feature2.start) {
          compare = 1;
        } else {
          compare = 0;
        }

        var strandMultiplier = transcript.strand == "+" ? 1 : -1;

        return compare * strandMultiplier;

      })

    var exonCount = 0;
    sortedExons.forEach(function(exon) {
      exonCount++
    })

    var exonNumber = 1;
    sortedExons.forEach(function(exon) {
      exon.exon_number = exonNumber + "/" + exonCount;
      exonNumber++;
    })
    return sortedExons;
  }


  _setTranscriptExonNumbers(transcript, sortedExons) {
    // Set the exon number on each UTR and CDS within the corresponding exon
    transcript.features.forEach(function(feature) {
      if (feature.feature_type.toUpperCase() == 'CDS' || feature.feature_type.toUpperCase() == 'UTR') {
        sortedExons.forEach(function(exon) {
          if (feature.start >= exon.start && feature.end <= exon.end) {
            feature.exon_number = exon.exon_number;
          }
        })
      }
    })
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
    me.promiseMarkCodingRegions(window.gene, window.selectedTranscript)
      .then(function() {
        geneToLatestTranscript[window.gene.gene_name] = window.selectedTranscript;
        d3.selectAll("#gene-viz .transcript rect").remove();
        me.getCodingRegions(window.selectedTranscript);
        loadTracksForGene();
      })
  }




}