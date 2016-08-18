var recordedCacheErrors = {};

function CacheHelper() {

	this.genesToCache = [];
	this.cacheQueue = [];
	this.batchSize = null;

}


CacheHelper.prototype.analyzeAll = function() {
	var me = this;
	// Start over with a new queue of genes to be analyzed
	// is all of the genes that need to be analyzed (and cached.)
	me.genesToCache = [];
	me.cacheQueue = [];
	geneNames.forEach(function(geneName) {
		if (geneName != window.gene.gene_name) {
			me.genesToCache.push(geneName);
		}
	});
	me.cacheGenes();	
}



CacheHelper.prototype.cacheGenes = function() {
	var me = this;

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
		me.cacheGene(me.cacheQueue[i]);
	}


}



CacheHelper.prototype.cacheGene = function(geneName) {
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

		    	var geneObject = response[0];
		    	adjustGeneRegion(geneObject);
		    	var transcript = getCanonicalTranscript(geneObject);
		    	window.geneObjects[geneObject.gene_name] = geneObject;
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

			    				// we need to compare the proband variants to mother and father variants to determine
								// the inheritance mode. 
								var probandVcfData = getVariantCard("proband").model.getVcfDataForGene(geneObject, transcript);
								var motherVcfData  = getVariantCard("mother" ).model.getVcfDataForGene(geneObject, transcript);
								var fatherVcfData  = getVariantCard("father" ).model.getVcfDataForGene(geneObject, transcript);
				

								var trioModel = new VariantTrioModel(probandVcfData, motherVcfData, fatherVcfData);
								trioModel.compareVariantsToMotherFather(function() {

									// Now that inheritance has been determined,
									// summarize the variants for the proband to
									// create the gene badges, representing the
									// most pathogenic variants for this gene
				    				var dangerObject = getVariantCard("proband").summarizeDanger(geneName, probandVcfData);
									
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


			    					// take this gene off of the queue and see
			    					// if next batch of genes should be analyzed
			    					me.cacheNextGene(geneObject.gene_name);
				    				

			    				}, function(error) {
			    					console.log("problem determining inheritance for " + geneObject.gene__name + ". " + error);
			    					// take this gene off of the queue and see
			    					// if next batch of genes should be analyzed
			    					me.cacheNextGene(geneObject.gene_name);
			    				});

			    			}

			    		}, function(error) {
			    			genesCard.setGeneBadgeError(geneObject.gene_name);			    				
		    				var message = error.hasOwnProperty("message") ? error.message : error;
			    			console.log("problem caching data for gene " + geneObject.gene_name + ". " + message);
			    			genesCard._geneBadgeLoading(geneObject.gene_name, false);

	    					// take this gene off of the queue and see
	    					// if next batch of genes should be analyzed
				    		me.cacheNextGene(geneObject.gene_name);					
			    		});

		    		}

		    	});	
		    } else {
				genesCard.setGeneBadgeError(geneName);			    				
				console.log("problem caching data for gene " + geneName + ". Cannot find gene " + url);
    			genesCard._geneBadgeLoading(geneName, false);
	    		me.cacheNextGene(geneName);
    		}		    	


		}
	});
	
				
}

CacheHelper.prototype.cacheNextGene = function(geneName) {
	var me = this;
	// Take the analyzed (and cached) gene off of the cache queue
	var idx = me.cacheQueue.indexOf(geneName);
	if (idx >= 0) {
		me.cacheQueue.splice(idx,1);
	}
	// Invoke cacheGenes, which will kick off the next batch
	// of genes to analyze once all of the genes in
	// the current batch have been analyzed.
	me.cacheGenes();		
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
		return count == variantCards.length;
	}
}



CacheHelper.prototype.clearCache = function() {
	var me = this;
	if (keepLocalStorage) {
		
	} else {
		if (localStorage) {
			localStorage.clear();
		}
		me.genesToCache = [];
	}

}


CacheHelper.getCacheSize = function() {  // provide the size in bytes of the data currently stored
  var size = 0;
  var coverageSize = 0;
  var nonBadgeSize = 0;
  for (var i=0; i<=localStorage.length-1; i++)  
  {  
  	key = localStorage.key(i);  
  	var dataSize = localStorage.getItem(key).length;
  	size     += dataSize;

  	var cacheObject = CacheHelper.parseCacheKey(key);
  	if (cacheObject.dataKind == 'bamData') {
  		coverageSize +=  dataSize;
  	}
  	if (!CacheHelper.hasBadgeOfInterest(key)) {
  		nonBadgeSize += dataSize;
  	}
  }  
  return {total:     (CacheHelper.sizeMB(size) + " MB"), 
          coverage:  (CacheHelper.sizeMB(coverageSize) + " MB"),
      	  nonBadge:  (CacheHelper.sizeMB(nonBadgeSize) + " MB")};
}

CacheHelper.sizeMB = function(size) {
	var sizeMB = size / (1024*1024);
	return  Math.round(sizeMB * 100) / 100;
}


