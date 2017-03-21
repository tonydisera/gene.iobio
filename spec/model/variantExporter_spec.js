jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;


var cacheHelper = new CacheHelper();
cacheHelper.isolateSession();

var genomeBuildHelper = new GenomeBuildHelper();

var geneObjects = {};
var theTranscript = {transcript_id: 'ENST00000353383.1'};
var theGene = {gene_name: 'RAI1', chr: 'chr17', start: 17584787, end: 17714767, strand: '+', transcripts: [theTranscript] };
geneObjects['RAI1'] = theGene;



describe('variantExporter', function() {

	var variantExporter = new VariantExporter();
	


	var bookmarkEntries = [
 	 {importSource: 'gene', isProxy: true, importFormat: 'csv', chrom: '17',start: 17698535	,end: 17698536	,ref: 'G'	,alt: 'A'	,gene: 'RAI1'	,transcript: 'ENST00000353383.1' ,   freebayesCalled: '',     isFavorite: false },
	 {importSource: 'gene', isProxy: true, importFormat: 'csv', chrom: '20',start: 30409363	,end: 30409364	,ref: 'A'	,alt: 'G'	,gene: 'MYLK2'	,transcript: 'ENST00000375994.2' ,   freebayesCalled: 'Y',    isFavorite: false},
	 {importSource: 'gene', isProxy: true, importFormat: 'csv', chrom: '22',start: 39636863	,end: 39636865	,ref: 'GCC'	,alt: 'G'	,gene: 'PDGFB'	,transcript: 'ENST00000331163.6' ,   freebayesCalled: '',     isFavorite: false},	
	 {importSource: 'gene', isProxy: true, importFormat: 'csv', chrom: 'X', start: 19369471	,end: 19369472	,ref: 'G'	,alt: 'T'	,gene: 'PDHA1'	,transcript: 'ENST00000379806.5', 	 freebayesCalled: '', 	  isFavorite: false}		
	];


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

	var vcfUrl = {
		proband: 'https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz',
		mother:  'https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz',
		father:  'https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz'
	}
	var sample = {
		proband: 'NA12878',
		mother:  'NA12891',
		father:  'NA12892'
	}
	var bamUrl = {
		proband: 'https://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam',
		mother:  'https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam',
		father:  'https://s3.amazonaws.com/iobio/samples/bam/NA12892.exome.bam'
	}



	beforeEach(function(done) {



		var model = new VariantModel();
		model.init();
		model.relationship = 'mother';
		var vc = new VariantCard();
		vc.model = model;
		variantCards.push(vc);

		model = new VariantModel();
		model.init();
		model.relationship = 'father';
		vc = new VariantCard();
		vc.model = model;
		variantCards.push(vc);

		genomeBuildHelper = new GenomeBuildHelper();
		genomeBuildHelper.init(speciesData);

		variantExporter = new VariantExporter();

		var doneCount = 0;

		variantCards.forEach(function(vc) {
			vc.model.onVcfUrlEntered(vcfUrl[vc.getRelationship()], function(success, samples) {
		
				vc.model.setSampleName(sample[vc.getRelationship()]);
				
				vc.model.onBamUrlEntered(bamUrl[vc.getRelationship()], function(success) {
					doneCount++;
					if (doneCount == variantCards.length) {
						done();
					}
				});
			});
		});
	});

	describe('#exportBookmarkedVariantsCSV', function() {
		beforeEach(function(done) {
			variantExporter.promiseExportVariants(bookmarkEntries, 'csv', Object.values(sample)).then(function(data) {
				output = data;
				done();
			})
		});

		it('exports bookmarked variants as csv', function(done) {

			expect(variantExporter).not.toBeNull();
			expect(getProbandVariantCard().model).not.toBeNull();
			expect(getProbandVariantCard().model.sampleName).toEqual('NA12878');

			expect(output).not.toBeNull();

			var importRecords = VariantImporter.parseRecordsCSV(output);
			expect(importRecords.length).toEqual(4);


			expect(importRecords[0].chrom).toEqual('chr17');
			expect(importRecords[0].impact).toEqual('HIGH');
			expect(importRecords[0].consequence).toEqual('stop gained');
			expect(importRecords[0].afExAC).toEqual('0');
			expect(importRecords[0].af1000G).toEqual('0');
			expect(importRecords[0].inheritance).toEqual('recessive');
			expect(importRecords[0].rsId).toEqual('rs527236033');
			expect(importRecords[0].clinvarClinSig).toEqual('pathogenic');
			expect(importRecords[0].clinvarPhenotype).toEqual('smith-magenis syndrome');
			expect(importRecords[0].HGVSc).toEqual('ENST00000353383.1:c.2273G>A');
			expect(importRecords[0].HGVSp).toEqual('ENSP00000323074.4:p.Trp758Ter');
			expect(importRecords[0].qual).toEqual('2880.99');
			expect(importRecords[0].zygosityProband).toEqual('HOM');
			expect(importRecords[0].altCountProband).toEqual('38');
			expect(importRecords[0].refCountProband).toEqual('1');
			expect(importRecords[0].depthProband).toEqual('39');
			//expect(importRecords[0].bamDepthProband).toEqual('38');
			expect(importRecords[0].zygosityMother).toEqual('HET');
			expect(importRecords[0].altCountMother).toEqual('26');
			expect(importRecords[0].refCountMother).toEqual('25');
			expect(importRecords[0].depthMother).toEqual('51');
			expect(importRecords[0].zygosityFather).toEqual('HET');
			expect(importRecords[0].altCountFather).toEqual('30');
			expect(importRecords[0].refCountFather).toEqual('33');
			expect(importRecords[0].depthFather).toEqual('63');


			expect(importRecords[1].chrom == 'chr20');
			expect(importRecords[1].impact).toEqual('MODERATE');
			expect(importRecords[1].consequence).toEqual('missense variant');
			expect(importRecords[1].afExAC).toEqual('3.3e-05');
			expect(importRecords[1].af1000G).toEqual('0');
			//expect(importRecords[1].inheritance).toEqual('de novo');
			expect(importRecords[1].polyphen).toEqual('benign');
			expect(importRecords[1].SIFT).toEqual('tolerated');
			expect(importRecords[1].rsId).toEqual('rs193922712');
			expect(importRecords[1].clinvarClinSig).toEqual('likely pathogenic');
			expect(importRecords[1].clinvarPhenotype).toEqual('cardiomyopathy');
			expect(importRecords[1].HGVSc).toEqual('ENST00000375994.2:c.595A>G');
			expect(importRecords[1].HGVSp).toEqual('ENSP00000365162.2:p.Ile199Val');
			/*
			expect(importRecords[1].qual).toEqual('8.46129');
			expect(importRecords[1].zygosityProband).toEqual('HET');
			expect(importRecords[1].altCountProband).toEqual('10');
			expect(importRecords[1].refCountProband).toEqual('29');
			expect(importRecords[1].depthProband).toEqual('49');
			expect(importRecords[1].zygosityMother).toEqual('HOMREF');
			expect(importRecords[1].altCountMother).toEqual('0');
			expect(importRecords[1].refCountMother).toEqual('55');
			expect(importRecords[1].depthMother).toEqual('55');
			expect(importRecords[1].zygosityFather).toEqual('HOMREF');
			expect(importRecords[1].altCountFather).toEqual('0');
			expect(importRecords[1].refCountFather).toEqual('0');
			expect(importRecords[1].depthFather).toEqual('45');
			*/


			expect(importRecords[2].chrom == 'chr22');
			expect(importRecords[3].chrom == 'chrX');



			done();
		});
	});
});