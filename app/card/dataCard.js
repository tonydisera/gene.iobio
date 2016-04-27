function DataCard() {
	this.defaultNames = {
		proband: 'NA12878',
		mother:  'NA12892',
		father:  'NA12891'
	};
	this.defaultUrls = {
		proband: 'https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz',
		mother:  'https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz',
		father:  'https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz'
	};
	this.defaultBamUrls = {
		proband: 'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12878.bam',
		mother:  'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12892.bam',
		father:  'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12891.bam'
	};
	this.defaultSampleNames = {
		proband: 'NA12878',
		mother:  'NA12892',
		father:  'NA12891'
	};


	this.demoMode = 'trio';
	this.demoCards = {
		proband: true,
		mother: true,
		father: true
	};

	this.demoNames = {
		proband: 'NA19240',
		mother:  'NA19238',
		father:  'NA19239' 
	};
	this.demoUrls = {
		proband: 'https://s3.amazonaws.com/iobio/gene/wes_1000g/exome-trio.vcf.gz',
		mother:  'https://s3.amazonaws.com/iobio/gene/wes_1000g/exome-trio.vcf.gz',
		father:  'https://s3.amazonaws.com/iobio/gene/wes_1000g/exome-trio.vcf.gz'
	};
	this.demoBamUrls = {
		proband: 'https://s3.amazonaws.com/iobio/gene/wes_1000g/NA19240.bam',
		mother:  'https://s3.amazonaws.com/iobio/gene/wes_1000g/NA19238.bam',
		father:  'https://s3.amazonaws.com/iobio/gene/wes_1000g/NA19239.bam'
	};
	this.demoSampleNames = {
		proband: 'NA19240',
		mother:  'NA19238',
		father:  'NA19239'
	};

	this.eduTourModes = [
		'single',
		'single'
	];

	this.eduTourUrls = [
	{
		proband: 'https://s3.amazonaws.com/iobio/gene/wes_1000g/exome-trio.vcf.gz',
		mother:  'https://s3.amazonaws.com/iobio/gene/wes_1000g/exome-trio.vcf.gz',
		father:  'https://s3.amazonaws.com/iobio/gene/wes_1000g/exome-trio.vcf.gz'
	},
	{
		proband: 'https://s3.amazonaws.com/iobio/NHMU/vkorc1.vcf.gz',
		mother: 'https://s3.amazonaws.com/iobio/NHMU/vkorc1.vcf.gz',
		father: 'https://s3.amazonaws.com/iobio/NHMU/vkorc1.vcf.gz'
	}
	];
	this.eduTourCards = [
		{
			proband: true,
			mother:  true,
			father:  true
		},
		{
			proband: true,
			mother:  false,
			father:  false
		}
	];	
	this.eduTourNames = [
		{
			proband: 'Father',
			mother: 'Mother',
			father: 'Father'
		},
		{
			proband: 'John'
		}
	];	
	this.eduTourSampleNames = [
		{
			proband: 'NA19240',
			mother:  'NA19238', 
			father:  'NA19239' 
		},
		{
			proband: 'sample1'
		}
	];
	this.eduTourGenes = [
		[],
		['VKORC1']
	];
	


	this.mode = 'single';
	this.panelSelectorFilesSelected = null;

}

