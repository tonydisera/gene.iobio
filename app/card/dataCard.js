function DataCard() {
	this.defaultNames = {
		proband: 'NA12878',
		mother:  'NA12892',
		father:  'NA12891'
	};
	this.defaultUrls = {
		proband: 'http://s3.amazonaws.com/iobio/variants/NA12878.autosome.PASS.vcf.gz',
		mother:  'http://s3.amazonaws.com/iobio/variants/NA12892.autosome.PASS.vcf.gz',
		father:  'http://s3.amazonaws.com/iobio/variants/NA12891.autosome.PASS.vcf.gz'
	};
	this.defaultBamUrls = {
		proband: 'http://s3.amazonaws.com/iobio/NA12878/NA12878.autsome.bam',
		mother:  'http://s3.amazonaws.com/iobio/NA12892/NA12892.autsome.bam',
		father:  'http://s3.amazonaws.com/iobio/NA12891/NA12891.autsome.bam'
	};

	this.exomeNames = {
		proband: 'NA19240',
		mother:  'NA19238',
		father:  'NA19229'
	};
	this.exomeUrls = {
		proband: 'https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz',
		mother:  'https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz',
		father:  'https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz'
	};
	this.exomeBamUrls = {
		proband: 'https://s3.amazonaws.com/iobio/1000gSV/NA19240.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam',
		mother:  'https://s3.amazonaws.com/iobio/1000gSV/NA19238.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam',
		father:  'https://s3.amazonaws.com/iobio/1000gSV/NA19239.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam'
	};
	this.exomeSampleNames = {
		proband: 'NA19240',
		mother:  'NA19238',
		father:  'NA19239'
	};

	this.mode = 'single';
	this.panelSelectorFilesSelected = null;

}

DataCard.prototype.loadDemoData = function() {

	var alreadyLoaded = false;
	if (hasDataSources()) {
		alreadyLoaded = true;
	}
	this.mode = 'trio';

	// Clear the cache
	var affectedSibIds  = [];
	var unaffectedSibIds = [];
	window.loadSibs(affectedSibIds, 'affected');
	window.loadSibs(unaffectedSibIds, 'unaffected');

	window.updateUrl('rel0', "proband");	
	window.updateUrl('rel1', "mother");	
	window.updateUrl('rel2', "father");	

	window.updateUrl('name0', this.exomeNames.proband);	
	window.updateUrl('vcf0',  this.exomeUrls.proband);	
	window.updateUrl('bam0',  this.exomeBamUrls.proband);	
	window.updateUrl('sample0',  this.exomeSampleNames.proband);	

	window.updateUrl('name1', this.exomeNames.mother);	
	window.updateUrl('vcf1',  this.exomeUrls.mother);	
	window.updateUrl('bam1',  this.exomeBamUrls.mother);	
	window.updateUrl('sample1',  this.exomeSampleNames.mother);	

	window.updateUrl('name2', this.exomeNames.father);	
	window.updateUrl('vcf2',  this.exomeUrls.father);	
	window.updateUrl('bam2',  this.exomeBamUrls.father);	
	window.updateUrl('sample2',  this.exomeSampleNames.father);	

	window.updateUrl("gene", "RAI1");
	window.updateUrl("genes", "RAI1,AIRE,MYLK2");

	reloadGeneFromUrl(alreadyLoaded);

}

