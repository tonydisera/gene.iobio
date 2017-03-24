var theClient = null;
module.exports = {
  selector: '#feature-matrix .tooltip',
  
  commands: [{
    assertTitleLine2Equals: function(text) {
      //this.api.elements('xpath', '//div[@class="tooltip-header" and text()="HGVSc"]/following-sibling::div', function(elem) {
      //  console.log(elem.value.length);
      //});
  		this.expect.element('@title').text.to.equal(text);
  	},
  	assertHGVScEquals: function(text) {
  		this.expect.element('@HGVSc').text.to.equal(text);
  	}
  }],
  elements: {
    title: { selector: "//div[contains(@class, 'tooltip-title') and contains(@class, 'ref-alt')]", locateStrategy: 'xpath' },
  	HGVSc: { selector: '//div[@class="tooltip-header" and text()="HGVSc"]/following-sibling::div', locateStrategy: 'xpath' }
  }

}

