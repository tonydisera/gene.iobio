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

module.exports = {
  selector: '#matrix-track',
  commands: [{
    assertSymbolsPresent: function(label, variants) {
      var self = this;
      this.assertSymbols(label, variants, function(pathToSymbol) {
        self.expect.element(pathToSymbol).to.be.present;
      });
    },
    assertSymbolsNotPresent: function(label, variants) {
      var self = this;
      this.assertSymbols(label, variants, function(pathToSymbol) {
        self.expect.element(pathToSymbol).to.not.be.present;
      });
    },
    assertSymbols: function(label, variants, expectation) {
      var self = this;
      this.api.elements('xpath', precedingSiblingsToLabel(label), function(precedingLabelElements) {
        var labelIndex = precedingLabelElements.value.length + 1;
        var symbolSelector = '> g';
        var row = '> .cell:nth-child(' + labelIndex + ') ';

        variants.forEach(function(variant) {
          self.api.elements('xpath', precedingSiblingsToVariant(variant), function(precedingVariantElements) {
            var variantIndex = precedingVariantElements.value.length + 1;
            var column =  '> .col:nth-child(' + variantIndex + ') ';
            var pathTosymbol = '#feature-matrix > svg > .group ' + column + row + symbolSelector;
            expectation(pathTosymbol);
          });
        });
      });
    }
  }],
  elements: {
    featureMatrix: { selector: '#feature-matrix' }
  }
};
