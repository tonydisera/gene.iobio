var recordedCacheErrors = {};

function CacheHelper(loaderDisplay) {

	this.genesToCache = [];
	this.cacheQueue = [];
	this.batchSize = null;
	this.geneBadgeLoaderDisplay = loaderDisplay;
}

CacheHelper.prototype.isolateSession = function() {
	this.launchTimestamp = Date.now().valueOf();	
}


CacheHelper.prototype.analyzeAll = function() {

	var me = this;
	// Start over with a new queue of genes to be analyzed
	// is all of the genes that need to be analyzed (and cached.)
	me.genesToCache = [];
	me.cacheQueue = [];
	genesCard.getGeneNames().forEach(function(geneName) {
		if (geneName != window.gene.gene_name) {
			me.genesToCache.push(geneName);
		}
	});
	me.cacheGenes(function() {
		me.getAnalyzeAllCounts(function(counts) {
			if (counts.unanalyzed == 0) {
				alertify.confirm("Analysis is complete. Refresh badges?", function (e) {
				    if (e) {
						// user clicked "ok"
						me.refreshGeneBadges();
				        
				    } else {
				        // user clicked "cancel"
				    }
				});	

			} else if (counts.unanalyzed > 0) {
				alertify.confirm("Analysis incomplete.  Only " + counts.analyzed + " of the " + counts.total + " genes have been analyzed.", function (e) {
				    if (e) {
				    	// ok
				    } else {
				    	//cancel
				    }
				});	
			} 
		});		
	});


}



CacheHelper.prototype.cacheGenes = function(callback) {
	var me = this;

	// If there are no more genes to cache, 
	if (me.genesToCache.length == 0 && me.cacheQueue.length == 0) {
		if (callback) {
			callback();
		}
	}



	// If we still have genes in the cache queue, exit. (Wait to kick off next batch 
	// of genes to analyze until all genes in last batch are analyzed.)
	if (me.cacheQueue.length > 0) {
		return;
	}


	// Determine the batch size.  (It will be smaller that the
	// default batch size if the genes remaining to be cached is
	// smaller than the batch size.)
	me.batchSize = Math.min(me.genesToCache.length, DEFAULT_BATCH_SIZE);

	// Place next batch of genes in caching queue 
	for (var i = 0; i < me.batchSize; i++) {
		me.cacheQueue.push(me.genesToCache[i]);
	}
	// Remove this batch of genes from the list of all genes to be cached
	for (var i = 0; i < me.batchSize; i++) {
		me.genesToCache.shift();
	}
	// Invoke method to cache each of the genes in the queue
	for (var i = 0; i < me.batchSize; i++) {
		me.cacheGene(me.cacheQueue[i], callback);
	}


}



