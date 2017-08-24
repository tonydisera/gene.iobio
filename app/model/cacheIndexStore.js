function CacheIndexStore() {
	this.db = null;
	this.version = 1;
	this.app = "gene.iobio";
	this.objectStores = {'vcfData': null, 'fbData' : null, 'dangerSummary': null, 'geneCoverage': null};
}

CacheIndexStore.prototype.init = function(callback) {
	var me = this;
	window.indexedStore = {};


	// attempt to open the database
	var open = indexedDB.open(me.app, version);

	// upgrade/create the database if needed
	open.onupgradeneeded = function(event) {
		me.db = open.result;
		for (var dataKind in me.objectStores) {
		  var store = me.db.createObjectStore(dataKind, {keyPath: "id"});
		  var index = store.createIndex("geneIndex", "gene", {unique: false});
		}
	};

	open.onsuccess = function(ev) {
		// assign the database for access outside
		me.db = open.result;
		if (callback) {
			callback();
		}
	};
}

CacheIndexStore.prototype.setData = function(dataKind, key, gene, data, callback) {
	var me = this;

	var tx        = me.db.transaction(dataKind, "readwrite");
    var store     = tx.objectStore(dataKind);
	tx.oncomplete = callback;	
    
	store.put({id: key, gene: gene, data: data});
}

CacheIndexStore.prototype.getData = function(dataKind, key, callback) {
	var me = this;

 	var tx        = me.db.transaction(dataKind, "readonly");
    var store     = tx.objectStore(dataKind);
    
    var getData = store.get(key);

    getData.onsuccess = function() {
    	if (callback) {
    		callback(getData.result);
    	}
    };

}

CacheIndexStore.prototype.removeData = function(dataKind, key, callback) {
	var me = this;

 	var tx        = me.db.transaction(dataKind, "readonly");
    var store     = tx.objectStore(dataKind);
    var delData   = store.delete(key);

	delData.onsuccess = function(event) {
		if (callback) {
			callback(true);
		}
	}

}

CacheIndexStore.prototype.getDataByGene = function(dataKind, gene, callback) {

	var me = this;

 	var tx         = me.db.transaction(dataKind, "readonly");
    var store      = tx.objectStore(dataKind);
    var index      = store.index("geneIndex");

    var getData    = index.getAll(gene);

    getData.onsuccess = function() {
    	if (callback) {
    		callback(getData.result);
    	}
    };

}

CacheIndexStore.prototype.getKeys = function(dataKind, callback) {
	var me = this;
	var keys = [];

	var tx         = me.db.transaction(dataKind, "readonly");
    var store      = tx.objectStore(dataKind);

	var getKeys = store.getAllKeys();


    getKeys.onsuccess = function() {
    	if (callback) {
    		callback(getKeys.result);
    	}
    };
}

CacheIndexStore.prototype.getAllKeys = function(callback) {
	var me = this;
	var allKeys = [];
	var count = 0;

	for (var dataKind in me.objectStores) {
		var tx         = me.db.transaction(dataKind, "readonly");
	    var store      = tx.objectStore(dataKind);

		var getKeys = store.getAllKeys();


	    getKeys.onsuccess = function() {
	    	allKeys = allKeys.concat(keys);
	    	count++;
	    	if (count == Object.keys(me.objectStores) {
		    	if (callback) {
		    		callback(getKeys.result);
		    	}
	    	})
	    };
	}
}

CacheIndexStore.prototype.showContents = function(dataKind, callback) {
	var me = this;
	var cacheEntries = [];

	var tx         = me.db.transaction(dataKind, "readonly");
    var store      = tx.objectStore(dataKind);

	var openCursor = store.openCursor();
	openCursor.onsuccess = function(ev) {
	  var cursor = openCursor.result;
	  if (cursor) {
	  	cacheEntries.push(cursor.value);
	  	cursor["continue"]();
	  } else {
	  	if (callback) {
	  		callback(cacheEntries);
	  	}
	  }	 
	};	
}