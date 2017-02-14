var indexPage, appTitleSection, dataCard, matrixTrack, nav, findGenesPanel, probandVariantCard;

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
    findGenesPanel = indexPage.section.findGenesPanel;
    probandVariantCard = indexPage.section.probandVariantCard;
  },

  'Paginating should not remove warning label on badge': function(client) {
    indexPage.load();
    nav.clickGenes();
    findGenesPanel.clickACMG56Genes();
    client.pause(3000);
    nav.searchGene('PLCXD1');

    nav.clickData();
    dataCard.section.probandData.inputDefaults();
    dataCard.clickLoad();

    appTitleSection.section.selectedGeneBadge.waitForElementVisible('@warning');
    appTitleSection.goToPage(1);
    appTitleSection.goToPage(2);

    appTitleSection.assertGeneBadgeHasWarning('PLCXD1');
    client.end();
  }
}
