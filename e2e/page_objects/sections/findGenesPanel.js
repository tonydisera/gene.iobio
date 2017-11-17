module.exports = {
  selector: '#slider-left #genes-card',
  commands: [{
    importGeneSet: function(genes) {
      this.waitForElementVisible('@importGeneSetDropdown', 30000);
      var geneString = genes.join(",");
      this.click('@importGeneSetDropdown')
        .setValue('textarea#genes-to-copy', geneString);
      this.waitForElementVisible('@copyPasteButton', 2000);
      this.click('@copyPasteButton');
    },
    clickACMG56Genes: function() {
      this.waitForElementVisible('@ACMG56Genes', 30000);
      this.click('@ACMG56Genes');
    }
  }],
  elements: {
    importGeneSetDropdown: { selector: '#get-genes-dropdown button.dropdown-toggle' },
    copyPasteButton: { selector: '#get-genes-dropdown #get-genes-copy-paste-button' },
    ACMG56Genes: { selector: '#get-acmg-genes' }
  }
}