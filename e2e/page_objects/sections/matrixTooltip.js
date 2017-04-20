var theClient;

module.exports = {
  selector: '#feature-matrix .tooltip',
  
  commands: [{
    assertTitleLine2Equals: function(text) {
  		this.expect.element('@title').text.to.equal(text);
  	},
  	assertHGVScEquals: function(text) {
  		this.expect.element('@HGVSc').text.to.equal(text);
  	},
    assertHGVSpEquals: function(text) {
      this.expect.element('@HGVSp').text.to.equal(text);
    },    

    // For some reason, the bookmark (e2e/bookmark_variants.js) cannot use the 'assertTitleLine2Equals'
    // method as this returns blank instead of the expected value.
    expectTitleLine2TextEquals: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]//div[contains(@class, "tooltip")]//div[contains(@class, "tooltip-title") and contains(@class, "ref-alt")]';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },
    // For some reason, the bookmark (e2e/bookmark_variants.js) cannot use the 'assertHGVSpEquals'
    // method as this returns blank instead of the expected value.
    expectHGVSpTextEquals: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]//div[contains(@class, "tooltip")]//div[@class="tooltip-header" and text()="HGVSp"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },


    expectInheritanceEquals: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//*[local-name()="svg" and @class="inheritance-badge"]/following-sibling::strong/em';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },
    expectVepConsequence: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="VEP Consequence"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },  
    expectVepImpact: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Impact"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },     
    expectHighestVepImpact: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Most severe impact"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    }, 
    expectPolyphen: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="PolyPhen"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },         
    expectSIFT: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="SIFT"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },         
    expectClinvarEquals: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="ClinVar"]/following-sibling::div/span/a';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },
    expectClinvarClinSigEquals: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="ClinVar"]/parent::node()/following-sibling::div/div[@class="tooltip-value"]';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },  
    expectAFExAC: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Allele Freq ExAC"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },   
    expectAF1000G: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Allele Freq 1000G"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },  
    expectQual: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Qual"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    }, 
    expectFilter: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]/div[contains(@class,"tooltip") and contains(@class,"tooltip-wide")]//div[@class="tooltip-header" and text()="Filter"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },              
    expectAlleleCountsEquals: function(relationship, altCount, refCount, totalCount, zygosity) {
      var self = this;
      var base       = '//div[@id="feature-matrix"]//div[contains(@class, "tooltip")]//div[@id="coverage-svg"]/div[contains(@class,"' + relationship + '-alt-count") and contains(@class,"tooltip-row")]';
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
    waitForTooltip: function() {
      this.api.pause(2000);
      //this.waitForElementVisible('#feature-matrix .tooltip', 4000);
    },



  }],
  elements: {
    title: { selector: "//div[contains(@class, 'tooltip-title') and contains(@class, 'ref-alt')]", locateStrategy: 'xpath' },
  	HGVSc: { selector: '//div[@class="tooltip-header" and text()="HGVSc"]/following-sibling::div', locateStrategy: 'xpath' },
    HGVSp: { selector: '//div[@class="tooltip-header" and text()="HGVSp"]/following-sibling::div', locateStrategy: 'xpath' },
    bookmarkLink:  {selector: '#bookmarkLink'},
    removeBookmarkLink:  {selector: '#remove-bookmark-link'}
  }

}

