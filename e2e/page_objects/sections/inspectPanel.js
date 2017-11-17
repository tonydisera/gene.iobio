module.exports = {
  selector: '#examine-card',
  commands: [{
    assertHGVScContains: function(text) {
      this.expect.element('@HGVSc').text.to.contain(text);
    }
  }],
  elements: {
    HGVSc: { selector: '//div[@id="examine-card"]//*[text()="HGVSc"]/following-sibling::div', locateStrategy: 'xpath' }
  }
};