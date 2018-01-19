module.exports = {

  elements: {
    genes: { selector: '.nav.navbar-nav:first-child li:nth-child(5)' },
    filter: { selector: '.nav.navbar-nav:first-child li:nth-child(7)' },
    bookmarks: { selector: '.nav.navbar-nav:first-child li:nth-child(8)' },
    callVariants: { selector: '.nav.navbar-nav:first-child li:nth-child(9)' },
    enterGeneName: { selector: '#enter-gene-name' },
    data: { selector: '.nav.navbar-nav:first-child li:nth-child(1)' }
  },

  commands: [{
    clickFilter: function() {
      return this.click('@filter');
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