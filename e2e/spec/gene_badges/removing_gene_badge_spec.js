var indexPage, appTitleSection, nav;

module.exports = {
  tags: [],
  beforeEach: function(client) {
    client.resizeWindow(1280, 800);
  },

  before: function(client) {
    indexPage = client.page.index();
    nav = client.page.nav();
    appTitleSection = indexPage.section.appTitleSection;
  },

  'Should not be able to x out a gene badge for the gene you are currently viewing': function(client) {
    indexPage.load();
    nav.searchGene('BRCA2');
    nav.searchGene('BRAF');
    appTitleSection.removeGene('BRAF');
    appTitleSection.section.selectedGeneBadge.expect.element('@name').text.to.equal('BRAF');
    client.end();
  }
}
