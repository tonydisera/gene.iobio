var appTitleSection = require('./sections/appTitleSection.js');
var dataCard = require('./sections/dataCard.js');
var probandVariantCard = require('./sections/probandVariantCard.js');
var matrixTrack = require('./sections/matrixTrack.js');
var matrixTooltip = require('./sections/matrixTooltip.js');
var filterPanel = require('./sections/filterPanel.js');
var findGenesPanel = require('./sections/findGenesPanel.js');
var inspectPanel = require('./sections/inspectPanel.js');
var recallPanel = require('./sections/recallPanel.js');
var bookmarkPanel = require('./sections/bookmarkPanel.js');

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
    appTitleSection: '#app-title-section',
    dataCard: '#data-card',
    matrixTrack: '#matrix-track',
    matrixTooltip: '#feature-matrix .tooltip',
    transcriptCard: '#transcript-card',
    probandVariantCard: '#proband-variant-card',
    motherVariantCard: '#other-variant-cards .variant-card:nth-child(1)',
    fatherVariantCard: '#other-variant-cards .variant-card:nth-child(2)'
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