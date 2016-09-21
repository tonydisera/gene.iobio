describe('geneBadgeLoaderDisplay', function() {
	var display;

	beforeEach(function() {
		setFixtures('<div id="loading-display"></div>');
		display = new geneBadgeLoaderDisplay('#loading-display');
	});


	describe('#addGene', function() {
		it('should display the added gene', function() {
			display.addGene('BRCA1', 1);
			expect($('#loading-display')).toContainText('BRCA1');
		});

		it('should display the correct page number', function() {
			display.addGene('BRCA1', 1001);
			expect($('#loading-display')).toContainText('1001');
		});
	});

	describe('#removeGene', function() {
		it('should not display the gene name once the gene has been removed', function() {
			display.addGene('BRCA1', 1);
			display.addGene('BRAF', 2);
			display.removeGene('BRAF');
			expect($('#loading-display')).not.toContainText('BRAF');
		});

		it('should display the gene that was last added', function() {
			display.addGene('BRCA1', 1);
			display.addGene('BRAF', 2);
			display.removeGene('BRAF');
			expect($('#loading-display')).toContainText('BRCA1');
		});

		it('should display the gene that was last added even if the removed gene was not the one being displayed', function() {
			display.addGene('BRCA1', 1);
			display.addGene('BRAF', 2);
			display.addGene('ACTA', 3);
			display.removeGene('BRAF');
			expect($('#loading-display')).toContainText('ACTA');
		})

		it('should display the correct page number', function() {
			display.addGene('BRCA1', 1004);
			display.addGene('BRAF', 1005);
			display.removeGene('BRAF');
			expect($('#loading-display')).toContainText('1004');
		});

		it('clears out the text when there are no more genes to display', function() {
			display.addGene('BRCA1', 1004);
			display.removeGene('BRCA1');
			expect($('#loading-display')).toBeEmpty();
		});
	});

});