describe('MatrixCard', function() {

	beforeEach(function() {
		jasmine.addMatchers(jasmineColorMatchers);
	});

	describe('#showAfExacSymbol', function() {
		var data;

		beforeEach(function() {
			setFixtures(
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>'
			);
			data = [
				{ clazz: "afexac_unique_nc" },
				{ clazz: "afexac_unique" },
				{ clazz: "afexac_uberrare" },
				{ clazz: "afexac_superrare" },
				{ clazz: "afexac_rare" },
				{ clazz: "afexac_uncommon" },
				{ clazz: "afexac_common" }
			];
			d3.selectAll('.cell').data(data);
		});

		it('sets the correct transform to each symbol group', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAfExacSymbol(selection);
			expect($('g.afexac_unique_nc')).toHaveAttr('transform', 'translate(4,4)');
			expect($('g.afexac_unique')).toHaveAttr('transform', 'translate(4,4)');
			expect($('g.afexac_uberrare')).toHaveAttr('transform', 'translate(3,3)');
			expect($('g.afexac_superrare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_rare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_uncommon')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_common')).toHaveAttr('transform', 'translate(1,1)');
		});

		it('sets the correct fill to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAfExacSymbol(selection);
			expect($('g.afexac_unique_nc > use')).toHaveFill('none');
			expect($('g.afexac_unique > use')).toHaveFill('rgb(215,48,39)');
			expect($('g.afexac_uberrare > use')).toHaveFill('rgb(252,141,89)');
			expect($('g.afexac_superrare > use')).toHaveFill('rgb(203,174,95)');
			expect($('g.afexac_rare > use')).toHaveFill('rgb(158,186,194)');
			expect($('g.afexac_uncommon > use')).toHaveFill('rgb(145,191,219)');
			expect($('g.afexac_common > use')).toHaveFill('rgb(69,117,180)');
		});

		it('sets the correct stroke to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAfExacSymbol(selection);
			expect($('g.afexac_unique_nc > use')).toHaveStroke('black');
			expect($('g.afexac_unique > use')).toHaveStroke('none');
			expect($('g.afexac_uberrare > use')).toHaveStroke('none');
			expect($('g.afexac_superrare > use')).toHaveStroke('none');
			expect($('g.afexac_rare > use')).toHaveStroke('none');
			expect($('g.afexac_uncommon > use')).toHaveStroke('none');
			expect($('g.afexac_common > use')).toHaveStroke('none');
		});

		it('sets the correct width on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAfExacSymbol(selection);
			expect($('g.afexac_unique_nc > use')).toHaveAttr('width', '9');
			expect($('g.afexac_unique > use')).toHaveAttr('width', '9');
			expect($('g.afexac_uberrare > use')).toHaveAttr('width', '10');
			expect($('g.afexac_superrare > use')).toHaveAttr('width', '10');
			expect($('g.afexac_rare > use')).toHaveAttr('width', '10');
			expect($('g.afexac_uncommon > use')).toHaveAttr('width', '12');
			expect($('g.afexac_common > use')).toHaveAttr('width', '14');
		});

		it('sets the correct height on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAfExacSymbol(selection);
			expect($('g.afexac_unique_nc > use')).toHaveAttr('height', '9');
			expect($('g.afexac_unique > use')).toHaveAttr('height', '9');
			expect($('g.afexac_uberrare > use')).toHaveAttr('height', '10');
			expect($('g.afexac_superrare > use')).toHaveAttr('height', '10');
			expect($('g.afexac_rare > use')).toHaveAttr('height', '10');
			expect($('g.afexac_uncommon > use')).toHaveAttr('height', '12');
			expect($('g.afexac_common > use')).toHaveAttr('height', '14');
		});
	});

	describe('#showAf1000gSymbol', function() {
		var data;

		beforeEach(function() {
			setFixtures(
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>' +
				'<g class="cell"></g>'
			);
			data = [
				{ clazz: "af1000g_unique" },
				{ clazz: "af1000g_uberrare" },
				{ clazz: "af1000g_superrare" },
				{ clazz: "af1000g_rare" },
				{ clazz: "af1000g_uncommon" },
				{ clazz: "af1000g_common" }
			];
			d3.selectAll('.cell').data(data);
		});

		it('sets the correct transform to each symbol group', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique')).toHaveAttr('transform', 'translate(4,4)');
			expect($('g.af1000g_uberrare')).toHaveAttr('transform', 'translate(3,3)');
			expect($('g.af1000g_superrare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_rare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_uncommon')).toHaveAttr('transform', 'translate(1,1)');
			expect($('g.af1000g_common')).toHaveAttr('transform', 'translate(0,0)');
		});

		it('sets the correct fill to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveFill('rgb(215,48,39)');
			expect($('g.af1000g_uberrare > use')).toHaveFill('rgb(252,141,89)');
			expect($('g.af1000g_superrare > use')).toHaveFill('rgb(203,174,95)');
			expect($('g.af1000g_rare > use')).toHaveFill('rgb(158,186,194)');
			expect($('g.af1000g_uncommon > use')).toHaveFill('rgb(145,191,219)');
			expect($('g.af1000g_common > use')).toHaveFill('rgb(69,117,180)');
		});

		it('sets the correct width on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveAttr('width', '9');
			expect($('g.af1000g_uberrare > use')).toHaveAttr('width', '9');
			expect($('g.af1000g_superrare > use')).toHaveAttr('width', '10');
			expect($('g.af1000g_rare > use')).toHaveAttr('width', '10');
			expect($('g.af1000g_uncommon > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_common > use')).toHaveAttr('width', '14');
		});

		it('sets the correct height on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveAttr('height', '9');
			expect($('g.af1000g_uberrare > use')).toHaveAttr('height', '9');
			expect($('g.af1000g_superrare > use')).toHaveAttr('height', '10');
			expect($('g.af1000g_rare > use')).toHaveAttr('height', '10');
			expect($('g.af1000g_uncommon > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_common > use')).toHaveAttr('height', '14');
		});
	});
});
