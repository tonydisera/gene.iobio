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
      build = build || 'GRCh37';
      return this.click('@genomeBuildSelectBox')
                 .click("#select-build-box .selectize-dropdown-content [data-value='" + build + "']");
    },
    searchGene: function(gene) {
      this.clearValue('@enterGeneName');
      this.setValue('@enterGeneName', [gene, this.api.Keys.ARROW_DOWN, this.api.Keys.ENTER]);
      this.api.pause(2000);
      return this;
    },
    checkSeparateUrlForIndex: function() {
      return this.click('@separateIndexUrlCheckbox');
    }
  }],
  elements: {    
    loadButton: { selector: '#ok-button' },
    singleProbandButton: { selector: '#single-proband-button' },
    trioButton: { selector: '#trio-button' },
    separateIndexUrlCheckbox: { selector: '#separate-url-for-index-files-cb + span' },
    genomeBuildSelectBox: { selector: '#select-build-box .selectize-input' },
    enterGeneName: { selector: '#enter-gene-name-data-dialog' }
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
        inputTbiUrl: function(url) {
          this.setValue('@tbiUrlInput', [url, this.api.Keys.ENTER]);
        },
        inputAlignmentsUrl: function(url) {
          return this.setValue('@bamUrlInput', [url]);
        },
        inputAlignmentsBaiUrl: function(url) {
          return this.setValue('@baiUrlInput', [url]);
        },
        inputDefaults: function() {
          this.inputUrl(this.api.globals.variantFileUrl);
          this.selectSample('NA12878');
          this.inputAlignmentsUrl(this.api.globals.NA12878SampleFileUrl);
        },
        inputName: function(name) {
          return this.setValue('@nameInput', [name]);
        }
      }],
      elements: {
        variantsButton: { selector: '#vcf-dropdown-button' },
        alignmentsButton: { selector: '#bam-dropdown-button' },
        platinumTrio: { selector: '#display-platinum-vcf-url-item' },
        probandVcfSampleBox: { selector: '#vcf-sample-box' },
        probandVcfSampleSelectBox: { selector: '#vcf-sample-select-box .selectize-input' },
        probandVcfSampleSelectPanel: { selector: '#vcf-sample-select-box' },
        urlInput: { selector: '#url-input' },
        tbiUrlInput: { selector: '#url-tbi-input' },
        bamUrlInput: { selector: '#bam-url-input' },
        baiUrlInput: { selector: '#bai-url-input' },
        nameInput: {selector: '#datasource-name'}
      }
    },
    motherData: {
      selector: '#mother-data',
      commands: [{
        selectPlatinumTrio: function() {
          return this.click('@variantsButton').click('@platinumTrio').waitForElementVisible('@probandVcfSampleBox');
        },
        inputAlignmentsUrl: function(url) {
          return this.setValue('@bamUrlInput', [url]);
        },        
      }],
      elements: {
        variantsButton: { selector: '#vcf-dropdown-button' },
        alignmentsButton: { selector: '#bam-dropdown-button' },
        platinumTrio: { selector: '#display-platinum-vcf-url-item' },
        vcfSampleBox: { selector: '#vcf-sample-box' },
        bamUrlInput: { selector: '#bam-url-input' }
      }
    },
    fatherData: {
      selector: '#father-data',
      commands: [{
        selectPlatinumTrio: function() {
          return this.click('@variantsButton').click('@platinumTrio').waitForElementVisible('@probandVcfSampleBox');
        }, 
        inputAlignmentsUrl: function(url) {
          return this.setValue('@bamUrlInput', [url]);
        }  
      }],
      elements: {
        variantsButton: { selector: '#vcf-dropdown-button' },
        alignmentsButton: { selector: '#bam-dropdown-button' },
        platinumTrio: { selector: '#display-platinum-vcf-url-item' },
        vcfSampleBox: { selector: '#vcf-sample-box' },
        bamUrlInput: { selector: '#bam-url-input' }

      }
    }
  }
};