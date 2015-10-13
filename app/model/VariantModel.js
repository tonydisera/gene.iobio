// Create a variant model class
// Constructor
function VariantModel() {
	this.vcf = null;
	this.bam = null;

	this.vcfData = null;
	this.fbData = null;	
	this.bamData = null;

	this.bamUrlEntered = false;
	this.bamFileOpened = false;
	this.getBamRefName = null;
	this.getVcfRefName = null;

	this.name = "";
	this.vcfRefNamesMap = {};
	this.sampleName = "";
	this.defaultSampleName = null;
}


VariantModel.prototype.setLoadState = function(taskName) {
	if (this.vcfData != null) {
		if (this.vcfData.loadState == null) {
			this.vcfData.loadState = {};
		}
		this.vcfData.loadState[taskName] = true;

	}
}

VariantModel.prototype.isLoaded = function() {
	return this.vcf != null && this.vcfData != null;
}

VariantModel.prototype.isReadyToLoad = function() {
	return this.isVcfReadyToLoad() || this.isBamReadyToLoad();
}

VariantModel.prototype.isBamReadyToLoad = function() {
	return this.bam != null && (this.bamUrlEntered || this.bamFileOpened);
}

VariantModel.prototype.isVcfReadyToLoad = function() {
	return this.vcf != null && (this.vcfUrlEntered || this.vcfFileOpened);
}


VariantModel.prototype.isBamLoaded = function() {
	return this.bam && (this.bamUrlEntered || (this.bamFileOpened && this.getBamRefName));
}

VariantModel.prototype.isVcfLoaded = function() {
	return this.vcf && (this.vcfUrlEntered || this.vcfFileOpened);
}

VariantModel.prototype.variantsHaveBeenCalled = function() {
	return this.fbData != null;
}

VariantModel.prototype.hasCalledVariants = function() {
	return this.fbData != null && this.fbData.features != null && this.fbData.features.length > 0;
}

VariantModel.prototype.getVcfData = function() {
	return this.vcfData;
}

VariantModel.prototype.getVariantCount = function() {
	return this.vcfData.features.length != null ? this.vcfData.features.length : "0";
}

VariantModel.prototype.getDangerCounts = function() {
	dangerCounts = {HIGH: 0, MODERATE: 0, MODIFIER: 0, LOW: 0};
	if (this.vcfData == null || this.vcfData.features.length == null) {
		return dangerCounts;
	}
	this.vcfData.features.forEach( function(variant) {
		if (variant.impact['HIGH'] != null) {
			dangerCounts.HIGH++; 
		} else if (variant.impact['MODERATE'] != null) {
			dangerCounts.MODERATE++; 
		} else if (variant.impact['MODIFIER'] != null) {
			dangerCounts.MODIFIER++; 
		} else if (variant.impact['LOW'] != null) {
			dangerCounts.LOW++; 
		} 
	});
	return dangerCounts;
}

VariantModel.prototype.getCalledVariantCount = function() {
	return this.fbData.features.length != null ? this.fbData.features.length : "0";
}

VariantModel.prototype.getBamData = function() {
	return this.bamData;
}

VariantModel.prototype.filterBamDataByRegion = function(regionStart, regionEnd) {
	return this.bamData.filter(function(d) { 
		return (d[0] >= regionStart && d[0] <= regionEnd);
	}); 	
}


VariantModel.prototype.reduceBamData = function(theBamData, numberOfPoints) {
	var factor = d3.round(theBamData.length / numberOfPoints);
	return this.bam.reducePoints(theBamData, 
		                         factor, 
		                         function(d) {
		                         	return d[0]
		                         }, 
		                         function(d) {
		                         	return d[1]
		                         });
}

VariantModel.prototype.getCalledVariants = function(theRegionStart, theRegionEnd) {
	if (theRegionStart && theRegionEnd) {
		var variants = this.fbData.features.filter(function(d) {
							return (d.start >= theRegionStart && d.start <= theRegionEnd);
					   });	
		return {'features': variants};
	} else {
		return this.fbData;
	}
}



VariantModel.prototype.getName = function() {
	return this.name;
}

VariantModel.prototype.setName = function(theName) {
	if (theName) {
		this.name = theName;
	} else {
		return theName;
	}
}

VariantModel.prototype.setRelationship = function(theRelationship) {
	if (theRelationship) {
		this.relationship = theRelationship;
	} else {
		return theRelationship;
	}
}

VariantModel.prototype.getRelationship = function() {
	return this.relationship;
}


VariantModel.prototype.setSampleName = function(sampleName) {
	this.sampleName = sampleName;
}


VariantModel.prototype.getSampleName = function() {
	return this.sampleName;
}


VariantModel.prototype.setDefaultSampleName = function(sampleName) {
	this.defaultSampleName = sampleName;
}


VariantModel.prototype.getDefaultSampleName = function() {
	return this.defaultSampleName;
}



VariantModel.prototype.init = function() {
	var me = this;	

	// init vcf.iobio
	this.vcf = vcfiobio();

};

