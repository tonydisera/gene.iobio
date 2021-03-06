function MatrixCard() {
  this.featureMatrix = null;
  this.featureVcfData = null;
  this.sourceVcfData = null;
  this.featureMatrix  = null;

  this.CELL_SIZE_SMALL           = 18;
  this.CELL_SIZE_LARGE           = 22;
  this.CELL_SIZE                 = this.CELL_SIZE_LARGE;
  this.CELL_SIZE_EDU             = 23;
  this.CELL_WIDTH_BASIC          = 160;

  this.COLUMN_LABEL_HEIGHT       = 28;
  this.COLUMN_LABEL_HEIGHT_BASIC = 30;

  this.ROW_LABEL_WIDTH           = 165;
  this.ROW_LABEL_WIDTH_BASIC     = 25;
  this.ROW_LABEL_WIDTH_EDU       = 130;


  this.clinvarMap     = {
            'pathogenic'            : {value: 1,   badge: true, examineBadge: true, clazz: 'clinvar_path', symbolFunction: this.showClinVarSymbol},
                'pathogenic/likely_pathogenic' :
                                          {value: 2,   badge: true, examineBadge: true, clazz: 'clinvar_path', symbolFunction: this.showClinVarSymbol},
                        'likely_pathogenic'     : {value: 3,   badge: true, examineBadge: true, clazz: 'clinvar_lpath', symbolFunction: this.showClinVarSymbol},
                        'uncertain_significance': {value: 4,   badge: true, examineBadge: true, clazz: 'clinvar_uc', symbolFunction: this.showClinVarSymbol},
            'conflicting_interpretations_of_pathogenicity':
                                      {value: 4,   badge: true, examineBadge: true, clazz: 'clinvar_cd', symbolFunction: this.showClinVarSymbol},
                        'conflicting_data_from_submitters':
                                                  {value: 5,   badge: true,  examineBadge: true, clazz: 'clinvar_cd', symbolFunction: this.showClinVarSymbol},
                        'drug_response'         : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'confers_sensitivity'   : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'risk_factor'           : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'other'                 : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'association'           : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'protective'            : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'not_provided'          : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.showClinVarSymbol},
                        'likely_benign'         : {value: 141, badge: false, examineBadge: true, clazz: 'clinvar_lbenign', symbolFunction: this.showClinVarSymbol},
                        'benign/likely_benign'  : {value: 141, badge: false, examineBadge: true, clazz: 'clinvar_lbenign', symbolFunction: this.showClinVarSymbol},
                        'benign'                : {value: 151, badge: false, examineBadge: true, clazz: 'clinvar_benign', symbolFunction: this.showClinVarSymbol},
                        'none'                  : {value: 161, badge: false, examineBadge: false, clazz: ''}
                     };
  this.impactMap = {  HIGH:     {value: 1, badge: true, clazz: 'impact_HIGH',     symbolFunction: this.showImpactSymbol},
                        MODERATE: {value: 2, badge: true, clazz: 'impact_MODERATE', symbolFunction: this.showImpactSymbol},
                        MODIFIER: {value: 3, badge: false, clazz: 'impact_MODIFIER', symbolFunction: this.showImpactSymbol},
                        LOW:      {value: 4, badge: false, clazz: 'impact_LOW',      symbolFunction: this.showImpactSymbol},
                        none:     {value: 5, badge: false, clazz: 'impact_none',      symbolFunction: this.showImpactSymbol}
                     };
  this.highestImpactMap = {
                    HIGH:     {value: 1, badge: true, clazz: 'impact_HIGH',     symbolFunction: this.showHighestImpactSymbol},
                        MODERATE: {value: 2, badge: true, clazz: 'impact_MODERATE', symbolFunction: this.showHighestImpactSymbol},
                        MODIFIER: {value: 3, badge: false, clazz: 'impact_MODIFIER', symbolFunction: this.showHighestImpactSymbol},
                        LOW:      {value: 4, badge: false, clazz: 'impact_LOW',      symbolFunction: this.showHighestImpactSymbol}
                     };
  this.siftMap = {
                        deleterious:                 {value: 1, badge: true, clazz: 'sift_deleterious', symbolFunction: this.showSiftSymbol},
                        deleterious_low_confidence:  {value: 2, badge: true, clazz: 'sift_deleterious_low_confidence', symbolFunction: this.showSiftSymbol},
                    tolerated_low_confidence: {value: 3, badge: false, clazz: 'sift_tolerated_low_confidence',symbolFunction: this.showSiftSymbol},
                    tolerated:    {value: 102, badge: false, clazz: 'sift_tolerated',symbolFunction: this.showSiftSymbol},
                        unknown:      {value: 103, badge: false, clazz: ''},
                        none:         {value: 103, badge: false, clazz: ''}
                     };
  this.polyphenMap = {
                        probably_damaging:    {value: 1, badge: true, clazz: 'polyphen_probably_damaging', symbolFunction: this.showPolyPhenSymbol},
                    possibly_damaging:    {value: 2, badge: true, clazz: 'polyphen_possibly_damaging', symbolFunction: this.showPolyPhenSymbol},
                        benign:               {value: 103, badge: false, clazz: 'polyphen_benign',            symbolFunction:this.showPolyPhenSymbol},
                        unknown:              {value: 104, badge: false, clazz: ''},
                        none:                 {value: 104, badge: false, clazz: ''}
                     };
  this.inheritanceMap = {
                    denovo:    {value: 1, badge: true, clazz: 'denovo',    display: 'de novo', symbolFunction: this.showDeNovoSymbol},
                        recessive: {value: 2, badge: true, clazz: 'recessive', display: 'recessive', symbolFunction: this.showRecessiveSymbol},
                        none:      {value: 3, badge: false, clazz: 'noinherit', display: '', symbolFunction: this.showNoInheritSymbol}
                     };
  this.zygosityMap = {
                    HOM:        {value: 1, badge: true,  clazz: 'zyg_hom',        symbolFunction: this.showHomSymbol},
                        HET:        {value: 2, badge: false, clazz: 'het'        },
                        HOMREF:     {value: 3, badge: false, clazz: 'homref'     },
                        gt_unknown: {value: 4, badge: false, clazz: 'gt_unknown' }
                     };
  this.bookmarkMap = {
                    Y: {value: 1, badge: true,  clazz: 'bookmark',  symbolFunction: this.showBookmarkSymbol},
                        N: {value: 2, badge: false, clazz: '',          symbolFunction: this.showBookmarkSymbol}
                     };
  this.unaffectedMap = {
                        present_some:   {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.showAffectedPresentSymbol},
                        present_all:    {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.showAffectedPresentSymbol},
                        present_none:   {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.showAffectedPresentSymbol},
                        none:           {value: 104, badge: false, clazz: 'unaffected', symbolFunction: ''}
                 };
  this.affectedMap = {
                        present_all:    {value: 3,   badge: true,  clazz: 'affected',  symbolFunction: this.showAffectedPresentSymbol},
                        present_some:   {value: 4,   badge: true,  clazz: 'affected',  symbolFunction: this.showAffectedPresentSymbol},
                        present_none:   {value: 104, badge: false, clazz: 'affected',  symbolFunction: this.showAffectedPresentSymbol},
                        none:           {value: 104, badge: false, clazz: 'affected',  symbolFunction: ''}
                 };
    this.harmfulVariantMap = {
                        1:    {value: 1,   badge: true,  clazz: 'harmful1-variant',  symbolFunction: this.showHarmfulVariantSymbol},
                        2:    {value: 2,   badge: true,  clazz: 'harmful2-variant',  symbolFunction: this.showHarmfulVariantSymbol},
                        3:    {value: 3,   badge: true,  clazz: 'harmful3-variant',  symbolFunction: this.showHarmfulVariantSymbol},
                        none: {value: 101, badge: false, clazz: '',                  symbolFunction: ''}
                 };
  // For af range, value must be > min and <= max
  this.afHighestMap = [ {min: -100.1, max: -100,   value: +99, badge: false, clazz: '',    symbolFunction: ''},
                       {min: -1.1,   max: +0,        value: +2,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.showAfRareSymbol},
                       {min: -1.1,   max: +.0001,    value: +3,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.showAfRareSymbol},
                       {min: -1.1,   max: +.001,     value: +4,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.showAfRareSymbol},
                       {min: -1.1,   max: +.01,      value: +5,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.showAfRareSymbol},
                       {min: -1.1,   max: +.05,      value: +6,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.showAfRareSymbol},
                       {min: +.05,   max: +1,        value: +7,  badge: false,clazz: '',    symbolFunction: ''},
                      ];



  this.matrixRows = [
    {name:'Harmful variant'              , id:'harmfulVariant', order:0, index:12,  match: 'exact', attribute: 'harmfulVariantLevel',     map: this.harmfulVariantMap },
    {name:'Pathogenicity - ClinVar'      , id:'clinvar',        order:1, index:2,   match: 'exact', attribute: 'clinVarClinicalSignificance',     map: this.clinvarMap },
    {name:'Pathogenicity - PolyPhen'     , id:'polyphen',       order:2, index:6,   match: 'exact', attribute: 'vepPolyPhen', map: this.polyphenMap},
    {name:'Pathogenicity - SIFT'         , id:'sift',           order:3, index:7,   match: 'exact', attribute: 'vepSIFT',     map: this.siftMap},
    {name:'Impact (VEP)'                 , id:'impact',         order:4, index:0,   match: 'exact', attribute: IMPACT_FIELD_TO_COLOR,   map: this.impactMap},
    {name:'Most severe impact (VEP)'     , id:'highest-impact', order:5, index:1,   match: 'exact', attribute: IMPACT_FIELD_TO_FILTER,  map: this.highestImpactMap},
    {name:'Bookmark'                     , id:'bookmark',       order:6, index:10,  match: 'exact', attribute: 'isBookmark',     map: this.bookmarkMap },
    {name:'Inheritance Mode'             , id:'inheritance',    order:7, index:3,   match: 'exact', attribute: 'inheritance', map: this.inheritanceMap},
    {name:'Present in Affected'          , id:'affected',       order:8, index:8,   match: 'exact', attribute: 'affected_summary',  map: this.affectedMap},
    {name:'Absent in Unaffected'         , id:'unaffected',     order:9, index:9,   match: 'exact', attribute: 'unaffected_summary',  map: this.unaffectedMap},
    {name:'Allele Frequency <5%'         , id:'af-highest',     order:10, index:11, match: 'range', attribute: 'afHighest',      map: this.afHighestMap},
    {name:'Zygosity'                     , id:'zygosity',       order:11, index:4, match: 'exact', attribute: 'zygosity',      map: this.zygosityMap},
    {name:'Genotype'                     , id:'genotype',       order:12, index:5, match: 'field', attribute: 'eduGenotypeReversed' }
  ];

  this.matrixRowsBasic = [
    {name:'Pathogenicity - ClinVar',id:'clinvar',         order:0,  index:0,  match:  'field', height: 33, attribute: 'clinVarClinicalSignificance', formatFunction: this.formatClinvar, clickFunction: this.clickClinvar,  rankFunction: this.getClinvarRank  },
    {name:'Inheritance Mode'       ,id:'inheritance',     order:1,  index:1,  match:  'field', height: 21, attribute: 'inheritance',                 formatFunction: this.formatInheritance},
    {name:'Transcript'             ,id:'transcript',      order:2,  index:2,  match:  'field', height: 21, attribute: 'start',                       formatFunction: this.formatCanonicalTranscript},
    {name:'cDNA'                   ,id:'cdna',            order:3,  index:3,  match:  'field', height: 31, attribute: 'vepHGVSc',                    formatFunction: this.formatHgvsC    },
    {name:'Protein'                ,id:'protien',         order:4,  index:4,  match:  'field', height: 21, attribute: 'vepHGVSp',                    formatFunction: this.formatHgvsP    },
    {name:'Chr'                    ,id:'chr',             order:5,  index:5,  match:  'field', height: 21, attribute: 'chrom',                       },
    {name:'Position'               ,id:'position',        order:6,  index:6,  match:  'field', height: 21, attribute: 'start',                       },
    {name:'Ref'                    ,id:'ref',             order:7,  index:7,  match:  'field', height: 21, attribute: 'ref',                         },
    {name:'Alt'                    ,id:'alt',             order:8,  index:8,  match:  'field', height: 21, attribute: 'alt'                          },
    {name:'Mutation Freq 1000G'    ,id:'af-1000g',        order:9,  index:9,  match:  'field', height: 21, attribute: 'af1000G',                     formatFunction: this.formatAlleleFrequencyPercentage },
    {name:'Mutation Freq gnomAD'   ,id:'af-gnomAD',       order:10, index:10,  match: 'field', height: 21, attribute: 'afgnomAD',                    formatFunction: this.formatAlleleFrequencyPercentage }
  ];


  this.filteredMatrixRows = null;


  this.featureUnknown = 199;

}

