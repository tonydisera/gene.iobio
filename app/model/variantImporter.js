function VariantImporter() {

}

VariantImporter.parseRecordsCSV = function(data) {
	var recCount = 0;
	var fieldNames = [];
	var importRecords = [];
	data.split(/[\r\n]+/g).forEach( function(rec) {
		/*
		  Validate a CSV string having single, double or un-quoted values.
			^                                   # Anchor to start of string.
			\s*                                 # Allow whitespace before value.
			(?:                                 # Group for value alternatives.
			  '[^'\\]*(?:\\[\S\s][^'\\]*)*'     # Either Single quoted string,
			| "[^"\\]*(?:\\[\S\s][^"\\]*)*"     # or Double quoted string,
			| [^,'"\s\\]*(?:\s+[^,'"\s\\]+)*    # or Non-comma, non-quote stuff.
			)                                   # End group of value alternatives.
			\s*                                 # Allow whitespace after value.
			(?:                                 # Zero or more additional values
			  ,                                 # Values separated by a comma.
			  \s*                               # Allow whitespace before value.
			  (?:                               # Group for value alternatives.
			    '[^'\\]*(?:\\[\S\s][^'\\]*)*'   # Either Single quoted string,
			  | "[^"\\]*(?:\\[\S\s][^"\\]*)*"   # or Double quoted string,
			  | [^,'"\s\\]*(?:\s+[^,'"\s\\]+)*  # or Non-comma, non-quote stuff.
			  )                                 # End group of value alternatives.
			  \s*                               # Allow whitespace after value.
			)*                                  # Zero or more additional values
			$                                   # Anchor to end of string.
		*/
		var regexp = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g
		var match = regexp.exec(rec);

		var importRec = {};
		var idx = 0;
		while (match != null) {
		  // matched text: match[0]
		  // match start: match.index
		  // capturing group n: match[n]
		  if (recCount == 0) {
		  	fieldNames.push(match[2]);
		  } else {
		  	importRec[fieldNames[idx]] = match[2];
		  }
		  match = regexp.exec(rec);
		  idx++;
		}
		if (recCount > 0 && Object.keys(importRec).length > 0) {
			importRecords.push(importRec);
		}
		recCount++;
	});
	return importRecords;	
}
