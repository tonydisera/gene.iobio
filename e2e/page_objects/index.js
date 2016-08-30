module.exports = {
  url: function() {
    return this.api.launchUrl;
  },
  elements: {
    sliderLeft: '#slider-left',
    matrixTrack: '#matrix-track'
  },

  sections: {

    sliderIconBar: {
      selector: '#slider-icon-bar',
      elements: {
        filter: { selector: '#button-show-filters' },
        inspect: { selector: '#button-show-examine' },
        findGenes: { selector: '#button-show-phenolyzer' },
        bookmarks: { selector: '#button-show-bookmarks' },
        callVariants: { selector: '#button-find-missing-variants' },
        about: { selector: '#button-show-help' }
      }
    },

    sliderLeft: {
      selector: '#slider-left',
      elements: {
        filterTrack: { selector: '#filter-track' },
        genesCard: { selector: '#genes-card' },
        bookmarkCard: { selector: '#bookmark-card' },
        examineCard: { selector: '#examine-card' },
        helpCard: { selector: '#help-card' },
        recallCard: { selector: '#recall-card' }
      }
    },

    appTitleSection: {
      selector: '#app-title-section',
      elements: {
        enterGeneName: { selector: '#enter-gene-name' },
        addDataButton: { selector: '#add-data-button' },
        geneBadgeName: { selector: '#gene-badge-name' }
      }
    },

    dataCard: {
      selector: '#data-card',
      elements: {
        singleProbandButton: { selector: '#single-proband-button' },
        trioButton: { selector: '#trio-button' },
        pedigreeButton: { selector: '#pedigree-button' },
        otherButton: { selector: '#other-button' },
        enterName: { selector: '#datasource-name' },
        variantsButton: { selector: '#vcf-dropdown-button' },
        alignmentsButton: { selector: '#bam-dropdown-button' },
        vcfInput: { selector: '#url-input' },
        bamInput: { selector: '#bam-url-input' },
        loadButton: { selector: '#ok-button' },
        platinumTrio: { selector: '#display-platinum-vcf-url-item' },
        probandVcfSampleBox: { selector: '#proband-data #vcf-sample-box' }
      }
    },

    matrixTrack: {
      selector: '#matrix-track',
      elements: {

      }
    }

  }
};