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

  'Analyzing all with a gene with > 500 variants (exonic-only filter turned on) should not filter by exonic only on subsequent genes': function(client) {
    indexPage.load();
    nav.clickGenes();
    findGenesPanel.importGeneSet(['RYR1', 'RYR2', 'STK11']);
    nav.clickData();
    dataCard.selectSingle();
    dataCard.selectGenomeBuild();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();
    appTitleSection.clickAnalyzeAll();
    appTitleSection.waitForAnalyzeAllDone();
    appTitleSection.assertGeneBadgesLoaded(['RYR1', 'RYR2', 'STK11']);
    client.end();
  }
}
