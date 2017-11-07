var recordedCacheErrors = {};
var cacheErrorTypes = {};

function CacheHelper(loaderDisplay) {

	this.genesToCache = [];
	this.cacheQueue = [];
	this.batchSize = null;
	this.geneBadgeLoaderDisplay = loaderDisplay;
	this.showCallAllProgress = false;
	this.KEY_DELIM = "^";
	this.start = null;

}

CacheHelper.VCF_DATA            = "vcfData";
CacheHelper.BAM_DATA            = "bamData";
CacheHelper.FB_DATA             = "fbData";
CacheHelper.DANGER_SUMMARY_DATA = "dangerSummary";
CacheHelper.GENE_COVERAGE_DATA  = "geneCoverage";


CacheHelper.prototype.isolateSession = function() {
	this.launchTimestamp = Date.now().valueOf();	
}

CacheHelper.prototype.checkCacheSize = function() {
	var me = this;

	var counts = this.getCacheSize(false);
	$('#cache-alert1').addClass("hide");
	$("#other-app-cache-panel").removeClass("attention");

	$('#cache-alert2').addClass("hide");
	$("#other-cache-panel").removeClass("attention-warning");
	if (counts.other > 0) {
		$('#cache-alert2').removeClass("hide");
		$("#other-cache-panel").addClass("attention-warning");
		$("#other-cache-detail-link").attr("aria-expanded", true);
		$("#other-cache-detail").attr("aria-expanded", true);
		$("#other-cache-detail").addClass("in");
	} 

	if (counts.otherApp > 0) {
		$('#cache-alert1').removeClass("hide");
		$("#other-app-cache-panel").addClass("attention");
		$("#other-app-cache-detail-link").attr("aria-expanded", true);
		$("#other-app-cache-detail").attr("aria-expanded", true);
		$("#other-app-cache-detail").addClass("in");
	} 

	if (counts.other > 0 || counts.otherApp > 0) {
		alertify.confirm("Before proceeding, it is recommended that the browser's cache be cleared.", function (e) {
		    if (e) {
				// user clicked "ok", clear the cache for other, and other app
				if (counts.other > 0) {
					me._clearCache(null, true, false);
				}
				if (counts.otherApp > 0) {
					me._clearCache(null, false, true);
				}
		        
		    } 
		}, function() {
			// user clicked cancel
			me.openDialog();
		})
		.set('labels', {ok:'Yes, clear cache', cancel:'No, show me more details'});   		;
	}


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


	if (me.showCallAllProgress || counts.called.analyzed > 0 || counts.called.error > 0 ) {
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
	filterCard.setStandardFilterCount(field, counts, notAnalyzedCount, clearStandardFilterCounts);
	

}

CacheHelper.prototype.hideAnalyzeAllProgress = function() {
	$("#analyze-all-progress .bar").css("width", "0%");	

	$("#call-all-progress .bar").css("width", "0%");	
	$("#call-all-progress #not-analyzed-bar").text("");	
}


CacheHelper.prototype.analyzeAll = function(analyzeCalledVariants = false) {
	var me = this;

	if (isAlignmentsOnly()) {
		analyzeCalledVariants = true;
	}

	// Show the freebayes runtime args dialog first if dialog has not
	// yet been visited.   Note:  showFreebayesSettingsDialog() is a
	// pass-through if global settings allowFreebayesSettings is set
	// to false.
	if (analyzeCalledVariants && !fbSettings.visited) {
		showFreebayesSettingsDialog(function() {
			me._analyzeAllImpl(analyzeCalledVariants)
		})
	} else {
		me._analyzeAllImpl(analyzeCalledVariants)
	}
}

CacheHelper.prototype._analyzeAllImpl = function(analyzeCalledVariants) {
	var me = this;

	this.start = new Date();
	
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

		console.log("");
		console.log("******   ANALYZE ALL ELAPSED TIME *******");
		console.log((new Date() - me.start) / 10000 + " seconds ");
		console.log("*******************************************")
		console.log("");

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

	var transcript = null;
	var geneObject = null;

	promiseGetGeneModel(geneName)
	 .then( function(geneModel) {
	    geneObject = geneModel;
    	// Now that we have the gene model,
    	// load and annotate the variants for each
    	// sample (e.g. each variant card)
		me.geneBadgeLoaderDisplay.setPageCount(genesCard.getPageCount())
														 .addGene(geneName, genesCard.pageNumberForGene(geneName));


    	adjustGeneRegion(geneObject);
    	transcript = getCanonicalTranscript(geneObject);

    	window.geneObjects[geneObject.gene_name.toUpperCase()] = geneObject;

    	return promiseMarkCodingRegions(geneObject, transcript);
     })
     .then( function() {
    		

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
				cacheJointCallVariants(geneObject, transcript, false,  
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

    	
    	me.promiseIsCachedForProband(geneObject, transcript, analyzeCalledVariants)
    	 .then(function(data) {

    	 	var theGeneObject      = data.geneObject;
    	 	var theTranscript      = data.transcript;
    	 	var shouldCallVariants = data.shouldCallVariants;
    	 	var isCached           = data.isCached;


		    if (isCached) {

		    	// This gene has already been analyzed. Take this gene off of the queue and see
		    	// if next batch of genes should be analyzed
		    	genesCard._geneBadgeLoading(theGeneObject.gene_name, false);
		    	me.cacheNextGene(theGeneObject.gene_name, shouldCallVariants, callback);
		    
			
			} else {

				// The gene is ready to be analyzed.  Annotate the variants in the vcf for
				// this gene and if 'analyze all' includes calling variants, perform
				// joint calling as well.

				// Show that we are working on this gene
				genesCard._geneBadgeLoading(theGeneObject.gene_name, true);

				if (me.isCachedForCards(theGeneObject.gene_name, theTranscript) || isAlignmentsOnly()) {

					// If the 'analyze all' will include calling variants, the gene may already have loaded
					// variants (user has clicked on the gene).  In this case, we only want to invoke the
					// code to joint call the variants for the trio (and determine inheritance) once.  					
					analyzeVariantsForGene(theGeneObject, theTranscript, shouldCallVariants, callback);

				} else {


					if (dataCard.mode == 'trio' && samplesInSingleVcf()) {
						// We have a multi-sample vcf, so we only need to retrieve the vcf records once for
						// the proband and then obtain the genotypes for the mother/father and affected/unaffected
						// sibs.
						getProbandVariantCard().model.promiseGetVariantsMultipleSamples(theGeneObject, theTranscript, getRelevantVariantCards())
						  .then( function() {
						  	analyzeVariantsForGene(theGeneObject, theTranscript, shouldCallVariants, callback)

						  }, function(error) {
							// An error occurred.  Set the gene badge with an error glyph
			    			// and move on to analyzing the next gene
			    			genesCard.setGeneBadgeError(theGeneObject.gene_name);			    				
		    				var message = error.hasOwnProperty("message") ? error.message : error;
			    			console.log("problem caching data for gene " + theGeneObject.gene_name + ". " + message);
			    			genesCard._geneBadgeLoading(theGeneObject.gene_name, false);

							getProbandVariantCard().promiseSummarizeError(theGeneObject.gene_name, error)
							 .then(function(dangerObject) {
		    					// take this gene off of the queue and see
		    					// if next batch of genes should be analyzed
					    		me.cacheNextGene(theGeneObject.gene_name, shouldCallVariants, callback);										  								 	
							  },
							  function(error) {
							  	var msg = "A problem ocurred while summarizing error in CacheHelper.prototype.cacheGene(): " + error;
							  	console.log(msg);
							  	me.cacheNextGene(theGeneObject.gene_name, shouldCallVariants, callback);
							  })

						  })
					} else {
						// This is the time this gene's variants have been cached.
					    // For each sample, get and annotate the genes and
					    // cache the variants
				    	getRelevantVariantCards().forEach(function(variantCard) {

				    		if (dataCard.mode == 'trio' || variantCard == getProbandVariantCard()) {
					    		variantCard.model.promiseCacheVariants(
					    			theGeneObject.chr,
					    			theGeneObject, 
								 	theTranscript)
					    		.then( function(vcfData) {
									if (me.isCachedForCards(vcfData.gene.gene_name, vcfData.transcript)) {
										// Once all analysis of the gene variants for each of
										// the samples is complete, call variants (optional) and
										// process the trio to determine inheritance
						    			analyzeVariantsForGene(vcfData.gene, vcfData.transcript, shouldCallVariants, callback);
						    		}

					    		}, function(error) {

					    			// An error occurred.  Set the gene badge with an error glyph
					    			// and move on to analyzing the next gene
					    			genesCard.setGeneBadgeError(theGeneObject.gene_name);			    				
				    				var message = error.hasOwnProperty("message") ? error.message : error;
					    			console.log("problem caching data for gene " + theGeneObject.gene_name + ". " + message);
					    			genesCard._geneBadgeLoading(theGeneObject.gene_name, false);

									getVariantCard("proband").promiseSummarizeError(theGeneObject.gene_name, error)
									 .then(function(dangerObject) {
				    					// take this gene off of the queue and see
				    					// if next batch of genes should be analyzed
							    		me.cacheNextGene(theGeneObject.gene_name, shouldCallVariants, callback);														 	
									 },
									 function(error) {
									 	var msg = "A problem occurred when summarize error in CacheHelper.cacheGene(): " + error;
									 	console.log(msg);
							    		me.cacheNextGene(theGeneObject.gene_name, shouldCallVariants, callback);														 	
									 })
					    		});

				    		}

				    	});							
					}
			    }				
			}

    	 });

	    	

	 },
	 function(error) {
		genesCard.setGeneBadgeError(geneName);			    				
		console.log("problem caching data for gene " + geneName + ".");
		genesCard._geneBadgeLoading(geneName, false);
		getVariantCard("proband").promiseSummarizeError(geneName, error)
		 .then(function(dangerObject) {
	    	me.cacheNextGene(geneName, analyzeCalledVariants, callback);
		 },
		 function(error) {
		 	var msg = "A problem occurred while summarizing error in CacheHelper.cacheGene(): " + error;
		 	console.log(msg);
			me.cacheNextGene(geneName, analyzeCalledVariants, callback);
		 })
	 });

				
}

CacheHelper.prototype._diffAndAnnotateCalledVariants = function(geneObject, transcript, analyzeCalledVariants, callback) {
	var processedCount = 0;
	if (analyzeCalledVariants) {
		getRelevantVariantCards().forEach(function(vc) {
			vc.model.promiseProcessCachedFreebayesVariants(geneObject, transcript)
			.then( function(data) {

				var theFbData = data.fbData;
				var theVcfData = data.vcfData 
				var theGeneObject = data.geneObject;
				var theTranscript = data.transcript;


				// Cache the called variants now that they are fully annotated
				vc.model._promiseCacheData(theFbData, CacheHelper.FB_DATA, theGeneObject.gene_name, theTranscript)
				 .then(function() {
					// Re-cache the vcf data now that it has the called (and annotated) variants merged in
					return vc.model._promiseCacheData(theVcfData, CacheHelper.VCF_DATA, theGeneObject.gene_name, theTranscript);
				 })
				 .then(function() {
					processedCount++;
					if (processedCount == getRelevantVariantCards().length) {
						if (callback) {
							callback(theGeneObject, theTranscript);
						}
					}
				 }, 
				 function(error) {
					console.log("unable to cache data for gene " + theGeneObject.gene_name + " in CacheHelper._diffAndAnnotateCalledVariants(): " + error);		
					if (callback) {
						callback(null);
					}		 	
				 })

			},
			function(error) {
				var msg = "An error occurred in CacheHelper._diffAndAnnotateCalledVariants(): " + error;
				console.log(msg);
				callback();
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

	var promises = [];
	getRelevantVariantCards().forEach(function(vc) {

		var theFbData = null;
		var theVcfData = null;
		var theModel = null;
		var p = new Promise(function(resolve, reject) {

			vc.model.promiseGetFbData(geneObject, transcript)
			 .then(function(data) {
			 	theFbData  = data.fbData;
			 	theModel = data.model;
				return data.model.promiseGetVcfData(geneObject, transcript);
			 })
			 .then(function(data) {
			 	theVcfData = data.vcfData;

				if (theVcfData == null && analyzeCalledVariants && theFbData != null) {
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
					reject(msg);
				} else {
					trioVcfData[data.model.getRelationship()] = theVcfData;

					if (analyzeCalledVariants) {
						trioFbData[data.model.getRelationship()] = theFbData;
					}
					resolve();
				}

			 },
			 function(error) {
			 	var msg = "Problem occurred in VariantModel.processCachedTrio(): " + error;
			 	console.log(msg);
		 		genesCard.clearGeneGlyphs(geneObject.gene_name);
				genesCard.setGeneBadgeError(geneObject.gene_name);	
				if (cacheNext) {
					me.cacheNextGene(geneObject.gene_name, analyzeCalledVariants, callback);
				} else {
					callback();
				}
				reject(msg);

			 })


		})
		promises.push(p);
	});

	Promise.all(promises).then(function() {
		var trioModel = new VariantTrioModel(trioVcfData.proband, trioVcfData.mother, trioVcfData.father);
		trioModel.compareVariantsToMotherFather(function() {

			// Re-cache the vcf data and fb for the trio
			var cachePromises = [];
			for (var relationship in trioVcfData) {
				if (analyzeCalledVariants) {
					// If we are calling variants during 'analyze all', then we need to refresh the called variants
					// with inheritance mode, allele counts and genotypes when inheritance for the trio was performed.
					// This method will re-cache the called variants.
					if (trioFbData[relationship]) {
						getVariantCard(relationship).model.loadCalledTrioGenotypes(trioVcfData[relationship], trioFbData[relationship], geneObject, transcript);
					}
				}

				var p = getVariantCard(relationship).model._promiseCacheData(trioVcfData[relationship], CacheHelper.VCF_DATA, geneObject.gene_name, transcript);
				cachePromises.push(p);
				
			}

			Promise.all(cachePromises).then(function() {
				getRelevantVariantCards().forEach(function(vc) {
					if (trioVcfData[vc.getRelationship()]) {
						vc.model.performAdditionalParsing(trioVcfData[vc.getRelationship()], transcript);
					}
				})

				getProbandVariantCard().model.postInheritanceParsing(trioVcfData.proband, geneObject, transcript, getAffectedInfo(), function() {

					//
					// Now that inheritance has been determined,  analyze the alignments 
					// in the gene coding regions to get coverage metrics
					//
					promiseGetCachedGeneCoverage(geneObject, transcript).then(function(data) {
						var geneCoverageAll = data.geneCoverage;
						//
						// Summarize the variants for the proband to create the gene badges, 
						// representing the most pathogenic variants for this gene
						//
						var filteredVcfData = getVariantCard('proband').model.filterVariants(trioVcfData.proband, filterCard.getFilterObject(), geneObject.start, geneObject.end, true);
						var options = {};
						if (analyzeCalledVariants) {
							options.CALLED = true;
						}


				  		getVariantCard("proband").promiseSummarizeDanger(geneObject.gene_name, filteredVcfData, options, geneCoverageAll)
				  		 .then(function(dangerObject) {
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
								getVariantCard("mother" ).model.clearCacheItem(CacheHelper.VCF_DATA, geneObject.gene_name, transcript);					
								getVariantCard("father" ).model.clearCacheItem(CacheHelper.VCF_DATA, geneObject.gene_name, transcript);					
								getVariantCard("proband" ).model.clearCacheItem(CacheHelper.FB_DATA, geneObject.gene_name, transcript);					


							} else if (window.gene == null || window.gene.gene_name != geneObject.gene_name) {
								// Don't clear cache for currently selected
								// gene though as this will result in no inheritance mode being detected.
								getVariantCard("mother" ).model.clearCacheItem(CacheHelper.VCF_DATA, geneObject.gene_name, transcript);					
								getVariantCard("father" ).model.clearCacheItem(CacheHelper.VCF_DATA, geneObject.gene_name, transcript);					
							}


							// We are done analyzing this gene. Take this gene off of the queue and see
							// if next batch of genes should be analyzed
							if (cacheNext) {
								me.cacheNextGene(geneObject.gene_name, analyzeCalledVariants, callback);
							} else {
								callback();
							}

				  		 })

						});

				});
				

			})


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
	})


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

CacheHelper.prototype.promiseIsCachedForProband = function(geneObject, transcript, checkForCalledVariants) {
	return new Promise(function(resolve, reject) {
		// If we are analyzing loaded variants, return true if the vcf data is cached (and inheritance loaded)
		// and we have danger summary for this gene.  If we are also analyzing called variants return true
		// if the above condition is met plus we have cached the called variants for this gene.
		getProbandVariantCard().promiseGetDangerSummary(geneObject.gene_name)
		 .then(function(dangerSummary) {
			getProbandVariantCard().model.promiseIsCachedAndInheritanceDetermined(geneObject, transcript, checkForCalledVariants) 
			 .then(function(isCached) {
				if (isCached || (!checkForCalledVariants && dangerSummary)) {
					resolve({geneObject: geneObject, transcript: transcript, shouldCallVariants: checkForCalledVariants, isCached: true});
				} else {
					resolve({geneObject: geneObject, transcript: transcript, shouldCallVariants: checkForCalledVariants, isCached: false});
				}
			 })

		 }, function(error) {
		 	console.log("An error occurred in CacheHelper.isCachedForProband: " + error);
		 	resolve({geneObject: geneObject, transcript: transcript, shouldCallVariants: checkForCalledVariants, isCached: false});
		 });
	});
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
	var me = this;
	var counts = {
		geneCount: 0,
		all:    {analyzed: 0, unanalyzed: 0, error: 0, pass: 0},
		loaded: {analyzed: 0, unanalyzed: 0, error: 0, pass: 0},
		called: {analyzed: 0, unanalyzed: 0, error: 0, pass: 0}
	}

	// Clone the array of gene names
	var genesToCount = genesCard.getGeneNames().slice(0);

	// Sequentially examine the danger summary for each gene (recursive).
	// When all genes have been examined, the callback will be invoked
	// with the counts object.
	me.getNextGeneCounts(genesToCount, counts, callback);


}


CacheHelper.prototype.getNextGeneCounts = function(genesToCount, counts, callback) {
	var me = this;


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

	if (genesToCount.length == 0) {
		callback(counts);
	} else {
		// Remove the next gene from the list
		var geneName = genesToCount.splice(0,1);

		counts.geneCount++;

		var key = getProbandVariantCard().model._getCacheKey(CacheHelper.DANGER_SUMMARY_DATA, geneName);

		// Get danger summary for gene
    	CacheHelper.promiseGetData(key)
    		.then(function(danger) {
				if (danger != null) {
					
					// Increment the loaded variants count for the gene
					incrementLoadedVsCalled(danger, counts, 'analyzed');

					// Increment the called variant count for the gene
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
					// We don't have a danger summary for the gene.  Increment the unanlyzed count
					incrementLoadedVsCalled(danger, counts, 'unanalyzed');		
				}

				// Now get the counts for the next gene in the list
				me.getNextGeneCounts(genesToCount, counts, callback);

    		},
    		function(error) {
    			console.log("An error occurred in getAnalyzeAllCounts when calling promiseGetData: " + error);
    			callback(counts);
    		});		
	}


}


CacheHelper.prototype.refreshGeneBadges = function(callback) {  
	var me = this;
	var geneCount = {total: 0, pass: 0};

	$('#gene-badges-loader').removeClass("hide");

	var theGeneNames = {};
	genesCard.getGeneNames().forEach(function(geneName) {
		theGeneNames[geneName] = true;
	});
	
	var dataKind = CacheHelper.VCF_DATA;

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


CacheHelper.prototype.promiseRefreshGeneBadgesGeneCoverage = function(refreshOnly=false) {  
	var me = this;

	return new Promise(function(resolve, reject) {
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

		var thePromises = [];

		for (var i=0; i<=localStorage.length-1; i++)  
		{  
			key = localStorage.key(i);  
			keyObject = CacheHelper._parseCacheKey(key);
			if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {

			  	if (keyObject.dataKind == CacheHelper.VCF_DATA && keyObject.relationship == "proband" && theGeneNames[keyObject.gene]) {
			  		counts.geneCount++;

					var geneObject   = window.geneObjects[keyObject.gene];
					var p = promiseGetCachedGeneCoverage(geneObject, {transcript_id: keyObject.transcript})
					 .then(function(data) {
					 	var geneCoverageAll = data.geneCoverage;

						return getProbandVariantCard().promiseGetDangerSummary(data.gene.gene_name)
						 .then(function(dangerObject) {
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
								
						 		getProbandVariantCard().model.cacheDangerSummary(dangerObject, data.gene.gene_name);
								genesCard.setGeneBadgeGlyphs(data.gene.gene_name, dangerObject, false);
					 		} else {
						  		counts.all.unanalyzed++;
						  		counts.loaded.unanalyzed++;
						  		counts.called.unanalyzed++;

					 		}					 	
						 })
						 
				 		
	
					 }, function(error) {
					 	var msg = "Problem encountered in CacheHelper.refreshGeneBadgesGeneCoverage() " + error;
					 	console.log(msg);
					 	reject(msg);

					 });	

					 thePromises.push(p);
					 			


			  	} 
			} 
		}  

		Promise.all(thePromises).then(function() {
			if (!refreshOnly) {
				genesCard.sortGenes(genesCard.LOW_COVERAGE_OPTION, true);
			}

			$('#gene-badges-loader').addClass("hide");
			resolve(counts);		
		})		
	})


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

  		CacheHelper.promiseGetDataThreaded(key) 
  		 .then(function(theVcfData) {

	  		var filteredVcfData = getVariantCard('proband').model.filterVariants(theVcfData, filterCard.getFilterObject(), geneObject.start, geneObject.end, true);
	  		
	  		geneCount.total++;
	  		if (filteredVcfData.features.length > 0) {
	  			geneCount.pass++;
	  		}

	  		var theFbData = null;
			getVariantCard("proband").promiseGetDangerSummary(geneObject.gene_name)
			 .then(function(ds) {
				if (theVcfData && theVcfData.features && ds && ds.CALLED) {
					theFbData = getVariantCard("proband").model.reconstituteFbData(theVcfData);
				}

				var options = {};
				if (theFbData) {
					options.CALLED = true;
				}

				promiseGetCachedGeneCoverage(geneObject,{ transcript_id: keyObject.transcript})
				 .then(function(data) {
				 	var geneCoverageAll = data.geneCoverage;
			  		getVariantCard("proband").promiseSummarizeDanger(data.gene.gene_name, filteredVcfData, options, geneCoverageAll)
			  		 .then(function(dangerObject) {
						genesCard.setGeneBadgeGlyphs(data.gene.gene_name, dangerObject, false);
						me.refreshNextGeneBadge(keys, geneCount, callback);	
			  		 })
				 })

		 	
			 })


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
	if (cacheObject.dataKind != CacheHelper.GENE_COVERAGE_DATA) {
	    key += cacheHelper.KEY_DELIM + cacheObject.annotationScheme;
	}
	return key;
}


CacheHelper.prototype.getCacheSize = function(format=true) {  // provide the size in bytes of the data currently stored
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

			  	if (keyObject.dataKind == CacheHelper.BAM_DATA) {
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
	if (format) {
		return {total:     (CacheHelper._sizeMB(size) + " MB"), 
		        coverage:  (CacheHelper._sizeMB(coverageSize) + " MB"),
		        other:     (CacheHelper._sizeMB(otherSize) + " MB"),
		        otherApp:  (CacheHelper._sizeMB(otherAppSize) + " MB")
		    };
	} else {
		return {total:     (CacheHelper._sizeMB(size)), 
		        coverage:  (CacheHelper._sizeMB(coverageSize)),
		        other:     (CacheHelper._sizeMB(otherSize)),
		        otherApp:  (CacheHelper._sizeMB(otherAppSize))
		    };

	}

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
	var clearCurrentSessionCache = false;
	if (launchTimestampToClear == me.launchTimestamp) {
		clearCurrentSessionCache = true;
	}
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
		if (clearCurrentSessionCache) {
			window.gene = null;
			genesCard._hideCurrentGene();

			filterCard.clearFilters();
			if (window.variantCards && window.variantCards.length > 0) {
				filterVariants();
			}
			filterCard.resetStandardFilterCounts();

			me.hideAnalyzeAllProgress();			
		}

		if (clearOther || clearOtherApp) {
			me.checkCacheSize();
		}
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
	        
	    } 
	}, function() {
		// user clicked "cancel"
	})
	.set('labels', {ok:'OK', cancel:'Cancel'});   		;
}
CacheHelper.prototype.clearOther = function() {
	var me = this;
	// confirm dialog
	alertify.confirm("Clear all cached data for other gene.iobio sessions?  IMPORTANT: To save analysis, bookmark any variants of interest in other browser tabs before clearing the cache.", function (e) {
	    if (e) {
			// user clicked "ok"
			me._clearCache(null, true, false);
  			me.refreshDialog();
	        
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
	        
	    }
	   
	}) .set('labels', {ok:'OK', cancel:'Cancel'});   		
}

CacheHelper.prototype.clearCoverageCache = function() {
	var me = this;
	for (var i=0; i<=localStorage.length-1; i++)  {  
  		var key = localStorage.key(i); 	
		var keyObject = CacheHelper._parseCacheKey(key);
	  		if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {
				if (keyObject.dataKind == CacheHelper.BAM_DATA) {
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
		&& ( cacheObject.dataKind == CacheHelper.VCF_DATA  || cacheObject.dataKind == CacheHelper.FB_DATA)
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

CacheHelper.showError = function(key, cacheError) {
	var cacheObject = CacheHelper._parseCacheKey(key);
	if (cacheObject) {

		var errorCount = cacheErrorTypes[cacheError.name];
		if (errorCount == null) {
			errorCount = 0;
		}
		errorCount++;
		cacheErrorTypes[cacheError.name] = errorCount;

		var errorType = cacheError.name && cacheError.name.length > 0 ? cacheError.name : "A problem";
		var errorKey = cacheObject.gene + cacheHelper.KEY_DELIM + errorType;

		var consoleMessage = errorType + " occurred when caching analyzed " + cacheObject.dataKind + " data for gene " + cacheObject.gene + ". Click on 'Clear cache...' link to clear cache."
	    console.log(consoleMessage);
	    console.log(cacheError.toString());
	    
	    // Only show the error once
	    if (!recordedCacheErrors[errorKey] ) {
	    	recordedCacheErrors[errorKey] = message;
		    var message = errorType + " occurred when caching analyzed data for gene " + cacheObject.gene + ". Unable to analyze remaining genes.  Click on 'Clear cache...' link to clear cache.";
		    // If we have shown this kind of cache error 2 times already, just show in right hand corner instead
		    // of showning dialog with ok/cancel.
			if (errorCount < 3) {
				alertify.alert(message, function() {
					recordedCacheErrors[errorKey] = null;			
				});					
			} else if (errorCount < 8) { 
		    	var msg = "<span style='font-size:12px'>" + message + "</span>";
		    	alertify.set('notifier','position', 'top-right');
		    	alertify.error(msg,  5);				
				recordedCacheErrors[errorKey] = null;			
			}
	    }		
	}

}

CacheHelper.useLocalStorage = function() {
	return window.global_browserCache == BROWSER_CACHE_LOCAL_STORAGE;
}
CacheHelper.useIndexedDB = function() {
	return window.global_browserCache == BROWSER_CACHE_INDEXED_DB;
}

CacheHelper.promiseGetData = function(key, decompressIt=true) {
	var me = this;
	return new Promise(function(resolve, reject) {

		if (CacheHelper.useLocalStorage()) {
			if (localStorage) {
		      	var dataCompressed = localStorage.getItem(key);
		      	if (decompressIt) {
			      	if (dataCompressed != null && dataCompressed != "") {
						var dataString = null;
						try {
							 dataString = LZString.decompressFromUTF16(dataCompressed);
				 			 data =  JSON.parse(dataString);    
				 			 resolve(data);  		
						} catch(e) {
							var errorMsg = "an error occurred when uncompressing vcf data for key " + key;
							console.log(errorMsg);
							reject(errorMsg);
						}
			      	} else {
			      		resolve(null);
			      	}
			    } else {
			    	resolve(dataCompressed);
			    }
		    } 
		} else if (CacheHelper.useIndexedDB()) {
			return me.cacheIndexStore.promiseGetData(key, decompressIt);
		} else {
			reject("Unable to determine browser cache method")
		}
	})

}


CacheHelper.promiseGetDataThreaded = function(key) {

	return new Promise(function(resolve, reject) {
		CacheHelper.promiseGetData(key, false)
		 .then(function(dataCompressed) {

	      	if (dataCompressed != null) {

				var worker = new Worker('./app/model/cacheHelperWorker.js');	
				
				worker.onmessage = function(e) { 
					resolve(e.data);
				};

				// We will also want to be notified if the worker runs into trouble
				worker.onerror = function(e) { 
					console.log("An error occurred when uncompressing data for key " + key);
					var msg = 'An error occurred while decompressing cached data:' + e;
					console.log(msg) 
					reject(msg);
				};

				// Start the worker!
				worker.postMessage( { cmd: 'start', compressedData: dataCompressed });
			} else {
				resolve(null);
			}

		 },
		 function(error) {
		 	var msg = "An error occurred in CacheHelper.promiseGetDataThreaded(): " + error;
		 	console.log(msg);
		 	reject(msg);
		 });		
	})

}




