var indexPage, appTitleSection, dataCard, matrixTrack, matrixTooltip, bookmarkPanel, probandVariantCard, filterPanel, nav;

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
    filterPanel = indexPage.section.filterPanel;
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

  },
  'Calling all genes': function(client) {
    appTitleSection.selectCallAll();
    appTitleSection.waitForCallAllDone();
    appTitleSection.assertCallAllProgressLabel("5 analyzed");

  },
  'Known causative filter': function(client) {
    nav.clickFilter();
    client.pause(1000);

    filterPanel.clickKnownCausative();
    filterPanel.assertKnownCausativeCounts(1,1);
    appTitleSection.assertAnalyzeAllCounts(1,4,1,4);


  },
  'De novo VUS filter': function(client) {

    filterPanel.clickDenovoVus();
    filterPanel.assertDenovoVusCounts(2,0);
    appTitleSection.assertAnalyzeAllCounts(2,3,0,5);

  },
  'Recessive VUS filter': function(client) {

    filterPanel.clickRecessiveVus();
    filterPanel.assertRecessiveVusCounts(0,0);
    appTitleSection.assertAnalyzeAllCounts(0,5,0,5);

  },
  'High or Moderate Impact filter': function(client) {

    filterPanel.clickHighOrModerateImpact();
    filterPanel.assertHighOrModerateImpactCounts(3,0);
    appTitleSection.assertAnalyzeAllCounts(3,2,0,5);

  },
  'Clear all filter': function(client) {

    filterPanel.clickClearAll();
    filterPanel.assertKnownCausativeCounts(1,1);
    filterPanel.assertDenovoVusCounts(2,0);
    filterPanel.assertRecessiveVusCounts(0,0);
    filterPanel.assertHighOrModerateImpactCounts(3,0);
    appTitleSection.assertAnalyzeAllProgressLabel("5 analyzed");
    appTitleSection.assertCallAllProgressLabel("5 analyzed");
  },
  'Click denovo inheritance (custom) filter': function(client) {
    filterPanel.clickClearAll();
    filterPanel.clickInheritanceDenovo();
    appTitleSection.assertAnalyzeAllCounts(2,3,1,4);
  },

  'end': function(client) {
    client.end();
  }

  
}

