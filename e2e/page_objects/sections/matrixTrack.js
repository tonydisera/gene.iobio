var CLINVAR = {
  LABEL: 'Pathogenicity - ClinVar',
  SYMBOL: "/*[local-name()='g']", // used to assert that a symbol is not present in the DOM
  BENIGN: "/*[local-name()='text' and text()='benign']",
  PATHOGENIC: "/*[local-name()='text' and text()='pathogenic']",
  OTHER: "/*[local-name()='text' and text()='other']"
};

var SIFT = {
  LABEL: 'Pathogenicity - SIFT',
  SYMBOL: "/*[local-name()='g']",
  TOLERATED: "/*[local-name()='text' and text()='tolerated']",
  DELETERIOUS: "/*[local-name()='text' and text()='deleterious']",
};

var POLYPHEN = {
  LABEL: 'Pathogenicity - PolyPhen',
  SYMBOL: "/*[local-name()='g']",
  BENIGN: "/*[local-name()='text' and text()='benign']",
  POSSIBLY_DAMAGING: "/*[local-name()='text' and text()='possibly_damaging']"
};

var IMPACT = {
  LABEL: 'Impact (VEP)',
  SYMBOL: "/*[local-name()='g']",
  HIGH: "/*[local-name()='text' and text()='HIGH']",
  MODERATE: "/*[local-name()='text' and text()='MODERATE']",
  MODIFIER: "/*[local-name()='text' and text()='MODIFIER']",
  LOW: "/*[local-name()='text' and text()='LOW']",
  COMPLEX_DIAMOND: "/*[local-name()='g']/*[contains(concat(' ', normalize-space(@class), ' '), ' complex ')]",
  INS_CIRCLE: "/*[local-name()='g']/*[contains(concat(' ', normalize-space(@class), ' '), ' ins ')]",
  DEL_TRIANGLE: "/*[local-name()='g']/*[contains(concat(' ', normalize-space(@class), ' '), ' del ')]",
  SNP_RECT: "/*[local-name()='g']/*[contains(concat(' ', normalize-space(@class), ' '), ' snp ')]"
};

var MOST_SEVERE_IMPACT = JSON.parse(JSON.stringify(IMPACT));
MOST_SEVERE_IMPACT.LABEL = 'Most severe impact (VEP)';

var BOOKMARK = {
  LABEL: 'Bookmark',
  SYMBOL: "/*[local-name()='g']",
};

var INHERITANCE = {
  LABEL: 'Inheritance Mode',
  SYMBOL: '',
  DENOVO: '',
  RECESSIVE: ''
};

var AF1000G = {
  LABEL: 'Allele Frequency - 1000G',
  SYMBOL: "/*[local-name()='g']",
  UNIQUE: "/*[contains(concat(' ', normalize-space(@class), ' '), ' af1000g_unique ')]",
  UBERRARE: "/*[contains(concat(' ', normalize-space(@class), ' '), ' af1000g_uberrare ')]",
  SUPERRARE: "/*[contains(concat(' ', normalize-space(@class), ' '), ' af1000g_superrare ')]",
  RARE: "/*[contains(concat(' ', normalize-space(@class), ' '), ' af1000g_rare ')]",
  UNCOMMON: "/*[contains(concat(' ', normalize-space(@class), ' '), ' af1000g_uncommon ')]",
  COMMON: "/*[contains(concat(' ', normalize-space(@class), ' '), ' af1000g_common ')]"
};

var AFEXAC = {
  LABEL: 'Allele Frequency - ExAC',
  SYMBOL: "/*[local-name()='g']",
  UNIQUE_NC: "/*[contains(concat(' ', normalize-space(@class), ' '), ' afexac_unique_nc ')]",
  UNIQUE: "/*[contains(concat(' ', normalize-space(@class), ' '), ' afexac_unique ')]",
  UBERRARE: "/*[contains(concat(' ', normalize-space(@class), ' '), ' afexac_uberrare ')]",
  SUPERRARE: "/*[contains(concat(' ', normalize-space(@class), ' '), ' afexac_superrare ')]",
  RARE: "/*[contains(concat(' ', normalize-space(@class), ' '), ' afexac_rare ')]",
  UNCOMMON: "/*[contains(concat(' ', normalize-space(@class), ' '), ' afexac_uncommon ')]",
  COMMON: "/*[contains(concat(' ', normalize-space(@class), ' '), ' afexac_common ')]"
};

