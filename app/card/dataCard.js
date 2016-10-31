function DataCard() {
	this.species = 'homo_sapiens';
	this.build   = 'GRCh37';
	this.speciesList = [];
	this.speciesNameToSpecies = {}; // map species name to the species object
	this.speciesToBuilds = {};      // map species to its genome builds
	this.buildNameToBuild = {};     // map genome build name to the full genome build object

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
		proband: 'https://s3.amazonaws.com/iobio/samples/vcf/exome-trio.vcf.gz',
		mother:  'https://s3.amazonaws.com/iobio/samples/vcf/exome-trio.vcf.gz',
		father:  'https://s3.amazonaws.com/iobio/samples/vcf/exome-trio.vcf.gz'
	};
	this.demoBamUrls = {
		proband: 'https://s3.amazonaws.com/iobio/samples/bam/NA19240.bam',
		mother:  'https://s3.amazonaws.com/iobio/samples/bam/NA19238.bam',
		father:  'https://s3.amazonaws.com/iobio/samples/bam/NA19239.bam'
	};
	this.demoSampleNames = {
		proband: 'NA19240',
		mother:  'NA19238',
		father:  'NA19239'
	};

	this.eduTourModes = [
		'single',
		'single',
		'single'
	];


	this.eduTourUrls = [ 
	{
		proband: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
		mother:  'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
		father:  'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz'
	},
	{
		proband: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
		mother:  'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
		father:  'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz'
	},
	{
		proband: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
		mother: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
		father: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz'
	}
	];

	this.eduTourUrlsOffline = [ 
	{
		proband: 'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
		mother:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
		father:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz'
	},
	{
		proband: 'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
		mother:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
		father:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz'
	},
	{
		proband: 'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
		mother:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
		father:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz'
	}
	];
	this.eduTourCards = [
		{
			proband: true,
			mother:  false,
			father:  false
		},
		{
			proband: true,
			mother:  false,
			father:  false
		},
		{
			proband: false,
			mother:  false,
			father:  false
		}
	];	
	this.eduTourNames = [
		{
			proband: 'Alex'
		},
		{
			proband: 'Father'
		},
		{
			proband: 'John'
		}
	];	
	this.eduTourSampleNames = [
		{
			proband: 'sample3',
			mother:  'sample1', 
			father:  'sample2' 
		},
		{
			proband: 'sample2'
		},
		{
			proband: 'sample1'
		}
	];
	this.eduTourGenes = [
		[],
		[],
		['VKORC1']
	];
	this.mygene2Genes = [
		'KDM1A'
	];
	


	this.mode = 'single';
	this.panelSelectorFilesSelected = null;

}

DataCard.prototype.loadDemoData = function() {
	var me = this;

	if (isLevelEdu) {
		var idx = isLevelEduTour ? +eduTourNumber : 0;
		this.demoCards      = this.eduTourCards[idx];
		this.demoUrls        = isOffline ? this.eduTourUrlsOffline[idx] : this.eduTourUrls[idx];
		this.demoNames       = this.eduTourNames[idx];
		this.demoSampleNames = this.eduTourSampleNames[idx];			
		this.demoMode        = this.eduTourModes[idx];
	} 

	$('#splash').addClass("hide");	
	this.mode = this.demoMode;

	// Clear the cache
	var affectedSibIds  = [];
	var unaffectedSibIds = [];
	window.loadSibs(affectedSibIds, 'affected');
	window.loadSibs(unaffectedSibIds, 'unaffected');

	window.updateUrl('rel0', "proband");	
	window.updateUrl('rel', "mother");	
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

		cacheHelper.clearCache();
		window.matrixCard.reset();
		window.loadedUrl = false;


		reloadGeneFromUrl();
	} else if (window.isLevelEduTour && this.eduTourGenes[+eduTourNumber].length > 0) {
		window.updateUrl("gene", this.eduTourGenes[+eduTourNumber][0]);
		window.updateUrl("genes", this.eduTourGenes[+eduTourNumber].join(","));
		reloadGeneFromUrl();
	} else {
		loadUrlSources();

	}

	

}

