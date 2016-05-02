/*
* These variables control special behavior for running gene.iobio education edition, with
* a simplified interface and logic.  For running one of the special educational edition 
* tours (e.g. a guided tour of the gene.iobio app), turn on both isLevelEdu and isLevelEduTour.
*/
var isSelfContainedServer   = true; // is the client + the server running on one machine?
var isOffline               = true;  // is there any internet connect to outside services like clinvar, ncbi?
var isLevelEdu              = true;  // is gene.iobio educational version, simplified version of app
var isLevelEduTour          = true;  // is gene.iobio exhibit version, a simplified version of the app w/ guided tour

var eduTourNumber           = "0";
var eduTourShowPhenolyzer   = [true, false];

var levelEduImpact = {
	HIGH:      'Harmful',
	MODERATE:  'Possibly harmful',
	MODIFIER:  'Neutral',
	LOW:       'Low'
}

//
// For the exhibit version, we will restart to the welcome page after n seconds of inactivity
//
var IDLE_INTERVAL = 3000;  // (in milliseconds) Check for inactivity every 5 seconds 
var MAX_IDLE      = 20;    // After 1 minute (e.g. 3 * 20 seconds), prompt the user about inactivity
var IDLE_RESTART  = 10000; // (in milliseconds) Automatically restart app in no prompt action taken after 10 seconds
var idleTime = 0;
var idlePrompting = false;

//
// URLS
//
var stage_iobio_services    = "nv-green.iobio.io/";
var dev_iobio_services      = "nv-dev.iobio.io/";
var prod_iobio_services     = "services.iobio.io/";
var self_contained_services = "frontend/"

var iobio_services        = (isSelfContainedServer ? "ws://" : "wss://")  + (isSelfContainedServer ? self_contained_services : prod_iobio_services);
var iobio_http_services   = "http://" + (isSelfContainedServer ? self_contained_services : prod_iobio_services);

var geneiobio_server     = iobio_http_services + "geneinfo/";
var geneToPhenoServer    = iobio_http_services + "gene2pheno/";
var hpoServer            = iobio_http_services + "hpo/";
var phenolyzerServer     = "https://7z68tjgpw4.execute-api.us-east-1.amazonaws.com/dev/phenolyzer/"
var phenolyzerOnlyServer = iobio_http_services + "phenolyzer/";

var OFFLINE_PHENOLYZER_CACHE_URL =  "exhibit_cache/";
var OFFLINE_CLINVAR_VCF_URL      = isSelfContainedServer ?  "http://frontend/exhibit_cache/clinvar.vcf.gz" : "https://s3.amazonaws.com/iobio/gene/clinvar/clinvar.vcf.gz";

var EXHIBIT_URL              = 'exhibit.html'
var EXHIBIT_URL1             = 'exhibit-case-complete.html'
var EXHIBIT_URL2             = 'exhibit-cases-complete.html'
