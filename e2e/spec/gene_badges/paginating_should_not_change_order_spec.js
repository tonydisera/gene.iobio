var indexPage, appTitleSection, dataCard, matrixTrack, nav, findGenesPanel;

module.exports = {
  tags: [],
  beforeEach: function(client) {
    client.resizeWindow(1280, 800);
  },

  before: function(client) {
    indexPage = client.page.index();
    nav = client.page.nav();
    appTitleSection = indexPage.section.appTitleSection;
    dataCard = indexPage.section.dataCard;
    matrixTrack = indexPage.section.matrixTrack;
    findGenesPanel = indexPage.section.findGenesPanel;
  },

  'Paginating between gene badge pages should not change the existing order': function(client) {
    indexPage.load();
    nav.clickGenes();
    findGenesPanel.clickACMG56Genes();
    appTitleSection.orderGenesByGeneName();
    appTitleSection.section.firstGeneBadge.expect.element('@name').text.to.equal('ACTA2');
    appTitleSection.goToPage(2);
    appTitleSection.goToPage(1);
    appTitleSection.section.firstGeneBadge.expect.element('@name').text.to.equal('ACTA2');
    client.end();
  }
}
