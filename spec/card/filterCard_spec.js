describe('filterCard', function() {
	var filterCard;

	beforeEach(function() {
		setFixtures(
			'<div id="afexac-range-filter">\
			  <input type="number" id="af-amount-start" value="10">\
			  <input type="number" id="af-amount-end" value="55">\
			 </div>\
			 <div id="af1000g-range-filter">\
			  <input type="number" id="af-amount-start" value="20">\
			  <input type="number" id="af-amount-end" value="65">\
			 </div>\
			<input type="number" id="coverage-min" value="1">\
			<input id="exonic-only-cb" type="checkbox">');
		filterCard = new FilterCard();
		filterCard.annotsToInclude = "blah";
	});



	describe('#getFilterObject', function() {
		it('returns an object with the correct properties to filter on', function() {
			expect(filterCard.getFilterObject()).toEqual({
				coverageMin: 1,
				afMinExac: 0.1,
				afMaxExac: 0.55,
				afMin1000g: 0.2,
				afMax1000g: 0.65,
				annotsToInclude: "blah",
				exonicOnly: false,
				loadedVariants: false, 
				calledVariants: false,
				affectedInfo: [] 
			});
		});

		it('returns null properties on the filter object when the minimum or maximum allele frequency is blank', function() {
			$('#afexac-range-filter #af-amount-start').val('');
			$('#afexac-range-filter #af-amount-end').val('');
			$('#af1000g-range-filter #af-amount-start').val('');
			$('#af1000g-range-filter #af-amount-end').val('');
			expect(filterCard.getFilterObject()).toEqual({
				coverageMin: 1,
				afMinExac: null,
				afMaxExac: null,
				afMin1000g: null,
				afMax1000g: null,
				annotsToInclude: "blah",
				exonicOnly: false,
				loadedVariants: false, 
				calledVariants: false,
				affectedInfo: []  
			});
		});

		it('returns true for the exonicOnly property when it is checked', function() {
			$('#exonic-only-cb').click();
			expect(filterCard.getFilterObject()).toEqual({
				coverageMin: 1,
				afMinExac: 0.1,
				afMaxExac: 0.55,
				afMin1000g: 0.2,
				afMax1000g: 0.65,				
				annotsToInclude: "blah",
				exonicOnly: true,
				loadedVariants: false, 
				calledVariants: false,
				affectedInfo: [] 
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
				expect(filterCard.getFilterObject()).toEqual(expectedFilterObject);
			});

		});
	});
});
