(function(global, $) {
	var geneBadgeLoaderDisplay = function(elm) {
		this.queue = [];
		this.elm = $(elm);
	}

	geneBadgeLoaderDisplay.prototype = {
		addGene: function(geneName, pageNumber) {
			this.queue.push({
				geneName: geneName,
				pageNumber: pageNumber
			});
			this.setText();
		},
		removeGene: function(geneName) {
			for(var i = this.queue.length - 1; i >= 0; i--) {
			  if (this.queue[i].geneName === geneName) {
			  	this.queue.splice(i, 1);
			  	break;
			  }
			}
			this.queue.length === 0 ? this.clearText() : this.setText();
		},
		lastGene: function() {
			return this.queue[this.queue.length - 1];
		},
		clearText: function() {
			this.elm.text("");
		},
		setText: function() {
			var lastGene = this.lastGene();
			this.elm.text("Analyzing: Page " + lastGene.pageNumber + " - " + lastGene.geneName);
		}
	};

	global.geneBadgeLoaderDisplay = geneBadgeLoaderDisplay;
}(window, jQuery));

// do not show page number when there is only one page
// private functions
// test sorted genes
// refactor genesCard with getGeneNames function
// set Loading text at start and clear when ends in cacheHelper?
// add rubik's cube spinner
// css




