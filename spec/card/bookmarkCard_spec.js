describe('bookmarkCard', function() {

	describe('constructor', function() {
		var bookmarkCard = new BookmarkCard();

		it('should initialize bookmarkedVariants to an empty object', function() {
			expect(bookmarkCard.bookmarkedVariants).toEqual({});
		});

		it('should initialize bookmarkedGenes to an empty object', function() {
			expect(bookmarkCard.bookmarkedGenes).toEqual({});
		});
	});
});