module.exports = {
  selector: '#feature-matrix .tooltip',
  commands: [{
  	assertTitleContains: function(text) {
  		this.expect.element('@title').text.to.contain(text);
  	},
  	assertHGVScContains: function(text) {
  		this.expect.element('@HGVSc').text.to.contain(text);
  	}
  }],
  elements: {
  	title: { selector: '.tooltip-title' },
  	HGVSc: { selector: '//div[@id="examine-card"]//*[text()="HGVSc"]/following-sibling::div', locateStrategy: 'xpath' }
  }

}

