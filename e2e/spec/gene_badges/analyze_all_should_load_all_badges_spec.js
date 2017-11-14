var indexPage, appTitleSection, dataCard, matrixTrack, findGenesPanel, nav;

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

  'Analyzing all in batch sizes of 1 should load all badges': function(client) {
    indexPage.load();
    nav.clickGenes();
    findGenesPanel.importGeneSet(['BRCA1', 'BRCA2', 'TP53', 'STK11', 'MLH1']);
    nav.clickData();
    dataCard.selectSingle();
    dataCard.selectGenomeBuild();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();
    appTitleSection.clickAnalyzeAll();
    matrixTrack.waitForMatrixLoaded();
    appTitleSection.assertGeneBadgesLoaded(['BRCA1', 'BRCA2', 'TP53', 'STK11', 'MLH1']);
    client.end();
  }
}
