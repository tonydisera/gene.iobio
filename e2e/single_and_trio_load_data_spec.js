module.exports = {
  beforeEach: function(client) {
    client.maximizeWindow();
  },

  'Loading Platinum Single and Platinum Trio shows the correct cards': function(client) {
    var indexPage = client.page.index();
    var appTitleSection = indexPage.section.appTitleSection;
    var dataCard = indexPage.section.dataCard;

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

    indexPage.waitForElementVisible('@matrixTrack');

    // Platinum Trio
    appTitleSection.openDataMenu();
    dataCard.selectTrio();
    dataCard.section.motherData.selectPlatinumTrio();
    dataCard.section.fatherData.selectPlatinumTrio();
    dataCard.clickLoad();

    appTitleSection.expect.element('@geneBadgeName').text.to.equal('BRCA2');
    indexPage.expect.element('@probandVariantCard').to.be.visible;
    indexPage.expect.element('@motherVariantCard').to.be.visible;
    indexPage.expect.element('@fatherVariantCard').to.be.visible;

    client.end();
  }
};

// bug start with trio, then click data, load button is enabled, click single removes mother father data without load, then click trio, load button is disabled

