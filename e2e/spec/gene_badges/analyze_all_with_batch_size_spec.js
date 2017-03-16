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

  'Analyzing all in batch sizes of 10 after refreshing the page should load all badges': function(client) {
    indexPage.load();
    nav.clickGenes();
    findGenesPanel.clickACMG56Genes();
    nav.clickData();
    dataCard.selectSingle();
    dataCard.selectGenomeBuild();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();
    matrixTrack.waitForMatrixLoaded();


    client.url(function(url) {
      client.url(url.value + '&batchSize=10');
      client.acceptAlert();
      appTitleSection.assertGeneBadgesLoaded(['BRCA1']);
      appTitleSection.clickAnalyzeAll();
      appTitleSection.waitForAnalyzeAllDone();
      appTitleSection.assertGeneBadgesLoaded([
         'CACNA1S', 'TNNT2', 'APOB', 'LDLR', 'MSH6'
      ]);
      appTitleSection.goToPage(2);
      appTitleSection.assertGeneBadgesLoaded([
        'SDHB', 'TGFBR2', 'TPM1', 'RYR1'
      ]);
      client.end();
    });
  }
}
