
// extending Thomas Down's original BAM js work 

var Bam = Class.extend({
   
   init: function(bamUri, options) {
      this.bamUri = bamUri;
      this.options = options; // *** add options mapper ***
      // test if file or url
      if (typeof(this.bamUri) == "object") {
         this.sourceType = "file";
         this.bamBlob = new BlobFetchable(bamUri); 
         this.baiBlob = new BlobFetchable(this.options.bai); // *** add if statement if here ***
         this.promises = [];
         this.bam = undefined;
         var me = this;
         makeBam(this.bamBlob, this.baiBlob, function(bam) {
            me.setHeader(bam.header);
            me.provide(bam); 
         });
      } else if ( this.bamUri.slice(0,4) == "http" || this.bamUri.slice(0,3) == "ftp" ) {
         this.sourceType = "url";         
      }
      
      // set iobio servers
      this.iobio = {}

      /*
      this.iobio.coverage = "wss://coverage.iobio.io";
      this.iobio.bamtools = "wss://bamtools.iobio.io";
      this.iobio.samtools = "wss://samtools.iobio.io";
      this.iobio.bamReadDepther = "wss://bamReadDepther.iobio.io";
      this.iobio.bamMerger = "wss://bammerger.iobio.io";      
      this.iobio.bamstatsAlive = "wss://bamstatsalive.iobio.io"
      this.iobio.freebayes = "wss://freebayes.iobio.io";
      this.iobio.bcftools = "wss://bcftools.iobio.io";
      this.iobio.vcflib = "wss://vcflib.iobio.io";
      this.iobio.vt = "wss://vt.iobio.io";
*/


  
      this.iobio.coverage = "wss://services.iobio.io/coverage";
      this.iobio.bamtools = "wss://services.iobio.io/bamtools";
      this.iobio.samtools = "wss://services.iobio.io/samtools";
      this.iobio.bamReadDepther = "wss://services.iobio.io/bamReadDepther";
      this.iobio.bamMerger = "wss://services.iobio.io/bammerger";      
      this.iobio.bamstatsAlive = "wss://services.iobio.io/bamstatsalive"
      this.iobio.freebayes = "wss://services.iobio.io/freebayes";
      this.iobio.bcftools = "wss://services.iobio.io/bcftools";
      this.iobio.vcflib = "wss://services.iobio.io/vcflib";
      this.iobio.vt = "wss://services.iobio.io/vt";


      

//      this.iobio.bamtools = "ws://localhost:8061";
//      this.iobio.samtools = "ws://localhost:8060";
//      this.iobio.coverage = "ws://localhost:8047"
//      this.iobio.bamReadDepther = "ws://localhost:8021";
//      this.iobio.bamMerger = "ws://localhost:8030";      
//      this.iobio.bamstatsAlive = "ws://localhost:7100"
      return this;
   },
   
   fetch: function( name, start, end, callback, options ) {
      var me = this;      
      // handle bam has been created yet
      if(this.bam == undefined) // **** TEST FOR BAD BAM ***
         this.promise(function() { me.fetch( name, start, end, callback, options ); });
      else
         this.bam.fetch( name, start, end, callback, options );
   },
   
   promise: function( callback ) {
      this.promises.push( callback );
   },
   
   provide: function(bam) {
      this.bam = bam;
      while( this.promises.length != 0 ) 
         this.promises.shift()();
   },
   
   _makeid: function() {
      // make unique string id;
       var text = "";
       var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

       for( var i=0; i < 5; i++ )
           text += possible.charAt(Math.floor(Math.random() * possible.length));

       return text;
   },
   
   _getBamUrl: function(name, start, end) {
      return this._getBamRegionsUrl([ {'name':name,'start':start,'end':end} ]);
   },
   
   _getBamRegionsUrl: function(regions, golocal) {
      var samtools = this.iobio.samtools;
      if ( this.sourceType == "url") {
         var regionStr = "";
         regions.forEach(function(region) { regionStr += " " + region.name + ":" + region.start + "-" + region.end });
         var url = samtools + "?cmd= view -b " + this.bamUri + regionStr + "&protocol=http&encoding=binary";
      } else {
         // creates a url for a new bam that is sliced from an old bam
         // open connection to iobio webservice that will request this data, since connections can only be opened from browser
         /*var me = this;
         var connectionID = this._makeid();
         var client = BinaryClient(samtools + '?id=', {'connectionID' : connectionID} );
         client.on('open', function(stream){
            var stream = client.createStream({event:'setID', 'connectionID':connectionID});
            stream.end();
         })
        */
        var url = samtools + "?protocol=websocket&encoding=binary&cmd=view -S -b " + encodeURIComponent("http://client");
        
        /* var ended = 0;
         var me = this;
         // send data to samtools when it asks for it         
         client.on('stream', function(stream, options) {
            stream.write(me.header.toStr);            
            for (var i=0; i < regions.length; i++) {
              var region = regions[i];
               me.convert('sam', region.name, region.start, region.end, function(data,e) {   
                  stream.write(data);                   
                  ended += 1;                  
                  if ( regions.length == ended) stream.end();
               }, {noHeader:true});               
            }
         })
          */
      }
      return encodeURI(url);
   },

   
   _generateExomeBed: function(id) {
      var bed = "";
      var readDepth = this.readDepth[id];
      var start, end;
      var sum =0;
      // for (var i=0; i < readDepth.length; i++){
      //    sum += readDepth[i].depth;
      // }
      // console.log("avg = " + parseInt(sum / readDepth.length));
      // merge contiguous blocks into a single block and convert to bed format
      for( var i=0; i < readDepth.length; i++){
         if (readDepth[i].depth < 20) {
            if (start != undefined)
               bed += id + "\t" + start + "\t" + end + "\t.\t.\t.\t.\t.\t.\t.\t.\t.\n"
            start = undefined;
         }
         else {         
            if (start == undefined) start = readDepth[i].pos;
            end = readDepth[i].pos + 16384;
         }
      }
      // add final record if data stopped on non-zero
      if (start != undefined)
         bed += id + "\t" + start + "\t" + end + "\t.\t.\t.\t.\t.\t.\t.\t.\t.\n"
      return bed;
   },
   
   _tmp: function(ref, regions, bed){
      var me = this;
      var bedRegions = [];
      var a = this._bedToCoordinateArray(ref, bed);
      regions.forEach(function(reg) {
         var start = reg.start
         var length = reg.end - reg.start;
         var ci = me._getClosestValueIndex(a, reg.start); // update lo start value
         var maxci = a.length;
         while(length > 0 && ci < maxci) {
            var newStart,newEnd;
            
            // determine start position
            if ( a[ci].start <= start ) newStart = start;
            else newStart = a[ci].start;
            
            // determine end position
            if ( a[ci].end >=  newStart+length ) newEnd = newStart+length
            else { newEnd = a[ci].end; ci += 1; }
            
            // update length left to sample
            length -= newEnd - newStart;
            // push new regions
            bedRegions.push({ name:reg.name, 'start':newStart, 'end':newEnd});
         }            
      })
      return bedRegions;
   },
   
   _mapToBedCoordinates: function(ref, regions, bed) {
      var a = this._bedToCoordinateArray(ref, bed);
      var a_i = 0;
      var bedRegions = [];
      if (a.length == 0) {
         alert("Bed file doesn't have coordinates for reference: " + regions[0].name + ". Sampling normally");
         return null;
      }
      regions.forEach(function(reg){
         for (a_i; a_i < a.length; a_i++) {
            if (a[a_i].end > reg.end)
               break;
            
            if (a[a_i].start >= reg.start)
               bedRegions.push( {name:reg.name, start:a[a_i].start, end:a[a_i].end})
         }
      }) 
      return bedRegions
   },
   
   _bedToCoordinateArray: function(ref, bed) {
      var me = this;
      var a = [];
      bed.split("\n").forEach(function(line){
        if (line[0] == '#' || line == "") return;
  
        var fields = line.split("\t");
        if (me._referenceMatchesBed(ref, fields[0])) {
           a.push({ chr:ref, start:parseInt(fields[1]), end:parseInt(fields[2]) });
        }
      });
      return a;
   },

   _referenceMatchesBed: function(ref, bedRef) {
      if (ref == bedRef) {
        return true;
      } 
      // Try stripping chr from reference names and then comparing
      ref1 = ref.replace(/^chr?/,'');
      bedRef1 = bedRef.replace(/^chr?/,'');

      return (ref1 == bedRef1);
   },
   
   _getClosestValueIndex: function(a, x) {
       var lo = -1, hi = a.length;
       while (hi - lo > 1) {
           var mid = Math.round((lo + hi)/2);
           if (a[mid].start <= x) {
               lo = mid;
           } else {
               hi = mid;
           }
       }
       if (lo == -1 ) return 0;
       if ( a[lo].end > x )
           return lo;
       else
           return hi;
   },

   
   getReferencesWithReads: function(callback) {
      var refs = [];
      var me = this;
      if (this.sourceType == 'url') {
         
      } else {
         this.getHeader(function(header) {
            for (var i=0; i < header.sq.length; i++) {
               if ( me.bam.indices[me.bam.chrToIndex[header.sq[i].name]] != undefined )
                  refs.push( header.sq[i] );
            }
            callback(refs);
         })
      }
   },
   
   // *** bamtools functionality ***

   convert: function(format, name, start, end, callback, options) {
      // Converts between BAM and a number of other formats
      if (!format || !name || !start || !end)
         return "Error: must supply format, sequenceid, start nucleotide and end nucleotide"
      
      if (format.toLowerCase() != "sam")
         return "Error: format + " + options.format + " is not supported"
      var me = this;   
      this.fetch(name, start, end, function(data,e) {
         if(options && options.noHeader)
            callback(data, e);
         else {
            me.getHeader(function(h) {
               callback(h.toStr + data, e);
            })
         }
      }, { 'format': format })
   },
   
   count: function() {
      // Prints number of alignments in BAM file(s)
   },
   
   coverage: function() {
      // Prints coverage statistics from the input BAM file
   },
   
   filter: function() {
      // Filters BAM file(s) by user-specified criteria
   },
   
   estimateBaiReadDepth: function(callback) {      
      var me = this, readDepth = {};
      me.readDepth = {};
      
      function cb() {
         if (me.header) {
            for (var id in readDepth) {
              if (readDepth.hasOwnProperty(id))
              var name = me.header.sq[parseInt(id)].name;
               if ( me.readDepth[ name ] == undefined){
                  me.readDepth[ name ] = readDepth[id];
                  callback( name, readDepth[id] );
               }                
            }  
         }
      }
            
      me.getHeader(function(header) { 
         if (Object.keys(me.readDepth).length > 0)
            cb();
      });
      if ( Object.keys(me.readDepth).length > 0 )
         callback(me.readDepth)
      else if (me.sourceType == 'url') {
         var client = BinaryClient(me.iobio.bamReadDepther);
         var url = encodeURI( me.iobio.bamReadDepther + '?cmd=-i ' + me.bamUri + ".bai")
         client.on('open', function(stream){
            var stream = client.createStream({event:'run', params : {'url':url}});
            var currentSequence;
            stream.on('data', function(data, options) {
               data = data.split("\n");
               for (var i=0; i < data.length; i++)  {
                  if ( data[i][0] == '#' ) {
                     if ( Object.keys(readDepth).length > 0 ) { cb() };
                     currentSequence = data[i].substr(1);
                     readDepth[currentSequence] = [];
                  }
                  else {
                     if (data[i] != "") {
                        var d = data[i].split("\t");
                        readDepth[currentSequence].push({ pos:parseInt(d[0]), depth:parseInt(d[1]) });
                     }
                  }                  
               }
            });
            stream.on('end', function() {
               cb();
            });
         });
      } else if (me.sourceType == 'file') {
          me.baiBlob.fetch(function(header){
             if (!header) {
                  return dlog("Couldn't access BAI");
              }
          
              var uncba = new Uint8Array(header);
              var baiMagic = readInt(uncba, 0);
              if (baiMagic != BAI_MAGIC) {
                  return dlog('Not a BAI file');
              }
              var nref = readInt(uncba, 4);
          
              bam.indices = [];
              var p = 8;
              
              for (var ref = 0; ref < nref; ++ref) {
                  var bins = [];
                  var blockStart = p;
                  var nbin = readInt(uncba, p); p += 4;
                  if (nbin > 0) readDepth[ref] = [];
                  for (var b = 0; b < nbin; ++b) {
                      var bin = readInt(uncba, p);
                      var nchnk = readInt(uncba, p+4);
                      p += 8;
                      // p += 8 + (nchnk * 16);
                      var byteCount = 0;
                      for (var c=0; c < nchnk; ++c) {                         
                         var startBlockAddress = readVob(uncba, p);
                         var endBlockAddress = readVob(uncba, p+8);
                         p += 16; 
                         byteCount += (endBlockAddress.block - startBlockAddress.block);
                      }                      
                     if ( bin >=  4681 && bin <= 37449) {
                        var position = (bin - 4681) * 16384;
                        readDepth[ref][bin-4681] = {pos:position, depth:byteCount};
                        // readDepth[ref].push({pos:position, depth:byteCount});
                       //bins[bin - 4681] = byteCount;
                     }
                  }
                  var nintv = readInt(uncba, p); p += 4;
                  p += (nintv * 8);
                  
                  if (nbin > 0) {
                     for (var i=0 ; i < readDepth[ref].length; i++) {
                        if(readDepth[ref][i] == undefined)
                           readDepth[ref][i] = {pos : (i+1)*16000, depth:0};
                     }
                  }
                  // Sort by position of read; otherwise, we get a wonky
                  // line chart for read depth.  (When a URL is provided,
                  // bamtools returns a sorted array.  We need this same
                  // behavior when the BAM file is loaded from a file
                  // on the client.
                  if (readDepth[ref] != undefined) {
                  readDepth[ref] = readDepth[ref].sort(function(a,b) {
                      var x = a.pos; 
                      var y = b.pos;
                      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                   });  
                }
              }   

              // Invoke Callback function                    
              cb();
          });
      }
         
   },
   
   getHeader: function(callback) {
      var me = this;
      if (me.header)
         callback(me.header);
      else if (me.sourceType == 'file')
         me.promise(function() { me.getHeader(callback); })
      else {
         var client = BinaryClient(me.iobio.samtools);
         var url = encodeURI( me.iobio.samtools + '?cmd=view -H ' + this.bamUri)
         client.on('open', function(stream){
            var stream = client.createStream({event:'run', params : {'url':url}});
            var rawHeader = ""
            stream.on('data', function(data, options) {
               rawHeader += data;
            });
            stream.on('end', function() {
               me.setHeader(rawHeader);             
               callback( me.header);
            });
         });
      }
         
      // need to make this work for URL bams
      // need to incorporate real promise framework throughout
   },
   
   setHeader: function(headerStr) {
      var header = { sq:[], toStr : headerStr };
      var lines = headerStr.split("\n");
      for ( var i=0; i<lines.length > 0; i++) {
         var fields = lines[i].split("\t");
         if (fields[0] == "@SQ") {
            var fHash = {};
            fields.forEach(function(field) {
              var values = field.split(':');
              fHash[ values[0] ] = values[1]
            })
            header.sq.push({name:fHash["SN"], end:1+parseInt(fHash["LN"])});
         }
      }               
      this.header = header;
   },
   	
   index: function() {
      // Generates index for BAM file
   },
   
   merge: function() {
      // Merge multiple BAM files into single file
   },
   
   random: function() {
      // Select random alignments from existing BAM file(s), intended more as a testing tool.
   },
   
   resolve: function() {
      // Resolves paired-end reads (marking the IsProperPair flag as needed)
   },
   
   revert: function() {
      // Removes duplicate marks and restores original base qualities
   },
   
   sort: function() {
      // Sorts the BAM file according to some criteria
   },
   
   split: function() {
      // Splits a BAM file on user-specified property, creating a new BAM output file for each value found
   },
   
   stats: function(name, start, end, callback) {
      // Prints some basic statistics from input BAM file(s)
      var client = BinaryClient(this.iobio.bamstatsAlive);
      var url = encodeURI( this.iobio.bamstatsAlive + '?cmd=-u 1000 -s ' + start + " -l " + parseInt(end-start) + " " + encodeURIComponent(this._getBamUrl(name,start,end)) );
      client.on('open', function(stream){
         var stream = client.createStream({event:'run', params : {'url':url}});
         var buffer = "";
         stream.on('data', function(data, options) {
            if (data == undefined) return;
            var success = true;
            try {
              var obj = JSON.parse(buffer + data)
            } catch(e) {
              success = false;
              buffer += data;
            }
            if(success) {
              buffer = "";
              callback(obj); 
            }
         });
      });
   }, 
   
   sampleStats: function(callback, options) {
      // Prints some basic statistics from sampled input BAM file(s)      
      options = $.extend({
         binSize : 40000, // defaults
         binNumber : 20,
         start : 1,
      },options);
      var me = this;
      
      function goSampling(SQs) {      
         var regions = [];
         var bedRegions;
         for (var j=0; j < SQs.length; j++) {
            var sqStart = options.start;
            var length = SQs[j].end - sqStart;
            if ( length < options.binSize * options.binNumber) {
               SQs[j].start = sqStart;
               regions.push(SQs[j])
            } else {
               // create random reference coordinates
               var regions = [];
               for (var i=0; i < options.binNumber; i++) {   
                  var s=sqStart + parseInt(Math.random()*length); 
                  regions.push( {
                     'name' : SQs[j].name,
                     'start' : s,
                     'end' : s+options.binSize
                  }); 
               }
               // sort by start value
               regions = regions.sort(function(a,b) {
                  var x = a.start; var y = b.start;
                  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
               });               
               
               // intelligently determine exome bed coordinates
               if (options.exomeSampling)
                  options.bed = me._generateExomeBed(options.sequenceNames[0]);
               
               // map random region coordinates to bed coordinates
               if (options.bed != undefined)
                  bedRegions = me._mapToBedCoordinates(SQs[0].name, regions, options.bed)
            }
         }      
         
         var client = BinaryClient(me.iobio.bamstatsAlive);
         var regStr = JSON.stringify((bedRegions || regions).map(function(d) { return {start:d.start,end:d.end,chr:d.name};}));                 
         // var samtoolsCmd = JSON.stringify((bedRegions || regions).map(function(d) { return {d.start,end:d.end,chr:d.name};}));
         // var url = encodeURI( me.iobio.bamstatsAlive + '?cmd=-u 30000 -f 2000 -r \'' + regStr + '\' ' + encodeURIComponent(me._getBamRegionsUrl(regions)));
         var url = encodeURI( me.iobio.bamstatsAlive + '?cmd=-u 3000 -r \'' + regStr + '\' ' + encodeURIComponent(me._getBamRegionsUrl(regions)));
         var buffer = "";
         client.on('open', function(stream){
            var stream = client.createStream({event:'run', params : {'url':url}});

            // New local file streaming
            stream.on('createClientConnection', function(connection) {
              var ended = 0;
              var dataClient = BinaryClient('ws://' + connection.serverAddress);
              dataClient.on('open', function() {
                var dataStream = dataClient.createStream({event:'clientConnected', 'connectionID' : connection.id});
                dataStream.write(me.header.toStr);            
                for (var i=0; i < regions.length; i++) {
                  var region = regions[i];
                   me.convert('sam', region.name, region.start, region.end, function(data,e) {   
                      dataStream.write(data);                   
                      ended += 1;                  
                      if ( regions.length == ended) dataStream.end();
                   }, {noHeader:true});               
                }                
              })
            });

            stream.on('data', function(data, options) {
               if (data == undefined) return;
               var success = true;
               try {
                 var obj = JSON.parse(buffer + data)
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
      }
      
      if ( options.sequenceNames != undefined && options.sequenceNames.length == 1 && options.end != undefined) {
         goSampling([{name:options.sequenceNames[0], end:options.end}]);
      } else  if (options.sequenceNames != undefined && options.sequenceNames.length == 1){
         this.getHeader(function(header){
            var sq;
            $(header.sq).each( function(i,d) { 
               if(d.name == options.sequenceNames[0]) 
               sq = d; 
            })
            goSampling([sq]);
         });
      } else {
         this.getHeader(function(header){
            goSampling(header.sq); 
         });
         // this.getReferencesWithReads(function(refs) {            
         //    goSampling(refs);
         // })
      }
   }, 

   transformRefName: function(refName, callback) {
    var found = false;
    this.getHeader(function(header) {
      header.sq.forEach(function(seq) {
        if (seq.name == refName || seq.name.split('chr')[1] == refName || seq.name == refName.split('chr')[1]) {
          found = true;
          callback(seq.name);        
        }
      })
      if (!found) callback(refName); // not found
    })
   },


   /*
   *  This method will return coverage as point data.  It takes the reference name along
   *  with the region start and end.  Optionally, the caller can provide an array of
   *  region objects to get the coverage at exact positions.  Also, this method takes an
   *  optional argument of maxPoints that will specify how many data points should be returned
   *  for the region.  If not specified, all data points are returned.  The callback method
   *  will send back to arrays; one for the coverage points, reduced down to the maxPoints, and
   *  the second for coverage of specific positions.  The latter can then be matched to vcf records
   *  , for example, to obtain the coverage for each variant.
   */
   getCoverageForRegion: function(refName, regionStart, regionEnd, regions, maxPoints, callback) {
      var me = this;
      this.transformRefName(refName, function(trRefName){        

        // set the ref name for every region and find the lower and upper bound (start, end)
        // of all regions;
        
        var regionsArg = "";
        regions.forEach( function(region) {
          region.name = trRefName;
          if (region.name && region.start && region.end) {
            if (regionsArg.length == 0) {
              regionsArg += " -p ";
            } else {
              regionsArg += ",";
            }
            regionsArg += region.name + ":" + region.start +  ":" + region.end;
          }
        }); 
        var maxPointsArg = "";
        if (maxPoints) {
          maxPointsArg = " -m " + maxPoints;
        } else {
          maxPointsArg = " -m 0"
        }
        var spanningRegionArg = " -r " + trRefName + ":" + regionStart + ":" + regionEnd;
        var spanningRegion = {name:trRefName, start: regionStart, end: regionEnd};
        var protocol = me.sourceType == "url" ? '&protocol=http' : '';
        var url = encodeURI( me.iobio.coverage + '?encoding=utf8' + protocol + '&cmd= ' + maxPointsArg  + spanningRegionArg + regionsArg + " " + encodeURIComponent(me._getBamRegionsUrl([spanningRegion],true)) );

        var client = BinaryClient(me.iobio.coverage);
        
        var samData = "";
        var samRecs = [];
        var parseByLine = false;
        client.on('open', function(stream){
            var stream = client.createStream({event:'run', params : {'url':url}});

            // New local file streaming
            stream.on('createClientConnection', function(connection) {
              var ended = 0;
              var dataClient = BinaryClient('ws://' + connection.serverAddress);
              dataClient.on('open', function() {
                var dataStream = dataClient.createStream({event:'clientConnected', 'connectionID' : connection.id});
                dataStream.write(me.header.toStr);  
                var theRegions = [spanningRegion];          
                for (var i=0; i < theRegions.length; i++) {
                  var region = theRegions[i];
                   me.convert('sam', region.name, region.start, region.end, function(data,e) {   
                      dataStream.write(data);                   
                      ended += 1;                  
                      if ( theRegions.length == ended) dataStream.end();
                   }, {noHeader:true});               
                }                
              })
            });

            stream.on('data', function(data, options) {
               if (data == undefined) {
                return; 
               } 
             
                samData += data;
            });

            stream.on('end', function() {
                if (samData != "") {
                  var coverage = null;
                  var coverageForPoints = [];
                  var coverageForRegion = [];
                  var lines = samData.split('\n');
                  lines.forEach(function(line) {
                    if (line.indexOf("#specific_points") == 0) {
                      coverage = coverageForPoints;
                    } else if (line.indexOf("#reduced_points") == 0 ) {
                      coverage = coverageForRegion;
                    } else {                      
                      var fields = line.split('\t');
                      var pos = -1;
                      var depth = -1;
                      if (fields[0] != null && fields[0] != '') {
                        var pos   = +fields[0];
                      }
                      if (fields[1] != null && fields[1] != '') {
                        var depth = +fields[1];
                      }
                      if (coverage){
                        if (pos > -1  && depth > -1) {
                          coverage.push([pos, depth]);
                        }
                      }
                    }
                  });
                  callback(coverageForRegion, coverageForPoints);

                } else {
                  callback([]);
                }
            });

            stream.on("error", function(error) {
              console.log("encountered stream error: " + error);
            });

        });
      });
   },


   //
   //
   // NEW
   //
   //
   getFreebayesVariants: function(refName, regionStart, regionEnd, regionStrand, callback) {

    var me = this;
    this.transformRefName(refName, function(trRefName){ 

      var refFile = null;
      // TODO:  This is a workaround until we introduce a genome build dropdown.  For
      // now, we support Grch37 and hg19.  For now, this lame code simply looks at
      // the reference name to determine if the references should be hg19 (starts with 'chr;)
      // or Crch37 (just the number, no 'chr' prefix).  Based on the reference,
      // we point freebayes to a particular directory for the reference files.
      if (trRefName.indexOf('chr') == 0) {
        refFile = "./data/references_hg19/" + trRefName + ".fa";
      } else {
        refFile = "./data/references/hs_ref_chr" + trRefName + ".fa";
      }       
      var urlF = me.iobio.freebayes 
        + "?cmd=-f " + refFile  + " " 
        + encodeURIComponent(me._getBamUrl(trRefName,regionStart,regionEnd));

      var urlV = me.iobio.vt + '?cmd=normalize -r ' + refFile + ' ' + encodeURIComponent(encodeURI(urlF))

      var url = me.iobio.vcflib + '?cmd=vcffilter -f "QUAL > 1" '
                + encodeURIComponent(encodeURI(urlV));

      me._callVariants(trRefName, regionStart, regionEnd, regionStrand, me.iobio.vcflib, encodeURI(url), callback);
    });


   },


    //
   //
   // NEW
   //
   //
   _getBamMergeUrl: function(refName, regionStart, regionEnd) {
    var theBam  = this.bamUri;

    var url = this.iobio.bamMerger + '?binary=true&cmd=' + refName + ':' + regionStart + '-' + regionEnd 
    + " '" 
    + theBam
    + "' ";

    return url;

   },



                 

   //
   //
   // NEW
   //
   //
   _callVariants: function(refName, regionStart, regionEnd, regionStrand, server, url, callback) {
    
    var me = this;
    var client = BinaryClient(server);
  
    var variant = null;
    var stream = null;
    var vcfRecs = [];
    vcfRecs.length = null;

    client.on('open', function(){
      stream = client.createStream({event:'run', params : {'url':url}});

      // New local file streaming
      stream.on('createClientConnection', function(connection) {
        var ended = 0;
        var dataClient = BinaryClient('ws://' + connection.serverAddress);
        dataClient.on('open', function() {
          var dataStream = dataClient.createStream({event:'clientConnected', 'connectionID' : connection.id});
          dataStream.write(me.header.toStr); 
          var regions =  [{'name':refName,'start':regionStart,'end':regionEnd} ];           
          for (var i=0; i < regions.length; i++) {
            var region = regions[i];
             me.convert('sam', region.name, region.start, region.end, function(data,e) {   
                dataStream.write(data);                   
                ended += 1;                  
                if ( regions.length == ended) dataStream.end();
             }, {noHeader:true});               
          }                
        })
      });
      
      //
      // listen for stream data (the output) event. 
      //
      var buf = '';
      stream.on('data', function(data, options) {
        if (data == undefined) {
          return;
        } 
        
        var success = true;
        try {
          buf += data;
        } catch(e) {
          success = false;
        }
        if(success) {
          if (callback) {
          }
        }               
      });

      stream.on('end', function() {
        callback(buf);
      });

      stream.on("error", function(error) {
        console.log("encountered stream error: " + error);
      });
      
    });

   },  


   //
   //
   // NEW
   //
   //
   reducePoints: function(data, factor, xvalue, yvalue) {
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
        var min = 999999;
        var max = 0;
        for (j = 0; j < avgWindow.length; j++) {
            var y = yvalue(avgWindow[j]);
            sum += y != null ? d3.round(y) : 0;

            if (y > max) {
              max = y;
            }
            if (y < min) {
              min = y;
            }
        }
        var average = d3.round(sum / factor);
        results.push([xvalue(data[i]), average])
        sum = 0;
      }
      return results;
   }

 
   
});