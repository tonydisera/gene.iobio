module.exports = {
  selector: '#app-title-section',
  commands: [{
    selectGene: function(gene) {
      this.clearValue('@enterGeneName');
      this.setValue('@enterGeneName', [gene, this.api.Keys.ARROW_DOWN, this.api.Keys.ENTER]);
      this.api.pause(2000);
      return this;
    },
    openDataMenu: function() {
      this.click('@addDataButton');
      this.api.pause(500); // this pause is needed for the trio button to become active
      return this;
    },
    removeGene: function(gene) {
      var remove_link = "//div[@id='gene-badge' and button/span/text() = '" + gene + "']/a[@id='gene-badge-remove']";
      return this.api.useXpath().moveToElement(remove_link, 0, 0)
        .click(remove_link);
    },
    clickAnalyzeAll: function() {
      return this.click('@analyzeAll');
    },
    clickRemoveAll: function() {
      return this.click('@removeAll');
    },
    orderGenesByOriginalOrder: function() {
      return this.click('#select-gene-container .selectize-control input')
                 .click('#select-gene-container .selectize-dropdown-content [data-value="(original order)"]');
    },
    orderGenesByRelevance: function() {
      return this.click('#select-gene-container .selectize-control input')
                 .click('#select-gene-container .selectize-dropdown-content [data-value="By relevance"]');
    },
    orderGenesByGeneName: function() {
      return this.click('#select-gene-container .selectize-control input')
                 .click('#select-gene-container .selectize-dropdown-content [data-value="By gene name"]');
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
        self.waitForElementVisible("//div[@id='gene-badge']//*[@id='gene-badge-name' and text()='" + gene + "']/../*[@id='gene-badge-loaded']", 60000);
      });
      this.api.useCss();
      return this;
    }
  }],
  elements: {
    enterGeneName: { selector: '#enter-gene-name' },
    addDataButton: { selector: '#add-data-button' },
    selectedGeneBadge: { selector: '#gene-badge.selected' },
    firstGeneBadge: { selector: '#gene-badge:first-child' },
    analyzeAll: { selector: '#manage-gene-list' },
    removeAll: { selector: '#clear-gene-list' }
  },
  sections: {
    selectedGeneBadge: {
      selector: '#gene-badge.selected',
      elements: {
        name: { selector: '#gene-badge-name' },
        remove: { selector: '#gene-badge-remove' }
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
