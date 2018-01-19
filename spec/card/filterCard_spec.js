describe('filterCard', function() {
  var filterCard;

  beforeEach(function() {
    setFixtures(
      '<div id="afhighest-range-filter">\
        <input type="number" id="af-amount-start" value="10">\
        <input type="number" id="af-amount-end" value="55">\
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
        afMin: 0.1,
        afMax: 0.55,
        annotsToInclude: "blah",
        exonicOnly: false,
        loadedVariants: false,
        calledVariants: false,
        affectedInfo: []
      });
    });

    it('returns null properties on the filter object when the minimum or maximum allele frequency is blank', function() {
      $('#afhighest-range-filter #af-amount-start').val('');
      $('#afhighest-range-filter #af-amount-end').val('');
      expect(filterCard.getFilterObject()).toEqual({
        coverageMin: 1,
        afMin: null,
        afMax: null,
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
        afMin: 0.1,
        afMax: 0.55,
        annotsToInclude: "blah",
        exonicOnly: true,
        loadedVariants: false,
        calledVariants: false,
        affectedInfo: []
      });
    });

    describe('when level is basic', function() {
      var annots = {
        clinvar_path:     {key: 'clinvar',       state: true, value: 'clinvar_path'},
        clinvar_lpath:    {key: 'clinvar',       state: true, value: 'clinvar_lpath'}
      };
      var expectedFilterObject = {
        afMin: 0,
        afMax: .01,
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
