var indexPage, appTitleSection, dataCard, matrixTrack, transcriptCard, nav;

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
    transcriptCard = indexPage.section.transcriptCard;
  },


  'Load button is disabled if no gene has been entered': function(client) {
    indexPage.load();


    nav.clickData();
    dataCard.selectSingle();
    dataCard.selectGenomeBuild('GRCh37');
    dataCard.section.probandData.selectPlatinumTrio();
    dataCard.assert.cssClassPresent('@loadButton', "disabled");
  },

  'Load button is enabled when gene has been entered': function(client) {

    dataCard.searchGene('RAI1');
    dataCard.assert.cssClassNotPresent('@loadButton', "disabled");
  },


  'Enter gene from data dialog, loading Platinum Single shows the correct cards': function(client) {
    dataCard.clickLoad();

    transcriptCard.expect.element('@geneName').text.to.equal('RAI1');
    indexPage.expect.element('@probandVariantCard').to.be.visible;
    indexPage.expect.element('@motherVariantCard').to.not.be.visible;
    indexPage.expect.element('@fatherVariantCard').to.not.be.visible;
    client.end();
  }



};

