 function GenesCard() {
	this.geneBarChart = null;
}

GenesCard.prototype.split = function( val )  {
	return val.replace(/^\s+|\s+$/g, "").split( /;\n*/ );
}

GenesCard.prototype.extractLast = function( term ) {
	return this.split( term ).pop();
}

GenesCard.prototype.init = function() {
	var me = this;

	var hpoUrl = hpoServer + "hot/lookup";


	 // don't navigate away from the field on tab when selecting an item
    $( "#phenolyzer-search-terms" )
       .bind( "keydown", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).autocomplete( "instance" ).menu.active ) {
          event.preventDefault();
        }
      })
      .autocomplete({
        source: function( request, response ) {
          $.getJSON( hpoUrl, {
            term: me.extractLast( request.term )
          }, response );
        },
        search: function() {
          // custom minLength
          var term = me.extractLast( this.value );
          if ( term.length < 2 ) {
            return false;
          }
        },
        focus: function() {
          // prevent value inserted on focus
          return false;
        },
        select: function( event, ui ) {
          var terms = me.split( this.value );
          // remove the current input
          terms.pop();
          // add the selected item
          terms.push( ui.item.value );
          // add placeholder to get the comma-and-space at the end
          terms.push( "" );
          this.value = terms.join( ";\n" );
          return false;
        }
      });

	// Detect when get genes dropdown opens so that
	// we can prime the textarea with the genes already
	// selected
	$('#get-genes-dropdown').click(function () {
	    if($(this).hasClass('open')) {
	        // dropdown just closed
	    } else {
	    	// dropdown will open
	    	me.initCopyPasteGenes();
	    	setTimeout(function() {
			  $('#genes-to-copy').focus();
			}, 0);
	    	
	    }
	});

	// Stop event propogation to get genes dropdown
	// so that clicks in text area for copy/paste
	// don't cause dropdown to close
	$('#get-genes-dropdown ul li#copy-paste-li').on('click', function(event){
	    //The event won't be propagated to the document NODE and 
	    // therefore events delegated to document won't be fired
	    event.stopPropagation();
	});
	// Enter in copy/paste textarea should function as newline
	$('#get-genes-dropdown ul li#copy-paste-li').keyup(function(event){

		if((event.which== 13) && ($(event.target)[0]== $("textarea#genes-to-copy")[0])) {
			event.stopPropagation();
		}
	});	

}

GenesCard.prototype.initCopyPasteGenes = function() {
	var me = this;
	if (geneNames.length == 0 || geneNames == null) {
		$('#genes-to-copy').val("");
	} else {
		$('#genes-to-copy').val(geneNames.join(", "));
	}
}


GenesCard.prototype.copyPasteGenes = function(geneNameToSelect) {
	var me = this;


	var genesString = $('#genes-to-copy').val();
	// trim newline at very end
	genesString = genesString.replace(/\s*$/, "");
	var geneNameList = null;
	if (genesString.indexOf("\n") > 0) {
		geneNameList = genesString.split("\n");
	} else if (genesString.indexOf("\t") > 0 ) {
		geneNameList = genesString.split("\t");
	} else if (genesString.indexOf(",") > 0) {
		geneNameList = genesString.split(" ").join("").split(",");
	} else if (genesString.indexOf(" ") > 0) {
		geneNameList = genesString.split(" ");
	} else {
		geneNameList = [];
		geneNameList.push(genesString.trim());
	}

	geneNames = [];
	geneNameList.forEach( function(geneName) {
		if (geneName.trim().length > 0) {
			geneNames.push(geneName.trim().toUpperCase());
		}
	});

	// Remove gene badges not specified in the text area
	var geneBadgesToRemove = [];
	$('#gene-badge-container #gene-badge').each( function(index, value) {
		var badge =  $(this);
		var badgeGeneName = badge.find('#gene-badge-name').text();
		
		// If this badge does not correspond to a name in the gene list,
		// flag it to be removed		
		if (geneNames.indexOf(badgeGeneName) < 0) {
			geneBadgesToRemove.push(badgeGeneName);
		}

	});
	geneBadgesToRemove.forEach( function(geneName) {
		var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')";	
		$(selector).parent().parent().remove();
	});



	if (geneNames.length > 0) {
		$('#gene-badge-container #manage-gene-list').removeClass("hide");
		$('#gene-badge-container #clear-gene-list').removeClass("hide");
	} else {
		$('#gene-badge-container #manage-gene-list').addClass("hide");
		$('#gene-badge-container #done-manage-gene-list').addClass("hide");
		$('#gene-badge-container #clear-gene-list').addClass("hide");
	}

	// Create a gene badge for each gene name in the comma separated list.
	for(var i = 0; i < geneNames.length; i++) {
		var name = geneNames[i];	
		// Only add the gene badge if it does not already exist
		var existingBadge = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + name + "')";	
		if ($(existingBadge).length == 0) {
			var newBadgeSelector = '#gene-badge-container #gene-badge:last-child';	
			me.addGeneBadge(name, true);
		} else {
			me._setBookmarkBadge(name);
		}
	}

	// If we are loading from the url, just add the class 'selected' to the gene specified in the 
	// url.  Otherwise if we are performing copy/paste from the dropdown, select the first gene in the list
	if (geneNames.length > 0 && geneNameToSelect && geneNames.indexOf(geneNameToSelect) >= 0) {
		var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneNameToSelect + "')").parent().parent();
		geneBadge.addClass("selected");
		if (hasDataSources()) {
			geneBadge.find('.gene-badge-loader').removeClass('hide');
		}
	} else if (geneNames.length > 0 && geneNameToSelect == null) {
		me.selectGene(geneNames[0]);
	}

	me._onGeneBadgeUpdate();

	$('#get-genes-dropdown .btn-group').removeClass('open');	
}

