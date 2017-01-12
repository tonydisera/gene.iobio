describe('filterCard', function() {
	var filterCard;

	beforeEach(function() {
		setFixtures('<input type="number" id="af-amount-start" value="10">\
			<input type="number" id="af-amount-end" value="55">\
			<input type="number" id="coverage-min" value="1">\
			<input id="exonic-only-cb" type="checkbox">');
		filterCard = new FilterCard();
		filterCard.annotsToInclude = "blah";
	});

	describe('#shouldWarnForNonPassVariants', function() {

		it('returns true when there are more than 1 filters applied to the vcf records and one of them is PASS', function() {
			filterCard.recFilters = { '.': ".", PASS: "PASS" };
			expect(filterCard.shouldWarnForNonPassVariants()).toBe(true);
		});

		it('returns false when there is no PASS filter applied to the vcf records', function() {
			filterCard.recFilters = { '.': ".", hello: 'hello' };
			expect(filterCard.shouldWarnForNonPassVariants()).toBe(false);
		});

		it('returns false when there is not more than 1 filter applied to the vcf records', function() {
			filterCard.recFilters = { PASS: 'PASS' };
			expect(filterCard.shouldWarnForNonPassVariants()).toBe(false);
		});
	});

	describe('#getFilterObject', function() {
		it('returns an object with the correct properties to filter on', function() {
			expect(filterCard.getFilterObject()).toEqual({
				coverageMin: 1,
				afMin: 0.1,
				afMax: 0.55,
				afScheme: "exac",
				annotsToInclude: "blah",
				exonicOnly: false
			});
		});

		it('returns null properties on the filter object when the minimum or maximum allele frequency is blank', function() {
			$('#af-amount-start').val('');
			$('#af-amount-end').val('');
			expect(filterCard.getFilterObject()).toEqual({
				coverageMin: 1,
				afMin: null,
				afMax: null,
				afScheme: "exac",
				annotsToInclude: "blah",
				exonicOnly: false
			});
		});

		it('returns true for the exonicOnly property when it is checked', function() {
			$('#exonic-only-cb').click();
			expect(filterCard.getFilterObject()).toEqual({
				coverageMin: 1,
				afMin: 0.1,
				afMax: 0.55,
				afScheme: "exac",
				annotsToInclude: "blah",
				exonicOnly: true
			});
		});

		describe('when level is basic', function() {
			var annots = {
				af1000g_rare:     {key: 'af1000glevels', state: true, value: 'af1000g_rare'},
				exac_rare:        {key: 'afexaclevels',  state: true, value: 'afexac_rare'},
				afexac_unique_nc: {key: 'afexaclevels',  state: true, value: 'afexac_unique_nc'},
				clinvar_path:     {key: 'clinvar',       state: true, value: 'clinvar_path'},
				clinvar_lpath:    {key: 'clinvar',       state: true, value: 'clinvar_lpath'},
				clinvar_uc:       {key: 'clinvar',       state: true, value: 'clinvar_uc'},
				clinvar_cd:       {key: 'clinvar',       state: true, value: 'clinvar_cd'},
				clinvar_other:    {key: 'clinvar',       state: true, value: 'clinvar_other'},
				clinvar_lbenign:  {key: 'clinvar',       state: true, value: 'clinvar_lbenign'},
				clinvar_benign:   {key: 'clinvar',       state: true, value: 'clinvar_benign'},
			};
			var expectedFilterObject = {
				annotsToInclude: annots
			};

			beforeEach(function() {
				isLevelBasic = true;
			});

			afterEach(function() {
				isLevelBasic = false;
			});

			it('returns a preset filter object', function() {
				spyOn(filterCard, 'shouldWarnForNonPassVariants').and.returnValue(false);
				expect(filterCard.getFilterObject()).toEqual(expectedFilterObject);
			});

			it('returns a preset filter object with a PASS annotation when we need to warn for non PASS variants', function() {
				var expected = $.extend(true, {}, expectedFilterObject);
				expected.annotsToInclude.PASS = { key: 'recfilter', state: true, value: 'PASS' };
				spyOn(filterCard, 'shouldWarnForNonPassVariants').and.returnValue(true);
				expect(filterCard.getFilterObject()).toEqual(expected);
			})
		});
	});
});
