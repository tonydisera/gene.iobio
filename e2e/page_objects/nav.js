module.exports = {

  elements: {
    filter: { selector: '.nav.navbar-nav:first-child li:first-child' },
    inspect: { selector: '.nav.navbar-nav:first-child li:nth-child(2)' },
    genes: { selector: '.nav.navbar-nav:first-child li:nth-child(3)' },
    bookmarks: { selector: '.nav.navbar-nav:first-child li:nth-child(4)' },
    callVariants: { selector: '.nav.navbar-nav:first-child li:nth-child(5)' },
    enterGeneName: { selector: '#enter-gene-name' },
    data: { selector: '.nav.navbar-nav:first-child li:nth-child(7)' }
  },

  commands: [{
    clickFilter: function() {
      return this.click('@filter');
    },
    clickInspect: function() {
      return this.click('@inspect');
    },
    clickGenes: function() {
      return this.click('@genes');
    },
    clickBookmarks: function() {
      return this.click('@bookmarks');
    },
    clickCallVariants: function() {
      return this.click('@callVariants');
    },
    searchGene: function(gene) {
      this.clearValue('@enterGeneName');
      this.setValue('@enterGeneName', [gene, this.api.Keys.ARROW_DOWN, this.api.Keys.ENTER]);
      this.api.pause(2000);
      return this;
    },
    clickData: function() {
      this.click('@data');
      this.api.pause(500);
      return this;
    }
  }],

  sections: {

  }
};