// Handle ACMG56 genes.
GenesCard.prototype.ACMGGenes = function(geneNameToSelect) {
	var me = this;

	geneNames = ["BRCA1", "BRCA2", "TP53", "STK11", "MLH1", "MSH2", "MSH6", "PMS2", "APC", "MUTYH", "VHL", "MEN1", "RET", "PTEN", "RB1", "SDHD", "SDHAF2", "SDHC", "SDHB", "TSC1", "TSC2", "WT1", "NF2", "COL3A1", "FBN1", "TGFBR1", "TGFBR2", "SMAD3", "ACTA2", "MYLK", "MYH11", "MYBPC3", "MYH7", "TNNT2", "TNNI3", "TPM1", "MYL3", "ACTC1", "PRKAG2", "GLA", "MYL2", "LMNA", "RYR2", "PKP2", "DSP", "DSC2", "TMEM43", "DSG2", "KCNQ1", "KCNH2", "SCN5A", "LDLR", "APOB", "PCSK9", "RYR1", "CACNA1S"];

	// Remove gene badges not specified in the text area
	var geneBadgesToRemove = [];
	$('#gene-badge-container #gene-badge').each( function(index, value) {
		var badge =  $(this);
		var badgeGeneName = badge.find('#gene-badge-name').text();
		
		// If this badge does not correspond to a name in the gene list,
		// flag it to be removed		
		if (geneNames.indexOf(badgeGeneName) < 0) {
			geneBadgesToRemove.push(badgeGeneName);
		}

	});
	geneBadgesToRemove.forEach( function(geneName) {
		var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')";	
		$(selector).parent().parent().remove();
	});



	if (geneNames.length > 0) {
		$('#gene-badge-container #manage-gene-list').removeClass("hide");
		$('#gene-badge-container #clear-gene-list').removeClass("hide");
	} else {
		$('#gene-badge-container #manage-gene-list').addClass("hide");
		$('#gene-badge-container #done-manage-gene-list').addClass("hide");
		$('#gene-badge-container #clear-gene-list').addClass("hide");
	}

	// Create a gene badge for each gene name in the comma separated list.
	for(var i = 0; i < geneNames.length; i++) {
		var name = geneNames[i];	
		// Only add the gene badge if it does not already exist
		var existingBadge = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + name + "')";	
		if ($(existingBadge).length == 0) {
			var newBadgeSelector = '#gene-badge-container #gene-badge:last-child';	
			me.addGeneBadge(name, true);
		}
	}

	// If we are loading from the url, just add the class 'selected' to the gene specified in the 
	// url.  Otherwise if we are performing copy/paste from the dropdown, select the first gene in the list
	if (geneNames.length > 0 && geneNameToSelect && geneNames.indexOf(geneNameToSelect) >= 0) {
		var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneNameToSelect + "')").parent().parent();
		geneBadge.addClass("selected");
		if (hasDataSources()) {
			geneBadge.find('.gene-badge-loader').removeClass('hide');
		}
	} else if (geneNames.length > 0 && geneNameToSelect == null) {
		me.selectGene(geneNames[0]);
	}

	me._onGeneBadgeUpdate();

	$('#get-genes-dropdown .btn-group').removeClass('open');	
}

GenesCard.prototype.getPhenolyzerGenes = function() {
	var me = this;

	me.showGenesSlideLeft();

	$('.phenolyzer.loader .loader-label').text("Phenolyzer job submitted...")
	$('.phenolyzer.loader').removeClass("hide");
	$("#phenolyzer-timeout-message").addClass("hide");
	$('#phenolyzer-heading').addClass("hide");

	var searchTerms = $('#phenolyzer-search-terms').val();
	$("#phenolyzer-search-term").text(searchTerms);	

	// Get rid of newlines
	searchTerms = searchTerms.split("\n").join("")
	// Remove ending delimiter
	if (searchTerms.lastIndexOf(";") == searchTerms.length-1) {
		searchTerms = searchTerms.substring(0, searchTerms.length - 1);
	}
	// Replace semicolon with a colon (semicolon causes term to be truncated)
	searchTerms = searchTerms.split(";").join(":");

	var url = phenolyzerServer + '?term=' + searchTerms;
	d3.select('#phenolyzer-results svg').remove();
   	phenolyzerGenes = [];

	this._getPhenolyzerGenesImpl(url);
}


