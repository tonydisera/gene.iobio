describe('app', function() {
	fdescribe('#getCodingRegions', function() {
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
});