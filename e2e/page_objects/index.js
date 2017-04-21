var appTitleSection = require('./sections/appTitleSection.js');
var dataCard = require('./sections/dataCard.js');
var probandVariantCard = require('./sections/probandVariantCard.js');
var matrixTrack = require('./sections/matrixTrack.js');
var filterPanel = require('./sections/filterPanel.js');
var findGenesPanel = require('./sections/findGenesPanel.js');
var inspectPanel = require('./sections/inspectPanel.js');
var recallPanel = require('./sections/recallPanel.js');
var bookmarkPanel = require('./sections/bookmarkPanel.js');

var matrixTooltip = require('./sections/variantTooltip.js');
var probandTooltip = require('./sections/variantTooltip.js');
probandTooltip.selector = '#proband-variant-card #vcf-variants .tooltip';
var probandCalledTooltip = require('./sections/variantTooltip.js');
probandTooltip.selector = '#proband-variant-card #fb-variants .tooltip';

module.exports = {
  url: function() {
    return this.api.launchUrl;
  },

  elements: {
    demoGeneButton: 'button#load-demo-data',
    sliderLeft: '#slider-left',
    filterPanel: '#slider-left #filter-track',
    findGenesPanel: '#slider-left #genes-card',
    inspectPanel: '#slider-left #examine-card',
    recallPanel: '#slider-left #recall-card',
    bookmarkPanel: '#slider-left #bookmark-card',
    appTitleSection: '#genes-panel',
    dataCard: '#data-card',
    matrixTrack: '#matrix-track',
    transcriptCard: '#transcript-card',
    probandVariantCard: '#proband-variant-card',
    motherVariantCard: '#other-variant-cards .variant-card:nth-child(1)',
    fatherVariantCard: '#other-variant-cards .variant-card:nth-child(2)',
    matrixTooltip:        '#feature-matrix .tooltip',
    probandTooltip:       '#proband-variant-card #vcf-variants .tooltip',
    probandCalledTooltip: '#proband-variant-card #fb-variants .tooltip'

  },

  commands: [{
    load: function() {
      return this.navigate();
    },
    clickDemoGene: function() {
      return this.click('@demoGeneButton');
    }
  }],

  sections: {
    appTitleSection: appTitleSection,
    dataCard: dataCard,
    filterPanel: filterPanel,
    findGenesPanel: findGenesPanel,
    inspectPanel: inspectPanel,
    recallPanel: recallPanel,
    bookmarkPanel: bookmarkPanel,
    matrixTrack: matrixTrack,
    probandVariantCard: probandVariantCard,
    matrixTooltip: matrixTooltip,
    probandTooltip: probandTooltip,
    probandCalledTooltip: probandCalledTooltip,

    transcriptCard: {
      selector: '#transcript-card',
      elements: {
        geneName: { selector: '#gene-name' }
      }
    },

    motherVariantCard: {
      selector: '#other-variant-cards .variant-card:nth-child(1)'
    },

    fatherVariantCard: {
      selector: '#other-variant-cards .variant-card:nth-child(2)'
    }

 
  }
};