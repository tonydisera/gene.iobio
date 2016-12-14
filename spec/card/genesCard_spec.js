describe('genesCard', function() {
	var dangerSummary1, dangerSummary2, getDangerSummarySpy;

	beforeEach(function() {
		dangerSummary1 = {};
		dangerSummary2 = {};
		getDangerSummarySpy = jasmine.createSpy();
		spyOn(window, 'getProbandVariantCard').and.returnValue({ getDangerSummaryForGene: getDangerSummarySpy })
	});

	describe('#compareDangerSummary', function() {
		beforeEach(function() {
			window.matrixCard = new MatrixCard();
		});

		it('returns 0 when danger summaries are null for both genes', function() {
			dangerSummary1 = null;
			dangerSummary2 = null;
			getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
			expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toEqual(0);
		});

		it('returns a negative value when danger summary is null for second gene and not the first', function() {
			dangerSummary1 = {};
			dangerSummary2 = null;
			getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
			expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeLessThan(0);
		});

		it('returns a positive value when danger summary is null for first gene and not the second', function() {
			dangerSummary1 = null;
			dangerSummary2 = {};
			getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
			expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeGreaterThan(0);
		});

		describe('CLINVAR comparisons', function() {
			it('returns a negative value when the clinvar of the first gene is less than the clinvar of the second', function() {
				dangerSummary1.CLINVAR = { pathogenic: { value: 1 } };
				dangerSummary2.CLINVAR = { uncertain_significance: { value: 4 } };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeLessThan(0);
			});

			it('returns a positive value when the clinvar of the first gene is greater than the clinvar of the second', function() {
				dangerSummary1.CLINVAR = { uncertain_significance: { value: 4 } };
				dangerSummary2.CLINVAR = { pathogenic: { value: 1 } };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeGreaterThan(0);
			});
		});

		describe('SIFT comparisons', function() {
			it('returns a negative value when the sift of the first gene is less than the sift of the second', function() {
				dangerSummary1.SIFT = { 'sift_deleterious': { deleterious: {} } };
				dangerSummary2.SIFT = { 'sift_deleterious_low_confidence': { deleterious_low_confidence: {} } };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeLessThan(0);
			});

			it('returns a positive value when the sift of the first gene is greater than the sift of the second', function() {
				dangerSummary1.SIFT = { 'sift_deleterious_low_confidence': { deleterious_low_confidence: {} } };
				dangerSummary2.SIFT = { 'sift_deleterious': { deleterious: {} } };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeGreaterThan(0);
			});
		});

		describe('POLYPHEN comparisons', function() {
			it('returns a negative value when the polyphen of the first gene is less than the polyphen of the second', function() {
				dangerSummary1.POLYPHEN = { 'polyphen_probably_damaging': { probably_damaging: {} } };
				dangerSummary2.POLYPHEN = { 'polyphen_possibly_damaging': { possibly_damaging: {} } };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeLessThan(0);
			});

			it('returns a positive value when the polyphen of the first gene is greater than the polyphen of the second', function() {
				dangerSummary1.POLYPHEN = { 'polyphen_possibly_damaging': { possibly_damaging: {} } };
				dangerSummary2.POLYPHEN = { 'polyphen_probably_damaging': { probably_damaging: {} } };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeGreaterThan(0);
			});
		});

		describe('IMPACT comparisons', function() {
			it('returns a negative value when the impact of the first gene is less than the impact of the second', function() {
				dangerSummary1.IMPACT = { HIGH: {} };
				dangerSummary2.IMPACT = { MODERATE: {} };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeLessThan(0);
			});

			it('returns a positive value when the impact of the first gene is greater than the impact of the second', function() {
				dangerSummary1.IMPACT = { MODERATE: {} };
				dangerSummary2.IMPACT = { HIGH: {} };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeGreaterThan(0);
			});
		});

		describe('GENE NAME comparisons', function() {
			it('returns a negative value when the name of the first gene is alphabetically before the name of the second', function() {
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('A1BG', 'BRCA1')).toBeLessThan(0);
			});

			it('returns a positive value when the name of the first gene is alphabetically after the name of the second', function() {
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('BRCA1', 'A1BG')).toBeGreaterThan(0);
			});
		});

		describe('ORDER OF SIGNIFICANCE in comparisons', function() {
			it('considers clinvar before sift', function() {
				dangerSummary1.CLINVAR = { pathogenic: { value: 1 } };
				dangerSummary2.CLINVAR = { uncertain_significance: { value: 4 } };
				dangerSummary1.SIFT = { 'sift_deleterious_low_confidence': { deleterious_low_confidence: {} } };
				dangerSummary2.SIFT = { 'sift_deleterious': { deleterious: {} } };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeLessThan(0);
			});

			it('considers sift before polyphen', function() {
				dangerSummary1.SIFT = { 'sift_deleterious': { deleterious: {} } };
				dangerSummary2.SIFT = { 'sift_deleterious_low_confidence': { deleterious_low_confidence: {} } };
				dangerSummary1.POLYPHEN = { 'polyphen_possibly_damaging': { possibly_damaging: {} } };
				dangerSummary2.POLYPHEN = { 'polyphen_probably_damaging': { probably_damaging: {} } };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeLessThan(0);
			});

			it('considers polyphen before impact', function() {
				dangerSummary1.POLYPHEN = { 'polyphen_probably_damaging': { probably_damaging: {} } };
				dangerSummary2.POLYPHEN = { 'polyphen_possibly_damaging': { possibly_damaging: {} } };
				dangerSummary1.IMPACT = { MODERATE: {} };
				dangerSummary2.IMPACT = { HIGH: {} };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('gene 1', 'gene 2')).toBeLessThan(0);
			});

			it('considers impact before gene name', function() {
				dangerSummary1.IMPACT = { HIGH: {} };
				dangerSummary2.IMPACT = { MODERATE: {} };
				getDangerSummarySpy.and.returnValues(dangerSummary1, dangerSummary2);
				expect(genesCard.compareDangerSummary('BRCA1', 'A1BG')).toBeLessThan(0);
			});
		});
	});
});


