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
			setText.call(this);
		},
		removeGene: function(geneName) {
			for(var i = this.queue.length - 1; i >= 0; i--) {
			  if (this.queue[i].geneName === geneName) {
			  	this.queue.splice(i, 1);
			  	break;
			  }
			}
			this.queue.length === 0 ? clearText.call(this) : setText.call(this);
		}
	};

	function lastGene(queue) {
		return queue[queue.length - 1];
	}

	function clearText() {
		this.elm.html("");
	}

	function setText() {
		var gene = lastGene(this.queue);
		var spinner = '<img src="assets/images/wheel.gif" style="width:15px;height:15px;"/>'
		this.elm.html('Analyzing ' + spinner + ' Page ' + gene.pageNumber + ' - ' + gene.geneName);
	}

	global.geneBadgeLoaderDisplay = geneBadgeLoaderDisplay;
}(window, jQuery));

// do not show page number when there is only one page
// refactor genesCard with getGeneNames function