DataCard.prototype.loadMygene2Data = function() {
	var me = this;


	var loadProband = function(vcfFilePath) {

		if (vcfFilePath != null) {
			var probandUrl = "http://" + serverInstance + vcfFilePath;
			me.setVcfUrl("proband", "Variants", sampleName, probandUrl);
		} else {
			// Load full demo wgs trio data if vcf file path was not provided via mygene2 data exchange
			me.mode = "trio";
			me.setVcfUrl("proband", "DEMO DATA", me.demoSampleNames.proband, me.demoUrls.proband);
			me.setVcfUrl("mother",  "MOTHER",    me.demoSampleNames.mother, me.demoUrls.mother);
			me.setVcfUrl("father",  "FATHER",    me.demoSampleNames.father, me.demoUrls.father);
		}

		var genes = getUrlParameter("genes");
		if (genes != null && genes.length > 0) {
			window.geneNames = genes.split(",");
		} else {
			window.geneNames = me.mygene2Genes;
		}
		var geneToSelect = getUrlParameter("gene");
		if (geneToSelect == null && geneToSelect == "") {
			geneToSelect = window.geneNames[0];
		}

		genesCard.initCopyPasteGenes();
		genesCard.copyPasteGenes(geneToSelect, true);
		window.showSidebar("Phenolyzer");

		window.cacheHelper.clearCache();
		window.matrixCard.reset();		
	};


	var missingVariables = "";
	if (mygene2Endpoint == "") {
		missingVariables += "mygene2Endpoint ";
	} 
	if (mygene2XAuthToken == "") {
		missingVariables += "mygene2XAuthToken ";
	} 
	if (missingVariables.length > 0) {
		alertify.confirm("Cannot load data files until the following variables are initialized in globalDeployments.js: " + missingVariables + ".",
					    function(){ 
					    }, 
					    function(){ 
					    	loadProband();
					    }
					 ).set('labels', {ok:'OK', cancel:'Continue, but just use demo data'});   		
	} else {
		
		var endpointUrl = mygene2Endpoint + "?token=" + getUrlParameter("token");
		$.ajax({
		    url : endpointUrl,
		    headers: {
		        'X-Auth-Token' : mygene2XAuthToken,
		        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
		    },
		    crossDomain: true,
		    type: "GET",
			success: function(response) {
				loadProband(response);	    	
		    },
		    error: function( xhr, status, errorThrown ) {
		        console.log( "Error: " + errorThrown );
		        console.log( "Status: " + status );
		        console.log( xhr );
		        console.log("Unable to get MyGene2 endpoint filenames");

		        alertify.confirm("Unable to obtain variant files using MyGene2 token.",
				    function(){ 
				    }, 
				    function(){ 
				    	loadProband();
				    }
				 ).set('labels', {ok:'OK', cancel:'Continue, but just use demo data'}); ;   
		    }
		});
	}

}

DataCard.prototype.loadSampleData = function(relationship, name, sampleName, mode) {
	variantCard = getVariantCard(relationship);
	variantCard.setName(name);
	variantCard.setSampleName(sampleName);
	this.mode = 'single';


	//cacheHelper.clearCache();
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

   

}

DataCard.prototype.loadSpeciesAndBuilds = function() {
	var me = this;
    $.ajax({
        url: genomeBuildServer,
        jsonp: "callback",
		type: "GET",
		dataType: "jsonp",
        error: function( xhr, status, errorThrown ) {
		        
		        console.log( "Error: " + errorThrown );
		        console.log( "Status: " + status );
		        console.log( xhr );
		},
        success: function(allSpecies) {
        	
        	allSpecies.forEach(function(species) {
        		// Map the species latin name to its species object
        		me.speciesNameToSpecies[species.latin_name] = species;

        		// Collect all species into a list to use for dropdown
        		me.speciesList.push({name: species.name, value: species.latin_name});

        		species.genomeBuilds.forEach(function(genomeBuild) {

        			// Map the build name to its build object
        			me.buildNameToBuild[genomeBuild.name] = genomeBuild;

        			// Map the species to its genome builds
        			var builds = me.speciesToBuilds[species.latin_name];
        			if (builds == null) {
        				builds = [];
        				me.speciesToBuilds[species.latin_name] = builds;
        			}
        			builds.push(genomeBuild);
        		
        		})
        	})
			$('#select-species').selectize(
				{	
					create: true, 			
					valueField: 'value',
			    	labelField: 'name',
			    	searchField: ['name'],
			    	maxItems: 1,
			    	options: me.speciesList
		    	}
			);
			me.addSpeciesListener();
			$('#select-build').selectize(
				{
					create: true, 			
					valueField: 'name',
			    	labelField: 'name',
			    	searchField: ['name']
		    	}
			);
			me.addBuildListener();
			me.setDefaultBuildFromData();
        }
    });

}

DataCard.prototype.removeSpeciesListener = function() {
	if ($('#select-species')[0].selectize) {
		$('#select-species')[0].selectize.off('change');
	}
}

