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

  'Should not be able to x out a gene badge for the gene you are currently viewing': function(client) {
    indexPage.load();
    appTitleSection.openDataMenu();
    dataCard.selectSingle();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();

    appTitleSection.selectGene('BRCA2');
    matrixTrack.waitForElementVisible('@featureMatrix');
    appTitleSection.selectGene('BRAF');
    client.pause(1000);
    matrixTrack.waitForElementVisible('@featureMatrix');
    appTitleSection.removeGene('BRAF');
    appTitleSection.section.selectedGeneBadge.expect.element('@name').text.to.equal('BRAF');
    client.end();
  }
}
