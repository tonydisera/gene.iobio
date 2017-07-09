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


  'Loading Platinum Trio alignments only': function(client) {
    indexPage.load();

    nav.clickGenes();
    findGenesPanel.importGeneSet(['RAI1', 'AIRE', 'MYLK2', 'PDGFB', 'PDHA1']);   
    nav.searchGene("RAI1"); 

    nav.clickData();
    dataCard.selectTrio();
    dataCard.selectGenomeBuild('GRCh37');
    dataCard.section.probandData.inputAlignmentsUrl("https://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam");
    dataCard.section.motherData.inputAlignmentsUrl("https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam");
    dataCard.section.fatherData.inputAlignmentsUrl("https://s3.amazonaws.com/iobio/samples/bam/NA12892.exome.bam");
    dataCard.section.probandData.inputName("proband");

    client.pause(2000);
    dataCard.clickLoad();

    client.pause(1000);
    indexPage.waitForAlertify();
    indexPage.clickAlertifyCancel();

  },

  

  'Call variants for selected gene': function(client) {

    client.pause(3000);
    appTitleSection.selectCallSelectedGene();
    client.pause(1000);

    tooltip.selector = tooltip.MATRIX_TOOLTIP;

    matrixTrack.waitForMatrixLoaded();
    matrixTrack.clickColumn(1);

    tooltip.waitForTooltip();
    client.pause(1000);
    tooltip.expectVepImpact('high');
    tooltip.expectInheritanceEquals('recessive inheritance');
    tooltip.expectVepConsequence('stop gained');
    tooltip.expectClinvar('pathogenic');
    tooltip.expectClinvarClinSig('smith-magenis syndrome');
    tooltip.expectAFExAC('0%');
    tooltip.expectAF1000G('0%');
    tooltip.expectQual('2266.59');
    tooltip.expectFilter('PASS');
    tooltip.expectAlleleCountsEquals(tooltip.MATRIX_TOOLTIP, 'proband', 38, 1,  39, 'Hom');
    tooltip.expectAlleleCountsEquals(tooltip.MATRIX_TOOLTIP, 'mother',  26, 25, 51, 'Het');
    tooltip.expectAlleleCountsEquals(tooltip.MATRIX_TOOLTIP, 'father',  30, 33, 63, 'Het');


  },

  'end': function(client) {
    //client.end();
  }

  
}