GenesCard.prototype._getPhenolyzerGenesImpl = function(url) {
	var me = this;
	
	$.ajax({
		    url: url,		    
		    type: "GET",
		    dataType: "json",
		    success: function( data ) {		    	

			 	if (data == "") {			
					me.showGenesSlideLeft();
					$('.phenolyzer.loader').addClass("hide");
					$("#phenolyzer-timeout-message").removeClass("hide");
			 	} else if (data.record == 'queued') {
			 		$('.phenolyzer.loader .loader-label').text("Phenolyzer job queued...")
			 		setTimeout(function() {
	     			  me._getPhenolyzerGenesImpl(url);
	     			}, 5000);
			 	} else if (data.record == 'pending') {
			 		$('.phenolyzer.loader .loader-label').text("Running Phenolyzer...")
			 		setTimeout(function() {
	     			  me._getPhenolyzerGenesImpl(url);
	     			}, 5000);
			 	} else {
			 		me.showGenesSlideLeft();
					$('.phenolyzer.loader').addClass("hide");
					$('#phenolyzer-heading').removeClass("hide");
					var geneNamesString = "";
					var count = 0;
					var selectedEnd   = +$('#phenolyzer-select-range-end').val();
					data.record.split("\n").forEach( function(rec) {
						var fields = rec.split("\t");
						if (fields.length > 2) {
							var geneName  		         = fields[1];
							if (count < 300) {
								var rank                 = fields[0];
								var score                = fields[3];
								var haploInsuffScore     = fields[5];
								var geneIntoleranceScore = fields[6];
								var selected             = count < selectedEnd ? true : false;
								phenolyzerGenes.push({rank: rank, geneName: geneName, score: score, haploInsuffScore: haploInsuffScore, geneIntoleranceScore: geneIntoleranceScore, selected: selected});					
							}				
							count++;

						}
					});
					
					me.showGenesSlideLeft();
					

					me.refreshSelectedPhenolyzerGenes(); 		
			 	}  

		    },
		    fail: function() {
		    	closeSlideLeft(); 
				$('.phenolyzer.loader').addClass("hide");
				alert("An error occurred in Phenolyzer iobio services. " + thrownError);
		    }



	});

	$('#get-genes-dropdown .btn-group').removeClass('open');

}

GenesCard.prototype.isPhenolyzerGene = function(geneName) {
	var foundGenes = phenolyzerGenes.filter( function(phenGene) { 
		return phenGene.selected && phenGene.geneName == geneName;
	});
	return foundGenes.length > 0;
}

GenesCard.prototype.highlightPhenolyzerGenes = function() {
	var me = this;
	$('#gene-badge-container #gene-badge').each( function(index, value) {
		var badge =  $(this);
		var badgeGeneName = badge.find('#gene-badge-name').text();
		if (me.isPhenolyzerGene(badgeGeneName)) {
			badge.addClass("phenolyzer");
		} else {
			badge.removeClass("phenolyzer");
		}
	});
}

GenesCard.prototype.refreshSelectedPhenolyzerGenes = function() {
	var me = this;
	var selectedPhenoGenes = phenolyzerGenes.filter( function(phenGene) { return phenGene.selected == true});

	// Don't throw away the genes we already have loaded, but do get rid of any that are
	// in the phenolyzer gene list as we want these to stay grouped (and order by rank).
	selectedPhenoGenes.forEach( function(phenoGene) {
		geneNames = geneNames.filter(function(geneName) {
			return geneName != phenoGene.geneName; 
		})
		var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + phenoGene.geneName + "')";	
		if (selector && selector.length > 0) {
			$(selector).parent().parent().remove();
		}
	});

	// Now create a comma delimited list of all existing genes + selected phenolyzer genes
	var genesString = geneNames.join(",");
	selectedPhenoGenes.forEach( function(g) {
		if (genesString.length > 0) {
			genesString += ",";
		}
		genesString += g.geneName;
	})
	$('#genes-to-copy').val(genesString);
	
	me.copyPasteGenes();	
	me.highlightPhenolyzerGenes();	
}

GenesCard.prototype.refreshBookmarkedGenes = function(bookmarkedGenes) {
	var me = this;

	// Don't throw away the genes we already have loaded, but do get rid of any that are
	// in the bookmarked gene list as we want these to stay grouped (and order by rank).
	// The exception is phenolyzer genes.  Just keep them in the order already listed.
	var selectedPhenoGeneObject  = phenolyzerGenes
	   .filter( function(phenGene) { 
	   		return phenGene.selected == true
	   })
	   .reduce(function(object, phenoGene) {
  			object[phenoGene.geneName] = phenoGene; 
  			return object;
		}, {});
	geneNames = geneNames.filter(function(geneName) {
		var bookmarkedGene = bookmarkedGenes[geneName];
		var phenolyzerGene = selectedPhenoGeneObject[geneName];
		var keep =  phenolyzerGene || !bookmarkedGene;
		if (!keep) {
			var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')";	
			if (selector && selector.length > 0) {
				$(selector).parent().parent().remove();
			}
		}
		return keep;
	})

	// Now create a comma delimited list of all existing genes + selected phenolyzer genes
	var genesString = geneNames.join(",");
	for (var bookmarkedGene in bookmarkedGenes) {
		var phenolyzerGene = selectedPhenoGeneObject[bookmarkedGene];
		if (!phenolyzerGene) {
			if (genesString.length > 0) {
				genesString += ",";
			}
			genesString += bookmarkedGene;
		}
	}
	$('#genes-to-copy').val(genesString);
	
	me.copyPasteGenes();	
}

GenesCard.prototype._onGeneBadgeUpdate = function() {
	var me = this;

	// Only show the gene badges if there is more than one gene in the list
	if (geneNames.length > 1) {
		$('#gene-badge-container').removeClass("hide");
	} else {
		$('#gene-badge-container').addClass("hide");		
	}

	// Update the url with the gene list
	updateUrl('genes', geneNames.join(","));

}

