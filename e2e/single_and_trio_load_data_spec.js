var indexPage, appTitleSection, dataCard, matrixTrack;

module.exports = {
  beforeEach: function(client) {
    client.maximizeWindow();
  },

  before: function(client) {
    indexPage = client.page.index();
    appTitleSection = indexPage.section.appTitleSection;
    dataCard = indexPage.section.dataCard;
    matrixTrack = indexPage.section.matrixTrack;
  },

  'Loading Platinum Single shows the correct cards (only proband)': function(client) {
    indexPage.load();
    appTitleSection.openDataMenu();
    dataCard.selectSingle();
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.clickLoad();

    appTitleSection.selectGene('BRCA2');

    appTitleSection.expect.element('@geneBadgeName').text.to.equal('BRCA2');
    indexPage.expect.element('@probandVariantCard').to.be.visible;
    indexPage.expect.element('@motherVariantCard').to.not.be.visible;
    indexPage.expect.element('@fatherVariantCard').to.not.be.visible;
    matrixTrack.waitForElementVisible('@featureMatrix');
  },

  'Loading Platinum Trio shows the correct cards (proband, mother, and father)': function(client) {
    appTitleSection.openDataMenu();
    dataCard.selectTrio();
    dataCard.section.motherData.selectPlatinumTrio();
    dataCard.section.fatherData.selectPlatinumTrio();
    dataCard.clickLoad();

    appTitleSection.expect.element('@geneBadgeName').text.to.equal('BRCA2');
    indexPage.expect.element('@probandVariantCard').to.be.visible;
    indexPage.expect.element('@motherVariantCard').to.be.visible;
    indexPage.expect.element('@fatherVariantCard').to.be.visible;
  },

  'Clicking Single after Loading Trio Data should not immediately hide mother and father variant cards': function(client) {
    matrixTrack.waitForElementVisible('@featureMatrix');
    appTitleSection.openDataMenu();
    dataCard.selectSingle();
    indexPage.expect.element('@motherVariantCard').to.be.visible;
    indexPage.expect.element('@fatherVariantCard').to.be.visible;
  },

  'Changing your mind to Trio should still have the load button enabled': function(client) {
    dataCard.selectTrio();
    dataCard.assert.cssClassNotPresent('@loadButton', "disabled");
    client.end();
  }
};