CacheHelper.prototype.cacheGene = function(geneName, callback) {
	var me = this;


	var url = geneInfoServer + 'api/gene/' + geneName;
	url += "?source=" + geneSource;

	// Get the gene model 		
	$.ajax({
	    url: url,
	    jsonp: "callback",
	    type: "GET",
	    dataType: "jsonp",
	    success: function( response ) {
	    	// Now that we have the gene model,
	    	// load and annotate the variants for each
	    	// sample (e.g. each variant card)
	    	if (response[0].hasOwnProperty('gene_name')) {
	    		me.geneBadgeLoaderDisplay.setPageCount(genesCard.getPageCount())
	    														 .addGene(geneName, genesCard.pageNumberForGene(geneName));

		    	var geneObject = response[0];
		    	adjustGeneRegion(geneObject);
		    	var transcript = getCanonicalTranscript(geneObject);
		    	window.geneObjects[geneObject.gene_name] = geneObject;

		    	isJointCallOnly( function(shouldJointCall) {
				    if (me.isCachedForCards(geneObject.gene_name, transcript)) {
				    	// take this gene off of the queue and see
				    	// if next batch of genes should be analyzed
				    	genesCard._geneBadgeLoading(geneObject.gene_name, false);
				    	me.cacheNextGene(geneObject.gene_name, callback);
				    } else if (shouldJointCall) {
				    	genesCard._geneBadgeLoading(geneObject.gene_name, true);
						cacheJointCallVariants(geneObject, transcript, function() {

							me.processCachedTrio(geneObject, transcript, callback)						
						});
					} else {

						genesCard._geneBadgeLoading(geneObject.gene_name, true);
					    // For each sample, get and annotate the genes and
					    // cache the variants
				    	getRelevantVariantCards().forEach(function(variantCard) {

				    		if (dataCard.mode == 'trio' || variantCard == getProbandVariantCard()) {
					    		variantCard.promiseCacheVariants(
					    			geneObject.chr,
					    			geneObject, 
								 	transcript)
					    		.then( function(vcfData) {
					    			// Once all analysis of the gene variants for each of
					    			// the samples is complete, determine the inheritance 
					    			// (if this is a trio)
					    			if (me.isCachedForCards(geneObject.gene_name, transcript)) {

						    			me.processCachedTrio(geneObject, transcript, callback);


					    			}

					    		}, function(error) {
					    			genesCard.setGeneBadgeError(geneObject.gene_name);			    				
				    				var message = error.hasOwnProperty("message") ? error.message : error;
					    			console.log("problem caching data for gene " + geneObject.gene_name + ". " + message);
					    			genesCard._geneBadgeLoading(geneObject.gene_name, false);

			    					// take this gene off of the queue and see
			    					// if next batch of genes should be analyzed
						    		me.cacheNextGene(geneObject.gene_name, callback);					
					    		});

				    		}

				    	});				    	
				    }


		    	});



		    } else {
				genesCard.setGeneBadgeError(geneName);			    				
				console.log("problem caching data for gene " + geneName + ". Cannot find gene " + url);
    			genesCard._geneBadgeLoading(geneName, false);
	    		me.cacheNextGene(geneName, callback);
    		}		    	


		}
	});
	
				
}

CacheHelper.prototype.processCachedTrio = function(geneObject, transcript, callback) {
	var me = this;

	// we need to compare the proband variants to mother and father variants to determine
	// the inheritance mode. 
	var probandVcfData = getVariantCard("proband").model.getVcfDataForGene(geneObject, transcript);
	var motherVcfData  = getVariantCard("mother" ).model.getVcfDataForGene(geneObject, transcript);
	var fatherVcfData  = getVariantCard("father" ).model.getVcfDataForGene(geneObject, transcript);


	var trioModel = new VariantTrioModel(probandVcfData, motherVcfData, fatherVcfData);
	trioModel.compareVariantsToMotherFather(function() {

		getVariantCard("proband").model._cacheData(probandVcfData, "vcfData", geneObject.gene_name, transcript);					
		getVariantCard("mother" ).model._cacheData(motherVcfData,  "vcfData", geneObject.gene_name, transcript);					
		getVariantCard("father" ).model._cacheData(fatherVcfData,  "vcfData", geneObject.gene_name, transcript);					

		// Now that inheritance has been determined,
		// summarize the variants for the proband to
		// create the gene badges, representing the
		// most pathogenic variants for this gene
		var dangerObject = getVariantCard("proband").summarizeDanger(geneObject.gene_name, probandVcfData);
		
		genesCard._geneBadgeLoading(geneObject.gene_name, false);
		if (probandVcfData.features.length == 0) {
			genesCard.setGeneBadgeWarning(geneObject.gene_name);
		} else {
			genesCard.setGeneBadgeGlyphs(geneObject.gene_name, dangerObject, false);
		}

		// Re-cache the results now that inheritance has been determined
		getRelevantVariantCards().forEach(function(vc) {
			if (autoCall && !vc.model.isVcfReadyToLoad()) {
				var data = vc.model.getVcfDataForGene(geneObject, transcript);
				vc.model._cacheData(data, "fbData", geneObject.gene_name, transcript);
				vc.model._cacheData(data, "vcfData", geneObject.gene_name, transcript);											
			}
		})

		CacheHelper._logCacheSize();

		// Now clear out mother and father from cache
		getVariantCard("mother" ).model.clearCacheItem("vcfData", geneObject.gene_name, transcript);					
		getVariantCard("father" ).model.clearCacheItem("vcfData", geneObject.gene_name, transcript);					

		getVariantCard("mother" ).model.clearCacheItem("fbData", geneObject.gene_name, transcript);					
		getVariantCard("father" ).model.clearCacheItem("fbData", geneObject.gene_name, transcript);					


		CacheHelper._logCacheSize();


		// take this gene off of the queue and see
		// if next batch of genes should be analyzed
		me.cacheNextGene(geneObject.gene_name, callback);
	}, 
	function(error) {
		console.log("problem determining inheritance for " + geneObject.gene_name + ". " + error);
		// take this gene off of the queue and see
		// if next batch of genes should be analyzed
		me.cacheNextGene(geneObject.gene_name, callback);
	});
}

