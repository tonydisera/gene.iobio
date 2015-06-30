function DataCard() {
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
	    panelSelector.find('#bam-file-selector-item').on('click', function() {
	    	me.onBamFileButtonClicked(panelSelector);
	    });
	    panelSelector.find('#bam-file-upload').on('change', function() {
	    	me.onBamFilesSelected(event, panelSelector);
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
	    panelSelector.find('#clear-vcf').on('click', function() {
	    	me.clearUrl(panelSelector);
	    });

	    panelSelector.find('#vcf-file-selector-item').on('click', function() {
	    	me.onVcfFileButtonClicked(panelSelector);
	    });
	    panelSelector.find('#vcf-file-upload').on('change', function() {
	    	me.onVcfFilesSelected(event, panelSelector);
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
		dataCardSelector.find('.fullview').addClass("hide");
	});

}


DataCard.prototype.onBamFileButtonClicked = function(panelSelector) {	
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	panelSelector.find('#bam-file-info').removeClass("hide");

	panelSelector.find('#bam-url-input').addClass('hide');
	panelSelector.find('#bam-url-input').val('');
}

DataCard.prototype.onBamFilesSelected = function(event, panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	var cardIndex = panelSelector.find('#card-index').val();

	var variantCard = variantCards[+cardIndex];

	this.setDataSourceName(panelSelector);
	this.setDataSourceRelationship(panelSelector);

	variantCard.onBamFilesSelected(event, function(bamFileName) {
		panelSelector.find('#bam-file-info').removeClass('hide');
		panelSelector.find('#bam-file-info').val(bamFileName);
		variantCard.loadBamDataSource(variantCard.getName());
	});
	variantCard.setDirty();


}


DataCard.prototype.onBamUrlEntered = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	var bamUrlInput = panelSelector.find('#bam-url-input');
	bamUrlInput.removeClass("hide");

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	this.setDataSourceName(panelSelector);
	this.setDataSourceRelationship(panelSelector);

	variantCard.onBamUrlEntered(bamUrlInput.val());	
	variantCard.loadBamDataSource(variantCard.getName());
	variantCard.setDirty();

	window.updateUrl('bam' + cardIndex, bamUrlInput.val());

}

DataCard.prototype.displayBamUrlBox = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	panelSelector.find('#bam-file-info').addClass('hide');
    panelSelector.find('#bam-file-info').val('');
    panelSelector.find('#bam-url-input').removeClass("hide");
    panelSelector.find("#bam-url-input").focus();

    var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	if (panelSelector.find('#bam-url-input').val() == '') {
	    panelSelector.find('#bam-url-input').val(this.defaultBamUrls[variantCard.getRelationship()]);
	}
    this.onBamUrlEntered(panelSelector);
	

}

DataCard.prototype.clearBamUrl = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];


	this.displayBamUrlBox(panelSelector);
	panelSelector.find("#bam-url-input").val("");
	this.onBamUrlEntered(panelSelector);

}

DataCard.prototype.displayUrlBox = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}

	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	if (panelSelector.find('#url-input').val() == '') {
	    panelSelector.find('#url-input').val(this.defaultUrls[variantCard.getRelationship()]);
	}
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


	this.displayUrlBox(panelSelector);
	panelSelector.find("#url-input").val("");
	this.onVcfUrlEntered(panelSelector);


}
DataCard.prototype.onVcfFileButtonClicked = function(panelSelector) {	
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	panelSelector.find('#vcf-file-info').removeClass("hide");

	panelSelector.find('#url-input').addClass('hide');
	panelSelector.find('#url-input').val('');
}

DataCard.prototype.onVcfFilesSelected = function(event, panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	this.setDataSourceName(panelSelector);
	this.setDataSourceRelationship(panelSelector);

	variantCard.onVcfFilesSelected(event, function(vcfFileName) {
		panelSelector.find('#vcf-file-info').removeClass('hide');
		panelSelector.find('#vcf-file-info').val(vcfFileName);
		variantCard.loadVcfDataSource(variantCard.getName(), function() {
			promiseFullTrio();

		});
	});
	variantCard.setDirty();
}

DataCard.prototype.onVcfUrlEntered = function(panelSelector) {
	if (!panelSelector) {
		panelSelector = $('#datasource-dialog');
	}
	var cardIndex = panelSelector.find('#card-index').val();
	var variantCard = variantCards[+cardIndex];

	this.setDataSourceName(panelSelector);
	this.setDataSourceRelationship(panelSelector);


	var vcfUrl = panelSelector.find('#url-input').val();

	variantCard.onVcfUrlEntered(vcfUrl);
	window.updateUrl('vcf'+cardIndex, vcfUrl);
	variantCard.loadVcfDataSource(variantCard.getName(),  function() {
		promiseFullTrio();
	});
	variantCard.setDirty();
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