var indexPage, appTitleSection, dataCard, matrixTrack, matrixTooltip, sliderIconBar, filterPanel, aboutPanel, inspectPanel;

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
    sliderIconBar = indexPage.section.sliderIconBar;
    filterPanel = indexPage.section.filterPanel;
    aboutPanel = indexPage.section.aboutPanel;
    inspectPanel = indexPage.section.inspectPanel;
  },

  'Variant tooltip title in the matrix should be in sync with HGVSc in the inspect panel': function(client) {
    indexPage.load();
    aboutPanel.clickDemoGene();
    client.pause(1000);
    appTitleSection.selectRefSeqTranscript();
    matrixTrack.waitForMatrixLoaded();
    matrixTrack.clickColumn('snp 17700692');
    matrixTooltip.assertTitleContains('C->A');
    inspectPanel.assertHGVScContains('c>a');
    client.end();
  },
}