DataCard.prototype.loadDemoData = function() {
	var me = this;

	if (isLevelEdu) {
		var idx = isLevelEduTour ? +eduTourNumber-1 : 0;
		this.demoCards = this.eduTourCards[idx];
		this.demoUrls = this.eduTourUrls[idx];
		this.demoNames = this.eduTourNames[idx];
		this.demoSampleNames = this.eduTourSampleNames[idx];			
		this.demoMode = this.eduTourModes[idx];
	} 

	$('#splash').addClass("hide");	
	this.mode = this.demoMode;

	// Clear the cache
	var affectedSibIds  = [];
	var unaffectedSibIds = [];
	window.loadSibs(affectedSibIds, 'affected');
	window.loadSibs(unaffectedSibIds, 'unaffected');

	window.updateUrl('rel0', "proband");	
	window.updateUrl('rel1', "mother");	
	window.updateUrl('rel2', "father");	

	window.updateUrl('name0', this.demoNames.proband);	
	window.updateUrl('vcf0',  this.demoUrls.proband);	
	if (!window.isLevelEdu) {
		window.updateUrl('bam0',  this.demoBamUrls.proband);	
	}
	window.updateUrl('sample0',  this.demoSampleNames.proband);	

	if (this.demoCards.mother) {
		window.updateUrl('name1', this.demoNames.mother);	
		window.updateUrl('vcf1',  this.demoUrls.mother);	
		if (!window.isLevelEdu) {
			window.updateUrl('bam1',  this.demoBamUrls.mother);
		}	
		window.updateUrl('sample1',  this.demoSampleNames.mother);			
	} 

	if (this.demoNames.father) {
		window.updateUrl('name2', this.demoNames.father);	
		window.updateUrl('vcf2',  this.demoUrls.father);	
		if (!window.isLevelEdu) {		
			window.updateUrl('bam2',  this.demoBamUrls.father);
		}	
		window.updateUrl('sample2',  this.demoSampleNames.father);			
	}

	

	if (!window.isLevelEdu) {
		window.updateUrl("gene", "RAI1");
		window.updateUrl("genes", "RAI1,AIRE,MYLK2");
		reloadGeneFromUrl();
	} else if (window.isLevelEduTour && this.eduTourGenes[+eduTourNumber-1].length > 0) {
		window.updateUrl("gene", this.eduTourGenes[+eduTourNumber-1][0]);
		window.updateUrl("genes", this.eduTourGenes[+eduTourNumber-1].join(","));
		reloadGeneFromUrl();
	} else {
		loadUrlSources();

	}

	

}

DataCard.prototype.loadSampleData = function(relationship, name, sampleName) {
	variantCard = getVariantCard(relationship);
	variantCard.setName(name);
	variantCard.setSampleName(sampleName);


	clearCache();
	window.loadTracksForGene();		
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
    panelSelector.find('#vcf-sample-select')[0].selectize.on('change', function() {
		me.onVcfSampleSelected(panelSelector);
	});

}


DataCard.prototype.init = function() {
	var me = this;

	if (this.isLevelEdu) {
		this.demoNames
	}

	$('#proband-data').append(dataCardEntryTemplate());
	$('#proband-data #vcf-sample-select').selectize(
		{ 
			create: true, 			
			valueField: 'value',
	    	labelField: 'value',
	    	searchField: ['value']
    	}
	);
	this.listenToEvents($('#proband-data'));
	addVariantCard();
	me.setDataSourceRelationship($('#proband-data'));
	
	
	$('#unaffected-sibs-select').selectize(
		{ 
			create: true, 
			maxItems: null,  
			valueField: 'value',
	    	labelField: 'value',
	    	searchField: ['value']
    	}
	);
	$('#affected-sibs-select').selectize(
		{ 
			create: true, 
			maxItems: null,  
			valueField: 'value',
	    	labelField: 'value',
	    	searchField: ['value']
    	}
	);


	$('#mother-data').append(dataCardEntryTemplate());
	$('#mother-data #sample-data-label').text("MOTHER");
	$('#mother-data #vcf-sample-select').selectize(
		{ 
			create: true, 			
			valueField: 'value',
	    	labelField: 'value',
	    	searchField: ['value']
    	}
	);
	this.listenToEvents($('#mother-data'));
	addVariantCard();
	me.setDataSourceRelationship($('#mother-data'));

	$('#father-data').append(dataCardEntryTemplate());
	$('#father-data #sample-data-label').text("FATHER");
	$('#father-data #vcf-sample-select').selectize(
		{ 
			create: true, 			
			valueField: 'value',
	    	labelField: 'value',
	    	searchField: ['value']
    	}
	);
	this.listenToEvents($('#father-data'));
	addVariantCard();
	me.setDataSourceRelationship($('#father-data'));
	

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
		var affectedSibIds  = $("#affected-sibs-select")[0].selectize.getValue();
		var unaffectedSibIds = $("#unaffected-sibs-select")[0].selectize.getValue();

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
    $('#data-card #affected-sibs-select')[0].selectize.setValue(affectedSibIds);

    var unaffectedSibIds = [];
    window.variantCardsSibs.unaffected.forEach(function(vc) {
    	unaffectedSibIds.push(vc.getName());
    })
    $('#data-card #unaffected-sibs-select')[0].selectize.setValue(unaffectedSibIds);

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

	variantCard.setDefaultSampleName(this.defaultSampleNames[variantCard.getRelationship()]);
	
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


	variantCard.onVcfFilesSelected(
		event, 
		function(vcfFileName, sampleNames) {
			me.panelSelectorFilesSelected.find('.vcf-sample.loader').addClass('hide');

			me.panelSelectorFilesSelected.find('#vcf-file-info').removeClass('hide');
			me.panelSelectorFilesSelected.find('#vcf-file-info').val(vcfFileName);

			// Only show the sample dropdown if the vcf file has more than one sample
			if (sampleNames.length > 1) {
				
				me.populateSampleDropdowns(variantCard, me.panelSelectorFilesSelected, sampleNames);

			} else {
				variantCard.setSampleName("");				
				variantCard.setDefaultSampleName(null);
				window.removeUrl('sample'+cardIndex);
				
				window.enableLoadButton();
			}
		},
		function(error) {
			me.panelSelectorFilesSelected.find(".vcf-sample.loader").addClass("hide");
		});
}

