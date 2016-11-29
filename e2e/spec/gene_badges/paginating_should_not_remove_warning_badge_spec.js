var indexPage, appTitleSection, dataCard, matrixTrack, sliderIconBar, findGenesPanel, probandVariantCard;

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
    findGenesPanel = indexPage.section.findGenesPanel;
    sliderIconBar = indexPage.section.sliderIconBar;
    probandVariantCard = indexPage.section.probandVariantCard;
  },

  'Paginating should not remove warning label on badge': function(client) {
    indexPage.load();
    sliderIconBar.clickFindGenes();
    findGenesPanel.clickACMG56Genes();
    client.pause(3000);
    appTitleSection.selectGene('STK11');

    appTitleSection.openDataMenu();
    dataCard.section.probandData.inputDefaults();
    dataCard.clickLoad();

    probandVariantCard.waitForBamDepthLoaded();

    appTitleSection.section.selectedGeneBadge.expect.element('@warning').to.be.visible;
    appTitleSection.goToPage(2);
    appTitleSection.goToPage(1);

    appTitleSection.assertGeneBadgeHasWarning('STK11');
    client.end();
  }
}