MatrixCard.prototype.onGeneLoading = function() {
  $('#feature-matrix .tooltip').css("opacity", 0);
  if (isLevelEdu) {
    $('#rank-variants-title').text('Evaluated variants for ' + getProbandVariantCard().model.getName() );
  } else if (isLevelBasic) {
    $('#rank-variants-title').text('Table of Variants');
  }
  $("#feature-matrix").addClass("hide");
  $("#feature-matrix-note").addClass("hide");
  $('#matrix-track .warning').addClass("hide");
}

MatrixCard.prototype.setCellSize = function(sizeEnum) {
  var toggle = false;
  if (sizeEnum == 'small' && this.CELL_SIZE != this.CELL_SIZE_SMALL) {
    this.CELL_SIZE = this.CELL_SIZE_SMALL;
    toggle = true;
  } else if (sizeEnum == 'large' && this.CELL_SIZE != this.CELL_SIZE_LARGE) {
    this.CELL_SIZE = this.CELL_SIZE_LARGE;
    toggle = true;
  }

  if (toggle && this.featureMatrix) {
    this.featureMatrix.cellSize(this.CELL_SIZE);
    if (getProbandVariantCard().model && getProbandVariantCard().model.vcfData) {
      this.promiseFillFeatureMatrix(getProbandVariantCard().model.vcfData);
    }
  }

}

MatrixCard.prototype.toogleMoveRows = function() {
  if ($('#feature-matrix.shift-rows').length > 0) {
    $('#move-rows').text("Reorder");
  } else {
    $('#move-rows').text("Done");
  }
  $('#feature-matrix').toggleClass("shift-rows");
}

MatrixCard.prototype.removeRow = function(searchTerm, theMatrixRows) {
  var idx = theMatrixRows.findIndex(function(row) {
    return row.name === searchTerm;
  });

  if (idx >= 0) {
    var removedOrder = theMatrixRows[idx].order;
    theMatrixRows.splice(idx, 1);
    theMatrixRows.forEach(function(row) {
      if (+row.order > +removedOrder) {
        row.order--;
      }
    });
  }
}

MatrixCard.prototype.setRowLabel = function(searchTerm, newRowLabel) {
  this.matrixRows.forEach( function (row) {
    if (row.name.indexOf(searchTerm) >= 0) {
      row.name = newRowLabel;
    }
  });
  if (this.filteredMatrixRows) {
    this.filteredMatrixRows.forEach( function (row) {
      if (row.name.indexOf(searchTerm) >= 0) {
        row.name = newRowLabel;
      }
    });
  }

}
MatrixCard.prototype.setRowLabelById = function(id, newRowLabel) {
  this.matrixRows.forEach( function (row) {
    if (row.id == id) {
      row.name = newRowLabel;
    }
  });
  if (this.filteredMatrixRows) {
    this.filteredMatrixRows.forEach( function (row) {
      if (row.id == id) {
        row.name = newRowLabel;
      }
    });
  }

}

