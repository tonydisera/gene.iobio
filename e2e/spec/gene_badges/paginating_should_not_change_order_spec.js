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

  'Paginating between gene badge pages should not change the existing order': function(client) {
    indexPage.load();
    sliderIconBar.clickFindGenes();
    sliderLeft.section.findGenesPanel.clickACMG56Genes();
    indexPage.waitForElementVisible('@matrixTrack');
    appTitleSection.orderGenesByGeneName();
    appTitleSection.section.firstGeneBadge.expect.element('@name').text.to.equal('ACTA2');
    appTitleSection.goToPage(2);
    appTitleSection.goToPage(1);
    appTitleSection.section.firstGeneBadge.expect.element('@name').text.to.equal('ACTA2');
    client.end();
  }
}
