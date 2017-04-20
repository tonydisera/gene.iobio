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
  },


  'Loading Platinum Trio': function(client) {
    indexPage.load();
    client.pause(2000);
    indexPage.clickDemoGene();

    client.pause(1000);
    matrixTrack.waitForMatrixLoaded();
  },

  'Bookmark 2 variants for gene RAI1 from matrix tooltip': function(client) {
    matrixTrack.clickColumn(1);
    matrixTooltip.waitForTooltip();

    matrixTooltip.expectInheritanceEquals('recessive inheritance');
    matrixTooltip.expectVepImpact('high');
    matrixTooltip.expectVepConsequence('stop gained');
    matrixTooltip.expectClinvarEquals('pathogenic');
    matrixTooltip.expectClinvarClinSigEquals('smith-magenis syndrome');
    matrixTooltip.expectAFExAC('0%');
    matrixTooltip.expectAF1000G('0%');
    matrixTooltip.expectQual('2880.99');
    matrixTooltip.expectFilter('.');
    matrixTooltip.expectAlleleCountsEquals('proband', 38, 1,  39, 'Hom');
    matrixTooltip.expectAlleleCountsEquals('mother',  26, 25, 51, 'Het');
    matrixTooltip.expectAlleleCountsEquals('father',  30, 33, 63, 'Het');

    matrixTooltip.clickBookmark();
    client.pause(1000);
    bookmarkPanel.assertCurrentBookmarkCoordEquals('17698535 G->A');
    bookmarkPanel.assertCurrentBookmarkRsIdEquals('rs527236033');
    bookmarkPanel.assertCurrentBookmarkHgvsEquals('p.Trp758Ter');
    bookmarkPanel.assertBookmarkCountEquals(1);

    matrixTrack.clickColumn(2);
    matrixTooltip.waitForTooltip();
    matrixTooltip.clickBookmark();
    bookmarkPanel.assertBookmarkCountEquals(2);
  },
    
    
  'Click on another gene and bookmark a third variant from tooltip': function(client) {
    nav.searchGene('PDHA1');
    client.pause(1000);
    matrixTrack.waitForMatrixLoaded();
    matrixTrack.clickColumn(1);
    matrixTooltip.waitForTooltip();


    matrixTooltip.expectInheritanceEquals('denovo inheritance');
    matrixTooltip.expectVepImpact('moderate');
    matrixTooltip.expectVepConsequence('missense variant');
    matrixTooltip.expectPolyphen('probably damaging');
    matrixTooltip.expectSIFT('deleterious');
    matrixTooltip.expectAlleleCountsEquals('proband', 27, 76, 103, 'Het');
    matrixTooltip.expectAlleleCountsEquals('mother',  null, null, 13, 'Homref');
    matrixTooltip.expectAlleleCountsEquals('father',  null, null, 42, 'Homref');


    matrixTooltip.clickBookmark();
    client.pause(1000);

    
    bookmarkPanel.assertCurrentBookmarkCoordEquals('19369471 G->T');
    bookmarkPanel.assertCurrentBookmarkRsIdEquals('');
    bookmarkPanel.assertCurrentBookmarkHgvsEquals('p.Gly160Cys');
    bookmarkPanel.assertBookmarkCountEquals(3);
  },


  'Click on a bookmark link in the bookmark panel and show matrix tooltip': function(client) {
    client.pause(2000);
    bookmarkPanel.clickBookmark(client, "17698535 G->A");
    matrixTrack.waitForMatrixLoaded();
    matrixTooltip.waitForTooltip();
    client.pause(2000);
    matrixTooltip.expectTitleLine2TextEquals('SNP G->A rs527236033');
    matrixTooltip.expectHGVSpTextEquals('ENSP00000323074.4:p.Trp758Ter');
    matrixTooltip.expectAlleleCountsEquals('proband', 38, 1, 39, 'Hom');

  },

  'Click on a gene link in the bookmark panel and make sure rectangles shown for bookmarked variants in proband variant': function(client) {
    bookmarkPanel.clickBookmarkGene(client, "RAI1");
    matrixTrack.waitForMatrixLoaded();
    probandVariantCard.assertBookmarkIndicatorCountEquals(2);

  },

 'Remove bookmark': function(client) {
    nav.searchGene('PDHA1');
    matrixTrack.waitForMatrixLoaded();
     matrixTrack.clickColumn(1);
    matrixTooltip.waitForTooltip();
    matrixTooltip.clickRemoveBookmark();
    client.pause(1000);
    bookmarkPanel.assertBookmarkCountEquals(2);

    client.end();
  }
}