VariantModel.prototype.promiseBamFilesSelected = function(event) {
	var me = this;
	return new Promise(function(resolve, reject) {
		me.bamData = null;
		me.fbData = null;

		if (event.target.files.length != 2) {
		   alert('must select both a .bam and .bai file');
		   reject(Error('must select both a .bam and .bai file'));
		} else {
			var fileType0 = /[^.]+$/.exec(event.target.files[0].name)[0];
			var fileType1 = /[^.]+$/.exec(event.target.files[1].name)[0];

			if (fileType0 == 'bam' && fileType1 == 'bai') {
			    bamFile = event.target.files[0];
			    baiFile = event.target.files[1];
			} else if (fileType1 == 'bam' && fileType0 == 'bai') {
			    bamFile = event.target.files[1];
			    baiFile = event.target.files[0];
			} else {
			    alert('must select both a .bam and .bai file');
			    reject(Error("must select both a .bam and .bai file"));
			}

			if (bamFile && baiFile) {
				me.bamFileOpened = true;
				me.bam = new Bam( bamFile, { bai: baiFile });

				me.getBamRefName = me._stripRefName;
				resolve(bamFile.name);							
			} else {
				reject(Error('bam and bai file not loaded'));
			}
		}

	});


}

VariantModel.prototype.onBamUrlEntered = function(bamUrl) {
	this.bamData = null;
	this.fbData = null;

	if (bamUrl == null || bamUrl.trim() == "") {
		this.bamUrlEntered = false;
		this.bam = null;

	} else {
	    
		this.bamUrlEntered = true;
		this.bam = new Bam(bamUrl);

	}
    
    this.getBamRefName = this._stripRefName;

}

VariantModel.prototype.promiseVcfFilesSelected = function(event, callbackOnOpen) {
	var me = this;

	return new Promise( function(resolve, reject) {
		me.sampleName = null;
		me.vcfData = null;
		
		me.vcf.openVcfFile( event, function(vcfFile) {

			me.vcfFileOpened = true;
			me.vcfUrlEntered = false;
			me.getVcfRefName = null;

			callbackOnOpen(vcfFile.name);
					
			// Get the sample names from the vcf header
		    me.vcf.getSampleNames( function(sampleNames) {
		    	resolve({'fileName': vcfFile.name, 'sampleNames': sampleNames});
		    });


		});

	});

}

VariantModel.prototype.clearVcf = function() {

	this.vcfData = null;
	this.vcfUrlEntered = false;
	this.vcfFileOpened = false;
	this.sampleName = null;
	window.removeUrl('sample'+this.cardIndex);
	window.removeUrl('vcf'+this.cardIndex);
	this.vcf.clear();


}

VariantModel.prototype.onVcfUrlEntered = function(vcfUrl, callback) {
	var me = this;
	this.vcfData = null;
	var success = true;
	this.sampleName = null;

	if (vcfUrl == null || vcfUrl == '') {
		this.vcfUrlEntered = false;
		success = false;

	} else {
		
	   
	    success = this.vcf.openVcfUrl(vcfUrl);
	    if (success) {
		    this.vcfUrlEntered = true;
		    this.vcfFileOpened = false;	    	
	    } else {
	    	this.vcfUrlEntered = false;
	    }

	}
	if (success) {
    	
	    this.getVcfRefName = null;	
	    // Get the sample names from the vcf header
	    this.vcf.getSampleNames( function(sampleNames) {
	    	callback(success, sampleNames);
	    });
	} else {
		callback(success);

	}


}


VariantModel.prototype._promiseVcfRefName = function() {
	var me = this;
	return new Promise( function(resolve, reject) {

		if (me.getVcfRefName != null) {
			// If we can't find the ref name in the lookup map, show a warning.
			if (me.vcfRefNamesMap[me.getVcfRefName(window.gene.chr)] == null) {
				reject();
			} else {
				resolve();
			}
		} else {
			me.vcfRefNamesMap = {};
			if (me.vcf.isFile()) {
				me.vcf.getReferenceNames(function(refNames) {
					var foundRef = false;
					refNames.forEach( function(refName) {					
			    		if (me.getVcfRefName == null) {
					 		if (refName == window.gene.chr) {
					 			me.getVcfRefName = me._getRefName;
					 			foundRef = true;
					 		} else if (refName == me._stripRefName(gene.chr)) {
					 			me.getVcfRefName = me._stripRefName;
					 			foundRef = true;
					 		}
						}
			    	});
			    	// Load up a lookup table.  We will use me for validation when
			    	// a new gene is loaded to make sure the ref exists.
			    	if (foundRef) {
			    		refNames.forEach( function(refName) {
			    			var theRefName = me.getVcfRefName(refName);
			    			me.vcfRefNamesMap[theRefName] = refName; 
			    		});
			    		resolve();
			    	} else  {

			    	// If we didn't find the matching ref name, show a warning.
						reject();
					}

				});

			} else {

				me.vcf.loadRemoteIndex(null, function(refData) {
					var foundRef = false;
			    	refData.forEach( function(ref) {
			    		if (me.getVcfRefName == null) {
					 		if (ref.name == window.gene.chr) {
					 			me.getVcfRefName = me._getRefName;
					 			foundRef = true;
					 		} else if (ref.name == me._stripRefName(gene.chr)) {
					 			me.getVcfRefName = me._stripRefName;
					 			foundRef = true;
					 		}
						}
			    	});
			    	// Load up a lookup table.  We will use me for validation when
			    	// a new gene is loaded to make sure the ref exists.
			    	if (foundRef) {
			    		refData.forEach( function(ref) {
			    			var theRefName = me.getVcfRefName(ref.name);
			    			me.vcfRefNamesMap[theRefName] = ref.name; 
			    		});
			    		resolve();

			    	} else {
			    		reject();
					} 
		    	});
			} 		
		}
	});

}