GenesCard.prototype.promiseSetGeneAnnot = function(geneBadgeSelector, name) {
	var me = this;

	return new Promise( function(resolve, reject) {
		// Get the gene info (name, description) from ncbi
		me.promiseGetGeneAnnotation(name).then( function(geneAnnot) {
			//geneBadgeSelector.find('#gene-badge-button').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
			geneAnnots[name] = geneAnnot;
			d3.select(geneBadgeSelector).data([geneAnnot]);

			resolve(geneAnnot);

		}, function(error) {
			reject("problem getting gene info from ncbi. " + error);
		});

	});
}

GenesCard.prototype.removeGeneBadgeByName = function(theGeneName) {
	var me = this;

	var index = geneNames.indexOf(theGeneName);
	if (index >= 0) {
		geneNames.splice(index, 1);
		var geneBadgeName = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + theGeneName + "')";	
		$(geneBadgeName).parent().parent().remove();
		me._onGeneBadgeUpdate();
	}
	delete geneObjects[theGeneName];
	delete geneAnnots[theGeneName];


}

GenesCard.prototype.clearGenes = function() {
	var me = this;
	// confirm dialog
	alertify.set({ buttonReverse: true });
	alertify.confirm("Clear all genes currently listed?", function (e) {
	    if (e) {
			// user clicked "ok"
	        me._clearGenesImpl();
	    } else {
	        // user clicked "cancel"
	    }
	});

}

GenesCard.prototype._clearGenesImpl = function() {
	var me = this;
	while (geneNames.length > 0) {
		var theGeneName = geneNames[0];
		
		geneNames.splice(0, 1);
		var geneBadgeName = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + theGeneName + "')";	
		$(geneBadgeName).parent().parent().remove();
		
		delete geneObjects[theGeneName];
		delete geneAnnots[theGeneName];
	};
	me._onGeneBadgeUpdate();
	readjustCards();	
}



GenesCard.prototype.removeGeneBadge = function(badgeElement) {
	var me = this;

	var theGeneName = $(badgeElement).parent().find("#gene-badge-name").text();
	var index = geneNames.indexOf(theGeneName);
	if (index >= 0) {
		geneNames.splice(index, 1);
		$(badgeElement).parent().remove();

		me._onGeneBadgeUpdate();
	}
	delete geneObjects[theGeneName];
	delete geneAnnots[theGeneName];

}

GenesCard.prototype.addGeneBadge = function(geneName, bypassSelecting) {
	var me = this;

	var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')";	
	if ($(selector).length == 0) {
		$('#gene-badge-container').append(geneBadgeTemplate());
		$("#gene-badge-container #gene-badge:last-child").find('#gene-badge-name').text(geneName);
		d3.select($(selector)[0]).data([geneName]);
		d3.select($(selector)[0])
		  .on("mouseover", function(d,i) {
			var geneName = d3.select(this).text();
			var geneAnnot = geneAnnots[geneName];

			var x = d3.event.pageX;
			var y = d3.event.pageY;
            
			me.showTooltip(me.formatGeneDescriptionHTML(geneAnnot.description, geneAnnot.summary), x, y, 300);
		  })
		  .on("mouseout", function(d,i) {
		  	me.hideTooltip();
		  });

		me.promiseSetGeneAnnot($("#gene-badge-container #gene-badge:last-child"), geneName);
		me._setPhenotypeBadge(geneName);
		me._setBookmarkBadge(geneName);

		if (geneNames.indexOf(geneName) < 0) {
			geneNames.push(geneName);
		}

		if (!bypassSelecting) {
			if (hasDataSources()) {
				$(selector).parent().find('.gene-badge-loader').removeClass("hide");
			}
			$("#gene-badge.selected").removeClass("selected");		
			$(selector).parent().parent().addClass("selected");			
		}

		$('#gene-badge-container #manage-gene-list').removeClass("hide");
		$('#gene-badge-container #clear-gene-list').removeClass("hide");

	
	}
	me._onGeneBadgeUpdate();

}


GenesCard.prototype.showTooltip = function(html, screenX, screenY, width) {
	var me = this;
	var tooltip = d3.select('#gene-badge-tooltip');

	tooltip.style("z-index", 20);
	tooltip.transition()        
	 .duration(1000)      
	 .style("opacity", .9)	
	 .style("pointer-events", "all");

	tooltip.html(html);
	var h = tooltip[0][0].offsetHeight;
	var w = width;

	var x = screenX ;
	var y = screenY + 20;

	// If the tooltip, positioned at the cursor, is truncated
	// because its width exceeds the window size, just position
	// the tooltip in the middle of the window
	if ((x + w + 100) > window.outerWidth) {
		x = (window.outerWidth / 2) - (w / 2)
	}

	if (window.outerWidth - 100 < x + w) {
		tooltip.style("width", w + "px")
			       .style("left", x - w + "px") 
			       .style("text-align", 'left')    
			       .style("top", y + "px")
			       .style("z-index", 200)
			       .style("overflow-y", "hidden");
			       

	} else {
		tooltip.style("width", w + "px")
			       .style("left", x + "px") 
			       .style("text-align", 'left')    
			       .style("top", (y) + "px")
			       .style("z-index", 200)
			       .style("overflow-y", "hidden");

	}
}

GenesCard.prototype.hideTooltip = function() {
	var tooltip = d3.select('#gene-badge-tooltip');
	tooltip.transition()        
           .duration(500)      
           .style("opacity", 0)
           .style("z-index", 0)
           .style("pointer-events", "none");
}

