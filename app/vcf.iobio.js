//
//  vcfiobio
//  Tony Di Sera
//  October 2014
//
//  This is a data manager class for the variant summary data.
// 
//  Two file are used to generate the variant data: 
//    1. the bgzipped vcf (.vcf.gz) 
//    2. its corresponding tabix file (.vcf.gz.tbi).  
//
//  The variant summary data come in 3 main fforms:  
//    1. reference names and lengths 
//    2. variant density (point data), 
//    3. vcf stats (variant types, tstv ration allele frequency, mutation spectrum,
//       insertion/deletion distribution, and qc distribution).  
//  The reference names and lengths as well as the variant density data obtained from 
//  the tabix file; the vcf stats are determined by parsing the vcf file in sampled regions.
//
//  The files can be hosted remotely, specified by a URL, or reside on the client, accesssed as a local
//  file on the file system. When the files are on a remote server, vcfiobio communicates with iobio services 
//  to obtain the metrics data.  When the files are accessed locally, a client-side javascript library
//  is used to a) read the tabix file to obtain the reference names/lengths and the variant density data 
//  and b) parse the vcf records from sampled regions.  This mini vcf file is then streamed to iobio services
//  to obtain the vcf metrics.  
//  
//  The follow example code illustrates the method calls to make
//  when the vcf file is served remotely (a URL is entered)
//
//  var vcfiobio = vcfiobio();
//  vcfiobio.loadRemoteIndex(vcfUrl, function(data) {
//     // Filter out the short (<1% median reference length) references
//     vcfiobio.getReferenceData(.01, 100);
//     // Show all the references (example: in a pie chart) here....
//     // Render the variant density data here....
//  });
//  vcfiobio.getEstimatedDensity(refName);
//  vcfiobio.getStats(refs, options, function(data) {
//     // Render the vcf stats here....
//  });
//  
//
//  When the vcf file resides on the local file system, call
//  openVcfFile() and then call loadIndex() instead
//  of loadRemoteIndex().
//
//  var vcfiobio = vcfiobio();
//  vcfiobio.openVcfFile( event, function(vcfFile) {
//    vcfiobio.loadIndex( function(data) {
//     .... same as above ......
//    });
//  });
//  ...  same as above
//
//
vcfiobio = function module() {

  var debug =  false;

  var exports = {};

  var dispatch = d3.dispatch( 'dataReady', 'dataLoading');

  var SOURCE_TYPE_URL = "URL";
  var SOURCE_TYPE_FILE = "file";
  var sourceType = "url";

  //var vcfstatsAliveServer    = "ws://localhost:7070";
  //var tabixServer            = "ws://localhost:7090";
  //var vcfReadDeptherServer   = "ws://localhost:7062";
  var emailServer            = "ws://localhost:7068";
  var catInputServer         = "ws://localhost:7063";
  //var snpEffServer           = "ws://localhost:8040";
  //var clinvarServer          = "ws://localhost:8040";
  //var annotServer              = "ws://localhost:7077";
  //var vepServer               = "ws://localhost:7078";
  var vepServer               = "ws://nv-dev.iobio.io/vep/";

/*
  var vcfstatsAliveServer    = "wss://vcfstatsalive.iobio.io";
  var tabixServer            = "wss://tabix.iobio.io";
  var vcfReadDeptherServer   = "wss://vcfdepther.iobio.io";
  var snpEffServer           = "wss://snpeff.iobio.io";
  var snpSiftServer          = "wss://snpsift.iobio.io";
  var vtServer               = "wss://vt.iobio.io";
  var clinvarServer          = "wss://clinvar.iobio.io";
  var afServer               = "wss://af.iobio.io";
  var contigAppenderServer   = "wss://ctgapndr.iobio.io";
*/



  //var contigAppenderServer   = "ws://ctgapndr.iobio.io";
  
  var clinvarIterCount       = 0;
  var vcfstatsAliveServer    = "wss://nv-green.iobio.io/vcfstatsalive";
  var tabixServer            = "wss://nv-green.iobio.io/tabix";
  var vcfReadDeptherServer   = "wss://nv-green.iobio.io/vcfdepther";
  var snpEffServer           = "wss://nv-green.iobio.io/snpeff";
  var snpSiftServer          = "wss://nv-green.iobio.io/snpsift";
  var vtServer               = "wss://nv-green.iobio.io/vt";
  var clinvarServer          = "wss://nv-green.iobio.io/clinvar";
  var afServer               = "wss://nv-green.iobio.io/af";
  //var vepServer              = "wss://nv-green.iobio.io/vep";
  var contigAppenderServer   = "wss://nv-green.iobio.io/ctgapndr";

  var vcfURL;
  var vcfReader;
  var vcfFile;
  var tabixFile;
  var size16kb = Math.pow(2, 14);
  var refData = [];
  var refDensity = [];
  var refName = "";

  var regions = [];
  var regionIndex = 0;
  var stream = null;

// NEW 
var effectCategories = [
['coding_sequence_variant', 'coding'],
['chromosome' ,'chromosome'],
['inframe_insertion'  ,'indel'],
['disruptive_inframe_insertion' ,'indel'],
['inframe_deletion' ,'indel'],
['disruptive_inframe_deletion'  ,'indel'],
['downstream_gene_variant'  ,'other'],
['exon_variant' ,'other'],
['exon_loss_variant'  ,'exon_loss'],
['frameshift_variant' ,'frameshift'],
['gene_variant' ,'other'],
['intergenic_region'  ,'other'],
['conserved_intergenic_variant' ,'other'],
['intragenic_variant' ,'other'],
['intron_variant' ,'other'],
['conserved_intron_variant' ,'other'],
['miRNA','other'],
['missense_variant' ,'missense'],
['initiator_codon_variant'  ,'missense'],
['stop_retained_variant'  ,'missense'],
['rare_amino_acid_variant'  ,'rare_amino_acid'],
['splice_acceptor_variant'  ,'splice_acceptor'],
['splice_donor_variant' ,'splice_donor'],
['splice_region_variant'  ,'splice_region'],
['stop_lost'  ,'stop_lost'],
['5_prime_UTR_premature start_codon_gain_variant' ,'utr'],
['start_lost' ,'start_lost'],
['stop_gained'  ,'stop_gained'],
['synonymous_variant' ,'synonymous'],
['start_retained' ,'synonymous'],
['stop_retained_variant'  ,'synonymous'],
['transcript_variant' ,'other'],
['regulatory_region_variant'  ,'regulatory'],
['upstream_gene_variant'  ,'other'],
['3_prime_UTR_variant'  ,'utr'],
['3_prime_UTR_truncation +','utr'],
['5_prime_UTR_variant'  ,'utr'],
['5_prime_UTR_truncation +','utr']
]; 

  exports.isFile = function() {
    return sourceType != null && sourceType == SOURCE_TYPE_FILE;
  }

  exports.hasFileOrUrl = function() {
    return vcfURL != null || vcfFile !=null;
  }
  exports.openVcfUrl = function(url) {
    sourceType = SOURCE_TYPE_URL;
    vcfURL = url;
    vcfFile = null;
    tabixFile = null;
  }

  exports.openVcfFile = function(event, callback) {
    sourceType = SOURCE_TYPE_FILE;
    vcfURL = null;
                
    if (event.target.files.length != 2) {
       alert('must select 2 files, both a .vcf.gz and .vcf.gz.tbi file');
       return;
    }

    if (endsWith(event.target.files[0].name, ".vcf") ||
        endsWith(event.target.files[1].name, ".vcf")) {
      showFileFormatMessage();
      return;
    }

    var fileType0 = /([^.]*)\.(vcf\.gz(\.tbi)?)$/.exec(event.target.files[0].name);
    var fileType1 = /([^.]*)\.(vcf\.gz(\.tbi)?)$/.exec(event.target.files[1].name);

    if (fileType0 == null || fileType0.length < 3 || fileType1 == 0 || fileType1.length <  3) {
      alert('You must select BOTH  a compressed vcf file (.vcf.gz) and an index (.tbi)  file');
      return;
    }

    fileExt0 = fileType0[2];
    fileExt1 = fileType1[2];

    if (fileExt0 == 'vcf.gz' && fileExt1 == 'vcf.gz.tbi') {
      vcfFile   = event.target.files[0];
      tabixFile = event.target.files[1];
    } else if (fileExt1 == 'vcf.gz' && fileExt0 == 'vcf.gz.tbi') {
      vcfFile   = event.target.files[1];
      tabixFile = event.target.files[0];
    } else {

      showFileFormatMessage();
    }

    callback(vcfFile);

  } 

  function showFileFormatMessage() {
    alertify.set(
      { 
        labels: {
          cancel     : "Show me how",
          ok         : "OK",
        },  
        buttonFocus:  "cancel"
    });

    alertify.confirm("You must select a compressed vcf file and its corresponding index file in order to run this app. ", 
        function (e) {
        if (e) {
            return;
        } else {
            window.location = 'help.html';
        }
     });
  }
  
  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  // New
  exports.getReferenceNames = function(callback) {
      vcfReader = new readBinaryVCF(tabixFile, vcfFile, function(tbiR) {
        var tbiIdx = tbiR;
        
        var refNames = [];
        refNames.length = 0;

        for (var i = 0; i < tbiIdx.idxContent.head.n_ref; i++) {
          var ref   = tbiIdx.idxContent.head.names[i];
          refNames.push(ref);
        }
        callback(refNames);
      });
  }

  exports.loadIndex = function(callback) {
 
    vcfReader = new readBinaryVCF(tabixFile, vcfFile, function(tbiR) {
      var tbiIdx = tbiR;
      refDensity.length = 0;

      for (var i = 0; i < tbiIdx.idxContent.head.n_ref; i++) {
        var ref   = tbiIdx.idxContent.head.names[i];

        var indexseq = tbiIdx.idxContent.indexseq[i];
        var refLength = indexseq.n_intv * size16kb;

        // Use the linear index to load the estimated density data
        var intervalPoints = [];
        for (var x = 0; x < indexseq.n_intv; x++) {
          var interval = indexseq.intervseq[x];
          var fileOffset = interval.valueOf();
          var fileOffsetPrev = x > 0 ? indexseq.intervseq[x - 1].valueOf() : 0;
          var intervalPos = x * size16kb;
          intervalPoints.push( [intervalPos, fileOffset - fileOffsetPrev] );
          
        }

        // Load the reference density data.  Exclude reference if 0 points.
        refDensity[ref] = {"idx": i, "intervalPoints": intervalPoints, };
        refData.push( {"name": ref, "value": refLength, "refLength": refLength, "idx": i});


      }

      // Call function from js-bv-sampling to obtain point data.
      estimateCoverageDepth(tbiIdx, function(estimates) {

      for (var i = 0; i < tbiIdx.idxContent.head.n_ref; i++) {

          
          var refName   = tbiIdx.idxContent.head.names[i];
          var pointData = estimates[i];

          // Sort by position of read; otherwise, we get a wonky
          // line chart for read depth.  (When a URL is provided,
          // bamtools returns a sorted array.  We need this same
          // behavior when the BAM file is loaded from a file
          // on the client.
          pointData = pointData.sort(function(a,b) {
              var x = +a.pos; 
              var y = +b.pos;
              return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });  

          // Zero fill any 16kb points not in array
          var zeroPointData = [];
          for (var x = 1; x < pointData.length - 1; x++) {
              var posPrev = pointData[x-1].pos;
              var pos     = pointData[x].pos;
              var posDiff = pos - posPrev;
              if (posDiff > size16kb) {
                  var intervalCount = posDiff / size16kb;
                  for (var y = 0; y < intervalCount; y++) {
                    zeroPointData.push({pos: posPrev + (y*size16kb), depth: 0});
                  }
              }
          }
          if (zeroPointData.length > 0) {
            pointData = pointData.concat(zeroPointData);
            pointData = pointData.sort(function(a,b) {
              var x = +a.pos; 
              var y = +b.pos;
              return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });  

          }

          var refLength = pointData[pointData.length - 1].pos + size16kb;

          //refData.push({"name": refName, "value": +refLength, "refLength": +refLength, "idx": + i});
          refObject = refDensity[refName];
          refObject.points = [];
          
          for (var x = 0; x < pointData.length; x++) {
            var point = [pointData[x].pos, pointData[x].depth];
            refObject.points.push(point);
          }
        }

      });


      callback.call(this, refData);

    });
  }


  exports.loadRemoteIndex = function(theVcfUrl, callback) {
    if (theVcfUrl != null) {
      vcfURL = theVcfUrl;
    }
    sourceType = SOURCE_TYPE_URL;

    var client = BinaryClient(vcfReadDeptherServer);
    var url = encodeURI( vcfReadDeptherServer + '?cmd=-i ' + vcfURL + ".tbi");

    client.on('open', function(stream){
      var stream = client.createStream({event:'run', params : {'url':url}});
      var currentSequence;
      var refName;
      stream.on('data', function(data, options) {
         data = data.split("\n");
         for (var i=0; i < data.length; i++)  {
            if ( data[i][0] == '#' ) {
               
               var tokens = data[i].substr(1).split("\t");
               refIndex = tokens[0];
               refName = tokens[1];
               var refLength = tokens[2];

               
               refData.push({"name": refName, "value": +refLength, "refLength": +refLength, "idx": +refIndex});
               refDensity[refName] =  {"idx": refIndex, "points": [], "intervalPoints": []};
            }
            else {
               if (data[i] != "") {
                  var d = data[i].split("\t");
                  var point = [ parseInt(d[0]), parseInt(d[1]) ];
                  refDensity[refName].points.push(point);
                  refDensity[refName].intervalPoints.push(point);

               }
            }                  
         }
      });

      stream.on("error", function(error) {

      });

      stream.on('end', function() {
         callback.call(this, refData);
      });
    });

  };




  exports.getReferences = function(minLengthPercent, maxLengthPercent) {
    var references = [];
    
    // Calculate the total length
    var totalLength = +0;
    for (var i = 0; i < refData.length; i++) {
      var refObject = refData[i];
      totalLength += refObject.value;
    }

    // Only include references with length within percent range
    for (var i = 0; i < refData.length; i++) {
      var refObject = refData[i];
      var lengthPercent = refObject.value / totalLength;
      if (lengthPercent >= minLengthPercent && lengthPercent <= maxLengthPercent) {
        references.push(refObject);
      }
    }


    return references;
  }


  exports.getEstimatedDensity = function(ref, useLinearIndex, removeTheDataSpikes, maxPoints, rdpEpsilon) {
    var points = useLinearIndex ? refDensity[ref].intervalPoints.concat() : refDensity[ref].points.concat();

    if (removeTheDataSpikes) {
      var filteredPoints = this._applyCeiling(points);
      if (filteredPoints.length > 500) {
        points = filteredPoints;
      }
    } 


    // Reduce point data to to a reasonable number of points for display purposes
    if (maxPoints) {
      var factor = d3.round(points.length / 900);
      points = this.reducePoints(points, factor, function(d) { return d[0]; }, function(d) { return d[1]});
    }

    // Now perform RDP
    if (rdpEpsilon) {
      points = this._performRDP(points, rdpEpsilon, function(d) { return d[0] }, function(d) { return d[1] });
    }

    return points;
  }

  exports.getGenomeEstimatedDensity = function(useLinearIndex, removeTheDataSpikes, maxPoints, rdpEpsilon) {
    var allPoints = [];
    var offset = 0;
    for (var i = 0; i < refData.length; i++) {

      var points = useLinearIndex ? refDensity[refData[i].name].intervalPoints.concat() : refDensity[refData[i].name].points.concat();

      var offsetPoints = [];
      for (var x = 0; x < points.length; x++) {
        offsetPoints.push([points[x][0] + offset, points[x][1]]);
      }
      allPoints = allPoints.concat(offsetPoints);
      // We are making a linear representation of all ref density.
      // We will add the length of the ref to the 
      // next reference's positions.
      offset = offset + refData[i].value;
    }
    if (removeTheDataSpikes) {
      allPoints = this._applyCeiling(allPoints);
    }

    // Reduce point data to to a reasonable number of points for display purposes
    if (maxPoints) {
      var factor = d3.round(allPoints.length / maxPoints);
      allPoints = this.reducePoints(allPoints, factor, function(d) { return d[0]; }, function(d) { return d[1]});
    }

    // Now perform RDP
    if (rdpEpsilon) {
      allPoints = this._performRDP(allPoints, rdpEpsilon, function(d) { return d[0] }, function(d) { return d[1] });
    }


    return allPoints;
  }

  // MODIFIED
  exports.getStats = function(refs, regionParm, options, callback) {    
    if (sourceType == SOURCE_TYPE_URL) {
      this._getRemoteStats(refs, regionParm, options, callback);
    } else {
      this._getLocalStats(refs, regionParm, options, callback);
    }
    
  }
  // NEW
  exports.getVariants = function(refName, regionStart, regionEnd, regionStrand, selectedTranscript, afMin, afMax, callback, callbackClinvar, callbackClinvarLoaded, callbackClinvarBegin, callbackClinvarFailure) {
    if (sourceType == SOURCE_TYPE_URL) {
      this._getRemoteVariants(refName, regionStart, regionEnd, regionStrand, selectedTranscript, afMin, afMax, callback, callbackClinvar, callbackClinvarLoaded, callbackClinvarBegin, callbackClinvarFailure);
    } else {
      this._getLocalVariants(refName, regionStart, regionEnd, regionStrand, selectedTranscript, afMin, afMax, callback, callbackClinvar, callbackClinvarLoaded, callbackClinvarBegin, callbackClinvarFailure);
    }
  }
 
  // NEW
  exports._getLocalVariants = function(refName, regionStart, regionEnd, regionStrand, selectedTranscript, afMin, afMax, callback, callbackClinvar, callbackClinvarLoaded, callbackClinvarBegin, callbackClinvarFailure) {
    var me = this;

    // The variant region may span more than the specified region.
    // We will be keeping track of variant depth by relative position
    // of the region start, so to prevent a negative index, we will
    // keep track of the region start based on the variants.
    var variantRegionStart = regionStart;

    var vcfObjects = [];
    vcfObjects.length = 0;

    var headerRecords = [];
    vcfReader.getHeader( function(header) {
       headerRecords = header.split("\n");

    });

    // Get the vcf records for this region
    vcfReader.getRecords(refName, regionStart, regionEnd, function(records) {
        
        var allRecs = headerRecords.concat(records);

        me.annotateVcfRecords(allRecs, refName, regionStart, regionEnd, regionStrand, 
          selectedTranscript, callback, callbackClinvar, callbackClinvarLoaded);


    });

  }

  // NEW
  exports._getRemoteVariants = function(refName, regionStart, regionEnd, regionStrand, selectedTranscript, afMin, afMax, callback, callbackClinvar, callbackClinvarLoaded, callbackClinvarBegin, callbackClinvarFailure) {
    var me = this;
    var regionParm = ' ' + refName + ":" + regionStart + "-" + regionEnd;
    var tabixUrl = tabixServer + "?cmd=-h " + vcfURL + regionParm + '&encoding=binary';
    if (refName.indexOf('chr') == 0) {
      refFile = "./data/references_hg19/" + refName + ".fa";
    } else {
      refFile = "./data/references/hs_ref_chr" + refName + ".fa";
    }    
    
    // TODO - Need to generalize to grab reference names for species instead of hardcoding
    var contigAppenderUrl = encodeURI( contigAppenderServer + "?cmd= " + me.getHumanRefNames(refName) + " " + encodeURIComponent(encodeURI(tabixUrl)));


    // normalize variants
    var vtUrl = encodeURI( vtServer + "?cmd=normalize -r " + refFile + " " + encodeURIComponent(contigAppenderUrl));
    
    // get allele frequencies from 1000G and ExAC
    var afUrl = encodeURI( afServer + "?cmd= " + encodeURIComponent(vtUrl));

    var vepUrl = encodeURI( vepServer + '?cmd= ' + encodeURIComponent(afUrl));

    var url = encodeURI( snpEffServer + '?cmd= ' + encodeURIComponent(vepUrl));
    
    // Connect to the snpEff server    
    var client = BinaryClient(snpEffServer);
    
    var annotatedData = "";
    client.on('open', function(stream){

        // Run the command
        var stream = client.createStream({event:'run', params : {'url':url}});

        //
        // listen for stream data (the output) event. 
        //
        stream.on('data', function(data, options) {
           if (data == undefined) {
              return;
           } 
           annotatedData += data;
        });

        // Whenall of the annotated vcf data has been returned, call
        // the callback function.
        stream.on('end', function() {
          var annotatedRecs = annotatedData.split("\n");
          var vcfObjects = [];
          var contigHdrRecFound = false;

          annotatedRecs.forEach(function(record) {
            if (record.charAt(0) == "#") {
              // bypass header rec
            } else {

              // Parse the vcf record into its fields
              var fields = record.split('\t');
              var pos    = fields[1];
              var id     = fields[2];
              var ref    = fields[3];
              var alt    = fields[4];
              var qual   = fields[5];
              var filter = fields[6];
              var info   = fields[7];
              var format = fields[8];
              var genotypes = [];
              for (var i = 9; i < fields.length; i++) {
                genotypes.push(fields[i]);
              }

              // Turn vcf record into a JSON object and add it to an array
              var vcfObject = {'pos': pos, 'id': 'id', 'ref': ref, 'alt': alt, 
                               'qual': qual, 'filter': filter, 'info': info, 'format':format, 'genotypes': genotypes};
              vcfObjects.push(vcfObject);
            }
          });

           // Parse the vcf object into a variant object that is visualized by the client.
          var results = me.parseVcfRecords(vcfObjects, regionStart, regionEnd, regionStrand, selectedTranscript);
          callback(results);
          

          // Get the Clinvar variants, passing in the vcf recs that came back from snpEff.
          if (callbackClinvar) {
            me.getClinvarRecords(annotatedRecs, refName, regionStart, regionEnd, callbackClinvar, callbackClinvarLoaded, callbackClinvarBegin, callbackClinvarFailure);
          }
        });
    });
     
  }

  // NEW
  exports.annotateVcfRecords = function(records, refName, regionStart, regionEnd, regionStrand, selectedTranscript, callback, callbackClinvar, callbackClinvarLoaded, callbackClinvarBegin, callbackClinvarFailure) {
    var me = this;



    // For each vcf records, call snpEff to get the annotations.
    // Each vcf record returned will have an EFF field in the 
    // info field.
    me._annotateVcfRegion(records, refName, function(annotatedData) {

      var annotatedRecs = annotatedData.split("\n");
      var vcfObjects = [];

      annotatedRecs.forEach(function(record) {
        if (record.charAt(0) == "#") {
          // Bypass header
        } else {

          // Parse the vcf record into its fields
          var fields = record.split('\t');
          var pos    = fields[1];
          var id     = fields[2];
          var ref    = fields[3];
          var alt    = fields[4];
          var qual   = fields[5];
          var filter = fields[6];
          var info   = fields[7];
          var format = fields[8];
          var genotypes = [];
          for (var i = 9; i < fields.length; i++) {
            genotypes.push(fields[i]);
          }


          // Turn vcf record into a JSON object and add it to an array
          var vcfObject = {'pos': pos, 'id': 'id', 'ref': ref, 'alt': alt, 
                           'qual': qual, 'filter': filter, 'info': info, 'format': format, 'genotypes': genotypes};
          vcfObjects.push(vcfObject);
        }
      });

      // Parse the vcf object into a variant object that is visualized by the client.
      var results = me.parseVcfRecords(vcfObjects, regionStart, regionEnd, regionStrand, selectedTranscript);
      callback(results);


      if (callbackClinvar) {
        me.getClinvarRecords(annotatedRecs, refName, regionStart, regionEnd, callbackClinvar, callbackClinvarLoaded, callbackClinvarBegin, callbackClinvarFailure);
      }
    }

    );

  }

  // NEW
  exports.getClinvarRecords = function(records, refName, regionStart, regionEnd, callback, callbackLoaded, callbackBegin, callbackFailure) {
    var me = this;
    if (callbackBegin) {
      callbackBegin();
    }
    var batchSize = 100;
    me.clinvarIterCount = 0;
    // For every 100 variants, make an http request to eutils to get clinvar records.  Keep
    // repeating until all variants have been processed.
    var numberOfBatches = d3.round(records.length / batchSize);
    for( var i = 0; i < numberOfBatches; i++) {
      var start = i * batchSize;
      var end = start + batchSize;
      var batchOfRecords = records.slice(start, end <= records.length ? end : records.length);
      me.getClinvarRecordsImpl(batchOfRecords, refName, regionStart, regionEnd, callback, callbackLoaded, callbackFailure, numberOfBatches);
    }
  }  

  // NEW
  exports.getClinvarRecordsImpl = function(records, refName, regionStart, regionEnd, callback, finalCallback, callbackFailure, numberOfBatches) {
    var me = this;

    // Strip the ref name.
    if (refName.indexOf("chr") == 0) {
      tokens = refName.split("chr");
      if (tokens.length > 1) {
        refName = tokens[1];
      }
    }

    // Multiallelic input vcf records were assigned a number submission
    // index.  Create a map that ties the vcf record number to the
    // clinvar records number
    var sourceIndex = -1;
    var clinvarIndex = 0;
    var url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinvar&usehistory=y&retmode=json&term=";
    url += "(" + refName + "[Chromosome]" + " AND ";
    // clinvarToSourceMap = new Object();
    records.forEach(function(record) {
      if (record.charAt(0) == "#") {
          // Bypass header
      } else {

          // Parse the vcf record into its fields
          var fields = record.split('\t');
          var pos    = fields[1];
          var ref    = fields[3];
          var alt    = fields[4];

         

          if (pos == null || ref == null || alt == null) {

          } else {
            // sourceIndex++;
            // // Figure out if this is multiallelic and increment
            // // the index accordinging.  

            // var altTokens = alt.split(",");
            // altTokens.forEach(function(altToken) {
            //   clinvarIndex++;
            //   clinvarToSourceMap[clinvarIndex] = sourceIndex;
            // });            

            // Get rid of the left most anchor base for insertions and
            // deletions for accessing clinvar 
            var clinvarStart = +pos;
            if (alt == '.') {

            } else if (ref == '.') {

            } else if (ref.length > alt.length) {
              // deletion
              clinvarStart++;
            } else if (alt.length > ref.length) {
              // insertion
              clinvarStart++;
            } 


            url += clinvarStart + ',' 
          }
          
      }
    });

    url = url.slice(0,url.length-1) + '[c37])'


    var clinvarVariants = null;
    $.ajax( url )
      .done(function(data) {        
        var webenv = data["esearchresult"]["webenv"];
        var queryKey = data["esearchresult"]["querykey"];
        var summaryUrl = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&query_key=" + queryKey + "&retmode=json&WebEnv=" + webenv + "&usehistory=y"
        $.ajax( summaryUrl )
          .done(function(sumData) { 
            me.clinvarIterCount++;
            var isFinal = false;
            if (me.clinvarIterCount == numberOfBatches) {
              isFinal = true;
            }
            if (sumData.result == null) {
              if (sumData.esummaryresult && sumData.esummaryresult.length > 0) {
                sumData.esummaryresult.forEach( function(message) {
                  //console.log(message);
                });
              }
              //console.log("No data returned from clinvar request " + summaryUrl);
              sumData.result = {uids: []};
              callback(sumData.result );
              if (isFinal) {
                finalCallback();
              }
              
            } else {
              var sorted = sumData.result.uids.sort(function(a,b){ 
                var aStart = parseInt(sumData.result[a].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].start);
                var bStart = parseInt(sumData.result[b].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].start);
                if ( aStart > bStart) 
                  return 1; 
                else 
                  return -1; 
              })
              sumData.result.uids = sorted
              if (callback) {
                callback( sumData.result );
              }
              if (isFinal) {
                finalCallback();
              }

            }
          })
          .fail(function() {
            console.log('Error: clinvar http request failed to get summary data');
            if (callbackFailure) {
              callbackFailure();
            }
            if (finalCallback) {
              finalCallback();              
            }
          })
      })
      .fail(function() {
        console.log('Error: clinvar http request failed to get IDs');
        if (callbackFailure) {
          callbackFailure();
        }
        if (finalCallback) {
          finalCallback();              
        }

      })
   
  }


  // NEW
  exports._annotateVcfRegion = function(records, refName, callback, callbackClinvar) {
      var me = this;
      
      var contigAppenderUrl = encodeURI( contigAppenderServer + "?protocol=websocket&cmd= " + me.getHumanRefNames(refName) + " " + encodeURIComponent("http://client"));

      if (refName.indexOf('chr') == 0) {
        refFile = "./data/references_hg19/" + refName + ".fa";
      } else {
        refFile = "./data/references/hs_ref_chr" + refName + ".fa";
      }       
      
      // Normalize the variants (e.g. AAA->AAG becomes A->AG)
      var vtUrl = encodeURI( vtServer + "?cmd=normalize -r " + refFile + " " + encodeURIComponent(contigAppenderUrl) );
      
      // Get Allele Frequencies from 1000G and ExAC
      var afUrl = encodeURI( afServer + "?cmd= " + encodeURIComponent(vtUrl));
      
      // Call VEP
      var vepUrl = encodeURI( vepServer + "?cmd= " + encodeURIComponent(afUrl));
      
      // Call snpEff service
      var snpEffUrl = encodeURI( snpEffServer + "?cmd=" + encodeURIComponent(vepUrl));
      
      
      var client = BinaryClient(snpEffServer);
      var buffer = "";
      client.on('open', function(){
        var stream = client.createStream({event:'run', params : {'url':snpEffUrl}});

        // New local file streaming
        stream.on('createClientConnection', function(connection) {
          var ended = 0;
          var dataClient = BinaryClient('ws://' + connection.serverAddress);
          dataClient.on('open', function() {
            var dataStream = dataClient.createStream({event:'clientConnected', 'connectionID' : connection.id});

            records.forEach( function(record) {
              if (record.trim() == "") {
              } else {
                dataStream.write(record + "\n");
              }
            });
            dataStream.end();
          });
        });
  
        //
        // listen for stream data (the output) event. 
        //
        stream.on('data', function(data, options) {
           if (data == undefined) {
              return;
           } 
           buffer = buffer + data;
        });

        // Whem all of the annotated vcf data has been returned, call
        // the callback function.
        stream.on('end', function() {
          callback(buffer);
        });
        
      });
      
      client.on("error", function(error) {
        console.log("error while annotating vcf records " + error);
      });
  }



  exports.getHumanRefNames = function(refName) {
    if (refName.indexOf("chr") == 0) {
      return "chr1 chr2 chr3 chr4 chr5 chr6 chr7 chr8 chr9 chr10 chr11 chr12 chr13 chr14 chr15 chr16 chr17 chr18 chr20 chr21 chr22 chrX chrY";
    } else {
      return "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 X Y";
    }
  }


  exports.parseVcfRecords = function(vcfRecs, regionStart, regionEnd, regionStrand, selectedTranscript) {
      var me = this;
      var nameTokens = selectedTranscript.transcript_id.split('.');
      var selectedTranscriptID = nameTokens.length > 0 ? nameTokens[0] : selectedTranscript;


      // The variant region may span more than the specified region.
      // We will be keeping track of variant depth by relative position
      // of the region start, so to prevent a negative index, we will
      // keep track of the region start based on the variants.
      var variantRegionStart = regionStart;

      var homCount = 0;
      var hetCount = 0;
      var sampleCount = -1;

      var variants = [];
      variants.length = 0;




      vcfRecs.forEach(function(rec) {
        if (rec.pos && rec.id) {
          var alts = [];
          if(rec.alt.indexOf(',') > -1) {
            alts = rec.alt.split(",");
          } else {
            alts.push(rec.alt);
          }
          var altIdx = 0;
          alts.forEach(function(alt) {
            var len = alt.length;
            var type = 'SNP';
            if (rec.ref == '.' || alt.length > rec.ref.length ) {
              type = 'INS';
              len = alt.length - rec.ref.length;
            } else if (rec.alt == '.' || alt.length < rec.ref.length) {
              type = 'DEL';
              len = rec.ref.length - alt.length;
            }
            var end = +rec.pos + len;

            // Determine the format of the genotype fields
            var gtTokens = {};
            var idx = 0;
            if (rec.format && rec.format != '') {
              var tokens = rec.format.split(":");
              tokens.forEach(function(token) {
                gtTokens[token] = idx;
                idx++;
              })
            }


            // svtype and snpEff annotations from the info field
            var effects = new Object();
            var impacts = new Object();  
            var af = null;       
            var typeAnnotated = null;
            var combinedDepth = null;
            var af1000G = '.';
            var afExAC = '.';
            var rs = null;
            var annotTokens = rec.info.split(";");

            // vep annotations from the info field
            //Allele|Consequence|IMPACT|SYMBOL|Gene|Feature_type|Feature
            // |BIOTYPE|EXON|INTRON|HGVSc|HGVSp|cDNA_position|CDS_position|
            // Protein_position|Amino_acids|Codons|            
            // Existing_variation|DISTANCE|STRAND|SYMBOL_SOURCE|HGNC_ID|
            // SIFT|PolyPhen|HGVS_OFFSET|CLIN_SIG|SOMATIC|PHENO|
            // MOTIF_NAME|MOTIF_POS|HIGH_INF_POS|MOTIF_SCORE_CHANGE
            var vepConsequence = new Object(),  vepConsequenceIndex =1;
            var vepImpact = new Object(),       vepImpactIndex = 2;
            var vepFeatureType = new Object(),  vepFeatureTypeIndex = 5;
            var vepFeature = new Object(),      vepFeatureIndex = 6;
            var vepExon = new Object(),         vepExonIndex = 8;
            var vepHGVSc = new Object(),        vepHGVScIndex = 10;
            var vepHGVSp = new Object(),        vepHGVSpIndex = 11;
            var vepAminoAcids = new Object(),   vepAminoAcidsIndex = 15;
            var vepVariationIds = new Object(), vepExistingVariationIndex = 17;
            var vepSIFT = new Object(),         vepSIFTIndex = 22;
            var vepPolyPhen = new Object(),     vepPolyPhenIndex = 23;
            var sift = new Object();     // need a special field for filtering purposes
            var polyphen = new Object(); // need a special field for filtering purposes
            var regulatory = new Object(); // need a special field for filtering purposes

            var vepRegs = [];            
            var vepRegBioTypeIndex = 7;
            var vepRegMotifNameIndex = 28;
            var vepRegMotifPosIndex = 29;
            var vepRegMotifHiInfIndex = 30;

            // Iterate through the annotation fields, looking for the
            // annotation EFF
            annotTokens.forEach(function(annotToken) {
              if (annotToken.indexOf("BGAF_1KG=") == 0) {
                af1000G = annotToken.substring(9, annotToken.length);                
              } else if (annotToken.indexOf("BGAF_EXAC=") == 0) {
                afExAC = annotToken.substring(10, annotToken.length);
              } else if (annotToken.indexOf("RS=") == 0) {
                rs = annotToken.substring(3, annotToken.length);
              } else if (annotToken.indexOf("AF=") == 0) {
                // TODO:  vcfstatsalive must look at af by alt.
                // For now, just grab first af
                //af = me.parseAnnotForAlt(annotToken.substring(3, annotToken.length), altIdx);   
                af = me.parseAnnotForAlt(annotToken.substring(3, annotToken.length), 0);    
              } if (annotToken.indexOf("TYPE=") == 0) {
                typeAnnotated = me.parseAnnotForAlt(annotToken.substring(5, annotToken.length), altIdx);     
              } if (annotToken.indexOf("DP=") == 0) {
                combinedDepth = annotToken.substring(3, annotToken.length);                
              } else if (annotToken.indexOf("EFF=") == 0) {
                // We have found the EFF annotation. Now split
                // the EFF annotation into its parts.  Each
                // part represents the annotations for a given
                // transcript.
                annotToken = annotToken.substring(4, annotToken.length);
                var tokens = annotToken.split(",");
                var firstTime = true;
                tokens.forEach(function(token) {
                  // If we passed in an applicable transcript, grab the snpEff
                  // annotations pertaining to it.  Otherwise, just grab the
                  // first snpEff annotations listed.
                  var keep = false; 
                  if (selectedTranscriptID && token.indexOf(selectedTranscriptID) > -1) {
                    keep = true;
                  } 

                  

                  if (keep) {
                    // Parse out the effect 
                    var stop = token.indexOf("(");
                    var theEffect = token.substring(0, stop); 
                    effects[theEffect] = theEffect;

                    // Parse out the impact
                    var remaining = token.substring(stop+1,token.length);
                    var impactTokens = remaining.split("|");
                    var theImpact = impactTokens[0];    
                    if (impactTokens.length > 0) {
                      impacts[theImpact] = theImpact;                  
                    }
                  }

                  firstTime = false;
                });
              } else if (annotToken.indexOf("CSQ") == 0) {
                // We have found the VEP annotation. Now split
                // the CSQ string into its parts.  Each
                // part represents the annotations for a given
                // transcript.
                annotToken = annotToken.substring(4, annotToken.length);
                var transcriptTokens = annotToken.split(",");
                transcriptTokens.forEach(function(transcriptToken) {                  
                    var vepTokens   = transcriptToken.split("|");
                    var feature     = vepTokens[vepFeatureIndex];
                    var featureType = vepTokens[vepFeatureTypeIndex];

                    // If the transcript is the selected transcript, parse
                    // all of the vep fields.  We place these into maps
                    // because we can have multiple vep consequences for
                    // the same transcript.  
                    // TODO:  Need to sort so that highest impact shows first
                    //        and is used for filtering and ranking purposes.
                    if (featureType == 'Transcript' && feature == selectedTranscriptID) {
                      vepImpact[vepTokens[vepImpactIndex]] = vepTokens[vepImpactIndex];
                      vepConsequence[vepTokens[vepConsequenceIndex]] = vepTokens[vepConsequenceIndex];
                      vepExon[vepTokens[vepExonIndex]] = vepTokens[vepExonIndex];
                      vepHGVSc[vepTokens[vepHGVScIndex]] = vepTokens[vepHGVScIndex];
                      vepHGVSp[vepTokens[vepHGVSpIndex]] = vepTokens[vepHGVSpIndex];
                      vepAminoAcids[vepTokens[vepAminoAcidsIndex]] = vepTokens[vepAminoAcidsIndex];
                      vepVariationIds[vepTokens[vepExistingVariationIndex]] = vepTokens[vepExistingVariationIndex];

                      var siftString = vepTokens[vepSIFTIndex];
                      var siftDisplay = siftString != null && siftString != "" ? siftString.split("(")[0] : "";
                      vepSIFT[siftDisplay] = siftDisplay;   
                      sift['sift_'+ siftDisplay] = 'sift_' + siftDisplay;                   

                      var polyphenString = vepTokens[vepPolyPhenIndex];
                      var polyphenDisplay = polyphenString != null && polyphenString != "" ? polyphenString.split("(")[0] : "";
                      vepPolyPhen[polyphenDisplay] = polyphenDisplay;
                      polyphen['polyphen_' + polyphenDisplay] = 'polyphen_' + polyphenDisplay;

                    } else if (featureType == 'RegulatoryFeature' || featureType == 'MotifFeature' ) {
                      vepRegs.push( {
                        'impact' :  vepTokens[vepImpactIndex],
                        'consequence' : vepTokens[vepConsequenceIndex],
                        'biotype': vepTokens[vepRegBioTypeIndex],
                        'motifName' : vepTokens[vepRegMotifNameIndex],
                        'motifPos'  : vepTokens[vepRegMotifPosIndex],
                        'motifHiInf' : vepTokens[vepRegMotifHiInfIndex]
                      });
                      var reg = vepTokens[vepConsequenceIndex]== 'regulatory_region_variant' ? vepTokens[vepRegBioTypeIndex] : vepTokens[vepConsequenceIndex];
                      if (reg == "promoter") {
                        reg = "the_promoter";
                      }
                      regulatory["reg_" + reg.toLowerCase()] = "reg_" + reg.toLowerCase();;
                    }

                });

              }

            });

            var effectCats = new Object();
            if ($.isEmptyObject(effects)) {
              effectCats['NOEFFECT'] = 'NOEFFECT';
            } else {
              var found = false;
              for (var y = 0; y < effectCategories.length; y++) {
                var cat = effectCategories[y];
                var eff = cat[0];
                var effCat = cat[1];

                if (effects[eff]) {
                  effectCats[effCat] = effCat;
                  found = true;
                }
              };            
              if (!found) {
                effectCats['other'] = 'other';
              }

            }

            if ($.isEmptyObject(impacts)) {
              impacts["NOIMPACT"] = "NOIMPACT";
            }

            // Parse genotypes
            var genotypes = [];
            var genotypeDepths = [];
            rec.genotypes.forEach(function(genotype) {
              if (genotype == ".") {

              } else {
                var tokens = genotype.split(":");
                gtIndex = gtTokens["GT"];
                genotypes.push(tokens[gtIndex]);

                gtDepthIndex = gtTokens["DP"];
                if (gtDepthIndex) {
                  genotypeDepths.push(tokens[gtDepthIndex]);
                } else {
                  genotypeDepths.push(null);
                }
              }
            });

            var gtNumber = altIdx + 1;
            var genotypeForSample = null;
            var genotypeDepthForSample = null;
            var zygosity = null;
            var phased = null;


            // For now, just grab the first sample's genotype.
            // Only keep the alt if we have a genotype that matches.
            // For example 
            // A->G    0|1 keep
            // A->G,C  0|1 keep A->G, but bypass A->C
            // A->G,C  0|2 bypass A->G, keep A->C
            // A->G,C  1|2 keep A->G, keep A->C
            var keepAlt = false;
            var gtIndex = 0;
            if (sampleCount == -1) {
              sampleCount = genotypes.length;
            }
            genotypeForSample = genotypes[gtIndex];
            genotypeDepthForSample = genotypeDepths[gtIndex];

            if (genotypeForSample == null) {
              keepAlt = true;
            } else {
              var delim = null;
              if (genotypeForSample.indexOf("|") > 0) {
                delim = "|";
                phased = true;
              } else {
                delim = "/";
                phased = false;
              }
              var tokens = genotypeForSample.split(delim);
              if (tokens.length == 2) {
                if (tokens[0] == gtNumber || tokens[1] == gtNumber) {
                  keepAlt = true;
                  if (tokens[0] == tokens[1]) {
                    zygosity = "HOM";
                    homCount++;
                  } else {
                    zygosity = "HET";
                    hetCount++;
                  }
                } 
              }
            }

            // Get rid of the left most anchor base for insertions and
            // deletions for accessing clinvar 
            var clinvarStart = +rec.pos;
            var clinvarRef = rec.ref;
            var clinvarAlt = alt; 
            if (clinvarAlt == '.') {
              clinvarAlt = '-';
            } else if (clinvarRef == '.') {
              clinvarRef = '-';
            } else if (clinvarRef.length > clinvarAlt.length) {
              // deletion
              clinvarStart++;
              clinvarAlt = clinvarAlt.length == 1 ? "-" : clinvarAlt.substr(1,clinvarAlt.length-1);
              clinvarRef = clinvarRef.substr(1,clinvarRef.length-1);
            } else if (clinvarAlt.length > clinvarRef.length) {
              // insertion
              clinvarStart++;
              clinvarRef = clinvarRef.length == 1 ? "-" : clinvarRef.substr(1,clinvarRef.length-1);
              clinvarAlt = clinvarAlt.substr(1,clinvarAlt.length-1);
            } 

            if (keepAlt) {
              variants.push( {'start': +rec.pos, 'end': +end, 'len': +len, 'level': +0, 
                'strand': regionStrand, 
                'type': typeAnnotated && typeAnnotated != '' ? typeAnnotated : type, 
                'id': rec.id, 'ref': rec.ref, 
                'alt': alt, 'qual': rec.qual, 'filter': rec.filter, 
                'af': af,
                'combinedDepth': combinedDepth,             
                'genotypes': genotypes, 
                'genotype': genotypeForSample, 
                'genotypeDepth' : genotypeDepthForSample,
                'zygosity': zygosity ? zygosity : 'gt_unknown', 
                'phased': phased,
                'effect': effects, 
                'impact': impacts, 
                'consensus': rec.consensus,
                'inheritance': '',
                'af1000glevel': '',
                'afexaclevel:': '',
                'af1000G': me.parseAf(altIdx, af1000G),
                'afExAC': me.parseAf(altIdx, afExAC),
                'rsid' : (rs != null && rs != '' && rs != 0 ? rs : ''),
                'clinvarStart': clinvarStart,
                'clinvarRef': clinvarRef,
                'clinvarAlt': clinvarAlt,
                'vepConsequence': vepConsequence,
                'vepImpact': vepImpact,
                'vepExon': vepExon,
                'vepHGVSc':  vepHGVSc,
                'vepHGVSp': vepHGVSp,
                'vepAminoAcids': vepAminoAcids,
                'vepVariationIds' : vepVariationIds,
                'vepSIFT': vepSIFT,
                'sift' : sift,
                'vepPolyPhen':  vepPolyPhen,
                'polyphen' : polyphen, 
                'vepRegs':  vepRegs,
                'regulatory' : regulatory
                } 
              );

              if (rec.pos < variantRegionStart ) {
                variantRegionStart = rec.pos;
              }

            }

            altIdx++;
          });
        }

      });

      // Here is the result set.  An object representing the entire region with a field called
      // 'features' that contains an array of variants for this region of interest.
      var results = {'start': +regionStart, 'end': +regionEnd, 'strand': regionStrand, 
        'variantRegionStart': variantRegionStart, 'name': 'vcf track', 
        'homCount': homCount, 'hetCount': hetCount, 'sampleCount' : sampleCount,
        'features': variants};

      return results;
  };

  // If af returned from af is for multi-allelic variants, we need to parse out the
  // correct af from the comma separated string.
  exports.parseAf = function(altIdx, af) {
      // Handle multi-allelics
      if (af.indexOf(",") > 0) {
        var aftokens = af.split(",");
        var theAf = aftokens[+altIdx];
        return theAf; 
      } else {
        return af;
      }
  };


  exports.parseAnnotForAlt = function(value, altIdx) {
    var annotValue = "";
    if (value.indexOf(",") > 0) {
      var tokens = value.split(",");
      if (tokens.length > altIdx) {
        annotValue = tokens[altIdx];
      } else {
        annotValue = value;
      }
    }  else {
      annotValue = value;
    }   
    return annotValue;       
  };

  exports.pileupVcfRecords = function(variants, regionStart, posToPixelFactor, widthFactor) {
    var pileup = pileupLayout().sort(null).size(800); // 1860
    var maxlevel = pileup(variants);
    return maxLevel;
  }

  exports.pileupVcfRecords = function(variants, regionStart, posToPixelFactor, widthFactor) {
      widthFactor = widthFactor ? widthFactor : 1;
      // Variant's can overlap each over.  Set a field called variant.level which determines
      // how to stack the variants vertically in these cases.
      var posLevels = [];      
      posLevels.length = 0;
      var maxLevel = 0;
      variants.forEach(function(variant) {

        // get next available vertical spot starting at level 0
        var idx = (variant.start - regionStart);// + i;
        var posLevel = 0;
        if (posLevels[idx] != undefined) {
          for ( var k=0; k <= posLevels[idx].length; k++ ) {
            if (posLevels[idx][k] == undefined) {
              posLevel = k;
              break;                
            }
          }            
        }
        
        // Set variant level.
        variant.level = posLevel;

        // Now set new level for each positions comprised of this variant.
        for (var i = 0; i < variant.len + (posToPixelFactor * widthFactor); i++) {
          var idx = (variant.start - regionStart) + i;
          var stack = posLevels[idx] || [];
          stack[variant.level] = true;
          posLevels[idx] = stack;

          // Capture the max level of the entire region. 
          if (posLevels[idx].length-1 > maxLevel) {
            maxLevel = posLevels[idx].length - 1;
          }
        }
      });
      return maxLevel;
  }


  exports.compareVcfRecords = function(variants1, variants2,  callback, comparisonAttr, onMatchCallback) {
    var set1Label = 'unique1';
    var set2Label = 'unique2';
    var commonLabel = 'common';
    var comparisonAttribute = comparisonAttr;
    if (comparisonAttribute == null) {
      comparisonAttribute = 'consensus';
    }

    variants1.count = variants1.features.length;
    variants2.count = variants2.features.length;

    var features1 = variants1.features;
    var features2 = variants2.features;

    // Flag duplicates as this will throw off comparisons
    var ignoreDups = function(features) {
      for (var i =0; i < features.length - 1; i++) {
        var variant = features[i];
        var nextVariant = features[i+1];
        if (i == 0) {
          variant.dup = false;
        }
        nextVariant.dup = false;

        if (variant.start == nextVariant.start) {
             var refAlt = variant.type.toLowerCase() + ' ' + variant.ref + "->" + variant.alt;
             var nextRefAlt = nextVariant.type.toLowerCase() + ' ' + nextVariant.ref + "->" + nextVariant.alt;

             if (refAlt == nextRefAlt) {
                nextVariant.dup = true;
             }
        }
      }
    }
    ignoreDups(features1);
    ignoreDups(features2);


    // Iterate through the variants from the first set,
    // marking the consensus field based on whether a 
    // matching variant from the second list is encountered.
    var idx1 = 0;
    var idx2 = 0;
    while (idx1 < features1.length && idx2 < features2.length) {
      // Bypass duplicates
      if (features1[idx1].dup) {
        idx1++;
      }
      if (features2[idx2].dup) {
        idx2++;
      }

      variant1 = features1[idx1];
      variant2 = features2[idx2];
      
      var refAlt1 = variant1.type.toLowerCase() + ' ' + variant1.ref + "->" + variant1.alt;
      var refAlt2 = variant2.type.toLowerCase() + ' ' + variant2.ref + "->" + variant2.alt;

      if (variant1.start == variant2.start) {

        if (refAlt1 == refAlt2) {
          variant1[comparisonAttribute] =  commonLabel;
          variant2[comparisonAttribute] =  commonLabel;

          if (onMatchCallback) {
            onMatchCallback(variant1, variant2);
          }
          idx1++;
          idx2++;
        } else if (refAlt1 < refAlt2) {
          variant1[comparisonAttribute] = set1Label;
          idx1++;
        } else {
          variant2[comparisonAttribute] = set2Label;
          idx2++;
        }
      } else if (variant1.start < variant2.start) {
        variant1[comparisonAttribute] = set1Label;
        idx1++;
      } else if (variant2.start < variant1.start) {
        variant2[comparisonAttribute] = set2Label;
        idx2++;
      }

    }


    // If we get to the end of one set before the other,
    // mark the remaining as unique
    //
    if (idx1 < features1.length) {
      for(x = idx1; x < features1.length; x++) {
        var variant1 = features1[x];
        variant1[comparisonAttribute] = set1Label;
      }
    } 
    if (idx2 < features2.length) {
      for(x = idx2; x < features2.length; x++) {
        var variant2 = features2[x];
        variant2[comparisonAttribute] = set2Label;
      }
    } 

    callback();

  };

  // MODIFIED
  // We we are dealing with a local VCF, we will create a mini-vcf of all of the sampled regions.
  // This mini-vcf will be streamed to vcfstatsAliveServer.  
  exports._getLocalStats = function(refs, regionParm, options, callback) {    
    this._getRegions(refs, regionParm, options);
    
    this._streamVcf(vcfstatsAliveServer, callback);

    if (debug) {
      this._streamVcf(catInputServer);
    }
     
  };  

  exports._streamVcf = function(server, callback) {

    var client = BinaryClient(server);
    var url = encodeURI( server + "?protocol=websocket&cmd=" + encodeURIComponent("http://client"));

    var buffer = "";
    client.on('open', function(){
      var stream = client.createStream({event:'run', params : {'url':url}});

      // New local file streaming
      stream.on('createClientConnection', function(connection) {
        var ended = 0;
        var dataClient = BinaryClient('ws://' + connection.serverAddress);
        dataClient.on('open', function() {
          var dataStream = dataClient.createStream({event:'clientConnected', 'connectionID' : connection.id});

          var onGetRecords = function(records) {
            var me = this;
            if (regionIndex == regions.length) {
              // The executing code should never get there as we should exit the recursion in onGetRecords.
            } else {

              // Stream the vcf records we just parsed for a region in the vcf, one records at a time
              if (records) {
                for (var r = 0; r < records.length; r++) {              
                  dataStream.write(records[r] + "\n");
                }
              } else {
                // This is an error condition.  If vcfRecords can't return any
                // records, we will hit this point in the code.
                // Just log it for now and move on to the next region.
                console.log("WARNING:  unable to create vcf records for region  " + regionIndex);
              }

              regionIndex++;

              if (regionIndex > regions.length) {
                return;
              } else if (regionIndex == regions.length) {
                // We have streamed all of the regions so now we will end the stream.
                dataStream.end();
                return;
              } else {
                // There are more regions to obtain vcf records for, so call getVcfRecords now
                // that regionIndex has been incremented.
                vcfReader.getRecords(regions[regionIndex].name, 
                  regions[regionIndex].start, 
                  regions[regionIndex].end, 
                  onGetRecords);
              }      

            }
          }

          //vcfReader.getHeaderRecords( function(headerRecords) {
          //  for (h = 0; h < headerRecords.length; h++) {
          //    stream.write(headerRecords[h] + "\n");
          //  }
          //});
          vcfReader.getHeader( function(header) {
             dataStream.write(header + "\n");
          });


          // Now we recursively call vcfReader.getRecords (by way of callback function onGetRecords)
          // so that we parse vcf records one region at a time, streaming the vcf records
          // to the server.
          vcfReader.getRecords(
              regions[regionIndex].name, 
              regions[regionIndex].start, 
              regions[regionIndex].end, 
              onGetRecords);

        });
      });

      
      //
      // listen for stream data (the output) event. 
      //
      stream.on('data', function(data, options) {
         if (data == undefined) {
            return;
         } 
         var success = true;
         try {
           var obj = JSON.parse(buffer + data);
         } catch(e) {
           success = false;
           buffer += data;
         }
         if(success) {
           buffer = "";
           if (callback) {
             callback(obj); 
           }
         }               
      });
      
    });

    //
    // stream the vcf
    //
    /*
    client.on("stream", function(stream) {
      // This is the callback function that will get invoked each time a set of vcf records is
      // returned from the binary parser for a given region.  
      var onGetRecords = function(records) {
        var me = this;
        if (regionIndex == regions.length) {
          // The executing code should never get there as we should exit the recursion in onGetRecords.
        } else {

          // Stream the vcf records we just parsed for a region in the vcf, one records at a time
          if (records) {
            for (var r = 0; r < records.length; r++) {              
              stream.write(records[r] + "\n");
            }
          } else {
            // This is an error condition.  If vcfRecords can't return any
            // records, we will hit this point in the code.
            // Just log it for now and move on to the next region.
            console.log("WARNING:  unable to create vcf records for region  " + regionIndex);
          }

          regionIndex++;

          if (regionIndex > regions.length) {
            return;
          } else if (regionIndex == regions.length) {
            // We have streamed all of the regions so now we will end the stream.
            stream.end();
            return;
          } else {
            // There are more regions to obtain vcf records for, so call getVcfRecords now
            // that regionIndex has been incremented.
            vcfReader.getRecords(regions[regionIndex].name, 
              regions[regionIndex].start, 
              regions[regionIndex].end, 
              onGetRecords);
          }      

        }
      }

      //vcfReader.getHeaderRecords( function(headerRecords) {
      //  for (h = 0; h < headerRecords.length; h++) {
      //    stream.write(headerRecords[h] + "\n");
      //  }
      //});
      vcfReader.getHeader( function(header) {
         stream.write(header + "\n");
      });


      // Now we recursively call vcfReader.getRecords (by way of callback function onGetRecords)
      // so that we parse vcf records one region at a time, streaming the vcf records
      // to the server.
      vcfReader.getRecords(
          regions[regionIndex].name, 
          regions[regionIndex].start, 
          regions[regionIndex].end, 
          onGetRecords);

      });



    
    client.on("error", function(error) {

    });
*/

  }

  // MODIFIED
  exports._getRemoteStats = function(refs, regionParm, options, callback) {      
    var me = this;

    
    me._getRegions(refs, regionParm, options);
    
    // This is the tabix url.  Here we send the regions as arguments.  tabix
    // output (vcf header+records for the regions) will be piped
    // to the vcfstatsalive server.
    var regionStr = "";
    regions.forEach(function(region) { 
      regionStr += " " + region.name + ":" + region.start + "-" + region.end 
    });
    var tabixUrl = tabixServer + "?cmd=-h " + vcfURL + regionStr + "&encoding=binary";

    // This is the full url for vcfstatsalive server which is piped its input from tabixserver
    var url = encodeURI( vcfstatsAliveServer + '?cmd=-u 1000 ' + encodeURIComponent(tabixUrl));

    // Connect to the vcfstatsaliveserver    
    var client = BinaryClient(vcfstatsAliveServer);

    var buffer = "";
    client.on('open', function(stream){

        // Run the command
        var stream = client.createStream({event:'run', params : {'url':url}});

       // Listen for data to be streamed back to the client
        stream.on('data', function(data, options) {
           if (data == undefined) {
              return;
           } 
           var success = true;
           try {
             var obj = JSON.parse(buffer + data);
           } catch(e) {
             success = false;
             buffer += data;
           }
           if(success) {
             buffer = "";
             callback(obj); 
           }               
        });
        stream.on('end', function() {
           if (options.onEnd != undefined)
              options.onEnd();
        });
     });
     
  };  


 
  // MODIFIED
  exports._getRegions = function(refs, regionObject, options) {

    regionIndex = 0;
    regions.length = 0;
    var bedRegions;

    if (regionObject) {
      regions.push( regionObject );
    } else {
      for (var j=0; j < refs.length; j++) {
        var ref      = refData[refs[j]];
        var start    = options.start;
        var end      = options.end ? options.end : ref.refLength;
        var length   = end - start;
        if ( length < options.binSize * options.binNumber) {
          regions.push({
            'name' : ref.name,
            'start': start,
            'end'  : end    
          });
        } else {
           // create random reference coordinates
           for (var i=0; i < options.binNumber; i++) {   
              var s = start + parseInt(Math.random()*length); 
              regions.push( {
                 'name' : ref.name,
                 'start' : s,
                 'end' : s + options.binSize
              }); 
           }
           // sort by start value
           regions = regions.sort(function(a,b) {
              var x = a.start; var y = b.start;
              return ((x < y) ? -1 : ((x > y) ? 1 : 0));
           });               
           
           // intelligently determine exome bed coordinates
           /*
           if (options.exomeSampling)
              options.bed = me._generateExomeBed(options.sequenceNames[0]);
           
           // map random region coordinates to bed coordinates
           if (options.bed != undefined)
              bedRegions = me._mapToBedCoordinates(SQs[0].name, regions, options.bed)
            */
        }
      } 

    }
    return regions;     

  }

  /*
  *
  *  Stream the vcf.iobio snapshot (html) to the emailServer which
  *  will email a description of the problem along with an html file attachment
  *  that is the snapshop of vcfiobio.
  */
  exports.sendEmail = function(screenContents, email, note) {
    var client = BinaryClient(emailServer);
    // Strip of the #modal-report-problem from the URL
    var theURL = location.href;
    if (theURL.indexOf("#modal-report-problem") > -1){
      theURL = theURL.substr(0, theURL.indexOf("#modal-report-problem"));
    }

    // Format the body of the email
    var htmlBody = '<span style="padding-right: 4px">Reported by:</span>' + email  + "<br><br>" + 
                   '<span style="padding-right: 51px">URL:</span>'         + theURL + "<br><br>" + 
                   note + '<br><br>';

    client.on('open', function(stream){
      var stream = client.createStream(
      {
        'from':     email, 
        'to':       'vcfiobio@googlegroups.com',
        'subject':  'vcf.iobio.io Issue',
        'filename': 'vcfiobio_snapshot.html',
        'body':     htmlBody
      });
      stream.write(screenContents);
      stream.end();
    });
  }


  exports.jsonToArray = function(_obj, keyAttr, valueAttr) {
    var theArray = [];
    for (prop in _obj) {
      var o = new Object();
      o[keyAttr] = prop;
      o[valueAttr] = _obj[prop];
      theArray.push(o);
    }
    return theArray;
  };

  exports.jsonToValueArray = function(_obj) {
    var theArray = [];
    for (var key in _obj) {
      theArray.push(_obj[key]);
    }
    return theArray;
  };

  exports.jsonToArray2D = function(_obj) {
    var theArray = [];
    for (prop in _obj) {
      var row = [];
      row[0] =  +prop;
      row[1] =  +_obj[prop];
      theArray.push(row);
    }
    return theArray;
  };


  exports.reducePoints = function(data, factor, xvalue, yvalue) {
    if (factor <= 1 ) {
      return data;
    }
    var i, j, results = [], sum = 0, length = data.length, avgWindow;

    if (!factor || factor <= 0) {
      factor = 1;
    }

    // Create a sliding window of averages
    for(i = 0; i < length; i+= factor) {
      // Slice from i to factor
      avgWindow = data.slice(i, i+factor);
      for (j = 0; j < avgWindow.length; j++) {
          var y = yvalue(avgWindow[j]);
          sum += y != null ? d3.round(y) : 0;
      }
      results.push([xvalue(data[i]), sum])
      sum = 0;
    }
    return results;
  };


  //
  //
  //
  //  PRIVATE 
  //
  //
  //

  exports._makeid = function(){
    // make unique string id;
     var text = "";
     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

     for( var i=0; i < 5; i++ )
         text += possible.charAt(Math.floor(Math.random() * possible.length));

     return text;
  };

  exports._performRDP = function(data, epsilon, pos, depth) {
    var smoothedData = properRDP(data, epsilon);
    return smoothedData;
  }

  exports._applyCeiling = function(someArray) {  
    if (someArray.length < 5) {
      return someArray;
    }

    // Copy the values, rather than operating on references to existing values
    var values = someArray.concat();

    // Then sort
    values.sort( function(a, b) {
            return a[1] - b[1];
         });

    /* Then find a generous IQR. This is generous because if (values.length / 4) 
     * is not an int, then really you should average the two elements on either 
     * side to find q1.
     */     
    var q1 = values[Math.floor((values.length / 4))][1];
    // Likewise for q3. 
    var q3 = values[Math.ceil((values.length * (3 / 4)))][1];
    var iqr = q3 - q1;
    var newValues = [];
    if (q3 != q1) {
      // Then find min and max values
      var maxValue = d3.round(q3 + iqr*1.5);
      var minValue = d3.round(q1 - iqr*1.5);

      // Then filter anything beyond or beneath these values.
      var changeCount = 0;
      values.forEach(function(x) {
          var value = x[1];
          if (x[1] > maxValue) {
            value = maxValue;
            changeCount++;
          }
          newValues.push([x[0], value]);
      });
    } else {
      newValues = values;
    }

    newValues.sort( function(a, b) {
      return a[0] - b[0];
    });

    // Then return
    return newValues;
  }


  // Allow on() method to be invoked on this class
  // to handle data events
  d3.rebind(exports, dispatch, 'on');

  // Return this scope so that all subsequent calls
  // will be made on this scope.
  return exports;
};
