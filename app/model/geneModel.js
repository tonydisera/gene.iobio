class GeneModel {
  constructor() {
    this.geneSource = null;
    this.refseqOnly = {};
    this.gencodeOnly = {};
    this.transcriptCodingRegions = {};
  }

  getRidOfDuplicates(genes) {
    let me = this;
    var sortedGenes = genes.sort( function(g1, g2) {
      if (g1.gene_name < g2.gene_name) {
        return -1;
      } else if (g1.gene_name > g2.gene_name) {
        return 1;
      } else {
        return 0;
      }
    });
    // Flag gene objects with same name
    for (var i =0; i < sortedGenes.length - 1; i++) {
          var gene = sortedGenes[i];


          var nextGene = sortedGenes[i+1];
          if (i == 0) {
            gene.dup = false;
          }
          nextGene.dup = false;

          if (gene.gene_name == nextGene.gene_name && gene.refseq == nextGene.refseq && gene.gencode == nextGene.gencode) {
            nextGene.dup = true;
        }

        // Some more processing to gather unique gene sets and add field 'name'
        gene.name = gene.gene_name;
        if (gene.refseq != gene.gencode) {
          if (gene.refseq) {
            me.refseqOnly[gene.gene_name] = gene;
          } else {
            me.gencodeOnly[gene.gene_name] = gene;
          }
        }
    }
    return sortedGenes.filter(function(gene) {
      return gene.dup == false;
    });
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
      if (me.geneSource.toLowerCase() == 'refseq') {
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
      if (me.geneSource.toLowerCase() =='refseq') {
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

}