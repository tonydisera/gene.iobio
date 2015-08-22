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
	this.mode = 'single';
	this.panelSelectorFilesSelected = null;

}


DataCard.prototype.init = function() {
	var me = this;
	var listenToEvents = function(panelSelector) {
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
	    panelSelector.find('#bam-file-upload').on('change', function() {
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

	   
	    panelSelector.find('#vcf-file-upload').on('change', function() {
	    	me.onVcfFilesSelected(event);
	    });
	    // This will ensure that if a same file selected consecutively
	    // will file the 'change' event
	    panelSelector.find('#vcf-file-upload').on('click', function() {
	    	this.value = null;
	    });
	}

	$('#proband-data').append(dataCardEntryTemplate());
	listenToEvents($('#proband-data'));
	addVariantCard();
	me.setDataSourceRelationship($('#proband-data'));


	$('#mother-data').append(dataCardEntryTemplate());
	$('#mother-data #sample-data-label').text("MOTHER");
	listenToEvents($('#mother-data'));
	addVariantCard();
	me.setDataSourceRelationship($('#mother-data'));

	$('#father-data').append(dataCardEntryTemplate());
	$('#father-data #sample-data-label').text("FATHER");
	listenToEvents($('#father-data'));
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
		window.loadTracksForGene();		
	});


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
	variantCard.setDirty();

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

	variantCard.setDirty();
	variantCard.onBamUrlEntered(bamUrlInput.val());	
	variantCard.loadBamDataSource(variantCard.getName());

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

	this.setDataSourceName(this.panelSelectorFilesSelected);
	this.setDataSourceRelationship(this.panelSelectorFilesSelected);

	var cardIndex = this.panelSelectorFilesSelected.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];	

	variantCard.onVcfFilesSelected(event, function(vcfFileName) {
		me.panelSelectorFilesSelected.find('#vcf-file-info').removeClass('hide');
		me.panelSelectorFilesSelected.find('#vcf-file-info').val(vcfFileName);
		window.enableLoadButton();
	});
	variantCard.setDirty();
}

DataCard.prototype.onVcfUrlEntered = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	$('#tourWelcome').removeClass("open");
	
	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	this.setDataSourceName(panelSelector);
	this.setDataSourceRelationship(panelSelector);


	var vcfUrl = panelSelector.find('#url-input').val();

	variantCard.onVcfUrlEntered(vcfUrl, function() {
		window.updateUrl('vcf'+cardIndex, vcfUrl);
		variantCard.setDirty();
		window.enableLoadButton();
		
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