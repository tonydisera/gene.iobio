function GenericAnnotation() {
	var me = this;
	me.descriptor = {
		AVIA3: {
			'GENE':              { hide: true},
			'STRAND':            { hide: true},	

			'EXAC':              { hide:  true},

			'EXAC_AF':           { label: 'ExAC'},
			'EXAC_AF.AC_ALL':    { label: 'Allele Count All'},
			'EXAC_AF.AC_AFR':    { label: 'Allele Count AFR'},
			'EXAC_AF.AC_AMR':    { label: 'Allele Count AMR'},
			'EXAC_AF.AC_ASJ':    { label: 'Allele Count AJS'},
			'EXAC_AF.AC_EAS':    { label: 'Allele Count EAS'},
			'EXAC_AF.AC_FIN':    { label: 'Allele Count FIN'},
			'EXAC_AF.AC_NFE':    { label: 'Allele Count NFE'},
			'EXAC_AF.AC_OTH':    { label: 'Allele Count OTH'},
			'EXAC_AF.AC_SAS':    { label: 'Allele Count SAS'},
			'EXAC_AF.AC_FEMALE': { label: 'Allele Count Female'},
			'EXAC_AF.AC_MALE':   { label: 'Allele Count Male'},
			'EXAC_AF.AC_Adj':    { label: 'Allele Count Adj'},

			'EXAC_AF.AN_ALL':    { label: 'Allele Number All'},
			'EXAC_AF.AN_AFR':    { label: 'Allele Number AFR'},
			'EXAC_AF.AN_AMR':    { label: 'Allele Number AMR'},
			'EXAC_AF.AN_ASJ':    { label: 'Allele Number AJS'},
			'EXAC_AF.AN_EAS':    { label: 'Allele Number EAS'},
			'EXAC_AF.AN_FIN':    { label: 'Allele Number FIN'},
			'EXAC_AF.AN_NFE':    { label: 'Allele Number NFE'},
			'EXAC_AF.AN_OTH':    { label: 'Allele Number OTH'},
			'EXAC_AF.AN_SAS':    { label: 'Allele Number SAS'},
			'EXAC_AF.AN_FEMALE': { label: 'Allele Number Female'},
			'EXAC_AF.AN_MALE':   { label: 'Allele Number Male'},
			'EXAC_AF.AN_Adj':    { label: 'Allele Number Adj'},		

			'EXAC_AF.AF_ALL':    { label: 'Allele Freq All'},
			'EXAC_AF.AF_AFR':    { label: 'Allele Freq AFR'},
			'EXAC_AF.AF_AMR':    { label: 'Allele Freq AMR'},
			'EXAC_AF.AF_ASJ':    { label: 'Allele Freq AJS'},
			'EXAC_AF.AF_EAS':    { label: 'Allele Freq EAS'},
			'EXAC_AF.AF_FIN':    { label: 'Allele Freq FIN'},
			'EXAC_AF.AF_NFE':    { label: 'Allele Freq NFE'},
			'EXAC_AF.AF_OTH':    { label: 'Allele Freq OTH'},
			'EXAC_AF.AF_SAS':    { label: 'Allele Freq SAS'},
			'EXAC_AF.AF_FEMALE': { label: 'Allele Freq Female'},
			'EXAC_AF.AF_MALE':   { label: 'Allele Freq Male'},
			'EXAC_AF.AF_Adj':    { label: 'Allele Freq Adj'},		


			'GNOMAD_EXOME':                  { label: 'gnomAD Exome'},
			'GNOMAD_EXOME.gnomAD_exome_ALL': {
				label: 		'AF All', 
				type:       'number',
				filter:     'range',
				valueMap: [ 
                   {min:    0,   max: +0,     value: +2,  badge: false,  clazz:  'afgnomad_unique',     symbolFunction: matrixCard.showAfSymbol},
                   {min:    0,   max: +.0001, value: +3,  badge: false,  clazz:  'afgnomad_uberrare',   symbolFunction: matrixCard.showAfSymbol},
                   {min:    0,   max: +.001,  value: +4,  badge: false,  clazz:  'afgnomad_superrare',  symbolFunction: matrixCard.showAfSymbol},
                   {min:    0,   max: +.01,   value: +5,  badge: false,  clazz:  'afgnomad_rare',       symbolFunction: matrixCard.showAfSymbol},
                   {min:    0,   max: +.05,   value: +6,  badge: false,  clazz:  'afgnomad_uncommon',   symbolFunction: matrixCard.showAfSymbol},
                   {min: +.05,   max: +1,     value: +7,  badge: false,  clazz:  'afgnomad_common',     symbolFunction: matrixCard.showAfSymbol}
                ]
			},
			'GNOMAD_EXOME.gnomAD_exome_AFR': { label: 'Allele Freq AFR'},
			'GNOMAD_EXOME.gnomAD_exome_AMR': { label: 'Allele Freq AMR'},
			'GNOMAD_EXOME.gnomAD_exome_ASJ': { label: 'Allele Freq AJS'},
			'GNOMAD_EXOME.gnomAD_exome_EAS': { label: 'Allele Freq EAS'},
			'GNOMAD_EXOME.gnomAD_exome_FIN': { label: 'Allele Freq FIN'},
			'GNOMAD_EXOME.gnomAD_exome_NFE': { label: 'Allele Freq NFE'},
			'GNOMAD_EXOME.gnomAD_exome_OTH': { label: 'Allele Freq OTH'},
			'GNOMAD_EXOME.gnomAD_exome_SAS': { label: 'Allele Freq SAS'},

			'MT':                            { label: 'Mutation taster'},
			'MT:KEY': {
				label: 		'Mutation taster', 
				type:       'category',
				filter:     'category',
				valueMap:   {
                        'disease causing automatic': {value: 1,    badge: false, clazz: 'mt_disease_causing_auto', symbolFunction: this.showMTSymbol},
                        'disease causing':           {value: 2,    badge: false, clazz: 'mt_disease_causing',      symbolFunction: this.showMTSymbol},
		                'polymorphism automatic':    {value: 3,    badge: false, clazz: 'mt_polymorphism_auto',    symbolFunction: this.showMTSymbol},
		                'polymorphism':              {value: 102,  badge: false, clazz: 'mt_polymorphism',         symbolFunction: this.showMTSymbol},
                        none:                        {value: 103,  badge: false, clazz: ''}
                     }            
			},
			'MT:VALUE':  {
				label: 		'Mutation taster score', 
				type:       'number',
				filter:     'range'
			}
		} 
	}

	me.descriptor.AVIA3['GNOMAD_EXOME.gnomAD_exome_ALL'].matrixRow = 
	{ 
		name:      'Allele Frequency - gnomAD', 
	    id:        'af-gnomad',        
	    order:     13,
	    index:     13, 
	    match:     'range', 
	    attribute: 'otherAnnots.AVI3.GNOMAD_EXOME.gnomAD_exome_ALL',      
	    map:       me.descriptor.AVIA3['GNOMAD_EXOME.gnomAD_exome_ALL'].valueMap
	}
	me.descriptor.AVIA3['MT:KEY'].matrixRow = 
	{ 
		name:      'Mutation taster', 
	    id:        'mt',        
	    order:     14,
	    index:     14, 
	    match:     'exact', 
	    attribute: 'otherAnnots.AVI3.MT',      
	    map:       me.descriptor.AVIA3['MT:KEY'].valueMap
	}         	
}

