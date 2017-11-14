var indexPage, appTitleSection, dataCard, matrixTrack, tooltip, bookmarkPanel, probandVariantCard, fatherVariantCard, filterPanel, nav;

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
    fatherVariantCard = indexPage.section.fatherVariantCard;
    appTitleSection = indexPage.section.appTitleSection;
    filterPanel = indexPage.section.filterPanel;
    tooltip = indexPage.section.variantTooltip;
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


  'Check for low coverage gene badges': function(client) {
    appTitleSection.assertGeneBadgeHasLowCoverage('AIRE');
    appTitleSection.assertGeneBadgeHasLowCoverage('PDHA1');
  },


  'Calling all genes': function(client) {
    appTitleSection.selectCallAll();
    appTitleSection.waitForCallAllDone();
    appTitleSection.assertCallAllProgressLabel("5 analyzed");

  },

  'Click denovo inheritance (custom) filter': function(client) {
    nav.clickFilter();
    client.pause(1000);

    filterPanel.clickClearAll();
    client.pause(1000);

    filterPanel.clickInheritanceDenovo();
    client.pause(2000);
    appTitleSection.assertAnalyzeAllCounts(2,3,1,4);
  },


  'Known causative filter': function(client) {
    nav.clickFilter();
    client.pause(1000);

    filterPanel.clickKnownCausative();
    client.pause(2000);
    filterPanel.assertKnownCausativeCounts(1,1);
    appTitleSection.assertAnalyzeAllCounts(1,4,1,4);


  },
  'De novo VUS filter': function(client) {

    filterPanel.clickDenovoVus();
    client.pause(2000);
    filterPanel.assertDenovoVusCounts(2,0);
    appTitleSection.assertAnalyzeAllCounts(2,3,0,5);

  },
  'Recessive VUS filter': function(client) {

    filterPanel.clickRecessiveVus();
    client.pause(2000);
    filterPanel.assertRecessiveVusCounts(0,0);
    appTitleSection.assertAnalyzeAllCounts(0,5,0,5);

  },
  'High or Moderate Impact filter': function(client) {

    filterPanel.clickHighOrModerateImpact();
    client.pause(2000);
    filterPanel.assertHighOrModerateImpactCounts(1,0);
    appTitleSection.assertAnalyzeAllCounts(1,4,0,5);

  },


  'Clear filter and click denovo inheritance (custom) filter': function(client) {
    client.pause(1000);
    filterPanel.clickClearAll();
    client.pause(2000);

    filterPanel.clickInheritanceDenovo();
    client.pause(2000);
    appTitleSection.assertAnalyzeAllCounts(2,3,1,4);
  },



  'Low gene coverage filter': function(client) {

    filterPanel.clickLowCoverage();
    client.pause(2000);
    filterPanel.assertLowCoverageCounts(2);
    appTitleSection.assertAnalyzeAllCounts(2,3,2,3);

  },
  'Clear all filter': function(client) {

    filterPanel.clickClearAll();
    filterPanel.assertKnownCausativeCounts(1,1);
    client.pause(2000);
    filterPanel.assertDenovoVusCounts(2,0);
    filterPanel.assertRecessiveVusCounts(0,0);
    filterPanel.assertHighOrModerateImpactCounts(1,0);
    appTitleSection.assertAnalyzeAllProgressLabel("5 analyzed");
    appTitleSection.assertCallAllProgressLabel("5 analyzed");
  },



  'Click on AIRE and validate recfilter . (unassigned) counts': function(client) {
    nav.clickFilter();
    client.pause(2000);

    nav.searchGene('AIRE');
    client.pause(2000);
    matrixTrack.waitForMatrixLoaded();

    filterPanel.clickRecfilterUnassigned();
    client.pause(2000);
    probandVariantCard.assertLoadedVariantSymbolCountEquals('4');

  },


  'Click on AIRE, PDHA1 and look for low coverage exon glyph': function(client) {

    filterPanel.clickClearAll();
    nav.searchGene('AIRE');

    client.pause(2000);
    matrixTrack.waitForMatrixLoaded();

    probandVariantCard.waitForBamDepthLoaded();
    probandVariantCard.assertDangerExonCountEquals(1);
    probandVariantCard.assertLowCoverageGlyphCountEquals(1);

    nav.searchGene('PDHA1');

    client.pause(2000);
    matrixTrack.waitForMatrixLoaded();

    probandVariantCard.waitForBamDepthLoaded();
    probandVariantCard.assertDangerExonCountEquals(1);
    probandVariantCard.assertLowCoverageGlyphCountEquals(1);

    fatherVariantCard.waitForBamDepthLoaded();
    fatherVariantCard.assertDangerExonCountEquals(9);
    fatherVariantCard.assertLowCoverageGlyphCountEquals(9);
  },

  'Click on MYLK2 and evaluate tooltip for called variant': function(client) {

    filterPanel.clickClearAll();
    nav.searchGene('MYLK2');

    client.pause(2000);
    matrixTrack.waitForMatrixLoaded();
    probandVariantCard.assertLoadedVariantCountEquals(2);
    probandVariantCard.assertCalledVariantCountEquals(1);
    probandVariantCard.assertLoadedVariantSymbolCountEquals(2);
    probandVariantCard.assertCalledVariantSymbolCountEquals(1);


    var evaluateTooltip = function(theTooltip) {
      theTooltip.expectInheritanceEquals('de novo inheritance');
      theTooltip.expectVepImpact('moderate');
      theTooltip.expectVepConsequence('missense variant');
      theTooltip.expectClinvar('likely pathogenic');
      theTooltip.expectClinvarClinSigExact('Cardiomyopathy');
      theTooltip.expectPolyphen('benign');
      theTooltip.expectSIFT('tolerated');
      theTooltip.expectAFExAC('0.003%');
      theTooltip.expectAF1000G('0%');
      theTooltip.expectQual("8.46129");
      theTooltip.expectFilter("PASS");
      theTooltip.expectHGVScEquals("ENST00000375994.2:c.595A>G");
      theTooltip.expectHGVSpEquals("ENSP00000365162.2:p.Ile199Val");
      theTooltip.expectAlleleCountsEquals(theTooltip.selector, 'proband', 10, 39, 49, 'Het');
      theTooltip.expectAlleleCountsEquals(theTooltip.selector, 'father',  null, null, 55, 'Homref');
      theTooltip.expectAlleleCountsEquals(theTooltip.selector, 'mother',  null, null, 45, 'Homref');

    }



    client.pause(2000);
    tooltip.selector = tooltip.PROBAND_TOOLTIP;
    probandVariantCard.clickCalledVariantSymbol(".snp.het.denovo.sift_tolerated.polyphen_benign.clinvar_lpath");
    client.pause(2000);
    evaluateTooltip(tooltip);
    tooltip.clickUnpin();


    client.pause(2000);
    matrixTrack.clickColumn(1);
    tooltip.selector = tooltip.MATRIX_TOOLTIP;
    tooltip.waitForTooltip();
    tooltip.selector = tooltip.MATRIX_TOOLTIP;
    evaluateTooltip(tooltip);


  },

  'end': function(client) {
    client.end();
  }


}

