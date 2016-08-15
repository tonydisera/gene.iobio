/*  These global variables determine which iobio servers the gene.iobio app with interact
    with for a local deployment.  This entire .js can be replaced or modified to suit the 
    specific iobio deployment environment.
*/
var isOffline             = false;          // is there any internet connect to outside services and resources?
var isClinvarOffline      = false;          // is clinvar offline?  (Pull from clinvar hosted from URL?)
var accessNCBIGeneSummary = true;           // is it okay to access NCBI web resources to obtain the refseq gene summary?  In cases where the server and client are COMPLETELY offline, set this to false.

var useDevkit             = true;           // point to new minion services and use new iobio.js devkit?
var useOnDemand           = true;           // use on demand tabix and samtools

var serverInstance        = "@hostname@/";  // this will be replace with the name of the server used for this deployement
var serverCacheDir        = "local_cache/"; // this is the directory from the server instance where resource files (like clinvar vcf) will be served
var serverDataDir         = "local_cache/"; // this is the directory from the server instance where data files will be served
var offlineUrlTag         = "arup:"         // this is the first part if the vcf/bam URL that indicates that a special URL should be constructed to get to files served from the local isntance

var siteGeneSource        = "refseq";       // what should the gene source default to: refseq or gencode?
var DEFAULT_BATCH_SIZE    = 5;              // how many genes can be analyzed simultaneously for 'Analyze all'