VariantModel.prototype._getRefName = function(refName) {
	return refName;
}

VariantModel.prototype._stripRefName = function(refName) {
	var tokens = refName.split("chr");
	var strippedName = refName;
	if (tokens.length > 1) {
		strippedName = tokens[1];
	} else {
		tokens = refName.split("ch");
		if (tokens.length > 1) {
			strippedName = tokens[1];
		}
	}
	return strippedName;
}


VariantModel.prototype.getMatchingVariant = function(variant) {
	var matchingVariant = null;
	if (this.vcfData && this.vcfData.features) {

		this.vcfData.features.forEach( function( v ) {
			if (v.start == variant.start 
	          && v.end == variant.end 
	          && v.ref == variant.ref 
	          && v.alt == variant.alt 
	          && v.type.toLowerCase() == variant.type.toLowerCase()) {
	          matchingVariant = v;
	       }
		});
	}
	return matchingVariant;
}


/*
 * Load variant data only (for unaffected sibs). 
 * no variant card display
 */
VariantModel.prototype.loadVariantsOnly = function(callback) {
	var me = this;
	this.getVariants( regionStart, regionEnd, function() {
		callback(me);
	} );
}


/* 
* A gene has been selected. Clear out the model's state
* in preparation for getting data.
*/
VariantModel.prototype.wipeGeneData = function () {
	var me = this;
	this.vcfData = null;
	this.fbData = null;
	this.bamData = null;
}



VariantModel.prototype.getBamDepth = function(regionStart, regionEnd, callbackDataLoaded) {	
	var me = this;


	if (!this.isBamLoaded()) {		
		if (callbackDataLoaded) {
			callbackDataLoaded();
		}
		return;
	}


	// A gene has been selected.  Read the bam file to obtain
	// the read converage.
	var refName = this.getBamRefName(window.gene.chr);


	var regions = [];
	if (me.vcfData != null) {
		me.flagDupStartPositions(me.vcfData.features);
		if (me.vcfData) {
			me.vcfData.features.forEach( function(variant) {
				if (!variant.dup) {
					regions.push({name: refName, start: variant.start - 1, end: variant.start });
				}
			});
		}

	}

	// Get the coverage data for the gene region
	me.bam.getCoverageForRegion(refName, window.gene.start, window.gene.end, regions, 5000, 
 	  function(coverageForRegion, coverageForPoints) {

		me.bamData = coverageForRegion;

		if (regions.length > 0) {
			me._refreshVariantsWithCoverage(coverageForPoints, function() {				
				if (callbackDataLoaded) {
			   	    callbackDataLoaded(me.bamData);
		   	    }
			});				
		} else {
			if (callbackDataLoaded) {
		   	    callbackDataLoaded(me.bamData);
	   	    }
		}
	});



}



VariantModel.prototype.promiseAnnotated = function() {
	var me = this;
	return new Promise( function(resolve, reject) {
		if (me.vcfData != null &&
			me.vcfData.features != null &&
			me.vcfData.loadState != null &&
		   (dataCard.mode == 'single' || me.vcfData.loadState['inheritance'] == true) &&
			me.vcfData.loadState['clinvar'] == true ) {

			resolve();

		} else {
			reject();
		}

	});

}

VariantModel.prototype.promiseAnnotatedAndCoverage = function() {
	var me = this;
	return new Promise( function(resolve, reject) {
		if (me.vcfData != null &&
			me.vcfData.features != null &&
			me.vcfData.loadState != null &&
		   (dataCard.mode == 'single' || me.vcfData.loadState['inheritance'] == true) &&
			me.vcfData.loadState['clinvar'] == true  &&
			(!me.isBamLoaded() || me.vcfData.loadState['coverage'] == true)) {

			resolve();

		} else {
			reject();
		}

	});

}