CacheHelper.parseCacheKey = function(cacheKey) {
	var tokens = cacheKey.split("---");
	return { relationship: tokens[0], 
		     sample: tokens[1], 
		     gene: tokens[2], 
		     transcript: tokens[3], 
		     annotationScheme: tokens[4], 
		     dataKind: tokens[5]
		    };

}

CacheHelper.clearAll = function() {
	// confirm dialog
	alertify.confirm("Clear all cached data?", function (e) {
	    if (e) {
			// user clicked "ok"
			for (var i=0; i<=localStorage.length-1; i++)  {  
  				var key = localStorage.key(i); 	
  				localStorage[key] = "";
  			}
  			CacheHelper.refreshDialog();
	        
	    } else {
	        // user clicked "cancel"
	    }
	});
}

CacheHelper.clearCoverageCache = function() {
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
		cacheObject = CacheHelper.parseCacheKey(key);
		if (cacheObject.dataKind == "bamData") {
			localStorage[key] = "";
		}
	}
	CacheHelper.refreshDialog();
}
CacheHelper.clearNonBadgeCache = function() {
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
		if (CacheHelper.isProbandVariantCache(key) && !CacheHelper.hasBadgeOfInterest(key)) {
			var cacheObject = CacheHelper.parseCacheKey(key);
			CacheHelper.clearCacheForGene(cacheObject.gene);
		}
	}
	CacheHelper.refreshDialog();
}

CacheHelper.isProbandVariantCache = function(key) {
	var cacheObject = CacheHelper.parseCacheKey(key);
	return (cacheObject && cacheObject.dataKind == "vcfData" && cacheObject.relationship == "proband");

}

CacheHelper.hasBadgeOfInterest = function(key) {
	hasBadge = false;
	var cacheObject = CacheHelper.parseCacheKey(key);
	var probandKey = null;
	if (CacheHelper.isProbandVariantCache(key)) {
		probandKey = key;
	} else {
		var keys = CacheHelper.getKeysForGene(cacheObject.gene);
		keys.forEach( function(theKey) {
			if (probandKey == null && CacheHelper.isProbandVariantCache(theKey)) {
				probandKey = theKey;
			}
		});
		if (probandKey == null) {
			console.log("Cannot find proband variant cache for gene " + cacheObject.gene);
			return true;
		}
	}

	var probandCacheObject = CacheHelper.parseCacheKey(probandKey);
	var dangerCacheObject = $().extend(probandCacheObject);
	dangerCacheObject.dataKind   = "dangerObject";
	dangerCacheObject.transcript = "null";

	var dangerObject = CacheHelper.getCachedData(CacheHelper.getCacheKey(dangerCacheObject));
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
		// If we can't find the danger summary, play it safe and mark it as having
		// badges so its cache doesn't get deleted.
		hasBadge = true;
	}
	return hasBadge;

}

CacheHelper.getKeysForGene = function(geneName) {
	var keys = [];
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
		cacheObject = CacheHelper.parseCacheKey(key);
		if (cacheObject.gene == geneName) {
			keys.push(key);
		}
	}
	return keys;
}

CacheHelper.clearCacheForGene = function(geneName) {
	var keys = CacheHelper.getKeysForGene(geneName);
	keys.forEach( function(key) {
		localStorage[key] = "";
	});
}

CacheHelper.getCacheKey = function(cacheObject) {
	return        cacheObject.relationship 
		+ "---" + cacheObject.sample
		+ "---" + cacheObject.gene
		+ "---" + cacheObject.transcript
	    + "---" + cacheObject.annotationScheme
		+ "---" + cacheObject.dataKind;
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

CacheHelper.refreshDialog = function() {
	var sizes = CacheHelper.getCacheSize();
	$("#cache-size").text(sizes.total);
	$("#coverage-size").text(sizes.coverage);
	$("#non-badge-size").text(sizes.nonBadge);	
}

CacheHelper.openDialog = function() {
	CacheHelper.refreshDialog();
	$('#manage-cache-modal').modal('show');
}

CacheHelper.showError = function(key, cacheError) {
	var cacheObject = CacheHelper.parseCacheKey(key);
	var errorType = cacheError.hasOwnProperty("name") ? cacheError.name : "A problem";
	var errorKey = cacheObject.gene + "---" + errorType;

	var consoleMessage = errorType + " occurred when caching analyzed " + cacheObject.dataKind + " data for gene " + cacheObject.gene + ". Click on 'Clear cache...' link to clear cache."
    console.log(consoleMessage);
    console.log(cacheError.toString());
    
    // Only show the error once
    if (!recordedCacheErrors[errorKey]) {
	    var message = errorType + " occurred when caching analyzed data for gene " + cacheObject.gene + ". Click on 'Clear cache...' to clear cache."
		alertify.notify(message, 'error', 15);	
    	recordedCacheErrors[errorKey] = message;
    }
}