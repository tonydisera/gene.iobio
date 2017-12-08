function EndpointCmd(useSSL, IOBIOServiceNames, launchTimestamp, genomeBuildHelper, getHumanRefNamesFunc) {
  this.useSSL            = useSSL;
  this.IOBIO             = IOBIOServiceNames;
  this.launchTimestamp   = launchTimestamp;
  this.genomeBuildHelper = genomeBuildHelper;
  this.getHumanRefNames  = getHumanRefNamesFunc;

}


EndpointCmd.prototype.getVcfHeader = function(vcfUrl, tbiUrl) {
  var me = this;
  var args = ['-H', '"'+vcfUrl+'"'];
  if (tbiUrl) {
    args.push('"'+tbiUrl+'"');
  }
  var cmd = new iobio.cmd(
        me.IOBIO.tabix,
        args,
        {ssl: me.useSSL}
  );
  return cmd;
}

EndpointCmd.prototype.getVcfDepth = function(vcfUrl, tbiUrl) {
  var me = this;
  var args = ['-i'];
  if (tbiUrl) {
    args.push('"'+tbiUrl+'"');
  } else {
    args.push('"'+vcfUrl + '.tbi'+'"');
  }

  var cmd = new iobio.cmd(
      me.IOBIO.vcfReadDepther,
      args,
      {ssl: me.useSSL}
  );
  return cmd;
}

EndpointCmd.prototype.annotateVariants = function(vcfSource, refName, regions, vcfSampleNames, annotationEngine, isRefSeq, hgvsNotation, getRsId, vepAF, useServerCache, serverCacheKey) {
  var me = this;

  // Figure out the file location of the reference seq files
  var regionParm = "";
  if (regions && regions.length > 0) {
    regions.forEach(function(region) {
      if (regionParm.length > 0) {
        regionParm += " ";
      }
      regionParm += region.name + ":" + region.start + "-" + region.end;
    })
  }

  var contigStr = "";
  me.getHumanRefNames(refName).split(" ").forEach(function(ref) {
      contigStr += "##contig=<ID=" + ref + ">\n";
  })
  var contigNameFile = new Blob([contigStr])


  // Create an iobio command get get the variants and add any header recs.
  var args = [];
  var cmd = null;
  if (vcfSource.hasOwnProperty('vcfUrl')) {
    //  If we have a vcf URL, use tabix to get the variants for the region
    var args = ['-h', '"'+vcfSource.vcfUrl+'"', regionParm];
    if (vcfSource.tbiUrl) {
      args.push('"'+vcfSource.tbiUrl+'"');
    }
    cmd = new iobio.cmd(me.IOBIO.tabix, args, {ssl: me.useSSL})
                   .pipe(me.IOBIO.bcftools, ['annotate', '-h', contigNameFile, '-'], {ssl: me.useSSL})

  } else if (vcfSource.hasOwnProperty('writeStream')) {
    // If we have a local vcf file, use the writeStream function to stream in the vcf records
    cmd = new iobio.cmd(me.IOBIO.bcftools, ['annotate', '-h', contigNameFile, vcfSource.writeStream], {ssl: me.useSSL})
  } else {
    console.log("EndpointCmd.annotateVariants() vcfSource arg is not invalid.");
    return null;
  }


  if (vcfSampleNames && vcfSampleNames.length > 0) {
    var sampleNameFile = new Blob([vcfSampleNames.split(",").join("\n")])
    cmd = cmd.pipe(me.IOBIO.vt, ["subset", "-s", sampleNameFile, '-'], {ssl: me.useSSL})
  }

  // normalize variants

  var refFastaFile = me.genomeBuildHelper.getFastaPath(refName);
  cmd = cmd.pipe(me.IOBIO.vt, ["normalize", "-n", "-r", refFastaFile, '-'], {ssl: me.useSSL})

  // if af not retreived from vep, get allele frequencies from 1000G and ExAC in af service
  cmd = cmd.pipe(me.IOBIO.af, ["-b", me.genomeBuildHelper.getCurrentBuildName()], {ssl: me.useSSL});

  // Skip snpEff if RefSeq transcript set or we are just annotating with the vep engine
  if (annotationEngine == 'none') {
    // skip annotation if annotationEngine set to  'none'


  } else if (isRefSeq || annotationEngine == 'vep') {
    // VEP
    var vepArgs = [];
    vepArgs.push(" --assembly");
    vepArgs.push(me.genomeBuildHelper.getCurrentBuildName());
    vepArgs.push(" --format vcf");
    vepArgs.push(" --allele_number");
    if (vepAF) {
      vepArgs.push("--af");
      vepArgs.push("--af_gnomad");
      vepArgs.push("--af_esp");
      vepArgs.push("--af_1kg");
      vepArgs.push("--max_af");
    }
    if (isRefSeq) {
      vepArgs.push("--refseq");
    }
    // Get the hgvs notation and the rsid since we won't be able to easily get it one demand
    // since we won't have the original vcf records as input
    if (hgvsNotation) {
      vepArgs.push("--hgvs");
    }
    if (getRsId) {
      vepArgs.push("--check_existing");
    }
    if (hgvsNotation || getRsId || isRefSeq) {
      vepArgs.push("--fasta");
      vepArgs.push(refFastaFile);
    }

    //
    //  SERVER SIDE CACHING
    //
    var cacheKey = null;
    var urlParameters = {};
    if (useServerCache && serverCacheKey.length > 0) {
        urlParameters.cache = serverCacheKey;
        urlParameters.partialCache = true;
        cmd = cmd.pipe("nv-dev-new.iobio.io/vep/", vepArgs, {ssl: me.useSSL, urlparams: urlParameters});
    } else {
        cmd = cmd.pipe(me.IOBIO.vep, vepArgs, {ssl: me.useSSL, urlparams: urlParameters});
    }

  } else if (annotationEngine == 'snpeff') {
      cmd = cmd.pipe(me.IOBIO.snpEff, [], {ssl: me.useSSL});
  }
  return cmd;

}