VariantModel.prototype.promiseGetAnnotatedVariants = function(onVcfData) {
	var me = this;

	return new Promise( function(resolve, reject) {

		me.vcf.promiseGetVariants(
		   me.getVcfRefName(window.gene.chr), 
		   window.gene.start, 
	       window.gene.end, 
	       window.gene.strand, 
	       window.selectedTranscript,
	       me.sampleName 
	    ).then( function(data) {

	    	var annotatedRecs = data[0];
	    	me.vcfData = data[1];

	    	if (onVcfData) {
	    		onVcfData();
	    	}

	    	if (me.getRelationship() != 'sibling') {
		    	// Now get clinvar annotations
		    	return me.vcf.promiseGetClinvarRecords(
		    		me.vcfData.features, 
		    		me._stripRefName(window.gene.chr), regionStart, regionEnd, 
		    		me._refreshVariantsWithClinvar.bind(me));

	    	} else {
	    		return new Promise( function(resolve, reject) {
	    			resolve();
	    		});
	    	}			
	    }, 
	    function(error) {
	    	// If error when getting clinvar records	    	
	    	console.log("an error occurred when getting clinvar records " + error);
	    	reject();

	    }).then( function() {
	    	// We are done getting clinvar records.
	    	me.setLoadState('clinvar');
	    	resolve(me.vcfData);
	    }, 
	    function(error) {
	    	console.log("an error occurred after getting clinvar records " + error);
	    	reject();
	    });


	});


}

VariantModel.prototype.promiseGetVariants = function(regionStart, regionEnd, onVcfData) {
	var me = this;

	return new Promise( function(resolve, reject) {

		// A gene has been selected.  Read the variants for the gene region.
		me._promiseVcfRefName().then( function() {
			me.promiseGetAnnotatedVariants(onVcfData).then( function(data) {
		    	me.vcfData = data;

		        if (me.vcfData != null && me.vcfData.features != null && me.vcfData.features.length > 0) {
					// We have the AFs from 1000G and ExAC.  Now set the level so that variants
				    // can be filtered by range.
				    me._determineVariantAfLevels(me.vcfData);

				    // Show the snpEff effects / vep consequences in the filter card
				    me._populateEffectFilters(me.vcfData.features);

					determineInheritance();

					resolve(me.vcfData);

				} else {
					reject('Error getting annotated variants');
				}

		    }, function(error) {
		    	reject(error);
		    });
		}, function(error) {
			reject("missing reference")
		});


	});

}

VariantModel.prototype.determineUnaffectedSibsStatus = function() {
	this.vcfData.features.forEach( function(variant) {
		 variant.ua = "none";
		 if (variant.inheritance != null && variant.inheritance.toLowerCase() == 'recessive' && variant.uasibsZygosity) {
		 	 var matchesCount = 0;
		 	 var matchesHomCount = 0;
			 Object.keys(variant.uasibsZygosity).forEach( function(key) {
			 	matchesCount++;
			 	var sibZygosity = variant.uasibsZygosity[key];
			 	if (sibZygosity != null && sibZygosity.toLowerCase() == 'hom') {
				 	matchesHomCount++;
			 	}
			 });

			 if (matchesHomCount > 0 ) {
			 	variant.ua = "none";
			 } else {
			 	variant.ua = "not_recessive_in_sibs";
			 }  	 	 
		 } 
	});

}

VariantModel.prototype.determineMaxAlleleCount = function() {
	if (this.vcfData == null || this.vcfData.features == null) {
		return;
	}

	var maxAlleleCount = 0;
	var setMaxAlleleCount = function(refCount, altCount) {
		if (refCount != null && altCount != null) {
			if ((+refCount + +altCount) > maxAlleleCount) {
				maxAlleleCount = +refCount + +altCount;
			}
		}
	};

	this.vcfData.features.forEach(function(variant) {
		setMaxAlleleCount(variant.genotypeRefCount, variant.genotypeAltCount);
		setMaxAlleleCount(variant.genotypeRefCountMother, variant.genotypeAltCountMother);
		setMaxAlleleCount(variant.genotypeRefCountFather, variant.genotypeAltCountFather);
	});
	this.vcfData.maxAlleleCount = maxAlleleCount;	
}

VariantModel.prototype._populateEffectFilters  = function(variants) {
	variants.forEach( function(variant) {
		for (effect in variant.effect) {
			filterCard.snpEffEffects[effect] = effect;
		}
		for (vepConsequence in variant.vepConsequence) {
			filterCard.vepConsequences[vepConsequence] = vepConsequence;
		}
	});	
}



VariantModel.prototype._determineVariantAfLevels = function(theVcfData) {
	var me = this;
    // Post processing:
    // We have the af1000g and afexac, so now determine the level for filtering
    // by range.  
    theVcfData.features.forEach(function(variant) {
    	// For ExAC levels, differentiate between af not found and in 
    	// coding region (level = private) and af not found and intronic (non-coding) 
    	// region (level = unknown)
    	if (variant.afExAC == 0) {
        	window.selectedTranscriptCodingRegions.forEach(function(codingRegion) {
        		if (variant.start >= codingRegion.start && variant.end <= codingRegion.end) {		        			
        		} else {
        			variant.afExAC = -100;
        		}
        	});
    	}

		matrixCard.afExacMap.forEach( function(rangeEntry) {
			if (+variant.afExAC > rangeEntry.min && +variant.afExAC <= rangeEntry.max) {
				variant.afexaclevel = rangeEntry.clazz;
			}
		});
		matrixCard.af1000gMap.forEach( function(rangeEntry) {
			if (+variant.af1000G > rangeEntry.min && +variant.af1000G <= rangeEntry.max) {
				variant.af1000glevel = rangeEntry.clazz;
			}
		});


	});

}