MatrixCard.prototype.setRowAttributeById = function(id, newRowAttribute) {
  this.matrixRows.forEach( function (row) {
    if (row.id == id) {
      row.attribute = newRowAttribute;
    }
  });
  if (this.filteredMatrixRows) {
    this.filteredMatrixRows.forEach( function (row) {
      if (row.id == id) {
        row.attribute = newRowAttribute;
      }
    });
  }

}

MatrixCard.prototype.getRowAttribute = function(searchTerm) {
  var attribute = "";
  this.matrixRows.forEach( function (row) {
    if (row.name.indexOf(searchTerm) >= 0) {
      attribute = row.attribute;
    }
  });
  return attribute;
}

MatrixCard.prototype.getRowOrder = function(searchTerm) {
  var order = "";
  this.matrixRows.forEach( function (row) {
    if (row.name.indexOf(searchTerm) >= 0) {
      order = row.order;
    }
  });
  return order;
}


MatrixCard.prototype.setTooltipGenerator = function(tooltipFunction) {
  this.featureMatrix.tooltipHTML(tooltipFunction);

}

MatrixCard.prototype.getVariantLabelClass = function(d, i) {
  var me = this;
  if (d.hasOwnProperty("fbCalled") && d.fbCalled == "Y") {
    return "called"
  } else {
    return "";
  }
}

MatrixCard.prototype.getVariantLabel = function(d, i) {
  return (i+1).toString();
}


