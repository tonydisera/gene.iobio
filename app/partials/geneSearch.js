class GeneSearch {
  constructor() {


    // Engine for gene search suggestions
    this.geneTypeahead = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: [],
      limit: 200
    });

    this.onSelectFunc = null;


  }

  init() {
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
      me._onSelection(evt,data);
    });
    typeaheadDataDialog.on('typeahead:selected',function(evt,data){
      me._onSelection(evt,data);
    });


    me.getGeneBloodhoundElement().focus();

  }

  onSelect(func) {
    let me = this;
    me.onSelectFunc = func;
  }

  _onSelection(evt, data) {
    let me = this;

    // Ignore second event triggered by loading gene widget from url parameter
    if (data.loadFromUrl && loadedUrl) {
      return;
    } else if (data.loadFromUrl) {
      loadedUrl = true;
    }

    var theGeneName = data.name;

    if (me.onSelectFunc) {
      me.onSelectFunc(data.name, evt.currentTarget.id, data.loadFromUrl, function() {
        me.setValue(data.name);
        if (data.callback) {
          data.callback();
        }
      } );
    }

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