DataCard.prototype.addSpeciesListener = function() {
	var me = this;
	if ($('#select-species')[0].selectize) {
		$('#select-species')[0].selectize.on('change', function(value) {
	        if (!value.length) {
	        	return;
	        }
	        me.species = value;
	        var selectizeBuild = $('#select-build')[0].selectize;
	        selectizeBuild.disable();
	        selectizeBuild.clearOptions();
	        selectizeBuild.load(function(callback) {
	        	selectizeBuild.enable();
	        	callback(me.speciesToBuilds[value]);
	        });
	    });
	}

}


DataCard.prototype.removeBuildListener = function() {
	if ($('#select-build')[0].selectize) {
		$('#select-build')[0].selectize.off('change');
	}

}

DataCard.prototype.addBuildListener = function() {
	var me = this;
	if ($('#select-build')[0].selectize) {
	    $('#select-build')[0].selectize.on('change', function(value) {
			if (!value.length) {
				return;
			}
			me.build = value;
			me.validateBuildFromData(function(success, message) {
				if (success) {
					$('#species-build-warning').addClass("hide");
					window.enableLoadButton();
				} else {
					$('#species-build-warning').html(message);
					$('#species-build-warning').removeClass("hide");
					window.disableLoadButton();
				}
			});
			// TODO:  get geneinfo for selected gene, validate that compatible
			// genome build according to vcf and bam headers was selected.
		});
	}

}


DataCard.prototype.setDefaultBuildFromData = function() {
	var me = this;
	if ($('#select-species')[0].selectize && $('#select-build')[0].selectize) {
		me.getAggregateBuildFromData(function(aggregate) {
			if (aggregate.length == 0) {
				$('#species-build-warning').addClass("hide");
				window.enableLoadButton();
			} else if (aggregate.length == 1) {			
				var buildInfo = aggregate[0];
				me.removeBuildListener();
				$('#select-species')[0].selectize.setValue(buildInfo.species.latin_name);
				$('#select-build')[0].selectize.setValue(buildInfo.build.name);	
				me.addBuildListener();

				$('#species-build-warning').addClass("hide");				
				window.enableLoadButton();		
			} else {
				var message = "Imcompatible builds in files.";
				aggregate.forEach(function(buildInfo) {
					message += "<br>Build " + buildInfo.species.name + " " + buildInfo.build.name + " specified in ";
					var fromCount = 0;
					buildInfo.from.forEach(function(fileInfo) {
						if (fromCount > 0) {
							message += ", ";
						}
						message += fileInfo.relationship + " " + fileInfo.type;
						fromCount++;
					});
					message += ".";
				});
				$('#species-build-warning').html(message);
				$('#species-build-warning').removeClass("hide");
				window.disableLoadButton();
			}
		});		
	}

}

DataCard.prototype.validateBuildFromData = function(callback) {
	var me = this;
	me.getAggregateBuildFromData(function(aggregate) {
		if (aggregate.length == 0) {
			callback(true);

		} else if (aggregate.length == 1) {
			var buildInfo = aggregate[0];
			if (me.species == buildInfo.species.latin_name && me.build == buildInfo.build.name) {
				callback(true);
			} else {
				callback(false, 'Incompatible build. Data files specify the genome build ' + buildInfo.species.name + ' ' + buildInfo.build.name);
			}
		} else {
			var message = "Imcompatible builds in files.";
			aggregate.forEach(function(buildInfo) {
				message += "<br>Build " + buildInfo.species.name + " " + buildInfo.build.name + " specified in ";
				var fromCount = 0;
				buildInfo.from.forEach(function(fileInfo) {
					if (fromCount > 0) {
						message += ", ";
					}
					message += fileInfo.relationship + " " + fileInfo.type;
					fromCount++;
				});
				message += ".";
			});
			callback(false, message);
		}
	});
}

/*
  Look at all of the bams and vcfs and determine the species and builds.
  The aggregate object is an array of all species/build combos found
  in the headers.
  When all files are consistent, there will be one row in the aggregate array:
  	[{species: homo_sapiens, build: GRCh37, from: [array_of_all_bams_and_probands]}]

  When there are there are different species or builds in headers, the aggregate will
  container more than one row
    [{species: homo_sapiens, build: GRCh37, from:[type:bam, relationship: 'proband']},
     {species: homo_sapiens, build: GRCh38, from[type:vcf, relationship: 'proband']}
    ]

*/
DataCard.prototype.getAggregateBuildFromData = function(callback) {
	var me = this;

	// First review all of the bams
	me.getBuildFromBams(function(buildInfos) {
		var aggregate = [];
		me.parseBuildInfos(buildInfos, 'bam', aggregate);

		// Now review all of the vcfs
		me.getBuildFromVcfs(function(buildInfos) {
			me.parseBuildInfos(buildInfos, 'vcf', aggregate);
			callback(aggregate);
		})
	});	
}