DataCard.prototype.listenToEvents = function(panelSelector) {
	var me = this;

    panelSelector.find('#datasource-name').on('change', function() {
    	me.setDataSourceName(panelSelector); 
    });
    
    panelSelector.find('#bam-url-input').on('change', function() {
    	me.onBamUrlEntered(panelSelector);
    });
    panelSelector.find('#display-bam-url-item').on('click', function() {
    	me.displayBamUrlBox(panelSelector);
    });
    panelSelector.find('#display-platinum-bam-url-item').on('click', function() {
    	me.displayPlatinumBamUrlBox(panelSelector);
    });
    // Workaround for problem where extra event on proband files button fired
    panelSelector.find("#bam-dropdown-button").on("click", function() {
    	me.panelSelectorFilesSelected = panelSelector;
    });

    panelSelector.find('#bam-file-selector-item').on('click', function() {
    	me.onBamFileButtonClicked(panelSelector);
    });
    panelSelector.find('#bam-file-upload').on('change', function(event) {
    	me.onBamFilesSelected(event);
    });
    // This will ensure that if a same file selected consecutively
    // will file the 'change' event
    panelSelector.find('#bam-file-upload').on('click', function() {
    	this.value = null;
    });
     panelSelector.find('#clear-bam').on('click', function() {
    	me.clearBamUrl(panelSelector);
    });

    panelSelector.find('#url-input').on('change', function() {
    	me.onVcfUrlEntered(panelSelector);
    });
    panelSelector.find('#display-vcf-url-item').on('click', function() {
    	me.displayUrlBox(panelSelector);
    });
    panelSelector.find('#display-platinum-vcf-url-item').on('click', function() {
    	me.displayPlatinumUrlBox(panelSelector);
    });
    panelSelector.find('#clear-vcf').on('click', function() {
    	me.clearUrl(panelSelector);
    });

    panelSelector.find('#vcf-file-selector-item').on('click', function() {
    	me.onVcfFileButtonClicked(panelSelector);
    });
    // Workaround for problem where extra event on proband files button fired
    panelSelector.find("#vcf-dropdown-button").on("click", function() {
    	me.panelSelectorFilesSelected = panelSelector;
    });
   
   
    panelSelector.find('#vcf-file-upload').on('change', function(event) {
		me.onVcfFilesSelected(event);
    });
    // This will ensure that if a same file selected consecutively
    // will file the 'change' event
    panelSelector.find('#vcf-file-upload').on('click', function() {
    	this.value = null;
    });

    // When the sample name dropdown is selected
    panelSelector.find('#vcf-sample-select').on('change', function(event,params) {
    	me.onVcfSampleSelected(panelSelector);
    });

}


DataCard.prototype.init = function() {
	var me = this;

	$('#proband-data').append(dataCardEntryTemplate());
	this.listenToEvents($('#proband-data'));
	addVariantCard();
	me.setDataSourceRelationship($('#proband-data'));
	$('#proband-data #vcf-sample-select').chosen({width: "150px;font-size:11px;"});
	$('#unaffected-sibs-select').chosen({width: "270px;font-size:11px;"});
	$('#affected-sibs-select').chosen({width: "270px;font-size:11px;"});


	$('#mother-data').append(dataCardEntryTemplate());
	$('#mother-data #sample-data-label').text("MOTHER");
	this.listenToEvents($('#mother-data'));
	addVariantCard();
	me.setDataSourceRelationship($('#mother-data'));
	$('#mother-data #vcf-sample-select').chosen({width: "150px;"});

	$('#father-data').append(dataCardEntryTemplate());
	$('#father-data #sample-data-label').text("FATHER");
	this.listenToEvents($('#father-data'));
	addVariantCard();
	me.setDataSourceRelationship($('#father-data'));
	$('#father-data #vcf-sample-select').chosen({width: "150px;"});


	var dataCardSelector = $('#data-card');
	dataCardSelector.find('#expand-button').on('click', function() {
		dataCardSelector.find('.fullview').removeClass("hide");
	});
	dataCardSelector.find('#minimize-button').on('click', function() {
		dataCardSelector.find('.fullview').addClass("hide");
	});
	dataCardSelector.find('#ok-button').on('click', function() {	
		
		
		// Clear the cache
		clearCache();

		// Create variant cards for the affected and unaffected sibs.
		// We will load the data later once the proband, mother, father
		// data is loaded.
		var affectedSibIds  = $("#affected-sibs-select").chosen().val();
		var unaffectedSibIds = $("#unaffected-sibs-select").chosen().val();

		window.loadSibs(affectedSibIds, 'affected');
		window.loadSibs(unaffectedSibIds, 'unaffected');

		window.updateUrl('affectedSibs',   affectedSibIds && affectedSibIds.length > 0   ? affectedSibIds.join(",") : "");
		window.updateUrl('unaffectedSibs', unaffectedSibIds && unaffectedSibIds.length > 0 ? unaffectedSibIds.join(",") : "");			

		window.enableCallVariantsButton();

		window.loadTracksForGene();		

	});


}