GenesCard.prototype._setBookmarkBadge = function(geneName) {
	// If this gene is in the bookmarked genes, show the bookmark glyph
	var geneBadge = $("#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')").parent();	
	if (geneBadge) {
		geneBadge.find("#gene-badge-bookmark svg").remove();
		if (bookmarkCard.isBookmarkedGene(geneName)) {
			geneBadge.find('#gene-badge-bookmark').append("<svg class=\"bookmark-badge\" height=\"12\" width=\"10\">");
			var selection = d3.select(geneBadge.find('#gene-badge-bookmark .bookmark-badge')[0]).data([{translate: 'translate(-2,2)', width:10, height:10, clazz: 'bookmark'}]);
			matrixCard.showBookmarkSymbol(selection);	
		} 		
	}
}

GenesCard.prototype._setPhenotypeBadge = function(geneName) {
	var me = this;
	me.promiseGetGenePhenotypes(geneName).then(function(data) {

			var phenotypes = data[0];
			var theGeneName = data[1];
			if (theGeneName != null && phenotypes != null && phenotypes.length > 0) {
				var geneBadge = $("#gene-badge-container #gene-badge #gene-badge-name:contains('" + theGeneName + "')").parent();	
				geneBadge.find("#gene-badge-phenotype-symbol").append("<svg class=\"phenotype-badge\" height=\"14\" width=\"14\">");
				var selection = d3.select(geneBadge.find('#gene-badge-phenotype-symbol .phenotype-badge')[0]).data([{width:13, height:13,clazz: 'phenotype', phenotypes: phenotypes}]);
				matrixCard.showPhenotypeSymbol(selection);	
				selection.on("mouseover", function(d,i) {

					var symbol = d3.select(this);
					var matrix = symbol.node()
                         .getScreenCTM()
                         .translate(+symbol.node().getAttribute("cx"),+symbol.node().getAttribute("cy"));
		            var screenX = window.pageXOffset + matrix.e - 20;
		            var screenY = window.pageYOffset + matrix.f + 5;
		            
					var htmlObject = me.formatPhenotypesHTML(d.phenotypes);
					me.showTooltip(htmlObject.html, screenX, screenY, htmlObject.width);
		
				});
				selection.on("mouseout", function(d,i) {
					me.hideTooltip();
				});	
			}
		});	
}

GenesCard.prototype.refreshCurrentGeneBadge = function(error) {
	var me = this;

	if (error && error.length > 0) {
		me._setGeneBadgeError(window.gene.gene_name, true);
	} else {
		vc = getProbandVariantCard();
		var probandVcfData = vc.model.getVcfDataForGene(window.gene, window.selectedTranscript);
		if (probandVcfData.features.length == 0) {
			me._setGeneBadgeWarning(window.gene.gene_name, true);
		} else {
			var dangerObject = vc.summarizeDanger(probandVcfData);
			me._setGeneBadgeGlyphs(window.gene.gene_name, dangerObject, true);

		}
	}
	bookmarkCard.refreshBookmarkList();
}

GenesCard.prototype.hideGeneBadgeLoading = function(geneName) {
	var me = this;

	me._geneBadgeLoading(geneName, false);
}

GenesCard.prototype._geneBadgeLoading = function(geneName, show, force) {
	var me = this;

	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
	if (show) {
		if (force || hasDataSources()) {
			geneBadge.find('.gene-badge-loader').removeClass("hide");
		}
	} else {
		geneBadge.find('.gene-badge-loader').addClass("hide");		
	}
}

GenesCard.prototype._setGeneBadgeWarning = function(geneName, select) {
	var me = this;

	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
	geneBadge.addClass("warning");	
	geneBadge.addClass("visited");	
	if (select) {
		geneBadge.addClass("selected");		
	}	
	geneBadge.find("#gene-badge-warning").removeClass("hide");
}

GenesCard.prototype._setGeneBadgeError = function(geneName, select) {
	var me = this;
	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
	geneBadge.addClass("error");	
	geneBadge.addClass("visited");	
	if (select) {
		geneBadge.addClass("selected");		
	}	
}

