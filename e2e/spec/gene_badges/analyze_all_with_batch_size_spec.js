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

  'Analyzing all in batch sizes of 10 after refreshing the page should load all badges': function(client) {
    indexPage.load();
    appTitleSection.openDataMenu();
    dataCard.selectSingle();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();
    sliderIconBar.clickFindGenes();
    sliderLeft.section.findGenesPanel.clickACMG56Genes();
    matrixTrack.waitForMatrixLoaded();


    client.url(function(url) {
      client.url(url.value + '&batchSize=10');
      client.acceptAlert();
      appTitleSection.assertGeneBadgesLoaded(['BRCA1']);
      appTitleSection.clickAnalyzeAll();
      appTitleSection.assertGeneBadgesLoaded([
        'BRCA2', 'TP53', 'STK11', 'MLH1', 'MSH2', 'MSH6', 'PMS2',
        'APC', 'MUTYH', 'VHL', 'MEN1', 'RET', 'PTEN', 'RB1', 'SDHD',
        'SDHAF2', 'SDHC', 'SDHB', 'TSC1', 'TSC2', 'WT1', 'NF2', 'COL3A1',
        'FBN1', 'TGFBR1', 'TGFBR2', 'SMAD3', 'ACTA2', 'MYLK', 'MYH11', 'MYBPC3',
        'MYH7', 'TNNT2', 'TNNI3', 'TPM1', 'MYL3', 'ACTC1', 'PRKAG2', 'GLA'
      ]);
      appTitleSection.goToPage(2);
      appTitleSection.assertGeneBadgesLoaded([
        'MYL2', 'LMNA', 'RYR2', 'PKP2', 'DSP', 'DSC2', 'TMEM43', 'DSG2',
        'KCNQ1', 'KCNH2', 'SCN5A', 'LDLR', 'APOB', 'PCSK9', 'RYR1', 'CACNA1S'
      ]);
      client.end();
    });
  }
}