CacheHelper.prototype.cacheNextGene = function(geneName, callback) {
	this.geneBadgeLoaderDisplay.setPageCount(genesCard.getPageCount())
														 .removeGene(geneName);
	// Take the analyzed (and cached) gene off of the cache queue
	var idx = this.cacheQueue.indexOf(geneName);
	if (idx >= 0) {
		this.cacheQueue.splice(idx,1);
	}
	// Invoke cacheGenes, which will kick off the next batch
	// of genes to analyze once all of the genes in
	// the current batch have been analyzed.
	this.cacheGenes(callback);
}

CacheHelper.prototype.isCachedForCards = function(geneName, transcript) {
	var me = this;
	var count = 0;
	getRelevantVariantCards().forEach( function(variantCard) {
		if (variantCard.isCached(geneName, transcript)) {
			count++;
		}
	});
	if (dataCard.mode == 'single') {
		return count == 1;
	} else {
		return count == getRelevantVariantCards().length;
	}
}


CacheHelper.prototype.getAnalyzeAllCounts = function(callback) {
	var countObject = {total: 0, analyzed: 0, unanalyzed: 0, error: 0};
	genesCard.getGeneNames().forEach(function(geneName) {
		//genesToCount.push(geneName);
		
		var key = getProbandVariantCard().model._getCacheKey("dangerSummary", geneName);
    	var dangerSummary = CacheHelper.getCachedData(key);
		if (dangerSummary != null) {
			countObject.analyzed++;
		} else {
			countObject.unanalyzed++;						
		}
		countObject.total++;
	});
	callback(countObject);



/*
	var genesToCount = [];
	var countObject = {total: 0, analyzed: 0, unanalyzed: 0, error: 0};
	genesCard.getGeneNames().forEach(function(geneName) {
		genesToCount.push(geneName);
	});
	var countNextGeneTranscript = function(callback) {
		if (genesToCount.length == 0) {
			callback();
		}
		var geneName = genesToCount.splice(0,1);
		var url = geneInfoServer + 'api/gene/'  + geneName;
		$.ajax({
		    url: url,
		    jsonp: "callback",
		    type: "GET",
		    dataType: "jsonp",
		    success: function( response ) {
		    	// Now that we have the gene model,
		    	// load and annotate the variants for each
		    	// sample (e.g. each variant card)
		    	if (response[0].hasOwnProperty('gene_name')) {
			    	var geneObject = response[0];
			    	adjustGeneRegion(geneObject);
			    	var transcript = getCanonicalTranscript(geneObject);
			    	var key = getProbandVariantCard().model._getCacheKey("dangerSummary", geneObject.gene_name);
			    	var dangerSummary = CacheHelper.getCachedData(key);
					if (dangerSummary != null) {
						countObject.analyzed++;
					} else {
						countObject.unanalyzed++;						
					}
					countObject.total++;
					countNextGeneTranscript(callback);
			    }
			},
			error: function( xhr, status, errorThrown ) {
				countObject.total++;
				countObject.error++;
				countNextGeneTranscript(callback);
			}
		});

	}

	var countObject = {total: 0, analyzed: 0, unanalyzed: 0, error: 0};
	countNextGene(function() {
		callback(countObject);
	});
*/
}



