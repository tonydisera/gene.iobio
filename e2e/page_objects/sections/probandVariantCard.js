module.exports = {
  selector: '#proband-variant-card',
  commands: [{
    waitForBamDepthLoaded: function() {
      this.waitForElementVisible('@bamDepth');
    },
    assertVariantCountEquals: function(text) {
  		this.expect.element('@variantCount').text.to.equal(text);
  	},
    assertVariantSymbolCountEquals: function(count) {
    	var self = this;
    	this.api.elements('css selector','#vcf-variants svg g.track .variant', function (result) {
		    self.assert.equal(result.value.length, count);
		});
  	},
    assertSNPSymbolCountEquals: function(count) {
    	var self = this;
    	this.api.elements('css selector','#vcf-variants svg g.track .variant.snp', function (result) {
		    self.assert.equal(result.value.length, count);
		});
  	}
  }],
  elements: {
    bamDepth: '#bam-depth',
    variantCount: '#vcf-variant-count'
  }
};



