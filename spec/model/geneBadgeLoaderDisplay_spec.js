describe('geneBadgeLoaderDisplay', function() {
  var display;

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


  describe('#addGene', function() {
    it('should display the added gene', function() {
      display.addGene('BRCA1', 1);
      expect($('#loading-display')).toContainText('BRCA1');
    });

    describe('when the page count is greater than 1', function() {
      it('should display the correct page number', function() {
        display.setPageCount(67)
               .addGene('BRCA1', 66);
        expect($('#loading-display')).toContainText('Page 66');
      });
    });

    describe('when the page count is 1', function() {
      it('should not display the page number', function() {
        display.setPageCount(1)
               .addGene('BRAF', 1);
        expect($('#loading-display')).not.toContainText('Page 1');
      });
    });

  });

  describe('#removeGene', function() {
    it('should not display the gene name once the gene has been removed', function() {
      display.addGene('BRCA1', 1)
             .addGene('BRAF', 2)
             .removeGene('BRAF');
      expect($('#loading-display')).not.toContainText('BRAF');
    });

    it('should display the gene that was last added', function() {
      display.addGene('BRCA1', 1)
             .addGene('BRAF', 2)
             .removeGene('BRAF');
      expect($('#loading-display')).toContainText('BRCA1');
    });

    it('should display the gene that was last added even if the removed gene was not the one being displayed', function() {
      display.addGene('BRCA1', 1)
             .addGene('BRAF', 2)
             .addGene('ACTA', 3)
             .removeGene('BRAF');
      expect($('#loading-display')).toContainText('ACTA');
    });

    describe('when the page count is greater than 1', function() {
      it('should display the correct page number', function() {
        display.setPageCount(1006)
               .addGene('BRCA1', 1004)
               .addGene('BRAF', 1005)
               .removeGene('BRAF');
        expect($('#loading-display')).toContainText('Page 1004');
      });
    });

    describe('when the page count is 1', function() {
      it('should not display the page number', function() {
        display.setPageCount(1)
               .addGene('BRAF', 1)
               .addGene('ACTA', 1)
               .removeGene('BRAF');
        expect($('#loading-display')).not.toContainText('Page 1');
      });
    });

    it('clears out the text when there are no more genes to display', function() {
      display.addGene('BRCA1', 1004)
             .removeGene('BRCA1');
      expect($('#loading-display')).toBeEmpty();
    });
  });

});