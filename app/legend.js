function Legend() {
	this.legendMap = {
		exon:     'The segment of DNA in the gene containing information coding for a protein',
		HIGH:     'A variant having a high (disruptive) impact in the protien.',
		MODERATE: 'A non-disruptive variant that might change the protein effectiveness.',
		MODIFIER: 'Usually non-coding variants or variants affecting non-coding genes, where predictions are difficult or there is no evidence of impact.',
		LOW:      'Assumed to be mostly harmless or unlikely to change protein behavior.',
		snp:      'A single nucleotide change.  Multiple nucleotide changes (e.g. AT->GG) are also also identified by the square symbol',
		ins:      'An insertion of a nucleotide(s)',
		del:      'A deletion of nucleotide(s)',
		complex:  'A complex variant, usually involving a combination of insertions and deletions of nucleotides'
	}
}

Legend.prototype.init = function() {
	var me = this;

	d3.selectAll(".legend-element")
	  .on("mouseover", function(d) {
	  	var legendId = d3.select(this).attr("id");
	  	me.showLegendTooltip(legendId, d3.event.pageX, d3.event.pageY);

      })
      .on("mouseout", function(d) {
      	me.hideLegendTooltip();
      });
}

Legend.prototype.showLegendTooltip = function(legendId, screenX, screenY) {
	var me = this;
	var tooltip = d3.select('#legend-tooltip');

	var tooltipText = this.legendMap.hasOwnProperty(legendId) ? this.legendMap[legendId] : legendId;

	tooltip.style("z-index", 9999);
	tooltip.transition()
	 .duration(1000)
	 .style("opacity", .9)
	 .style("pointer-events", "all");

	tooltip.html(tooltipText);
	var h = tooltip[0][0].clientHeight;
	var w = tooltip[0][0].clientWidth;

	var x = screenX ;
	var y = screenY + 20;

	tooltip.style("width", w + "px")
		       .style("left", x + "px")
		       .style("text-align", 'left')
		       .style("top", (y) + "px")
		       .style("overflow-y", "hidden");

}

Legend.prototype.hideLegendTooltip = function() {
	var tooltip = d3.select('#legend-tooltip');
	tooltip.transition()
           .duration(500)
           .style("opacity", 0)
           .style("z-index", 0)
           .style("pointer-events", "none");
}
