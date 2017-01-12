var indexPage, appTitleSection;

module.exports = {
  tags: [],
  beforeEach: function(client) {
    client.resizeWindow(1280, 800);
  },

  before: function(client) {
    indexPage = client.page.index();
    appTitleSection = indexPage.section.appTitleSection;
  },

  'Should not be able to x out a gene badge for the gene you are currently viewing': function(client) {
    indexPage.load();
    appTitleSection.selectGene('BRCA2');
    appTitleSection.selectGene('BRAF');
    appTitleSection.removeGene('BRAF');
    appTitleSection.section.selectedGeneBadge.expect.element('@name').text.to.equal('BRAF');
    client.end();
  }
}