VariantModel.prototype._pileupVariants = function(features, start, end) {
	var me = this;
	var width = 1000;
	var theFeatures = features;
	theFeatures.forEach(function(v) {
		v.level = 0;
	});

	var featureWidth = 4;
	var posToPixelFactor = Math.round((end - start) / width);
	var maxLevel = this.vcf.pileupVcfRecords(theFeatures, window.gene.start, posToPixelFactor, featureWidth + 1);


	if ( maxLevel > 30) {
		for( var i = 1; i < posToPixelFactor; i++) {
			// TODO:  Devise a more sensible approach to setting the min width.  We want the 
			// widest width possible without increasing the levels beyond 30.
			if (i > 4) {
				featureWidth = 1;
			} else if (i > 3) {
				featureWidth = 2;
			} else if (i > 2) {
				featureWidth = 3;
			} else {
				featureWidth = 4;
			}

			features.forEach(function(v) {
		  		v.level = 0;
			});
			var factor = posToPixelFactor / (i * 2);
			maxLevel = me.vcf.pileupVcfRecords(theFeatures, start, factor, featureWidth + 1);
			if (maxLevel <= 50) {
				i = posToPixelFactor;
				break;
			}
		}
	}
	return { 'maxLevel': maxLevel, 'featureWidth': featureWidth };
}


VariantModel.prototype.flagDupStartPositions = function(variants) {
	// Flag variants with same start position as this will throw off comparisons
 	for (var i =0; i < variants.length - 1; i++) {
        var variant = variants[i];
        var nextVariant = variants[i+1];
        if (i == 0) {
          variant.dup = false;
        }
        nextVariant.dup = false;

        if (variant.start == nextVariant.start) {
        	nextVariant.dup = true;
	    }
	}
	
}

VariantModel.prototype._refreshVariantsWithCoverage = function(coverage, callback) {
	var me = this;
	var vcfIter = 0;
	var covIter = 0;
	if (this.vcfData == null) {
		callback();
	}
	var recs = this.vcfData.features;
	
    me.flagDupStartPositions(recs);
	
	for( var vcfIter = 0, covIter = 0; vcfIter < recs.length; null) {
		// Bypass duplicates
		if (recs[vcfIter].dup) {
			recs[vcfIter].bamDepth = recs[vcfIter-1].bamDepth;
			vcfIter++;
		}
      	if (covIter >= coverage.length) {
      		recs[vcfIter].bamDepth = "";
      		vcfIter++;
      	} else {
			var coverageRow = coverage[covIter];
			var coverageStart = coverageRow[0];
			var coverageDepth = coverageRow[1];

			// compare curr variant and curr clinVar record
			if (recs[vcfIter].start == coverageStart) {			
				recs[vcfIter].bamDepth = +coverageDepth;
				vcfIter++;
				covIter++;
			} else if (recs[vcfIter].start < coverageStart) {	
				recs[vcfIter].bamDepth = "";
				vcfIter++;
			} else {
				console.log("no variant corresponds to coverage at " + coverageStart);
				covIter++;
			}

      	}
	}
	callback();


}

VariantModel.prototype._refreshVariantsWithClinvar = function(clinVars) {	
	var me = this;
	var clinVarIds = clinVars.uids;

	var loadClinvarProperties = function(recs) {
		for( var vcfIter = 0, covIter = 0; vcfIter < recs.length && covIter < clinVarIds.length; null) {
			var uid = clinVarIds[covIter];
			var clinVarStart = clinVars[uid].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].start;
			var clinVarAlt   = clinVars[uid].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].alt;
			var clinVarRef   = clinVars[uid].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].ref;

			
			// compare curr variant and curr clinVar record
			if (recs[vcfIter].clinvarStart == clinVarStart) {			
				// add clinVar info to variant if it matches
				if (recs[vcfIter].clinvarAlt == clinVarAlt &&
					recs[vcfIter].clinvarRef == clinVarRef) {
					me._addClinVarInfoToVariant(recs[vcfIter], clinVars[uid]);
				}
				vcfIter++;
				covIter++;
			} else if (recs[vcfIter].start < clinVarStart) {						
				vcfIter++;
			} else {
				covIter++;
			}
		}
	}

	// Load the clinvar info for the variants loaded from the vcf
	var recs = this.vcfData.features.sort(orderVariantsByPosition);
	loadClinvarProperties(recs);

}


