// Create a variant model class
// Constructor
function VariantModel() {
	this.vcf = null;
	this.bam = null;

	this.vcfData = null;
	this.fbData = null;	
	this.bamData = null;

	this.vcfUrlEntered = false;
	this.vcfFileOpened = false;
	this.getVcfRefName = null;

	this.bamUrlEntered = false;
	this.bamFileOpened = false;
	this.getBamRefName = null;

	this.name = "";
	this.vcfRefNamesMap = {};
	this.sampleName = "";
	this.defaultSampleName = null;
	this.relationship = null;
	this.affectedStatus = null;

	this.GET_RSID = false;
	this.GET_HGVS = false;
}


VariantModel.prototype.setLoadState = function(theVcfData, taskName) {
	if (theVcfData != null) {
		if (theVcfData.loadState == null) {
			theVcfData.loadState = {};
		}
		theVcfData.loadState[taskName] = true;
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

VariantModel.prototype.getVcfDataForGene = function(geneObject, selectedTranscript) {
	var me = this;
	var data = null;
	
	if (me.vcfData != null) {
		if (me.getVcfRefName(geneObject.chr) == me.vcfData.ref &&
			geneObject.start == me.vcfData.start &&
			geneObject.end == me.vcfData.end &&
			geneObject.strand == me.vcfData.strand) {
			data = me.vcfData;
		}		
	} 

	if (data == null) {
		// Find in cache
		data = this._getCachedData("vcfData", geneObject.gene_name, selectedTranscript);
		if (data != null && data != '') {
			me.vcfData = data;
		}
	} 


	return data;
}
VariantModel.prototype.getBamDataForGene = function(geneObject) {
	var me = this;
	var data = null;
	
	if (me.bamData != null) {
		if (me.getBamRefName(geneObject.chr) == me.bamData.ref &&
			geneObject.start == me.bamData.start &&
			geneObject.end == me.bamData.end) {
			data = me.bamData;
		}		
	} 

	if (data == null) {
		// Find in cache
		data = this._getCachedData("bamData", geneObject.gene_name, null);
		if (data != null && data != '') {
			me.bamData = data;
		}
	} 
	return data ? data.coverage : null;
}
VariantModel.prototype.getVariantCount = function() {
	var theVcfData = this.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (theVcfData == null || theVcfData.features == null) {
		return "0";
	} else {
		return theVcfData.features.length != null ? theVcfData.features.length : "0";
	}
}

VariantModel.prototype.summarizeDanger = function(theVcfData) {
	dangerCounts = {};
	if (theVcfData == null || theVcfData.features.length == null) {
		console.log("unable to summarize danger due to null data");
		return dangerCounts;
	}
	var siftClasses = {};
	var polyphenClasses = {};
	var clinvarClasses = {};
	var impactClasses = {};
	var consequenceClasses = {};
	var inheritanceClasses = {};
	theVcfData.features.forEach( function(variant) {
	    for (key in variant.highestImpactSnpeff ) {
	    	if (matrixCard.impactMap.hasOwnProperty(key) && matrixCard.impactMap[key].badge == true) {
	    		var types = impactClasses[key];
	    		if (types == null) {
	    			types = {};
	    		}
	    		var effectObject = variant.highestImpactSnpeff[key];
	    		types[variant.type] = effectObject; // key = effect, value = transcript id
	    		impactClasses[key] = types;	

	    	}
	    }
	    for (key in variant.highestImpactVep ) {
	    	if (matrixCard.impactMap.hasOwnProperty(key) && matrixCard.impactMap[key].badge == true) {
	    		var types = consequenceClasses[key];
	    		if (types == null) {
	    			types = {};
	    		}
	    		var consequenceObject = variant.highestImpactVep[key];
	    		types[variant.type] = consequenceObject; // key = consequence, value = transcript id
	    		consequenceClasses[key] = types;	

	    	}
	    }
	    for (key in variant.highestSIFT) {
			if (matrixCard.siftMap.hasOwnProperty(key) && matrixCard.siftMap[key].badge == true) {
				var clazz = matrixCard.siftMap[key].clazz;
				var order = matrixCard.siftMap[key].value;
				var siftObject = {};
				siftObject[key] = variant.highestSIFT[key];
				var dangerSift = new Object();
				dangerSift[clazz] = siftObject;
				dangerCounts.SIFT = dangerSift;
			}
	    }
	    for (key in variant.highestPolyphen) {
	    	if (matrixCard.polyphenMap.hasOwnProperty(key) && matrixCard.polyphenMap[key].badge == true) {
				var clazz = matrixCard.polyphenMap[key].clazz;
				var order = matrixCard.polyphenMap[key].value;
				var polyphenObject = {};
				polyphenObject[key] = variant.highestPolyphen[key];
				var dangerPolyphen = new Object();
				dangerPolyphen[clazz] = polyphenObject;
				dangerCounts.POLYPHEN = dangerPolyphen;
	    	}
	    }
	    if (variant.hasOwnProperty('clinVarClinicalSignificance')) {
	    	for (key in variant.clinVarClinicalSignificance) {
		    	if (matrixCard.clinvarMap.hasOwnProperty(key)  && matrixCard.clinvarMap[key].badge == true) {
				    var clinvarObject = matrixCard.clinvarMap[key];
					clinvarClasses[key] = clinvarObject ;	    		    		
		    	}

	    	}
	    }
	    if (variant.inheritance != null && variant.inheritance != 'none' && variant.inheritance != '') {
	    	var clazz = matrixCard.inheritanceMap[variant.inheritance].clazz;
	    	inheritanceClasses[clazz] = variant.inheritance;
	    }

	});

	var getLowestClinvarClazz = function(clazzes) {
		var lowestOrder = +9999;
		var lowestClazz = null;
		var dangerObject = null;
		for (clazz in clazzes) {
			var object = clazzes[clazz];
			if (object.value < lowestOrder) {
				lowestOrder = object.value;
				lowestClazz = clazz;
			}
		}
		if (lowestClazz) {
			dangerObject = {};
			dangerObject[lowestClazz] =  clazzes[lowestClazz];
		}
		return dangerObject;
	}

	var getLowestImpact = function(impactClasses) {
		if (impactClasses.HIGH != null) {
			return {HIGH: impactClasses.HIGH};
		} else if (impactClasses.MODERATE != null) {
			return {MODERATE: impactClasses.MODERATE};
		} else if (impactClasses.MODIFIER != null) {
			return {MODIFIER: impactClasses.MODIFIER};
		} else if (impactClasses.LOW != null) {
			return {LOW: impactClasses.LOW};
		} else {
			return {};
		}
	}
	dangerCounts.IMPACT      = getLowestImpact(impactClasses);
	dangerCounts.CONSEQUENCE = getLowestImpact(consequenceClasses);
	dangerCounts.CLINVAR     = getLowestClinvarClazz(clinvarClasses);
	dangerCounts.INHERITANCE = inheritanceClasses;
	

	return dangerCounts;
}

VariantModel.prototype.getCalledVariantCount = function() {
	return this.fbData.features.length != null ? this.fbData.features.length : "0";
}



VariantModel.prototype.filterBamDataByRegion = function(coverage, regionStart, regionEnd) {
	return coverage.filter(function(d) { 
		return (d[0] >= regionStart && d[0] <= regionEnd);
	}); 	
}


VariantModel.prototype.reduceBamData = function(coverageData, numberOfPoints) {
	var factor = d3.round(coverageData.length / numberOfPoints);
	return this.bam.reducePoints(coverageData, 
		                         factor, 
		                         function(d) {
		                         	return d[0]
		                         }, 
		                         function(d) {
		                         	return d[1]
		                         });
}

VariantModel.prototype.getCalledVariants = function(theRegionStart, theRegionEnd) {
	var fbData = this._getCachedData("fbData", window.gene.gene_name, window.selectedTranscript);
	if (fbData != null) {
		this.fbData = fbData;
	}
	if (theRegionStart && theRegionEnd) {
		// Check the local cache first to see
		// if we already have the freebayes variants
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
	this.relationship = theRelationship;	
}

VariantModel.prototype.setAffectedStatus = function(theAffectedStatus) {
	this.affectedStatus = theAffectedStatus;
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


VariantModel.prototype._promiseVcfRefName = function(ref) {
	var me = this;
	var theRef = ref != null ? ref : window.gene.chr;
	return new Promise( function(resolve, reject) {

		if (me.getVcfRefName != null) {
			// If we can't find the ref name in the lookup map, show a warning.
			if (me.vcfRefNamesMap[me.getVcfRefName(theRef)] == null) {
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
			    		
				 		if (refName == theRef) {
				 			me.getVcfRefName = me._getRefName;
				 			foundRef = true;
				 		} else if (refName == me._stripRefName(theRef)) {
				 			me.getVcfRefName = me._stripRefName;
				 			foundRef = true;
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
				 		if (ref.name == theRef) {
				 			me.getVcfRefName = me._getRefName;
				 			foundRef = true;
				 		} else if (ref.name == me._stripRefName(theRef)) {
				 			me.getVcfRefName = me._stripRefName;
				 			foundRef = true;
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
	var theVcfData = this.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (theVcfData == null) {
		return null;
	}

	var matchingVariant = null;
	if (theVcfData && theVcfData.features) {

		theVcfData.features.forEach( function( v ) {
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
* A gene has been selected. Clear out the model's state
* in preparation for getting data.
*/
VariantModel.prototype.wipeGeneData = function () {
	var me = this;
	this.vcfData = null;
	this.fbData = null;
	this.bamData = null;
}



VariantModel.prototype.getBamDepth = function(gene, selectedTranscript, callbackDataLoaded) {	
	var me = this;


	if (!this.isBamLoaded()) {		
		if (callbackDataLoaded) {
			callbackDataLoaded();
		}
		return;
	}


	// A gene has been selected.  Read the bam file to obtain
	// the read converage.
	var refName = this.getBamRefName(gene.chr);
	var theVcfData = this.getVcfDataForGene(gene, selectedTranscript);	


	var regions = [];
	if (theVcfData != null) {
		me.flagDupStartPositions(theVcfData.features);
		if (theVcfData) {
			theVcfData.features.forEach( function(variant) {
				if (!variant.dup) {
					regions.push({name: refName, start: variant.start - 1, end: variant.start });
				}
			});
		}

	}

	// Get the coverage data for the gene region
	// First the gene vcf data has been cached, just return
	// it.  (No need to retrieve the variants from the iobio service.)
	var data = me._getCachedData("bamData", gene.gene_name);
	if (data != null && data != '') {
		me.bamData = data;

		if (regions.length > 0) {
			me._refreshVariantsWithCoverage(theVcfData, data.coverage, function() {				
				if (callbackDataLoaded) {
			   	    callbackDataLoaded(data.coverage);
		   	    }
			});				
		} else {
			if (callbackDataLoaded) {
		   	    callbackDataLoaded(data.coverage);
	   	    }
		}

	} else {
		me.bam.getCoverageForRegion(refName, gene.start, gene.end, regions, 5000, 
	 	  function(coverageForRegion, coverageForPoints) {
	 	  	if (coverageForRegion != null) {
				me.bamData = {gene: gene.gene_name,
					          ref: refName, 
					          start: gene.start, 
					          end: gene.end, 
					          coverage: coverageForRegion};

				me._cacheData(me.bamData, "bamData", gene.gene_name);	 	  		
	 	  	}

			if (regions.length > 0) {
				me._refreshVariantsWithCoverage(theVcfData, coverageForPoints, function() {				
					if (callbackDataLoaded) {
				   	    callbackDataLoaded(coverageForRegion);
			   	    }
				});				
			} else {
				if (callbackDataLoaded) {
			   	    callbackDataLoaded(coverageForRegion, "bamData");
		   	    }
			}
		});
	}



}



VariantModel.prototype.promiseAnnotated = function(theVcfData) {
	var me = this;
	return new Promise( function(resolve, reject) {
		if (theVcfData != null &&
			theVcfData.features != null &&
			theVcfData.loadState != null &&
		   //(dataCard.mode == 'single' || theVcfData.loadState['inheritance'] == true) &&
			theVcfData.loadState['clinvar'] == true ) {

			resolve();

		} else {
			reject();
		}

	});

}

VariantModel.prototype.promiseAnnotatedAndCoverage = function(theVcfData) {
	var me = this;
	return new Promise( function(resolve, reject) {
		if (theVcfData != null &&
			theVcfData.features != null &&
			theVcfData.loadState != null &&
		   (dataCard.mode == 'single' || theVcfData.loadState['inheritance'] == true) &&
			theVcfData.loadState['clinvar'] == true  &&
			(!me.isBamLoaded() || theVcfData.loadState['coverage'] == true)) {

			resolve();

		} else {
			reject();
		}

	});

}

VariantModel.prototype.promiseGetVariantExtraAnnotations = function(theGene, theTranscript, variant) {
	var me = this;

	return new Promise( function(resolve, reject) {



		if ( variant.extraAnnot ) {
			resolve(variant);
		} else {	
			me._promiseVcfRefName(theGene.chr).then( function() {				
				me.vcf.promiseGetVariants(
				   me.getVcfRefName(theGene.chr), 
				   variant.start, 
			       variant.end, 
			       theGene.strand, 
			       theTranscript,
			       me.sampleName,
			       window.geneSource == 'refseq' ? true : false,
			       true,
			       true
			    ).then( function(data) {
			    	var theVcfData = data[1];	

		    		// Now update the hgvs notation on the variant
		    		var v = theVcfData.features[0];
		    		var theVariants = me.vcfData.features.filter(function(d) {
		    			if (d.start == v.start &&
		    				d.alt == v.alt &&
		    				d.ref == v.ref) {
		    				return true;
		    			} else {
		    				return false;
		    			}
		    		});
		    		if (theVariants && theVariants.length > 0) {
			    		var theVariant = theVariants[0];
	
						// set the hgvs and rsid on the existing variant
			    		theVariant.extraAnnot = true;
			    		theVariant.vepHGVSc = v.vepHGVSc;
			    		theVariant.vepHGVSp = v.vepHGVSp;
			    		theVariant.vepVariationIds = v.vepVariationIds;

				    	// re-cache the data
				    	me._cacheData(me.vcfData, "vcfData", theGene, theTranscript);	

				    	// return the annotated variant
						resolve(theVariant);
		    		} else {
		    			reject("Cannot find variant to update HGVS notation");
		    		}

				});		
			});				
		}
	});

}

VariantModel.prototype.promiseGetVariantsOnly = function(theGene, theTranscript) {
	var me = this;

	return new Promise( function(resolve, reject) {

		// First the gene vcf data has been cached, just return
		// it.  (No need to retrieve the variants from the iobio service.)
		var vcfData = me._getCachedData("vcfData", theGene.gene_name, theTranscript);
		if (vcfData != null && vcfData != '') {
			me.vcfData = vcfData;
	    	
			resolve(me.vcfData);
		} else {	
			me._promiseVcfRefName(theGene.chr).then( function() {				
				me.vcf.promiseGetVariants(
				   me.getVcfRefName(theGene.chr), 
				   theGene.start, 
			       theGene.end, 
			       theGene.strand, 
			       theTranscript,
			       me.sampleName,
			       window.geneSource == 'refseq' ? true : false
			    ).then( function(data) {
			    	var annotatedRecs = data[0];
			    	var data = data[1];	
			    	data.name = me.name;
			    	data.relationship = me.relationship;    	

			    	// Associate the correct gene with the data
			    	var theGeneObject = null;
			    	for( var key in window.geneObjects) {
			    		var geneObject = geneObjects[key];
			    		if (me.getVcfRefName(geneObject.chr) == data.ref &&
			    			geneObject.start == data.start &&
			    			geneObject.end == data.end &&
			    			geneObject.strand == data.strand) {
			    			theGeneObject = geneObject;
			    			data.gene = theGeneObject;
			    		}
			    	}
			    	if (theGeneObject) {
				    	// Cache the data
				    	me._cacheData(data, "vcfData", data.gene.gene_name, data.transcript);	
				    	me.vcfData = data;		    	
						resolve(me.vcfData);

			    	} else {
			    		alert("ERROR - cannot locate gene object to match with vcf data " + data.ref + " " + data.start + "-" + data.end);
			    		reject();
			    	}


			    	resolve(me.vcfData);
				});		
			});				
		}
	});

}

VariantModel.prototype.promiseGetVariants = function(theGene, theTranscript, regionStart, regionEnd, onVcfData) {
	var me = this;

	return new Promise( function(resolve, reject) {

		// First the gene vcf data has been cached, just return
		// it.  (No need to retrieve the variants from the iobio service.)
		var vcfData = me._getCachedData("vcfData", theGene.gene_name, theTranscript);
		if (vcfData != null && vcfData != '') {
			me.vcfData = vcfData;
			me._populateEffectFilters(me.vcfData.features);

			// Flag any bookmarked variants
			if (me.getRelationship() == 'proband') {
			    bookmarkCard.determineVariantBookmarks(vcfData, theGene);
			}


		    // Invoke callback now that we have annotated variants
	    	if (onVcfData) {
	    		onVcfData();
	    	}
	    	
			resolve(me.vcfData);
		} else {
			// We don't have the variants for the gene in cache, 
			// so call the iobio services to retreive the variants for the gene region 
			// and annotate them.
			me._promiseVcfRefName(theGene.chr).then( function() {
				me._promiseGetAndAnnotateVariants(
					me.getVcfRefName(theGene.chr),
					theGene.start, 
			        theGene.end, 
			        theGene.strand, 
			        theTranscript,
			        onVcfData)
				.then( function(data) {
			    	
			    	// Associate the correct gene with the data
			    	var theGeneObject = null;
			    	for( var key in window.geneObjects) {
			    		var geneObject = geneObjects[key];
			    		if (me.getVcfRefName(geneObject.chr) == data.ref &&
			    			geneObject.start == data.start &&
			    			geneObject.end == data.end &&
			    			geneObject.strand == data.strand) {
			    			theGeneObject = geneObject;
			    			data.gene = theGeneObject;
			    		}
			    	}
			    	if (theGeneObject) {
			    		// Flag any bookmarked variants
			    		if (me.getRelationship() == 'proband') {
					    	bookmarkCard.determineVariantBookmarks(data, theGeneObject);
					    }

				    	// Cache the data
				    	me._cacheData(data, "vcfData", data.gene.gene_name, data.transcript);	
				    	me.vcfData = data;		    	
						resolve(me.vcfData);

			    	} else {
			    		alert("ERROR - cannot locate gene object to match with vcf data " + data.ref + " " + data.start + "-" + data.end);
			    		reject();
			    	}

			    }, function(error) {
			    	reject(error);
			    });
			}, function(error) {
				reject("missing reference")
			});

		}



	});

}

VariantModel.prototype.isCached = function(geneName, transcript) {
	var key = this._getCacheKey("vcfData", geneName, transcript);
	var data = localStorage.getItem(key);
	return data != null;
}

VariantModel.prototype.promiseCacheVariants = function(geneName, ref, start, end, strand, transcript) {
	var me = this;

	return new Promise( function(resolve, reject) {

		// Is the data already cached?  If so, we are done
		var vcfData = me._getCachedData("vcfData", geneName, transcript);
		if (vcfData != null && vcfData != '') {			
			resolve(vcfData);
		} else {
			// We don't have the variants for the gene in cache, 
			// so call the iobio services to retreive the variants for the gene region 
			// and annotate them.
			me._promiseVcfRefName(ref).then( function() {
				me._promiseGetAndAnnotateVariants(me.getVcfRefName(ref), start, end, strand, transcript)
				.then( function(data) {
					// Associate the correct gene with the data
			    	var theGeneObject = null;
			    	for( var key in window.geneObjects) {
			    		var geneObject = geneObjects[key];
			    		if (me.getVcfRefName(geneObject.chr) == data.ref &&
			    			geneObject.start == data.start &&
			    			geneObject.end == data.end &&
			    			geneObject.strand == data.strand) {
			    			theGeneObject = geneObject;
			    			data.gene = theGeneObject;
			    		}
			    	}
			    	if (theGeneObject) {
			    		// Flag any bookmarked variants
					    bookmarkCard.determineVariantBookmarks(data, theGeneObject);

				    	// Cache the data
				    	me._cacheData(data, "vcfData", data.gene.gene_name, data.transcript);	
						resolve(data);				    	
				    } else {
				    	reject("Cannot find gene object to match data for " + data.ref + " " + data.start + "-" + data.end);
				    }
			    	

			    }, function(error) {
			    	reject(error);
			    });
			}, function(error) {
				reject("missing reference")
			});

		}



	});

}

VariantModel.prototype._getCacheKey = function(dataKind, geneName, transcript) {
	return this.getRelationship() 
		+ (this.sampleName != null ? "-" + this.sampleName : "")
		+ "-" + (geneName != null ? geneName : gene.gene_name) 
		+ (transcript != null ? "-" + transcript.transcript_id : "")
		+ "-" + dataKind;
}

VariantModel.prototype._cacheData = function(data, dataKind, geneName, transcript) {
	var me = this;
	if (localStorage) {
		var success = true;
		var dataString = JSON.stringify(data);

    	stringCompress = new StringCompress();

    	var dataStringCompressed = null;
    	try {
    		//dataStringCompressed = stringCompress.deflate(dataString);

    		//console.log("before compression=" + dataString.length);
			dataStringCompressed = LZString.compressToUTF16(dataString);
    		//console.log("after compression=" + dataStringCompressed.length);
    	} catch (e) {    		
	   		console.log("an error occurred when compressing vcf data for key " + e + " " + me._getCacheKey(dataKind, geneName, transcript));
	   		success = false;
    	}

    	if (success) {
	    	try {
		      	localStorage.setItem(this._getCacheKey(dataKind, geneName, transcript), dataStringCompressed);
	    	} catch(e) {
				if (e == QUOTA_EXCEEDED_ERR) {
	    			// TODO - keep track of times that genes were cached and delete the
	    			// oldest entry(ies).  Need to delete enough to store the current 
	    			// data that needs to be cached.
	    			console.log("local storage quota exceeded.  clearing local storage to continue.")
	    			localStorage.clear();
	    			try {
				      	localStorage.setItem(this._getCacheKey(dataKind, geneName, transcript), dataStringCompressed);
	    			} catch(e) {
			    		console.log("an error occurred when attempting to store into local storage (2nd attempt).  Cache key is " + me._getCacheKey() + ". Exception is " + e);
			    		success = false;
	    			}
	    		} else { 
			    	console.log("an error occurred when attempting to store into local storage.  Cache key is " + me._getCacheKey() + ". Exception is " + e);
			    	success = false;
	    		}   		
	    	}    		
    	}

      	return success;
    } else {
    	return false;
    }
}

VariantModel.prototype._getCachedData = function(dataKind, geneName, transcript) {
	var me = this;

	var data = null;
	if (localStorage) {
      	var dataCompressed = localStorage.getItem(this._getCacheKey(dataKind, geneName, transcript));
      	if (dataCompressed != null) {
			var dataString = null;
			try {
				//dataString = stringCdompress.inflate(dataCompressed);
				 dataString = LZString.decompressFromUTF16(dataCompressed);
	 			 data =  JSON.parse(dataString);      		
			} catch(e) {
				console.log("an error occurred when uncompressing vcf data for key " + me._getCacheKey(dataKind, geneName, transcript));
			}
      	} 
	} 
	return data;
}

VariantModel.prototype._promiseGetAndAnnotateVariants = function(ref, start, end, strand, transcript, onVcfData) {
	var me = this;

	return new Promise( function(resolve, reject) {


		// If this is the refseq gene model, set the annotation
		// scheme on the filter card to 'VEP' since snpEff will
		// be bypassed at this time.
		if (window.geneSource == 'refseq') {
			filterCard.setAnnotationScheme("VEP");
		}
		
		me.vcf.promiseGetVariants(
		   me.getVcfRefName(ref), 
		   start, 
	       end, 
	       strand, 
	       transcript,
	       me.sampleName,
	       window.geneSource == 'refseq' ? true : false,
	       me.GET_HGVS,
	       me.GET_RSID
	    ).then( function(data) {

	    	var annotatedRecs = data[0];
	    	var theVcfData = data[1];

		    if (theVcfData != null && theVcfData.features != null && theVcfData.features.length > 0) {

		    	// We have the AFs from 1000G and ExAC.  Now set the level so that variants
			    // can be filtered by range.
			    me._determineVariantAfLevels(theVcfData );


			    // Show the snpEff effects / vep consequences in the filter card
			    me._populateEffectFilters(theVcfData.features);

			    // Invoke callback now that we have annotated variants
			    me.vcfData = theVcfData;
		    	if (onVcfData) {
		    		onVcfData(theVcfData);
		    	}
		    	
		
		    	// Get the clinvar records (for proband, mom, data)
		    	// 
		    	if (me.getRelationship() != 'sibling') {
			    	return me.vcf.promiseGetClinvarRecords(
			    		theVcfData, 
			    		me._stripRefName(ref), start, end, 
			    		me._refreshVariantsWithClinvar.bind(me, theVcfData));

		    	} else {
		    		// We bypass getting clinvar records for unaffected siblings
		    		return new Promise( function(resolve, reject) {
		    			resolve(theVcfData);
		    		});
		    	}	


	    	} else {
	    		reject("No variants");
	    	}

		
	    }, 
	    function(error) {
	    	// If error when getting clinvar records	    	
	    	console.log("an error occurred when getting clinvar records " + error);
	    	reject();

	    }).then( function(data) {
	    	// We are done getting clinvar records.
	    	me.setLoadState(data, 'clinvar');
	    	resolve(data);
	    }, 
	    function(error) {
	    	console.log("an error occurred after getting clinvar records " + error);
	    	reject();
	    });


	});


}

VariantModel.prototype.determineMaxAlleleCount = function() {
	var theVcfData = this.getVcfDataForGene(window.gene, window.selectedTranscript);
	if (theVcfData == null || theVcfData.features == null) {
		return;
	}

	var maxAlleleCount = 0;
	var setMaxAlleleCount = function(depth) {
		if (depth != null && depth != "") {
			if ((+depth) > maxAlleleCount) {
				maxAlleleCount = +depth;
			}
		}
	};

	theVcfData.features.forEach(function(variant) {
		setMaxAlleleCount(variant.genotypeDepth);
		setMaxAlleleCount(variant.genotypeDepthMother);
		setMaxAlleleCount(variant.genotypeDepthFather);
	});
	theVcfData.maxAlleleCount = maxAlleleCount;	
}

VariantModel.prototype.populateEffectFilters = function(variants) {
	var theVcfData = this.getVcfDataForGene(window.gene, window.selectedTranscript);
	this._populateEffectFilters(theVcfData.features);
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

    	variant.afexaclevels = {};
		matrixCard.afExacMap.forEach( function(rangeEntry) {
			if (+variant.afExAC > rangeEntry.min && +variant.afExAC <= rangeEntry.max) {
				variant.afexaclevel = rangeEntry.clazz;
				variant.afexaclevels[rangeEntry.clazz] = rangeEntry.clazz;
			}
		});
		
		variant.af1000glevels = {};
		matrixCard.af1000gMap.forEach( function(rangeEntry) {
			if (+variant.af1000G > rangeEntry.min && +variant.af1000G <= rangeEntry.max) {
				variant.af1000glevel = rangeEntry.clazz;
				variant.af1000glevels[rangeEntry.clazz] = rangeEntry.clazz;
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

VariantModel.prototype._refreshVariantsWithCoverage = function(theVcfData, coverage, callback) {
	var me = this;
	var vcfIter = 0;
	var covIter = 0;
	if (theVcfData == null) {
		callback();
	}
	var recs = theVcfData.features;
	
    me.flagDupStartPositions(recs);
	
	for( var vcfIter = 0, covIter = 0; vcfIter < recs.length; null) {
		// Bypass duplicates
		if (recs[vcfIter].dup) {
			recs[vcfIter].bamDepth = recs[vcfIter-1].bamDepth;
			vcfIter++;
		}
		if (vcfIter >= recs.length) {

		} else {
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
					//console.log("no variant corresponds to coverage at " + coverageStart);
					covIter++;
				}

	      	}			
		}

	}
	this.setLoadState(theVcfData, 'coverage');
	callback();


}

VariantModel.prototype._refreshVariantsWithClinvar = function(theVcfData, clinVars) {	
	var me = this;
	var clinVarIds = clinVars.uids;
	if (theVcfData == null) {
		return;
	}

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
	var sortedFeatures = theVcfData.features.sort(orderVariantsByPosition);
	loadClinvarProperties(sortedFeatures);

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

			// Check the local cache first to see
			// if we already have the freebayes variants
			var fbData = me._getCachedData("fbData", window.gene.gene_name, window.selectedTranscript);
			if (fbData != null) {
				me.fbData = fbData;

				// Show populate the effect filters for the freebayes variants
				me._populateEffectFilters(me.fbData.features);

				if (onVariantsCalled) {
					onVariantsCalled();
				}

				if (onVariantsAnnotated) {
					onVariantsAnnotated(me.fbData);
				}

				resolve(me.fbData);


			} else {
				// We haven't cached the freebayes variants yet,
				// so call variants now.
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
						promiseDetermineInheritance(promiseFullTrioCalledVariants).then(function() {
							// The variant records in vcfData have updated clinvar and inheritance info.
							// Reflect me new info in the freebayes variants.
							getProbandVariantCard().model.fbData.features.forEach(function (fbVariant) {
								if (fbVariant.source) {
									fbVariant.inheritance                 = fbVariant.source.inheritance;
									fbVariant.genotypeRefCountMother      = fbVariant.source.genotypeRefCountMother;
									fbVariant.genotypeAltCountMother      = fbVariant.source.genotypeAltCountMother;
									fbVariant.genotypeDepthMother         = fbVariant.source.genotypeDepthMother;
									fbVariant.genotypeRefCountFather      = fbVariant.source.genotypeRefCountFather;
									fbVariant.genotypeAltCountFather      = fbVariant.source.genotypeAltCountFather;
									fbVariant.genotypeDepthFather         = fbVariant.source.genotypeDepthFather;
									fbVariant.uasibsZygosity              = fbVariant.source.uasibsZygosity;
								}
								
							});	 

						}, function(error) {
							console.log("a problem in determining inhheritance occurred after calling variants. " + error);
						});

						if (onVariantsAnnotated) {
							onVariantsAnnotated(me.fbData);
						}

						var theVcfData = me.getVcfDataForGene(window.gene, window.selectedTranscript);
						
						// Now get the clinvar data	
						// ??	    	
			    		return me.vcf.promiseGetClinvarRecords(
						    		me.fbData, 
						    		me._stripRefName(window.gene.chr), regionStart, regionEnd, 
						    		me._refreshVariantsWithClinvar.bind(me, theVcfData));



				    }, function(error) {
				    	reject('Error occurred when getting clinvar records:' + error);
				    })
				    .then (function() {

						// The variant records in vcfData have updated clinvar and inheritance info.
						// Reflect me new info in the freebayes variants.
						me.fbData.features.forEach(function (fbVariant) {
							if (fbVariant.source) {
								fbVariant.clinVarUid                  = fbVariant.source.clinVarUid;
								fbVariant.clinVarClinicalSignificance = fbVariant.source.clinVarClinicalSignificance;
								fbVariant.clinVarAccession            = fbVariant.source.clinVarAccession;
								fbVariant.clinvarRank                 = fbVariant.source.clinvarRank;
								fbVariant.clinvar                     = fbVariant.source.clinvar;
								fbVariant.clinVarPhenotype            = fbVariant.source.clinVarPhenotype;
							}
							
						});	 

						// Cache the freebayes variants.
						me._cacheData(me.fbData, "fbData", window.gene.gene_name, window.selectedTranscript);

						resolve(me.fbData);
				
				    	
				    }, function(error) {
				    	reject('An error occurred when getting clinvar recs for called variants: ' + error);
				    });
				
				});							

			}


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
		me.setLoadState(me.vcfData, 'clinvar');
		me.setLoadState(me.vcfData, 'coverage');
		me.setLoadState(me.vcfData, 'inheritance');
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
					 me.sampleName,
					 window.geneSource == 'refseq' ? true : false)
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




