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
    
    matrixTrack.clickColumn(1);
    variantTooltip.selector = variantTooltip.MATRIX_TOOLTIP;
    variantTooltip.waitForTooltip();   
    client.pause(4000); 
    
    variantTooltip.expectVepConsequence('stop gained');
    variantTooltip.expectInheritanceEquals('recessive inheritance');
    variantTooltip.expectTitleLine2Equals('SNP G->A rs527236033 17:17698535');
    variantTooltip.expectHGVScEquals('NM_030665.3:c.2273G>A');
    
    client.end();
  },
}