var indexPage, appTitleSection, findGenesPanel, dataCard, matrixTrack, tooltip, bookmarkPanel, probandVariantCard, filterPanel, nav;

module.exports = {
  tags: [],
  beforeEach: function(client) {
    client.resizeWindow(1280, 800);
  },

  before: function(client) {
    indexPage = client.page.index();
    nav = client.page.nav();
    dataCard = indexPage.section.dataCard;
    matrixTrack = indexPage.section.matrixTrack;
    probandVariantCard = indexPage.section.probandVariantCard;
    appTitleSection = indexPage.section.appTitleSection;
    filterPanel = indexPage.section.filterPanel;
    tooltip = indexPage.section.variantTooltip;
    findGenesPanel = indexPage.section.findGenesPanel;
  },


  'Loading Platinum Trio alignments only, analyzing all genes': function(client) {
    indexPage.load();

    nav.clickGenes();
    findGenesPanel.importGeneSet(['RAI1', 'AIRE', 'MYLK2', 'PDGFB', 'PDHA1']);
    nav.searchGene("RAI1");

    nav.clickData();
    dataCard.selectTrio();
    dataCard.selectGenomeBuild('GRCh37');
    dataCard.section.probandData.inputAlignmentsUrl("https://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam");
    dataCard.section.motherData.inputAlignmentsUrl("https://s3.amazonaws.com/iobio/samples/bam/NA12892.exome.bam");
    dataCard.section.fatherData.inputAlignmentsUrl("https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam");
    dataCard.section.probandData.inputName("proband");

    client.pause(10000);
    dataCard.clickLoad();

    client.pause(1000);
    indexPage.waitForAlertify();
    indexPage.clickAlertifyCancel();
    client.pause(3000);

  },


  'Calling all genes': function(client) {
    appTitleSection.selectCallAll();
    appTitleSection.waitForCallAllDone();
    appTitleSection.assertCallAllProgressLabel("5 analyzed");

  },


  'Click denovo inheritance (custom) filter': function(client) {
    nav.clickFilter();
    client.pause(1000);

    filterPanel.clickClearAll();
    client.pause(1000);
    filterPanel.clickInheritanceDenovo();
    client.pause(1000);
    appTitleSection.assertAnalyzeAllCounts(0,0,3,2);
  },


  'Known causative filter': function(client) {
    nav.clickFilter();
    client.pause(1000);

    filterPanel.clickKnownCausative();
    client.pause(1000);
    filterPanel.assertKnownCausativeCounts(0,2);
    appTitleSection.assertAnalyzeAllCounts(0,0,2,3);


  },

  'Recessive VUS filter': function(client) {

    filterPanel.clickRecessiveVus();
    client.pause(1000);
    filterPanel.assertRecessiveVusCounts(0,0);
    appTitleSection.assertAnalyzeAllCounts(0,0,0,5);

  },
  'High or Moderate Impact filter': function(client) {

    filterPanel.clickHighOrModerateImpact();
    client.pause(1000);
    filterPanel.assertHighOrModerateImpactCounts(0,0);
    appTitleSection.assertAnalyzeAllCounts(0,0,0,0);

  },
  'De novo VUS filter': function(client) {

    filterPanel.clickDenovoVus();
    client.pause(1000);
    filterPanel.assertDenovoVusCounts(0,2);
    appTitleSection.assertAnalyzeAllCounts(0,0,2,3);

  },
  'Clear all filter': function(client) {

    filterPanel.clickClearAll();
    client.pause(1000);
    filterPanel.assertKnownCausativeCounts(0,2);
    client.pause(1000);
    filterPanel.assertDenovoVusCounts(0,2);
    filterPanel.assertRecessiveVusCounts(0,0);
    filterPanel.assertHighOrModerateImpactCounts(0,1);
    appTitleSection.assertCallAllProgressLabel("5 analyzed");
  },

  'Click denovo inheritance (custom) filter after all standard filters': function(client) {
    nav.clickFilter();
    client.pause(1000);

    filterPanel.clickClearAll();
    client.pause(1000);
    filterPanel.clickInheritanceDenovo();
    client.pause(1000);
    appTitleSection.assertAnalyzeAllCounts(0,0,3,2);
  },


  'Click on MYLK2 and evaluate tooltip for called variant': function(client) {

    filterPanel.clickClearAll();
    nav.searchGene('MYLK2');

    client.pause(5000);
    matrixTrack.waitForMatrixLoaded();
    probandVariantCard.assertLoadedVariantCountEquals(0);
    probandVariantCard.assertCalledVariantCountEquals(3);
    probandVariantCard.assertLoadedVariantSymbolCountEquals(0);
    probandVariantCard.assertCalledVariantSymbolCountEquals(3);


    var evaluateTooltip = function(theTooltip) {
      theTooltip.expectInheritanceEquals('de novo inheritance');
      theTooltip.expectVepImpact('moderate');
      theTooltip.expectVepConsequence('missense variant');
      theTooltip.expectClinvar('likely pathogenic');
      theTooltip.expectClinvarClinSig('cardiomyopathy', 'Cardiomyopathy');
      theTooltip.expectPolyphen('benign');
      theTooltip.expectSIFT('tolerated');
      theTooltip.expectAFExAC('0.003%');
      theTooltip.expectAF1000G('0%');
      theTooltip.expectQual("8.46129");
      theTooltip.expectFilter("PASS");
      theTooltip.expectHGVScEquals("ENST00000375994.2:c.595A>G");
      theTooltip.expectHGVSpEquals("ENSP00000365162.2:p.Ile199Val");
      theTooltip.expectAlleleCountsEquals(theTooltip.selector, 'proband', 10, 39, 49, 'Het');
      theTooltip.expectAlleleCountsEquals(theTooltip.selector, 'father',  null, null, 55, 'Homref');
      theTooltip.expectAlleleCountsEquals(theTooltip.selector, 'mother',  null, null, 45, 'Homref');

    }



    client.pause(2000);
    tooltip.selector = tooltip.PROBAND_TOOLTIP;
    probandVariantCard.clickCalledVariantSymbol(".snp.het.denovo.sift_tolerated.polyphen_benign.clinvar_lpath");
    client.pause(2000);
    evaluateTooltip(tooltip);
    tooltip.clickUnpin();


    client.pause(2000);
    matrixTrack.clickColumn(1);
    tooltip.selector = tooltip.MATRIX_TOOLTIP;
    tooltip.waitForTooltip();
    evaluateTooltip(tooltip);


  },


  'end': function(client) {
    client.end();
  }


}