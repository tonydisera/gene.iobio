module.exports = {
  selector: '#app-title-section',
  commands: [{
    selectGene: function(gene) {
      return this.setValue('@enterGeneName', [gene, this.api.Keys.ARROW_DOWN, this.api.Keys.ENTER]);
    },
    openDataMenu: function() {
      this.click('@addDataButton');
      this.api.pause(500); // this pause is needed for the trio button to become active
      return this;
    }
  }],
  elements: {
    enterGeneName: { selector: '#enter-gene-name' },
    addDataButton: { selector: '#add-data-button' },
    geneBadgeName: { selector: '#gene-badge-name' }
  }
};