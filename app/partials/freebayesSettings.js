class FreebayesSettings {
  constructor() {

    this.onClose = null;
    this.visited = false;
    this.arguments = {
      'useSuggestedVariants':     {value: true,  defaultValue: true},
      'limitToSuggestedVariants': {value: false, defaultValue: false, argName: '-l',                    isFlag: true},
      'minMappingQual':           {value: 0,     defaultValue: 0,     argName: '--min-mapping-quality'},
      'minCoverage':              {value: 0,     defaultValue: 0,     argName: '--min-coverage'},
      'useDupReads':              {value: false, defaultValue: false, argName: '--use-duplicate-reads', isFlag: true}
    }

  }

  showDialog(onCloseFunc) {
    let me = this;
    if (allowFreebayesSettings) {
      me.onClose = onCloseFunc;
      me.visited = true;
      $('#fb-use-suggested-variants-cb').prop('checked', me.arguments.useSuggestedVariants.value);
      $('#fb-limit-to-suggested-variants-cb').prop('checked', me.arguments.limitToSuggestedVariants.value);
      $('#fb-min-mapping-qual'     ).val(me.arguments.minMappingQual.value);
      $('#fb-min-coverage'         ).val(me.arguments.minCoverage.value);
      $('#fb-use-dup-reads-cb'     ).prop('checked', me.arguments.useDupReads.value);

      $('#freebayes-settings-modal').modal("show");
    } else  {
      if (onCloseFunc) {
        onCloseFunc();
      }
    }
  }

  saveSettings() {
    let me = this;
    me.arguments.useSuggestedVariants.value     = $('#fb-use-suggested-variants-cb').is(":checked");
    me.arguments.limitToSuggestedVariants.value = $('#fb-limit-to-suggested-variants-cb').is(":checked");
    me.arguments.minMappingQual.value           = $('#fb-min-mapping-qual').val();
    me.arguments.minCoverage.value              = $('#fb-min-coverage').val();
    me.arguments.useDupReads.value              = $('#fb-use-dup-reads-cb').is(":checked");

    if (me.onClose) {
      me.onClose();
    }

    $('#freebayes-settings-modal').modal("hide");
  }
}