DataCard.prototype.initSibs = function() {

    // Select the affected and unaffected sibs if provided in the url
    var affectedSibIds = [];
    window.variantCardsSibs.affected.forEach(function(vc) {
    	affectedSibIds.push(vc.getName());
    })
    $('#data-card #affected-sibs-select').val(affectedSibIds);
	$('#data-card #affected-sibs-select').trigger("chosen:updated");

    var unaffectedSibIds = [];
    window.variantCardsSibs.unaffected.forEach(function(vc) {
    	unaffectedSibIds.push(vc.getName());
    })
    $('#data-card #unaffected-sibs-select').val(unaffectedSibIds);
	$('#data-card #unaffected-sibs-select').trigger("chosen:updated");

}


DataCard.prototype.onBamFileButtonClicked = function(panelSelector) {	
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	panelSelector.find('#bam-file-info').removeClass("hide");

	panelSelector.find('#bam-url-input').addClass('hide');
	panelSelector.find('#bam-url-input').val('');

	window.disableLoadButton();
}

DataCard.prototype.onBamFilesSelected = function(event) {
	var me = this;
	$('#tourWelcome').removeClass("open");

	this.setDataSourceName(this.panelSelectorFilesSelected);
	this.setDataSourceRelationship(this.panelSelectorFilesSelected);

	var cardIndex = this.panelSelectorFilesSelected.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];	

	variantCard.onBamFilesSelected(event, function(bamFileName) {
		me.panelSelectorFilesSelected.find('#bam-file-info').removeClass('hide');
		me.panelSelectorFilesSelected.find('#bam-file-info').val(bamFileName);
		enableLoadButton();
	});

}


DataCard.prototype.onBamUrlEntered = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	$('#tourWelcome').removeClass("open");
	
	var bamUrlInput = panelSelector.find('#bam-url-input');
	bamUrlInput.removeClass("hide");

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	this.setDataSourceName(panelSelector);
	this.setDataSourceRelationship(panelSelector);

	variantCard.onBamUrlEntered(bamUrlInput.val());	
	variantCard.setName(variantCard.getName());

	window.updateUrl('bam' + cardIndex, bamUrlInput.val());
	enableLoadButton();

}

DataCard.prototype.displayBamUrlBox = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	panelSelector.find('#bam-file-info').addClass('hide');
    panelSelector.find('#bam-file-info').val('');
    panelSelector.find('#bam-url-input').removeClass("hide");
    panelSelector.find("#bam-url-input").focus();

    // Blank out the URL
	panelSelector.find("#bam-url-input").val("");

    var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	
    this.onBamUrlEntered(panelSelector);
	

}
DataCard.prototype.displayPlatinumBamUrlBox = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	panelSelector.find('#bam-file-info').addClass('hide');
    panelSelector.find('#bam-file-info').val('');
    panelSelector.find('#bam-url-input').removeClass("hide");
    panelSelector.find("#bam-url-input").focus();

    var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	panelSelector.find('#bam-url-input').val(this.defaultBamUrls[variantCard.getRelationship()]);
	this.onBamUrlEntered(panelSelector);
	

}

DataCard.prototype.clearBamUrl = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	window.removeUrl('bam'+cardIndex);



	this.displayBamUrlBox(panelSelector);
	panelSelector.find("#bam-url-input").val("");
	panelSelector.find("#bam-file-info").val("");
	this.onBamUrlEntered(panelSelector);

}

DataCard.prototype.displayUrlBox = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	// Blank out the URL
	panelSelector.find("#url-input").val("");

	panelSelector.find("#url-input").removeClass('hide');
    panelSelector.find("#url-input").focus();
    panelSelector.find('#vcf-file-info').addClass('hide');
    panelSelector.find('#vcf-file-info').val('');
    this.onVcfUrlEntered(panelSelector);
}
DataCard.prototype.displayPlatinumUrlBox = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];
	
	panelSelector.find('#url-input').val(this.defaultUrls[variantCard.getRelationship()]);
	panelSelector.find('#datasource-name').val(this.defaultNames[variantCard.getRelationship()]);
	panelSelector.find("#url-input").removeClass('hide');
    panelSelector.find("#url-input").focus();
    panelSelector.find('#vcf-file-info').addClass('hide');
    panelSelector.find('#vcf-file-info').val('');
    this.onVcfUrlEntered(panelSelector);
}
DataCard.prototype.clearUrl = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	window.removeUrl('vcf'+cardIndex);
	panelSelector.find("#url-input").val("");
	panelSelector.find("#vcf-file-info").val("");
	variantCard.clearVcf();
	window.enableLoadButton();


}
DataCard.prototype.onVcfFileButtonClicked = function(panelSelector) {	
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	panelSelector.find('#vcf-file-info').removeClass("hide");

	panelSelector.find('#url-input').addClass('hide');
	panelSelector.find('#url-input').val('');

	
	window.disableLoadButton();
}

