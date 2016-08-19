module.exports = {
  url: function() {
    return this.api.launchUrl;
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
    }

  }
};