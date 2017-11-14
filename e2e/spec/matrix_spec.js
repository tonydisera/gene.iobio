var indexPage, appTitleSection, dataCard, matrixTrack, nav, filterPanel;

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
    filterPanel = indexPage.section.filterPanel;
  },

  'Loading data should work': function(client) {
    indexPage.load();
    indexPage.clickDemoGene();
    client.pause(2000);
    nav.searchGene('BRCA1');

    matrixTrack.waitForMatrixLoaded();
  },

  'ClinVar Pathogenicity row should be accurate': function(client) {
    // Use this test if using clinvar eutils
    //matrixTrack.assertClinVarBenign([1, 2, 3, 4, 6]);

    // Use this test if using clinvar vcf
    matrixTrack.assertClinVarBenign([6, 7, 8, 10, 11, 12]);
    matrixTrack.assertClinVarNull([5]);
  },

  'SIFT Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertSIFTTolerated([1, 2, 3, 4]);
    matrixTrack.assertSIFTNull([5, 6, 7, 8]);
  },

  'PolyPhen Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertPolyPhenBenign([1, 2, 3, 4]);
    matrixTrack.assertPolyPhenNull([5, 6, 7, 8]);
  },

  'Impact VEP row should be accurate': function(client) {
    matrixTrack.assertImpactModerate([1, 2, 3, 4]);
    matrixTrack.assertImpactModifier([5, 6, 7, 8, 9, 10, 11, 12, 13]);
    matrixTrack.assertImpactLow([14, 15, 16]);

    // matrixTrack.assertImpactComplexDiamond([]);
    // matrixTrack.assertImpactInsCircle([]);
    matrixTrack.assertImpactDelTriangle([5, 8, 12]);
    matrixTrack.assertImpactSnpRect([1, 2, 3, 4, 6, 7, 9, 10, 11, 13, 14, 15, 16]);
  },

  'Most Severe Impact VEP row should be accurate': function(client) {
    matrixTrack.assertMostSevereImpactNull([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    matrixTrack.assertMostSevereImpactModifier([14, 15, 16]);
  },

  'Warning appears when no variants passing filter a gene': function(client) {
    nav.clickFilter();
    client.pause(1000);
    filterPanel.clickClinvarPath();
    matrixTrack.waitForZeroFilteredVariantsWarning();
    client.pause(1000);
    filterPanel.unclickClinvarPath();

    // now select vep HIGH filter
    filterPanel.clickVepHigh();
    matrixTrack.waitForZeroFilteredVariantsWarning();

  },

  'Warning appears when no variants found for a gene': function(client) {
    nav.searchGene('NNMT');
    matrixTrack.waitForZeroVariantsWarning();
  },

  'Allele Frequency <5% row should be accurate': function(client) {
    filterPanel.clickClearAll();
    nav.searchGene("RAI1");
    matrixTrack.waitForMatrixLoaded();
    matrixTrack.assertAfHighest([1,2]);
  },

  'Zygosity row should be accurate': function(client) {
    matrixTrack.assertZygosityHom([1,3,4]);
    client.end();
  }
}

