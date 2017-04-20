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


  'Load button is disabled if no gene has been entered': function(client) {
    indexPage.load();

    nav.clickData();
    dataCard.selectSingle();
    dataCard.selectGenomeBuild('GRCh37');
    dataCard.checkSeparateUrlForIndex();
    dataCard.section.probandData.inputUrl("https://s3.amazonaws.com/iobio/app_testing/vcf_files/diff_index_url/snps_only.vcf.gz")
    dataCard.section.probandData.inputTbiUrl("https://s3.amazonaws.com/iobio/app_testing/vcf_files/diff_index_url/index/snps_only.vcf.gz.tbi")
    client.pause(1000);
    dataCard.section.probandData.selectSample('NA19238');
    client.pause(1000);

    dataCard.section.probandData.inputAlignmentsUrl("https://s3.amazonaws.com/iobio/app_testing/bam_files/diff_index_url/wgs_platinum_NA12878_brca2.bam");
    dataCard.section.probandData.inputAlignmentsBaiUrl("https://s3.amazonaws.com/iobio/app_testing/bam_files/diff_index_url/index/wgs_platinum_NA12878_brca2.bam.bai");

    dataCard.searchGene('BRCA2');

    dataCard.assert.cssClassNotPresent('@loadButton', "disabled");

    dataCard.clickLoad();

    transcriptCard.expect.element('@geneName').text.to.equal('BRCA2');
    indexPage.expect.element('@probandVariantCard').to.be.visible;
    matrixTrack.waitForMatrixLoaded();
    probandVariantCard.assertVariantCountEquals('42');
    probandVariantCard.assertVariantSymbolCountEquals(42);
    probandVariantCard.assertSNPSymbolCountEquals( 42);
    probandVariantCard.waitForBamDepthLoaded();


    client.end();
  }


};

