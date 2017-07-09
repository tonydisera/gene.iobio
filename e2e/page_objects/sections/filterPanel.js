var filter = {
  clinvarPath: '//div[@id="filter-track"]//*[local-name()="svg" and @class="clinvar" and @id="clinvar_path"]',
  clinvarPathClicked: '//div[@id="filter-track"]//*[local-name()="svg" and contains(@class,"clinvar") and contains(@class, "current") and @id="clinvar_path"]',

  recfilterUnassigned:    '//div[@id="filter-track"]//*[local-name()="svg" and @class="recfilter" and @id="unassigned"]',

  inheritanceDenovo:    '//div[@id="filter-track"]//*[local-name()="svg" and @class="inheritance" and @id="denovo"]',
  inheritanceRecessive: '//div[@id="filter-track"]//*[local-name()="svg" and @class="inheritance" and @id="recessive"]',
  
  vepHigh: '//div[@id="filter-track"]//*[local-name()="svg" and @class="highestImpactVep" and @id="HIGH"]',
  vepModerate: '//div[@id="filter-track"]//*[local-name()="svg" and @class="highestImpactVep" and @id="MODERATE"]',
  vepModifier: '//div[@id="filter-track"]//*[local-name()="svg" and @class="highestImpactVep" and @id="MODIFIER"]',
  vepLow: '//div[@id="filter-track"]//*[local-name()="svg" and @class="highestImpactVep" and @id="LOW"]',

  threePrimeUTR: '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="3_prime_UTR_variant"]',
  downstream: '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="downstream_gene_variant"]',
  inframeDeletion:  '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="inframe_deletion"]',
  intronVariant: '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="intron_variant"]',
  synonymous: '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="synonymous_variant"]',
  stopGained: '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="stop_gained"]',

  afexacUnique: '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_unique"]',
  afexacUberrare: '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_uberrare"]',
  afexacSuperrare: '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_superrare"]',
  afexacRare: '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_rare"]',
  afexacUncommon: '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_uncommon"]',
  afexacCommon: '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_common"]',
  afexacUniqueNc: '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_unique_nc"]',

  af1000gUnique: '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_unique"]',
  af1000gUberrare: '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_uberrare"]',
  af1000gSuperrare: '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_superrare"]',
  af1000gRare: '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_rare"]',
  af1000gUncommon: '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_uncommon"]',
  af1000gCommon: '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_common"]'
}  