GenericAnnotation.prototype.formatContent = function(variant, clazzMap, EMPTY_VALUE) {
	var me = this;
	var annotDiv = "";
	if (variant.otherAnnots && Object.keys(variant.otherAnnots).length > 0) {
		annotDiv = '<div class="' + clazzMap.container + '">';
		for (var annotator in variant.otherAnnots) {
			annotDiv += '<div class="' + clazzMap.row + '" style="text-align:center">' + annotator + '</div>';
			for (var fieldName in variant.otherAnnots[annotator]) {

				if (me.shouldShow(annotator, [fieldName])) {
					var annotValue = variant.otherAnnots[annotator][fieldName];
					var label = me.getLabel(annotator, [fieldName]);

					// Loop through value map to create tag/value subfields
					var tagValues = null;
					if (annotValue instanceof Object) {
						tagValues = "";
						for (var tag in annotValue) {
							if (tagValues.length > 0) {
								tagValues += "<br>"
							}
							if (me.shouldShow(annotator,  [fieldName, tag])) {
								var sublabel = me.getLabel(annotator, [fieldName, tag]);
								tagValues += sublabel + ": " + annotValue[tag];								
							}
						}
					}

					
					annotDiv += me._formatContentRow(label, (tagValues ? tagValues : annotValue), clazzMap, EMPTY_VALUE);

				}


			}
		}
	}	
	return annotDiv;
}

GenericAnnotation.prototype._formatContentRow = function(label, value, clazzMap, EMPTY_VALUE) {
	if (value == "") {
		value = EMPTY_VALUE;
	}
	return '<div class="'  + clazzMap.row + '">'
	      + '<div class="' + clazzMap.label + '" style="text-align:right">' + label + '</div>'
	      + '<div class="' + clazzMap.value + '">' + value + '</div>'
	      + '</div>';
}

GenericAnnotation.prototype.shouldShow = function(annotator, fieldPath) {
	var me = this;
	var theDescriptor = me.descriptor[annotator];

	var hide = false;
	if (theDescriptor) {
		var key = fieldPath.join(".");
		if (theDescriptor[key] && theDescriptor[key].hide) {
			hide = theDescriptor[key].hide;
		}
		
	} 

	return !hide;
}

GenericAnnotation.prototype.getLabel = function(annotator, fieldPath) {
	var me = this;
	var theDescriptor = me.descriptor[annotator];


	var label = null;
	if (theDescriptor) {
		var key = fieldPath.join(".");
		if (theDescriptor[key] && theDescriptor[key].label) {
			label = theDescriptor[key].label
		}
		
	} 

	return label ? label : fieldPath[fieldPath.length-1];
}