CacheHelper.prototype.refreshGeneBadges = function() {  
	var me = this;

	var doRefresh  = function() {
		$('#gene-badges-loader').removeClass("hide");
		for (var i=0; i<=localStorage.length-1; i++)  
		{  
			key = localStorage.key(i);  
			keyObject = CacheHelper._parseCacheKey(key);
			if (keyObject.launchTimestamp == me.launchTimestamp) {

			  	var cacheObject = CacheHelper._parseCacheKey(key);
			  	if (cacheObject.dataKind == 'vcfData' && cacheObject.relationship == "proband") {
			  		var theVcfData = CacheHelper.getCachedData(key);
			  		var filteredVcfData = getVariantCard('proband').model.filterVariants(theVcfData, filterCard.getFilterObject(), true);

			  		var dangerObject = getVariantCard("proband").summarizeDanger(cacheObject.gene, filteredVcfData);
			
					genesCard.setGeneBadgeGlyphs(cacheObject.gene, dangerObject, false);
			  	}
			}
		}  
		genesCard.sortGenes();
		$('#gene-badges-loader').addClass("hide");

	}

	me.getAnalyzeAllCounts(function(counts) {
		if (counts.unanalyzed > 0) {
			alertify.confirm("Analysis incomplete.  Only " + counts.analyzed + " of the " + counts.total + " genes have been analyzed.  Refresh badges anyways?", function (e) {
			    if (e) {
					// user clicked "ok"
					doRefresh();
			        
			    } else {
			        // user clicked "cancel"
			    }
			});	
		} else {
			doRefresh();
		}
	});
	


}

CacheHelper.prototype.clearCache = function(launchTimestampToClear) {
	var me = this;
	if (keepLocalStorage) {
		
	} else {
		me._clearCache(launchTimestampToClear);
		me.genesToCache = [];
	}
}

CacheHelper.prototype.getCacheKey = function(cacheObject) {
	return        this.launchTimestamp
	    + "---" + cacheObject.relationship 
		+ "---" + cacheObject.sample
		+ "---" + cacheObject.gene
		+ "---" + cacheObject.transcript
	    + "---" + cacheObject.annotationScheme
		+ "---" + cacheObject.dataKind;
}


CacheHelper.prototype.getCacheSize = function() {  // provide the size in bytes of the data currently stored
	var me = this;
	var size = 0;
	var coverageSize = 0;
	var nonBadgeSize = 0;
	for (var i=0; i<=localStorage.length-1; i++)  
	{  
		key = localStorage.key(i);  
		keyObject = CacheHelper._parseCacheKey(key);
		if (keyObject.launchTimestamp == me.launchTimestamp) {
		  	var dataSize = localStorage.getItem(key).length;
		  	size     += dataSize;

		  	var cacheObject = CacheHelper._parseCacheKey(key);
		  	if (cacheObject.dataKind == 'bamData') {
		  		coverageSize +=  dataSize;
		  	}
		  	if (!me._hasBadgeOfInterest(key)) {
		  		nonBadgeSize += dataSize;
		  	}  		
		}
	}  
	return {total:     (CacheHelper._sizeMB(size) + " MB"), 
	      coverage:  (CacheHelper._sizeMB(coverageSize) + " MB"),
	  	  nonBadge:  (CacheHelper._sizeMB(nonBadgeSize) + " MB")};
}

