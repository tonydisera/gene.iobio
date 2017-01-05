module.exports = {
	selector: '#slider-left #help-card',
  commands: [{
    clickDemoGene: function() {
      return this.click('@demoGene');
    }
  }],
  elements: {
    demoGene: { selector: '#load-demo-data' }
  }
};