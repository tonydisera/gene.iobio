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

  'Importing a gene set should show the correct gene badges': function(client) {
    indexPage.load();
    nav.clickGenes();
    findGenesPanel.importGeneSet(['BRCA1', 'BRCA2']);
    appTitleSection.assertGeneBadgesVisible(['BRCA1', 'BRCA2']);
    client.end();
  }
}
