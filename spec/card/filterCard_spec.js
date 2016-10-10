describe('filterCard', function() {

	beforeEach(function() {
		setFixtures('<div id="loading-display"><div id="blah"></div></div>');
		display = new geneBadgeLoaderDisplay('#loading-display');
	});

	describe('#setPageCount', function() {
		it('sets the page count as a property', function() {
			display.setPageCount(99);
			expect(display.pageCount).toEqual(99);
		});
	});

});