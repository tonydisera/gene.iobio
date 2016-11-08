describe('genomeBuildHelper', function() {

	var genomeBuildHelper = new GenomeBuildHelper();

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


	beforeEach(function() {
		genomeBuildHelper = new GenomeBuildHelper();
		genomeBuildHelper.init(speciesData);
	});

	describe('#setCurrentGenomeBuild', function() {
		it('sets the current genome build', function() {
			genomeBuildHelper.setCurrentSpecies("Human");
			genomeBuildHelper.setCurrentBuild("GRCh37");
			expect(genomeBuildHelper.getCurrentBuildName()).toEqual("GRCh37");
			expect(genomeBuildHelper.getCurrentSpeciesName()).toEqual("Human");
			expect(genomeBuildHelper.getCurrentSpeciesLatinName()).toEqual("homo_sapiens");

			genomeBuildHelper.setCurrentSpecies("Mouse");
			genomeBuildHelper.setCurrentBuild("mm10");
			expect(genomeBuildHelper.getCurrentBuildName()).toEqual("mm10");
			expect(genomeBuildHelper.getCurrentSpeciesName()).toEqual("Mouse");
			expect(genomeBuildHelper.getCurrentSpeciesLatinName()).toEqual("mus_musculus");

		});
	});

	describe('#getFastaPath', function() {
		it('get the fasta path for a reference on a genome build', function() {
			genomeBuildHelper.setCurrentSpecies("Human");
			genomeBuildHelper.setCurrentBuild("GRCh37");
			expect(genomeBuildHelper.getFastaPath("1")).toEqual("./data/references/homo_sapiens/GRCh37/hs_ref_chr1.fa");
			expect(genomeBuildHelper.getFastaPath("chr1")).toEqual("./data/references/homo_sapiens/hg19/chr1.fa");
		});
	});

	describe('#getBuildAlias', function() {
		it('get the UCSC alias of a genome build', function() {
			genomeBuildHelper.setCurrentSpecies("Human");
			genomeBuildHelper.setCurrentBuild("GRCh37");
			expect(genomeBuildHelper.getBuildAlias(genomeBuildHelper.ALIAS_UCSC)).toEqual('hg19');
			genomeBuildHelper.setCurrentSpecies("Human");
			genomeBuildHelper.setCurrentBuild("GRCh38");
			expect(genomeBuildHelper.getBuildAlias(genomeBuildHelper.ALIAS_UCSC)).toEqual('hg38');
		});
	});

	describe('#getBuildResource', function() {
		it('get the clinvar resource of a genome build', function() {
			genomeBuildHelper.setCurrentSpecies("Human");
			genomeBuildHelper.setCurrentBuild("GRCh37");
			expect(genomeBuildHelper.getBuildResource(genomeBuildHelper.RESOURCE_ENSEMBL_URL)).toEqual('http://grch37.ensembl.org/Homo_sapiens/');
			genomeBuildHelper.setCurrentSpecies("Human");
			genomeBuildHelper.setCurrentBuild("GRCh38");
			expect(genomeBuildHelper.getBuildResource(genomeBuildHelper.RESOURCE_ENSEMBL_URL)).toEqual('http://uswest.ensembl.org/Homo_sapiens/');
		});
	});

	describe('#getProperSpeciesAndBuild', function() {
		it('get the matching species and build for build info', function() {
			var speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: 'Human', build: 'hg19'});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build.name).toEqual('GRCh37');
			
			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: 'Human', build: 'NCBI37'});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build.name).toEqual('GRCh37');

			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: 'homo_sapiens', build: 'GRCh37'});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build.name).toEqual('GRCh37');
			
			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: 'Human', build: 'hg38'});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build.name).toEqual('GRCh38');

			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: 'Human', build: 'xx'});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build).toBeNull();
		});
	});

	describe('#getProperSpeciesAndBuildForReferences', function() {
		it('get the matching species and build for build info containing only reference lengths', function() {
			var speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: null, build: null, references: {1:249250621}});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build.name).toEqual('GRCh37');

			// Make sure it works when reference name starts with chr
			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: null, build: null, references: {'chr1':249250621}});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build.name).toEqual('GRCh37');

			// Make sure it works when reference length off by 1
			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: null, build: null, references: {'chr1':249250620}});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build.name).toEqual('GRCh37');

			// When a wrong reference length is supplied, the build is not found
			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: null, build: null, references: {1:249250621, 2: 20}});
			expect(speciesBuild.species.name).toEqual('Human');
			expect(speciesBuild.build).toBeNull();

			// Make sure it works when all reference lengths provided 
			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild({species: 'Mouse', build: null, references: {1:1000, 2: 2000}});
			expect(speciesBuild.species.name).toEqual('Mouse');
			expect(speciesBuild.build.name).toEqual('mm10');
		});
	});

	describe('#parseBuildInfo', function() {
		it('show all species/builds found from build infos', function() {
			var theBuilds = [];
			genomeBuildHelper.parseBuildInfo({species:'Human', build: 'NCBI37'}, 'proband', 'bam', theBuilds);
			expect(theBuilds.length).toEqual(1);
			expect(theBuilds[0].species.name).toEqual('Human');
			expect(theBuilds[0].build.name).toEqual('GRCh37');
			expect(theBuilds[0].from.length).toEqual(1);
			expect(theBuilds[0].from[0].relationship).toEqual('proband');
			expect(theBuilds[0].from[0].type).toEqual('bam');


			// Now add another build.  Now theBuilds should have two elements for the different builds
			genomeBuildHelper.parseBuildInfo({species:'Human', build: 'hg38'}, 'mother', 'bam', theBuilds);
			expect(theBuilds.length).toEqual(2);
			expect(theBuilds[0].species.name).toEqual('Human');
			expect(theBuilds[0].build.name).toEqual('GRCh37');
			expect(theBuilds[1].species.name).toEqual('Human');
			expect(theBuilds[1].build.name).toEqual('GRCh38');
			expect(theBuilds[1].from.length).toEqual(1);
			expect(theBuilds[1].from[0].relationship).toEqual('mother');
			expect(theBuilds[1].from[0].type).toEqual('bam');

			// Now we match to a build we have already encountered.  theBuilds will still have
			// 2 elements, but the from field on the first element will contain 2 entries
			genomeBuildHelper.parseBuildInfo({species:'Human', build: 'hg19'}, 'father', 'vcf', theBuilds);
			expect(theBuilds.length).toEqual(2);
			expect(theBuilds[0].species.name).toEqual('Human');
			expect(theBuilds[0].build.name).toEqual('GRCh37');
			expect(theBuilds[0].from.length).toEqual(2);
			expect(theBuilds[0].from[0].relationship).toEqual('proband');
			expect(theBuilds[0].from[0].type).toEqual('bam');
			expect(theBuilds[0].from[1].relationship).toEqual('father');
			expect(theBuilds[0].from[1].type).toEqual('vcf');

		});
	});

	describe('#getBuildFromVcfHeader', function() {
		it('get the build info from the vcf header', function() {
			var vcfHeader = "##contig=<ID=1,length=249250621>\n##contig=<ID=chr2,length=243199373>";
			var buildInfo = genomeBuildHelper.getBuildFromVcfHeader(vcfHeader);
			expect(Object.keys(buildInfo.references).length).toEqual(2);
			expect(buildInfo.references["1"]).toEqual("249250621");
			expect(buildInfo.references["chr2"]).toEqual("243199373");
			var speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild(buildInfo);
			expect(speciesBuild.species.name).toEqual("Human");
			expect(speciesBuild.build.name).toEqual("GRCh37");


			vcfHeader = "##contig=<ID=1,species=Human,assembly=NCBI38>";
			buildInfo = genomeBuildHelper.getBuildFromVcfHeader(vcfHeader);
			expect(Object.keys(buildInfo.references).length).toEqual(0);
			expect(buildInfo.species).toEqual('Human');
			expect(buildInfo.build).toEqual('NCBI38');
			speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild(buildInfo);
			expect(speciesBuild.species.name).toEqual("Human");
			expect(speciesBuild.build.name).toEqual("GRCh38");

		});
	});

	describe('#getBuildFromBamHeader', function() {

		it('get the build info from the bam header', function() {
			var bamHeader = "@HD	VN:1.3	SO:coordinate\n"
							+ "@SQ	SN:1	LN:249250621\n"
							+ "@SQ	SN:2	LN:243199373\n"
							+ "@SQ	SN:3	LN:198022430\n"
							+ "@SQ	SN:4	LN:191154276\n"
							+ "@SQ	SN:5	LN:180915260\n"
							+ "@SQ	SN:6	LN:171115067\n"
							+ "@SQ	SN:X	LN:155270560\n"
							+ "@SQ	SN:Y	LN:59373566";
			var buildInfo = genomeBuildHelper.getBuildFromBamHeader(bamHeader);
			expect(Object.keys(buildInfo.references).length).toEqual(8);
			expect(buildInfo.references["1"]).toEqual(249250622);
			expect(buildInfo.references["Y"]).toEqual(59373567);
			var speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild(buildInfo);
			expect(speciesBuild.species.name).toEqual("Human");
			expect(speciesBuild.build.name).toEqual("GRCh37");

			var bamHeader = "@HD	VN:1.3	SO:coordinate\n"
							+ "@SQ	SN:1	LN:248956422	SP:Human	AS:NCBI38\n"
							+ "@SQ	SN:2	LN:242193529	SP:Human	AS:NCBI38";
			var buildInfo = genomeBuildHelper.getBuildFromBamHeader(bamHeader);
			expect(Object.keys(buildInfo.references).length).toEqual(2);
			expect(buildInfo.references["1"]).toEqual(248956423);
			expect(buildInfo.references["2"]).toEqual(242193530);
			var speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild(buildInfo);
			expect(speciesBuild.species.name).toEqual("Human");
			expect(speciesBuild.build.name).toEqual("GRCh38");


			var bamHeader = "@HD	VN:1.3	SO:coordinate\n"
							+ "@SQ	SN:1	AS:NCBI38\n"
							+ "@SQ	SN:2	AS:NCBI38";
			var buildInfo = genomeBuildHelper.getBuildFromBamHeader(bamHeader);
			var speciesBuild = genomeBuildHelper.getProperSpeciesAndBuild(buildInfo);
			expect(speciesBuild.species.name).toEqual("Human");
			expect(speciesBuild.build.name).toEqual("GRCh38");


		})
	});

	describe('#getBuildsInHeaders', function() {

		it('get the build infos from the headers of vcf and bams', function() {
			var bamHeader = "@HD	VN:1.3	SO:coordinate\n"
							+ "@SQ	SN:1	LN:249250621\n"
							+ "@SQ	SN:2	LN:243199373\n"
							+ "@SQ	SN:3	LN:198022430\n"
							+ "@SQ	SN:4	LN:191154276\n"
							+ "@SQ	SN:5	LN:180915260\n"
							+ "@SQ	SN:6	LN:171115067\n"
							+ "@SQ	SN:X	LN:155270560\n"
							+ "@SQ	SN:Y	LN:59373566";

			var vcfHeader = "##contig=<ID=1,length=249250621>\n##contig=<ID=chr2,length=243199373>";

			var speciesBuilds = genomeBuildHelper.getBuildsInHeaders({proband: bamHeader}, {mother: vcfHeader});
			expect(speciesBuilds.length).toEqual(1);
			expect(speciesBuilds[0].species.name).toEqual('Human');
			expect(speciesBuilds[0].build.name).toEqual('GRCh37');
			expect(speciesBuilds[0].from.length).toEqual(2);
			expect(speciesBuilds[0].from[0].relationship).toEqual('proband');
			expect(speciesBuilds[0].from[0].type).toEqual('bam');
			expect(speciesBuilds[0].from[1].relationship).toEqual('mother');
			expect(speciesBuilds[0].from[1].type).toEqual('vcf');


			var bamHeaderMother = "@HD	VN:1.3	SO:coordinate\n"
						    	+ "@SQ	SN:1	AS:NCBI38\n"
						    	+ "@SQ	SN:2	AS:NCBI38";
			speciesBuilds = genomeBuildHelper.getBuildsInHeaders({proband: bamHeader, mother: bamHeaderMother}, {mother: vcfHeader});
			expect(speciesBuilds.length).toEqual(2);
			expect(speciesBuilds[0].species.name).toEqual('Human');
			expect(speciesBuilds[0].build.name).toEqual('GRCh37');
			expect(speciesBuilds[0].from.length).toEqual(2);
			expect(speciesBuilds[0].from[0].relationship).toEqual('proband');
			expect(speciesBuilds[0].from[0].type).toEqual('bam');
			expect(speciesBuilds[0].from[1].relationship).toEqual('mother');
			expect(speciesBuilds[0].from[1].type).toEqual('vcf');

			expect(speciesBuilds[1].species.name).toEqual('Human');
			expect(speciesBuilds[1].build.name).toEqual('GRCh38');
			expect(speciesBuilds[1].from.length).toEqual(1);
			expect(speciesBuilds[1].from[0].relationship).toEqual('mother');
			expect(speciesBuilds[1].from[0].type).toEqual('bam');

		});
	});

});