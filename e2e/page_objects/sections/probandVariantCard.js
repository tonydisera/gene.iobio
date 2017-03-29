module.exports = {
  selector: '#proband-variant-card',
  commands: [{
    waitForBamDepthLoaded: function() {
      this.waitForElementVisible('@bamDepth');
    },
    assertVariantCountEquals: function(text) {
  		this.expect.element('@variantCount').text.to.equal(text);
  	},
    assertVariantSymbolCountEquals: function(client, count) {
    	var me = this;
    	this.api.elements('css selector','#vcf-variants svg g.track .variant', function (result) {
		    client.assert.equal(result.value.length, count);
		});
  	},
    assertSNPSymbolCountEquals: function(client, count) {
    	var me = this;
    	this.api.elements('css selector','#vcf-variants svg g.track .variant.snp', function (result) {
		    client.assert.equal(result.value.length, count);
		});
  	}
  }],
  elements: {
    bamDepth: '#bam-depth',
    variantCount: '#vcf-variant-count'
  }
};



