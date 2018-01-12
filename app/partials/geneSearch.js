class GeneSearch {
  constructor() {


    // Engine for gene search suggestions
    this.geneTypeahead = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: [],
      limit: 200
    });


  }

  init(callback) {
    let me = this;

    // kicks off the loading/processing of `local` and `prefetch`
    me.geneTypeahead.initialize();


    var typeahead = me.getGeneBloodhoundElement().typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'name',
      displayKey: 'name',
      templates: {
        empty: [
          '<div class="empty-message">',
          'no genes match the current query',
          '</div>'
        ].join('\n'),
        suggestion: Handlebars.compile('<p><strong>{{name}}</strong></p>')
      },
      // `ttAdapter` wraps the suggestion engine in an adapter that
      // is compatible with the typeahead jQuery plugin
      source: me.geneTypeahead.ttAdapter()
    });

    var typeaheadDataDialog = me.getGeneBloodhoundElementForDataDialog().typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'name',
      displayKey: 'name',
      templates: {
        empty: [
          '<div class="empty-message">',
          'no genes match the current query',
          '</div>'
        ].join('\n'),
        suggestion: Handlebars.compile('<p><strong>{{name}}</strong></p>')
      },
      // `ttAdapter` wraps the suggestion engine in an adapter that
      // is compatible with the typeahead jQuery plugin
      source: me.geneTypeahead.ttAdapter()
    });

    typeahead.on('typeahead:selected',function(evt,data){
      me.onGeneNameEntered(evt,data);
    });
    typeaheadDataDialog.on('typeahead:selected',function(evt,data){
      me.onGeneNameEntered(evt,data);
    });


    me.getGeneBloodhoundElement().focus();

  }

  promiseLoad() {
    let me = this;
    return new Promise(function(resolve, reject) {
      geneModel.promiseLoadFullGeneSet()
      .then(function(sortedGenes) {
          me.geneTypeahead.clear();
          me.geneTypeahead.add(sortedGenes);
          resolve();
      },
      function(error) {
        reject(error);
      })
    })
  }


  onGeneNameEntered(evt,data) {
    let me = this;
    // Ignore second event triggered by loading gene widget from url parameter
    if (data.loadFromUrl && loadedUrl) {
      return;
    } else if (data.loadFromUrl) {
      loadedUrl = true;
    }

    var theGeneName = data.name;

    // If necessary, switch from gencode to refseq or vice versa if this gene
    // only has transcripts in only one of the gene sets
    geneCard.checkGeneSource(theGeneName);

    geneModel.promiseGetGeneObject(data.name)
    .then( function(theGeneObject) {
      // We have successfully return the gene model data.
      // Load all of the tracks for the gene's region.
      window.gene = theGeneObject;

      geneModel.adjustGeneRegion(window.gene);

      // Add the gene badge
      genesCard.addGene(window.gene.gene_name);
      cacheHelper.showAnalyzeAllProgress();


      // if the gene name was entered on the data dialog, enable/disable
      // the load button
      if (evt.currentTarget.id == 'enter-gene-name-data-dialog') {
        dataCard.enableLoadButton();
      }

      if (!validateGeneTranscripts()) {
        return;
      }

      // set all searches to correct gene
      me.setValue(window.gene.gene_name);
      window.selectedTranscript = geneModel.geneToLatestTranscript[window.gene.gene_name];


      if (data.loadFromUrl) {

        var bam  = util.getUrlParameter(/(bam)*/);
        var vcf  = util.getUrlParameter(/(vcf)*/);


        if (bam == null && vcf == null) {
          // Open the 'About' sidebar by default if there is no data loaded when gene is launched
          if (isLevelEdu) {
            if (!isLevelEdu || eduTourShowPhenolyzer[+eduTourNumber-1]) {
              showSidebar("Phenolyzer");
            }
          } else if (isLevelBasic) {
            showSidebar("Phenolyzer");
          }
        }


        if (bam == null && vcf == null) {
          // Open the 'About' sidebar by default if there is no data loaded when gene is launched
          if (isLevelEdu) {
            if (!isLevelEdu || eduTourShowPhenolyzer[+eduTourNumber-1]) {
              showSidebar("Phenolyzer");
            }
          }
        }

        if (!isOffline) {
            genesCard.updateGeneInfoLink(window.gene.gene_name);
        }

          // Autoload data specified in url
        loadUrlSources();

        enableCallVariantsButton();
      } else {
          genesCard.setSelectedGene(window.gene.gene_name);

          // Only load the variant data if the gene name was NOT entered
          // on the data dialog.
          if (evt.currentTarget.id != 'enter-gene-name-data-dialog') {
              loadTracksForGene();
          }

            // add gene to url params
            util.updateUrl('gene', window.gene.gene_name);

            if (!isOffline) {
              genesCard.updateGeneInfoLink(window.gene.gene_name);
            }

            if(data.callback != undefined) data.callback();
      }


    }, function(error) {
      alertify.alert(error);
      genesCard.removeGeneBadgeByName(theGeneName);

    });
  }

  setValue(geneName, loadFromUrl, trigger) {
    let me = this;
    if (!isLevelBasic) {
      me.getGeneBloodhoundInputElement().val(geneName);
    }
    if (trigger) {
      me.getGeneBloodhoundInputElement().trigger('typeahead:selected', {"name": geneName, loadFromUrl: loadFromUrl});
    }
  }


  getGeneBloodhoundElementForDataDialog() {
    let me = this;
    return $('#bloodhound-data-dialog .typeahead');
  }
  getGeneBloodhoundInputElementForDataDialog() {
    let me = this;
    return $('#bloodhound-data-dialog .typeahead.tt-input');
  }

  getGeneBloodhoundElement() {
    let me = this;
    return isLevelBasic ? $('#bloodhound-sidebar .typeahead') : $('#bloodhound .typeahead');
  }

  getGeneBloodhoundInputElement() {
    let me = this;
    return isLevelBasic ? $('#bloodhound-sidebar .typeahead.tt-input') : $('#bloodhound .typeahead.tt-input');
  }



}