module.exports = {
	selector: '#slider-left #filter-track',

  commands: [{
    clickPASSFilter: function() {
      return this.click('@PASSFilter');
    },
    clickUnassignedFilter: function() {
      return this.click('@unassignedFilter');
    },
    clickExcludeNonCoding: function() {
      return this.click('@excludeNonCoding');
    },
    clickImpact: function() {
      return this.click('@impact');
    },
    clickEffect: function() {
      return this.click('@effect');
    },

    clickRecfilterUnassigned: function() {
      return this.api.useXpath().moveToElement(filter.recfilterUnassigned, 1,1).click(filter.recfilterUnassigned);
    },


    clickClinvarPath: function() {
      return this.api.useXpath().moveToElement(filter.clinvarPath, 1,1).click(filter.clinvarPath);
    },
    unclickClinvarPath: function() {
      return this.api.useXpath().moveToElement(filter.clinvarPathClicked, 1,1).click(filter.clinvarPathClicked);
    },


    clickInheritanceDenovo: function() {
      return this.api.useXpath().moveToElement(filter.inheritanceDenovo, 1,1).click(filter.inheritanceDenovo);
    },
    clickInheritanceRecessive: function() {
      return this.api.useXpath().moveToElement(filter.inheritanceDenovo, 1,1).click(filter.inheritanceDenovo);
    },

    clickVepHigh: function() {
      return this.api.useXpath().moveToElement(filter.vepHigh, 1,1).click(filter.vepHigh);
    },
    clickVepModerate: function() {
      return this.api.useXpath().moveToElement(filter.vepModerate, 1,1).click(filter.vepModerate);
    },
    clickVepModifier: function() {
      return this.api.useXpath().moveToElement(filter.vepModifier, 1,1).click(filter.vepModifier);
    },
    clickVepLow: function() {
      return this.api.useXpath().moveToElement(filter.vepLow, 1,1).click(filter.vepLow);
    },


    click3PrimeUTR: function() {
      return this.api.useXpath().moveToElement(filter.threePrimeUTR, 1,1).click(filter.threePrimeUTR);
    },
    clickDownstreamGene: function() {
      return this.api.useXpath().moveToElement(filter.downstream, 1,1).click(filter.downstream);
    },
    clickInframeDeletion: function() {
      return this.api.useXpath().moveToElement(filter.inframeDeletion, 1,1).click(filter.inframeDeletion);
    },
    clickIntron: function() {
      return this.api.useXpath().moveToElement(filter.intronVariant, 1,1).click(filter.intronVariant);
    },
    clickStopGained: function() {
      return this.api.useXpath().moveToElement(filter.stopGained, 1,1).click(filter.stopGained);
    },
    clickSynonymous: function() {
      return this.api.useXpath().moveToElement(filter.synonymous, 1,1).click(filter.synonymous);
    },

    clickAfexacUnique: function() {
      return this.api.useXpath().moveToElement(filter.afexacUnique, 1,1).click(filter.afexacUnique);      
    },
    clickAfexacUberrare: function() {
      return this.api.useXpath().moveToElement(filter.afexacUberrare, 1,1).click(filter.afexacUberrare);      
    },
    clickAfexacSuperrare: function() {
      return this.api.useXpath().moveToElement(filter.afexacSuperrare, 1,1).click(filter.afexacSuperrare);      
    },
    clickAfexacRare: function() {
      return this.api.useXpath().moveToElement(filter.afexacRare, 1,1).click(filter.afexacRare);      
    },
    clickAfexacUncommon: function() {
      return this.api.useXpath().moveToElement(filter.afexacUncommon, 1,1).click(filter.afexacUncommon);      
    },
    clickAfexacCommon: function() {
      return this.api.useXpath().moveToElement(filter.afexacCommon, 1,1).click(filter.afexacCommon);      
    },
    clickAfexacUniqueNc: function() {
      return this.api.useXpath().moveToElement(filter.afexacUniqueNc, 1,1).click(filter.afexacUniqueNc);      
    },

    clickAf1000gUnique: function() {
      return this.api.useXpath().moveToElement(filter.af1000gUnique, 1,1).click(filter.af1000gUnique);      
    },
    clickAf1000gUberrare: function() {
      return this.api.useXpath().moveToElement(filter.af1000gUberrare, 1,1).click(filter.af1000gUberrare);      
    },
    clickAf1000gSuperrare: function() {
      return this.api.useXpath().moveToElement(filter.af1000gSuperrare, 1,1).click(filter.af1000gSuperrare);      
    },
    clickAf1000gRare: function() {
      return this.api.useXpath().moveToElement(filter.af1000gRare, 1,1).click(filter.af1000gRare);      
    },
    clickAf1000gUncommon: function() {
      return this.api.useXpath().moveToElement(filter.af1000gUncommon, 1,1).click(filter.af1000gUncommon);      
    },    
    clickAf1000gCommon: function() {
      return this.api.useXpath().moveToElement(filter.af1000gCommon, 1,1).click(filter.af1000gCommon);      
    },

    clickClearAll: function() {
      return this.click('@clearAll');
    },

    clickKnownCausative: function() {
      return this.click('@knownCausative');
    },
    assertKnownCausativeCounts: function(analyzedCount, calledCount) {
      var self = this;
      if (analyzedCount) {
        this.getText('@knownCausativeAnalyzedCount', function(result) {
          self.assert.equal(result.value, analyzedCount);
        })        
      }
      if (calledCount) {
        this.getText('@knownCausativeCalledCount', function(result) {
          self.assert.equal(result.value, calledCount);
        })        
      }
    },

    clickDenovoVus: function() {
      return this.click('@denovoVus');
    },
    assertDenovoVusCounts: function(analyzedCount, calledCount) {
      var self = this;
      if (analyzedCount) {
        this.getText('@denovoVusAnalyzedCount', function(result) {
          self.assert.equal(result.value, analyzedCount);
        })        
      }
      if (calledCount) {
        this.getText('@denovoVusCalledCount', function(result) {
          self.assert.equal(result.value, calledCount);
        })        
      }
    },

    clickRecessiveVus: function() {
      return this.click('@recessiveVus');
    },
    assertRecessiveVusCounts: function(analyzedCount, calledCount) {
      var self = this;
      if (analyzedCount) {
        this.getText('@recessiveVusAnalyzedCount', function(result) {
          self.assert.equal(result.value, analyzedCount);
        })        
      }
      if (calledCount) {
        this.getText('@recessiveVusCalledCount', function(result) {
          self.assert.equal(result.value, calledCount);
        })        
      }
    },

    clickHighOrModerateImpact: function() {
      return this.click('@highOrModerateImpact');
    },
    assertHighOrModerateImpactCounts: function(analyzedCount, calledCount) {
      var self = this;
      if (analyzedCount) {
        this.getText('@highOrModerateImpactAnalyzedCount', function(result) {
          self.assert.equal(result.value, analyzedCount);
        })        
      }
      if (calledCount) {
        this.getText('@highOrModerateImpactCalledCount', function(result) {
          self.assert.equal(result.value, calledCount);
        })        
      }
    },

    clickLowCoverage: function() {
      return this.click('@lowCoverage');
    },
    assertLowCoverageCounts: function(analyzedCount, calledCount) {
      var self = this;
      if (analyzedCount) {
        this.getText('@lowCoverageAnalyzedCount', function(result) {
          self.assert.equal(result.value, analyzedCount);
        })        
      }
      if (calledCount) {
        this.getText('@lowCoverageCalledCount', function(result) {
          self.assert.equal(result.value, calledCount);
        })        
      }
    }

  }],

  elements: {
    PASSFilter: { selector: '#rec-filter-box #PASS'},
    unassignedFilter: { selector: '#rec-filter-box #unassigned'},
    excludeNonCoding: { selector: '#exonic-only-cb + span' },
    impact: { selector: '#impact-scheme i' },
    effect: { selector: '#effect-scheme i' },   

    clearAll: {selector: '#clear-filters-button'},

    knownCausative:              { selector: '//*[@id="button-known-causative"]', locateStrategy: 'xpath' },
    knownCausativeAnalyzedCount: { selector: '//*[@id="button-known-causative"]/following-sibling::span/div[@id="loaded-variant-count"]', locateStrategy: 'xpath' },
    knownCausativeCalledCount:   { selector: '//*[@id="button-known-causative"]/following-sibling::span/div[@id="called-variant-count"]', locateStrategy: 'xpath' },

    denovoVus:              { selector: '//*[@id="button-denovo-vus"]', locateStrategy: 'xpath' },
    denovoVusAnalyzedCount: { selector: '//*[@id="button-denovo-vus"]/following-sibling::span/div[@id="loaded-variant-count"]', locateStrategy: 'xpath' },
    denovoVusCalledCount:   { selector: '//*[@id="button-denovo-vus"]/following-sibling::span/div[@id="called-variant-count"]', locateStrategy: 'xpath' },

    recessiveVus:              { selector: '//*[@id="button-recessive-vus"]', locateStrategy: 'xpath' },
    recessiveVusAnalyzedCount: { selector: '//*[@id="button-recessive-vus"]/following-sibling::span/div[@id="loaded-variant-count"]', locateStrategy: 'xpath' },
    recessiveVusCalledCount:   { selector: '//*[@id="button-recessive-vus"]/following-sibling::span/div[@id="called-variant-count"]', locateStrategy: 'xpath' },

    highOrModerateImpact:              { selector: '//*[@id="button-high-or-moderate-impact"]', locateStrategy: 'xpath' },
    highOrModerateImpactAnalyzedCount: { selector: '//*[@id="button-high-or-moderate-impact"]/following-sibling::span/div[@id="loaded-variant-count"]', locateStrategy: 'xpath' },
    highOrModerateImpactCalledCount:   { selector: '//*[@id="button-high-or-moderate-impact"]/following-sibling::span/div[@id="called-variant-count"]', locateStrategy: 'xpath' },

    lowCoverage:              { selector: '//*[@id="button-low-coverage"]', locateStrategy: 'xpath' },
    lowCoverageAnalyzedCount: { selector: '//*[@id="button-low-coverage"]/following-sibling::span/div[@id="loaded-variant-count"]', locateStrategy: 'xpath' },
    lowCoverageCalledCount:   { selector: '//*[@id="button-low-coverage"]/following-sibling::span/div[@id="called-variant-count"]', locateStrategy: 'xpath' }

  }
};
