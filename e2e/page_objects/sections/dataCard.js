module.exports = {
  selector: '#data-card',
  commands: [{
    selectSingle: function() {
      return this.click('@singleProbandButton');
    },
    selectTrio: function() {
      return this.click('@trioButton');
    },
    clickLoad: function() {
      return this.click('@loadButton');
    }
  }],
  elements: {
    loadButton: { selector: '#ok-button' },
    singleProbandButton: { selector: '#single-proband-button' },
    trioButton: { selector: '#trio-button' }
  },
  sections: {
    probandData: {
      selector: '#proband-data',
      commands: [{
        selectPlatinumTrio: function() {
          return this.click('@variantsButton')
                     .click('@platinumTrio')
                     .waitForElementVisible('@probandVcfSampleBox');
        }
      }],
      elements: {
        variantsButton: { selector: '#vcf-dropdown-button' },
        alignmentsButton: { selector: '#bam-dropdown-button' },
        platinumTrio: { selector: '#display-platinum-vcf-url-item' },
        probandVcfSampleBox: { selector: '#vcf-sample-box' }
      }
    },
    motherData: {
      selector: '#mother-data',
      commands: [{
        selectPlatinumTrio: function() {
          return this.click('@variantsButton').click('@platinumTrio').waitForElementVisible('@probandVcfSampleBox');
        }
      }],
      elements: {
        variantsButton: { selector: '#vcf-dropdown-button' },
        alignmentsButton: { selector: '#bam-dropdown-button' },
        platinumTrio: { selector: '#display-platinum-vcf-url-item' },
        probandVcfSampleBox: { selector: '#vcf-sample-box' }
      }
    },
    fatherData: {
      selector: '#father-data',
      commands: [{
        selectPlatinumTrio: function() {
          return this.click('@variantsButton').click('@platinumTrio').waitForElementVisible('@probandVcfSampleBox');
        }
      }],
      elements: {
        variantsButton: { selector: '#vcf-dropdown-button' },
        alignmentsButton: { selector: '#bam-dropdown-button' },
        platinumTrio: { selector: '#display-platinum-vcf-url-item' },
        probandVcfSampleBox: { selector: '#vcf-sample-box' }
      }
    }
  }
};