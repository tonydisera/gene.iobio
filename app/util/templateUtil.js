class TemplateUtil {
  constructor() {
      //
      // Handlebar templates
      //
      // Main cards
      this.navbarTemplate = null;
      this.genesControlCardTemplate = null;
      this.geneCardTemplate = null;
      this.knownVariantsNavTemplateHTML = null;
      this.variantCardTemplate = null;
      this.legendTemplate = null;

      // Modals
      this.modalsTemplate = null;
      this.dataCardEntryTemplate = null;

      // Side panel
      this.filterAffectedTemplate = null;
      this.filterCardTemplateHTML = null;
      this.genesCardTemplateHTML = null;
      this.bookmarkTemplateHTML = null;
      this.recallTemplateHTML = null;

      // Misc
      this.iconbarTemplate = null;
      this.tourTemplate = null;
      this.introTemplate = null;
      this.eduTourTemplateHTML = null;
      this.welcomePanelTemplate = null;
      this.matrixCardTemplate = null;

  }


  promiseLoadTemplates(welcomePanel)  {
    let me = this;

    return new Promise(function(resolve, reject) {
      var promises = [];
      promises.push(me.promiseLoadTemplate('templates/welcomePanelTemplate.hbs').then(function(compiledTemplate) {
        me.welcomePanelTemplate = compiledTemplate;
        welcomePanel.init();
      }));
      promises.push(me.promiseLoadTemplate('templates/dataCardEntryTemplate.hbs').then(function(compiledTemplate) {
        me.dataCardEntryTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/filterSlidebarTemplate.hbs').then(function(compiledTemplate) {
      //promises.push(me.promiseLoadTemplate('templates/filterCancerTemplate.hbs').then(function(compiledTemplate) {
        me.filterCardTemplateHTML = compiledTemplate();
      }));
      promises.push(me.promiseLoadTemplate('templates/variantCardTemplate.hbs').then(function(compiledTemplate) {
        me.variantCardTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/geneBadgeTemplate.hbs').then(function(compiledTemplate) {
        me.geneBadgeTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/genesCardTemplate.hbs').then(function(compiledTemplate) {
        me.genesCardTemplateHTML = compiledTemplate();
      }));
      promises.push(me.promiseLoadTemplate('templates/bookmarkCardTemplate.hbs').then(function(compiledTemplate) {
        me.bookmarkTemplateHTML = compiledTemplate();
      }));
      promises.push(me.promiseLoadTemplate('templates/knownVariantsNavTemplate.hbs').then(function(compiledTemplate) {
        me.knownVariantsNavTemplateHTML = compiledTemplate();
      }));
      promises.push(me.promiseLoadTemplate('templates/recallCardTemplate.hbs').then(function(compiledTemplate) {
        me.recallTemplateHTML = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/eduTourCardTemplate.hbs').then(function(compiledTemplate) {
        me.eduTourTemplateHTML = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/iconbarTemplate.hbs').then(function(compiledTemplate) {
        me.iconbarTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/tourTemplate.hbs').then(function(compiledTemplate) {
        me.tourTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/introTemplate.hbs').then(function(compiledTemplate) {
        me.introTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/legendBasicTemplate.hbs').then(function(compiledTemplate) {
        me.legendBasicTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/legendTemplate.hbs').then(function(compiledTemplate) {
        me.legendTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/svgGlyphsTemplate.hbs').then(function(compiledTemplate) {
        me.svgGlyphsTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/navbarTemplate.hbs').then(function(compiledTemplate) {
        me.navbarTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/modalsTemplate.hbs').then(function(compiledTemplate) {
        me.modalsTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/filterAffectedTemplate.hbs').then(function(compiledTemplate) {
        me.filterAffectedTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/genesControlCardTemplate.hbs').then(function(compiledTemplate) {
        me.genesControlCardTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/geneCardTemplate.hbs').then(function(compiledTemplate) {
        me.geneCardTemplate = compiledTemplate;
      }));
      promises.push(me.promiseLoadTemplate('templates/matrixCardTemplate.hbs').then(function(compiledTemplate) {
        me.matrixCardTemplate = compiledTemplate;
      }));


      Promise.all(promises).then(function() {
        resolve();
      },
      function(error) {
        reject(error);
      });


    })


  }

  promiseLoadTemplate(templateName) {
    let me = this;
    return new Promise( function(resolve, reject) {
      $.get(templateName, function (data) {
          resolve(Handlebars.compile(data));
      }, 'html');
    });

  }



}