DataCard.prototype.parseBuildInfos = function(buildInfos, type, aggregate) {
	var me = this;
	for (relationship in buildInfos) {			

		var buildInfo = buildInfos[relationship];
		if (buildInfo == null || (buildInfo.species == null && buildInfo.build == null && (buildInfo.references == null || Object.keys(buildInfo.references).length == 0))) {
			// We don't have any information in the file to find the species and build
		} else {
			// We have build info from the file.  Now try to match it to a known species and build
			var speciesBuild = me.getProperSpeciesAndBuild(buildInfo);
			if (speciesBuild.species && speciesBuild.build) {
				if (aggregate.length == 0) {
					// TODO:  Need to indicate which data files (proband-bam, mother-bam, father-vcf, etc)
					// that have this build
					aggregate.push( {species: speciesBuild.species, build: speciesBuild.build, from: [{type: type, relationship: relationship}]});
				} else {
					var foundAggregate = null;
					aggregate.forEach(function(aggregateSpeciesBuild) {
						if (aggregateSpeciesBuild.species == speciesBuild.species && aggregateSpeciesBuild.build == speciesBuild.build) {
							foundAggregate = aggregateSpeciesBuild;
						}
					});
					if (foundAggregate) {
						from = foundAggregate.from;
						from.push({type: type, relationship: relationship});

					} else {
						aggregate.push( {species: speciesBuild.species, build: speciesBuild.build, from: [{type: type, relationship: relationship}]});
					}

				}				
			}

		}
	}
}

/*
	Given the species and build names in the file header, try to find the corresponding
	species and genome build based on matching the header names to the names (name, binomialName, latin_name)
	of the species and the names (name and aliases) of genome build. 
*/
DataCard.prototype.getProperSpeciesAndBuild = function(buildInfo) {
	var me = this;
	var matchedSpecies = null;
	var matchedBuild = null;

	if (buildInfo != null) {
		// If the bam header provided a species, make sure it matches the
		// selected species name (or latin or binomial name).
		if (buildInfo.species) {
			for (speciesName in me.speciesNameToSpecies) {
				if (!matchedSpecies) {
					var species = me.speciesNameToSpecies[speciesName];
					if (species.name == buildInfo.species || species.binomialName == buildInfo.species || species.latin_name ==  buildInfo.species ) {
						matchedSpecies = species;
					} 					
				}
			} 
		}

		// For now, just default to Human if species can't be determined from file headers
		if (!matchedSpecies) {
			matchedSpecies = me.speciesNameToSpecies["homo_sapiens"];
		}

		// Make sure each bam has a build that matches the selected
		// build name or one of its aliases
		if (matchedSpecies) {
			if (buildInfo.build) {
				matchedSpecies.genomeBuilds.forEach(function(build) {
					if (!matchedBuild) {
						if (build.name == buildInfo.build) {
							matchedBuild = build;
						} else {
							build.aliases.forEach(function(gbAlias) {
								if (gbAlias.alias == buildInfo.build) {
									matchedBuild = build;
								}
							})
						}																
					}
				})
							
			} else {
				// If a build wasn't specified, try to match to a genome build based on reference lengths
				matchedSpecies.genomeBuilds.forEach(function(build) {
					if (!matchedBuild) {
						var matchedCount = 0;
						var notMatchedCount = 0;
						var notFoundCount = 0;
						build.references.forEach(function(reference) {
							var refLength = null;
							if (buildInfo.references[reference.name]) {
								refLength = buildInfo.references[reference.name];
							} else if (buildInfo.references[reference.alias]) {
								refLength = buildInfo.references[reference.name];
							}
							if (refLength && refLength == reference.length) {
								matchedCount++;
							} else if (refLength && refLength == reference.length - 1) {
								matchedCount++;
							} else if (refLength && refLength == reference.length + 1) {
								matchedCount++;
							} else if (refLength && refLength != reference.length) {
								notMatchedCount++;
							} else {
								notFoundCount++;
							}
						});
						if (build.references.length == matchedCount) {
							matchedBuild = build;
						} else if (matchedCount > 0 && notMatchedCount == 0 && notFoundCount == 0) {
							matchedBuild = build;
						}

					}

				})

			}
		}
	}
	return {species: matchedSpecies, build: matchedBuild};


}

