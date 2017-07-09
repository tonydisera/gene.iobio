var indexPage, appTitleSection, dataCard, matrixTrack, transcriptCard, nav, probandVariantCard;

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
    probandVariantCard = indexPage.section.probandVariantCard;
  },


  'Load button should be disabled until the sample for the vcf is selected': function(client) {
    indexPage.load();

    nav.clickData();
    dataCard.selectSingle();
    dataCard.selectGenomeBuild('GRCh37');
    dataCard.section.probandData.inputUrl("https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz");
    dataCard.searchGene('AIRE');
    client.pause(2000);

    // The sample has not been selected, so the load button should be disabled
    dataCard.assert.cssClassPresent('@loadButton', "disabled");
    dataCard.section.probandData.assert.cssClassPresent('@probandVcfSampleSelectPanel', "attention");

    dataCard.section.probandData.selectSample('NA12878');
    client.pause(1000);

    dataCard.assert.cssClassNotPresent('@loadButton', "disabled");
    dataCard.section.probandData.assert.cssClassNotPresent('@probandVcfSampleSelectPanel', "attention");

    dataCard.clickLoad();

    indexPage.expect.element('@probandVariantCard').to.be.visible;
    matrixTrack.waitForMatrixLoaded();
    probandVariantCard.assertLoadedVariantCountEquals('5');


    client.end();
  }


};