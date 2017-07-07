var recordedCacheErrors = {};

function CacheHelper(loaderDisplay) {

	this.genesToCache = [];
	this.cacheQueue = [];
	this.batchSize = null;
	this.geneBadgeLoaderDisplay = loaderDisplay;
	this.showCallAllProgress = false;
	this.KEY_DELIM = "^";
}

CacheHelper.prototype.isolateSession = function() {
	this.launchTimestamp = Date.now().valueOf();	
}

CacheHelper.prototype.showAnalyzeAllProgress = function(clearStandardFilterCounts) {
	var me = this;

	me.getAnalyzeAllCounts(function(counts) {
		me.showGeneCounts(counts, clearStandardFilterCounts)
	});	
}

CacheHelper.prototype.showGeneCounts = function(counts, clearStandardFilterCounts) {
	var me = this;
	if (counts.geneCount == 0) {
		$('#analyzed-progress-bar').addClass("hide");
		$('#total-genes-label').addClass("hide");
		return;
	} 
	$('#analyzed-progress-bar').removeClass("hide");


	$('#total-genes-label').removeClass("hide");
	$('#total-genes-label').text(counts.geneCount + " genes");


	me.fillProgressBar($("#analyze-all-progress"), counts, 'loaded', clearStandardFilterCounts);


	if (me.showCallAllProgress) {
		me.fillProgressBar($("#call-all-progress"), counts, 'called', clearStandardFilterCounts);
	} else {
		$('#called-progress-bar').addClass("hide");			
	}

}

