describe('MatrixCard', function() {

	beforeEach(function() {
		jasmine.addMatchers(jasmineColorMatchers);
	});

	describe('#removeRow', function() {
		var row_1, row_2, row_3, matrixRows;

		beforeEach(function() {
			row_1 = { name: 'Row 1', order: 0 };
			row_2 = { name: 'Row 2', order: 1 };
			row_3 = { name: 'Row 3', order: 2 };
			matrixRows = [row_1, row_2, row_3];
		});

		it('removes a matrix row by its name', function() {
			matrixCard.removeRow('Row 2', matrixRows);
			expect(matrixRows).toEqual([row_1, row_3]);
		});

		it('ensures the order is renumbered correctly', function() {
			matrixCard.removeRow('Row 2', matrixRows);
			expect(row_1.order).toEqual(0);
			expect(row_3.order).toEqual(1);
		});
	});

	describe('#setRowLabel', function() {
		var mc, row_1, row_2, row_3, filtered_row_1, filtered_row_2, filtered_row_3, matrixRows;

		beforeEach(function() {
			row_1 = { name: 'Row 1', order: 0 };
			row_2 = { name: 'Row 2', order: 1 };
			row_3 = { name: 'Row 3', order: 2 };
			filtered_row_1 = { name: 'Row 1', order: 0 };
			filtered_row_2 = { name: 'Row 2', order: 1 };
			filtered_row_3 = { name: 'Row 3', order: 2 };
			mc = new MatrixCard();
			mc.matrixRows = [row_1, row_2, row_3];
			mc.filteredMatrixRows = [filtered_row_1, filtered_row_2, filtered_row_3];
		});

		it('sets a new label on the correct matrix row identified by its name', function() {
			mc.setRowLabel('Row 2', 'New Label');
			expect(row_2.name).toEqual('New Label');
		});

		it('sets a new label on the correct filtered matrix row identified by its name', function() {
			mc.setRowLabel('Row 2', 'New Label');
			expect(filtered_row_2.name).toEqual('New Label');
		});
	});

	describe('#setRowLabelById', function() {
		var mc, row_1, row_2, row_3, filtered_row_1, filtered_row_2, filtered_row_3, matrixRows;

		beforeEach(function() {
			row_1 = { name: 'Row 1', id: 'id_1' };
			row_2 = { name: 'Row 2', id: 'id_2' };
			row_3 = { name: 'Row 3', id: 'id_3' };
			filtered_row_1 = { name: 'Row 1', id: 'id_1' };
			filtered_row_2 = { name: 'Row 2', id: 'id_2' };
			filtered_row_3 = { name: 'Row 3', id: 'id_3' };
			mc = new MatrixCard();
			mc.matrixRows = [row_1, row_2, row_3];
			mc.filteredMatrixRows = [filtered_row_1, filtered_row_2, filtered_row_3];
		});

		it('sets a new label on the correct matrix row identified by its id', function() {
			mc.setRowLabelById('id_2', 'New Label');
			expect(row_2.name).toEqual('New Label');
		});

		it('sets a new label on the correct filtered matrix row identified by its id', function() {
			mc.setRowLabelById('id_2', 'New Label');
			expect(filtered_row_2.name).toEqual('New Label');
		});
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
			expect($('g.afexac_unique_nc')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_unique')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_uberrare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_superrare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_rare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_uncommon')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.afexac_common')).toHaveAttr('transform', 'translate(2,2)');
		});

		it('sets the correct fill to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAfExacSymbol(selection);
			expect($('g.afexac_unique_nc > use')).toHaveFill('none');
			expect($('g.afexac_unique > use')).toHaveFill('rgb(199, 0, 1)');
			expect($('g.afexac_uberrare > use')).toHaveFill('rgb(204, 28, 29)');
			expect($('g.afexac_superrare > use')).toHaveFill('rgb(255, 44, 0)');
			expect($('g.afexac_rare > use')).toHaveFill('rgb(247, 138, 31)');
			expect($('g.afexac_uncommon > use')).toHaveFill('rgb(224, 195, 128)');
			expect($('g.afexac_common > use')).toHaveFill('rgb(189,189,189)');
		});

		it('sets the correct stroke to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAfExacSymbol(selection);
			expect($('g.afexac_unique_nc > use')).toHaveStroke('#6b6666');
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
			expect($('g.afexac_unique_nc > use')).toHaveAttr('width', '11');
			expect($('g.afexac_unique > use')).toHaveAttr('width', '12');
			expect($('g.afexac_uberrare > use')).toHaveAttr('width', '12');
			expect($('g.afexac_superrare > use')).toHaveAttr('width', '12');
			expect($('g.afexac_rare > use')).toHaveAttr('width', '12');
			expect($('g.afexac_uncommon > use')).toHaveAttr('width', '12');
			expect($('g.afexac_common > use')).toHaveAttr('width', '12');
		});

		it('sets the correct height on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAfExacSymbol(selection);
			expect($('g.afexac_unique_nc > use')).toHaveAttr('height', '11');
			expect($('g.afexac_unique > use')).toHaveAttr('height', '12');
			expect($('g.afexac_uberrare > use')).toHaveAttr('height', '12');
			expect($('g.afexac_superrare > use')).toHaveAttr('height', '12');
			expect($('g.afexac_rare > use')).toHaveAttr('height', '12');
			expect($('g.afexac_uncommon > use')).toHaveAttr('height', '12');
			expect($('g.afexac_common > use')).toHaveAttr('height', '12');
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
			expect($('g.af1000g_unique')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_uberrare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_superrare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_rare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_uncommon')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_common')).toHaveAttr('transform', 'translate(2,2)');
		});

		it('sets the correct fill to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveFill('rgb(199, 0, 1)');
			expect($('g.af1000g_uberrare > use')).toHaveFill('rgb(204, 28, 29)');
			expect($('g.af1000g_superrare > use')).toHaveFill('rgb(255, 44, 0)');
			expect($('g.af1000g_rare > use')).toHaveFill('rgb(247, 138, 31)');
			expect($('g.af1000g_uncommon > use')).toHaveFill('rgb(224, 195, 128)');
			expect($('g.af1000g_common > use')).toHaveFill('rgb(189,189,189)');
		});

		it('sets the correct width on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_uberrare > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_superrare > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_rare > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_uncommon > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_common > use')).toHaveAttr('width', '12');
		});

		it('sets the correct height on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			matrixCard.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_uberrare > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_superrare > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_rare > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_uncommon > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_common > use')).toHaveAttr('height', '12');
		});
	});
});