GenesCard.prototype._setGeneBadgeGlyphs = function(geneName, dangerObject, select) {
	var me = this;

	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
	geneBadge.find('#gene-badge-circle').removeClass('btn-success');
	geneBadge.find('#gene-badge-circle').removeClass('mdi-action-done');
	geneBadge.find('#gene-badge-circle').removeClass('btn-default');

	geneBadge.find('.gene-badge-loader').addClass('hide');

	geneBadge.find('#gene-badge-danger-count').removeClass("impact_HIGH");
	geneBadge.find('#gene-badge-danger-count').removeClass("impact_MODERATE");
	geneBadge.find('#gene-badge-danger-count').removeClass("impact_MODIFIER");
	geneBadge.find('#gene-badge-danger-count').removeClass("impact_LOW");
	geneBadge.find('#gene-badge-button #gene-badge-symbols svg').remove();

	geneBadge.addClass("visited");	
	if (select) {
		geneBadge.addClass("selected");		
	}	

	geneBadge.removeClass("error");
	geneBadge.removeClass("warning");

	var doneWithImpact = false;
	for (dangerKey in dangerObject) {
		if (dangerKey == 'IMPACT') {
			var impactClasses = dangerObject[dangerKey];
			var symbolIndex = 0;
			for (impactClass in impactClasses) {
				var types = impactClasses[impactClass];
				for (type in types) {
					var theClazz = 'impact_' + impactClass;	
					var effectObject = types[type];
					geneBadge.find('#gene-badge-symbols').append("<svg class=\"impact-badge\" height=\"12\" width=\"12\">");
					var selection = d3.select(geneBadge.find('#gene-badge-symbols .impact-badge')[symbolIndex]).data([{width:10, height:10,clazz: theClazz, type:  type, effectObject: effectObject}]);
					symbolIndex++;
					matrixCard.showImpactBadge(selection);	
					selection.on("mouseover", function(d,i) {
									var maxEffect = "";
									for (effectKey in d.effectObject) {
										var transcriptObject = d.effectObject[effectKey];
										if (Object.keys(transcriptObject).length > 0) {
											for (key in transcriptObject) {
												maxEffect += "<div>";
												maxEffect += effectKey + " ";
												maxEffect += "(located on non-canonical transcript " + key + ") ";
												maxEffect += "</div>";
											}
										} else {
												maxEffect += "<div>";
												maxEffect += effectKey;
												maxEffect += "</div>";
										}
									}
									var x = d3.event.pageX;
									var y = d3.event.pageY;

									var annotScheme = filterCard.annotationScheme.toLowerCase() ==  'snpeff' ? 'SnpEff Effect' : 'VEP Consequence';
									me.showTooltip(annotScheme + " " + maxEffect.split("_").join(" "), x, y, maxEffect.length > 70 ? 350 : 120);
								})
								.on("mouseout", function(d,i) {
										me.hideTooltip();
								});
				}
			}
		} else if (dangerKey == 'CLINVAR') {
			var dangerClinvar = dangerObject[dangerKey];
			if (dangerClinvar) {
				for (key in dangerClinvar) {
					var clinvarObject = dangerClinvar[key];
					geneBadge.find('#gene-badge-symbols').append("<svg class=\"clinvar-badge\" height=\"12\" width=\"14\">");
					var selection = d3.select(geneBadge.find('#gene-badge-symbols .clinvar-badge')[0]).data([{width:10, height:10, transform: 'translate(0,1)', clinvarName: key, clinvarObject: clinvarObject, clazz: clinvarObject.clazz}]);
					matrixCard.showClinVarSymbol(selection);		
					selection.on("mouseover", function(d,i) {
									var x = d3.event.pageX;
									var y = d3.event.pageY;
									me.showTooltip("ClinVar " + d.clinvarName.split("_").join(" "), x, y, 150);
								})
								.on("mouseout", function(d,i) {
										me.hideTooltip();
								});										
				}				
			}

		} else if (dangerKey == 'SIFT') {
			var dangerSift = dangerObject[dangerKey];
			if (dangerSift != null) {
				var symbolIndex = 0;
				for (clazz in dangerSift) {
					var siftObject = dangerSift[clazz];
					geneBadge.find('#gene-badge-symbols').append("<svg class=\"sift-badge\" height=\"12\" width=\"13\">");
					var selection = d3.select(geneBadge.find('#gene-badge-symbols .sift-badge')[symbolIndex]).data([{width:11, height:11, transform: 'translate(0,1)', clazz: clazz, siftObject: siftObject }]);					
					matrixCard.showSiftSymbol(selection);	
					symbolIndex++;			
					selection.on("mouseover", function(d,i) {
									var maxSift = "SIFT ";
									for (key in d.siftObject) {
										maxSift += key + " ";
										var transcriptObject = d.siftObject[key];
										for (key in transcriptObject) {
											maxSift += key + " ";
										}
									}
									var x = d3.event.pageX;
									var y = d3.event.pageY;
									me.showTooltip(maxSift.split("_").join(" "), x, y, 150);
								})
								.on("mouseout", function(d,i) {
										me.hideTooltip();
								});

				}
			}

		} else if (dangerKey == 'POLYPHEN') {			
			var dangerPolyphen = dangerObject[dangerKey];
			if (dangerPolyphen != null) {
				var symbolIndex = 0;
				for (clazz in dangerPolyphen) {
					var polyphenObject = dangerPolyphen[clazz];
					geneBadge.find('#gene-badge-symbols').append("<svg class=\"polyphen-badge\" height=\"12\" width=\"12\">");
					var selection = d3.select(geneBadge.find('#gene-badge-symbols .polyphen-badge')[symbolIndex]).data([{width:10, height:10, transform: 'translate(0,2)', clazz: clazz, polyphenObject: polyphenObject}]);
					matrixCard.showPolyPhenSymbol(selection);	
					symbolIndex++;
					selection.on("mouseover", function(d,i) {
									var maxPolyphen = "PolyPhen ";
									for (key in d.polyphenObject) {
										maxPolyphen += key + " ";
										var transcriptObject = d.polyphenObject[key];
										for (key in transcriptObject) {
											maxPolyphen += key + " ";
										}
									}
									var x = d3.event.pageX;
									var y = d3.event.pageY;
									me.showTooltip(maxPolyphen.split("_").join(" "), x, y, 170);
								})
								.on("mouseout", function(d,i) {
										me.hideTooltip();
								});							
				}
			}

		} else if (dangerKey == 'INHERITANCE') {
			var inheritanceClasses = dangerObject[dangerKey];
			if (inheritanceClasses != null) {
				var symbolIndex = 0;
				for (key in inheritanceClasses) {
					var inheritanceValue = inheritanceClasses[key];
					var clazz = key;
					var symbolFunction = matrixCard.inheritanceMap[inheritanceValue].symbolFunction;
					geneBadge.find('#gene-badge-symbols').append("<svg class=\"inheritance-badge\" height=\"12\" width=\"14\">");
					var options = {width:18, height:20, transform: 'translate(-2,-2)'};
					var selection = d3.select(geneBadge.find('#gene-badge-symbols .inheritance-badge')[symbolIndex]).data([{clazz: clazz}]);
					symbolFunction(selection, options);	
					symbolIndex++;	
					selection.on("mouseover", function(d,i) {

									var x = d3.event.pageX;
									var y = d3.event.pageY;
									me.showTooltip(d.clazz + " inheritance mode", x, y, 170);
								})
								.on("mouseout", function(d,i) {
										me.hideTooltip();
								});						
				}
			}

		}
	}
	readjustCards();
}

