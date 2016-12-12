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
      return this.click('@loadButton')
                 .api.pause(1000)
    },
    selectGenomeBuild: function(build) {
      return this.click('@genomeBuildSelectBox')
                 .click("#select-build-box .selectize-dropdown-content [data-value='" + build + "']");
    }
  }],
  elements: {
    loadButton: { selector: '#ok-button' },
    singleProbandButton: { selector: '#single-proband-button' },
    trioButton: { selector: '#trio-button' },
    genomeBuildSelectBox: { selector: '#select-build-box .selectize-input' },
  },
  sections: {
    probandData: {
      selector: '#proband-data',
      commands: [{
        selectPlatinumTrio: function() {
          return this.click('@variantsButton')
                     .click('@platinumTrio')
                     .waitForElementVisible('@probandVcfSampleBox');
        },
        selectSample: function(sample) {
          return this.waitForElementVisible('@probandVcfSampleBox')
                     .click('@probandVcfSampleSelectBox')
                     .click(".selectize-dropdown-content [data-value='" + sample + "']");
        },
        inputUrl: function(url) {
          this.setValue('@urlInput', [url, this.api.Keys.ENTER]);
        },
        inputAlignmentsUrl: function(url) {
          return this.setValue('@bamUrlInput', [url]);
        },
        inputDefaults: function() {
          this.inputUrl(this.api.globals.variantFileUrl);
          this.selectSample('NA12878');
          this.inputAlignmentsUrl(this.api.globals.NA12878SampleFileUrl);
        }
      }],
      elements: {
        variantsButton: { selector: '#vcf-dropdown-button' },
        alignmentsButton: { selector: '#bam-dropdown-button' },
        platinumTrio: { selector: '#display-platinum-vcf-url-item' },
        probandVcfSampleBox: { selector: '#vcf-sample-box' },
        probandVcfSampleSelectBox: { selector: '#vcf-sample-select-box .selectize-input' },
        urlInput: { selector: '#url-input' },
        bamUrlInput: { selector: '#bam-url-input' }
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