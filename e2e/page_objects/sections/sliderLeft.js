module.exports = {
  selector: '#slider-left',
  elements: {
    filterPanel: { selector: '#filter-track' },
    findGenesPanel: { selector: '#genes-card' },
    bookmarkPanel: { selector: '#bookmark-card' },
    inspectPanel: { selector: '#examine-card' },
    aboutPanel: { selector: '#help-card' },
    recallPanel: { selector: '#recall-card' }
  },
  sections: {
    filterPanel: {
    	selector: '#filter-track'
    },
    findGenesPanel: {
    	selector: '#genes-card',
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
    },
    bookmarkPanel: {
    	selector: '#bookmark-card'
  	},
    inspectPanel: {
    	selector: '#examine-card'
    },
    aboutPanel: {
    	selector: '#help-card',
      commands: [{
        clickDemoGene: function() {
          return this.click('@demoGene');
        }
      }],
      elements: {
        demoGene: { selector: '#load-demo-data' }
      }
  	},
    recallPanel: {
    	selector: '#recall-card'
    }
  }
};