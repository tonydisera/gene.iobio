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
    matrixTooltip = indexPage.section.matrixTooltip;
    filterPanel = indexPage.section.filterPanel;
  },

  'Variant tooltip title in the matrix should be in sync with HGVSc in the tooltip': function(client) {
    indexPage.load();
    client.pause(2000);
    indexPage.clickDemoGene();
    client.pause(1000);
    appTitleSection.selectRefSeqTranscript();
    matrixTrack.waitForMatrixLoaded();
    matrixTrack.clickColumn(1);
    client.pause(4000);
    matrixTooltip.assertTitleContains('C->A');
    matrixTooltip.assertHGVScContains('C>A');
    client.end();
  },
}