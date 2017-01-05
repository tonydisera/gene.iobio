module.exports = {
	selector: '#slider-left #genes-card',
	commands: [{
		importGeneSet: function(genes) {
			var geneString = genes.join(",");
			return this.click('@importGeneSetDropdown')
								 .setValue('textarea#genes-to-copy', geneString)
							   .click('#get-genes-copy-paste-button');
		},
		clickACMG56Genes: function() {
			this.click('@ACMG56Genes');
		}
	}],
	elements: {
		importGeneSetDropdown: { selector: '#get-genes-dropdown button.dropdown-toggle' },
		ACMG56Genes: { selector: '#get-acmg-genes' }
	}
}