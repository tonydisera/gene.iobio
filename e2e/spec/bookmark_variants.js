var indexPage, appTitleSection, dataCard, matrixTrack, matrixTooltip, bookmarkPanel, nav;

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
  },


  'Loading Platinum Trio': function(client) {
    indexPage.load();
    client.pause(2000);
    indexPage.clickDemoGene();

    client.pause(1000);
    matrixTrack.waitForMatrixLoaded();
  },

  'Bookmark first variant from matrix tooltip': function(client) {
    matrixTrack.clickColumn(1);
    matrixTooltip.waitForTooltip();
    matrixTooltip.clickBookmark();
    client.pause(1000);
    bookmarkPanel.assertCurrentBookmarkCoordEquals('17698535 G->A');
    bookmarkPanel.assertCurrentBookmarkRsIdEquals('rs527236033');
    bookmarkPanel.assertCurrentBookmarkHgvsEquals('p.Trp758Ter');
  },
    
  'Click on another gene and bookmark a second variant from tooltip': function(client) {
    nav.searchGene('PDHA1');
    client.pause(1000);
    matrixTrack.waitForMatrixLoaded();
    matrixTrack.clickColumn(1);
    matrixTooltip.waitForTooltip();
    matrixTooltip.clickBookmark();
    client.pause(1000);
    bookmarkPanel.assertCurrentBookmarkCoordEquals('19369471 G->T');
    bookmarkPanel.assertCurrentBookmarkRsIdEquals('');
    bookmarkPanel.assertCurrentBookmarkHgvsEquals('p.Gly160Cys');
  },

  'Click on a bookmark link in the bookmark panel and show matrix tooltip': function(client) {
    bookmarkPanel.clickBookmark(client, "17698535 G->A");
    matrixTrack.waitForMatrixLoaded();
    matrixTooltip.waitForTooltip();
    matrixTooltip.expectTitleLine2TextEquals('SNP G->A rs527236033');
    matrixTooltip.expectHGVSpTextEquals('ENSP00000323074.4:p.Trp758Ter');


    client.end();
  }

}

