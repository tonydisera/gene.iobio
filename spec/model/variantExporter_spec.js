jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;


var cacheHelper = new CacheHelper();
cacheHelper.isolateSession();

var genomeBuildHelper = new GenomeBuildHelper();

var geneObjects = {};
var theTranscript = {transcript_id: 'ENST00000353383.1'};
var theGene = {gene_name: 'RAI1', chr: 'chr17', start: 17584787, end: 17714767, strand: '+', transcripts: [theTranscript] };
geneObjects['RAI1'] = theGene;

var dataCard = new DataCard();
dataCard.mode = 'trio';



describe('variantExporter', function() {


	var bookmarkEntries = [
 	 {importSource: 'gene', isProxy: true, importFormat: 'csv', chrom: '17',start: 17698535	,end: 17698536	,ref: 'G'	,alt: 'A'	,gene: 'RAI1'	,transcript: 'ENST00000353383.1' ,   freebayesCalled: '',     isFavorite: false },
	 {importSource: 'gene', isProxy: true, importFormat: 'csv', chrom: '20',start: 30409363	,end: 30409364	,ref: 'A'	,alt: 'G'	,gene: 'MYLK2'	,transcript: 'ENST00000375994.2' ,   freebayesCalled: 'Y',    isFavorite: false},
	 {importSource: 'gene', isProxy: true, importFormat: 'csv', chrom: '22',start: 39636863	,end: 39636865	,ref: 'GCC'	,alt: 'G'	,gene: 'PDGFB'	,transcript: 'ENST00000331163.6' ,   freebayesCalled: '',     isFavorite: false},	
	 {importSource: 'gene', isProxy: true, importFormat: 'csv', chrom: 'X', start: 19369471	,end: 19369472	,ref: 'G'	,alt: 'T'	,gene: 'PDHA1'	,transcript: 'ENST00000379806.5', 	 freebayesCalled: '', 	  isFavorite: false}		
	];

	var validateRecs = [
		{
			chrom: 'chr17',
			gene: 'RAI1',
			transcript: 'ENST00000353383.1',
			impact: 'HIGH',
			highestImpact: '',
			highestImpactInfo: '',
			consequence: 'stop gained',
			afExAC: '0',
			af1000G: '0',
			inheritance: 'recessive',
			rsId: 'rs527236033',
			clinvarClinSig: 'pathogenic',
			clinvarPhenotype: 'smith-magenis syndrome',
			HGVSc: 'ENST00000353383.1:c.2273G>A',
			HGVSp: 'ENSP00000323074.4:p.Trp758Ter',
			qual: '2880.99',
			zygosityProband: 'HOM',
			altCountProband: '38',
			refCountProband: '1',
			depthProband: '39',
			zygosityMother: 'HET',
			altCountMother: '26',
			refCountMother: '25',
			depthMother: '51',
			zygosityFather: 'HET',
			altCountFather: '30',
			refCountFather: '33',
			depthFather: '63'

		},
		{
			chrom: 'chr20',
			gene: 'MYLK2',
			transcript: 'ENST00000375994.2',
			impact: 'MODERATE',
			highestImpact: '',
			highestImpactInfo: '',
			consequence: 'missense variant',
			afExAC: '3.3e-05',
			af1000G: '0',
			inheritance: 'de novo',
			rsId: 'rs193922712',
			clinvarClinSig: 'likely pathogenic',
			clinvarPhenotype: 'cardiomyopathy',
			HGVSc: 'ENST00000375994.2:c.595A>G',
			HGVSp: 'ENSP00000365162.2:p.Ile199Val',
			qual: '8.46129',
			zygosityProband: 'HET',
			altCountProband: '10',
			refCountProband: '39',
			depthProband: '49',
			zygosityMother: 'HOMREF',
			altCountMother: '0',
			refCountMother: '55',
			depthMother: '55',
			zygosityFather: 'HOMREF',
			altCountFather: '0',
			refCountFather: '45',
			depthFather: '45'

		},
		{
			chrom: 'chr22',
			gene: 'PDGFB',
			transcript: 'ENST00000331163.6',
			type: 'del',
			impact: 'MODIFIER',
			highestImpact: 'HIGH',
			highestImpactInfo: 'high frameshift_variant in ENST00000381551',
			consequence: 'intron variant',
			afExAC: '0',
			af1000G: '0',
			inheritance: 'de novo',
			rsId: '',
			clinvarClinSig: '',
			clinvarPhenotype: '',
			HGVSc: 'ENST00000331163.6:c.63+3041_63+3042delGG',
			HGVSp: '',
			qual: '58.9779',
			zygosityProband: 'HET',
			altCountProband: '10',
			refCountProband: '35',
			depthProband: '45',
			zygosityMother: 'HOMREF',
			altCountMother: '0',
			refCountMother: '46',
			depthMother: '46',
			zygosityFather: 'HOMREF',
			altCountFather: '0',
			refCountFather: '46',
			depthFather: '46'

		},	
		{
			chrom: 'chrX',
			gene: 'PDHA1',
			transcript: 'ENST00000379806.5',
			type: 'snp',
			impact: 'MODERATE',
			highestImpact: '',
			highestImpactInfo: '',
			consequence: 'missense variant',
			afExAC: '0',
			af1000G: '0',
			inheritance: 'de novo',
			rsId: '',
			polyphen: 'probably damaging',
			SIFT: 'deleterious',
			clinvarClinSig: '',
			clinvarPhenotype: '',
			HGVSc: 'ENST00000379806.5:c.478G>T',
			HGVSp: 'ENSP00000369134.5:p.Gly160Cys',
			qual: '407.399',
			zygosityProband: 'HET',
			altCountProband: '27',
			refCountProband: '76',
			depthProband: '103',
			zygosityMother: 'HOMREF',
			altCountMother: '0',
			refCountMother: '13',
			depthMother: '13',
			zygosityFather: 'HOMREF',
			altCountFather: '0',
			refCountFather: '42',
			depthFather: '42'
		}			
	]

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
		genomeBuildHelper = new GenomeBuildHelper();
		genomeBuildHelper.init(speciesData);
		genomeBuildHelper.setCurrentSpecies("Human");
		genomeBuildHelper.setCurrentBuild("GRCh37");


		variantExporter = new VariantExporter();

		if (getVariantCard('proband') == null) {
			var model = new VariantModel();
			model.init();
			model.relationship = 'proband';
			var vc = new VariantCard();
			vc.model = model;
			variantCards.push(vc);			
		}

		if (getVariantCard('mother') == null) {
			var model = new VariantModel();
			model.init();
			model.relationship = 'mother';
			var vc = new VariantCard();
			vc.model = model;
			variantCards.push(vc);			
		}

		if (getVariantCard('father') == null) {
			model = new VariantModel();
			model.init();
			model.relationship = 'father';
			vc = new VariantCard();
			vc.model = model;
			variantCards.push(vc);			
		}

	
		var doneCount = 0;

		variantCards.forEach(function(vc) {
			vc.model.onVcfUrlEntered(vcfUrl[vc.getRelationship()], null, function(success, samples) {
		
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
			expect(output).not.toBeNull();

			var importRecords = VariantImporter.parseRecordsCSV(output);
			expect(importRecords.length).toEqual(4);

			for (var i = 0; i < validateRecs.length; i++) {
				var importRec   = importRecords[i];
				var validateRec = validateRecs[i];
				for(var field in validateRec) {
					expect(importRec[field]).toEqual(validateRec[field]);
				}
			}

			done();
		});
	});

	describe('#exportBookmarkedVariantsVCF', function() {
		beforeEach(function(done) {
			variantExporter.promiseExportVariants(bookmarkEntries, 'vcf', Object.values(sample)).then(function(data) {
				output = data;
				done();
			})
		});

		it('exports bookmarked variants as vcf', function(done) {

			expect(output).not.toBeNull();
			var vcfRecs = [];
			output.split("\n").forEach(function(vcfRec) {
				if (vcfRec.indexOf("#") == 0) {

				} else {
					vcfRecs.push(vcfRec);
				}
			});
			expect(vcfRecs.length).toEqual(4);

			// Make sure that the vcf records imported match the
			// import records for chrom, start, ref, and alt
			var recs = [];
			vcfRecs.forEach(function(vcfRec) {
				var fields = vcfRec.split("\t");
				var rec = {};
				rec.chrom = fields[0];
				rec.start = fields[1];
				rec.ref = fields[3];
				rec.alt = fields[4];
				recs.push(rec);
			})
			for (var i = 0; i < recs.length; i++) {
				var rec     = recs[i];
				var importRec = bookmarkEntries[i];
				expect(rec.chrom).toEqual(importRec.chrom);
				expect(+rec.start).toEqual(importRec.start);
				expect(rec.ref).toEqual(importRec.ref);
				expect(rec.alt).toEqual(importRec.alt);
			}

			// Make sure that the IOBIO INFO field matches the expected export values
			var infoRecs = [];
			vcfRecs.forEach(function(vcfRec) {
				var info = {};
				vcfRec.split("\t")[7].split("IOBIO=")[1].split("|").forEach(function(tagValue) {
					var tokens = tagValue.split("#");
					var tag    = tokens[0];
					var value  = tokens[1];
					info[tag]  = value;
				})
				infoRecs.push(info);
			})
			for (var i = 0; i < infoRecs.length; i++) {
				var infoRec     = infoRecs[i];
				var validateRec = validateRecs[i];
				for(var field in infoRec) {
					infoRec[field] = infoRec[field] == null ? '' : infoRec[field];
					// Interpret blank as '.'
					if (validateRec[field] == '') {
						validateRec[field] = '.';
					}
					if (validateRec.hasOwnProperty(field)) {
						expect(infoRec[field].trim()).toEqual(validateRec[field]);
					}
				}
			}

			done();
		});
	});
});