DataCard.prototype.onVcfFilesSelected = function(event) {
	var me = this;
	
	$('#tourWelcome').removeClass("open");

	// Show the file name 
	me.panelSelectorFilesSelected.find('#vcf-file-info').removeClass('hide');
	for (var i = 0; i < event.currentTarget.files.length; i++) {
		var file = event.currentTarget.files[i];
		if (!file.name.endsWith(".tbi")) {
			me.panelSelectorFilesSelected.find('#vcf-file-info').val(file.name);
		}
	}

	this.setDataSourceName(this.panelSelectorFilesSelected);
	this.setDataSourceRelationship(this.panelSelectorFilesSelected);

	var cardIndex = this.panelSelectorFilesSelected.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];	

	// We cannot load a vcf local file from a URL (must be choosen by user), so we just
	// need to clear out any previously selected vcf url.
	window.removeUrl('vcf'+cardIndex);
	window.removeUrl('sample'+cardIndex);
	

	me.panelSelectorFilesSelected.find('#vcf-sample-box').addClass('hide');
	$('#unaffected-sibs-box').addClass('hide');
	$('#affected-sibs-box').addClass('hide');
	me.panelSelectorFilesSelected.find('.vcf-sample.loader').removeClass('hide');


	variantCard.onVcfFilesSelected(event, function(vcfFileName, sampleNames) {
		me.panelSelectorFilesSelected.find('.vcf-sample.loader').addClass('hide');

		me.panelSelectorFilesSelected.find('#vcf-file-info').removeClass('hide');
		me.panelSelectorFilesSelected.find('#vcf-file-info').val(vcfFileName);

		// Only show the sample dropdown if the vcf file has more than one sample
		if (sampleNames.length > 1) {
			
			// Populate the sample names in the dropdown
			me.panelSelectorFilesSelected.find('#vcf-sample-box').removeClass('hide');
			if (me.mode == 'trio') {
				$('#unaffected-sibs-box').removeClass('hide');
				$('#affected-sibs-box').removeClass('hide');
			}
			me.panelSelectorFilesSelected.find('#vcf-sample-select')
								         .find('option').remove();
			$('#unaffected-sibs-select').find('option').remove();	
			$('#affected-sibs-select').find('option').remove();								         


			// Add a blank option if there is more than one sample in the vcf file
			if (sampleNames.length > 1) {
				me.panelSelectorFilesSelected.find('#vcf-sample-select')
				                             .append($("<option></option>"));
				$('#unaffected-sibs-select').append($("<option></option>"));				                             
				$('#affected-sibs-select').append($("<option></option>"));				                             
			}							         

			// Populate the sample name in the dropdown
			sampleNames.forEach( function(sampleName) {
				me.panelSelectorFilesSelected.find('#vcf-sample-select')
				                            .append($("<option></option>")
		                                    .attr("value",sampleName)
		                                    .text(sampleName)); 
				$('#unaffected-sibs-select').append($("<option></option>")
		                                    .attr("value",sampleName)
		                                    .text(sampleName));
				$('#affected-sibs-select').append($("<option></option>")
		                                    .attr("value",sampleName)
		                                    .text(sampleName)); 			                                     		                                    
			});
			me.panelSelectorFilesSelected.find('#vcf-sample-select').trigger("chosen:updated");
			me.initSibs();

			// If we are loading from URL parameters and the sample name was specified, select this
			// sample from dropdown
			if (variantCard.getDefaultSampleName() != null && variantCard.getDefaultSampleName() != "") {
				me.panelSelectorFilesSelected.find('#vcf-sample-select').val(variantCard.getDefaultSampleName());
				me.panelSelectorFilesSelected.find('#vcf-sample-select').trigger("chosen:updated");

				variantCard.setSampleName(variantCard.getDefaultSampleName());
				variantCard.setDefaultSampleName(null);
				window.enableLoadButton();
			} else {
				window.disableLoadButton();
			}

		} else {
			variantCard.setSampleName("");				
			variantCard.setDefaultSampleName(null);
			window.removeUrl('sample'+cardIndex);
			
			window.enableLoadButton();
		}

	});
}



