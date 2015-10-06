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
	$('#unaffected-sibs-select').chosen({width: "300px;font-size:11px;"});


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

		var unaffectedSibs = $("#unaffected-sibs-select").chosen().val();
		window.loadUnaffectedSibs(unaffectedSibs);

		window.loadTracksForGene();		
	});


}

/*
DataCard.prototype.addUnaffectedSib = function() {
	var cardIndex = 3;
	var name = 'unaffected-sib-data-' + cardIndex;
	var sibHtml = 
	    '<div id="' 
	    + name 
	    + '"  style="float:left;width:32%">  '
	    + '   <input id="card-index" class="hide" value="' 
		+ cardIndex
		+ '"   type="text">'
		+ '   <input id="datasource-relationship" class="hide" value="sibling" type="text"/>'
	    + '</div>';

	$('#unaffected-sibs').append(sibHtml);
	$('#' + name).append(dataCardEntryTemplate());
	
	this.listenToEvents($('#' + name));
	addVariantCard();
	$('#' + name +  ' #sample-data-label').text("UNAFFECTED SIB");
	this.setDataSourceRelationship('#' + name);
	$('#' + name + ' #vcf-sample-select').chosen({width: "150px;font-size:11px;"});
	
}
*/



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

	variantCard.onBamFilesSelected(event).then(function(bamFileName) {
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
			}
			me.panelSelectorFilesSelected.find('#vcf-sample-select')
								         .find('option').remove();
			$('#unaffected-sibs-select').find('option').remove();								         

			// Add a blank option if there is more than one sample in the vcf file
			if (sampleNames.length > 1) {
				me.panelSelectorFilesSelected.find('#vcf-sample-select')
				                             .append($("<option></option>"));
				$('#unaffected-sibs-select').append($("<option></option>"));				                             
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
			});
			me.panelSelectorFilesSelected.find('#vcf-sample-select').trigger("chosen:updated");
			$('#unaffected-sibs-select').trigger("chosen:updated");

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
	variantCard.setDirty();
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
				}
				$('#unaffected-sibs-select').find('option').remove();

				// Add a blank option if there is more than one sample in the vcf file
				if (sampleNames.length > 1) {
					panelSelector.find('#vcf-sample-select')
					             .append($("<option></option>"));
					$('#unaffected-sibs-select').append($("<option></option>"));
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
				});
				panelSelector.find('#vcf-sample-select').trigger("chosen:updated");
				$('#unaffected-sibs-select').trigger("chosen:updated");

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

			variantCard.setDirty();
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