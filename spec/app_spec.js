describe('app', function() {

  describe('#util.getRsId', function() {
    it('returns an id string based on the vepVariationIds of a variant', function() {
      var variant = {
        vepVariationIds: { '1&rs123&3': {} }
      };
      expect(util.getRsId(variant)).toEqual('rs123');
    });

    it('returns null when the vepVariationIds of the variant are not present', function() {
      expect(util.getRsId({})).toBeNull();
    });
  });

  describe('#util.stripTranscriptPrefix', function() {
    it('returns the prefix from a transcript id', function() {
      var transcriptId = "ENST00000265849.7";
      expect(util.stripTranscriptPrefix(transcriptId)).toEqual('ENST00000265849');
    });
  });

  describe('#getCodingRegions', function() {
    it('returns an array of coding regions when the transcript_id is not cached', function() {
      transcriptCodingRegions = {};
      var variants = [
        { feature_type: 'EXON', start: 1, end: 2 },
        { feature_type: 'CDS', start: 3, end: 4 },
        { feature_type: 'UTR', start: 5, end: 6 },
        { feature_type: 'INTRON', start: 7, end: 8}
      ];
      var transcript = {
        transcript_id: 123,
        features: variants
      };
      var codingRegions =[{ start: 1, end: 2 }, { start: 3, end: 4 }, { start: 5, end: 6 }];
      expect(getCodingRegions(transcript)).toEqual(codingRegions);
    });

    it('returns an array of coding regions from the cache', function() {
      transcriptCodingRegions = { 123: [{ start: 1, end: 2 }] }
      var transcript = { transcript_id: 123, features: [] };
      expect(getCodingRegions(transcript)).toEqual([{ start: 1, end: 2 }]);
    });

    it('caches the array of coding regions according to transcript_id', function() {
      transcriptCodingRegions = {};
      var transcript = { transcript_id: 123, features: [{ feature_type: 'EXON', start: 1, end: 2 }] };
      getCodingRegions(transcript);
      expect(transcriptCodingRegions).toEqual({ 123: [{ start: 1, end: 2 }] });
    });
  });

  describe('#showSidebar', function() {
    beforeEach(function() {
      jasmine.addMatchers(jasmineColorMatchers);
      setFixtures(
        '<div class="sidebar-button selected"></div>' +
        '<div id="search-dna-glyph"></div>' +
        '<div id="slider-left-content">' +
          '<div id="filter-track"></div>' +
          '<div id="genes-card"></div>' +
          '<div id="bookmark-card"></div>' +
          '<div id="recall-card"></div>' +
          '<div id="help-card"></div>' +
        '</div>' +
        '<div id="button-show-filters"></div>' +
        '<div id="button-show-phenolyzer"></div>' +
        '<div id="button-show-bookmarks"></div>' +
        '<div id="button-find-missing-variants"></div>' +
        '<div id="button-show-help"></div>'
      );
    });

    it('sets the fill on the glyph to blue when Find Genes panel is open', function() {
      showSidebar('Phenolyzer');
      expect($('#search-dna-glyph').attr('fill')).toEqual('#5d809d');
    });

    it('sets the fill on the glyph to white when Find Genes panel is not open', function() {
      showSidebar('Filter');
      expect($('#search-dna-glyph').attr('fill')).toEqual('white');
    });

    it('removes the selected class from sidebar buttons', function() {
      showSidebar('Filter');
      expect($('.sidebar-button')).not.toHaveClass('selected');
    });

    it('shows the filter track when Filter is selected', function() {
      $('#filter-track').addClass('hide');
      showSidebar('Filter');
      expect($('#filter-track')).not.toHaveClass('hide');
      expect($('#genes-card')).toHaveClass('hide');
      expect($('#bookmark-card')).toHaveClass('hide');
      expect($('#recall-card')).toHaveClass('hide');
      expect($('#help-card')).toHaveClass('hide');
    });

    it('shows genes card when Phenolyzer is selected', function() {
      $('#genes-card').addClass('hide');
      showSidebar('Phenolyzer');
      expect($('#filter-track')).toHaveClass('hide');
      expect($('#genes-card')).not.toHaveClass('hide');
      expect($('#bookmark-card')).toHaveClass('hide');
      expect($('#recall-card')).toHaveClass('hide');
      expect($('#help-card')).toHaveClass('hide');
    });

    it('shows bookmark card when Bookmarks is selected', function() {
      $('#bookmark-card').addClass('hide');
      showSidebar('Bookmarks');
      expect($('#filter-track')).toHaveClass('hide');
      expect($('#genes-card')).toHaveClass('hide');
      expect($('#bookmark-card')).not.toHaveClass('hide');
      expect($('#recall-card')).toHaveClass('hide');
      expect($('#help-card')).toHaveClass('hide');
    });

    it('shows recall card when Recall is selected', function() {
      $('#recall-card').addClass('hide');
      showSidebar('Recall');
      expect($('#filter-track')).toHaveClass('hide');
      expect($('#genes-card')).toHaveClass('hide');
      expect($('#bookmark-card')).toHaveClass('hide');
      expect($('#recall-card')).not.toHaveClass('hide');
      expect($('#help-card')).toHaveClass('hide');
    });

    it('shows help card when Help is selected', function() {
      $('#help-card').addClass('hide');
      showSidebar('Help');
      expect($('#filter-track')).toHaveClass('hide');
      expect($('#genes-card')).toHaveClass('hide');
      expect($('#bookmark-card')).toHaveClass('hide');
      expect($('#recall-card')).toHaveClass('hide');
      expect($('#help-card')).not.toHaveClass('hide');
    });
  });
});