DataCard.prototype.onVcfSampleSelected = function(panelSelector) {
	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];
	var sampleName = panelSelector.find('#vcf-sample-select option:selected').text();
	variantCard.setSampleName(sampleName);
	
	window.updateUrl('sample' + cardIndex, sampleName);
	if (variantCard.isReadyToLoad()) {
		window.enableLoadButton();
	}
}

DataCard.prototype.onVcfUrlEntered = function(panelSelector) {
	var me = this;
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	$('#tourWelcome').removeClass("open");
	
	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	this.setDataSourceName(panelSelector);
	this.setDataSourceRelationship(panelSelector);


	var vcfUrl = panelSelector.find('#url-input').val();

	panelSelector.find('#vcf-sample-box').addClass('hide');
	panelSelector.find('.vcf-sample.loader').removeClass('hide');

	window.updateUrl('vcf'+cardIndex, vcfUrl);
	
	variantCard.onVcfUrlEntered(vcfUrl, function(success, sampleNames) {
		panelSelector.find('.vcf-sample.loader').addClass('hide');

		if (success) {
			
			// Only show the sample dropdown if there is more than one sample
			if (sampleNames.length > 1) {
				// Populate the sample names in the dropdown
				panelSelector.find('#vcf-sample-box').removeClass('hide');
				panelSelector.find('#vcf-sample-select')
						     .find('option').remove();
				if (me.mode == 'trio') {
					$('#unaffected-sibs-box').removeClass('hide');
					$('#affected-sibs-box').removeClass('hide');
				}
				$('#unaffected-sibs-select').find('option').remove();
				$('#affected-sibs-select').find('option').remove();

				// Add a blank option if there is more than one sample in the vcf file
				if (sampleNames.length > 1) {
					panelSelector.find('#vcf-sample-select')
					             .append($("<option></option>"));
					$('#unaffected-sibs-select').append($("<option></option>"));
					$('#affected-sibs-select').append($("<option></option>"));
				}	

				// Populate the sample names in the dropdown
				sampleNames.forEach( function(sampleName) {
					panelSelector.find('#vcf-sample-select')							 
					             .append($("<option></option>")
			                     .attr("value",sampleName)
			                     .text(sampleName)); 
					$('#unaffected-sibs-select')							 
					             .append($("<option></option>")
			                     .attr("value",sampleName)
			                     .text(sampleName)); 
					$('#affected-sibs-select')							 
					             .append($("<option></option>")
			                     .attr("value",sampleName)
			                     .text(sampleName)); 			                   
				});
				panelSelector.find('#vcf-sample-select').trigger("chosen:updated");
				me.initSibs();

				// If we are loading from URL parameters and the sample name was specified, select this
				// sample from dropdown
				if (variantCard.getDefaultSampleName() != null && variantCard.getDefaultSampleName() != "") {
					panelSelector.find('#vcf-sample-select').val(variantCard.getDefaultSampleName());
					panelSelector.find('#vcf-sample-select').trigger("chosen:updated");

					variantCard.setSampleName(variantCard.getDefaultSampleName());
					variantCard.setDefaultSampleName(null);
					
					window.enableLoadButton();

				} else {
					window.disableLoadButton();

				}

			} else {
				variantCard.setSampleName("");
				variantCard.setDefaultSampleName(null);
				window.removeUrl('sample'+cardIndex);


				window.enableLoadButton();			
			}

		} else {
			window.disableLoadButton();
		}
		
		
	});
}


DataCard.prototype.setDataSourceName = function(panelSelector) {	
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	var dsName = panelSelector.find('#datasource-name').val();
	variantCard.setName(dsName);
	variantCard.showDataSources(dsName);
	
	//	$('#variant-card-button-' + cardIndex ).text(dsName);
	window.updateUrl('name' + cardIndex, dsName);

}

DataCard.prototype.setDataSourceRelationship = function(panelSelector) {		
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	var dsRelationship = panelSelector.find('#datasource-relationship').val();
	variantCard.setRelationship(dsRelationship);	
	window.updateUrl('rel' + cardIndex, dsRelationship);
}