EndpointCmd.prototype.normalizeVariants = function(vcfUrl, tbiUrl, refName, regions) {
  var me = this;

  var refFastaFile = me.genomeBuildHelper.getFastaPath(refName);

  var regionParm = "";
  regions.forEach(function(region) {
    if (regionParm.length > 0) {
      regionParm += " ";
    }
    regionParm += region.refName + ":" + region.start + "-" + region.end;
  })

  var args = ['-h', vcfUrl, regionParm];
  if (tbiUrl) {
    args.push(tbiUrl);
  }

  var contigStr = "";
  me.getHumanRefNames(refName).split(" ").forEach(function(ref) {
      contigStr += "##contig=<ID=" + ref + ">\n";
  })
  var contigNameFile = new Blob([contigStr])

  var cmd = new iobio.cmd(me.IOBIO.tabix, args, {ssl: me.useSSL})
                     .pipe(me.IOBIO.bcftools, ['annotate', '-h', contigNameFile, '-'], {ssl: me.useSSL})

  // normalize variants
  cmd = cmd.pipe(me.IOBIO.vt, ["normalize", "-n", "-r", refFastaFile, '-'], {ssl: me.useSSL})

  return cmd;
}

EndpointCmd.prototype.getClinvarCountsForGene = function(clinvarUrl, refName, geneObject, binLength, regions) {
  var me = this;
  var regionParm = refName + ":" + geneObject.start + "-" + geneObject.end;

  // For the knownVariants service, pass in an argument for the gene region, then pass in eith
  // the length of the bin region or a comma separate string of region parts (e.g. the exons)
  var knownVariantsArgs = [];
  knownVariantsArgs.push("-r");
  knownVariantsArgs.push(regionParm);
  if (binLength) {
    knownVariantsArgs.push("-b");
    knownVariantsArgs.push(binLength);
  } else if (regions) {
    var regionParts = "";
    regions.forEach( function(region) {
      if (regionParts.length > 0) {
        regionParts += ",";
      }
      regionParts += region.start + "-" + region.end;
    })
    if (regionParts.length > 0) {
      knownVariantsArgs.push("-p");
      knownVariantsArgs.push(regionParts);
    }
  }
  knownVariantsArgs.push("-");


  // Create an iobio command get get the variants and add any header recs.
  var tabixArgs = ['-h', clinvarUrl, regionParm];

  var cmd = new iobio.cmd (me.IOBIO.tabix,         tabixArgs,         {ssl: me.useSSL})
                     .pipe(me.IOBIO.knownvariants, knownVariantsArgs, {ssl: false});

  return cmd;
}


