module.exports = {
  selector: '#feature-matrix .tooltip',
  commands: [{
  	assertTitleContains: function(text) {
  		this.expect.element('@title').text.to.contain(text);
  	}
  }],
  elements: {
  	title: { selector: '.tooltip-title' }
  }
}

