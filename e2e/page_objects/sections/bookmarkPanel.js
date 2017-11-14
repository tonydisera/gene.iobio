module.exports = {
  selector: '#bookmark-card',

  commands: [{
    assertCurrentBookmarkCoordEquals: function(text) {
  		this.expect.element('@currentBookmarkCoord').text.to.equal(text);
  	},
  	assertCurrentBookmarkRsIdEquals: function(text) {
  		this.expect.element('@currentBookmarkRsId').text.to.equal(text);
  	},
  	assertCurrentBookmarkHgvsEquals: function(text) {
  		this.expect.element('@currentBookmarkHgvs').text.to.equal(text);
  	},
  	clickBookmark: function(client, coord) {
		client.useXpath().click("//a[@class='bookmark']//span[@class='coord' and contains(text(), '" + coord +"')]");
  	},
  	clickBookmarkGene: function(client, geneName) {
		client.useXpath().click("//a[@class='bookmark-gene' and contains(text(), '" + geneName +"')]");
  	},
 	assertBookmarkCountEquals: function(count) {
    	var self = this;
    	this.api.elements('css selector','#bookmark-card a.bookmark', function (result) {
		    self.assert.equal(result.value.length, count);
		});
  	}
  }],

  elements: {
  	currentBookmark: { selector: 'a.bookmark.current' },
  	currentBookmarkCoord: { selector: 'a.bookmark.current .variant-label .coord' },
  	currentBookmarkRsId: { selector: 'a.bookmark.current .variant-label .rsid' },
  	currentBookmarkHgvs: { selector: 'a.bookmark.current .variant-label .hgvs' }
  }
};