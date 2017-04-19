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

    clickClinvarPath: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="clinvar" and @id="clinvar_path"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickVepHigh: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="highestImpactVep" and @id="HIGH"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickVepModerate: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="highestImpactVep" and @id="MODERATE"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickVepModifier: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="highestImpactVep" and @id="MODIFIER"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickVepLow: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="highestImpactVep" and @id="LOW"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },


    click3PrimeUTR: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="3_prime_UTR_variant"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickDownstreamGene: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="downstream_gene_variant"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickInframeDeletion: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="inframe_deletion"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickIntron: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="intron_variant"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickStopGained: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="stop_gained"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },
    clickSynonymous: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="vepConsequence" and @id="synonymous_variant"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);
    },


    clickAfexacUnique: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_unique"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAfexacUberrare: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_uberrare"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAfexacSuperrare: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_superrare"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAfexacRare: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_rare"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAfexacUncommon: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_uncommon"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAfexacCommon: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_common"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAfexacUniqueNc: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="afexaclevels" and @id="afexac_unique_nc"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },

    clickAf1000gUnique: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_unique"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAf1000gUberrare: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_uberrare"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAf1000gSuperrare: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_superrare"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAf1000gRare: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_rare"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAf1000gUncommon: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_uncommon"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
    clickAf1000gCommon: function(client) {
      var selector = '//div[@id="filter-track"]//*[local-name()="svg" and @class="af1000glevels" and @id="af1000g_common"]';
      return client.useXpath().moveToElement(selector, 1,1).click(selector);      
    },
  }],
  elements: {
    PASSFilter: { selector: '#rec-filter-box #PASS'},
    unassignedFilter: { selector: '#rec-filter-box #unassigned'},
    excludeNonCoding: { selector: '#exonic-only-cb + span' },
    impact: { selector: '#impact-scheme i' },
    effect: { selector: '#effect-scheme i' },   

  }
};