DataCard.prototype.populateSampleDropdowns = function(variantCard, panelSelector, sampleNames) {
	var me = this;

	// Populate the sample names in the dropdown
	panelSelector.find('#vcf-sample-box').removeClass('hide');
	if (me.mode == 'trio') {
		$('#unaffected-sibs-box').removeClass('hide');
		$('#affected-sibs-box').removeClass('hide');
	}
	panelSelector.find('#vcf-sample-select')[0].selectize.clearOptions();
	$('#unaffected-sibs-select')[0].selectize.clearOptions();
	$('#affected-sibs-select')[0].selectize.clearOptions();

	// Add a blank option if there is more than one sample in the vcf file
	if (sampleNames.length > 1) {
		panelSelector.find('#vcf-sample-select')[0].selectize.addOption({value:""});
		$('#unaffected-sibs-select')[0].selectize.addOption({value:""});			                             
		$('#affected-sibs-select')[0].selectize.addOption({value:""});			                             
	}							         

	// Populate the sample name in the dropdown
	sampleNames.forEach( function(sampleName) {
		panelSelector.find('#vcf-sample-select')[0].selectize.addOption({value:sampleName});
		$('#unaffected-sibs-select')[0].selectize.addOption({value:sampleName});
		$('#affected-sibs-select')[0].selectize.addOption({value:sampleName});		                                     		                                    
	});
	//panelSelector.find('#vcf-sample-select')[0].selectize.refreshOptions();
	//$('#unaffected-sibs-select')[0].selectize.refreshOptions();
	//$('#affected-sibs-select')[0].selectize.refreshOptions();

	
	me.initSibs();

	// If we are loading from URL parameters and the sample name was specified, select this
	// sample from dropdown
	if (variantCard.getDefaultSampleName() != null && variantCard.getDefaultSampleName() != "") {
		panelSelector.find('#vcf-sample-select')[0].selectize.setValue(variantCard.getDefaultSampleName());

		variantCard.setSampleName(variantCard.getDefaultSampleName());
		variantCard.setDefaultSampleName(null);
		window.enableLoadButton();
	} else {
		window.disableLoadButton();
	}	
}

DataCard.prototype.onVcfSampleSelected = function(panelSelector) {
	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];
	var sampleName = panelSelector.find('#vcf-sample-select')[0].selectize.getValue();
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
				me.populateSampleDropdowns(variantCard, panelSelector, sampleNames);

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