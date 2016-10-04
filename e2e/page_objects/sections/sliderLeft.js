module.exports = {
  selector: '#slider-left',
  elements: {
    filterPanel: { selector: '#filter-track' },
    findGenesPanel: { selector: '#genes-card' },
    bookmarkPanel: { selector: '#bookmark-card' },
    inspectPanel: { selector: '#examine-card' },
    aboutPanel: { selector: '#help-card' },
    recallPanel: { selector: '#recall-card' }
  },
  sections: {
    filterPanel: {
    	selector: '#filter-track',
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
        clickVepHigh: function() {
          return this.click('@vepHigh');
        },
        clickVepModerate: function() {
          return this.click('@vepModerate');
        },
        clickVepModifier: function() {
          return this.click('@vepModifier');
        },
        clickVepLow: function() {
          return this.click('@vepLow');
        },
        click3PrimeUTR: function() {
          return this.click('@threePrimeUTRVariant');
        },
        clickDownstreamGene: function() {
          return this.click('@downstreamGeneVariant');
        },
        clickInframeDeletion: function() {
          return this.click('@inframeDeletion');
        },
        clickIntron: function() {
          return this.click('@intronVariant');
        },
        clickStopGained: function() {
          return this.click('@stopGained');
        },
        clickSynonymous: function() {
          return this.click('@synonymousVariant');
        },
        selectAlleleFrequency: function(option) {
          return this.click('@alleleFrequencySelectBox')
                     .click("#select-af-scheme + div .selectize-dropdown-content [data-value='" + option + "']");
        },
        clickAfexacUnique: function() {
          return this.click('@afexacUnique');
        },
        clickAfexacUberrare: function() {
          return this.click('@afexacUberrare');
        },
        clickAfexacSuperrare: function() {
          return this.click('@afexacSuperrare');
        },
        clickAfexacRare: function() {
          return this.click('@afexacRare');
        },
        clickAfexacUncommon: function() {
          return this.click('@afexacUncommon');
        },
        clickAfexacCommon: function() {
          return this.click('@afexacCommon');
        },
        clickAfexacUniqueNc: function() {
          return this.click('@afexacUniqueNc');
        },
        clickAf1000gUnique: function() {
          return this.click('@af1000gUnique');
        },
        clickAf1000gUberrare: function() {
          return this.click('@af1000gUberrare');
        },
        clickAf1000gSuperrare: function() {
          return this.click('@af1000gSuperrare');
        },
        clickAf1000gRare: function() {
          return this.click('@af1000gRare');
        },
        clickAf1000gUncommon: function() {
          return this.click('@af1000gUncommon');
        },
        clickAf1000gCommon: function() {
          return this.click('@af1000gCommon');
        },
      }],
      elements: {
        PASSFilter: { selector: '#rec-filter-box #PASS'},
        unassignedFilter: { selector: '#rec-filter-box #unassigned'},
        excludeNonCoding: { selector: '#exonic-only-cb + span' },
        impact: { selector: '#impact-scheme i' },
        effect: { selector: '#effect-scheme i' },
        vepHigh: { selector: '.vepImpact#HIGH' },
        vepModerate: { selector: '.vepImpact#MODERATE' },
        vepModifier: { selector: '.vepImpact#MODIFIER' },
        vepLow: { selector: '.vepImpact#LOW' },
        threePrimeUTRVariant: { selector: '#effect-filter-box #3_prime_UTR_variant' },
        downstreamGeneVariant: { selector: '#effect-filter-box #downstream_gene_variant' },
        inframeDeletion: { selector: '#effect-filter-box #inframe_deletion' },
        intronVariant: { selector: '#effect-filter-box #intron_variant' },
        stopGained: { selector: '#effect-filter-box #stop_gained' },
        synonymousVariant: { selector: '#effect-filter-box #synonymous_variant' },
        alleleFrequencySelectBox: { selector: '#select-af-scheme + div' },
        afexacUnique: { selector: '.afexaclevel-panel #afexac_unique' },
        afexacUberrare: { selector: '.afexaclevel-panel #afexac_uberrare' },
        afexacSuperrare: { selector: '.afexaclevel-panel #afexac_superrare' },
        afexacRare: { selector: '.afexaclevel-panel #afexac_rare' },
        afexacUncommon: { selector: '.afexaclevel-panel #afexac_uncommon' },
        afexacCommon { selector: '.afexaclevel-panel #afexac_common' },
        afexacUniqueNc: { selector: '.afexaclevel-panel #afexac_unique_nc' },
        af1000gUnique: { selector: '.af1000glevel-panel #af1000g_unique' },
        af1000gUberrare: { selector: '.af1000glevel-panel #af1000g_uberrare' },
        af1000gSuperrare: { selector: '.af1000glevel-panel #af1000g_superrare' },
        af1000gRare: { selector: '.af1000glevel-panel #af1000g_rare' },
        af1000gUncommon: { selector: '.af1000glevel-panel #af1000g_uncommon' },
        af1000gCommon: { selector: '.af1000glevel-panel #af1000g_common' },
      }
    },
    findGenesPanel: {
    	selector: '#genes-card',
    	commands: [{
    		importGeneSet: function(genes) {
    			var geneString = genes.join(",");
    			return this.click('@importGeneSetDropdown')
    								 .setValue('textarea#genes-to-copy', geneString)
    							   .click('#get-genes-copy-paste-button');
    		},
    		clickACMG56Genes: function() {
    			this.click('@ACMG56Genes');
    		}
    	}],
    	elements: {
    		importGeneSetDropdown: { selector: '#get-genes-dropdown button.dropdown-toggle' },
    		ACMG56Genes: { selector: '#get-acmg-genes' }
    	}
    },
    bookmarkPanel: {
    	selector: '#bookmark-card'
  	},
    inspectPanel: {
    	selector: '#examine-card'
    },
    aboutPanel: {
    	selector: '#help-card',
      commands: [{
        clickDemoGene: function() {
          return this.click('@demoGene');
        }
      }],
      elements: {
        demoGene: { selector: '#load-demo-data' }
      }
  	},
    recallPanel: {
    	selector: '#recall-card'
    }
  }
};