var appTitleSection = require('./sections/appTitleSection.js');
var dataCard = require('./sections/dataCard.js');
var probandVariantCard = require('./sections/probandVariantCard.js');
var motherVariantCard = require('./sections/motherVariantCard.js');
var fatherVariantCard = require('./sections/fatherVariantCard.js');
var matrixTrack = require('./sections/matrixTrack.js');
var filterPanel = require('./sections/filterPanel.js');
var findGenesPanel = require('./sections/findGenesPanel.js');
var inspectPanel = require('./sections/inspectPanel.js');
var recallPanel = require('./sections/recallPanel.js');
var bookmarkPanel = require('./sections/bookmarkPanel.js');
var variantTooltip = require('./sections/variantTooltip.js');




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
    variantTooltip:        '#feature-matrix .tooltip',
    alertify:          '.alertify',
    alertifyOk:        '.alertify .ajs-primary .ajs-button:first-child',
    alertifyCancel:    '.alertify .ajs-primary .ajs-button:second-child'
  },

  commands: [{
    load: function() {
      return this.navigate();
    },
    clickDemoGene: function() {
      return this.click('@demoGeneButton');
    },
    waitForAlertify: function() {
      return this.waitForElementPresent('@alertify', 2000);
    },
    clickAlertifyOk: function(client) {
      return this.api.moveTo( '.alertify .ajs-primary .ajs-button:first-child').click('.alertify .ajs-primary .ajs-button:first-child');
      //return this.click('@alertifyOk');
    },
    clickAlertifyCancel: function() {
      var loc = "(//*[contains(@class, 'ajs-button')])[2]";
      return this.api.useXpath().moveTo(loc).click(loc).useCss();
//      return this.click('@alertifyCancel');
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
    motherVariantCard: motherVariantCard,
    fatherVariantCard: fatherVariantCard,
    variantTooltip: variantTooltip,

    transcriptCard: {
      selector: '#transcript-card',
      elements: {
        geneName: { selector: '#gene-name' }
      }
    }


 
  }
};