VariantModel.prototype._addClinVarInfoToVariant = function(variant, clinvar) {		
	variant.clinVarUid = clinvar.uid;

	if (!variant.clinVarAccession) {
		variant.clinVarAccession = clinvar.accession;
	}

	var clinSigObject = variant.clinVarClinicalSignificance;
	if (clinSigObject == null) {
		variant.clinVarClinicalSignificance = {"none": "Y"};
	}

	var clinSigString = clinvar.clinical_significance.description;
	var clinSigTokens = clinSigString.split(", ");
	clinSigTokens.forEach( function(clinSigToken) {
		if (clinSigToken != "") {		
			// Replace space with underlink
			clinSigToken = clinSigToken.split(" ").join("_").toLowerCase();
			variant.clinVarClinicalSignificance[clinSigToken] = 'Y';

			// Get the clinvar "classification" for the highest ranked clinvar 
			// designation. (e.g. "pathologic" trumps "benign");
			var mapEntry = matrixCard.clinvarMap[clinSigToken];
			if (mapEntry != null) {
				if (variant.clinvarRank == null || 
					mapEntry.value < variant.clinvarRank) {
					variant.clinvarRank = mapEntry.value;
					variant.clinvar = mapEntry.clazz;
				}
			}		
		}

	});



	var phenotype = variant.clinVarPhenotype;
	if (phenotype == null) {
		variant.clinVarPhenotype = {};
	}

	var phTokens = clinvar.trait_set.map(function(d) { return d.trait_name; }).join ('; ')
	if (phTokens != "") {
		var tokens = phTokens.split("; ");
		tokens.forEach(function(phToken) {
			// Replace space with underlink
			phToken = phToken.split(" ").join("_");
			variant.clinVarPhenotype[phToken.toLowerCase()] = 'Y';
		});
	}
}


VariantModel.prototype.promiseCallVariants = function(regionStart, regionEnd, onVariantsCalled, onVariantsAnnotated) {
	var me = this;


	return new Promise( function(resolve, reject) {


		// If we don't have alignments, return.
		if (me.bam == null || me.getBamRefName == null) {
			resolve();
		} else if (me.getRelationship() == 'sibling') {
			resolve();
		} else {

			var refName = window.gene.chr;
			me.fbData = null;
			if (!me.isVcfLoaded()) {
				me.vcfData = null;
			}

			// Call Freebayes variants
			me.bam.getFreebayesVariants(refName, 
				window.gene.start, 
				window.gene.end, 
				window.gene.strand, 
				function(data) {

				if (data == null || data.length == 0) {
					reject();
				}

				// Parse string into records
				var fbRecs = [];
				var recs = data.split("\n");
				recs.forEach( function(rec) {
					fbRecs.push(rec);
				});
				

				// Reset the featurematrix load state so that after freebayes variants are called and
				// integrated into vcfData, we reload the feature matrix.
				if (me.isVcfLoaded()) {
					if (me.vcfData.loadState != null && me.vcfData.loadState['featurematrix']) {
						me.vcfData.loadState['featurematrix'] = null;
					}					
				} 

				if (onVariantsCalled) {
					onVariantsCalled();
				}

				// Annotate the fb variants
				me.vcf.promiseAnnotateVcfRecords(fbRecs, me.getBamRefName(refName), window.gene.start, window.gene.end, 
					window.gene.strand, window.selectedTranscript, me.sampleName)
			    .then( function(data) {

			    	var annotatedRecs = data[0];
			    	me.fbData = data[1];

			    	// Flag the called variants
				   	me.fbData.features.forEach( function(feature) {
				   		feature.fbCalled = 'Y';
				   	});

					// We may have called variants that are slightly outside of the region of interest.
					// Filter these out.
					if (window.regionStart != null && window.regionEnd != null ) {	
						me.fbData.features = me.fbData.features.filter( function(d) {
							meetsRegion = (d.start >= window.regionStart && d.start <= window.regionEnd);
							return meetsRegion;
						});
					}	

			    	// We are done getting the clinvar data for called variants.
			    	// Now merge called data with variant set and display.
					// Prepare vcf and fb data for comparisons
					me._prepareVcfAndFbData();

					// Determine allele freq levels
		        	me._determineVariantAfLevels(me.fbData);

		        	// Filter the freebayes variants to only keep the ones
		        	// not present in the vcf variant set.
					me._determineUniqueFreebayesVariants();


		        	// Show the snpEff effects / vep consequences in the filter card
					me._populateEffectFilters(me.fbData.features);

					// Once all variant cards have freebayes variants,
					// the app will determine in the inheritance mode
					// for the freebayes variants
					determineInheritance(promiseFullTrioCalledVariants);

					if (onVariantsAnnotated) {
						onVariantsAnnotated(me.fbData);
					}
					
					// Now get the clinvar data		    	
		    		return me.vcf.promiseGetClinvarRecords(
					    		me.fbData.features, 
					    		me._stripRefName(window.gene.chr), regionStart, regionEnd, 
					    		me._refreshVariantsWithClinvar.bind(me));



			    }, function(error) {
			    	reject('Error occurred when getting clinvar records:' + error);
			    })
			    .then (function() {

					// The variant records in vcfData have updated clinvar and inheritance info.
					// Reflect me new info in the freebayes variants.
					me.fbData.features.forEach(function (fbVariant) {
						if (fbVariant.source) {
							fbVariant.inheritance                 = fbVariant.source.inheritance;

							fbVariant.clinVarUid                  = fbVariant.source.clinVarUid;
							fbVariant.clinVarClinicalSignificance = fbVariant.source.clinVarClinicalSignificance;
							fbVariant.clinVarAccession            = fbVariant.source.clinVarAccession;
							fbVariant.clinvarRank                 = fbVariant.source.clinvarRank;
							fbVariant.clinvar                     = fbVariant.source.clinvar;
							fbVariant.clinVarPhenotype            = fbVariant.source.clinVarPhenotype;

							fbVariant.genotypeRefCountMother      = fbVariant.source.genotypeRefCountMother;
							fbVariant.genotypeAltCountMother      = fbVariant.source.genotypeAltCountMother;
							fbVariant.genotypeDepthMother         = fbVariant.source.genotypeDepthMother;
							fbVariant.genotypeRefCountFather      = fbVariant.source.genotypeRefCountFather;
							fbVariant.genotypeAltCountFather      = fbVariant.source.genotypeAltCountFather;
							fbVariant.genotypeDepthFather         = fbVariant.source.genotypeDepthFather;
							fbVariant.uasibsZygosity              = fbVariant.source.uasibsZygosity;
						}
						
					});	    	
					resolve(me.fbData);
			
			    	
			    }, function(error) {
			    	reject('An error occurred when getting clinvar recs for called variants: ' + error);
			    });
			
			});			
		}

	});


} 


