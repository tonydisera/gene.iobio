function BookmarkCard() {
	this.bookmarkedVariants = {};
}

BookmarkCard.prototype.init = function() {
	var me = this;
	// Stop event propogation to get genes dropdown
	// so that clicks in text area for copy/paste
	// don't cause dropdown to close
	$('#import-bookmarks-dropdown ul li#copy-paste-li').on('click', function(event){
	    //The event won't be propagated to the document NODE and 
	    // therefore events delegated to document won't be fired
	    event.stopPropagation();
	});
	// Enter in copy/paste textarea should function as submit
	$('#import-bookmarks-dropdown ul li#copy-paste-li').keyup(function(event){

		if((event.which== 13) && ($(event.target)[0]== $("textarea#bookmarks-to-import")[0])) {
			event.stopPropagation();
			me.importBookmarks();
		}
	});	
	// Detect when get genes dropdown opens so that
	// we can prime the textarea with the genes already
	// selected
	$('#import-bookmarks-dropdown').click(function () {
	    if($(this).hasClass('open')) {
	        // dropdown just closed
	    } else {
	    	// dropdown will open
	    	me.initImportBookmarks();
	    	setTimeout(function() {
			  $('#bookmarks-to-import').focus();
			}, 0);
	    	
	    }
	});
}
BookmarkCard.prototype.initImportBookmarks = function() {

}

BookmarkCard.prototype.importBookmarks = function() {
	var me = this;

	//chrom	start	end	ref	alt	gene
	var bookmarksString = $('#bookmarks-to-import').val();
	// trim newline at very end
	bookmarksString = bookmarksString.replace(/\s*$/, "");

	
	me.bookmarkedVariants = {};
	var recs = bookmarksString.split("\n");
	recs.forEach( function(rec) {
		var fields = rec.split("\t");

		if (fields.length >= 6) {
			var chrom    = fields[0];
			var start    = +fields[1];
			var end      = +fields[2];
			var ref      = fields[3];
			var alt      = fields[4];
			var geneName = fields[5];

			
			var key = me.getBookmarkKey(geneName, chrom, start, ref, alt);
			if (me.bookmarkedVariants[key] == null) {
				me.bookmarkedVariants[key] = {isProxy: true, geneName: gene, chrom: chrom, start: +start, ref: ref, alt: alt};
			}

		}
		showSidebar("Bookmarks");
		me.showBookmarks();
	})



	$('#import-bookmarks-dropdown .btn-group').removeClass('open');	

}

BookmarkCard.prototype.reviseCoord = function(bookmarkEntry, gene) {
	var me = this;
	var revisedBookmarkEntry = $().extend(bookmarkEntry);

	// TODO:  Figure out coordinate space for GEMINI
	revisedBookmarkEntry.start++;

	// TODO: If gene is reverse strand, change ref alt to compliment
	if (gene.strand == "-") {
		revisedBookmarkEntry.alt = me.reverseBases(bookmarkEntry.alt);
		revisedBookmarkEntry.ref = me.reverseBases(bookmarkEntry.ref);
	}

	// TODO:  Normalize since variants are normalized

	return revisedBookmarkEntry;
}

BookmarkCard.prototype.reverseBases = function(bases) {
	var reversedBases = "";
	for (var i = 0; i < bases.length; i++) {
    	var base = bases.charAt(i);
    	var reverseBase = null;
    	if (base == 'A') {
    		reverseBase = 'T';
    	} else if (base == 'T') {
    		reverseBase = 'A';
    	} else if (base == 'C') {
    		reverseBase = 'G';
    	} else if (base == 'G') {
    		reverseBase = 'C';
    	}
    	reverseBases += reverseBase;
    }
    return reverseBases;
}

BookmarkCard.prototype.bookmarkVariant = function(variant) {
	if (variant) {
		var rsId = null;
		for (var key in variant.vepVariationIds) {
			if (key != 0 && key != '') {
				var tokens = key.split("&");
				tokens.forEach( function(id) {
					if (id.indexOf("rs") == 0) {
						rsId = id;
					}
				});
			}
		}

		var key = this.getBookmarkKey(gene.gene_name,  gene.chr, variant.start, variant.ref, variant.alt, rsId);
		if (this.bookmarkedVariants[key] == null) {
			this.bookmarkedVariants[key] = variant;
			getProbandVariantCard().unpin();
			getProbandVariantCard().bookmarkVariant(variant);			
		}
	}
}

BookmarkCard.prototype.getBookmarkKey = function(geneName, chrom, start, ref, alt, rsId) {
	return geneName + ": " 
         + chrom + " " + start  
         + " " + ref + "->" + alt
         + (rsId ? " "+rsId : "");
}

