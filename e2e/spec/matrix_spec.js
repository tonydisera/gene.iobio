var indexPage, appTitleSection, dataCard, matrixTrack;

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
  },

  'Loading data should work': function(client) {
    indexPage.load();
    appTitleSection.openDataMenu();
    dataCard.selectSingle();
    // dataCard.section.probandData.selectPlatinumTrio();
    dataCard.section.probandData.inputDefaults();
    dataCard.clickLoad();

    appTitleSection.selectGene('BRCA1');
    matrixTrack.waitForMatrixLoaded();
  },

  'ClinVar Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertClinVarBenign(['snp 41244435', 'snp 41244000', 'snp 41244936', 'snp 41223094', 'snp 41234470']);
    matrixTrack.assertClinVarNull(['del 41256089', 'del 41256075']);
  },

  'SIFT Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertSIFTTolerated(['snp 41244435', 'snp 41244000', 'snp 41244936', 'snp 41223094']);
    matrixTrack.assertSIFTNull(['del 41256089', 'snp 41219780']);
  },

  'PolyPhen Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertPolyPhenPossiblyDamaging(['snp 41244435']);
    matrixTrack.assertPolyPhenBenign(['snp 41244000', 'snp 41244936', 'snp 41223094']);
    matrixTrack.assertPolyPhenNull(['del 41256089']);
  },

  'Impact VEP row should be accurate': function(client) {
    matrixTrack.assertImpactModerate(['snp 41244435', 'snp 41244000', 'snp 41244936', 'snp 41223094']);
    matrixTrack.assertImpactModifier([
      'del 41256089',
      'snp 41219780',
      'snp 41226601',
      'del 41256075',
      'snp 41219560',
      'snp 41219804',
      'snp 41231516',
      'del 41249363',
      'snp 41215825'
    ]);
    matrixTrack.assertImpactLow(['snp 41245466', 'snp 41245237', 'snp 41234470']);

    // matrixTrack.assertImpactComplexDiamond([]);
    // matrixTrack.assertImpactInsCircle([]);
    matrixTrack.assertImpactDelTriangle(['del 41256089', 'del 41256075', 'del 41249363']);
    matrixTrack.assertImpactSnpRect([
      'snp 41244435',
      'snp 41244000',
      'snp 41244936',
      'snp 41223094',
      'snp 41219780',
      'snp 41226601',
      'snp 41219560',
      'snp 41219804',
      'snp 41231516',
      'snp 41215825',
      'snp 41245466',
      'snp 41245237',
      'snp 41234470'
    ]);
  },

  'Allele Frequency 1000G row should be accurate': function(client) {
    matrixTrack.assertAf1000gCommon(['snp 41244435', 'snp 41244000', 'snp 41244936', 'snp 41223094']);
    matrixTrack.assertAf1000gRare(['del 41256089']);
  },

  'Allele Frequency ExAC row should be accurate': function(client) {
    matrixTrack.assertAfexacCommon(['snp 41244435', 'snp 41244000', 'snp 41244936', 'snp 41223094']);
    matrixTrack.assertAfexacUniqueNc(['del 41256089', 'snp 41219780']);
  },

  'Zygosity row should be accurate': function(client) {
    // matrixTrack.assertZygosityHet([]);
    // matrixTrack.assertZygosityHom([]);
    client.end();
  }
}

