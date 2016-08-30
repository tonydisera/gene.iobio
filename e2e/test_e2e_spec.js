module.exports = {
  'Title is Correct': function(client) {
    var indexPage = client.page.index();

    indexPage.navigate()
      .assert.title('gene.iobio')

    client.end();
  },

  'Selecting a gene shows the correct gene name': function(client) {
    var indexPage = client.page.index();
    var appTitleSection = indexPage.section.appTitleSection;
    var dataCard = indexPage.section.dataCard;

    indexPage.navigate().waitForElementVisible('@sliderLeft');
    appTitleSection.click('@addDataButton');
    dataCard.click('@singleProbandButton')
            .click('@variantsButton')
            .click('@platinumTrio')
            .waitForElementVisible('@probandVcfSampleBox')
            .click('@loadButton');

    appTitleSection.setValue('@enterGeneName', ['BRCA2', client.Keys.ARROW_DOWN, client.Keys.ENTER]);
    indexPage.waitForElementVisible('@matrixTrack');
    appTitleSection.expect.element('@geneBadgeName').text.to.equal('BRCA2');

    client.end();
  }

};