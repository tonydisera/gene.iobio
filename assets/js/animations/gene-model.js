(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes
lib.webFontTxtFilters = {}; 

// library properties:
lib.properties = {
	width: 552,
	height: 174,
	fps: 24,
	color: "#000000",
	webfonts: {},
	manifest: []
};



lib.webfontAvailable = function(family) { 
	lib.properties.webfonts[family] = true;
	var txtFilters = lib.webFontTxtFilters && lib.webFontTxtFilters[family] || [];
	for(var f = 0; f < txtFilters.length; ++f) {
		txtFilters[f].updateCache();
	}
};
// symbols:



(lib.Tween2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#A5B941").ss(5,1,1).p("AB4AAIjuCKIgBkTg");
	this.shape.setTransform(74.8,14.5,1,1,90);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#A5B941").s().p("Ah3iJIDvCJIjuCKg");
	this.shape_1.setTransform(74.8,14.5,1,1,90);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#A5B941").ss(10,1,1).p("AAAjMIAAGZ");
	this.shape_2.setTransform(73.9,-6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f().s("#A5B941").ss(5,1,1).p("AB4AAIjuCKIgBkTg");
	this.shape_3.setTransform(192.8,14.5,1,1,90);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#A5B941").s().p("Ah3iJIDvCJIjuCKg");
	this.shape_4.setTransform(192.8,14.5,1,1,90);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("#A5B941").ss(10,1,1).p("AAAjMIAAGZ");
	this.shape_5.setTransform(191.9,-6);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#A5B941").ss(5,1,1).p("AB4AAIjuCKIgBkTg");
	this.shape_6.setTransform(-76.2,14.5,1,1,90);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#A5B941").s().p("Ah3iJIDvCJIjuCKg");
	this.shape_7.setTransform(-76.2,14.5,1,1,90);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("#A5B941").ss(10,1,1).p("AAAjMIAAGZ");
	this.shape_8.setTransform(-77.1,-6);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f().s("#A5B941").ss(5,1,1).p("AB4AAIjuCKIgBkTg");
	this.shape_9.setTransform(-192.8,14.5,1,1,90);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#A5B941").s().p("Ah3iJIDvCJIjuCKg");
	this.shape_10.setTransform(-192.8,14.5,1,1,90);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f().s("#A5B941").ss(10,1,1).p("AAAjMIAAGZ");
	this.shape_11.setTransform(-193.7,-6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-209.1,-31.5,418.3,60.5);


(lib.Tween1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#0099CC").s().p("AgmAxIAAgUQATAJAQAAQAUAAAAgNQAAgEgDgDIgHgGIgNgGQgTgGgHgGQgGgIAAgLQAAgOALgIQALgHARAAQATAAARAHIgHARQgRgGgMAAQgRAAAAAKQAAAEAFAFQAFADAOAGQANAFAGADQAGADADAHQADAFAAAHQAAARgLAIQgMAIgTAAQgWAAgNgGg");
	this.shape.setTransform(25.8,-22.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#0099CC").s().p("AAYA3IAAhBQAAgMgFgHQgFgFgLAAQgMgBgIAJQgGAIAAATIAAA2IgXAAIAAhqIASAAIADANIABAAQAFgHAJgFQAJgDAJAAQAnAAAAAnIAABFg");
	this.shape_1.setTransform(14.6,-22.8);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#0099CC").s().p("AgaAwQgLgGgHgNQgFgNAAgQQAAgZANgPQAOgOAWAAQAYAAANAOQANAPAAAZQAAAagNAOQgOAPgXAAQgOABgMgIgAgUgaQgGAJAAARQAAAlAaAAQAbAAAAglQAAgjgbAAQgNAAgHAJg");
	this.shape_2.setTransform(2.1,-22.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#0099CC").s().p("AAaA2IgagpIgZApIgaAAIAmg2Iglg0IAbAAIAXAlIAZglIAaAAIglA0IAmA2g");
	this.shape_3.setTransform(-9.1,-22.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#0099CC").s().p("AgnBHIAAiNIBPAAIAAAUIg4AAIAAAnIA0AAIAAARIg0AAIAAAtIA4AAIAAAUg");
	this.shape_4.setTransform(-19.8,-24.4);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f().s("#FFFFFF").ss(1,1,1).p("AmtjWINbAAIAAGtItbAAg");
	this.shape_5.setTransform(193.2,19.2,0.267,1);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#0099CC").s().p("AmtDWIAAmrINbAAIAAGrg");
	this.shape_6.setTransform(193.2,19.2,0.267,1);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f().s("#FFFFFF").ss(1,1,1).p("AmtjWINbAAIAAGtItbAAg");
	this.shape_7.setTransform(79.7,19.2,1.093,1);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#0099CC").s().p("AmtDWIAAmrINbAAIAAGrg");
	this.shape_8.setTransform(79.7,19.2,1.093,1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f().s("#FFFFFF").ss(1,1,1).p("AmtjWINbAAIAAGtItbAAg");
	this.shape_9.setTransform(-74.2,19.2,0.535,1);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#0099CC").s().p("AmtDWIAAmrINbAAIAAGrg");
	this.shape_10.setTransform(-74.2,19.2,0.535,1);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f().s("#FFFFFF").ss(1,1,1).p("AmtjWINbAAIAAGtItbAAg");
	this.shape_11.setTransform(-187.7,19.2);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#0099CC").s().p("AmtDWIAAmrINbAAIAAGrg");
	this.shape_12.setTransform(-187.7,19.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-231.7,-40.7,437.5,82.4);


(lib.Symbol1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AggApQgOgPAAgZQAAgZANgQQANgPAVAAQAWAAAMAOQAMAMAAAYIAAAJIhGAAQABAQAIAJQAIAJAMAAQAKAAAIgCIASgHIAAATQgIAEgJACQgJABgLABQgXAAgOgPgAAZgKQAAgOgHgGQgGgHgLAAQgJAAgGAHQgHAHgBANIAvAAIAAAAg");
	this.shape.setTransform(265.4,36.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AAYA3IAAhBQAAgMgFgHQgFgFgLAAQgMgBgHAJQgHAJAAASIAAA2IgXAAIAAhqIASAAIADANIABAAQAFgHAJgEQAJgEAJgBQAnAAAAAoIAABFg");
	this.shape_1.setTransform(253.4,36.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFFFFF").s().p("AggApQgOgPAAgZQAAgZANgQQANgPAVAAQAWAAAMAOQAMAMAAAYIAAAJIhGAAQABAQAIAJQAIAJAMAAQAKAAAIgCIASgHIAAATQgIAEgJACQgJABgLABQgXAAgOgPgAAZgKQAAgOgHgGQgGgHgLAAQgJAAgGAHQgHAHgBANIAvAAIAAAAg");
	this.shape_2.setTransform(241.2,36.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AgoA2QgSgUAAgiQABghATgUQAUgTAhAAQAWAAAUAJIgIATQgRgIgSAAQgVAAgNAPQgNAOAAAXQgBAaAMAOQAMANAVAAQAMAAANgCIAAglIgeAAIAAgSIA0AAIAABFQgNAEgLACQgNACgNAAQgeAAgSgTg");
	this.shape_3.setTransform(228.1,34.9);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#FFFFFF").ss(8.1,1,1).p("EgnMAAAMBOZAAA");
	this.shape_4.setTransform(251,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-4,-4,510,53.9);


// stage content:
(lib.genemodel = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{});

	// arrows
	this.instance = new lib.Tween2("synched",0);
	this.instance.setTransform(280.1,23.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(106).to({_off:false},0).to({y:68.5},41).wait(1));

	// instructions
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#A5B941").s().p("AgmAxIAAgUQATAJAQAAQAUAAAAgNQAAgEgDgDIgHgFIgNgHQgTgGgHgGQgGgIAAgMQAAgNALgIQALgHARgBQATABARAHIgHARQgRgHgMAAQgRABAAAJQAAAGAFADQAFAEAOAGQANAFAGADQAGAEADAGQADAFAAAHQAAARgLAIQgMAJgTAAQgWAAgNgHg");
	this.shape.setTransform(338.9,25.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#A5B941").s().p("AAYA2IAAhAQAAgNgFgGQgFgFgLgBQgNAAgGAJQgHAIAAASIAAA2IgXAAIAAhqIASAAIADAPIACAAQAEgIAJgEQAJgFAJAAQAnAAAAAoIAABEg");
	this.shape_1.setTransform(327.8,25.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#A5B941").s().p("AgZAxQgMgHgGgNQgHgNAAgQQAAgZAOgOQANgPAXgBQAXABAOAPQANAPAAAYQAAAagNAOQgNAQgYAAQgOgBgLgGgAgUgaQgGAKAAAQQAAAlAaAAQAbAAAAglQAAgjgbgBQgNAAgHAKg");
	this.shape_2.setTransform(315.3,25.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#A5B941").s().p("AgKBKIAAhqIAVAAIAABqgAgIgzQgDgEAAgFQAAgHADgDQADgDAFAAQAGAAADADQADADABAHQgBAFgDAEQgDADgGAAQgFAAgDgDg");
	this.shape_3.setTransform(306.4,23.5);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#A5B941").s().p("AgTAgIAAg4IgOAAIAAgLIAPgIIAIgWIAMAAIAAAXIAfAAIAAASIgfAAIAAA4QAAAIAFAEQAEAEAGAAQAJAAAIgDIAAARIgKAEIgMABQgfAAAAgjg");
	this.shape_4.setTransform(299.6,24.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#A5B941").s().p("AgbApQgNgOAAgbQAAgZAOgPQANgPAXAAQARABAOAGIgHASQgPgFgJgBQgaAAAAAkQAAASAHAJQAHAKALAAQAQgBANgHIAAAUQgGADgHACQgHACgKAAQgWAAgNgPg");
	this.shape_5.setTransform(291,25.6);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A5B941").s().p("AglAtQgJgKAAgUIAAhFIAXAAIAABBQAAAMAFAHQAFAGALAAQAMAAAIgIQAGgJAAgTIAAg2IAXAAIAABqIgSAAIgDgNIgCAAQgEAHgJAEQgJAFgJAAQgTgBgLgJg");
	this.shape_6.setTransform(279.5,25.7);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#A5B941").s().p("AggA2IAAhqIASAAIAEAUIABAAQAFgKAGgGQAJgFAKgBIAMABIgDAWQgFgBgFAAQgNAAgHAJQgIAIAAAPIAAA2g");
	this.shape_7.setTransform(269.6,25.5);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#A5B941").s().p("AgTAgIAAg4IgOAAIAAgLIAPgIIAIgWIAMAAIAAAXIAfAAIAAASIgfAAIAAA4QAAAIAFAEQAEAEAGAAQAJAAAIgDIAAARIgKAEIgMABQgfAAAAgjg");
	this.shape_8.setTransform(260.6,24.5);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#A5B941").s().p("AgmAxIAAgUQATAJAQAAQAUAAAAgNQAAgEgDgDIgHgFIgNgHQgTgGgHgGQgGgIAAgMQAAgNALgIQALgHARgBQATABARAHIgHARQgRgHgMAAQgRABAAAJQAAAGAFADQAFAEAOAGQANAFAGADQAGAEADAGQADAFAAAHQAAARgLAIQgMAJgTAAQgWAAgNgHg");
	this.shape_9.setTransform(252,25.6);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#A5B941").s().p("AAYA2IAAhAQAAgNgFgGQgFgFgLgBQgNAAgGAJQgHAIAAASIAAA2IgXAAIAAhqIASAAIADAPIACAAQAEgIAJgEQAJgFAJAAQAnAAAAAoIAABEg");
	this.shape_10.setTransform(240.8,25.5);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#A5B941").s().p("AgKBHIAAiNIAVAAIAACNg");
	this.shape_11.setTransform(231.4,23.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},98).to({state:[{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},49).wait(1));

	// exons
	this.instance_1 = new lib.Tween1("synched",0);
	this.instance_1.setTransform(275.8,-142);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(38).to({_off:false},0).to({y:106},31).to({startPosition:0},78).wait(1));

	// gene
	this.instance_2 = new lib.Symbol1();
	this.instance_2.setTransform(278.4,145.9,1,1,0,0,0,251,22.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(148));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(299.4,206,509.9,53.9);

})(lib = lib||{}, images = images||{}, createjs = createjs||{}, ss = ss||{});
var lib, images, createjs, ss;