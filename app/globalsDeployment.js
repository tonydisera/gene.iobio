/*  These global variables determine which iobio servers the gene.iobio app with interact
    with for a local deployment.  This entire .js can be replaced or modified to suit the 
    specific iobio deployment environment.
*/
var isOffline         = false;          // is there any internet connect to outside services and resources?
var isClinvarOffline  = true;           // is clinvar offline?  (Pull from clinvar hosted from URL?)
var useDevkit         = true;           // point to new minion services and use new iobio.js devkit?
var serverInstance    = "@hostname@/";  // this will be replace with the name of the server used for this deployement
var serverCacheDir    = "local_cache/"; // this is the directory from the server instance where resource files (like clinvar vcf) will be served
var useOnDemand       = true;           // use on demand tabix and samtools
var serverDataDir     = "local_cache/"; // this is the directory from the server instance where data files will be served
var offlineUrlTag     = "arup:"         // this is the first part of the "file path" that will flag that this should be converted into a local server instance URL