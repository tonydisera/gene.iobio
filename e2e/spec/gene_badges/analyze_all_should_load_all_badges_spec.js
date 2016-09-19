var indexPage, appTitleSection, dataCard, matrixTrack, sliderIconBar, sliderLeft;

module.exports = {
  tags: [],
  beforeEach: function(client) {
    client.resizeWindow(1280, 800);
  },

  before: function(client) {
    indexPage = client.page.index();
    appTitleSection = indexPage.section.appTitleSection;
    dataCard = indexPage.section.dataCard;
    matrixTrack = indexPage.section.matrixTrack;
    sliderLeft = indexPage.section.sliderLeft;
    sliderIconBar = indexPage.section.sliderIconBar;
  },

  'Analyzing all in batch sizes of 1 should load all badges': function(client) {
    indexPage.load();
    appTitleSection.openDataMenu();
    dataCard.selectSingle();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();
    sliderIconBar.clickFindGenes();
    sliderLeft.section.findGenesPanel.importGeneSet(['BRCA1', 'BRCA2', 'TP53', 'STK11', 'MLH1']);
    appTitleSection.clickAnalyzeAll();
    matrixTrack.waitForMatrixLoaded();
    appTitleSection.assertGeneBadgesLoaded(['BRCA1', 'BRCA2', 'TP53', 'STK11', 'MLH1']);
    client.end();
  }
}
