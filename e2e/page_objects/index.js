var appTitleSection = require('./sections/appTitleSection.js');
var dataCard = require('./sections/dataCard.js');
var sliderIconBar = require('./sections/sliderIconBar.js');
var matrixTrack = require('./sections/matrixTrack.js');
var matrixTooltip = require('./sections/matrixTooltip.js');
var filterPanel = require('./sections/filterPanel.js');
var findGenesPanel = require('./sections/findGenesPanel.js');
var aboutPanel = require('./sections/aboutPanel.js');
var inspectPanel = require('./sections/inspectPanel.js');
var recallPanel = require('./sections/recallPanel.js');
var bookmarkPanel = require('./sections/bookmarkPanel.js');

module.exports = {
  url: function() {
    return this.api.launchUrl;
  },

  elements: {
    sliderLeft: '#slider-left',
    filterPanel: '#slider-left #filter-track',
    findGenesPanel: '#slider-left #genes-card',
    aboutPanel: '#slider-left #help-card',
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
      return this.navigate().waitForElementVisible('@sliderLeft');
    }
  }],

  sections: {
    appTitleSection: appTitleSection,
    dataCard: dataCard,
    sliderIconBar: sliderIconBar,
    filterPanel: filterPanel,
    findGenesPanel: findGenesPanel,
    aboutPanel: aboutPanel,
    inspectPanel: inspectPanel,
    recallPanel: recallPanel,
    bookmarkPanel: bookmarkPanel,
    matrixTrack: matrixTrack,
    matrixTooltip: matrixTooltip,
    transcriptCard: {
      selector: '#transcript-card',
      elements: {
        geneName: { selector: '#gene-name' }
      }
    },

    probandVariantCard: {
      selector: '#proband-variant-card',
      elements: {

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