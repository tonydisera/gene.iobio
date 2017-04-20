var theClient;

module.exports = {
  selector: '#feature-matrix .tooltip',
  
  commands: [{
    assertTitleLine2Equals: function(text) {
  		this.expect.element('@title').text.to.equal(text);
  	},
  	assertHGVScEquals: function(text) {
  		this.expect.element('@HGVSc').text.to.equal(text);
  	},
    assertHGVSpEquals: function(text) {
      this.expect.element('@HGVSp').text.to.equal(text);
    },    

    // For some reason, the bookmark (e2e/bookmark_variants.js) cannot use the 'assertTitleLine2Equals'
    // method as this returns blank instead of the expected value.
    expectTitleLine2TextEquals: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]//div[contains(@class, "tooltip")]//div[contains(@class, "tooltip-title") and contains(@class, "ref-alt")]';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },
    // For some reason, the bookmark (e2e/bookmark_variants.js) cannot use the 'assertHGVSpEquals'
    // method as this returns blank instead of the expected value.
    expectHGVSpTextEquals: function(text) {
      var self = this;
      var selector = '//div[@id="feature-matrix"]//div[contains(@class, "tooltip")]//div[@class="tooltip-header" and text()="HGVSp"]/following-sibling::div';
      return self.api.useXpath().getText(selector, function(result) {
        self.assert.equal(result.value, text);
      })
    },

    clickBookmark: function() {
      return this.click('@bookmarkLink');
    },
    clickRemoveBookmark: function() {
      return this.click('@removeBookmarkLink');
    },
    waitForTooltip: function() {
      this.api.pause(2000);
      //this.waitForElementVisible('#feature-matrix .tooltip', 4000);
    },



  }],
  elements: {
    title: { selector: "//div[contains(@class, 'tooltip-title') and contains(@class, 'ref-alt')]", locateStrategy: 'xpath' },
  	HGVSc: { selector: '//div[@class="tooltip-header" and text()="HGVSc"]/following-sibling::div', locateStrategy: 'xpath' },
    HGVSp: { selector: '//div[@class="tooltip-header" and text()="HGVSp"]/following-sibling::div', locateStrategy: 'xpath' },
    bookmarkLink:  {selector: '#bookmarkLink'},
    removeBookmarkLink:  {selector: '#remove-bookmark-link'}
  }

}

