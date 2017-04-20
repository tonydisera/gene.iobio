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
  	}
  }],

  elements: {
  	currentBookmark: { selector: 'a.bookmark.current' },
  	currentBookmarkCoord: { selector: 'a.bookmark.current .variant-label .coord' },
  	currentBookmarkRsId: { selector: 'a.bookmark.current .variant-label .rsid' },
  	currentBookmarkHgvs: { selector: 'a.bookmark.current .variant-label .hgvs' }
  }  
};