GenesCard.prototype.selectGeneBadge = function(badgeElement) {
	var me = this;

	//var badge = $(badgeElement).parent().parent();
	var badge = $(badgeElement).parent();
	var theGeneName = badge.find("#gene-badge-name").text();		
	me.selectGene(theGeneName);

}

GenesCard.prototype.selectGene = function(geneName, callbackVariantsDisplayed) {
	var me = this;

	$('.typeahead.tt-input').val(geneName);
	
	var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
	
	$("#gene-badge.selected").removeClass("selected");
	geneBadge.addClass("selected");
	
	$(".gene-badge-loader").each( function(index, value) {
		$(this).addClass("hide");
	});
	if (hasDataSources()) {
		geneBadge.find('.gene-badge-loader').removeClass('hide');
	}


	var url = geneiobio_server + 'api/gene/' + geneName;
	geneSource = $( "#select-gene-source option:selected" ).text().toLowerCase().split(" transcript")[0];	
	url += "?source=" + geneSource;
	
	$.ajax({
	    url: url,
	    jsonp: "callback",
	    type: "GET",
	    dataType: "jsonp",
	    success: function( response ) {

	    	if (response[0].hasOwnProperty('gene_name')) {
		    	// We have successfully return the gene model data.
		    	// Load all of the tracks for the gene's region.
		    	window.gene = response[0];
		    	adjustGeneRegion(window.gene);	

		    	window.selectedTranscript = geneToLatestTranscript[window.gene.gene_name];
		    	window.geneObjects[window.gene.gene_name] = window.gene;	

		    	updateUrl('gene', window.gene.gene_name);

		    	me.updateGeneInfoLink(window.gene.gene_name);

				if (!hasDataSources()) {
					//showDataDialog();
					firstTimeGeneLoaded = false; 
				}


		    	loadTracksForGene(false, null, callbackVariantsDisplayed);
	    	} else {
	    		alertify.error("Gene " + geneName + " not found.  Removing from list.", 
				      		    function (e) {
				     			});
			    var selector = "#gene-badge-container #gene-badge #gene-badge-name:contains('" + geneName + "')";	
				//$(selector).parent().remove();
				$(selector).parent().parent().remove();
				var index = geneNames.indexOf(geneName);
				geneNames.splice(index, 1);

	    	}

	    }
	 });
}

GenesCard.prototype.updateGeneInfoLink = function(geneName) {
	var me = this;

	var setSelectedGeneLink = function(geneAnnot) {
		$('#nav-section #bloodhound #enter-gene-name').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
		$('#nav-section #gene-name').attr("href", 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + geneAnnot.name);					
		$('#nav-section #gene-name').attr('title', geneAnnot.description + "  -  " + geneAnnot.summary);
	}
	var geneAnnot = geneAnnots[geneName];
	if (geneAnnot == null) {
		var geneBadge = $("#gene-badge-container #gene-badge-name:contains('" + geneName + "')").parent().parent();
		me.promiseSetGeneAnnot(geneBadge, geneName).then( function(data) {
			geneAnnot = data;
			setSelectedGeneLink(geneAnnot)
		}, function(error) {
			console.log("error getting gene annot gene gene badge selected. " + error)
		});
	} else {
		setSelectedGeneLink(geneAnnot);
	}

}

GenesCard.prototype.manageGeneList = function(manage) {
	var me = this;

	if (manage) {
		$('#gene-badge-container').addClass('manage');
		$('#manage-gene-list').addClass('hide');
		$('#done-manage-gene-list').removeClass('hide');		
	} else {
		$('#gene-badge-container').removeClass('manage');
		$('#manage-gene-list').removeClass('hide');
		$('#done-manage-gene-list').addClass('hide');		
	}
}

GenesCard.prototype.promiseGetGeneAnnotation = function(geneName) {
	var me = this;

    return new Promise( function(resolve, reject) {

   	  var geneInfo = geneAnnots[geneName];
   	  if (geneInfo != null) {
   	  	resolve(geneInfo);
   	  } else {
	      var url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&usehistory=y&retmode=json&term=";
	      url += "(" + geneName + "[Gene name]" + " AND 9606[Taxonomy ID]";

	      var clinvarVariants = null;
	      $.ajax( url )
	        .done(function(data) {        
	          var webenv = data["esearchresult"]["webenv"];
	          var queryKey = data["esearchresult"]["querykey"];
	          var summaryUrl = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&query_key=" + queryKey + "&retmode=json&WebEnv=" + webenv + "&usehistory=y"
	          $.ajax( summaryUrl )
	            .done(function(sumData) { 
	              
	              if (sumData.result == null || sumData.result.uids.length == 0) {
	                if (sumData.esummaryresult && sumData.esummaryresult.length > 0) {
	                  sumData.esummaryresult.forEach( function(message) {
	                    console.log(message);
	                  });
	                }
	                reject("No data returned from eutils request " + summaryUrl);
	                
	              } else {
	                var uid = sumData.result.uids[0];
	                var geneInfo = sumData.result[uid];
	                resolve(geneInfo);
	              }
	            })
	            .fail(function() {
	              reject('Error: gene info http request failed to get gene summary data');
	            })
	        })
	        .fail(function() {
	          reject('Error: gene info http request failed to get IDs');
	        })
   	  }
   	});

}

