jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

var cacheHelper = new CacheHelper();
cacheHelper.isolateSession();

var genomeBuildHelper = new GenomeBuildHelper();

var dataCard = new DataCard();
dataCard.mode = 'trio';

var geneObjects = {};
var geneToTranscript = {};
var geneToGeneCoverage = {};

xdescribe('geneCoverage', function() {


  var speciesData = [
  {"id":7,"name":"Human","binomialName":"Homo sapiens","latin_name":"homo_sapiens","genomeBuilds":[
    {"id":13,"idSpecies":7,"name":"GRCh37",
      "references":
      [{"id":289,"idGenomeBuild":13,"name":"1","length":249250621,"alias":"chr1","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr1.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr1.fa"},{"id":290,"idGenomeBuild":13,"name":"2","length":243199373,"alias":"chr2","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr2.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr2.fa"},{"id":291,"idGenomeBuild":13,"name":"3","length":198022430,"alias":"chr3","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr3.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr3.fa"},{"id":292,"idGenomeBuild":13,"name":"4","length":191154276,"alias":"chr4","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr4.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr4.fa"},{"id":293,"idGenomeBuild":13,"name":"5","length":180915260,"alias":"chr5","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr5.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr5.fa"},{"id":294,"idGenomeBuild":13,"name":"6","length":171115067,"alias":"chr6","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr6.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr6.fa"},{"id":295,"idGenomeBuild":13,"name":"7","length":159138663,"alias":"chr7","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr7.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr7.fa"},{"id":296,"idGenomeBuild":13,"name":"8","length":146364022,"alias":"chr8","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr8.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr8.fa"},{"id":297,"idGenomeBuild":13,"name":"9","length":141213431,"alias":"chr9","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr9.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr9.fa"},{"id":298,"idGenomeBuild":13,"name":"10","length":135534747,"alias":"chr10","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr10.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr10.fa"},{"id":299,"idGenomeBuild":13,"name":"11","length":135006516,"alias":"chr11","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr11.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr11.fa"},{"id":300,"idGenomeBuild":13,"name":"12","length":133851895,"alias":"chr12","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr12.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr12.fa"},{"id":301,"idGenomeBuild":13,"name":"13","length":115169878,"alias":"chr13","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr13.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr13.fa"},{"id":302,"idGenomeBuild":13,"name":"14","length":107349540,"alias":"chr14","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr14.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr14.fa"},{"id":303,"idGenomeBuild":13,"name":"15","length":102531392,"alias":"chr15","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr15.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr15.fa"},{"id":304,"idGenomeBuild":13,"name":"16","length":90354753,"alias":"chr16","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr16.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr16.fa"},{"id":305,"idGenomeBuild":13,"name":"17","length":81195210,"alias":"chr17","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr17.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr17.fa"},{"id":306,"idGenomeBuild":13,"name":"18","length":78077248,"alias":"chr18","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr18.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr18.fa"},{"id":307,"idGenomeBuild":13,"name":"19","length":59128983,"alias":"chr19","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr19.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr19.fa"},{"id":308,"idGenomeBuild":13,"name":"20","length":63025520,"alias":"chr20","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr20.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr20.fa"},{"id":309,"idGenomeBuild":13,"name":"21","length":48129895,"alias":"chr21","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr21.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr21.fa"},{"id":310,"idGenomeBuild":13,"name":"22","length":51304566,"alias":"chr22","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chr22.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chr22.fa"},{"id":311,"idGenomeBuild":13,"name":"X","length":155270560,"alias":"chrX","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_chrX.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chrX.fa"},{"id":312,"idGenomeBuild":13,"name":"Y","length":59373566,"alias":"chrY","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh37/hs_ref_Y.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg19/chrY.fa"}],
      "resources":[{"id":27,"idGenomeBuild":13,"type":"CLINVAR VCF S3","resource":"http://s3.amazonaws.com/iobio/gene/clinvar/clinvar.GRCh37.vcf.gz"},{"id":28,"idGenomeBuild":13,"type":"CLINVAR VCF OFFLINE","resource":"clinvar.GRCh37.vcf.gz"},{"id":29,"idGenomeBuild":13,"type":"CLINVAR EUTILS BASE POSITION","resource":"Base+Position+for+Assembly+GRCh37"},{"id":30,"idGenomeBuild":13,"type":"ENSEMBL URL","resource":"http://grch37.ensembl.org/Homo_sapiens/"}],
      "aliases":[{"id":30,"idGenomeBuild":13,"type":"","alias":"NCBI37"},{"id":31,"idGenomeBuild":13,"type":"UCSC","alias":"hg19"}]
    },
    {"id":14,"idSpecies":7,"name":"GRCh38",
      "references":[{"id":313,"idGenomeBuild":14,"name":"1","length":248956422,"alias":"chr1","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.1.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr1.fa"},{"id":314,"idGenomeBuild":14,"name":"2","length":242193529,"alias":"chr2","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.2.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr2.fa"},{"id":315,"idGenomeBuild":14,"name":"3","length":198295559,"alias":"chr3","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.3.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr3.fa"},{"id":316,"idGenomeBuild":14,"name":"4","length":190214555,"alias":"chr4","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.4.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr4.fa"},{"id":317,"idGenomeBuild":14,"name":"5","length":181538259,"alias":"chr5","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.5.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr5.fa"},{"id":318,"idGenomeBuild":14,"name":"6","length":170805979,"alias":"chr6","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.6.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr6.fa"},{"id":319,"idGenomeBuild":14,"name":"7","length":159345973,"alias":"chr7","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.7.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr7.fa"},{"id":320,"idGenomeBuild":14,"name":"8","length":145138636,"alias":"chr8","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.8.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr8.fa"},{"id":321,"idGenomeBuild":14,"name":"9","length":138394717,"alias":"chr9","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.9.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr9.fa"},{"id":322,"idGenomeBuild":14,"name":"10","length":133797422,"alias":"chr10","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.10.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr10.fa"},{"id":323,"idGenomeBuild":14,"name":"11","length":135086622,"alias":"chr11","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.11.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr11.fa"},{"id":324,"idGenomeBuild":14,"name":"12","length":133275309,"alias":"chr12","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.12.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr12.fa"},{"id":325,"idGenomeBuild":14,"name":"13","length":114364328,"alias":"chr13","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.13.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr13.fa"},{"id":326,"idGenomeBuild":14,"name":"14","length":107043718,"alias":"chr14","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.14.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr14.fa"},{"id":327,"idGenomeBuild":14,"name":"15","length":101991189,"alias":"chr15","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.15.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr15.fa"},{"id":328,"idGenomeBuild":14,"name":"16","length":90338345,"alias":"chr16","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.16.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr16.fa"},{"id":329,"idGenomeBuild":14,"name":"17","length":83257441,"alias":"chr17","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.17.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr17.fa"},{"id":330,"idGenomeBuild":14,"name":"18","length":80373285,"alias":"chr18","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.18.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr18.fa"},{"id":331,"idGenomeBuild":14,"name":"19","length":58617616,"alias":"chr19","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.19.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr19.fa"},{"id":332,"idGenomeBuild":14,"name":"20","length":64444167,"alias":"chr20","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.20.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr20.fa"},{"id":333,"idGenomeBuild":14,"name":"21","length":46709983,"alias":"chr21","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.21.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr21.fa"},{"id":334,"idGenomeBuild":14,"name":"22","length":50818468,"alias":"chr22","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.22.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chr22.fa"},{"id":335,"idGenomeBuild":14,"name":"X","length":156040895,"alias":"chrX","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.X.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chrX.fa"},{"id":336,"idGenomeBuild":14,"name":"Y","length":57227415,"alias":"chrY","fastaPathEnsembl":"./data/references/homo_sapiens/GRCh38/Homo_sapiens.GRCh38.dna.chromosome.Y.fa","fastaPathUCSC":"./data/references/homo_sapiens/hg38/chrY.fa"}],
      "resources":[{"id":31,"idGenomeBuild":14,"type":"CLINVAR VCF S3","resource":"http://s3.amazonaws.com/iobio/gene/clinvar/clinvar.GRCh38.vcf.gz"},{"id":32,"idGenomeBuild":14,"type":"CLINVAR VCF OFFLINE","resource":"clinvar.GRCh38.vcf.gz"},{"id":33,"idGenomeBuild":14,"type":"CLINVAR EUTILS BASE POSITION","resource":"Base+Position"},{"id":34,"idGenomeBuild":14,"type":"ENSEMBL URL","resource":"http://uswest.ensembl.org/Homo_sapiens/"}],
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

  var vcfUrl = {
    proband: 'http://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz',
    mother:  'http://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz',
    father:  'http://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz'
  }
  var sample = {
    proband: 'NA12878',
    mother:  'NA12891',
    father:  'NA12892'
  }
  var bamUrl = {
    proband: 'http://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam',
    mother:  'http://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam',
    father:  'http://s3.amazonaws.com/iobio/samples/bam/NA12892.exome.bam'
  }



  var roundIt = function(num) {
    return Math.round(num);
  }

  var pileupSummary = {total: 0, min: 999999, max: 0, mean: 0, count: 0};

  var getGeneCoverageForGene = function(geneName, callback) {

      promiseGetCachedGeneModel(geneName).then(function(theGeneObject) {

        var theTranscript = getCanonicalTranscript(theGeneObject);
        geneToTranscript[theGeneObject.gene_name] = theTranscript;
        geneObjects[theGeneObject.gene_name] = theGeneObject;

        promiseGetGeneCoverage(theGeneObject, theTranscript).then(function(geneCoverageAll) {

          var chrom = geneCoverageAll.proband[0].chrom;

          getPileupCoverageForExons(chrom, geneCoverageAll.proband, 0, function() {
            geneToGeneCoverage[theGeneObject.gene_name] = geneCoverageAll;
            if (callback) {
              callback();
            }
          });
        })
      });
  }

  var getPileupCoverageForExons = function(chrom, geneCoverageExons, idx, callback) {

    var exon = geneCoverageExons[idx];

    if (exon.region == 'NA') {
      if (callback) {
        if (pileupSummary.min == 999999) {
          pileupSummary.min = 0;
        }
        pileupSummary.mean = (pileupSummary.count > 0 ? pileupSummary.total/pileupSummary.count : 0);
        exon.mpileup = pileupSummary;
        callback(geneCoverageExons);
      }
    } else {
      getProbandVariantCard().model.bam.getCoverageForRegion(chrom, exon.start, exon.end, [], 5000, false, function(coverageForRegion, coverageForPoints) {
        var total = 0;
        var count = 0;
        var min   = 999999;
        var max   = 0;

        // Zero fill if coverage is empty
        if (coverageForRegion == null || coverageForRegion.length == 0) {
          coverageForRegion = [];
          for (var i = 0; i < exon.end-exon.start; i++) {
            coverageForRegion.push([exon.start+i, 0])
          }
        }
        coverageForRegion.forEach(function(cov) {
          if (cov[0] >= exon.start && cov[0] <= exon.end) {
            total += cov[1];
            pileupSummary.total += cov[1];

            // Keep track of lowest coverage (min)
            if (cov[1] < min) {
              min = cov[1];
            }
            if (cov[1] < pileupSummary.min) {
              pileupSummary.min = cov[1];
            }


            // Keep track of highest coverage (max)
            if (cov[1] > max) {
              max = cov[1];
            }
            if (cov[1] > pileupSummary.max) {
              pileupSummary.max = cov[1];
            }

            count++;
            pileupSummary.count++;

          }
        })
        exon.mpileup = {min: (min == 999999 ? 0 : min), max: max, mean: (count > 0 ? total/count : 0)};



        idx++;
        getPileupCoverageForExons(chrom, geneCoverageExons, idx, callback);
      });
    }


  }

  var evaluateGeneCoverageForGene = function(geneName) {
    var theGeneCoverageAll = geneToGeneCoverage[geneName];
    var theGeneObject = geneObjects[geneName];
    var theTranscript = geneToTranscript[geneName];

    expect(theGeneCoverageAll).not.toBeNull();
    var geneCoverage = theGeneCoverageAll.proband;

    expect(geneCoverage).not.toBeNull();


    var codingRegions = theTranscript.features.filter(function(feature) {
      return feature.feature_type.toUpperCase() == 'CDS';
    })
    expect(Object.keys(geneCoverage).length).toEqual(codingRegions.length + 1);

    geneCoverage.forEach(function(gc) {

      console.log(gc.id + " "
        + (gc.region == 'NA' ? gc.region : (gc.start + "-" + gc.end))
        + "    sd="        + roundIt(gc.sd)
        + "         mean=" + roundIt(gc.mean)
        + " vs. "          + roundIt(gc.mpileup.mean)
        +                    (roundIt(Math.abs(gc.mean - gc.mpileup.mean)) > gc.sd ? "*" : " ")
        + "         min="  + roundIt(gc.min)
        + " vs. "          + roundIt(gc.mpileup.min)
        +                    (roundIt(Math.abs(gc.min - gc.mpileup.min)) > gc.sd ? "*" : " ")
        + "         max="  + roundIt(gc.max)
        + " vs. "          + roundIt(gc.mpileup.max)
        +                    (roundIt(Math.abs(gc.max - gc.mpileup.max)) > gc.sd ? "*" : " "));


    })
  }



  beforeEach(function(done) {

    useSSL = false;

    IOBIO.samtools                = DEV_IOBIO + "samtools/";
    IOBIO.samtoolsOnDemand        = DEV_IOBIO + "od_samtools/";

    genomeBuildHelper = new GenomeBuildHelper();
    genomeBuildHelper.init(speciesData);
    genomeBuildHelper.setCurrentSpecies("Human");
    genomeBuildHelper.setCurrentBuild("GRCh37");


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

  describe('#verifyGeneCoverageAIRE', function() {
    beforeEach(function(done) {

      getGeneCoverageForGene('AIRE', function() {

        done();

      });

    });

    it('Evaluate gene coverage for gene AIRE', function(done) {

      evaluateGeneCoverageForGene('AIRE');
      done();

    });
  });


  describe('#verifyGeneCoveragePDHA1', function() {
    beforeEach(function(done) {

      getGeneCoverageForGene('PDHA1', function() {
        done();
      });

    });

    it('Evaluate gene coverage for gene PDHA1', function(done) {

      evaluateGeneCoverageForGene('PDHA1');
      done();

    });
  });

});