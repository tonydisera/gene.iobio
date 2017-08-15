var indexPage, appTitleSection, dataCard, matrixTrack, variantTooltip, bookmarkPanel, probandVariantCard, nav;

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
    bookmarkPanel = indexPage.section.bookmarkPanel;
    probandVariantCard = indexPage.section.probandVariantCard;

    variantTooltip = indexPage.section.variantTooltip;    
    variantTooltip.selector = variantTooltip.MATRIX_TOOLTIP;
  },


  'Loading Platinum Trio': function(client) {
    indexPage.load();
    client.pause(2000);
    indexPage.clickDemoGene();

    client.pause(1000);
    matrixTrack.waitForMatrixLoaded();
  },

  'Bookmark 2 variants for gene RAI1 from matrix variantTooltip': function(client) {
    variantTooltip.selector = variantTooltip.MATRIX_TOOLTIP;
    client.pause(2000);
    matrixTrack.clickColumn(1);

    variantTooltip.waitForTooltip();
    client.pause(3000);
    variantTooltip.expectInheritanceEquals('recessive inheritance');
    variantTooltip.expectVepImpact('high');
    variantTooltip.expectVepConsequence('stop gained');
    variantTooltip.expectClinvar('pathogenic');
    variantTooltip.expectClinvarClinSig('smith-magenis syndrome', 'Smith-Magenis_syndrome');
    variantTooltip.expectAFExAC('0%');
    variantTooltip.expectAF1000G('0%');
    variantTooltip.expectQual('2880.99');
    variantTooltip.expectFilter('. (unassigned)');
    variantTooltip.expectAlleleCountsEquals(variantTooltip.MATRIX_TOOLTIP, 'proband', 38, 1,  39, 'Hom');
    variantTooltip.expectAlleleCountsEquals(variantTooltip.MATRIX_TOOLTIP, 'mother',  26, 25, 51, 'Het');
    variantTooltip.expectAlleleCountsEquals(variantTooltip.MATRIX_TOOLTIP, 'father',  30, 33, 63, 'Het');
    variantTooltip.expectTitleEquals('RAI1 SNP G->A 17:17698535 rs527236033' );
    variantTooltip.expectHGVSpEquals('ENSP00000323074.4:p.Trp758Ter');


    variantTooltip.clickBookmark();
    client.pause(3000);
    bookmarkPanel.assertCurrentBookmarkCoordEquals('17698535 G->A');
    bookmarkPanel.assertCurrentBookmarkRsIdEquals('rs527236033');
    bookmarkPanel.assertCurrentBookmarkHgvsEquals('p.Trp758Ter');
    bookmarkPanel.assertBookmarkCountEquals(1);

    

    matrixTrack.clickColumn(2);
    variantTooltip.waitForTooltip();
    variantTooltip.clickBookmark();
    bookmarkPanel.assertBookmarkCountEquals(2);
  },
    
    
  'Click on another gene and bookmark a third variant from variantTooltip': function(client) {
    variantTooltip.selector = variantTooltip.MATRIX_TOOLTIP;
    client.pause(2000);
    nav.searchGene('PDHA1');
    client.pause(1000);
    matrixTrack.waitForMatrixLoaded();
    matrixTrack.clickColumn(1);
    variantTooltip.waitForTooltip();

    variantTooltip.expectInheritanceEquals('de novo inheritance');
    variantTooltip.expectVepImpact('moderate');
    variantTooltip.expectVepConsequence('missense variant');
    variantTooltip.expectPolyphen('probably damaging');
    variantTooltip.expectSIFT('deleterious');
    variantTooltip.expectAlleleCountsEquals(variantTooltip.MATRIX_TOOLTIP, 'proband', 27, 76, 103, 'Het');
    variantTooltip.expectAlleleCountsEquals(variantTooltip.MATRIX_TOOLTIP, 'mother',  null, null, 13, 'Homref');
    variantTooltip.expectAlleleCountsEquals(variantTooltip.MATRIX_TOOLTIP, 'father',  null, null, 42, 'Homref');


    variantTooltip.clickBookmark();
    client.pause(1000);

    
    bookmarkPanel.assertCurrentBookmarkCoordEquals('19369471 G->T');
    bookmarkPanel.assertCurrentBookmarkRsIdEquals('');
    bookmarkPanel.assertCurrentBookmarkHgvsEquals('p.Gly160Cys');
    bookmarkPanel.assertBookmarkCountEquals(3);
  },



  'Click on a bookmark link in the bookmark panel and show matrix variantTooltip': function(client) {
    client.pause(3000);
    bookmarkPanel.clickBookmark(client, "17698535 G->A");
    
    variantTooltip.selector = variantTooltip.MATRIX_TOOLTIP;
    matrixTrack.waitForMatrixLoaded();
    
    variantTooltip.waitForTooltip();
    client.pause(1000);
    variantTooltip.expectTitleEquals('RAI1 SNP G->A 17:17698535 rs527236033');
    variantTooltip.expectHGVSpEquals('ENSP00000323074.4:p.Trp758Ter');
    variantTooltip.expectAlleleCountsEquals(variantTooltip.MATRIX_variantTooltip, 'proband', 38, 1, 39, 'Hom');

  },


  'Click on a gene link in the bookmark panel and make sure rectangles shown for bookmarked variants in proband variant': function(client) {
    bookmarkPanel.clickBookmarkGene(client, "RAI1");
    matrixTrack.waitForMatrixLoaded();
    client.pause(3000)
    probandVariantCard.assertBookmarkIndicatorCountEquals(2);

  },

 'Remove bookmark': function(client) {
    nav.searchGene('PDHA1');
    matrixTrack.waitForMatrixLoaded();
    matrixTrack.clickColumn(1);
    variantTooltip.waitForTooltip();
    variantTooltip.clickRemoveBookmark();
    client.pause(1000);
    bookmarkPanel.assertBookmarkCountEquals(2);

    client.end();
  }
}

