module.exports = {
  selector: '#app-title-section',
  commands: [{
    selectGene: function(gene) {
      this.clearValue('@enterGeneName');
      return this.setValue('@enterGeneName', [gene, this.api.Keys.ARROW_DOWN, this.api.Keys.ENTER]);
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
    }
  }],
  elements: {
    enterGeneName: { selector: '#enter-gene-name' },
    addDataButton: { selector: '#add-data-button' },
    selectedGeneBadge: { selector: '#gene-badge.selected' }
  },
  sections: {
    selectedGeneBadge: {
      selector: '#gene-badge.selected',
      elements: {
        name: { selector: '#gene-badge-name' },
        remove: { selector: '#gene-badge-remove' }
      }
    }
  }
};