CacheHelper._logCacheSize = function() {
	var cacheInfo = {};
	for (var i=0; i<=localStorage.length-1; i++)  
	{  
		var key = localStorage.key(i); 
		var keyPart = "";
		if (key.indexOf("---")) {
			keyPart = key.split("---")[0];
		} else {
			keyPart = key;
		}
			
		var size = cacheInfo[keyPart];
		if (size == null) {
			size = 0;
		}
		size += localStorage.getItem(key).length;
		cacheInfo[keyPart] = size;			
	}
	console.log(cacheInfo);
	var totalSize = 0;
	Object.keys(cacheInfo).forEach(function(key) {
		totalSize += cacheInfo[key];
	})
	console.log(totalSize);	
}

CacheHelper._logCacheContents = function() {
	var x, xLen, log=[],total=0;
	for (x in localStorage){
		xLen =  ((localStorage[x].length * 1 + x.length * 1)/1024); 
		log.push(x + " = " +  xLen.toFixed(2) + " KB"); 
		total+= xLen}; 
		if (total > 1024){
			log.unshift("Total = " + (total/1024).toFixed(2)+ " MB");
		} else{
			log.unshift("Total = " + total.toFixed(2)+ " KB");}; 
			console.log(log.join("\n")
	);	
}

CacheHelper.prototype.clearCacheItem = function(key) {
	var me = this;
	if (localStorage) {
		localStorage.removeItem(key);			
	}
}

CacheHelper.prototype._clearCache = function(launchTimestampToClear) {
	var me = this;
	var theLaunchTimeStamp = launchTimestampToClear ? launchTimestampToClear : me.launchTimestamp;
	if (localStorage) {
		//CacheHelper._logCacheSize();
		var keysToRemove = [];
		for (var i=0; i<=localStorage.length-1; i++)  {  
			var key = localStorage.key(i); 	
			keyObject = CacheHelper._parseCacheKey(key);
			if (keyObject.gene && keyObject.relationship == 'proband') {
				genesCard.clearGeneGlyphs(keyObject.gene);
			}
			if (keyObject.launchTimestamp == theLaunchTimeStamp) {
				keysToRemove.push(key);
			} 
		}	
		keysToRemove.forEach( function(key) {
			localStorage.removeItem(key);			
		})
		//CacheHelper._logCacheSize();
		//CacheHelper._logCacheContents();
	}
}

CacheHelper.prototype.clearAll = function() {
	var me = this;
	// confirm dialog
	alertify.confirm("Clear all cached data?", function (e) {
	    if (e) {
			// user clicked "ok"
			me._clearCache();
  			me.refreshDialog();
	        
	    } else {
	        // user clicked "cancel"
	    }
	});
}

CacheHelper.prototype.clearCoverageCache = function() {
	var me = this;
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
		var keyObject = CacheHelper._parseCacheKey(key);
	  		if (keyObject.launchTimestamp == me.launchTimestamp) {
				if (keyObject.dataKind == "bamData") {
					localStorage[key] = "";
				}
	  		}
	}
	me.refreshDialog();
}
CacheHelper.prototype.clearNonBadgeCache = function() {
	var me = this;
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
  		var keyObject = CacheHelper._parseCacheKey(key);
  		if (keyObject.launchTimestamp == me.launchTimestamp) {
			if (me._isProbandVariantCache(key) && !me._hasBadgeOfInterest(key)) {
				me.clearCacheForGene(keyObject.gene);
			}  			
  		}
	}
	me.refreshDialog();
}

CacheHelper.prototype.refreshDialog = function() {
	var sizes = this.getCacheSize();
	$("#cache-size").text(sizes.total);
	$("#coverage-size").text(sizes.coverage);
	$("#non-badge-size").text(sizes.nonBadge);	
}

CacheHelper.prototype.openDialog = function() {
	this.refreshDialog();
	$('#manage-cache-modal').modal('show');
}



CacheHelper.prototype.clearCacheForGene = function(geneName) {
	var me = this;
	var keys = me.getKeysForGene(geneName);
	keys.forEach( function(key) {
		localStorage[key] = "";
	});
}


CacheHelper.prototype._getKeysForGene = function(geneName) {
	var me = this;
	var keys = [];
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
		cacheObject = CacheHelper._parseCacheKey(key);
		if (cacheObject.launchTimestamp == me.launchTimestamp) {
			if (cacheObject.gene == geneName) {
				keys.push(key);
			}			
		}
	}
	return keys;
}

