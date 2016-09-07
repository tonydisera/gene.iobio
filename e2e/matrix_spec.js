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

  'ClinVar Pathogenicity row should be accurate': function(client) {
    indexPage.load();
    appTitleSection.openDataMenu();
    dataCard.selectSingle();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();

    appTitleSection.selectGene('BRCA1');
    matrixTrack.waitForMatrixLoaded();

    matrixTrack.assertClinVarBenign(['snp 41244435', 'snp 41223094', 'snp 41244000', 'snp 41244936', 'snp 41234470']);
    matrixTrack.assertClinVarNull(['complex 41204842', 'ins 41275081']);
  },

  'SIFT Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertSIFTTolerated(['snp 41244435', 'snp 41223094', 'snp 41244000', 'snp 41244936']);
    matrixTrack.assertSIFTNull(['complex 41204842']);
  },

  'PolyPhen Pathogenicity row should be accurate': function(client) {
    matrixTrack.assertPolyPhenPossiblyDamaging(['snp 41244435']);
    matrixTrack.assertPolyPhenBenign(['snp 41223094', 'snp 41244000', 'snp 41244936']);
    matrixTrack.assertPolyPhenNull(['complex 41204842']);
  },

  'Impact VEP row should be accurate': function(client) {
    matrixTrack.assertImpactModerate(['snp 41244435', 'snp 41223094', 'snp 41244000', 'snp 41244936']);
    matrixTrack.assertImpactModifier(['complex 41204842', 'ins 41275081']);
    matrixTrack.assertImpactLow(['snp 41245466', 'snp 41245237', 'snp 41234470']);
    client.end();
  }
}

