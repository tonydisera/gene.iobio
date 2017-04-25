module.exports = {
  selector: '//div[@id="matrix-panel"]//div[contains(@class, "tooltip-wide")]',
  locateStrategy: 'xpath',

  MATRIX_TOOLTIP         : '//div[@id="matrix-panel"]//div[contains(@class, "tooltip-wide")]',
  PROBAND_TOOLTIP        : '//div[@id="proband-variant-card"]//div[@id="vcf-variants"]//div[contains(@class, "tooltip-wide")]',
  PROBAND_CALLED_TOOLTIP : '//div[@id="proband-variant-card"]//div[@id="fb-variants"]//div[contains(@class, "tooltip-wide")]',
  BOOKMARK_TOOLTIP       : '//div[@id="bookmark-gene-tooltip"',

  
  commands: [{
    expectTitleLine2Equals: function(text) {
  		this.expect.element('@title').text.to.equal(text);
  	},
  	expectHGVScEquals: function(text) {
  		this.expect.element('@HGVSc').text.to.equal(text);
  	},
    expectHGVSpEquals: function(text) {
      this.expect.element('@HGVSp').text.to.equal(text);
    },    

    expectInheritanceEquals: function(text) {
      this.expect.element('@inheritance').text.to.equal(text);
    },
    expectVepConsequence: function(text) {
      this.expect.element('@vepConsequence').text.to.equals(text);
    },  
    expectVepImpact: function(text) {
    },     
    expectHighestVepImpact: function(text) {
      this.expect.element('@vepHighestImpact').text.to.equals(text);
    }, 
    expectPolyphen: function(text) {
      this.expect.element('@polyphen').text.to.equals(text);
    },         
    expectSIFT: function(text) {
      this.expect.element('@sift').text.to.equals(text);
    },         
    expectClinvar: function(text) {
      this.expect.element('@clinvar').text.to.equals(text);
    },
    expectClinvarClinSig: function(text) {
      this.expect.element('@clinvarClinSig').text.to.equals(text);
    },  
    expectAFExAC: function(text) {
      this.expect.element('@afExAC').text.to.equals(text);
    },   
    expectAF1000G: function(text) {
      this.expect.element('@af1000G').text.to.equals(text);
    },  
    expectQual: function(text) {
      this.expect.element('@qual').text.to.equals(text);
    }, 
    expectFilter: function(text) {
      this.expect.element('@filter').text.to.equals(text);
    },              
    expectAlleleCountsEquals: function(tooltipSelector, relationship, altCount, refCount, totalCount, zygosity) {
      var self = this;
      var base       = '//div[@id="coverage-svg"]/div[contains(@class,"' + relationship + '-alt-count") and contains(@class,"tooltip-row")]';
      var zygosityPath   = base + '/div[contains(@class,"tooltip-zygosity")]';
      var totalCountPath = base + '/div[contains(@class,"tooltip-allele-count-bar")]/*[local-name()="svg"]/*[local-name()="text"]';
      var altCountPath   = base + '/div[contains(@class,"tooltip-allele-count-bar")]/*[local-name()="svg"]/*[local-name()="g"]/*[local-name()="text" and contains(@class, "alt-count")]';
      var refCountPath   = base + '/div[contains(@class,"tooltip-allele-count-bar")]/*[local-name()="svg"]/*[local-name()="g"]/*[local-name()="text" and contains(@class, "ref-count")]';
      self.api.useXpath().getText(zygosityPath, function(result) {
        self.assert.equal(result.value, zygosity);
      })
      self.api.useXpath().getText(totalCountPath, function(result) {
        self.assert.equal(result.value, totalCount);
      })
      if (altCount) {
        self.api.useXpath().getText(altCountPath, function(result) {
          self.assert.equal(result.value, altCount);
        })        
      }
      if (refCount) {
        self.api.useXpath().getText(refCountPath, function(result) {
          self.assert.equal(result.value, refCount);
        })        
      }
    }, 

    clickBookmark: function() {
      return this.click('@bookmarkLink');
    },
    clickRemoveBookmark: function() {
      return this.click('@removeBookmarkLink');
    },
    clickUnpin: function() {
      return this.click('@unpinLink');
    },
    waitForTooltip: function() {
      this.api.pause(2000);
      //this.waitForElementVisible('#feature-matrix .tooltip', 4000);
    },



  }],
  elements: {
    title: { selector: "//div[contains(@class, 'tooltip-title') and contains(@class, 'ref-alt')]", locateStrategy: 'xpath' },
  	HGVSc: { selector: '//div[@class="tooltip-header" and text()="HGVSc"]/following-sibling::div', locateStrategy: 'xpath' },
    HGVSp: { selector: '//div[@class="tooltip-header" and text()="HGVSp"]/following-sibling::div', locateStrategy: 'xpath' },
    bookmarkLink:  {selector: '#bookmarkLink', locateStrategy: 'css selector'},
    removeBookmarkLink:  {selector: '#remove-bookmark-link', locateStrategy: 'css selector'},
    unpinLink:  {selector: 'a#unpin', locateStrategy: 'css selector'},
    inheritance: {selector: '//*[local-name()="svg" and @class="inheritance-badge"]/following-sibling::strong/em', locateStrategy: 'xpath'},
    vepConsequence: {selector: '//div[@class="tooltip-header" and text()="VEP Consequence"]/following-sibling::div', locateStrategy: 'xpath'},
    vepImpact: {selector: '//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Impact"]/following-sibling::div', locateStrategy: 'xpath'},
    vepHighestImpact : {selector: '//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Most severe impact"]/following-sibling::div', locateStrategy: 'xpath'},
    polyphen: {selector:  '//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="PolyPhen"]/following-sibling::div', locateStrategy: 'xpath'},
    sift: {selector:  '//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="SIFT"]/following-sibling::div', locateStrategy: 'xpath'},
    clinvar: {selector:  '//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="ClinVar"]/following-sibling::div/span/a', locateStrategy: 'xpath'},
    clinvarClinSig: {selector:  '//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="ClinVar"]/parent::node()/following-sibling::div/div[@class="tooltip-value"]', locateStrategy: 'xpath'},
    afExAC: {selector:'//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Allele Freq ExAC"]/following-sibling::div', locateStrategy: 'xpath'},
    af1000G: {selector:'//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Allele Freq 1000G"]/following-sibling::div', locateStrategy: 'xpath'},
    qual: {selector: '//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Qual"]/following-sibling::div', locateStrategy: 'xpath'},
    filter: {selector: '//div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Filter"]/following-sibling::div', locateStrategy: 'xpath'}
  }

}

