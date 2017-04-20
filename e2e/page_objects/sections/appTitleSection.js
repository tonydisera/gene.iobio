module.exports = {
  selector: '#genes-panel',
  commands: [{
    removeGene: function(gene) {
      var remove_link = "//div[@id='gene-badge' and button/span/text() = '" + gene + "']/a[@id='gene-badge-remove']";
      return this.api.useXpath().moveToElement(remove_link, 0, 0)
        .click(remove_link);
    },
    clickAnalyzeAll: function() {
      return this.click('@analyzeAll');
    },
    selectCallAll: function() {
      return this.click('#call-variants-dropdown')
                 .click('#call-variants-dropdown li a#call-variants-all-genes');
    },
    waitForAnalyzeAllDone: function() {
      this.waitForElementPresent('@analyzeAllDone', 60000);
    },
    waitForCallAllDone: function() {
      this.waitForElementPresent('@callAllDone', 60000);
    },
    clickRemoveAll: function() {
      return this.click('@removeAll');
    },
    selectGencodeTranscript: function() {
      return this.click('#select-gene-source + div .selectize-input')
                 .click('#select-gene-source + div .selectize-dropdown-content [data-value="Gencode Transcript"]');
    },
    selectRefSeqTranscript: function() {
      return this.click('#select-gene-source + div .selectize-input')
                 .click('#select-gene-source + div .selectize-dropdown-content [data-value="RefSeq Transcript"]');
    },
    orderGenesByOriginalOrder: function() {
      return this.click('#select-gene-container .selectize-control .selectize-input')
                 .click('#select-gene-container .selectize-dropdown-content [data-value="(original order)"]');
    },
    orderGenesByRelevance: function() {
      return this.click('#select-gene-container .selectize-control .selectize-input')
                 .click('#select-gene-container .selectize-dropdown-content [data-value="relevance"]');
    },
    orderGenesByGeneName: function() {
      return this.click('#select-gene-container .selectize-control .selectize-input')
                 .click('#select-gene-container .selectize-dropdown-content [data-value="gene name"]');
    },
    goToPage: function(num) {
      return this.click('#gene-page-selection li[data-lp="' + num + '"]:not(.prev):not(.next) a');
    },
    goToFirstPage: function() {
      return this.click('#gene-page-selection li.prev a');
    },
    goToLastPage: function() {
      return this.click('#gene-page-selection li.next a');
    },
    assertGeneBadgesVisible: function(genes) {
      var self = this;
      this.api.useXpath();
      genes.forEach(function(gene) {
        self.waitForElementVisible("//div[@id='gene-badge']//*[@id='gene-badge-name' and text()='" + gene + "']");
      });
      this.api.useCss();
      return this;
    },
    assertGeneBadgesLoaded: function(genes) {
      var self = this;
      this.api.useXpath();
      genes.forEach(function(gene) {
        self.waitForElementVisible("//div[@id='gene-badge']//*[@id='gene-badge-name' and text()='" + gene + "']/../*[@id='gene-badge-loaded']", 100000);
      });
      this.api.useCss();
      return this;
    },
    assertGeneBadgeHasWarning: function(gene) {
      this.api.useXpath();
      this.waitForElementVisible("//div[@id='gene-badge']//*[@id='gene-badge-name' and text()='" + gene + "']/../*[@id='gene-badge-warning']");
      this.api.useCss();
      return this;
    },
    assertAnalyzeAllProgressLabel: function(label) {
      var self = this;
      self.api.useXpath().getText(
        '//div[@id="genes-panel"]/div[@id="analyze-all-panel"]//div[@id="analyze-all-progress"]/div[@class="text"]', 
        function(result) 
      {
        self.assert.equal(result.value, label);
      })
      this.api.useCss();
      return this;
    },
    assertCallAllProgressLabel: function(label) {
      var self = this;
      self.api.useXpath().getText(
        '//div[@id="genes-panel"]/div[@id="analyze-all-panel"]//div[@id="call-all-progress"]/div[@class="text"]', 
        function(result) 
      {
        self.assert.equal(result.value, label);
      })
      this.api.useCss();
      return this;
    }    
  }],
  elements: {
    selectedGeneBadge: { selector: '#gene-badge.selected' },
    firstGeneBadge: { selector: '#gene-badge:first-child' },
    analyzeAll: { selector: '#analyze-all-genes' },
    removeAll: { selector: '#clear-gene-list' },
    analyzeAllDone: { selector: '#analyze-all-progress.done'},
    callAllDone: { selector: '#call-all-progress.done'}
  },
  sections: {
    selectedGeneBadge: {
      selector: '#gene-badge.selected',
      elements: {
        name: { selector: '#gene-badge-name' },
        remove: { selector: '#gene-badge-remove' },
        warning: { selector: '#gene-badge-warning' }
      }
    },
    firstGeneBadge: {
      selector: '#gene-badge:first-child',
      elements: {
        name: { selector: '#gene-badge-name' },
        remove: { selector: '#gene-badge-remove' }
      }
    }
  }
};