GenesCard.prototype.promiseGetGenePhenotypes = function(geneName) {
	var me = this;

    return new Promise( function(resolve, reject) {

      var phenotypes = genePhenotypes[geneName];
      if (phenotypes != null) {
      	resolve([phenotypes, geneName]);
      } else {
	      var url = geneToPhenoServer + "/api/gene/" + geneName;
	      $.ajax({
		    url: url,
		    jsonp: "callback",
		    type: "GET",
		    dataType: "jsonp",
		    success: function( response ) {		    	

		    	var phenotypes = response.sort(function(a,b) {
			      	if (a.hpo_term_name < b.hpo_term_name) {
			      		return -1;
			      	} else if (a.hpo_term_name > b.hpo_term_name) {
			      		return 1;
			      	} else {
			      		return 0;
			      	}
		     	 });
		    	genePhenotypes[geneName] = phenotypes;

		    	resolve([response, geneName]);
		    },
		    fail: function() {
		    	reject("unable to get phenotypes for gene " + geneName);
		    }
		   });
      }

  	});
}


GenesCard.prototype.showGenesSlideLeft = function() {
	var me = this;
	closeSlideLeft();
	changeSidebar('Phenolyzer');
	showSlideLeft();


	if (phenolyzerGenes && phenolyzerGenes.length > 0) {
		this.geneBarChart = geneListD3()
							  .margin( {left:10, right: 10, top: 0, bottom: 0} )
		                      .xValue( function(d){ return +d.score })
							  .yValue( function(d){ return d.geneName })
							  .width(120)
							  .barHeight(10)
							  .labelWidth(60)
							  .gap(4)
							  .on('d3click', function(phenolyzerGene) {
							  	if (phenolyzerGene.selected) {
							  		me.addGeneBadge(phenolyzerGene.geneName, true);
							  		me.highlightPhenolyzerGenes();
							  	} else {
							  		me.removeGeneBadgeByName(phenolyzerGene.geneName);
							  	}
							  });
		d3.select('#phenolyzer-results svg').remove();
		var selection = d3.select('#phenolyzer-results').data([phenolyzerGenes]);
		this.geneBarChart(selection, {shadowOnHover:true});		
	}

}

GenesCard.prototype.selectPhenolyzerGeneRange = function() {
	var start = 0;
	var end   = +$('#phenolyzer-select-range-end').val();

	for (var i = 0; i < phenolyzerGenes.length; i++) {
		phenolyzerGenes[i].selected = false;
	}
	for (var i = start; i < end; i++) {
		phenolyzerGenes[i].selected = true;
	}

	var selection = d3.select('#phenolyzer-results').data([phenolyzerGenes]);
	this.geneBarChart(selection, {shadowOnHover:false});	

	this.refreshSelectedPhenolyzerGenes();
}

GenesCard.prototype.deselectPhenolyzerGenes = function() {
	var me = this;
	for (var i = 0; i < phenolyzerGenes.length; i++) {
		if (phenolyzerGenes[i].selected) {
			me.removeGeneBadgeByName(phenolyzerGenes[i].geneName);
		}
		phenolyzerGenes[i].selected = false;
	}
	var selection = d3.select('#phenolyzer-results').data([phenolyzerGenes]);
	this.geneBarChart(selection, {shadowOnHover:false});	

}

GenesCard.prototype.formatGeneDescriptionHTML = function(title, description) {
	var html = "";
	html += "<div style='text-align:center;'>NCBI summary</div>";
	html += "<div style='text-align:center;padding-bottom:4px;'>";
	html += "  <span style='font-weight:bold'>" + title + "</span>";
	html += "</div>";
	html += "<div style='text-align:left'>";
	html += description;
	html += "</div>";
	return html;
}

GenesCard.prototype.formatPhenotypesHTML = function(phenotypes) {
	var html = "";
html += "<div style='font-weight:bold;text-align:center;padding-bottom:4px;'>HPO gene-to-phenotype</div>";
	if (phenotypes.length < 20) {
		phenotypes.forEach(function(phenotype) {
			html += "<div style='max-width:200px'>";
			html += phenotype.hpo_term_name;
			html += "</div>";

		});
		return {width: 200, html: html};
	} else {
		var phenotypeCols = splitArray(phenotypes, 4);
		phenotypeCols.forEach(function(phenotypeElements) {
			html += "<div style='float:left;max-width:130px;margin-right:5px;font-size:9px;'>";
				phenotypeElements.forEach(function(phenotype) {
					html += "<div>";
					html += phenotype.hpo_term_name;
					html += "</div>";

				});
			html += "</div>";

		});

	}
	return {width: 560, html: html};	
}



