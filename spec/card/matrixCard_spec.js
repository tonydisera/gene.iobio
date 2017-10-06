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

		it('returns the one-based index', function() {
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
			var options = { cellSize: 22, clazz: "clinvar_path" };
			mc.showClinVarSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(2,2)");
			var useElem = d3.select('#test > g > use');
			expect(useElem.attr('width')).toEqual("17");
			expect(useElem.attr('height')).toEqual("17");
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
				cellSize: 22,
				width: "111",
				height: "222",
				transform: "translate(12,12)",
				clazz: "polyphen_possibly_damaging"
			};
			mc.showPolyPhenSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(2,2)");
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
				cellSize: 22,
				width: "111",
				height: "222",
				transform: "translate(12,12)",
				clazz: "sift_tolerated_low_confidence"
			};
			mc.showSiftSymbol(selection, options);
			expect(d3.select('#test > g').attr('transform')).toEqual("translate(2,2)");
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


	describe('#showAfRareSymbol', function() {
		var data, mc, options;

		beforeEach(function() {
			setFixtures(
				'<g class="cell"></g>' 
			);
			data = [
				{ clazz: "afhighest_rare" }
			];
			options = {cellSize: 22};
			d3.selectAll('.cell').data(data);
			mc = new MatrixCard();
		});

		it('sets the correct transform to each symbol group', function() {
			var selection = d3.selectAll('.cell');
			mc.showAfRareSymbol(selection, options);
			expect($('g.afhighest_rare')).toHaveAttr('transform', 'translate(2,2)');
		});

		it('sets the correct fill to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			mc.showAfRareSymbol(selection, options);
			expect($('g.afhighest_rare > use')).toHaveFill('rgb(204, 28, 29)');
		});

		it('sets the correct stroke to each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			mc.showAfRareSymbol(selection, options);
			expect($('g.afhighest_rare > use')).toHaveStroke('none');
		});

		it('sets the correct width on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			mc.showAfRareSymbol(selection, options);
			expect($('g.afhighest_rare > use')).toHaveAttr('width', '17');
		});

		it('sets the correct height on each symbol <use> element', function() {
			var selection = d3.selectAll('.cell');
			mc.showAfRareSymbol(selection, options);
			expect($('g.afhighest_rare > use')).toHaveAttr('height', '17');
		});

		it('sets the correct width on each symbol <use> element when cell size < 18', function() {
			var selection = d3.selectAll('.cell');
			mc.showAfRareSymbol(selection, {cellSize: 17});
			expect($('g.afhighest_rare > use')).toHaveAttr('width', '12');
		});
	});


	describe('#showHomSymbol', function() {
		var selection, mc, options;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			options = {cellSize: 22}
			mc = new MatrixCard();
		});

		it('appends the right rect and text svg elements', function() {
			var data = { clazz: 'whatever' };
			selection.datum(data);
			mc.showHomSymbol(selection, options);
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
			var options = { cellSize: 22};
			mc.showRecessiveSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(1,2)');
			expect(useElem.attr('xlink:href')).toEqual('#recessive-symbol');
			expect(useElem.attr('width')).toEqual('19');
			expect(useElem.attr('height')).toEqual('19');
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
			expect($('#test g').attr('transform')).toEqual('translate(1,2)');
			expect(useElem.attr('width')).toEqual('16');
			expect(useElem.attr('height')).toEqual('16');
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
			var options = { cellSize: 22 };
			mc.showDeNovoSymbol(selection, options);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(1,2)');
			expect(useElem.attr('xlink:href')).toEqual('#denovo-symbol');
			expect(useElem.attr('width')).toEqual('19');
			expect(useElem.attr('height')).toEqual('19');
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
			expect($('#test g').attr('transform')).toEqual('translate(1,0)');
			expect(useElem.attr('width')).toEqual('16');
			expect(useElem.attr('height')).toEqual('16');
		});
	});


	describe('#showTextSymbol', function() {
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


	describe('#showAffectedPresentSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol with the correct attributes when sibling data is all present', function() {
			selection.datum({
				value: 'present_all',
				clazz: 'affected'
			});
			mc.showAffectedPresentSymbol(selection, {cellSize: 22});
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(1,2)');
			expect($('#test g').attr('id')).toEqual('thumbs-green-symbol');
			expect(useElem.attr('xlink:href')).toEqual('#thumbs-up-symbol');
			expect(useElem.attr('width')).toEqual('16');
			expect(useElem.attr('height')).toEqual('16');
			expect(useElem.style('pointer-events')).toEqual('none');
		});

		it('appends an svg symbol with the default attributes when sibling data is not all present', function() {
			selection.datum({
				value: 'present_some',
				clazz: 'affected'
			});			
			mc.showAffectedPresentSymbol(selection, {cellSize: 22});
			var useElem = d3.select('#test use');
			expect($('#test g').attr('transform')).toEqual('translate(1,2)');
			expect($('#test g').attr('id')).toEqual('thumbs-grey-symbol');
			expect(useElem.attr('xlink:href')).toEqual('#question-mark-symbol');
			expect(useElem.attr('width')).toEqual('16');
			expect(useElem.attr('height')).toEqual('16');
		});
	});

	describe('#showBookmarkSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol with the correct attributes from the underlying data', function() {
			selection.datum({
				translate: 'translate(123,123)',
				width: '100',
				height: '100',
				clazz: 'blahblah'
			});
			mc.showBookmarkSymbol(selection);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('class')).toEqual('blahblah');
			expect($('#test g').attr('transform')).toEqual('translate(123,123)');
			expect(useElem.attr('xlink:href')).toEqual('#bookmark-symbol');
			expect(useElem.attr('width')).toEqual('100');
			expect(useElem.attr('height')).toEqual('100');
		});

		it('appends an svg symbol with the default attributes they are no in the underlying data', function() {
			selection.datum({ clazz: 'blahblah' });
			mc.showBookmarkSymbol(selection );
			var useElem = d3.select('#test use');
			expect($('#test g').attr('class')).toEqual('blahblah');
			expect($('#test g').attr('transform')).toEqual('translate(2,2)');
			expect(useElem.attr('width')).toEqual('11');
			expect(useElem.attr('height')).toEqual('11');
		});

		it('appends an svg symbol with the correct attributes when cell size > 18', function() {
			selection.datum({ clazz: 'blahblah'});
			mc.showBookmarkSymbol(selection, {cellSize: 22} );
			var useElem = d3.select('#test use');
			expect($('#test g').attr('class')).toEqual('blahblah');
			expect($('#test g').attr('transform')).toEqual('translate(2,2)');
			expect(useElem.attr('width')).toEqual('16');
			expect(useElem.attr('height')).toEqual('16');
		});		
	});

	describe('#showPhenotypeSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends an svg symbol with the correct attributes from the underlying data', function() {
			selection.datum({
				translate: 'translate(123,123)',
				width: '100',
				height: '100',
				clazz: 'blahblah'
			});
			mc.showPhenotypeSymbol(selection);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('class')).toEqual('blahblah');
			expect($('#test g').attr('transform')).toEqual('translate(123,123)');
			expect(useElem.attr('xlink:href')).toEqual('#phenotype-symbol');
			expect(useElem.attr('width')).toEqual('100');
			expect(useElem.attr('height')).toEqual('100');
		});

		it('appends an svg symbol with the default attributes they are no in the underlying data', function() {
			selection.datum({ clazz: 'blahblah' });
			mc.showPhenotypeSymbol(selection);
			var useElem = d3.select('#test use');
			expect($('#test g').attr('class')).toEqual('blahblah');
			expect($('#test g').attr('transform')).toEqual('translate(0,-1)');
			expect(useElem.attr('width')).toEqual('13');
			expect(useElem.attr('height')).toEqual('13');
		});
	});

	describe('#showImpactSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="parent"><div id="child"></div></div>');
			selection = d3.select('#child');
			mc = new MatrixCard();
		});

		it('appends a rect when the type is SNP', function() {
			selection.datum({ clazz: 'blah' });
			d3.select('#parent').datum({ type: 'snp' });
			var options = { cellSize: 22 };
			mc.showImpactSymbol(selection, options);
			var rectElem = d3.select('#child > g > rect');
			expect($('#child g').attr('transform')).toEqual('translate(4,4)');
			expect(rectElem.attr('width')).toEqual('12');
			expect(rectElem.attr('height')).toEqual('12');
			expect(rectElem[0]).toHaveClass('filter-symbol');
			expect(rectElem[0]).toHaveClass('blah');
			expect(rectElem[0]).toHaveClass('snp');
		});

		it('appends a rect when the type is MNP', function() {
			selection.datum({ clazz: 'blah' });
			d3.select('#parent').datum({ type: 'mnp' });
			var options = {cellSize: 22};
			mc.showImpactSymbol(selection, options);
			var rectElem = d3.select('#child > g > rect');
			expect($('#child g').attr('transform')).toEqual('translate(4,4)');
			expect(rectElem.attr('width')).toEqual('12');
			expect(rectElem.attr('height')).toEqual('12');
		});

		it('appends a path when the type is not SNP or MNP', function() {
			selection.datum({ clazz: 'blah' });
			d3.select('#parent').datum({ type: 'asdf' });
			var options = { cellSize: 22 };
			mc.showImpactSymbol(selection, options);
			var pathElem = d3.select('#child > g > path');
			expect($('#child g').attr('transform')).toEqual("translate(10,10)");
			expect(pathElem[0]).toHaveClass('filter-symbol');
			expect(pathElem[0]).toHaveClass('blah');
			expect(pathElem[0]).toHaveClass('asdf');
		});
	});

	describe('#showHighestImpactSymbol', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="parent"><div id="child"></div></div>');
			selection = d3.select('#child');
			mc = new MatrixCard();
			window.matrixCard = new MatrixCard();
			spyOn(matrixCard, 'showImpactSymbol');
		});

		it('shows the impact symbol when there is a vep highest impact', function() {
			spyOn(VariantModel, 'getNonCanonicalHighestImpactsVep').and.returnValue({ 1: 1, 2: 2 });
			var variant = { blah: 'blah' };
			var options = { asdf: 'asdf' }
			d3.select('#parent').datum(variant);
			mc.showHighestImpactSymbol(selection, options);
			expect(VariantModel.getNonCanonicalHighestImpactsVep).toHaveBeenCalledWith(variant);
			expect(matrixCard.showImpactSymbol).toHaveBeenCalledWith(selection, options);
		});

		it('does not show the impact symbol when there is not a vep highest impact', function() {
			spyOn(VariantModel, 'getNonCanonicalHighestImpactsVep').and.returnValue({});
			var variant = { blah: 'blah' };
			var options = { asdf: 'asdf' }
			d3.select('#parent').datum(variant);
			mc.showHighestImpactSymbol(selection, options);
			expect(VariantModel.getNonCanonicalHighestImpactsVep).toHaveBeenCalledWith(variant);
			expect(matrixCard.showImpactSymbol).not.toHaveBeenCalled();
		});
	});

	describe('#showImpactBadge', function() {
		var selection, mc;

		beforeEach(function() {
			setFixtures('<div id="test"></div>');
			selection = d3.select('#test');
			mc = new MatrixCard();
		});

		it('appends a rect svg when the variant type is SNP', function() {
			var variant = { type: "snp" };
			var impactClazz = "impact_HIGH";
			mc.showImpactBadge(selection, variant, impactClazz);
			var rectElem = d3.select('#test rect');
			expect($('#test g').attr('transform')).toEqual('translate(1,3)');
			expect(rectElem[0]).toHaveClass('filter-symbol');
			expect(rectElem[0]).toHaveClass('impact_HIGH');
		});

		it('appends a path svg when the variant type is not SNP', function() {
			var variant = { type: "del", impact: ['low'] };
			var impactClazz = undefined;
			mc.showImpactBadge(selection, variant, impactClazz);
			var pathElem = d3.select('#test path');
			expect($('#test g').attr('transform')).toEqual("translate(5,6)");
			expect(pathElem[0]).toHaveClass('filter-symbol');
			expect(pathElem[0]).toHaveClass('impact_LOW');
		});

		describe('when there is no variant', function() {
			it('uses the underlying selection data for the attributes of the svg', function() {
				var variant = null;
				var impactClazz = undefined;
				selection.datum({
					type: 'snp',
					transform: "translate(100,100)",
					clazz: 'impact_MODERATE'
				});
				mc.showImpactBadge(selection, variant, impactClazz);
				var rectElem = d3.select('#test rect');
				expect($('#test g').attr('transform')).toEqual("translate(100,100)");
				expect(rectElem[0]).toHaveClass('filter-symbol');
				expect(rectElem[0]).toHaveClass('impact_MODERATE');
			});
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
