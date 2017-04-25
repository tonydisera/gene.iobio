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
    nav.searchGene('BRCA1');
    nav.clickData();
    dataCard.selectSingle();
    dataCard.selectGenomeBuild('GRCh37');
    // dataCard.section.probandData.selectPlatinumTrio();
    dataCard.section.probandData.inputDefaults();
    dataCard.clickLoad();

    matrixTrack.waitForMatrixLoaded();
  },

  'ClinVar Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertClinVarBenign([1, 2, 3, 4, 6]);
    matrixTrack.assertClinVarNull([5]);
  },

  'SIFT Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertSIFTTolerated([1, 2, 3, 4]);
    matrixTrack.assertSIFTNull([5, 6, 7, 8]);
  },

  'PolyPhen Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertPolyPhenPossiblyDamaging([1]);
    matrixTrack.assertPolyPhenBenign([2, 3, 4]);
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

  'Allele Frequency ExAC row should be accurate': function(client) {
    matrixTrack.assertAfexacCommon([1, 2, 3, 4, 14, 15, 16]);
    matrixTrack.assertAfexacUniqueNc([5, 6, 7, 8, 9, 10, 11, 12, 13]);
  },

  'Allele Frequency 1000G row should be accurate': function(client) {
    matrixTrack.assertAf1000gCommon([1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    matrixTrack.assertAf1000gUnique([5]);
  },

  'Warning appears when no variants passing filter a gene': function(client) {
    nav.clickFilter();
    client.pause(1000);    
    filterPanel.clickClinvarPath();
    matrixTrack.waitForZeroFilteredVariantsWarning();

    client.pause(1000);
    // de-select clinvar filter
    filterPanel.unclickClinvarPath();
    // now select vep HIGH filter
    filterPanel.clickVepHigh();
    matrixTrack.waitForZeroFilteredVariantsWarning();
  },  

  'Warning appears when no variants found for a gene': function(client) {
    nav.searchGene('NNMT');
    matrixTrack.waitForZeroVariantsWarning();
  },  

  'Zygosity row should be accurate': function(client) {
    // matrixTrack.assertZygosityHet([]);
    // matrixTrack.assertZygosityHom([]);
    client.end();
  }
}

