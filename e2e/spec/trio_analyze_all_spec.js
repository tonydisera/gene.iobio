var indexPage, appTitleSection, dataCard, matrixTrack, matrixTooltip, bookmarkPanel, probandVariantCard, nav;

module.exports = {
  tags: [],
  beforeEach: function(client) {
    client.resizeWindow(1280, 800);
  },

  before: function(client) {
    indexPage = client.page.index();
    nav = client.page.nav();
    dataCard = indexPage.section.dataCard;
    matrixTrack = indexPage.section.matrixTrack;  
    matrixTooltip = indexPage.section.matrixTooltip;    
    bookmarkPanel = indexPage.section.bookmarkPanel;
    probandVariantCard = indexPage.section.probandVariantCard;
    appTitleSection = indexPage.section.appTitleSection;
  },


  'Loading Platinum Trio, analyzing all genes': function(client) {
    indexPage.load();
    client.pause(2000);
    indexPage.clickDemoGene();

    client.pause(1000);
    matrixTrack.waitForMatrixLoaded();

    appTitleSection.clickAnalyzeAll();
    appTitleSection.waitForAnalyzeAllDone();
    appTitleSection.assertGeneBadgesLoaded(['RAI1', 'PDHA1', 'AIRE', 'MYLK2', 'PDGFB']);
    appTitleSection.assertAnalyzeAllProgressLabel("5 analyzed");

    appTitleSection.selectCallAll();
    appTitleSection.waitForCallAllDone();
    appTitleSection.assertCallAllProgressLabel("5 analyzed");

  },

  
}

