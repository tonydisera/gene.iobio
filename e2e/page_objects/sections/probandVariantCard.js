module.exports = {
  selector: '#proband-variant-card',
  commands: [{
    waitForBamDepthLoaded: function() {
      this.waitForElementVisible('@bamDepthChart', 90000);
    },
    assertLoadedVariantCountEquals: function(text) {
  		this.expect.element('@variantCount').text.to.equal(text);
  	},
    assertCalledVariantCountEquals: function(text) {
      this.expect.element('@calledVariantCount').text.to.equal(text);
    },

    assertLoadedVariantSymbolCountEquals: function(count) {
    	var self = this;
    	this.api.elements('css selector','#proband-variant-card #vcf-variants svg g.track .variant', function (result) {
		    self.assert.equal(result.value.length, count);
		  });
  	},
    assertCalledVariantSymbolCountEquals: function(count) {
      var self = this;
      this.api.elements('css selector','#proband-variant-card #fb-variants svg g.track .variant', function (result) {
        self.assert.equal(result.value.length, count);
      });
    },

    assertLoadedSNPSymbolCountEquals: function(count) {
    	var self = this;
    	this.api.elements('css selector','#proband-variant-card #vcf-variants svg g.track .variant.snp', function (result) {
		    self.assert.equal(result.value.length, count);
		  });
  	},
    assertCalledSNPSymbolCountEquals: function(count) {
      var self = this;
      this.api.elements('css selector','#proband-variant-card #fb-variants svg g.track .variant.snp', function (result) {
        self.assert.equal(result.value.length, count);
      });
    },


    assertBookmarkIndicatorCountEquals: function(count) {
      var self = this;
      this.api.elements('css selector','#proband-variant-card #vcf-variants svg g.bookmarks .bookmark', function (result) {
        self.assert.equal(result.value.length, count);
      });
    },

    assertDangerExonCountEquals: function(count) {
      var self = this;
      this.api.elements('css selector','#proband-variant-card #zoom-region-chart svg rect.cds.danger', function (result) {
        self.assert.equal(result.value.length, count);
      });
    },
    assertLowCoverageGlyphCountEquals: function(count) {
      var self = this;
      this.api.elements('css selector','#proband-variant-card #bam-depth svg .region-glyph', function (result) {
        self.assert.equal(result.value.length, count);
      });
      this.api.elements('css selector','#proband-variant-card #bam-depth svg rect.region', function (result) {
        self.assert.equal(result.value.length, count);
      });
    },

    clickLoadedVariantSymbol: function(variantSelector) {
      var self = this;
      var cssSelector = '#proband-variant-card #vcf-variants svg g.track .variant' + variantSelector;
      this.api.useCss().moveToElement(cssSelector, 1,1).click(cssSelector);
    },
    clickCalledVariantSymbol: function(variantSelector) {
      var self = this;
      var cssSelector = '#proband-variant-card #fb-variants svg g.track .variant' + variantSelector;
      this.api.useCss().moveToElement(cssSelector, 1,1).click(cssSelector);
    },
  }],
  elements: {
    bamDepth: '#bam-depth',
    bamDepthChart: '#bam-depth svg',
    variantCount: '#vcf-variant-count',
    calledVariantCount: '#called-variant-count'
  }
};