MatrixCard.prototype.init = function() {
  var me = this;

  if (isLevelBasic) {
    this.matrixRows = this.matrixRowsBasic;
  } else if (isLevelEdu || isLevelBasic) {
    this.removeRow('Pathogenicity - SIFT', me.matrixRows);

    this.removeRow('Zygosity', me.matrixRows);
    this.removeRow('Bookmark', me.matrixRows);

    // Only show genotype on second educational tour or level basic
    if (!isLevelEdu || eduTourNumber != 2) {
      this.removeRow('Genotype', me.matrixRows);
    }
    // Only show inheritance on first educational tour or level basic
    if (!isLevelEdu || eduTourNumber != 1) {
      this.removeRow('Inheritance Mode', me.matrixRows);
    }
    this.removeRow('Most severe impact (VEP)', me.matrixRows);
    this.removeRow('Present in Affected', me.matrixRows);
    this.removeRow('Absent in Unaffected', me.matrixRows);
    this.removeRow('Allele Frequency - 1000G', me.matrixRows);
    this.removeRow('Allele Frequency - ExAC', me.matrixRows);

    this.setRowLabel('Impact - SnpEff',             'Severity');
    this.setRowLabel('Impact - VEP',                'Severity');
    this.setRowLabel('Pathogenicity - ClinVar',     'Known from research');
    this.setRowLabel('Pathogenicity - PolyPhen',    'Predicted effect');
    this.setRowLabel('Inheritance Mode',            'Inheritance');
  } else {
    this.removeRow('Genotype', me.matrixRows);
  }

  this.featureMatrix = featureMatrixD3()
            .margin({top: 0, right: 40, bottom: 7, left: 0})
            .cellSize(isLevelEdu ? me.CELL_SIZE_EDU : (isLevelBasic ? null : me.CELL_SIZE))
            .cellWidth(isLevelBasic ? me.CELL_WIDTH_BASIC : null)
            .cellHeights(isLevelBasic ? me.matrixRowsBasic.map(function(d){return d.height}) : null)
            .columnLabelHeight(isLevelEdu  || isLevelBasic ?  me.COLUMN_LABEL_HEIGHT_BASIC : me.COLUMN_LABEL_HEIGHT)
            .rowLabelWidth(isLevelEdu  ? me.ROW_LABEL_WIDTH_EDU : (isLevelBasic ? me.ROW_LABEL_WIDTH_BASIC : me.ROW_LABEL_WIDTH))
            .columnLabel( me.getVariantLabel )
            .columnLabelClass( me.getVariantLabelClass )
            .columnLabelSymbol( me.showColumnHeaderSymbol)
            .adjustTooltipCoordinates( function(variant) {
                  variant.screenYMatrix += $('.navbar-fixed-top').outerHeight();
                  //variant.screenXMatrix += $("#slider-left").hasClass("hide") ? 0 : $('#slider-left').outerWidth();
            })
            .on('d3click', function(variant) {
              if (variant ==  null) {
                me.unpin();
              } else {
                if (variant != clickedVariant) {
                  clickedVariant = isLevelBasic ? null : variant;
                  me.showTooltip(variant, true);
                  variantCards.forEach(function(variantCard) {
                    variantCard.showVariantCircle(variant);
                    variantCard.showCoverageCircle(variant, getProbandVariantCard());
                  });

                } else {
                  me.unpin();
                }
              }

            })
             .on('d3mouseover', function(variant) {
              if (clickedVariant == null) {
                me.showTooltip(variant);
                variantCards.forEach(function(variantCard) {
                  variantCard.showVariantCircle(variant);
                  variantCard.showCoverageCircle(variant, getProbandVariantCard());
                });

              }
            })
            .on('d3mouseout', function() {
              if (clickedVariant == null) {
                unpinAll();
              }
            })
            .on('d3rowup', function(i) {
              if (isLevelEdu  || isLevelBasic) {
                return;
              }
              var column = null;
              var columnPrev = null;
              me.filteredMatrixRows.forEach(function(col) {
                if (col.order == i) {
                  column = col;
                } else if (col.order == i - 1) {
                  columnPrev = col;
                }
              });
              if (column && columnPrev) {
                column.order = column.order - 1;
                columnPrev.order = columnPrev.order + 1;
              }
              getProbandVariantCard().sortFeatureMatrix();

            })
            .on('d3rowdown', function(i) {
              if (isLevelEdu  || isLevelBasic) {
                return;
              }
              var column = null;
              var columnNext = null;
              me.filteredMatrixRows.forEach(function(col) {
                if (col.order == i) {
                  column = col;
                } else if (col.order == i + 1) {
                  columnNext = col;
                }
              });
              if (column && columnNext) {
                column.order = column.order + 1;
                columnNext.order = columnNext.order - 1;
              }
              getProbandVariantCard().sortFeatureMatrix();

            });

  var matrixCardSelector = $('#matrix-track');
  matrixCardSelector.find('#expand-button').on('click', function() {
    matrixCardSelector.find('.fullview').removeClass("hide");
  });
  matrixCardSelector.find('#minimize-button').on('click', function() {
    matrixCardSelector.find('.fullview').addClass("hide");
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



MatrixCard.prototype.unpin = function(saveClickedVariant) {
  if (!saveClickedVariant) {
    clickedVariant = null;
  }

  this.hideTooltip();

  d3.select('#feature-matrix .colbox.current').classed('current', false);

  variantCards.forEach(function(variantCard) {
    variantCard.hideCoverageCircle();
  });

}

MatrixCard.prototype._isolateVariants = function() {
  variantCards.forEach(function(variantCard) {
    variantCard.isolateVariants(d3.selectAll("#feature-matrix .col.current").data());
  });

}


MatrixCard.prototype.addBookmarkFlag = function(theVariant) {
  var me = this;
  var i = 0;
  var index = -1;
  d3.select("#feature-matrix").datum().forEach( function(variant) {
    if (variant.start == theVariant.start &&
      variant.alt == theVariant.alt &&
      variant.end == theVariant.end) {
      variant.isBookmark = 'Y';
      index = i;
    }
    i++;
  });
  if (index >= 0) {
    var colNode = d3.selectAll('#feature-matrix .col')[0][index];
    var column  = d3.select(colNode);
    var colObject = column.datum();

    var rowIdx = this.getRowOrder("Bookmark");
    var selection = column.selectAll(".cell:nth-child(" + (rowIdx+1) + ")").data([{clazz: 'bookmark' }]);
    this.showBookmarkSymbol(selection, {cellSize: me.featureMatrix.cellSize()});
  }

}
MatrixCard.prototype.removeBookmarkFlag = function(theVariant) {
  var i = 0;
  var index = -1;
  d3.select("#feature-matrix").datum().forEach( function(variant) {
    if (variant.start == theVariant.start &&
      variant.alt == theVariant.alt &&
      variant.end == theVariant.end) {
      variant.isBookmark = 'Y';
      index = i;
    }
    i++;
  });
  if (index >= 0) {
    var colNode = d3.selectAll('#feature-matrix .col')[0][index];
    var column  = d3.select(colNode);
    var colObject = column.datum();
    colObject.isBookmark = 'N';

    var rowIdx = this.getRowOrder("Bookmark");
    var selection = column.selectAll(".cell:nth-child(" + (rowIdx+1) + ") g.bookmark").remove();
  }

}
MatrixCard.prototype.highlightVariant = function(theVariant, showTooltip) {
  var me  = this;
  var index = -1;
  var i = 0;
  // The feature matrix may not be filled yet.  In this case, just return here.
  if (d3.select("#feature-matrix") == null || d3.select("#feature-matrix").datum() == null ) {
    return;
  }

  d3.select("#feature-matrix").datum().forEach( function(variant) {
    if (variant.start == theVariant.start &&
      variant.alt == theVariant.alt &&
      variant.end == theVariant.end) {
      index = i;
    }
    i++;

  })
  me.clearSelections();
  if (index >= 0) {
    var colNode = d3.selectAll('#feature-matrix .col')[0][index];
    var column  = d3.select(colNode);
    var colObject = column.datum();
    column.classed("active", true);
    column.select(".colbox").classed("current", true);

    var left = (isLevelBasic ? me.CELL_WIDTH_BASIC : me.CELL_SIZE) * index+1;
    $("#feature-matrix").scrollLeft(left);

    if (showTooltip) {
      // Get screen coordinates of column.  We will use this to position the
      // tooltip above the column and scroll left if necessary
      var matrix = column.node()
                     .getScreenCTM()
                     .translate(+column.node().getAttribute("cx"),+column.node().getAttribute("cy"));
      // Firefox doesn't consider the transform (slideout's shift left) with the getScreenCTM() method,
      // so instead the app will use getBoundingClientRect() method instead which does take into consideration
      // the transform.
      var boundRect = column.node().getBoundingClientRect();
      colObject.screenXMatrix = d3.round(boundRect.left + (boundRect.width/2));

      // Since the body is vertically scrollable, we need to calculate the y by offsetting to a height of the
      // scroll position in the container.
      colObject.screenYMatrix = window.pageYOffset + matrix.f + me.featureMatrix.margin().top;
      colObject.screenYMatrix  += $('.navbar-fixed-top').outerHeight();

      clickedVariant = colObject;
      me.showTooltip(colObject, true);

    }

  }

}


MatrixCard.prototype.clearSelections = function() {
  d3.selectAll('#feature-matrix .col').classed("active", false);
  d3.selectAll('#feature-matrix .cell').classed("active", false);
  d3.selectAll('#feature-matrix .colbox').classed("current", false);

  d3.selectAll('#feature-matrix .y.axis text').classed("active", false);
  d3.selectAll('#feature-matrix .y.axis text').classed("current", false);
  d3.selectAll('#feature-matrix .y.axis .up').classed("faded", true);
  d3.selectAll('#feature-matrix .y.axis .down').classed("faded", true);
}

MatrixCard.prototype.reset = function() {
  this.filteredMatrixRows = null;
}


MatrixCard.prototype.tooltipScroll = function(direction) {
  variantTooltip.scroll(direction, "#matrix-tooltip");
}


MatrixCard.prototype.hideTooltip = function() {
  //var tooltip = d3.select('#container #matrix-track .tooltip');
  var tooltip = d3.select('#matrix-tooltip');
  tooltip.transition()
           .duration(500)
           .style("opacity", 0)
           .style("z-index", 0)
           .style("pointer-events", "none");

}

MatrixCard.prototype.adjustTooltip = function(variant) {
  if (d3.select('#matrix-tooltip').style('opacity') != 0) {
    this.highlightVariant(variant, true);
  }
}

MatrixCard.prototype.showTooltip = function(variant, lock) {
  var me = this;

  // Don't show the tooltip for mygene2 beginner mode
  if (isLevelBasic) {
    return;
  }

  var xMatrix = variant.screenXMatrix;
  var yMatrix = variant.screenYMatrix;

  if (lock) {
    getRelevantVariantCards().forEach(function(vc) {
      vc.unpin(true);
    })

    if (isLevelEdu) {
      edutour.checkVariant(variant);
    }
  }



  if (lock && !isLevelEdu && !isLevelBasic) {


    // Show tooltip before we have hgvs notations
    me._showTooltipImpl(variant, true)



    var showTooltipExtraAnnot = function(annotatedVariants, callbackNotFound) {
      var targetVariants = annotatedVariants.filter(function(v) {
        return clickedVariant &&
                 clickedVariant.start == v.start &&
                 clickedVariant.ref   == v.ref &&
                 clickedVariant.alt   == v.alt;
      });
      if (targetVariants.length > 0) {
        var annotatedVariant = targetVariants[0];
        annotatedVariant.screenXMatrix = xMatrix;
            annotatedVariant.screenYMatrix = yMatrix;
        me._showTooltipImpl(annotatedVariant, true);
      } else {
        if (callbackNotFound) {
          callbackNotFound();
        }
      }

    }

    getProbandVariantCard()
        .model
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
    me._showTooltipImpl(variant, lock);
  }
}



MatrixCard.prototype._showTooltipImpl = function(variant, lock) {
  var me = this;

  //var tooltip = d3.select('#container #matrix-track .tooltip');
  var tooltip = d3.select('#matrix-tooltip');


  var screenX = variant.screenXMatrix;

  var screenY = variant.screenYMatrix;
  if (isLevelEdu) {
    screenY += $('#nav-edu-tour').outerHeight();
  }

  var coord = {'x':                  screenX,
               'y':                  screenY,
               'height':             matrixCard.featureMatrix.height(),
               'parentWidth':        $('.navbar-fixed-top').outerWidth(),
               'preferredPositions': [ {top:    ['center', 'right', 'left' ]},
                                       {right:  ['middle', 'top',   'bottom']},
                                       {left:   ['middle', 'top',   'bottom']},
                                       {bottom: ['right',  'left',  'center']} ]};


  variantTooltip.fillAndPositionTooltip(tooltip, variant, lock, coord, getProbandVariantCard() );
  tooltip.selectAll("#unpin").on('click', function() {
    me.unpin();
  });
  tooltip.selectAll("#tooltip-scroll-up").on('click', function() {
    me.tooltipScroll("up");
  });
  tooltip.selectAll("#tooltip-scroll-down").on('click', function() {
    me.tooltipScroll("down");
  });

}

MatrixCard.prototype.promiseFillFeatureMatrix = function(theVcfData) {
  var me = this;

  return new Promise(function(resolve, reject) {

    var unfilteredVcfData = theVcfData;

    if (theVcfData == null) {
      resolve();
    } else {
      bookmarkCard.promiseDetermineVariantBookmarks(theVcfData, window.gene)
      .then(function() {


        // Figure out if we should show the unaffected sibs row
        if (me.filteredMatrixRows == null) {
          me.filteredMatrixRows = $.extend(true, [], me.matrixRows);
          var affectedInfo = getAffectedInfo();
          var affected = affectedInfo.filter(function(info) {
            return info.status == 'affected' && info.relationship != 'proband';
          })
          var unaffected = affectedInfo.filter(function(info) {
            return info.status == 'unaffected' && info.relationship != 'proband';
          })
          if (affected.length == 0) {
            me.removeRow('Present in Affected', me.filteredMatrixRows);
          }
          if (unaffected.length == 0) {
            me.removeRow('Absent in Unaffected', me.filteredMatrixRows);
          }

          // Figure out if we should show any rows for generic annotations
          var genericMatrixRows = genericAnnotation.getMatrixRows(theVcfData.genericAnnotators);

          genericMatrixRows.forEach(function(matrixRow) {
            matrixRow.index = me.filteredMatrixRows.length;
            matrixRow.order = me.filteredMatrixRows.length;
            me.filteredMatrixRows.push(matrixRow);
          })
        }




        resizeCardWidths();


        if (theVcfData != null) {
          me.featureVcfData = {};
          me.featureVcfData.features = [];
          theVcfData.features.forEach(function(variant) {
            me.featureVcfData.features.push($.extend({}, variant));
          });
        }

        // Sort the matrix columns
        me.filteredMatrixRows = me.filteredMatrixRows.sort(function(a, b) {
          if (a.order == b.order) {
            return 0;
          } else if (a.order < b.order) {
            return -1;
          } else {
            return 1;
          }
        });



        // Fill all features used in feature matrix for each variant
        me.featureVcfData.features.forEach( function(variant) {
          var features = [];
          for (var i = 0; i < me.filteredMatrixRows.length; i++) {
            features.push(null);
          }

          me.filteredMatrixRows.forEach( function(matrixRow) {
            var rawValue = null;
            if (matrixRow.attribute instanceof Array) {
              rawValue = genericAnnotation.getValue(variant, matrixRow.attribute);
            } else {
              rawValue = variant[matrixRow.attribute];
            }
            var theValue    = null;
            var mappedValue = null;
            var mappedClazz = null;
            var symbolFunction = null;
            var clickFunction = matrixRow.clickFunction;
            // Don't fill in clinvar for now
            if (matrixRow.attribute == 'clinvar') {
              rawValue = 'N';
            }
            if (rawValue != null && (me.isNumeric(rawValue) || rawValue != "")) {
              if (matrixRow.match == 'field') {
                if (matrixRow.formatFunction) {
                  theValue = matrixRow.formatFunction.call(me, variant, rawValue);
                } else {
                  theValue = rawValue;
                }
                mappedClazz = matrixRow.attribute;
                if (matrixRow.rankFunction) {
                  mappedValue = matrixRow.rankFunction.call(me, variant, rawValue);
                } else {
                  mappedValue = theValue;
                }
                symbolFunction = matrixRow.symbolFunction ? matrixRow.symbolFunction : me.showTextSymbol;

              } else if (matrixRow.match == 'exact') {
                // We are going to get the mapped value through exact match,
                // so this will involve a simple associative array lookup.
                // Some features (like impact) are multi-value and are stored in a
                // an associative array.  In this case, we loop through the feature
                // values, keeping the lowest (more important) mapped value.
                if (me.isDictionary(rawValue)) {
                  // Iterate through the objects in the associative array.
                  // Keep the lowest mapped value
                  if (Object.keys(rawValue).length > 0) {
                    for (val in rawValue) {
                      var entry = matrixRow.map[val];
                      if (entry != null && entry.symbolFunction && (mappedValue == null || entry.value < mappedValue)) {
                        mappedValue = entry.value;
                        mappedClazz = entry.clazz;
                        symbolFunction = entry.symbolFunction;
                        theValue = val;
                      }
                    }
                  } else {
                    var entry = matrixRow.map.none;
                    if (entry != null && entry.symbolFunction && (mappedValue == null || entry.value < mappedValue)) {
                      mappedValue = entry.value;
                      mappedClazz = entry.clazz;
                      symbolFunction = entry.symbolFunction;
                      theValue = '';
                    }
                  }
                } else {
                  if (matrixRow.map.hasOwnProperty(rawValue)) {
                    mappedValue = matrixRow.map[rawValue].value;
                    mappedClazz = matrixRow.map[rawValue].clazz;
                    symbolFunction = matrixRow.map[rawValue].symbolFunction;
                    theValue = rawValue;
                  } else {
                    console.log("No matrix value to map to " + rawValue + " for " + matrixRow.attribute);
                  }

                }
              } else if (matrixRow.match == 'range') {
                // If this feature is a range, get the mapped value be testing if the
                // value is within a min-max range.
                if (me.isNumeric(rawValue)) {
                  theValue = d3.format(",.3%")(+rawValue);
                  var lowestValue = 9999;
                  matrixRow.map.forEach( function(rangeEntry) {
                    if (+rawValue > rangeEntry.min && +rawValue <= rangeEntry.max) {
                      if (rangeEntry.value < lowestValue) {
                        lowestValue = rangeEntry.value;
                        mappedValue = rangeEntry.value;
                        mappedClazz = rangeEntry.clazz;
                        symbolFunction = rangeEntry.symbolFunction;
                      }
                    }
                  });
                }
              }

            } else {
              rawValue = '';
              mappedClazz = '';
            }
            features[matrixRow.order] = {
                                  'value': theValue,
                                  'rank': (mappedValue ? mappedValue : me.featureUnknown),
                                  'clazz': mappedClazz,
                                  'symbolFunction': symbolFunction,
                                  'clickFunction': clickFunction
                                };
          });

          variant.features = features;
        });
        // Sort the variants by the criteria that matches
        var sortedFeatures = me.featureVcfData.features.sort(function (a, b) {
          var featuresA = "";
          var featuresB = "";

          // The features have been initialized in the same order as
          // the matrix column order. In each interation,
          // exit with -1 or 1 if we have non-matching values;
          // otherwise, go to next iteration.  After iterating
          // through every column, if we haven't exited the
          // loop, that means all features of a and b match
          // so return 0;
          for (var i = 0; i < me.filteredMatrixRows.length; i++) {
            if (a.features[i] == null) {
              return 1;
            } else if (b.features[i] == null) {
              return -1;
            } else if (a.features[i].rank > 99  && b.features[i].rank > 99) {
              // In this case, we don't consider the rank and will look at the next feature for ordering
            } else if (a.features[i].rank > 99) {
              return 1;
            } else if (b.features[i].rank > 99) {
              return -1;
            } else if (a.features[i].rank < b.features[i].rank) {
              return -1;
            } else if (a.features[i].rank > b.features[i].rank) {
            return 1;
          } else {
          }
          }
          return 0;
        });

        $("#feature-matrix").removeClass("hide");
        $("#feature-matrix-note").removeClass("hide");
        $('#move-rows').removeClass("hide");

        // Load the chart with the new data
        me.featureMatrix.matrixRows(me.filteredMatrixRows);
        var selection = d3.select("#feature-matrix").data([sortedFeatures]);

        me.featureMatrix(selection, {showColumnLabels: true, simpleColumnLabels: true});


        if (sortedFeatures.length == 0 && filterCard.hasFilters() &&  unfilteredVcfData && unfilteredVcfData.features.length > 0) {
          $('#zero-variants').addClass("zero-filtered-variants");
          $('#zero-variants').text("No variants passed the filter" );
          $('#zero-variants').removeClass("hide");
          $('#matrix-panel').removeClass("hide");
          $('#feature-matrix-note').addClass("hide");
          $('#feature-matrix').addClass("hide");
        } else if (sortedFeatures.length == 0 ) {
          $('#zero-variants').removeClass("zero-filtered-variants");
          $('#zero-variants').text("0 variants found for gene " + window.gene.gene_name );
          $('#zero-variants').removeClass("hide");
          $('#feature-matrix').addClass("hide");
          $('#feature-matrix-note').addClass("hide");
          $('#matrix-panel').removeClass("hide");
        } else {
          $('#zero-variants').text("");
          $('#zero-variants').addClass("hide");
          $('#feature-matrix').removeClass("hide");
          $('#feature-matrix-note').removeClass("hide");
          $('#matrix-panel').removeClass("hide");
        }

        resolve();


      })
    }
  })


}

MatrixCard.prototype.setFeatureMatrixSource = function(theVcfData) {
  this.sourceVcfData = theVcfData;
}

MatrixCard.prototype.isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

MatrixCard.prototype.isDictionary = function(obj) {
  if(!obj) {
    return false;
  }
  if(Array.isArray(obj)) {
    return false;
  }
  if (obj.constructor != Object) {
    return false;
  }
  return true;
}


MatrixCard.prototype.showColumnHeaderSymbol = function(selection, options) {
  options = options || {};
  if (!options.cellSize) {
    options.cellSize = matrixCard.CELL_SIZE;
  }

  selection.each(function(d) {
    var colhdr = d3.select(this);
    if (d.hasOwnProperty("fbCalled") && d.fbCalled == "Y") {
          colhdr.append("g")
                 .attr("transform", "translate(" + (options.cellSize - 17)/2 + ",-25)")
                 .append("use")
                 .attr("id", "checkmark-called")
                 .attr("xlink:href", "#circle-checkmark-symbol")
                 .attr("width",  17)
                 .attr("height", 17)
                 .style("pointer-events", "none");

    }

  })


};

MatrixCard.prototype.showHarmfulVariantSymbol = function(selection, options) {
  var width, height, clazz;
  options = options || {};

  var datumAttrs = selection.datum() || {};

  var attrs = {
    width: "13",
    height: "13",
    transform: datumAttrs.rank && datumAttrs.rank == 1 ? "translate(2,3)" : "translate(2,2)",
    clazz: ""
  };


  var cellSizeAttrs = {};
  if (options.cellSize > 18) {
    cellSizeAttrs.width = "16",
    cellSizeAttrs.height = "16",
    cellSizeAttrs.transform = datumAttrs.rank && datumAttrs.rank == 1 ? "translate(2,3)" : "translate(2,2)"
  }

  $.extend(attrs, datumAttrs, cellSizeAttrs, options);

  selection.append("g")
           .attr("transform", attrs.transform)
           .append("use")
           .attr("xlink:href", datumAttrs.rank == 1 ? "#lightning-symbol" : "#error-symbol")
           .attr("class", attrs.clazz)
           .attr("width",  datumAttrs.rank == 1 ? attrs.width - 2  : attrs.width )
           .attr("height", datumAttrs.rank == 1 ? attrs.height - 2 : attrs.height)
           .style("pointer-events", "none");
};

MatrixCard.prototype.showClinVarSymbol = function(selection, options) {
  var width, height, clazz;
  options = options || {};

  var attrs = {
    width: "14",
    height: "14",
    transform: "translate(2,1)",
    clazz: ""
  };

  var datumAttrs = selection.datum() || {};

  var cellSizeAttrs = {};
  if (options.cellSize > 18) {
    cellSizeAttrs.width = "17",
    cellSizeAttrs.height = "17",
    cellSizeAttrs.transform = "translate(2,2)"
  }

  $.extend(attrs, datumAttrs, cellSizeAttrs, options);

  var colors = {
    clinvar_path: "#ad494A",
    clinvar_lpath: "#FB7737",
    clinvar_uc: "rgba(231,186,82,1)",
    clinvar_benign: "rgba(156,194,49,1)",
    clinvar_lbenign: "rgba(181,207,107,1)",
    clinvar_other: "rgb(189,189,189)",
    clinvar_cd: "rgb(111, 182, 180)"
  };

  selection.append("g")
           .attr("transform", attrs.transform)
           .append("use")
           .attr("xlink:href", "#clinvar-symbol")
           .attr("width", attrs.width)
           .attr("height", attrs.height)
           .style("pointer-events", "none")
           .style("fill", colors[attrs.clazz]);
};

MatrixCard.prototype.showPolyPhenSymbol = function(selection, options) {
  options = options || {};
  var attrs = {
    transform: "translate(2,2)",
    width: "13",
    height: "13",
    clazz: ""
  };

  var cellSizeAttrs = {};
  if (options.cellSize > 18) {
    cellSizeAttrs.width = "17",
    cellSizeAttrs.height = "17",
    cellSizeAttrs.transform = "translate(2,2)"
  }

  var datumAttrs = selection.datum() || {};

  $.extend(attrs, datumAttrs, options, cellSizeAttrs);

  var colors = {
    polyphen_probably_damaging: "#ad494A",
    polyphen_possibly_damaging: "#FB7737",
    polyphen_benign: "rgba(181, 207, 107,1)"
  };

  selection.append("g")
           .attr("transform", attrs.transform)
           .append("use")
           .attr("xlink:href", "#biohazard-symbol")
           .attr("width", attrs.width)
           .attr("height", attrs.height)
           .style("pointer-events", "none")
           .style("fill", colors[attrs.clazz]);

};

MatrixCard.prototype.showSiftSymbol = function(selection, options) {
  options = options || {};
  var attrs = {
    transform: "translate(2,2)",
    width: "14",
    height: "14",
    clazz: ""
  };

  var cellSizeAttrs = {};
  if (options.cellSize > 18) {
    cellSizeAttrs.width = "17",
    cellSizeAttrs.height = "17",
    cellSizeAttrs.transform = "translate(2,2)"
  }

  var datumAttrs = selection.datum() || {};

  $.extend(attrs, datumAttrs, options, cellSizeAttrs);

  var colors = {
    sift_deleterious: "#ad494A",
    sift_deleterious_low_confidence: "#FB7737",
    sift_tolerated_low_confidence: "rgba(231,186,82,1)",
    sift_tolerated: "rgba(181, 207, 107,1)"
  };

  selection.append("g")
           .attr("transform", attrs.transform)
           .append("use")
           .attr("xlink:href", "#danger-symbol")
           .attr("width", attrs.width)
           .attr("height", attrs.height)
           .style("pointer-events", "none")
           .style("fill", colors[attrs.clazz]);
};

MatrixCard.prototype.showMutationTasterSymbol = function(selection, options) {
  options = options || {};
  var attrs = {
    transform: "translate(2,2)",
    width: "14",
    height: "14",
    clazz: ""
  };

  var cellSizeAttrs = {};
  if (options.cellSize > 18) {
    cellSizeAttrs.width = "17",
    cellSizeAttrs.height = "17",
    cellSizeAttrs.transform = "translate(2,2)"
  }

  var datumAttrs = selection.datum() || {};

  $.extend(attrs, datumAttrs, options, cellSizeAttrs);

  var colors = {
    mt_disease_causing_auto: "#ad494A",
    mt_disease_causing:      "#FB7737",
    mt_polymorphism:         "rgba(231,186,82,1)",
    mt_polymorphism_auto:    "rgba(181, 207, 107,1)"
  };

  selection.append("g")
           .attr("transform", attrs.transform)
           .append("use")
           .attr("xlink:href", "#danger-symbol")
           .attr("width", attrs.width)
           .attr("height", attrs.height)
           .style("pointer-events", "none")
           .style("fill", colors[attrs.clazz]);
};


MatrixCard.prototype.showAfSymbol = function(selection, options) {
  var symbolDim   = { transform: "translate(2,2)",    size: "12" };
  if (options.cellSize > 18) {
    symbolDim   = { transform: "translate(2,2)",    size: "17" };
  }
  var symbolAttrs = {
    af_unique:    { fill: "rgb(199, 0, 1)",          transform: symbolDim.transform,   size: symbolDim.size},
    af_uberrare:  { fill: "rgba(204, 28, 29, 0.79)", transform: symbolDim.transform,   size: symbolDim.size},
    af_superrare: { fill: "rgba(255, 44, 0, 0.76)",  transform: symbolDim.transform,   size: symbolDim.size},
    af_rare:      { fill: "rgb(247, 138, 31)",       transform: symbolDim.transform,   size: symbolDim.size},
    af_uncommon:  { fill: "rgb(224, 195, 128)",      transform: symbolDim.transform,   size: symbolDim.size},
    af_common:    { fill: "rgb(189,189,189)",        transform: symbolDim.transform,   size: symbolDim.size}
  }
  // For the gene badge, we will display in a smaller size
  if (options && options.hasOwnProperty('transform')) {
    symbolAttrs[selection.datum().clazz].transform = options.transform;
  }
  if (options && options.hasOwnProperty('height')) {
    symbolAttrs[selection.datum().clazz].size = options.height;
  }
  selection.append("g")
    .attr("class", function(d, i)    { return d.clazz; })
    .attr("transform", function(d,i) { return symbolAttrs[d.clazz].transform; })
    .append("use")
    .attr("xlink:href", "#af-symbol")
    .style("pointer-events", "none")
    .style("fill", function(d,i)  { return symbolAttrs[d.clazz].fill; })
    .attr("width", function(d,i)  { return symbolAttrs[d.clazz].size; })
    .attr("height", function(d,i) { return symbolAttrs[d.clazz].size; });
};

MatrixCard.prototype.showAfRareSymbol = function(selection, options) {
  var symbolDim   = { transform: "translate(2,2)",    size: "12" };
  if (options.cellSize > 18) {
    symbolDim   = { transform: "translate(2,2)",    size: "17" };
  }
  var symbolAttrs = {
    afhighest_rare:  { fill: "rgba(204, 28, 29, 0.79)", transform: symbolDim.transform,   size: symbolDim.size}
  }
  // For the gene badge, we will display in a smaller size
  if (options && options.hasOwnProperty('transform')) {
    symbolAttrs[selection.datum().clazz].transform = options.transform;
  }
  if (options && options.hasOwnProperty('height')) {
    symbolAttrs[selection.datum().clazz].size = options.height;
  }
  selection.append("g")
    .attr("class", function(d, i)    { return d.clazz; })
    .attr("transform", function(d,i) { return symbolAttrs[d.clazz].transform; })
    .append("use")
    .attr("xlink:href", "#af-symbol")
    .style("pointer-events", "none")
    .style("fill", function(d,i)  { return symbolAttrs[d.clazz].fill; })
    .attr("width", function(d,i)  { return symbolAttrs[d.clazz].size; })
    .attr("height", function(d,i) { return symbolAttrs[d.clazz].size; });
};

MatrixCard.prototype.showHomSymbol = function(selection, options) {
  var symbolOptions = {x: 0, y: 7, fontSize: "6.5px", width: 15, height: 10};
  if (options.cellSize > 18) {
    symbolOptions = {x: 0, y: 10, fontSize: "9px",  width: 19, height: 14};
  }
  var g = selection.append("g")
                   .attr("transform", "translate(1,4)");

  g.append("rect")
   .attr("width", symbolOptions.width)
   .attr("height", symbolOptions.height)
   .attr("class", "zyg_hom " + selection.datum().clazz)
   .style("pointer-events", "none");

  g.append("text")
   .attr("x", symbolOptions.x)
   .attr("y", symbolOptions.y)
   .style("fill", "white")
   .style("font-weight", "bold")
   .style("font-size", symbolOptions.fontSize)
   .text("Hom");
};

MatrixCard.prototype.showRecessiveSymbol = function (selection, options) {
  options = options || {};
  var width = (options.cellSize > 18) ? "19" : (options.width || "16");

  selection.append("g")
           .attr("transform", options.transform || "translate(1,2)")
           .append("use")
           .attr("xlink:href", '#recessive-symbol')
           .attr("width", width)
           .attr("height", width)
           .style("pointer-events", "none");
};

MatrixCard.prototype.showDeNovoSymbol = function(selection, options) {
  options = options || {};

  var width = (options.cellSize > 18) ? "19" : (options.width || "16");

  var transform = (options.cellSize > 18) ? "translate(1,2)" : (options.transform || "translate(1,0)");

  selection.append("g")
           .attr("transform", transform)
           .append("use")
           .attr("xlink:href", '#denovo-symbol')
           .attr("width", width)
           .attr("height", width)
           .style("pointer-events", "none");

};


MatrixCard.prototype.showTextSymbol = function (selection, options) {
  var translate = options.cellSize > 18 ? "translate(3,0)" : "translate(0,0)";
  var text =  selection.append("g")
                 .attr("transform", translate)
                 .append("text")
                 .attr("class", function(d,i) {
                    if (selection.datum().clickFunction) {
                      return "clickable";
                    } else {
                      return "";
                    }
                 })
                 .attr("x", 0)
                 .attr("y", isLevelBasic ? 14 : 11)
                 .attr("dy", "0em")
                 .text(selection.datum().value)

  MatrixCard.wrap(text, options.cellSize, 3);
};

MatrixCard.prototype.showNumericSymbol = function (selection, options) {
  var translate = options.cellSize > 18 ? "translate(0,4)" : "translate(0,0)";
  var text =  selection.append("g")
                 .attr("transform", translate)
                 .append("text")
                 .attr("class", function(d,i) {
                  if (selection.datum().clickFunction) {
                    return "clickable";
                  } else {
                    return "";
                  }
               })
                 .attr("x", 0)
                 .attr("y", isLevelBasic ? 14 : 11)
                 .attr("dy", "0em")
                 .text(selection.datum().value);
  MatrixCard.wrap(text, options.cellSize, 3, options.cellSize - 1);
};


MatrixCard.prototype.showAffectedPresentSymbol = function (selection, options) {
  var symbolLink = null;
  var id = "thumbs-grey-symbol";

  if ( selection.datum().clazz == "affected") {
    if (selection.datum().value == "present_all") {
      symbolLink = '#thumbs-up-symbol';
      id = "thumbs-green-symbol";
    } else if (selection.datum().value == "present_some") {
      symbolLink = '#question-mark-symbol';
    } else if (selection.datum().value == "present_none") {
      symbolLink = '#thumbs-down-symbol';
    }
  } else if (selection.datum().clazz == "unaffected") {
    if (selection.datum().value == "present_all") {
      symbolLink = '#thumbs-down-symbol';
    } else if (selection.datum().value == "present_some") {
      symbolLink = '#question-mark-symbol';
    } else if (selection.datum().value == "present_none") {
      symbolLink = '#thumbs-up-symbol';
      id = "thumbs-green-symbol";
    }
  }

  selection.append("g")
                   .attr("id", id)
               .attr("transform",  "translate(1,2)")
               .append("use")
               .attr("xlink:href", symbolLink)
               .attr("width",   options && options.cellSize > 18 ? "16" : "14")
               .attr("height",  options && options.cellSize > 18 ? "16" : "14")
               .style("pointer-events", "none");


};

MatrixCard.prototype.showNoInheritSymbol = function (selection) {

};

MatrixCard.prototype.showBookmarkSymbol = function(selection, options) {
  var optionsSize = options && options.cellSize && options.cellSize > 18 ? 16 : 11;
  if (selection.datum().clazz) {
    selection.append("g")
       .attr("class", selection.datum().clazz)
           .attr("transform", selection.datum().translate || "translate(2,2)")
           .append("use")
           .attr("xlink:href", '#bookmark-symbol')
           .attr("width",  selection.datum().width || optionsSize)
           .attr("height", selection.datum().height || optionsSize)
           .style("pointer-events", "none")
           .style("cursor", "pointer");

  }
}

MatrixCard.prototype.showPhenotypeSymbol = function(selection) {
  if (selection.datum().clazz) {
    selection.append("g")
       .attr("class", selection.datum().clazz)
           .attr("transform", selection.datum().translate || "translate(0,-1)")
           .append("use")
           .attr("xlink:href", '#phenotype-symbol')
           .attr("width",  selection.datum().width || 13)
           .attr("height", selection.datum().width || 13);

  }
}

MatrixCard.prototype.showImpactSymbol = function(selection, options) {
  options = options || {};
  var me = this;
  var type = d3.select(selection.node().parentNode).datum().type;
  var symbolScale = d3.scale.ordinal()
                    .domain([3,4,5,6,7,8,9])
                    .range([9,15,25,38,54,58,98]);
  var symbolScaleCircle = d3.scale.ordinal()
                        .domain([3,4,5,6,7,8,9])
                        .range([9,15,25,58,68,78,128]);

  var symbolSize = symbolScale(options.cellSize > 18 ? 9 : 6);
  var symbolSizeCircle = symbolScaleCircle(options.cellSize > 18 ? 9 : 6);

  var translate       = options.cellSize > 18 ?  "translate(4,4)" : "translate(4,4)";
  var translateSymbol = options.cellSize > 18 ?  "translate(10,10)" : "translate(8,8)";
  var width           = options.cellSize > 18 ? 12 : 8;
  var height          = width;

  if (type.toUpperCase() == 'SNP' || type.toUpperCase() == 'MNP') {
    selection.append("g")
             .attr("transform", translate)
             .append("rect")
             .attr("width", width)
             .attr("height", height)
             .attr("class", "filter-symbol " + selection.datum().clazz + " snp")
             .style("pointer-events", "none");
  } else {
    selection
      .append("g")
      .attr("transform", translateSymbol)
      .append('path')
          .attr("d", function(d,i) {
            return d3.svg
                     .symbol()
                     .size( function(d,i) {
                      if (type.toUpperCase() == 'INS') {
                        return symbolSizeCircle;

                      } else {
                        return symbolSize;
                      }
                     })
                     .type( function(d,i) {
                      if (type.toUpperCase() == 'DEL') {
                return 'triangle-up';
            } else if (type.toUpperCase() == 'INS') {
                return  'circle';
            } else if (type.toUpperCase() == 'COMPLEX') {
                return 'diamond';
            } else {
              return 'square';
            }
                     })();
          })
          .attr("class", "filter-symbol " + selection.datum().clazz + " " + type);
  }
}

MatrixCard.prototype.showHighestImpactSymbol = function(selection, options) {
  var variant = d3.select(selection.node().parentNode).datum();
  var vepHighestImpacts = VariantModel.getNonCanonicalHighestImpactsVep(variant);
  if (Object.keys(vepHighestImpacts).length > 0) {
    matrixCard.showImpactSymbol(selection, options);
  }
}

MatrixCard.prototype.showImpactBadge = function(selection, variant, impactClazz) {
  var me = this;
  var type = null;
  var transform1 = "translate(1,3)";
  var transform2 = "translate(5,6)";
  var clazz = null;
  if (variant) {
    type = variant.type ? variant.type : 'SNP';
    clazz = impactClazz ? impactClazz : (variant.impact && variant.impact.length > 0 ? "impact_" + variant.impact[0].toUpperCase() : "");
  } else  {
    type = selection.datum().type ? selection.datum().type : 'SNP';
    transform1 = selection.datum().transform || "translate(1,1)";
    transform2 = selection.datum().transform || "translate(5,5)";
    clazz = selection.datum().clazz;
  }
  var symbolScale = d3.scale.linear()
                    .domain([1,6])
                    .range([10,40]);

    var symbolSize = symbolScale(6);

  if (type.toUpperCase() == 'SNP' || type.toUpperCase() == 'MNP') {
    selection.append("g")
              .attr("transform", transform1)
             .append("rect")
             .attr("width", 8)
             .attr("height", 8)
             .attr("class", "filter-symbol " + clazz)
             .style("pointer-events", "none");
  } else {
    selection
      .append("g")
      .attr("transform", transform2)
      .append('path')
          .attr("d", function(d,i) {
            return d3.svg
                     .symbol()
                     .size(symbolSize)
                     .type( function(d,i) {
                      if (type.toUpperCase() == 'DEL') {
                return 'triangle-up';
            } else if (type.toUpperCase() == 'INS') {
                return  'circle';
            } else if (type.toUpperCase() == 'COMPLEX') {
                return 'diamond';
            }
                     })();
          })
          .attr("class", "filter-symbol " + clazz);
  }

}

MatrixCard.prototype.clickClinvar = function(variant, cell) {
  if (variant.clinVarUid != null && variant.clinVarUid != '') {
    var url = 'http://www.ncbi.nlm.nih.gov/clinvar/variation/' + variant.clinVarUid;
    window.open(url);
  } else if (variant.clinVarAccession != null && Object.keys(variant.clinVarAccession).length > 0) {
    if (variant.clinVarClinicalSignificance && cell.value && variant.clinVarClinicalSignificance[cell.value]) {
      var index = variant.clinVarClinicalSignificance[cell.value];
      for (var accession in variant.clinVarAccession) {
        var idx = variant.clinVarAccession[accession];
        if (idx == index) {
          var url = 'http://www.ncbi.nlm.nih.gov/clinvar/' + accession;
          window.open(url);
        }
      }
    }
  }
}

MatrixCard.prototype.formatClinvar = function(variant, clinvarSig) {
  var display = "";
  for (key in clinvarSig) {
    if (key == "none" || key == "not_provided") {

    } else {
      // Highlight the column as 'danger' if variant is considered pathogenic or likely pathogenic
      if (isLevelBasic) {
        if (key.indexOf("pathogenic") >= 0) {
          if (variant.featureClass == null) {
            variant.featureClass = "";
          }
          variant.featureClass += " danger";
        }
      }
      if (display.length > 0) {
        display += ",";
      }
      display += key.split("_").join(' ');
    }
  }
  return display;
}

MatrixCard.prototype.getClinvarRank = function(variant, clinvarSig) {
  var me = this;
  var lowestRank = 9999;
  for (key in clinvarSig) {
    var rank = me.clinvarMap[key].value;
    if (rank < lowestRank) {
      lowestRank = rank;
    }
  }
  return lowestRank;
}

MatrixCard.prototype.getImpactRank = function(variant, highestImpactVep) {
  var me = this;
  var lowestRank = 99;
  for (key in highestImpactVep) {
    var rank = me.impactMap[key].value;
    if (rank < lowestRank) {
      lowestRank = rank;
    }
  }
  return lowestRank;
}

MatrixCard.prototype.formatAlleleFrequencyPercentage = function(variant, value) {
  return value && value != "" && +value >= 0 ? utility.round(+value * 100, 2) + "%" : "";
}

MatrixCard.prototype.formatCanonicalTranscript = function(variant, value) {
  return utility.stripTranscriptPrefix(selectedTranscript.transcript_id);
}

MatrixCard.prototype.formatHgvsP = function(variant, value) {
  if (value == null || value == '' || Object.keys(value).length == 0) {
    return "";
  } else {
    var buf = "";
    for(var key in value) {
      var tokens = key.split(":p.");
      if (buf.length > 0) {
        buf += " ";
      }
      if (tokens.length == 2) {
        var basicNotation = "p." + tokens[1];
        buf += basicNotation;
      } else if (tokens.length == 1 && utility.endsWith(tokens[0],"(p.=)")) {
        // If synoymous variants, show p.(=) in cell
        if (variant.vepConsequence && Object.keys(variant.vepConsequence).length > 0) {
          for( consequence in variant.vepConsequence) {
            if (consequence == "synonymous_variant") {
              buf += "p.(=)";
            }
          }
        }
      }
    }
    return buf;
  }
}

MatrixCard.prototype.formatHgvsC = function(variant, value) {
  if (value == null || value == '' || Object.keys(value).length == 0) {
    return "";
  } else {
    var buf = "";
    for(var key in value) {
      var tokens = key.split(":c.");
      if (buf.length > 0) {
        buf += " ";
      }
      if (tokens.length == 2) {
        var basicNotation = "c." + tokens[1];
        buf += basicNotation;
      }
    }
    return buf;
  }

}

MatrixCard.prototype.formatAfHighest = function(variant, afField) {
  return afField && afField.length > 0 && +variant[afField] < .1 ? utility.percentage(variant[afField], false) : "";
}

MatrixCard.prototype.formatInheritance = function(variant, value) {
  return this.getInheritanceLabel(value);
}

MatrixCard.prototype.getInheritanceLabel = function(inheritance) {
  var matrixRow = this.inheritanceMap[inheritance];
  return matrixRow ? matrixRow.display : inheritance;
}

MatrixCard.wrap = function(text, width, maxLines, x) {
  if (maxLines == null) {
    maxLines = 10;
  }
  var theX       = x ? x : 0;
  var textAnchor = x ? "end" : "start";

  text.each(function() {
    var text = d3.select(this),
        words = text.text()
                    .split(/\s+/)
                    .filter( function(d,i) {
                      return d != null && d != '' && d.trim() != '';
              })
                    .reverse();
    var wordCount = words.length;
    var word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null)
                    .append("tspan")
                    .style("text-anchor", textAnchor)
                    .attr("x", theX)
                    .attr("y", y)
                    .attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      if (lineNumber < maxLines) {
          if (lineNumber == maxLines-1) {
            word = " more ...";
          }
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width && wordCount > 1) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", theX).attr("y", y)
                      .attr("dy", ++lineNumber * lineHeight + dy + "em")
                      .style("text-anchor", textAnchor)
                      .text(word);
        }
      }
    }
  });
}


