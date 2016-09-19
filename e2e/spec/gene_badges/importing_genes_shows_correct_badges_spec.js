var indexPage, appTitleSection, dataCard, matrixTrack, sliderIconBar, sliderLeft;

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
    sliderLeft = indexPage.section.sliderLeft;
    sliderIconBar = indexPage.section.sliderIconBar;
  },

  'Importing a gene set should show the correct gene badges': function(client) {
    indexPage.load();
    sliderIconBar.clickFindGenes();
    sliderLeft.section.findGenesPanel.importGeneSet(['BRCA1', 'BRCA2']);
    appTitleSection.assertGeneBadgesVisible(['BRCA1', 'BRCA2']);
    client.end();
  }
}
