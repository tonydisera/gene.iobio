module.exports = {
  selector: '#proband-variant-card',
  commands: [{
    waitForBamDepthLoaded: function() {
      this.waitForElementVisible('@bamDepth');
    }
  }],
  elements: {
    bamDepth: '#bam-depth'
  }
};