BookmarkCard.prototype.showBookmarks = function() {
	var me = this;
	var container = d3.select('#bookmark-card #bookmark-panel');
	container.selectAll('.bookmark').remove();

	
	container.selectAll(".bookmark")
	         .data(d3.entries(this.bookmarkedVariants))
	         .enter()
	         .append("a")
	         .attr("class", "bookmark")
	         .on('click', function(entry,i) {
	         	var geneName = entry.key.split(": ")[0];
				var bookmarkEntry = entry.value;
				var key = entry.key;

				if (window.gene.gene_name != geneName) {
					window.selectGene(geneName, function(variantCard) {
						if (variantCard.getRelationship() == 'proband') {
							var variant = null;
							if (bookmarkEntry.hasOwnProperty("isProxy")) {
								variant = getProbandVariantCard().getBookmarkedVariant(me.reviseCoord(bookmarkEntry, window.gene));
								if (variant) {
									me.bookmarkedVariants[key] = variant;
									entry.value = variant;
									me.showBookmarks();	
								} 
								addGeneBadge(geneName, true);										
								refreshCurrentGeneBadge();
							} else {
								variant = bookmarkEntry;
							}
							variantCard.bookmarkVariant(variant);
						}
					});
				} else {
					var variant = null;
					if (bookmarkEntry.hasOwnProperty("isProxy")) {
						variant = getProbandVariantCard().getBookmarkedVariant(me.reviseCoord(bookmarkEntry, window.gene));
						if (variant) {
							me.bookmarkedVariants[key] = variant;
							entry.value = variant;
							me.showBookmarks();									
						}
						addGeneBadge(geneName, true);	
						refreshCurrentGeneBadge();

					} else {
						variant = bookmarkEntry;
					}
					getProbandVariantCard().bookmarkVariant(variant);
				}
	         });

	container.selectAll(".bookmark")
	 		 .append("span")
	         .attr("class", "variant-symbols");

	 container.selectAll(".bookmark")
	 		 .append("span")
	         .attr("class", "variant-label");
	        
	container.selectAll(".bookmark span.variant-label")
	         .text(function(entry,i) {	         	
	         	return entry.key;
	         });


	container.selectAll(".bookmark .variant-symbols")
	         .each( function(entry, i) {
			    var selection = d3.select(this);
	         	var variant = entry.value;	         
	         	if (variant.impact) {
		         	for (var impact in variant.impact) {
	         			var svg = selection.append("svg")
									       .attr("class", "impact-badge")
									       .attr("height", 12)
									       .attr("width", 14);
			         	var impactClazz =  'impact_' + impact.toUpperCase();
			         	matrixCard.showImpactBadge(svg, variant, impactClazz);	         		
		         	}	         		
	         	}
	         	if (variant.clinVarClinicalSignificance) {
	         		for (var clinvar in variant.clinVarClinicalSignificance) {
	         			if (matrixCard.clinvarMap[clinvar]) {
			         		var clazz = matrixCard.clinvarMap[clinvar].clazz;
			         		var badge = matrixCard.clinvarMap[clinvar].badge;
			         		if (badge) {
								var options = {width:10, height:10, transform: 'translate(0,1)', clazz: clazz};
								var svg = selection.append("svg")
											       .attr("class", "clinvar-badge")
											       .attr("height", 12)
											       .attr("width", 14);
						        matrixCard.showClinVarSymbol(svg, options);	         		
			         		}
	         			}
	         		}
	         	}
	         	if (variant.vepSIFT) {
					for (var sift in variant.vepSIFT) {
						if (matrixCard.siftMap[sift]) {
			         		var clazz = matrixCard.siftMap[sift].clazz;
			         		var badge = matrixCard.siftMap[sift].badge;
			         		if (badge) {
								var options = {width:11, height:11, transform: 'translate(0,1)', clazz: clazz};
								var svg = selection.append("svg")
									        .attr("class", "sift-badge")
									        .attr("height", 12)
									        .attr("width", 14);
						        matrixCard.showSiftSymbol(svg, options);	         		
			         		}							
						}

	         		}
	         	}
	         	if (variant.vepPolyPhen) {
					for (var polyphen in variant.vepPolyPhen) {
						if (matrixCard.polyphenMap[polyphen]) {
			         		var clazz = matrixCard.polyphenMap[polyphen].clazz;
			         		var badge = matrixCard.polyphenMap[polyphen].badge;
			         		if (badge) {
								var options = {width:10, height:10, transform: 'translate(0,2)', clazz: clazz};
								var svg = selection.append("svg")
									        .attr("class", "polyphen-badge")
									        .attr("height", 12)
									        .attr("width", 14);
						        matrixCard.showPolyPhenSymbol(svg, options);	         		
			         		}
						}
	         		}
	         	}
	         	if (variant.inheritance) {
	         		if (variant.inheritance == 'recessive') {
						var svg = selection.append("svg")
									        .attr("class", "inheritance-badge")
									        .attr("height", 14)
									        .attr("width", 16);
						var options = {width: 18, height: 16, transform: "translate(-1,1)"};
						matrixCard.showRecessiveSymbol(svg, options);										        
	         		} else if (variant.inheritance == 'denovo') {
						var svg = selection.append("svg")
									        .attr("class", "inheritance-badge")
									        .attr("height", 14)
									        .attr("width", 16);
						var options = {width: 18, height: 16, transform: "translate(-1,1)"};
						matrixCard.showDeNovoSymbol(svg, options);				
	         		}
	         	}
	         });

	


}