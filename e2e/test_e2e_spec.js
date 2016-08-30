module.exports = {
  'Title is Correct': function(client) {
    var indexPage = client.page.index();

    indexPage.navigate()
      .assert.title('gene.iobio')

    client.end();
  },

  'Clicking the icons brings up the correct left slider': function(client) {
  	var indexPage = client.page.index();
  	indexPage.navigate()
  					 .expect.section('@sliderIconBar').to.be.visible;
  	// var iconBarSection = indexPage.section.sliderIconBar;

  	client.end();


  },

};