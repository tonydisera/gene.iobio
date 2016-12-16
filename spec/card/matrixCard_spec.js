describe('MatrixCard', function() {

	beforeEach(function() {
		jasmine.addMatchers(jasmineColorMatchers);
	});

	describe('#removeRow', function() {
		var row_1, row_2, row_3, matrixRows, mc;

		beforeEach(function() {
			mc = new MatrixCard();
			row_1 = { name: 'Row 1', order: 0 };
			row_2 = { name: 'Row 2', order: 1 };
			row_3 = { name: 'Row 3', order: 2 };
			matrixRows = [row_1, row_2, row_3];
		});

		it('removes a matrix row by its name', function() {
			mc.removeRow('Row 2', matrixRows);
			expect(matrixRows).toEqual([row_1, row_3]);
		});

		it('ensures the order is renumbered correctly', function() {
			mc.removeRow('Row 2', matrixRows);
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

	describe('#setRowAttributeById', function() {
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

		it('sets a new attribute on the correct matrix row identified by its id', function() {
			mc.setRowAttributeById('id_2', 'New Attribute');
			expect(row_2.attribute).toEqual('New Attribute');
		});

		it('sets a new attribute on the correct filtered matrix row identified by its id', function() {
			mc.setRowAttributeById('id_2', 'New Attribute');
			expect(filtered_row_2.attribute).toEqual('New Attribute');
		});
	});

	describe('#getRowAttribute', function() {
		var mc, row_1, row_2, row_3, matrixRows;

		beforeEach(function() {
			row_1 = { name: 'Row 1', id: 'id_1', attribute: 'attribute_1' };
			row_2 = { name: 'Row 2', id: 'id_2', attribute: 'attribute_2' };
			row_3 = { name: 'Row 3', id: 'id_3', attribute: 'attribute_3' };
			mc = new MatrixCard();
			mc.matrixRows = [row_1, row_2, row_3];
		});

		it('returns the attribute of the row found by its name', function() {
			expect(mc.getRowAttribute('Row 2')).toEqual('attribute_2');
		});

		it('returns an empty string when none of the names of the rows match the search term', function() {
			expect(mc.getRowAttribute('Row 500')).toEqual('');
		});
	});

	describe('#getRowOrder', function() {
		var mc, row_1, row_2, row_3, matrixRows;

		beforeEach(function() {
			row_1 = { name: 'Row 1', id: 'id_1', order: 1 };
			row_2 = { name: 'Row 2', id: 'id_2', order: 2 };
			row_3 = { name: 'Row 3', id: 'id_3', order: 3 };
			mc = new MatrixCard();
			mc.matrixRows = [row_1, row_2, row_3];
		});

		it('returns the order of the row found by its name', function() {
			expect(mc.getRowOrder('Row 2')).toEqual(2);
		});

		it('returns an empty string when none of the names of the rows match the search term', function() {
			expect(mc.getRowOrder('Row 500')).toEqual('');
		});
	});

	describe('#getVariantLabel', function() {
		var mc;

		it('returns the one-based index and rsid as the label when the variant has a rsid', function() {
			mc = new MatrixCard();
			spyOn(window, 'getRsId').and.returnValue('rs123');
			var variant = {};
			expect(mc.getVariantLabel(variant, 0)).toEqual("1.  rs123");
		});

		it('returns the one-based index when the variant has no rsid', function() {
			mc = new MatrixCard();
			spyOn(window, 'getRsId').and.returnValue(null);
			var variant = {};
			expect(mc.getVariantLabel(variant, 0)).toEqual("1");
		});
	});

	describe('#showClinVarSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol with attributes from options when there are options', function() {
			var options = {
				width: "10",
				height: "12",
				transform: "translate(1,2)",
				clazz: "clinvar_uc"
			};
			mc.showClinVarSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual(options.transform);
			var useElem = d3.select('#test > g > use');
			expect(useElem.attr('xlink:href')).toEqual('#clinvar-symbol');
			expect(useElem.attr('width')).toEqual(options.width);
			expect(useElem.attr('height')).toEqual(options.height);
			expect(useElem.style('pointer-events')).toEqual('none');
			expect(useElem[0]).toHaveFill('rgb(231,186,82)');
		});

		it('appends an svg element with the correct attributes when the cellSize is greater than 18 and there are no option overrides', function() {
			var options = { cellSize: 20, clazz: "clinvar_path" };
			mc.showClinVarSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(3,2)");
			var useElem = d3.select('#test > g > use');
			expect(useElem.attr('width')).toEqual("15");
			expect(useElem.attr('height')).toEqual("15");
			expect(useElem[0]).toHaveFill("#ad494A");
		});

		it('appends an svg element with attributes from attached data when there are no options', function() {
			var options = {};
			var data = {
				width: "222",
				height: "111",
				transform: "translate(11,12)",
				clazz: "clinvar_cd"
			};
			selection.datum(data);
			mc.showClinVarSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(11,12)");
			var useElem = d3.select('#test > g > use');
			expect(useElem.attr('width')).toEqual("222");
			expect(useElem.attr('height')).toEqual("111");
			expect(useElem[0]).toHaveFill("rgb(111, 182, 180)");
		});
	});

	describe('#showPolyPhenSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol with attributes from options when there are options', function() {
			var options = {
				width: "111",
				height: "222",
				transform: "translate(100,200)",
				clazz: "polyphen_probably_damaging"
			};
			mc.showPolyPhenSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual(options.transform);
			var useElem = d3.select('#test > g > use');
			expect(useElem.attr('xlink:href')).toEqual("#biohazard-symbol");
			expect(useElem.attr('width')).toEqual(options.width);
			expect(useElem.attr('height')).toEqual(options.height);
			expect(useElem.style('pointer-events')).toEqual('none');
			expect(useElem[0]).toHaveFill("#ad494A");
		});

		it('appends an svg element with the correct transform when the cellSize is greater than 18', function() {
			var options = {
				cellSize: 20,
				width: "111",
				height: "222",
				transform: "translate(12,12)",
				clazz: "polyphen_possibly_damaging"
			};
			mc.showPolyPhenSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(4,2)");
			var useElem = d3.select('#test > g > use');
			expect(useElem[0]).toHaveFill("#FB7737");
		});

		it('appends an svg element with attributes from attached data when there are no options', function() {
			var options = {};
			var data = {
				width: "222",
				height: "111",
				transform: "translate(11,12)",
				clazz: "polyphen_benign"
			};
			selection.datum(data);
			mc.showPolyPhenSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(11,12)");
			var useElem = d3.select('#test > g > use');
			expect(useElem.attr('width')).toEqual("222");
			expect(useElem.attr('height')).toEqual("111");
			expect(useElem[0]).toHaveFill("rgb(181, 207, 107)");
		});
	});

	describe('#showSiftSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol with attributes from options when there are options', function() {
			var options = {
				width: "111",
				height: "222",
				transform: "translate(100,200)",
				clazz: "sift_deleterious"
			};
			mc.showSiftSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual(options.transform);
			var useElem = d3.select('#test > g > use');
			expect(useElem.attr('xlink:href')).toEqual("#danger-symbol");
			expect(useElem.attr('width')).toEqual(options.width);
			expect(useElem.attr('height')).toEqual(options.height);
			expect(useElem.style('pointer-events')).toEqual('none');
			expect(useElem[0]).toHaveFill("#ad494A");
		});

		it('appends an svg element with the correct transform when the cellSize is greater than 18', function() {
			var options = {
				cellSize: 20,
				width: "111",
				height: "222",
				transform: "translate(12,12)",
				clazz: "sift_tolerated_low_confidence"
			};
			mc.showSiftSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(4,2)");
			var useElem = d3.select('#test > g > use');
			expect(useElem[0]).toHaveFill("rgb(231, 186, 82)");
		});

		it('appends an svg element with attributes from attached data when there are no options', function() {
			var options = {};
			var data = {
				width: "222",
				height: "111",
				transform: "translate(11,12)",
				clazz: "sift_tolerated"
			};
			selection.datum(data);
			mc.showSiftSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(11,12)");
			var useElem = d3.select('#test > g > use');
			expect(useElem.attr('width')).toEqual("222");
			expect(useElem.attr('height')).toEqual("111");
			expect(useElem[0]).toHaveFill("rgb(181, 207, 107)");
		});
	});


	describe('#showAfExacSymbol', function() {
		var data, mc;

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
			mc = new MatrixCard();
		});

		it('sets the correct transform to each symbol group', function() {
			var selection = d3.selectAll('.cell');
			mc.showAfExacSymbol(selection);
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
			mc.showAfExacSymbol(selection);
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
			mc.showAfExacSymbol(selection);
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
			mc.showAfExacSymbol(selection);
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
			mc.showAfExacSymbol(selection);
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
		var data, mc;

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
			mc = new MatrixCard();
		});

		it('sets the correct transform to each symbol group', function() {
			var selection = d3.selectAll('.cell');
			mc.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_uberrare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_superrare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_rare')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_uncommon')).toHaveAttr('transform', 'translate(2,2)');
			expect($('g.af1000g_common')).toHaveAttr('transform', 'translate(2,2)');
		});

		it('sets the correct fill to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			mc.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveFill('rgb(199, 0, 1)');
			expect($('g.af1000g_uberrare > use')).toHaveFill('rgb(204, 28, 29)');
			expect($('g.af1000g_superrare > use')).toHaveFill('rgb(255, 44, 0)');
			expect($('g.af1000g_rare > use')).toHaveFill('rgb(247, 138, 31)');
			expect($('g.af1000g_uncommon > use')).toHaveFill('rgb(224, 195, 128)');
			expect($('g.af1000g_common > use')).toHaveFill('rgb(189,189,189)');
		});

		it('sets the correct width on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			mc.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_uberrare > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_superrare > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_rare > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_uncommon > use')).toHaveAttr('width', '12');
			expect($('g.af1000g_common > use')).toHaveAttr('width', '12');
		});

		it('sets the correct height on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			mc.showAf1000gSymbol(selection);
			expect($('g.af1000g_unique > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_uberrare > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_superrare > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_rare > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_uncommon > use')).toHaveAttr('height', '12');
			expect($('g.af1000g_common > use')).toHaveAttr('height', '12');
		});
	});

	describe('#showHomSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends the right rect and text svg elements', function() {
			var data = { clazz: 'whatever' };
			selection.datum(data);
			mc.showHomSymbol(selection);
			expect($('#test rect')).toHaveClass('zyg_hom');
			expect($('#test rect')).toHaveClass('whatever');
			expect($('#test text').text()).toEqual("Hom");
		});
	});

	describe('#showRecessiveSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol with the correct attributes when cellSize > 18', function() {
			var options = { cellSize: 20 };
			mc.showRecessiveSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(0,0)');
			expect(useElem.attr('xlink:href')).toEqual('#recessive-symbol');
			expect(useElem.attr('width')).toEqual('22');
			expect(useElem.attr('height')).toEqual('22');
			expect(useElem.style('pointer-events')).toEqual('none');
		});

		it('appends an svg symbol with the correct attributes when there are options', function() {
			var options = { width: "333", transform: "translate(1,12)" };
			mc.showRecessiveSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(1,12)');
			expect(useElem.attr('width')).toEqual('333');
			expect(useElem.attr('height')).toEqual('333');
		});

		it('appends an svg symbol with the default attributes when there are no options', function() {
			var options = {};
			mc.showRecessiveSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(0,0)');
			expect(useElem.attr('width')).toEqual('20');
			expect(useElem.attr('height')).toEqual('20');
		});
	});

	describe('#showDeNovoSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol with the correct attributes when cellSize > 18', function() {
			var options = { cellSize: 20 };
			mc.showDeNovoSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(1,0)');
			expect(useElem.attr('xlink:href')).toEqual('#denovo-symbol');
			expect(useElem.attr('width')).toEqual('22');
			expect(useElem.attr('height')).toEqual('22');
			expect(useElem.style('pointer-events')).toEqual('none');
		});

		it('appends an svg symbol with the correct attributes when there are options', function() {
			var options = { width: "333", transform: "translate(1,12)" };
			mc.showDeNovoSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(1,12)');
			expect(useElem.attr('width')).toEqual('333');
			expect(useElem.attr('height')).toEqual('333');
		});

		it('appends an svg symbol with the default attributes when there are no options', function() {
			var options = {};
			mc.showDeNovoSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(-1,0)');
			expect(useElem.attr('width')).toEqual('20');
			expect(useElem.attr('height')).toEqual('20');
		});
	});

	describe('#showSibNotRecessiveSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol and line with the correct attributes when there are options', function() {
			var options = { width: "333", height: "444", transform: "translate(1,12)" };
			mc.showSibNotRecessiveSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(1,12)');
			expect(useElem.attr('width')).toEqual('333');
			expect(useElem.attr('height')).toEqual('444');
			expect(useElem.attr('xlink:href')).toEqual('#recessive-symbol');
			expect(useElem.style('pointer-events')).toEqual('none');
			expect($('#test > line')).toBeInDOM();
		});

		it('appends an svg symbol with the default attributes when there are no options', function() {
			var options = {};
			mc.showSibNotRecessiveSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(0,0)');
			expect(useElem.attr('width')).toEqual('20');
			expect(useElem.attr('height')).toEqual('20');
		});
	});

	fdescribe('#showTextSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			selection.datum({ value: 'hi' });
			mc = new MatrixCard();
			spyOn(MatrixCard, 'wrap');
		});

		it('appends a text svg element with the right attributes when cellSize > 18', function() {
			var options = { cellSize: 20 };
			window.isLevelBasic = true;
			mc.showTextSymbol(selection, options);
			var textElem = d3.select('#test text');
			expect($('#test g').attr('transform')).toEqual('translate(3,0)');
			expect(textElem.attr('y')).toEqual('14');
			expect(textElem.text()).toEqual('hi');
			expect(MatrixCard.wrap).toHaveBeenCalledWith(jasmine.any(Array), 20, 3);
		});

		it('appends a text svg element with the right attributes when cellSize is not > 18', function() {
			var options = { cellSize: 15 };
			window.isLevelBasic = false;
			mc.showTextSymbol(selection, options);
			var textElem = d3.select('#test text');
			expect($('#test g').attr('transform')).toEqual('translate(0,0)');
			expect(textElem.attr('y')).toEqual('11');
			expect(MatrixCard.wrap).toHaveBeenCalledWith(jasmine.any(Array), 15, 3);
		});
	});

	describe('#formatClinvar', function() {
		it('returns a string representation of clinvar significance for a variant', function() {
			window.isLevelBasic = true;
			var mc = new MatrixCard();
			var variant = {
				featureClass: null
			};
			var clinvarSig = {
      	"pathogenic": "Y",
      	"benign/likely_benign": "N",
      	"none": "N",
      	"not_provided": "N"
    	};
    	expect(mc.formatClinvar(variant, clinvarSig)).toEqual("pathogenic,benign/likely benign");
    	expect(variant.featureClass).toEqual(" danger");
    	window.isLevelBasic = false;
		});
	});

	describe('#getClinvarRank', function() {
		it('gets the lowest rank clinvar significance from a variant', function() {
			var mc = new MatrixCard();
			var variant = {};
			var clinvarSig = {
      	"pathogenic/likely_pathogenic": "Y",
      	"benign/likely_benign": "N",
      	"none": "N",
      	"not_provided": "N"
    	};
    	expect(mc.getClinvarRank(variant, clinvarSig)).toEqual(2);
		});
	});

	describe('#getImpactRank', function() {
		it('gets the lowest rank of the highest impact from a variant', function() {
			var mc = new MatrixCard();
			var variant = {};
			var highestImpactVep = {
      	"MODIFIER": {},
      	"MODERATE": {}
    	};
    	expect(mc.getImpactRank(variant, highestImpactVep)).toEqual(2);
		});
	});

	describe('#formatAlleleFrequencyPercentage', function() {
		it('converts a value to a percentage', function() {
			var mc = new MatrixCard();
			var variant = {};
			expect(mc.formatAlleleFrequencyPercentage(variant, 0.23)).toEqual("23%");
		});
	});

	describe('#formatCanonicalTranscript', function() {
		it('returns the prefix from the selected transcript id', function() {
			var mc = new MatrixCard();
			var variant = {};
			window.selectedTranscript = { transcript_id: "ENST00000265849.7" };
			expect(mc.formatCanonicalTranscript(variant, "")).toEqual("ENST00000265849");
		});
	});

	describe('#formatHgvsP', function() {
		it('gives a string representation of a vepHGVSp object', function() {
			var mc = new MatrixCard();
			var variant = {
				vepConsequence: { "synonymous_variant": "synonymous_variant" }
			};
			var value = {
      	"ENSP00000323074.4:p.Pro1477His": "",
      	"ENSP00000323074.4:p.Gly90Ala": "",
      	"asdf(p.=)": "",
    	};
    	expect(mc.formatHgvsP(variant, value)).toEqual("p.Pro1477His p.Gly90Ala p.(=)");
		});
	});

	describe('#formatHgvsC', function() {
		it('gives a string representation of a vepHGVSc object', function() {
			var mc = new MatrixCard();
			var variant = {};
			var value = {
      	"ENST00000353383.1:c.4430C>A": "",
      	"ENST00000353383.1:c.269G>C": ""
    	};
    	expect(mc.formatHgvsC(variant, value)).toEqual("c.4430C>A c.269G>C");
		});
	});

	describe('#formatInheritance', function() {
		it('returns an empty string when there is no inheritance value', function() {
			var mc = new MatrixCard();
			expect(mc.formatInheritance({}, 'none')).toEqual('');
		});

		it('returns de novo when the value is denovo', function() {
			var mc = new MatrixCard();
			expect(mc.formatInheritance({}, 'denovo')).toEqual('de novo');
		});

		it('returns the value when there is a value but it is not denovo', function() {
			var mc = new MatrixCard();
			expect(mc.formatInheritance({}, 'asdf')).toEqual('asdf');
		});
	});

});