VariantModel.prototype._prepareVcfAndFbData = function() {
	var me = this;
	// Deal with case where no variants were called
	if (!me.isVcfLoaded()) {
		// If no variants are loaded, create a dummy vcfData with 0 features
		me.vcfData = $.extend({}, me.fbData);
		me.vcfData.features = [];
		me.setLoadState('clinvar');
		me.setLoadState('coverage');
		me.setLoadState('inheritance');
	}
	// Flag the variants as called by Freebayes and add unique to vcf
	// set
	me.vcfData.features = me.vcfData.features.filter( function(feature) {
   		return feature.fbCalled == null;
   	});

	// This may not be the first time we call freebayes, so to
	// avoid duplicate variants, get rid of the ones
	// we added last round.					
	me.vcfData.features = me.vcfData.features.filter( function(d) {
		return d.consensus != 'unique2';
	});	

}


VariantModel.prototype._determineUniqueFreebayesVariants = function() {
	var me = this;

	// We have to order the variants in both sets before comparing
	me.vcfData.features = me.vcfData.features.sort(orderVariantsByPosition);					
	me.fbData.features  = me.fbData.features.sort(orderVariantsByPosition);

	// Compare the variant sets, marking the variants as unique1 (only in vcf), 
	// unique2 (only in freebayes set), or common (in both sets).	
	if (me.isVcfLoaded()) {
		// Compare fb data to vcf data
		me.vcf.compareVcfRecords(me.vcfData, me.fbData);

		// Add unique freebayes variants to vcfData
    	me.fbData.features = me.fbData.features.filter(function(d) {
    		return d.consensus == 'unique2';
    	});
	} 


	// Add the unique freebayes variants to vcf data to include 
	// in feature matrix
	me.fbData.features.forEach( function(v) {
		var variantObject = $.extend({}, v);
   		me.vcfData.features.push(variantObject);
   		v.source = variantObject;
   	});

   	// Figure out max level (lost for some reason)
   	var maxLevel = 1;
   	me.vcfData.features.forEach(function(feature) {
   		if (feature.level > maxLevel) {
   			maxLevel = feature.level;
   		}
   	});
   	me.vcfData.maxLevel = maxLevel;

    pileupObject = me._pileupVariants(me.fbData.features, gene.start, gene.end);
	me.fbData.maxLevel = pileupObject.maxLevel + 1;
	me.fbData.featureWidth = pileupObject.featureWidth;
}



VariantModel.prototype.filterFreebayesVariants = function(filterObject) {
	if (this.fbData != null) {
		return  this.filterVariants(this.fbData, filterObject)
	} else {
		return null;
	}
}



