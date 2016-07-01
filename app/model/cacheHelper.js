var recordedCacheErrors = {};

function CacheHelper() {
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