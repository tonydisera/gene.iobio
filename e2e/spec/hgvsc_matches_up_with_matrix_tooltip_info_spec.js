var indexPage, appTitleSection, dataCard, matrixTrack, matrixTooltip, filterPanel, inspectPanel;

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
    filterPanel = indexPage.section.filterPanel;

    variantTooltip = indexPage.section.variantTooltip;
    variantTooltip.selector = variantTooltip.MATRIX_TOOLTIP;
  },

  'Variant tooltip title in the matrix should be in sync with HGVSc in the tooltip': function(client) {
    indexPage.load();
    client.pause(2000);
    indexPage.clickDemoGene();
    client.pause(1000);
    appTitleSection.selectRefSeqTranscript();
    matrixTrack.waitForMatrixLoaded();
    client.pause(2000);
    
    variantTooltip.selector = variantTooltip.MATRIX_TOOLTIP;
    matrixTrack.clickColumn(1);
    variantTooltip.waitForTooltip();   
    
    client.pause(4000); 
    
    variantTooltip.expectVepConsequence('stop gained');
    variantTooltip.expectInheritanceEquals('recessive inheritance');
    variantTooltip.expectTitleEquals('RAI1 SNP G->A 17:17698535 rs527236033 ');
    variantTooltip.expectHGVScEquals('NM_030665.3:c.2273G>A');
    
    client.end();
  },
}