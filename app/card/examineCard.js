function ExamineCard() {
}

ExamineCard.prototype.init = function() {
}

ExamineCard.prototype.showVariant = function(variant) {
	$('#examine-card #examine-card-content').html(getProbandVariantCard().variantTooltipHTML(variant));

	var selection = d3.select("#examine-card #coverage-svg");
	getProbandVariantCard().createAlleleCountSVGTrio(selection, variant);
}