VariantModel.prototype.filterVariants = function(data, filterObject) {
	var me = this;

	if (filterObject.afScheme == 'exac') {
		afField = "afExAC";
	} else {
		afField = "af1000G";
	}

	var afLowerVal = filterObject.afMin;
	var afUpperVal = filterObject.afMax;

	var coverageMin = null;
	if (filterObject.coverageMin != null && filterObject.coverageMin != '') {
		coverageMin = +filterObject.coverageMin;
	}
	   
	var filteredFeatures = data.features.filter(function(d) {

		var meetsRegion = true;
		if (window.regionStart != null && window.regionEnd != null ) {			
			meetsRegion = (d.start >= window.regionStart && d.start <= window.regionEnd);
		}

		var meetsAf = false;
		// Treat null and blank af as 0
		if (d[afField] == null || d[afField] == '') {
			variantAf = 0;
		} else {
			variantAf = d[afField];
		}
		if (afLowerVal != null && afUpperVal != null) {
			if (afLowerVal <= 0 && afUpperVal == 1) {
				meetsAf = true;
			} else {
				
				meetsAf =  (variantAf >= afLowerVal && variantAf <= afUpperVal);
			}
		} else {
			meetsAf = true;
		}

		// Evaluate the coverage for the variant to see if it meets min.
		var meetsCoverage = true;
		if (coverageMin && coverageMin > 0) {
			if (d.bamDepth != null && d.bamDepth != '') {
				meetsCoverage = d.bamDepth >= coverageMin;
			} else if (d.genotypeDepth != null && d.genotypeDepth != '') {
				meetsCoverage = d.genotypeDepth >= coverageMin;
			}  
		}

		// Iterate through the clicked annotations for each variant. The variant
		// needs to match needs to match
		// at least one of the selected values (e.g. HIGH or MODERATE for IMPACT)
		// for each annotation (e.g. IMPACT and ZYGOSITY) to be included.
		var matchCount = 0;
		var evalAttributes = {};
		for (key in filterObject.annotsToInclude) {
			var annot = filterObject.annotsToInclude[key];
			if (annot.state) {
				if (evalAttributes[annot.key] == null) {
					evalAttributes[annot.key] = 0;
				}

				var annotValue = d[annot.key] ? d[annot.key] : '';				
				var match = false;
				if (matrixCard.isDictionary(annotValue)) {
					for (avKey in annotValue) {
						if (avKey.toLowerCase() == annot.value.toLowerCase()) {
							match = true;
						}
					}
				} else  if (annotValue.toLowerCase() == annot.value.toLowerCase()){
					match = true;
				}
				if (match) {
					var count = evalAttributes[annot.key];
					count++;
					evalAttributes[annot.key] = count;
				}
			} else {
			}
		}

		// If zero annots to evaluate, the variant meets the criteria.
		// If annots are to be evaluated, the variant must match
		// at least one value for each annot to consider.
		var meetsAnnot = true;
		for (key in evalAttributes) {
			var count = evalAttributes[key];
			if (count == 0) {
				if (key == 'inheritance' && me.getRelationship() != 'proband') {
 					// bypass filtering on inheritance if non-proband variant card
 				} else {
					meetsAnnot = false;
 				}
			}
		}


		return meetsRegion && meetsAf && meetsCoverage && meetsAnnot;
	});

	
	var pileupObject = this._pileupVariants(filteredFeatures, 
		regionStart ? regionStart : window.gene.start, 
		regionEnd   ? regionEnd   : window.gene.end);		

	var vcfDataFiltered = {	count: data.count,
							countMatch: data.countMatch,
							countUnique: data.countUnique,
							sampleCount : data.sampleCount,
							end: regionEnd,
							features: filteredFeatures,
							maxLevel: pileupObject.maxLevel + 1,
							featureWidth: pileupObject.featureWidth,
							name: data.name,
							start: regionStart,
							strand: data.strand,							
							variantRegionStart: regionStart
						};
	return vcfDataFiltered;
}



VariantModel.prototype.promiseCompareVariants = function(theVcfData, compareAttribute, matchAttribute, matchFunction, noMatchFunction ) {
	var me = this;

	return new Promise( function(resolve, reject) {
		if (me.vcfData == null) {
			me._promiseVcfRefName().then( function() {

				me.vcf.promiseGetVariants(
					 me.getVcfRefName(window.gene.chr), 
					 window.gene.start, 
					 window.gene.end, 
					 window.gene.strand, 
					 window.selectedTranscript,
					 me.sampleName)
				.then( function(data) {
					var annotatedRecs = data[0];
			    	me.vcfData = data[1];

				 	me.vcfData.features = me.vcfData.features.sort(orderVariantsByPosition);
					me.vcfData.features.forEach( function(feature) {
						feature[compareAttribute] = '';
					});
					me.vcf.compareVcfRecords(theVcfData, me.vcfData, compareAttribute, matchFunction, noMatchFunction); 	
					resolve();							 	
				}, function(error) {
					console.log('promiseCompareVariants() error: ' + error);
				});
			}, function(error) {
				console.log("cannot find reference for gene");
				reject("missing reference");
			});
		
		} else {
			me.vcfData.features = me.vcfData.features.sort(orderVariantsByPosition);
			if (compareAttribute) {
				me.vcfData.features.forEach( function(feature) {			
					feature[compareAttribute] = '';
				});			
			}
			me.vcf.compareVcfRecords(theVcfData, me.vcfData, compareAttribute, matchFunction, noMatchFunction); 
			resolve();	
		}

	});


}