CacheHelper.prototype.fillProgressBar = function(progressBar, countObject, field, clearStandardFilterCounts) {
	var geneCount = countObject.geneCount;
	var counts    = countObject[field];
 
	progressBar.removeClass("hide");
	if (counts.analyzed == 0) {
		progressBar.find(".text").removeClass("hide");
		progressBar.find(".text").text("0 analyzed");
	} else {
		progressBar.find(".text").html("&nbsp;");
	}


	if (counts.analyzed == geneCount) {
		progressBar.addClass("done");
		progressBar.find(".text").text(counts.analyzed + " analyzed");
	} else {
		progressBar.removeClass("done");			
	}

	var notAnalyzedCount        = geneCount - counts.analyzed;
	var analyzedNotPassedCount  = counts.analyzed - counts.pass;

	var analyzed                = Math.round(counts.analyzed / geneCount * 100) / 100;		
	var notAnalyzed             = 1 - analyzed;

	var analyzedPassed          = filterCard.hasFilters() && counts.analyzed > 0 ? Math.round(counts.pass / counts.analyzed * 100) / 100 : 1;
	var analyzedNotPassed       = filterCard.hasFilters() ? 1 - analyzedPassed : 0;

	progressBar.find('#analyzed-bar'           ).css("width", percentage(analyzed));
	progressBar.find('#not-analyzed-bar'       ).css("width", percentage(notAnalyzed));

	progressBar.find('#passed-filter-bar'      ).css("width", percentage(analyzedPassed));
	progressBar.find('#not-passed-filter-bar'  ).css("width", percentage(analyzedNotPassed));

	if (geneCount > counts.analyzed && counts.analyzed > 0) {
		progressBar.find('#not-analyzed-bar'       ).text(notAnalyzedCount);

	} else {
		progressBar.find('#not-analyzed-bar'       ).text("");
	}

	// Show analyze progress counts on hover
	progressBar.find('#passed-filter-bar').attr("data-toggle", "tooltip");
	progressBar.find('#passed-filter-bar').attr("data-placement", "top");

	progressBar.find('#not-passed-filter-bar').attr("data-toggle", "tooltip");
	progressBar.find('#not-passed-filter-bar').attr("data-placement", "top");

	progressBar.find('#not-analyzed-bar').attr("data-toggle", "tooltip");
	progressBar.find('#not-analyzed-bar').attr("data-placement", "top");


	if (counts.analyzed > 0) {
		if (filterCard.hasFilters()) {
			progressBar.find('#passed-filter-bar'      ).text(counts.pass > 0 ? counts.pass : "");
		
			
			progressBar.find('#not-passed-filter-bar'  ).text(analyzedNotPassedCount > 0 ? analyzedNotPassedCount : "");

			progressBar.find('#passed-filter-bar'    ).attr("title", counts.pass > 0             ? counts.pass + " pass filter" : "");
			progressBar.find('#not-passed-filter-bar').attr("title", analyzedNotPassedCount > 0  ? analyzedNotPassedCount +  " fail filter" : "");
			
			progressBar.find('#not-analyzed-bar'     ).attr("title", notAnalyzedCount > 0        ? notAnalyzedCount + " not analyzed" : "");		
			progressBar.find('.text').html("&nbsp;");
			

		} else {
			progressBar.find('#not-passed-filter-bar'    ).text("");
			progressBar.find('#not-passed-filter-bar'    ).attr("title", "");
			
			if (geneCount > counts.analyzed) {
				progressBar.find('#passed-filter-bar'  ).text(counts.analyzed);
			} else {
				progressBar.find('#passed-filter-bar'  ).text("");
				progressBar.find("#analyze-all-progress .text").text(counts.analyzed + " analyzed");
			}

			progressBar.find('#passed-filter-bar').attr("title", counts.analyzed  + " analyzed");
			progressBar.find('#not-analyzed-bar' ).attr("title", notAnalyzedCount + " not analyzed");		

		}
	} else {
			progressBar.find('#passed-filter-bar').text("");
			progressBar.find('#passed-filter-bar'    ).attr("title", "");

			progressBar.find('#not-passed-filter-bar').text("");
			progressBar.find('#not-passed-filter-bar').attr("title", "");

			progressBar.find('#not-analyzed-bar'     ).attr("title", notAnalyzedCount + " not analyzed");		
	}



	// Refresh the standard filter count if it applies
	if (filterCard.hasFilters()) {
		var filterCountSelector = 'span.standard-filter-count #' + field + '-variant-count';
		// If a standard filter has been applied, update its counts
		if (clearStandardFilterCounts) {
			$('#standard-filter-panel .standard-filter-btn').parent().find(filterCountSelector).text("");
			$('#standard-filter-panel .standard-filter-btn').parent().find(filterCountSelector).addClass('hide');
		}
		if ($('#standard-filter-panel .standard-filter-btn.current').length > 0) {
			$('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).text(counts.pass);
			$('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).removeClass('hide');
			if (counts.pass == 0) {
				$('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).addClass("none");
			} else {
				$('#standard-filter-panel .standard-filter-btn.current').parent().find(filterCountSelector).removeClass("none");
			}

		}			
	}

	// Show a "some genes not analyzed" warning symbol next to standard filters.  Make sure
	// to exclude loaded variants from the warning when only alignments were provided
	if (notAnalyzedCount > 0 && (!getProbandVariantCard().model.isAlignmentsOnly() || field == 'called')) {
		var filterCountId = field + '-variant-count';
		$('#standard-filter-panel .variant-count').each( function(i,val) {
			if ($(val).attr('id') == filterCountId) {
				if ($(val).hasClass("hide")) {
					$(val).parent().find('#unanalyzed-warning').addClass("hide"); 
				} else {
					$(val).parent().find('#unanalyzed-warning').removeClass("hide"); 
				}				
			}
		})
	} else {
		$('#standard-filter-panel .standard-filter-btn.current').parent().find('#unanalyzed-warning').addClass("hide");
	}


}

CacheHelper.prototype.hideAnalyzeAllProgress = function() {
	$("#analyze-all-progress").addClass("hide");
	$("#analyze-all-progress .bar").css("width", "0%");	
}


CacheHelper.prototype.analyzeAll = function(analyzeCalledVariants = false) {
	var me = this;

	if (isAlignmentsOnly()) {
		analyzeCalledVariants = true;
	}

	if (analyzeCalledVariants) {
		me.showCallAllProgress = true;
	}

	me.showAnalyzeAllProgress();

	// Start over with a new queue of genes to be analyzed
	// is all of the genes that need to be analyzed (and cached.)
	me.genesToCache = [];
	me.cacheQueue = [];

	genesCard.getGeneNames().forEach(function(geneName) {		
		me.genesToCache.push(geneName);
	});
	me.cacheGenes(analyzeCalledVariants, function() {

		// After all genes have been cached, refresh the gene badges in case
		// filters were applied while genes were still in the process of being
		// analyzed.
		filterCard.filterGenes();
	});


}



CacheHelper.prototype.cacheGenes = function(analyzeCalledVariants, callback) {
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
		me.cacheGene(me.cacheQueue[i], analyzeCalledVariants, callback);
	}


}



CacheHelper.prototype.cacheGene = function(geneName, analyzeCalledVariants, callback) {
	var me = this;

	promiseGetGeneModel(geneName).then( function(geneModel) {
	    var geneObject = geneModel;
    	// Now that we have the gene model,
    	// load and annotate the variants for each
    	// sample (e.g. each variant card)
		me.geneBadgeLoaderDisplay.setPageCount(genesCard.getPageCount())
														 .addGene(geneName, genesCard.pageNumberForGene(geneName));


    	adjustGeneRegion(geneObject);
    	var transcript = getCanonicalTranscript(geneObject);
    	markCodingRegions(geneObject, transcript);
    	window.geneObjects[geneObject.gene_name.toUpperCase()] = geneObject;


		// This function will be performed once all loaded variants have been
		// analyzed and cached.  Joint call the variants for
		// the cached gene (if alignments provided and 'analyze all' 
		// included calling variants) and then determine the inheritance 
		// (if this is a trio)
    	var analyzeVariantsForGene = function(geneObject, transcript, analyzeCalledVariants, callback) {
			if (analyzeCalledVariants) {					
				// If 'analyze all' including calling variants from alignments, perform
				// joint calling, then add clinvar annotations and determine the
				// 'delta' (new) variants that are not present in the gene's loaded variants
				cacheJointCallVariants(geneObject, transcript, null, 
					function(theGeneObject, theTranscript) {
						me._diffAndAnnotateCalledVariants(theGeneObject, theTranscript, analyzeCalledVariants, 
							function(theGeneObject1, theTranscript1) {
		    					me.processCachedTrio(theGeneObject1, theTranscript1, analyzeCalledVariants, true, callback);
		    					if (window.gene && window.gene.gene_name == theGeneObject1.gene_name) {
		    						genesCard.selectGene(theGeneObject1.gene_name);
		    					}
							})
					});
			} else {
				// Determine inheritance for the trio
				me.processCachedTrio(geneObject, transcript, analyzeCalledVariants, true, callback);
				if (window.gene && window.gene.gene_name == geneObject.gene_name) {
					genesCard.selectGene(geneObject.gene_name);
				}
			}
    	}

    	

	    if (me.isCachedForProband(geneObject, transcript, analyzeCalledVariants)) {

	    	// This gene has already been analyzed. Take this gene off of the queue and see
	    	// if next batch of genes should be analyzed
	    	genesCard._geneBadgeLoading(geneObject.gene_name, false);
	    	me.cacheNextGene(geneObject.gene_name, analyzeCalledVariants, callback);
	    
		
		} else {

			// The gene is ready to be analyzed.  Annotate the variants in the vcf for
			// this gene and if 'analyze all' includes calling variants, perform
			// joint calling as well.

			// Show that we are working on this gene
			genesCard._geneBadgeLoading(geneObject.gene_name, true);

			if (me.isCachedForCards(geneObject.gene_name, transcript) || isAlignmentsOnly()) {

				// If the 'analyze all' will include calling variants, the gene may already have loaded
				// variants (user has clicked on the gene).  In this case, we only want to invoke the
				// code to joint call the variants for the trio (and determine inheritance) once.  					
				analyzeVariantsForGene(geneObject, transcript, analyzeCalledVariants, callback);

			} else {
				// This is the time this gene's variants have been cached.
			    // For each sample, get and annotate the genes and
			    // cache the variants
		    	getRelevantVariantCards().forEach(function(variantCard) {

		    		if (dataCard.mode == 'trio' || variantCard == getProbandVariantCard()) {
			    		variantCard.model.promiseCacheVariants(
			    			geneObject.chr,
			    			geneObject, 
						 	transcript)
			    		.then( function(vcfData) {
							if (me.isCachedForCards(vcfData.gene.gene_name, vcfData.transcript)) {
								// Once all analysis of the gene variants for each of
								// the samples is complete, call variants (optional) and
								// process the trio to determine inheritance
				    			analyzeVariantsForGene(vcfData.gene, vcfData.transcript, analyzeCalledVariants, callback);
				    		}

			    		}, function(error) {

			    			// An error occurred.  Set the gene badge with an error glyph
			    			// and move on to analyzing the next gene
			    			genesCard.setGeneBadgeError(geneObject.gene_name);			    				
		    				var message = error.hasOwnProperty("message") ? error.message : error;
			    			console.log("problem caching data for gene " + geneObject.gene_name + ". " + message);
			    			genesCard._geneBadgeLoading(geneObject.gene_name, false);

							getVariantCard("proband").summarizeError(geneObject.gene_name, error);
	    					// take this gene off of the queue and see
	    					// if next batch of genes should be analyzed
				    		me.cacheNextGene(geneObject.gene_name, analyzeCalledVariants, callback);					
			    		});

		    		}

		    	});		
		    }				
		}
	    	

	},
	function(error) {
		genesCard.setGeneBadgeError(geneName);			    				
		console.log("problem caching data for gene " + geneName + ".");
		genesCard._geneBadgeLoading(geneName, false);
		getVariantCard("proband").summarizeError(geneName, error);
    	me.cacheNextGene(geneName, analyzeCalledVariants, callback);
	});

				
}

CacheHelper.prototype._diffAndAnnotateCalledVariants = function(geneObject, transcript, analyzeCalledVariants, callback) {
	var processedCount = 0;
	if (analyzeCalledVariants) {
		getRelevantVariantCards().forEach(function(vc) {
			vc.model.processCachedFreebayesVariants(geneObject, transcript, function(theFbData, theVcfData, theGeneObject, theTranscript) {

				// Cache the called variants now that they are fully annotated
				if (!vc.model._cacheData(theFbData, "fbData", theGeneObject.gene_name, theTranscript)) {
					console.log("unable to cache fb data for gene " + theGeneObject.gene_name);
					return;
				}

				// Re-cache the vcf data now that it has the called (and annotated) variants merged in
				if (!vc.model._cacheData(theVcfData, "vcfData", theGeneObject.gene_name, theTranscript)) {
					console.log("unable to cache vcf data for gene " + theGeneObject.gene_name);
					return;
				}

				processedCount++;
				if (processedCount == getRelevantVariantCards().length) {
					if (callback) {
						callback(theGeneObject, theTranscript);
					}
				}
			})
		})		
	} else {
		if (callback) {
			callback();
		}
	}

}

CacheHelper.prototype.processCachedTrio = function(geneObject, transcript, analyzeCalledVariants, cacheNext, callback) {
	var me = this;

	var trioVcfData = {proband: null, mother: null, father: null};
	var trioFbData  = {proband: null, mother: null, father: null};
	getRelevantVariantCards().forEach(function(vc) {
		var theVcfData = vc.model.getVcfDataForGene(geneObject, transcript);
		var theFbData  = vc.model.getFbDataForGene(geneObject, transcript);

		if (theVcfData == null) {
			theVcfData = {features: []};
		}

		if (theVcfData == null) {
			console.log("Unable to processCachedTrio for gene " + geneObject.gene_name + " because full proband data not available");
			genesCard.clearGeneGlyphs(geneObject.gene_name);
			genesCard.setGeneBadgeError(geneObject.gene_name);	
			if (cacheNext) {
				me.cacheNextGene(geneObject.gene_name, analyzeCalledVariants, callback);
			} else {
				callback();
			}
			return;
		}

		trioVcfData[vc.getRelationship()] = theVcfData;

		if (analyzeCalledVariants) {
			trioFbData[vc.getRelationship()] = theFbData;
		}
	});

	var trioModel = new VariantTrioModel(trioVcfData.proband, trioVcfData.mother, trioVcfData.father);
	trioModel.compareVariantsToMotherFather(function() {

		// Re-cache the vcf data and fb for the trio
		for (var relationship in trioVcfData) {
			if (analyzeCalledVariants) {
				// If we are calling variants during 'analyze all', then we need to refresh the called variants
				// with inheritance mode, allele counts and genotypes when inheritance for the trio was performed.
				// This method will re-cache the called variants.
				if (trioFbData[relationship]) {
					getVariantCard(relationship).model.loadCalledTrioGenotypes(trioVcfData[relationship], trioFbData[relationship], geneObject, transcript);
				}
			}

			if (!getVariantCard(relationship).model._cacheData(trioVcfData[relationship], "vcfData", geneObject.gene_name, transcript)) {
				console.log("unable to cache vcf data after inheritance determined for gene " + geneObject.gene_name);
				return;
			}
			
		}
				

		//
		// Now that inheritance has been determined,  analyze the alignments 
		// in the gene coding regions to get coverage metrics
		//
		promiseGetGeneCoverage(geneObject, transcript).then(function(geneCoverageAll) {

			//
			// Summarize the variants for the proband to create the gene badges, 
			// representing the most pathogenic variants for this gene
			//
			var filteredVcfData = getVariantCard('proband').model.filterVariants(trioVcfData.proband, filterCard.getFilterObject(), geneObject.start, geneObject.end, true);
			var options = {};
			if (analyzeCalledVariants) {
				options.CALLED = true;
			}


	  		var dangerObject = getVariantCard("proband").summarizeDanger(geneObject.gene_name, filteredVcfData, options, geneCoverageAll);
			getVariantCard('proband').model.cacheDangerSummary(dangerObject, geneObject.gene_name);

			genesCard._geneBadgeLoading(geneObject.gene_name, false);
			if (trioVcfData.proband.features.length == 0) {
				//genesCard.setGeneBadgeWarning(geneObject.gene_name);
			} else {
				genesCard.setGeneBadgeGlyphs(geneObject.gene_name, dangerObject, false);
			}

			
			// Now clear out mother and father from cache.  
			if (analyzeCalledVariants) {
				// Clear out the loaded variants for mom and dad.  (Keep called variants for mother
				// and father in cache as we need these to show allele counts and genotypes for trio
				// with determineInheritance() on selected gene is invoked)
				getVariantCard("mother" ).model.clearCacheItem("vcfData", geneObject.gene_name, transcript);					
				getVariantCard("father" ).model.clearCacheItem("vcfData", geneObject.gene_name, transcript);					

				// For alignments only analysis, the called variants were cached in as "vcfData" to process
				// the trio.  Now that the data is cached as "fbData", clear out the duplicate data 
				// for the proband.
				//if (getVariantCard("proband" ).model.isAlignmentsOnly()) {
				//	getVariantCard("proband").model.clearCacheItem("vcfData", geneObject.gene_name, transcript);	
				//}

				getVariantCard("proband" ).model.clearCacheItem("fbData", geneObject.gene_name, transcript);					


			} else if (window.gene == null || window.gene.gene_name != geneObject.gene_name) {
				// Don't clear cache for currently selected
				// gene though as this will result in no inheritance mode being detected.
				getVariantCard("mother" ).model.clearCacheItem("vcfData", geneObject.gene_name, transcript);					
				getVariantCard("father" ).model.clearCacheItem("vcfData", geneObject.gene_name, transcript);					
			}


			// We are done analyzing this gene. Take this gene off of the queue and see
			// if next batch of genes should be analyzed
			if (cacheNext) {
				me.cacheNextGene(geneObject.gene_name, analyzeCalledVariants, callback);
			} else {
				callback();
			}
		});



	}, 
	function(error) {
		console.log("problem determining inheritance for " + geneObject.gene_name + ". " + error);
		// take this gene off of the queue and see
		// if next batch of genes should be analyzed
		if (cacheNext) {
			me.cacheNextGene(geneObject.gene_name, analyzeCalledVariants,callback);
		} else {
			callback();
		}
	});
}

CacheHelper.prototype.isGeneInProgress = function(geneName) {
	return this.cacheQueue.indexOf(geneName) >= 0;
}

CacheHelper.prototype.cacheNextGene = function(geneName, analyzeCalledVariants, callback) {
	this.showAnalyzeAllProgress();

	this.geneBadgeLoaderDisplay.setPageCount(genesCard.getPageCount())
														 .removeGene(geneName);
	// Take the analyzed (and cached) gene off of the cache queue
	var idx = this.cacheQueue.indexOf(geneName);
	if (idx >= 0) {
		this.cacheQueue.splice(idx,1);
	} else {
		idx = this.cacheQueue.indexOf(geneName.toUpperCase());
		if (idx >= 0) {
			this.cacheQueue.splice(idx,1);
		} else {
			console.log("Unexpected error occurred during caching of genes.  Could not remove " + geneName + " from cache queue");
			if (callback) {
				callback();
			}
			return;
		}
	}
	// Invoke cacheGenes, which will kick off the next batch
	// of genes to analyze once all of the genes in
	// the current batch have been analyzed.
	this.cacheGenes(analyzeCalledVariants, callback);
}

CacheHelper.prototype.isCachedForProband = function(geneObject, transcript, checkForCalledVariants) {
	// If we are analyzing loaded variants, return true if the vcf data is cached (and inheritance loaded)
	// and we have danger summary for this gene.  If we are also analyzing called variants return true
	// if the above condition is met plus we have cached the called variants for this gene.
	return getProbandVariantCard().model.isCachedAndInheritanceDetermined(geneObject, transcript, checkForCalledVariants)
		|| (!checkForCalledVariants && getProbandVariantCard().model.getDangerSummaryForGene(geneObject.gene_name));
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
	var counts = {
		geneCount: 0,
		all:    {analyzed: 0, unanalyzed: 0, error: 0, pass: 0},
		loaded: {analyzed: 0, unanalyzed: 0, error: 0, pass: 0},
		called: {analyzed: 0, unanalyzed: 0, error: 0, pass: 0}
	}

	var incrementLoadedVsCalled = function(danger, counts, field) {
		if (danger) {
			counts.all[field]++;
			if (!isAlignmentsOnly() ) {
				counts.loaded[field]++;
			}
			if (danger.CALLED) {
				counts.called[field]++;
			}		
		}
	}

	genesCard.getGeneNames().forEach(function(geneName) {
		
    	counts.geneCount++;

		var key = getProbandVariantCard().model._getCacheKey("dangerSummary", geneName);
    	var danger = CacheHelper.getCachedData(key);

		if (danger != null) {
			
			incrementLoadedVsCalled(danger, counts, 'analyzed');

			if (danger.featureCount && danger.featureCount > 0) {
				counts.all.pass++;
				if (!isAlignmentsOnly() && danger.loadedCount && danger.loadedCount > 0) {
					counts.loaded.pass++;
				}
				if (danger.calledCount && danger.calledCount > 0) {
					counts.called.pass++;
				}
			}

		} else {
			incrementLoadedVsCalled(danger, counts, 'unanalyzed');		
		}

	});
	callback(counts);

}


CacheHelper.prototype.refreshGeneBadges = function(callback) {  
	var me = this;
	var geneCount = {total: 0, pass: 0};

	$('#gene-badges-loader').removeClass("hide");

	var theGeneNames = {};
	genesCard.getGeneNames().forEach(function(geneName) {
		theGeneNames[geneName] = true;
	});

	//var dataKind = getProbandVariantCard().model.isAlignmentsOnly() ? "fbData" : "vcfData";
	var dataKind = "vcfData";

	var keys = [];
	for (var i=0; i<=localStorage.length-1; i++) {  
		var key = localStorage.key(i);  
		keyObject = CacheHelper._parseCacheKey(key);
		if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {

		  	if (keyObject.dataKind == dataKind && keyObject.relationship == "proband" && theGeneNames[keyObject.gene]) {
		  		keys.push({'key': key, 'keyObject': keyObject});
		  	}
		 }
	}

	me.refreshNextGeneBadge(keys, geneCount, function() {
		genesCard.sortGenes();

		$('#gene-badges-loader').addClass("hide");

		callback();

	});

}


CacheHelper.prototype.refreshGeneBadgesGeneCoverage = function(refreshOnly=false) {  
	var me = this;


	var counts = {
		geneCount: 0,
		all:    {analyzed: 0, unanalyzed: 0, error: 0, pass: 0},
		loaded: {analyzed: 0, unanalyzed: 0, error: 0, pass: 0},
		called: {analyzed: 0, unanalyzed: 0, error: 0, pass: 0}
	}	

	$('#gene-badges-loader').removeClass("hide");

	var theGeneNames = {};
	genesCard.getGeneNames().forEach(function(geneName) {
		theGeneNames[geneName] = true;
	});

	for (var i=0; i<=localStorage.length-1; i++)  
	{  
		key = localStorage.key(i);  
		keyObject = CacheHelper._parseCacheKey(key);
		if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {

		  	if (keyObject.dataKind == 'vcfData' && keyObject.relationship == "proband" && theGeneNames[keyObject.gene]) {
		  		counts.geneCount++;

				var geneObject   = window.geneObjects[keyObject.gene];
				var geneCoverageAll = getCachedGeneCoverage(geneObject, {transcript_id: keyObject.transcript});					
				var dangerObject = getProbandVariantCard().model.getDangerSummaryForGene(geneObject.gene_name);
		 		
			 	if (geneCoverageAll && dangerObject) {
			 		var clearOtherDanger = refreshOnly ? false : true;
			 		VariantModel.summarizeDangerForGeneCoverage(dangerObject, geneCoverageAll, clearOtherDanger, refreshOnly);

			  		counts.all.analyzed++;
			  		counts.loaded.analyzed++;
			  		counts.called.analyzed++;
			 		if (dangerObject.geneCoverageProblem) {
			  			counts.all.pass++;
			  			counts.loaded.pass++;
			  			counts.called.pass++;
			  		}
					
			 		getProbandVariantCard().model.cacheDangerSummary(dangerObject, keyObject.gene);
					genesCard.setGeneBadgeGlyphs(keyObject.gene, dangerObject, false);
		 		} else {
			  		counts.all.unanalyzed++;
			  		counts.loaded.unanalyzed++;
			  		counts.called.unanalyzed++;

		 		}


		  	} 
		} 
	}  
	if (!refreshOnly) {
		genesCard.sortGenes(genesCard.LOW_COVERAGE_OPTION, true);
	}

	$('#gene-badges-loader').addClass("hide");
	return counts;
}

CacheHelper.prototype.clearCache = function(launchTimestampToClear) {
	var me = this;
	if (keepLocalStorage) {
		
	} else {
		me._clearCache(launchTimestampToClear, false, false);
		me.genesToCache = [];
	}
}

CacheHelper.prototype.refreshNextGeneBadge = function(keys, geneCount, callback) {
	var me = this;
	if (keys.length == 0) {
		callback();
	} else {
		var theKey    = keys.splice(0,1)[0];
		var key       = theKey.key;
		var keyObject = theKey.keyObject;
	  	var geneObject = window.geneObjects[keyObject.gene];

  		CacheHelper.getCachedDataMultithread(key, function(theVcfData) {
	  		var filteredVcfData = getVariantCard('proband').model.filterVariants(theVcfData, filterCard.getFilterObject(), geneObject.start, geneObject.end, true);
	  		
	  		geneCount.total++;
	  		if (filteredVcfData.features.length > 0) {
	  			geneCount.pass++;
	  		}

	  		var theFbData = null;
			var ds = getVariantCard("proband").model.getDangerSummaryForGene(geneObject.gene_name);
			if (theVcfData && theVcfData.features && ds && ds.CALLED) {
				theFbData = getVariantCard("proband").model.reconstituteFbData(theVcfData);
			}

			var options = {};
			if (theFbData) {
				options.CALLED = true;
			}

			var geneCoverageAll = getCachedGeneCoverage(geneObject,{ transcript_id: keyObject.transcript});

	  		var dangerObject = getVariantCard("proband").summarizeDanger(keyObject.gene, filteredVcfData, options, geneCoverageAll);

			getVariantCard('proband').model.cacheDangerSummary(dangerObject, keyObject.gene);
			
			genesCard.setGeneBadgeGlyphs(keyObject.gene, dangerObject, false);

			me.refreshNextGeneBadge(keys, geneCount, callback);	
  		});
	}
}

CacheHelper.prototype.getCacheKey = function(cacheObject) {
	var key =  "gene.iobio"  
		+ cacheHelper.KEY_DELIM + this.launchTimestamp
	    + cacheHelper.KEY_DELIM + cacheObject.relationship 
		+ cacheHelper.KEY_DELIM + cacheObject.sample
		+ cacheHelper.KEY_DELIM + cacheObject.gene
		+ cacheHelper.KEY_DELIM + cacheObject.transcript
		+ cacheHelper.KEY_DELIM + cacheObject.dataKind;
	if (cacheObject.dataKind != 'coverageData') {
	    key += cacheHelper.KEY_DELIM + cacheObject.annotationScheme;
	}
	return key;
}


CacheHelper.prototype.getCacheSize = function() {  // provide the size in bytes of the data currently stored
	var me = this;
	var size = 0;
	var otherSize = 0;
	var coverageSize = 0;
	var otherAppSize = 0;
	for (var i=0; i<=localStorage.length-1; i++)  
	{  
		key = localStorage.key(i);  
		var keyObject = CacheHelper._parseCacheKey(key);
		if (keyObject) {			
			if (keyObject.launchTimestamp == me.launchTimestamp) {
			  	var dataSize = localStorage.getItem(key).length;
			  	size     += dataSize;

			  	if (keyObject.dataKind == 'bamData') {
			  		coverageSize +=  dataSize;
			  	}
			  	
			} else {
				var dataSize = localStorage.getItem(key).length;
				otherSize += dataSize;
			}
		} else {
			otherAppSize += localStorage.getItem(key).length;
		}
	}  
	return {total:     (CacheHelper._sizeMB(size) + " MB"), 
	        coverage:  (CacheHelper._sizeMB(coverageSize) + " MB"),
	        other:     (CacheHelper._sizeMB(otherSize) + " MB"),
	        otherApp:  (CacheHelper._sizeMB(otherAppSize) + " MB")
	    };
}

CacheHelper._logCacheSize = function() {
	var cacheInfo = {};
	for (var i=0; i<=localStorage.length-1; i++)  
	{  
		var key = localStorage.key(i); 
		var keyPart = "";
		if (key.indexOf(cacheHelper.KEY_DELIM)) {
			keyPart = key.split(cacheHelper.KEY_DELIM)[0];
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

CacheHelper.prototype._clearCache = function(launchTimestampToClear, clearOther, clearOtherApp) {
	var me = this;
	var theLaunchTimeStamp = launchTimestampToClear ? launchTimestampToClear : me.launchTimestamp;
	if (localStorage) {
		//CacheHelper._logCacheSize();
		var keysToRemove = [];
		for (var i=0; i<=localStorage.length-1; i++)  {  
			var key = localStorage.key(i); 	
			var keyObject = CacheHelper._parseCacheKey(key);
			if (keyObject) {
				if (keyObject.launchTimestamp == theLaunchTimeStamp && !clearOther && !clearOtherApp) {
					keysToRemove.push(key);
					if (keyObject.gene && keyObject.relationship == 'proband') {
						genesCard.clearGeneGlyphs(keyObject.gene);
						genesCard.clearGeneInfo(keyObject.gene);

					}
				} else if (keyObject.launchTimestamp != theLaunchTimeStamp && clearOther && !clearOtherApp) {
					keysToRemove.push(key);
				}				
			} else if (clearOtherApp) {
				keysToRemove.push(key);
			}
		}	
		keysToRemove.forEach( function(key) {
			localStorage.removeItem(key);			
		})
		window.gene = null;
		genesCard._hideCurrentGene();
		me.hideAnalyzeAllProgress();
		//CacheHelper._logCacheSize();
		//CacheHelper._logCacheContents();
	}
}

CacheHelper.prototype.clearAll = function() {
	var me = this;
	// confirm dialog
	alertify.confirm("Clear all cached data for this session?", function (e) {
	    if (e) {
			// user clicked "ok"
			me._clearCache(me.launchTimestampToClear, false, false);
			cacheHelper.showAnalyzeAllProgress();
  			me.refreshDialog();
	        
	    } else {
	        // user clicked "cancel"
	    }
	})
	.set('labels', {ok:'OK', cancel:'Cancel'});   		;
}
CacheHelper.prototype.clearOther = function() {
	var me = this;
	// confirm dialog
	alertify.confirm("Clear all cached data for other gene.iobio sessions?", function (e) {
	    if (e) {
			// user clicked "ok"
			me._clearCache(null, true, false);
  			me.refreshDialog();
	        
	    } else {
	        // user clicked "cancel"
	    }
	    		
	})
	.set('labels', {ok:'OK', cancel:'Cancel'});   
}
CacheHelper.prototype.clearOtherApp = function() {
	var me = this;
	// confirm dialog
	alertify.confirm("Clear all cached data for other web applications?", function (e) {
	    if (e) {
			// user clicked "ok"
			me._clearCache(null, false, true);
  			me.refreshDialog();
	        
	    } else {
	        // user clicked "cancel"
	    }
	   
	}) .set('labels', {ok:'OK', cancel:'Cancel'});   		
}

CacheHelper.prototype.clearCoverageCache = function() {
	var me = this;
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
		var keyObject = CacheHelper._parseCacheKey(key);
	  		if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {
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
  		if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {
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
	$("#other-cache-size").text(sizes.other);
	$("#other-app-cache-size").text(sizes.otherApp);
}

CacheHelper.prototype.openDialog = function() {
	this.refreshDialog();
	$('#manage-cache-modal').modal('show');
}



CacheHelper.prototype.clearCacheForGene = function(geneName) {
	var me = this;
	var keys = me._getKeysForGene(geneName);
	keys.forEach( function(key) {
		localStorage[key] = "";
	});

	// Clear out the loading message by the page control for this gene
	me.geneBadgeLoaderDisplay.setPageCount(genesCard.getPageCount())
							 .removeGene(geneName);

	// Clear the gene out from the cache 'analyze all' queue
	if (me.isGeneInProgress(geneName)) {
		me.cacheNextGene(geneName);
	}
}


CacheHelper.prototype._getKeysForGene = function(geneName) {
	var me = this;
	var keys = [];
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
		var keyObject = CacheHelper._parseCacheKey(key);
		if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {
			if (keyObject.gene == geneName) {
				keys.push(key);
			}			
		}
	}
	return keys;
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
	if (cacheKey.indexOf(cacheHelper.KEY_DELIM) > 0) {
		var tokens = cacheKey.split(cacheHelper.KEY_DELIM);
		if (tokens.length >= 7 && tokens[0] == "gene.iobio") {
			var keyObject = { 
			     app: tokens[0],
			     launchTimestamp: tokens[1],
			     relationship: tokens[2], 
			     sample: tokens[3], 
			     gene: tokens[4], 
			     transcript: tokens[5], 
			     dataKind: tokens[6]
			};
			if (tokens.length == 8) {
				keyObject.annotationScheme = tokens[7]; 
			}
			return keyObject;

		} else {
			return null;
		}

	} else {
		return null;
	}

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


CacheHelper.getCachedDataMultithread = function(key, callback) {
	if (localStorage) {
      	var dataCompressed = localStorage.getItem(key);
      	if (dataCompressed != null) {

			var worker = new Worker('./app/model/cacheHelperWorker.js');	
			
			worker.onmessage = function(e) { 
				callback(e.data);
			};

			// We will also want to be notified if the worker runs into trouble
			worker.onerror = function(e) { 
				console.log('An error occurred while decompressing cached data:', e) 
				console.log("An error occurred when uncompressing data for key " + key);
				callback(null);
			};

			// Start the worker!
			worker.postMessage( { cmd: 'start', compressedData: dataCompressed });
		}

	} 
}


CacheHelper.showError = function(key, cacheError) {
	var cacheObject = CacheHelper._parseCacheKey(key);
	if (cacheObject) {
		var errorType = cacheError.name && cacheError.name.length > 0 ? cacheError.name : "A problem";
		var errorKey = cacheObject.gene + cacheHelper.KEY_DELIM + errorType;

		var consoleMessage = errorType + " occurred when caching analyzed " + cacheObject.dataKind + " data for gene " + cacheObject.gene + ". Click on 'Clear cache...' link to clear cache."
	    console.log(consoleMessage);
	    console.log(cacheError.toString());
	    
	    // Only show the error once
	    if (!recordedCacheErrors[errorKey]) {
	    	recordedCacheErrors[errorKey] = message;
		    var message = errorType + " occurred when caching analyzed data for gene " + cacheObject.gene + ". Unable to analyze remaining genes."
			alertify.alert(message, function() {
				recordedCacheErrors[errorKey] = null;			
			});	
	    }		
	}

}