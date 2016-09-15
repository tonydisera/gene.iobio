module.exports = {
  selector: '#slider-icon-bar',
  commands: [{
  	clickFilter: function() {
  		this.click('@filter');
  	},
  	clickInspect: function() {
  		this.click('@inspect');
  	},
  	clickFindGenes: function() {
  		this.click('@findGenes');
  	},
  	clickBookmarks: function() {
  		this.click('@bookmarks');
  	},
  	clickCallVariants: function() {
  		this.click('@callVariants');
  	},
  	clickAbout: function() {
  		this.click('@about');
  	}
  }],
  elements: {
    filter: { selector: '#button-show-filters' },
    inspect: { selector: '#button-show-examine' },
    findGenes: { selector: '#button-show-phenolyzer' },
    bookmarks: { selector: '#button-show-bookmarks' },
    callVariants: { selector: '#button-find-missing-variants' },
    about: { selector: '#button-show-help' }
  }
};