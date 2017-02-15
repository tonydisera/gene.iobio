describe('variantModel', function() {
	var variantModel;

	beforeEach(function() {
		variantModel = new VariantModel();
	});

	describe('#setLoadState', function() {
		it('sets the load state on the vcf data object', function() {
			var theVcfData = {};
			var taskName = 'clinvar';
			variantModel.setLoadState(theVcfData, taskName);
			expect(theVcfData).toEqual({ loadState: { clinvar: true } });
		});
	});

	describe('#isLoaded', function() {
		it('returns true when both the vcf and vcfData are present', function() {
			variantModel.vcf = {};
			variantModel.vcfData = {};
			expect(variantModel.isLoaded()).toBeTruthy();
		});

		it('returns false when either the vcf or vcfData are not present', function() {
			variantModel.vcfData = {};
			expect(variantModel.isLoaded()).toBeFalsy();
			variantModel.vcfData = null;
			variantModel.vcf = {};
			expect(variantModel.isLoaded()).toBeFalsy();
		});
	});

	describe('#filterBamDataByRegion', function() {
		it('returns an array of all bam data that falls within the specified start and end regions', function() {
			var bamDataCoverage = [[80, 0], [90, 0], [100, 0], [150, 0], [200, 0], [201, 0]];
			var regionStart = 100;
			var regionEnd = 200;
			var filteredData = variantModel.filterBamDataByRegion(bamDataCoverage, regionStart, regionEnd);
			expect(filteredData).toEqual([[100, 0], [150, 0], [200, 0]]);
		});
	});

	describe('#reduceBamData', function() {
		it('shortens bam data to a specified number of points using the correct calculated factor of reduction', function() {
			variantModel.bam = { reducePoints: jasmine.createSpy() };
			var bamDataCoverage = [[80, 0], [90, 0], [100, 0], [150, 0], [200, 0]];
			variantModel.reduceBamData(bamDataCoverage, 3);
			expect(variantModel.bam.reducePoints).toHaveBeenCalledWith(bamDataCoverage, 2, jasmine.any(Function), jasmine.any(Function));
		});
	});

	describe('#getMatchingVariant', function() {
		it('returns the variant with matching properties to the given variant', function() {
			var variant_1 = { start: 2, end: 3, ref: 'A', alt: 'G', type: 'snp' };
			var variant_2 = { start: 1, end: 4, ref: 'A', alt: 'G', type: 'snp' };
			var variant_3 = { start: 1, end: 3, ref: 'T', alt: 'G', type: 'snp' };
			var variant_4 = { start: 1, end: 3, ref: 'A', alt: 'C', type: 'snp' };
			var variant_5 = { start: 1, end: 3, ref: 'A', alt: 'G', type: 'del' };
			var variant_6 = { start: 1, end: 3, ref: 'A', alt: 'G', type: 'SNP' };
			var variants = [variant_1, variant_2, variant_3, variant_4, variant_5, variant_6];
			window.gene = 'BRCA1';
			window.selectedTranscript = 'transcript';
			spyOn(variantModel, 'getVcfDataForGene').and.returnValue({ features: variants });
			expect(variantModel.getMatchingVariant({ start: 1, end: 3, ref: 'A', alt: 'G', type: 'snp' })).toEqual(variant_6);
			expect(variantModel.getVcfDataForGene).toHaveBeenCalledWith('BRCA1', 'transcript');
		});

		it('returns null when there is no vcfdata', function() {
			spyOn(variantModel, 'getVcfDataForGene').and.returnValue(null);
			expect(variantModel.getMatchingVariant({ start: 1, end: 3, ref: 'A', alt: 'G', type: 'snp' })).toBeNull();
		})
	});

	describe('#summarizeDanger', function() {

		it('returns a danger counts object with the correct impact when the annotation scheme is snpeff', function() {
			filterCard.annotationScheme = 'snpeff';
			var vcfData = {
				features: [
					{ type: 'snp', highestImpactSnpeff: { MODERATE: { missense_variant: {} } } },
					{ type: 'snp', highestImpactSnpeff: { MODERATE: { missense_variant: { ENST000001: "ENST000001" } } } },
					{ type: 'del', highestImpactSnpeff: { MODERATE: { missense_variant: { ENST000001: "ENST000001" } } } },
					{ type: 'snp', highestImpactSnpeff: { MODIFIER: { intron_variant: {} } } },
					{ type: 'snp', highestImpactSnpeff: { MODIFIER: { downstream_gene_variant: {} } } }
				]
			};
			expect(VariantModel.summarizeDanger(vcfData)).toEqual({
				CLINVAR: null,
				INHERITANCE: {},
				IMPACT: {
					MODERATE: {
						snp: { missense_variant: { ENST000001: "ENST000001" } },
						del: { missense_variant: { ENST000001: "ENST000001" } }
					}
				},
				CONSEQUENCE: {},
				AF: {},
				featureCount: 5
			});
		});

		it('returns a danger counts object with the correct consequence and impact when the annotation scheme is vep', function() {
			filterCard.annotationScheme = 'vep';
			var vcfData = {
				features: [
					{ type: 'snp', highestImpactVep: { MODERATE: { missense_variant: {} } } },
					{ type: 'snp', highestImpactVep: { MODERATE: { missense_variant: { ENST000001: "ENST000001" } } } },
					{ type: 'del', highestImpactVep: { MODERATE: { missense_variant: { ENST000001: "ENST000001" } } } },
					{ type: 'snp', highestImpactVep: { MODIFIER: { intron_variant: {} } } },
					{ type: 'snp', highestImpactVep: { MODIFIER: { downstream_gene_variant: {} } } }
				]
			};
			expect(VariantModel.summarizeDanger(vcfData)).toEqual({
				CLINVAR: null,
				INHERITANCE: {},
				IMPACT: {
					MODERATE: {
						snp: { missense_variant: { ENST000001: "ENST000001" } },
						del: { missense_variant: { ENST000001: "ENST000001" } }
					}
				},
				CONSEQUENCE: {
					MODERATE: {
						snp: { missense_variant: { ENST000001: "ENST000001" } },
						del: { missense_variant: { ENST000001: "ENST000001" } }
					}
				},
				AF: {},
				featureCount: 5
			});
		});

		it('returns a danger counts object with the correct SIFT', function() {
			var vcfData = {
				features: [
					{ type: 'snp', highestSIFT: { deleterious: {} } },
					{ type: 'snp', highestSIFT: { deleterious_low_confidence: {} } },
					{ type: 'snp', highestSIFT: { tolerated: {} } },
					{ type: 'snp', highestSIFT: { "": {} } }
				]
			};
			expect(VariantModel.summarizeDanger(vcfData)).toEqual({
				CLINVAR: null,
				INHERITANCE: {},
				IMPACT: {},
				CONSEQUENCE: {},
				SIFT: { 'sift_deleterious_low_confidence': { deleterious_low_confidence: {} } },
				AF: {},
				featureCount: 4
			});
		});

		it('returns a danger counts object with the correct POLYPHEN', function() {
			var vcfData = {
				features: [
					{ type: 'snp', highestPolyphen: { probably_damaging: {} } },
					{ type: 'snp', highestPolyphen: { possibly_damaging: {} } },
					{ type: 'snp', highestPolyphen: { benign: {} } },
					{ type: 'snp', highestPolyphen: { "": {} } }
				]
			};
			expect(VariantModel.summarizeDanger(vcfData)).toEqual({
				CLINVAR: null,
				INHERITANCE: {},
				IMPACT: {},
				CONSEQUENCE: {},
				POLYPHEN: { 'polyphen_possibly_damaging': { possibly_damaging: {} } },
				AF: {},
				featureCount: 4
			});
		});

		it('returns a danger counts object with the correct clinvar', function() {
			var vcfData = {
				features: [
					{ type: 'snp', clinVarClinicalSignificance: { none: "Y", "benign/likely_benign": "Y" } },
					{ type: 'snp', clinVarClinicalSignificance: { pathogenic: {} } },
					{ type: 'snp', clinVarClinicalSignificance: { uncertain_significance: {} } },
					{ type: 'snp', clinVarClinicalSignificance: { "": {} } }
				]
			};
			expect(VariantModel.summarizeDanger(vcfData)).toEqual({
				CLINVAR: {
					pathogenic: { value: 1, badge: true, examineBadge: true, clazz: 'clinvar_path', symbolFunction: jasmine.any(Function) }
				},
				INHERITANCE: {},
				IMPACT: {},
				CONSEQUENCE: {},
				AF: {},
				featureCount: 4
			});
		});

		it('returns a danger counts object with the correct inheritance', function() {
			var vcfData = {
				features: [
					{ type: 'snp', inheritance: "none" },
					{ type: 'snp', inheritance: "denovo" },
					{ type: 'snp', inheritance: "" },
					{ type: 'snp', inheritance: "recessive" }
				]
			};
			expect(VariantModel.summarizeDanger(vcfData)).toEqual({
				CLINVAR: null,
				INHERITANCE: { denovo: "denovo", recessive: "recessive" },
				IMPACT: {},
				CONSEQUENCE: {},
				AF: {},
				featureCount: 4
			});
		});

		describe('when afExAC is higher than af1000G', function() {
			it('returns a danger counts object with the correct allele frequency (AF)', function() {
				window.matrixCard = new MatrixCard();
				var vcfData = {
					features: [
						{ type: 'snp', afExAC: 0.04, af1000G: 0.03 }, // value of 6
						{ type: 'snp', afExAC: 0.005, af1000G: 0.001 }, // value of 5
					]
				};
				expect(VariantModel.summarizeDanger(vcfData)).toEqual({
					CLINVAR: null,
					INHERITANCE: {},
					IMPACT: {},
					CONSEQUENCE: {},
					AF: {
						afexac_rare: { field: 'afExAC', value: 5 }
					},
					featureCount: 2
				});
			});
		});

		describe('when af1000G is higher than afExAC', function() {
			it('returns a danger counts object with the correct allele frequency (AF)', function() {
				window.matrixCard = new MatrixCard();
				var vcfData = {
					features: [
						{ type: 'snp', afExAC: -1.05, af1000G: -1 }, // value of 2
						{ type: 'snp', afExAC: 0.01, af1000G: 0.02 }, // value of 6
					]
				};
				expect(VariantModel.summarizeDanger(vcfData)).toEqual({
					CLINVAR: null,
					INHERITANCE: {},
					IMPACT: {},
					CONSEQUENCE: {},
					AF: {
						af1000g_unique: { field: 'af1000G', value: 2 }
					},
					featureCount: 2
				});
			});
		});

		describe('when afExAC is present but not af1000G', function() {
			it('returns a danger counts object with the correct allele frequency (AF)', function() {
				window.matrixCard = new MatrixCard();
				var vcfData = {
					features: [
						{ type: 'snp', afExAC: 0.04 }, // value of 6
						{ type: 'snp', afExAC: 0.005 }, // value of 5
					]
				};
				expect(VariantModel.summarizeDanger(vcfData)).toEqual({
					CLINVAR: null,
					INHERITANCE: {},
					IMPACT: {},
					CONSEQUENCE: {},
					AF: {
						afexac_rare: { field: 'afExAC', value: 5 }
					},
					featureCount: 2
				});
			});
		});

		describe('when af1000G is present but not afExAC', function() {
			it('returns a danger counts object with the correct allele frequency (AF)', function() {
				window.matrixCard = new MatrixCard();
				var vcfData = {
					features: [
						{ type: 'snp', af1000G: -1 }, // value of 2
						{ type: 'snp', af1000G: 0.02 }, // value of 6
					]
				};
				expect(VariantModel.summarizeDanger(vcfData)).toEqual({
					CLINVAR: null,
					INHERITANCE: {},
					IMPACT: {},
					CONSEQUENCE: {},
					AF: {
						af1000g_unique: { field: 'af1000G', value: 2 }
					},
					featureCount: 2
				});
			});
		});
	});

	describe('#getVariantCount', function() {
		it('returns the correct count of loaded variants', function() {
			window.gene = 'BRCA1';
			window.selectedTranscript = 'transcript';
			spyOn(variantModel, 'getVcfDataForGene').and.returnValue({
				features: [{ fbCalled: 'Y' }, { zygosity: 'HOMREF' }, { zygosity: null }, { zygosity: 'HET' }]
			});
			expect(variantModel.getVariantCount()).toBe(2);
			expect(variantModel.getVcfDataForGene).toHaveBeenCalledWith('BRCA1', 'transcript');
		});

		it('returns 0 when there are no variants', function() {
			expect(variantModel.getVariantCount({})).toBe(0);
		});

		it('returns 0 when there is no vcf data', function() {
			spyOn(variantModel, 'getVcfDataForGene').and.returnValue(null);
			expect(variantModel.getVariantCount()).toBe(0);
		});
	});

	describe('#getCalledVariantCount', function() {
		it('returns the correct count of called variants', function() {
			variantModel.fbData = {
				features: [{ zygosity: 'HET' }, { zygosity: 'HOMREF' }, { zygosity: 'HOM'}]
			};
			expect(variantModel.getCalledVariantCount()).toEqual(2);
		});

		it('returns 0 when there are no called variants', function() {
			variantModel.fbData = {};
			expect(variantModel.getCalledVariantCount()).toEqual(0);
		});
	});

	describe('#_pileupVariants', function() {
		it('returns the correct maxLevel and featureWidth', function() {
			window.gene = { start: 100 };
			var start = 100;
			var end = 1001;
			var variants = [{}, {}, {}, {}];
			var vcf = { pileupVcfRecords: jasmine.createSpy().and.returnValue(30) };
			variantModel.vcf = vcf;
			var result = variantModel._pileupVariants(variants, start, end);
			expect(vcf.pileupVcfRecords).toHaveBeenCalledWith(variants, 100, 1, 8);
			expect(result.maxLevel).toBe(30);
			expect(result.featureWidth).toBe(4);
		});

		describe('when maxLevel is greater than 30', function() {
			it('returns the correct maxLevel and featureWidth', function() {
				window.gene = { start: 100 };
				var start = 1;
				var end = 6001;
				var variants = [{}, {}, {}, {}];
				var i = 0;
				var returnValues = [31, 51, 52, 51, 51, 49];
				var spy = jasmine.createSpy().and.callFake(function() { return returnValues[i++]; });
				var vcf = { pileupVcfRecords: spy };
				variantModel.vcf = vcf;
				var result = variantModel._pileupVariants(variants, start, end);
				expect(vcf.pileupVcfRecords.calls.count()).toEqual(6);
				expect(result.maxLevel).toBe(49);
				expect(result.featureWidth).toBe(1);
			});
		});
	});

	describe('#filterVariants', function() {
		var dataCopy, filterObjectCopy;
		var variant_1, variant_2, variant_3, variant_4;
		var data, filterObject;

		beforeEach(function() {
			variant_1 = {
				zygosity: 'HOM',
				recfilter: 'PASS'
			};

			variant_2 = {
				zygosity: 'HET',
				recfilter: 'PASS'
			};

			variant_3 = {
				zygosity: 'HET',
				recfilter: '.'
			};

			variant_4 = {
				zygosity: 'HOM',
				recfilter: '.'
			};

			variant_5 = {
				zygosity: 'HOMREF',
				recfilter: 'PASS'
			}

			data = {
				count: 33,
				countMatch: 10,
				countUnique: 2,
				features: [variant_1, variant_2, variant_3, variant_4, variant_5],
				name: "vcf track",
				sampleCount: 2,
				strand: "+"
			};

			filterObject = {
				'coverageMin': 100,
				'afMinExac': 0,
				'afMaxExac': 1,
				'annotsToInclude': {},
				'exonicOnly': false
		  };
			variantModel.setRelationship('proband');
			spyOn(variantModel, '_pileupVariants').and.returnValue({ maxLevel: 10, featureWidth: 100 });
		});

		it('returns an object containing all the filtered vcf data', function() {
			data.features = [];
			var vcfDataFiltered = variantModel.filterVariants(data, filterObject, 100, 200);
			expect(vcfDataFiltered).toEqual({
				count: 33,
				countMatch: 10,
				countUnique: 2,
				sampleCount: 2,
				intronsExcludedCount: 0,
				end: 200,
				features: [],
				maxLevel: 11,
				featureWidth: 100,
				name: "vcf track",
				start: 100,
				strand: "+",
				variantRegionStart: 100
			})
		});

		it('removes all the variants that have a zygosity of homref', function() {
			var filteredData = variantModel.filterVariants(data, filterObject);
			expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
		});

		describe('when there is a PASS filter applied to the vcf records', function() {
			it('assigns a feature class of low-quality for each variant that does not have a PASS filter record', function() {
				spyOn(filterCard, 'shouldWarnForNonPassVariants').and.returnValue(true);
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features[0].featureClass).toEqual('');
				expect(filteredData.features[1].featureClass).toEqual('');
				expect(filteredData.features[2].featureClass).toEqual('low-quality');
				expect(filteredData.features[3].featureClass).toEqual('low-quality');
			});
		});

		describe('when there is not a PASS filter applied to the vcf records', function() {
			it('assigns a feature class of low-quality for each variant that does not have a PASS filter record', function() {			
				spyOn(filterCard, 'shouldWarnForNonPassVariants').and.returnValue(false);
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features[0].featureClass).toBeUndefined();
				expect(filteredData.features[1].featureClass).toBeUndefined();
				expect(filteredData.features[2].featureClass).toBeUndefined();
				expect(filteredData.features[3].featureClass).toBeUndefined();
			});
		});

		it('filters out variants that do not start within the specified region', function() {
			start = 5;
			end = 10;
			variant_1.start = 5;
			variant_2.start = 8;
			variant_3.start = 12;
			variant_4.start = 1;
			var filteredData = variantModel.filterVariants(data, filterObject, start, end);
			expect(filteredData.features).toEqual([variant_1, variant_2]);
		});

		describe('when filtering out variants that do not meet the specifed afExAC allele frequency', function() {
			it('filters out variants that are not in the specified range', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.8;
				filterObject.afMinExac = 0.6;
				filterObject.afMaxExac = 1;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_4]);
			});

			it('treats null and blank string allele frequencies as 0', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.9;
				filterObject.afMinExac = 0;
				filterObject.afMaxExac = 0.7;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3]);
			});

			it('defaults to keeping all variants when afMin and afMax in the filterObject are null', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.9;
				filterObject.afMinExac = null;
				filterObject.afMaxExac = null;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});

			it('defaults to keeping all variants when afMin and afMax in the filterObject are NaN', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.9;
				filterObject.afMinExac = NaN;
				filterObject.afMaxExac = NaN;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});

			it('defaults to keeping all variants when afMin and afMax in the filterObject are 0 and 1, respectively', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.9;
				filterObject.afMinExac = 0;
				filterObject.afMaxExac = 1;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});
		});

		describe('when filtering out variants that do not meet the specifed af1000G allele frequency', function() {
			it('filters out variants that are not in the specified range', function() {
				variant_1.af1000G = null;
				variant_2.af1000G = '';
				variant_3.af1000G = 0.5;
				variant_4.af1000G = 0.8;
				filterObject.afMin1000g = 0.6;
				filterObject.afMax1000g = 1;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_4]);
			});
		});

		describe('when the exonic only filter is not applied', function() {
			it('keeps all variants', function() {
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});
		});

		describe('when the exonic only filter is applied', function() {
			beforeEach(function() {
				filterObject.exonicOnly = true;
			});

			describe('when the annotation scheme is snpeff', function() {
				it('keeps the variants that have a high or moderate impact OR an effect that is not an intron', function() {
					filterCard.annotationScheme = 'snpeff';
					variant_1.impact = { HIGH: 'HIGH' };
					variant_2.impact = { MODERATE: 'MODERATE' };
					variant_3.impact = { LOW: 'LOW' };
					variant_3.effect = { EXON: 'EXON' };
					variant_4.impact = { LOW: 'LOW' };
					var filteredData = variantModel.filterVariants(data, filterObject);
					expect(filteredData.features).toEqual([variant_1, variant_2, variant_3]);
				});
			});

			describe('when the annotation scheme is not snpeff', function() {
				it('keeps the variants that have a high or moderate impact OR an effect that is not an intron', function() {
					filterCard.annotationScheme = 'vep';
					IMPACT_FIELD_TO_FILTER = 'vepImpact';
					variant_1.vepImpact = { HIGH: 'HIGH' };
					variant_2.vepImpact = { MODERATE: 'MODERATE' };
					variant_3.vepImpact = { LOW: 'LOW' };
					variant_3.vepConsequence = { EXON: 'EXON' };
					variant_4.vepImpact = { LOW: 'LOW' };
					var filteredData = variantModel.filterVariants(data, filterObject);
					expect(filteredData.features).toEqual([variant_1, variant_2, variant_3]);
				});
			});

			it('increments the intronsExcludedCount in the filtered data for each variant that does not meet the exonic only filter', function() {
				filterCard.annotationScheme = 'snpeff';
				variant_1.impact = { HIGH: 'HIGH' };
				variant_2.impact = { MODERATE: 'MODERATE' };
				variant_3.impact = { LOW: 'LOW' };
				variant_3.effect = { EXON: 'EXON' };
				variant_4.effect = { INTRON_VARIANT: 'intron_variant' };
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.intronsExcludedCount).toEqual(2);
			});
		});

		describe('when filtering out variants that do not meet the minimum coverage', function() {
			it('keeps variants that have a bamDepth or genotypeDepth greater than or equal to the minimum coverage', function() {
				variant_1.bamDepth = 99;
				variant_2.bamDepth = 100;
				variant_3.bamDepth = 101;
				variant_4.bamDepth = null;
				variant_4.genotypeDepth = 101;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_2, variant_3, variant_4]);
			});

			it('keeps variants that do not have a bamDepth and do not have a genotypeDepth', function() {
				variant_1.bamDepth = 99;
				variant_2.bamDepth = 100;
				variant_3.bamDepth = '';
				variant_3.genotypeDepth = '';
				variant_4.bamDepth = null;
				variant_4.genotypeDepth = null;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_2, variant_3, variant_4]);
			});
		});

		describe('when filtering on annotations', function() {
			it('filters out all variants that do not meet the value of each annotation', function() {
				filterObject.annotsToInclude = {
					afexac_rare: { key: "afexaclevels", state: true, value: "afexac_rare" }
				};
				variant_1.afexaclevels = { afexac_rare: 'afexac_rare' };
				variant_2.afexaclevels = {};
				variant_3.afexaclevels = '';
				variant_4.afexaclevels = 'afexac_rare';
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_4]);
			});

			it('does not filter on any annotations that have a state of false', function() {
				filterObject.annotsToInclude = {
					afexac_rare: { key: "afexaclevels", state: false, value: "afexac_rare" }
				};
				variant_1.afexaclevels = { afexac_rare: 'afexac_rare' };
				variant_2.afexaclevels = {};
				variant_3.afexaclevels = '';
				variant_4.afexaclevels = 'afexac_rare';
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});

			it('filters correctly on multiple annotations', function() {
				filterObject.annotsToInclude = {
					afexac_rare: { key: "afexaclevels", state: true, value: "afexac_rare" },
					MODERATE: { key: "vepImpact", state: true, value: "MODERATE" },
					downstream_gene_variant: { key: "vepConsequence", state: false, value: "downstream_gene_variant" }
				};
				variant_1.afexaclevels = { afexac_rare: 'afexac_rare' };
				variant_1.vepImpact = { MODERATE: 'MODERATE' };
				variant_2.afexaclevels = {};
				variant_2.vepImpact = {};
				variant_3.afexaclevels = '';
				variant_2.vepImpact = '';
				variant_4.afexaclevels = { afexac_rare: 'afexac_rare' };
				variant_4.vepImpact = { LOW: 'LOW' };
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1]);
			});

			it('filters correctly on annotations that allow for multiple values for the same key', function() {
				filterObject.annotsToInclude = {
					MODERATE: { key: "vepImpact", state: true, value: "MODERATE" },
					HIGH: { key: "vepImpact", state: true, value: "HIGH" }
				};
				variant_1.vepImpact = { MODERATE: 'MODERATE' };
				variant_2.vepImpact = { HIGH: 'HIGH' };
				variant_3.vepImpact = { LOW: 'LOW' };
				variant_4.vepImpact = { MODERATE: 'MODERATE' };
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_4]);
			})

			it('does not filter on inheritance when the relationship is not proband', function() {
				filterObject.annotsToInclude = {
					denovo: { key: "inheritance", state: true, value: "denovo" }
				};
				variantModel.setRelationship('mother');
				variant_1.inheritance = { denovo: "denovo" };
				variant_2.inheritance = "denovo";
				variant_3.inheritance = {};
				variant_4.inheritance = {};
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});

			it('filters on inheritance when the relationship is proband', function() {
				filterObject.annotsToInclude = {
					denovo: { key: "inheritance", state: true, value: "denovo" }
				};
				variant_1.inheritance = { denovo: "denovo" };
				variant_2.inheritance = "denovo";
				variant_3.inheritance = {};
				variant_4.inheritance = {};
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2]);
			});
		});
	});

	describe('#determineMaxAlleleCount', function() {
		describe('when the proband has variants in the gene', function() {
			it('it sets the max allele count on the vcf data', function() {
				dataCard.mode = 'single';
				var variants = [
					{ genotypeDepth: 1, genotypeDepthMother: "2", genotypeDepthFather: "3"},
					{ genotypeDepth: 1, genotypeDepthMother: "5", genotypeDepthFather: "2"},
				];
				var vcfData = { features: variants };
				expect(variantModel.determineMaxAlleleCount(vcfData)).toEqual({ features: variants, maxAlleleCount: 5 });
			});
		});

		describe('when the proband does not have variants in the gene', function() {
			it('it sets the max allele count on the vcf data based on the mother and father', function() {
				window.gene = 'BRCA1';
				window.selectedTranscript = 'transcript';
				dataCard.mode = 'trio';
				var motherVariants = [{ genotypeDepth: 1 }, { genotypeDepth: 8 }];
				var fatherVariants = [{ genotypeDepth: '10' }, { genotypeDepth: '5' }];
				window.variantCards = [
					{
						getRelationship: function() { return 'mother'; },
						model: { getVcfDataForGene: jasmine.createSpy().and.returnValue({ features: motherVariants }) }
					},
					{
						getRelationship: function() { return 'father'; },
						model: { getVcfDataForGene: jasmine.createSpy().and.returnValue({ features: fatherVariants }) }
					}
				];
				var vcfData = { features: [] };
				expect(variantModel.determineMaxAlleleCount(vcfData)).toEqual({ features: [], maxAlleleCount: 10 });
				expect(window.variantCards[0].model.getVcfDataForGene).toHaveBeenCalledWith('BRCA1', 'transcript');
				expect(window.variantCards[1].model.getVcfDataForGene).toHaveBeenCalledWith('BRCA1', 'transcript');
			});
		});
	});

	describe('#populateEffectFilters', function() {
		it('sets the snpEffEffects on the filterCard', function() {
			window.filterCard = { snpEffEffects: {} };
			var variants = [{ effect: { EFFECT_1: 'EFFECT_1', EFFECT_2: 'EFFECT_2' } }, { effect: { EFFECT_3: 'EFFECT_3' } }];
			spyOn(variantModel, 'getVcfDataForGene').and.returnValue({ features: variants });
			variantModel.populateEffectFilters();
			expect(window.filterCard.snpEffEffects).toEqual({ EFFECT_1: 'EFFECT_1', EFFECT_2: 'EFFECT_2', EFFECT_3: 'EFFECT_3' });
		});

		it('sets the vepConsequences on the filterCard', function() {
			window.filterCard = { vepConsequences: {} };
			var variants = [{ vepConsequence: { C_1: 'C_1', C_2: 'C_2' } }, { vepConsequence: { C_3: 'C_3' } }];
			spyOn(variantModel, 'getVcfDataForGene').and.returnValue({ features: variants });
			variantModel.populateEffectFilters();
			expect(window.filterCard.vepConsequences).toEqual({ C_1: 'C_1', C_2: 'C_2', C_3: 'C_3' });
		});
	});

	describe('#_determineVariantAfLevels', function() {
		it('sets afExAC to -100 on variants whose allele frequency are not found and intronic to distinguish them', function() {
			var transcript = 'transcript';
			var variant_1 = { afExAC: 0, start: 150, end: 160 };
			var variant_2 = { afExAC: 0, start: 320, end: 330 };
			var variant_3 = { afExAC: 0, start: 410, end: 420 };
			var vcfData = { features: [variant_1, variant_2, variant_3] };
			spyOn(window, 'getCodingRegions').and.returnValue([{ start: 100, end: 200 }, { start: 400, end: 500 }]);
			variantModel._determineVariantAfLevels(vcfData, transcript);
			expect(window.getCodingRegions).toHaveBeenCalledWith('transcript');
			expect(variant_1.afExAC).toEqual(0);
			expect(variant_2.afExAC).toEqual(-100);
			expect(variant_3.afExAC).toEqual(0);
		});

		it('sets afexaclevel and afexaclevels on the variant depending on the afExAC of the variant', function() {
			var transcript = 'transcript';
			var variant_1 = { afExAC: ".0005" };
			var variant_2 = { afExAC: ".05" };
			var variant_3 = { afExAC: -100 };
			var vcfData = { features: [variant_1, variant_2, variant_3] };
			variantModel._determineVariantAfLevels(vcfData, transcript);
			expect(variant_1.afexaclevel).toEqual('afexac_rare');
			expect(variant_1.afexaclevels).toEqual({ 'afexac_superrare': 'afexac_superrare', 'afexac_rare': 'afexac_rare'});
			expect(variant_2.afexaclevel).toEqual('afexac_uncommon');
			expect(variant_2.afexaclevels).toEqual({ 'afexac_uncommon': 'afexac_uncommon' });
			expect(variant_3.afexaclevel).toEqual('afexac_unique_nc');
			expect(variant_3.afexaclevels).toEqual({ 'afexac_unique_nc': 'afexac_unique_nc' });
		});

		it('sets af1000glevel and af1000glevels on the variant depending on the af1000G of the variant', function() {
			var transcript = 'transcript';
			var variant_1 = { af1000G: ".0005" };
			var variant_2 = { af1000G: ".05" };
			var variant_3 = { af1000G: 0 };
			var vcfData = { features: [variant_1, variant_2, variant_3] };
			variantModel._determineVariantAfLevels(vcfData, transcript);
			expect(variant_1.af1000glevel).toEqual('af1000g_rare');
			expect(variant_1.af1000glevels).toEqual({ 'af1000g_superrare': 'af1000g_superrare', 'af1000g_rare': 'af1000g_rare'});
			expect(variant_2.af1000glevel).toEqual('af1000g_uncommon');
			expect(variant_2.af1000glevels).toEqual({ 'af1000g_uncommon': 'af1000g_uncommon' });
			expect(variant_3.af1000glevel).toEqual('af1000g_rare');
			expect(variant_3.af1000glevels).toEqual({
				'af1000g_unique': 'af1000g_unique',
				'af1000g_uberrare': 'af1000g_uberrare',
				'af1000g_superrare': 'af1000g_superrare',
				'af1000g_rare': 'af1000g_rare'
			});
		});
	});
});
