jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;


var cacheHelper = new CacheHelper();
cacheHelper.isolateSession();

var genomeBuildHelper = new GenomeBuildHelper();

var variantCards = [];

var geneObjects = {};
var theTranscript = {transcript_id: 'ENST00000353383.1'};
var theGene = {gene_name: 'RAI1', chr: 'chr17', start: 17584787, end: 17714767, strand: '+', transcripts: [theTranscript] };
geneObjects['RAI1'] = theGene;


describe('iobioVariant', function() {

	
	var model = new VariantModel();
	model.init();
	model.relationship = 'proband';

	var probandVariantCard = new VariantCard();
	probandVariantCard.model = model;
	variantCards.push(probandVariantCard);


	var speciesData = [
	{"id":7,"name":"Human","binomialName":"Homo sapiens","latin_name":"homo_sapiens","genomeBuilds":[
		{"id":13,"idSpecies":7,"name":"GRCh37",
			"references":
			[{"id":289,"idGenomeBuild":13,"name":"1","length":249250621,"alias":"chr1","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr1.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr1.fa"},{"id":290,"idGenomeBuild":13,"name":"2","length":243199373,"alias":"chr2","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr2.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr2.fa"},{"id":291,"idGenomeBuild":13,"name":"3","length":198022430,"alias":"chr3","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr3.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr3.fa"},{"id":292,"idGenomeBuild":13,"name":"4","length":191154276,"alias":"chr4","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr4.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr4.fa"},{"id":293,"idGenomeBuild":13,"name":"5","length":180915260,"alias":"chr5","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr5.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr5.fa"},{"id":294,"idGenomeBuild":13,"name":"6","length":171115067,"alias":"chr6","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr6.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr6.fa"},{"id":295,"idGenomeBuild":13,"name":"7","length":159138663,"alias":"chr7","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr7.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr7.fa"},{"id":296,"idGenomeBuild":13,"name":"8","length":146364022,"alias":"chr8","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr8.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr8.fa"},{"id":297,"idGenomeBuild":13,"name":"9","length":141213431,"alias":"chr9","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr9.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr9.fa"},{"id":298,"idGenomeBuild":13,"name":"10","length":135534747,"alias":"chr10","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr10.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr10.fa"},{"id":299,"idGenomeBuild":13,"name":"11","length":135006516,"alias":"chr11","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr11.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr11.fa"},{"id":300,"idGenomeBuild":13,"name":"12","length":133851895,"alias":"chr12","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr12.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr12.fa"},{"id":301,"idGenomeBuild":13,"name":"13","length":115169878,"alias":"chr13","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr13.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr13.fa"},{"id":302,"idGenomeBuild":13,"name":"14","length":107349540,"alias":"chr14","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr14.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr14.fa"},{"id":303,"idGenomeBuild":13,"name":"15","length":102531392,"alias":"chr15","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr15.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr15.fa"},{"id":304,"idGenomeBuild":13,"name":"16","length":90354753,"alias":"chr16","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr16.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr16.fa"},{"id":305,"idGenomeBuild":13,"name":"17","length":81195210,"alias":"chr17","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr17.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr17.fa"},{"id":306,"idGenomeBuild":13,"name":"18","length":78077248,"alias":"chr18","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr18.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr18.fa"},{"id":307,"idGenomeBuild":13,"name":"19","length":59128983,"alias":"chr19","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr19.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr19.fa"},{"id":308,"idGenomeBuild":13,"name":"20","length":63025520,"alias":"chr20","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr20.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr20.fa"},{"id":309,"idGenomeBuild":13,"name":"21","length":48129895,"alias":"chr21","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr21.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr21.fa"},{"id":310,"idGenomeBuild":13,"name":"22","length":51304566,"alias":"chr22","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr22.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr22.fa"},{"id":311,"idGenomeBuild":13,"name":"X","length":155270560,"alias":"chrX","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chrX.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chrX.fa"},{"id":312,"idGenomeBuild":13,"name":"Y","length":59373566,"alias":"chrY","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_Y.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chrY.fa"}],
			"resources":[{"id":27,"idGenomeBuild":13,"type":"CLINVAR VCF S3","resource":"https://s3.amazonaws.com/iobio/gene/clinvar/clinvar.GRCh37.vcf.gz"},{"id":28,"idGenomeBuild":13,"type":"CLINVAR VCF OFFLINE","resource":"clinvar.GRCh37.vcf.gz"},{"id":29,"idGenomeBuild":13,"type":"CLINVAR EUTILS BASE POSITION","resource":"Base+Position+for+Assembly+GRCh37"},{"id":30,"idGenomeBuild":13,"type":"ENSEMBL URL","resource":"http://grch37.ensembl.org/Homo_sapiens/"}],
			"aliases":[{"id":30,"idGenomeBuild":13,"type":"","alias":"NCBI37"},{"id":31,"idGenomeBuild":13,"type":"UCSC","alias":"hg19"}]
		},
		{"id":14,"idSpecies":7,"name":"GRCh38",
			"references":[{"id":313,"idGenomeBuild":14,"name":"1","length":248956422,"alias":"chr1","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.1.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr1.fa"},{"id":314,"idGenomeBuild":14,"name":"2","length":242193529,"alias":"chr2","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.2.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr2.fa"},{"id":315,"idGenomeBuild":14,"name":"3","length":198295559,"alias":"chr3","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.3.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr3.fa"},{"id":316,"idGenomeBuild":14,"name":"4","length":190214555,"alias":"chr4","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.4.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr4.fa"},{"id":317,"idGenomeBuild":14,"name":"5","length":181538259,"alias":"chr5","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.5.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr5.fa"},{"id":318,"idGenomeBuild":14,"name":"6","length":170805979,"alias":"chr6","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.6.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr6.fa"},{"id":319,"idGenomeBuild":14,"name":"7","length":159345973,"alias":"chr7","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.7.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr7.fa"},{"id":320,"idGenomeBuild":14,"name":"8","length":145138636,"alias":"chr8","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.8.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr8.fa"},{"id":321,"idGenomeBuild":14,"name":"9","length":138394717,"alias":"chr9","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.9.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr9.fa"},{"id":322,"idGenomeBuild":14,"name":"10","length":133797422,"alias":"chr10","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.10.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr10.fa"},{"id":323,"idGenomeBuild":14,"name":"11","length":135086622,"alias":"chr11","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.11.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr11.fa"},{"id":324,"idGenomeBuild":14,"name":"12","length":133275309,"alias":"chr12","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.12.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr12.fa"},{"id":325,"idGenomeBuild":14,"name":"13","length":114364328,"alias":"chr13","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.13.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr13.fa"},{"id":326,"idGenomeBuild":14,"name":"14","length":107043718,"alias":"chr14","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.14.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr14.fa"},{"id":327,"idGenomeBuild":14,"name":"15","length":101991189,"alias":"chr15","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.15.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr15.fa"},{"id":328,"idGenomeBuild":14,"name":"16","length":90338345,"alias":"chr16","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.16.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr16.fa"},{"id":329,"idGenomeBuild":14,"name":"17","length":83257441,"alias":"chr17","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.17.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr17.fa"},{"id":330,"idGenomeBuild":14,"name":"18","length":80373285,"alias":"chr18","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.18.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr18.fa"},{"id":331,"idGenomeBuild":14,"name":"19","length":58617616,"alias":"chr19","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.19.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr19.fa"},{"id":332,"idGenomeBuild":14,"name":"20","length":64444167,"alias":"chr20","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.20.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr20.fa"},{"id":333,"idGenomeBuild":14,"name":"21","length":46709983,"alias":"chr21","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.21.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr21.fa"},{"id":334,"idGenomeBuild":14,"name":"22","length":50818468,"alias":"chr22","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.22.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr22.fa"},{"id":335,"idGenomeBuild":14,"name":"X","length":156040895,"alias":"chrX","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.X.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chrX.fa"},{"id":336,"idGenomeBuild":14,"name":"Y","length":57227415,"alias":"chrY","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.Y.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chrY.fa"}],
			"resources":[{"id":31,"idGenomeBuild":14,"type":"CLINVAR VCF S3","resource":"https://s3.amazonaws.com/iobio/gene/clinvar/clinvar.GRCh38.vcf.gz"},{"id":32,"idGenomeBuild":14,"type":"CLINVAR VCF OFFLINE","resource":"clinvar.GRCh38.vcf.gz"},{"id":33,"idGenomeBuild":14,"type":"CLINVAR EUTILS BASE POSITION","resource":"Base+Position"},{"id":34,"idGenomeBuild":14,"type":"ENSEMBL URL","resource":"http://uswest.ensembl.org/Homo_sapiens/"}],
			"aliases":[{"id":32,"idGenomeBuild":14,"type":"","alias":"NCBI38"},{"id":33,"idGenomeBuild":14,"type":"UCSC","alias":"hg38"},{"id":34,"idGenomeBuild":14,"type":"CLINVAR","alias":"c38"}]
		}
		]
	},
	{"id":8,"name":"Mouse","binomialName":"Mus musculus","latin_name":"mus_musculus","genomeBuilds":[
		{"id":13,"idSpecies":8,"name":"mm10",
			"references":[{name:1, length:1000}, {name:2, length:2000}],
			"resources": [],
			"aliases": []
		}
		]
	}

	];

	var output = "";



	beforeEach(function(done) {
		genomeBuildHelper = new GenomeBuildHelper();
		genomeBuildHelper.init(speciesData);

		variantExporter = new VariantExporter();
	
		getProbandVariantCard().model.onVcfUrlEntered('https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz', function(success, samples) {
	
			getProbandVariantCard().model.setSampleName('NA12878');
			
			getProbandVariantCard().model.onBamUrlEntered('https://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam', function(success) {
				done();
			});
		});
	});

	describe('#getRemoteVariants', function() {
		beforeEach(function(done) {
			getProbandVariantCard().model.promiseGetVariants(theGene, theTranscript, theGene.start, theGene.end).then(function(theVcfData) {
				done();
			})
		});

		it('get variants from vcf url', function(done) {

			expect(variantExporter).not.toBeNull();
			expect(getProbandVariantCard().model).not.toBeNull();
			expect(getProbandVariantCard().model.sampleName).toEqual('NA12878');
			expect(getProbandVariantCard().model.vcfData).not.toBeNull();
			done();
		});
	});
});