var ZYGOSITY = {
  LABEL: 'Zygosity',
  HOM: "/*[local-name()='text' and text()='HOM']",
  HET: "/*[local-name()='text' and text()='HET']",
  HOMREF: '',
  GT_UNKNOWN: ''
};

module.exports = {
  selector: '#matrix-track',
  commands: [{

    // CLINVAR
    assertClinVarBenign: function(variants) {
      this.assertSymbolsPresent(CLINVAR.LABEL, variants, CLINVAR.BENIGN);
    },
    assertClinVarOther: function(variants) {
      this.assertSymbolsPresent(CLINVAR.LABEL, variants, CLINVAR.OTHER);
    },
    assertClinVarPathogenic: function(variants) {
      this.assertSymbolsPresent(CLINVAR.LABEL, variants, CLINVAR.PATHOGENIC);
    },
    assertClinVarNull: function(variants) {
      this.assertSymbolsNotPresent(CLINVAR.LABEL, variants, CLINVAR.SYMBOL);
    },

    // SIFT
    assertSIFTTolerated: function(variants) {
      this.assertSymbolsPresent(SIFT.LABEL, variants, SIFT.TOLERATED);
    },
    assertSIFTNull: function(variants) {
      this.assertSymbolsNotPresent(SIFT.LABEL, variants, SIFT.SYMBOL);
    },

    // PolyPhen
    assertPolyPhenBenign: function(variants) {
      this.assertSymbolsPresent(POLYPHEN.LABEL, variants, POLYPHEN.BENIGN);
    },
    assertPolyPhenPossiblyDamaging: function(variants) {
      this.assertSymbolsPresent(POLYPHEN.LABEL, variants, POLYPHEN.POSSIBLY_DAMAGING);
    },
    assertPolyPhenNull: function(variants) {
      this.assertSymbolsNotPresent(POLYPHEN.LABEL, variants, POLYPHEN.SYMBOL);
    },

    // Impact - VEP
    assertImpactHigh: function(variants) {
      this.assertSymbolsPresent(IMPACT.LABEL, variants, IMPACT.HIGH);
    },

    assertImpactModerate: function(variants) {
      this.assertSymbolsPresent(IMPACT.LABEL, variants, IMPACT.MODERATE);
    },

    assertImpactModifier: function(variants) {
      this.assertSymbolsPresent(IMPACT.LABEL, variants, IMPACT.MODIFIER);
    },

    assertImpactLow: function(variants) {
      this.assertSymbolsPresent(IMPACT.LABEL, variants, IMPACT.LOW);
    },

    assertImpactComplexDiamond: function(variants) {
      this.assertSymbolsPresent(IMPACT.LABEL, variants, IMPACT.COMPLEX_DIAMOND);
    },

    assertImpactInsCircle: function(variants) {
      this.assertSymbolsPresent(IMPACT.LABEL, variants, IMPACT.INS_CIRCLE);
    },

    assertImpactDelTriangle: function(variants) {
      this.assertSymbolsPresent(IMPACT.LABEL, variants, IMPACT.DEL_TRIANGLE);
    },

    assertImpactSnpRect: function(variants) {
      this.assertSymbolsPresent(IMPACT.LABEL, variants, IMPACT.SNP_RECT);
    },

    assertImpactNull: function(variants) {
      this.assertSymbolsNotPresent(IMPACT.LABEL, variants, IMPACT.SYMBOL);
    },

    // Most Severe Impact - VEP
    assertMostSevereImpactHigh: function(variants) {
      this.assertSymbolsPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.HIGH);
    },

    assertMostSevereImpactModerate: function(variants) {
      this.assertSymbolsPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.MODERATE);
    },

    assertMostSevereImpactModifier: function(variants) {
      this.assertSymbolsPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.MODIFIER);
    },

    assertMostSevereImpactLow: function(variants) {
      this.assertSymbolsPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.LOW);
    },

    assertMostSevereImpactComplexDiamond: function(variants) {
      this.assertSymbolsPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.COMPLEX_DIAMOND);
    },

    assertMostSevereImpactInsCircle: function(variants) {
      this.assertSymbolsPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.INS_CIRCLE);
    },

    assertMostSevereImpactDelTriangle: function(variants) {
      this.assertSymbolsPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.DEL_TRIANGLE);
    },

    assertMostSevereImpactSnpRect: function(variants) {
      this.assertSymbolsPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.SNP_RECT);
    },

    assertMostSevereImpactNull: function(variants) {
      this.assertSymbolsNotPresent(MOST_SEVERE_IMPACT.LABEL, variants, MOST_SEVERE_IMPACT.SYMBOL);
    },

    // BOOKMARK
    assertBookmarkPresent: function(variants) {
      this.assertSymbolsPresent(BOOKMARK.LABEL, variants, BOOKMARK.SYMBOL);
    },

    assertBookmarkNull: function(variants) {
      this.assertSymbolsNotPresent(BOOKMARK.LABEL, variants, BOOKMARK.SYMBOL);
    },

    // INHERITANCE
    assertInheritanceDenovo: function(variants) {
      this.assertSymbolsPresent(INHERITANCE.LABEL, variants, INHERITANCE.DENOVO);
    },

    assertInheritanceRecessive: function(variants) {
      this.assertSymbolsPresent(INHERITANCE.LABEL, variants, INHERITANCE.RECESSIVE);
    },

    assertInheritanceNull: function(variants) {
      this.assertSymbolsNotPresent(INHERITANCE.LABEL, variants, INHERITANCE.SYMBOL);
    },

    // AF1000G
    assertAf1000gUnique: function(variants) {
      this.assertSymbolsPresent(AF1000G.LABEL, variants, AF1000G.UNIQUE);
    },

    assertAf1000gUberrare: function(variants) {
      this.assertSymbolsPresent(AF1000G.LABEL, variants, AF1000G.UBERRARE);
    },

    assertAf1000gSuperrare: function(variants) {
      this.assertSymbolsPresent(AF1000G.LABEL, variants, AF1000G.SUPERRARE);
    },

    assertAf1000gRare: function(variants) {
      this.assertSymbolsPresent(AF1000G.LABEL, variants, AF1000G.RARE);
    },

    assertAf1000gUncommon: function(variants) {
      this.assertSymbolsPresent(AF1000G.LABEL, variants, AF1000G.UNCOMMON);
    },

    assertAf1000gCommon: function(variants) {
      this.assertSymbolsPresent(AF1000G.LABEL, variants, AF1000G.COMMON);
    },

    assertAf1000gNull: function(variants) {
      this.assertSymbolsNotPresent(AF1000G.LABEL, variants, AF1000G.SYMBOL);
    },

    // AFEXAC
    assertAfexacUniqueNc: function(variants) {
      this.assertSymbolsPresent(AFEXAC.LABEL, variants, AFEXAC.UNIQUE_NC);
    },

    assertAfexacUnique: function(variants) {
      this.assertSymbolsPresent(AFEXAC.LABEL, variants, AFEXAC.UNIQUE);
    },

    assertAfexacUberrare: function(variants) {
      this.assertSymbolsPresent(AFEXAC.LABEL, variants, AFEXAC.UBERRARE);
    },

    assertAfexacSuperrare: function(variants) {
      this.assertSymbolsPresent(AFEXAC.LABEL, variants, AFEXAC.SUPERRARE);
    },

    assertAfexacRare: function(variants) {
      this.assertSymbolsPresent(AFEXAC.LABEL, variants, AFEXAC.RARE);
    },

    assertAfexacUncommon: function(variants) {
      this.assertSymbolsPresent(AFEXAC.LABEL, variants, AFEXAC.UNCOMMON);
    },

    assertAfexacCommon: function(variants) {
      this.assertSymbolsPresent(AFEXAC.LABEL, variants, AFEXAC.COMMON);
    },

    assertAfexacNull: function(variants) {
      this.assertSymbolsNotPresent(AFEXAC.LABEL, variants, AFEXAC.SYMBOL);
    },

    // Zygosity
    assertZygosityHom: function(variants) {
      this.assertSymbolsPresent(ZYGOSITY.LABEL, variants, ZYGOSITY.HOM);
    },

    assertZygosityHet: function(variants) {
      this.assertSymbolsPresent(ZYGOSITY.LABEL, variants, ZYGOSITY.HET);
    },

    assertZygosityHomRef: function(variants) {
      this.assertSymbolsPresent(ZYGOSITY.LABEL, variants, ZYGOSITY.HOMREF);
    },

    assertZygosityGtUnknown: function(variants) {
      this.assertSymbolsPresent(ZYGOSITY.LABEL, variants, ZYGOSITY.GT_UNKNOWN);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////

    assertSymbolsPresent: function(label, variants, symbolSelector) {
      var self = this;
      this.assertSymbols(label, variants, symbolSelector, function(pathToSymbol) {
        self.api.useXpath();
        self.expect.element(pathToSymbol).to.be.present;
        self.api.useCss();
      });
    },
    assertSymbolsNotPresent: function(label, variants, symbolSelector) {
      var self = this;
      this.assertSymbols(label, variants, symbolSelector, function(pathToSymbol) {
        self.api.useXpath();
        self.expect.element(pathToSymbol).to.not.be.present;
        self.api.useCss();
      });
    },
    assertSymbols: function(label, variants, symbolSelector, expectation) {
      var self = this;
      this.api.elements('xpath', precedingSiblingsToLabel(label), function(precedingLabelElements) {
        var labelIndex = precedingLabelElements.value.length + 1;
        var row = "/*[local-name()='g'][" + labelIndex + "]";

        variants.forEach(function(variant) {
          self.api.elements('xpath', precedingSiblingsToVariant(variant), function(precedingVariantElements) {
            var variantIndex = precedingVariantElements.value.length + 1;
            var column = "/*[local-name()='g'][" + variantIndex + "]";
            var pathToSymbol = "//div[@id='feature-matrix']/*[local-name()='svg']/*[@class='group']" + column + row + symbolSelector;
            expectation(pathToSymbol);
          });
        });
      });
    },
    waitForMatrixLoaded: function() {
      this.waitForElementVisible('@featureMatrix', 90000);
    },
    waitForZeroVariantsWarning: function() {
      this.waitForElementVisible('@zeroVariantsWarning', 60000);
    },
    waitForZeroFilteredVariantsWarning: function() {
      this.waitForElementVisible('@zeroFilteredVariantsWarning', 60000);
    },
    clickColumn: function(variant) {
      var self = this;
      this.api.elements('xpath', precedingSiblingsToVariant(variant), function(precedingVariantElements) {
        var variantIndex = precedingVariantElements.value.length + 1;
        var column = "/*[local-name()='g'][" + variantIndex + "]";
        var pathToColumn = "//div[@id='feature-matrix']/*[local-name()='svg']/*[@class='group']" + column;
        self.click('xpath', pathToColumn);
      });
    }
  }],
  elements: {
    featureMatrix: { selector: '#feature-matrix' },
    featureMatrixNote: { selector: '#feature-matrix-note' },
    zeroVariantsWarning: { selector: '#zero-variants' },
    zeroFilteredVariantsWarning: { selector: '#zero-variants.zero-filtered-variants' }
  }
};

function precedingSiblingsToLabel(label) {
  return [
    "//div[@id='feature-matrix']",
    "/*[local-name()='svg']",
    "/*[local-name()='g' and @class='y axis']",
    "/*[local-name()='g']/*[local-name()='text' and text()='" + label + "']",
    "/..",
    "/preceding-sibling::*"
  ].join("");
}

function precedingSiblingsToVariant(variant) {
  return [
    "//div[@id='feature-matrix']",
    "/*[local-name()='svg']",
    "/*[local-name()='g' and @class='colhdr']",
    "/*[local-name()='g']/*[local-name()='text' and text()='" + variant + "']",
    "/..",
    "/preceding-sibling::*"
  ].join("");
}