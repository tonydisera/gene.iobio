describe('variantModel', function() {
	var variantModel, dataCopy, filterObjectCopy;
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
			end: 17715767,
			features: [variant_1, variant_2, variant_3, variant_4, variant_5],
			gene: {},
			hetCount: 15,
			homCount: 18,
			intronsExcludedCount: 0,
			loadState: {},
			name: "vcf track",
			ref: "17",
			sampleCount: 2,
			start: 17583787,
			strand: "+",
			transcript: {},
			variantRegionStart: 17583787,
		}

		filterObject = {
			'coverageMin': 100,
			'afMin': 0,
			'afMax': 1,
			'afScheme' : "exac",
			'annotsToInclude': {},
			'exonicOnly': false
	  };

		variantModel = new VariantModel();
		window.regionStart = null;
		window.regionEnd = null;
		variantModel.setRelationship('proband');
	});

	describe('#filterVariants', function() {
		beforeEach(function() {
			spyOn(variantModel, '_pileupVariants').and.returnValue({ maxLevel: 10, featureWidth: 100 });
		});

		it('removes all the variants that have a zygosity of homref', function() {
			variantModel._pruneHomRefVariants(data);
			expect(data.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
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
			window.regionStart = 5;
			window.regionEnd = 10;
			variant_1.start = 5;
			variant_2.start = 8;
			variant_3.start = 12;
			variant_4.start = 1;
			var filteredData = variantModel.filterVariants(data, filterObject);
			expect(filteredData.features).toEqual([variant_1, variant_2]);
		});

		describe('when filtering out variants that do not meet the specifed afExAC allele frequency', function() {
			it('filters out variants that are not in the specified range', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.8;
				filterObject.afMin = 0.6;
				filterObject.afMax = 1;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_4]);
			});

			it('treats null and blank string allele frequencies as 0', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.9;
				filterObject.afMin = 0;
				filterObject.afMax = 0.7;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3]);
			});

			it('defaults to keeping all variants when afMin and afMax in the filterObject are null', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.9;
				filterObject.afMin = null;
				filterObject.afMax = null;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});

			it('defaults to keeping all variants when afMin and afMax in the filterObject are NaN', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.9;
				filterObject.afMin = NaN;
				filterObject.afMax = NaN;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});

			it('defaults to keeping all variants when afMin and afMax in the filterObject are 0 and 1, respectively', function() {
				variant_1.afExAC = null;
				variant_2.afExAC = '';
				variant_3.afExAC = 0.5;
				variant_4.afExAC = 0.9;
				filterObject.afMin = 0;
				filterObject.afMax = 1;
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(filteredData.features).toEqual([variant_1, variant_2, variant_3, variant_4]);
			});
		});

		describe('when filtering out variants that do not meet the specifed af1000G allele frequency', function() {
			it('filters out variants that are not in the specified range', function() {
				filterObject.afScheme = "1000g";
				variant_1.af1000G = null;
				variant_2.af1000G = '';
				variant_3.af1000G = 0.5;
				variant_4.af1000G = 0.8;
				filterObject.afMin = 0.6;
				filterObject.afMax = 1;
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
					variant_1.vepImpact = { HIGH: 'HIGH' };
					variant_2.vepImpact = { MODERATE: 'MODERATE' };
					variant_3.vepImpact = { LOW: 'LOW' };
					variant_3.vepConsequence = { EXON: 'EXON' };
					variant_4.vepImpact = { LOW: 'LOW' };
					var filteredData = variantModel.filterVariants(data, filterObject);
					expect(filteredData.features).toEqual([variant_1, variant_2, variant_3]);
				});
			});

			it('increments the intronsExcludedCount in the data for each variant that does not meet the exonic only filter', function() {
				filterCard.annotationScheme = 'snpeff';
				variant_1.impact = { HIGH: 'HIGH' };
				variant_2.impact = { MODERATE: 'MODERATE' };
				variant_3.impact = { LOW: 'LOW' };
				variant_3.effect = { EXON: 'EXON' };
				variant_4.impact = { LOW: 'LOW' };
				var filteredData = variantModel.filterVariants(data, filterObject);
				expect(data.intronsExcludedCount).toEqual(1);
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
});