CacheHelper.prototype._hasBadgeOfInterest = function(key) {
	var me = this;
	hasBadge = false;
	var cacheObject = CacheHelper._parseCacheKey(key);
	var probandKey = null;
	if (me._isProbandVariantCache(key)) {
		probandKey = key;
	} else {
		var keys = me._getKeysForGene(cacheObject.gene);
		keys.forEach( function(theKey) {
			if (probandKey == null && me._isProbandVariantCache(theKey)) {
				probandKey = theKey;
			}
		});
		if (probandKey == null) {
			console.log("Cannot find proband variant cache for gene " + cacheObject.gene);
			return true;
		}
	}

	var probandCacheObject = CacheHelper._parseCacheKey(probandKey);
	var dangerCacheObject = $().extend(probandCacheObject);
	dangerCacheObject.dataKind   = "dangerSummary";
	dangerCacheObject.transcript = "null";

	var dangerObject = CacheHelper.getCachedData(me.getCacheKey(dangerCacheObject));
	if (dangerObject) {
		for(dangerKey in dangerObject) {
			var dangerValue = dangerObject[dangerKey];
			if (dangerValue != null && dangerValue != "" && !$.isEmptyObject(dangerValue)) {
				hasBadge = true;
			}
		}
		// Now check to see if the gene has any bookmarked variants
		if (!hasBadge) {	
			if (bookmarkCard.isBookmarkedGene(cacheObject.gene)) {
				hasBadge = true;
			}		
		}
	} else {
		hasBadge = false;
	}
	return hasBadge;

}


CacheHelper.prototype._isProbandVariantCache = function(key) {
	var cacheObject = CacheHelper._parseCacheKey(key);
	return (cacheObject 
		&& cacheObject.launchTimestamp == this.launchTimestamp 
		&& ( cacheObject.dataKind == "vcfData"  || cacheObject.dataKind == "fbData")
		&& cacheObject.relationship == "proband");

}




CacheHelper._sizeMB = function(size) {
	var _sizeMB = size / (1024*1024);
	return  Math.round(_sizeMB * 100) / 100;
}


CacheHelper._parseCacheKey = function(cacheKey) {
	var tokens = cacheKey.split("---");
	return { launchTimestamp: tokens[0],
		     relationship: tokens[1], 
		     sample: tokens[2], 
		     gene: tokens[3], 
		     transcript: tokens[4], 
		     annotationScheme: tokens[5], 
		     dataKind: tokens[6]
		    };

}


CacheHelper.getCachedData = function(key) {
	var data = null;
	if (localStorage) {
      	var dataCompressed = localStorage.getItem(key);
      	if (dataCompressed != null) {
			var dataString = null;
			try {
				 dataString = LZString.decompressFromUTF16(dataCompressed);
	 			 data =  JSON.parse(dataString);      		
			} catch(e) {
				console.log("an error occurred when uncompressing vcf data for key " + key);
			}
      	} 
	} 
	return data;	
}


CacheHelper.showError = function(key, cacheError) {
	var cacheObject = CacheHelper._parseCacheKey(key);
	var errorType = cacheError.hasOwnProperty("name") ? cacheError.name : "A problem";
	var errorKey = cacheObject.gene + "---" + errorType;

	var consoleMessage = errorType + " occurred when caching analyzed " + cacheObject.dataKind + " data for gene " + cacheObject.gene + ". Click on 'Clear cache...' link to clear cache."
    console.log(consoleMessage);
    console.log(cacheError.toString());
    
    // Only show the error once
    if (!recordedCacheErrors[errorKey]) {
	    var message = errorType + " occurred when caching analyzed data for gene " + cacheObject.gene + ". Click on 'Clear cache...' to clear cache."
		alertify.notify(message, 'error', 60);	
    	recordedCacheErrors[errorKey] = message;
    }
}