DataCard.prototype.getBuildFromBams = function(callback) {
	var buildInfos = {};
	var cardCount = 0;
	variantCards.forEach(function(variantCard) {
		if (variantCard.model.bam) {
			variantCard.model.bam.getBuildFromHeader(function(buildInfo) {
				buildInfos[variantCard.getRelationship()] = buildInfo;
				cardCount++;
				if (cardCount == variantCards.length) {
					callback(buildInfos);
				}

			});
		} else {
			cardCount++;
			buildInfos[variantCard.getRelationship()] = null;
			if (cardCount == variantCards.length) {
				callback(buildInfos);
			}
		}
	});
}



DataCard.prototype.getBuildFromVcfs = function(callback) {
	var buildInfos = {};
	var cardCount = 0;
	variantCards.forEach(function(variantCard) {
		if (variantCard.model.vcf) {
			variantCard.model.vcf.getBuildFromHeader(function(buildInfo) {
				buildInfos[variantCard.getRelationship()] = buildInfo;
				cardCount++;
				if (cardCount == variantCards.length) {
					callback(buildInfos);
				}

			});
		} else {
			cardCount++;
			buildInfos[variantCard.getRelationship()] = null;
			if (cardCount == variantCards.length) {
				callback(buildInfos);
			}
		}
	});
}

DataCard.prototype.init = function() {
	var me = this;

	if (this.isLevelEdu) {
		this.demoNames
	}
	me.loadSpeciesAndBuilds();
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
	$('#proband-data').find("#url-input").removeClass('hide');
	$('#proband-data').find("#bam-url-input").removeClass('hide');
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
	$('#mother-data').find("#url-input").removeClass('hide');
	$('#mother-data').find("#bam-url-input").removeClass('hide');
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
	$('#father-data').find("#url-input").removeClass('hide');
	$('#father-data').find("#bam-url-input").removeClass('hide');
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
		cacheHelper.clearCache();

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

		window.matrixCard.reset();

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


DataCard.prototype.onBamUrlEntered = function(panelSelector, callback) {
	var me = this;
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

	var bamUrl = bamUrlInput.val();
	if (isOffline) {
		if (bamUrl.indexOf(offlineUrlTag) == 0) {
			bamUrl = "http://" + serverInstance + serverDataDir + bamUrl.split(offlineUrlTag)[1];
		}
	}

	variantCard.onBamUrlEntered(bamUrl, function(success) {

		if (success) {
			variantCard.setName(variantCard.getName());
			window.updateUrl('bam' + cardIndex, bamUrl);
			me.setDefaultBuildFromData();

			enableLoadButton();			
		} else {
			window.disableLoadButton();
		}

		if (callback) {
			callback(success);
		}

	});	

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
	window.updateUrl('sample' + cardIndex, this.defaultSampleNames[variantCard.getRelationship()]);
	
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

    // When the sample name dropdown is selected
    panelSelector.find('#vcf-sample-select')[0].selectize.off('change');

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

	// When the sample name dropdown is selected
    panelSelector.find('#vcf-sample-select')[0].selectize.on('change', function() {
		me.onVcfSampleSelected(panelSelector);
	});

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

DataCard.prototype.onVcfUrlEntered = function(panelSelector, callback) {
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

	if (isOffline) {
		if (vcfUrl.indexOf(offlineUrlTag) == 0) {
			vcfUrl = "http://" + serverInstance + serverDataDir + vcfUrl.split(offlineUrlTag)[1];
		}
	}

	panelSelector.find('#vcf-sample-box').addClass('hide');
	panelSelector.find('.vcf-sample.loader').removeClass('hide');

	window.updateUrl('vcf'+cardIndex, vcfUrl);
	
	variantCard.onVcfUrlEntered(vcfUrl, function(success, sampleNames) {
		panelSelector.find('.vcf-sample.loader').addClass('hide');

		if (success) {
			me.setDefaultBuildFromData();
			
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

		if (callback) {
			callback(success);
		}
		
		
	});
}



DataCard.prototype.setVcfUrl = function(relationship, name, sampleName, vcfUrl) {
	var me = this;
	
	var variantCard = getVariantCard(relationship);
	variantCard.setRelationship(relationship);		
	variantCard.setName(name);
	variantCard.setVariantCardLabel();
	variantCard.showDataSources(name);
	variantCard.onVcfUrlEntered(vcfUrl, function(success, sampleNames) {
		variantCard.setSampleName(sampleName);
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
