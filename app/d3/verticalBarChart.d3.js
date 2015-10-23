 function verticalBarChartD3() {
	var dispatch = d3.dispatch("d3click");

	var svg = null;

	var margin = {top: 10, right: 10, bottom: 10, left: 50},
		width = 200,
		barHeight = 20,
		labelWidth = 100,
		gap = 2,
		defaults = {},

	    xValue = function(d) { return d[0]; },
	    yValue = function(d) { return d[1]; },
	  
	    tooltipText = function(d, i) {
	      return d[0] + ", " + d[1]; 
	    },
  	    x = d3.scale.linear(),
	    y = d3.scale.ordinal();

	var widthPercent = null;
	var heightPercent = null;
	  
	function chart(selection, options) {
		var me = this;
		// merge options and defaults
		options = $.extend(defaults,options);
   
	    selection.each(function(data) {
	        // select the container for the svg
		    var container  = d3.select(this);
	    
		    var height = barHeight * data.length;
			var innerHeight = height - margin.top - margin.bottom;  
			var innerWidth = width - margin.left - margin.right;  
	       
			x = d3.scale.linear()
						 .domain([0, d3.max(data, function(d) { return xValue(d);})])
						 .range([0, innerWidth]);

			
			y = d3.scale.ordinal()
					    .domain(function(d){ return yValue(d) })
					    .rangeBands([0, (barHeight + 2 * gap) * data.length]);


			// Select the svg element, if it exists.
		   	var svgData = container.selectAll("svg").data([0]);


		   	// Create the svg select if it doesn't already exist
			var svg = svgData.enter()
					    .append('svg')
					    .attr('class', 'chart')
					    .attr('width',  margin.left + width + labelWidth + 20)
					    .attr('height', (barHeight + gap * 2) * data.length + 30)
					    .append("g")
					    .attr("transform", "translate(" + margin.left +", " + margin.top + ")");

 		    // def for drop shadow
			// filters go in defs element
			var defs = svg.selectAll("defs");
			if (defs.length == 0 || defs[0].length == 0) {
				defs = svg.append("defs");
				chart.createDropShadowFilter(defs);					    
			}

			svg.selectAll("rect")
				 .data(data)
				 .enter().append("rect")
				 .attr("class", function(d) { 
				 	return d.selected ? "selected" : "";
				 })
				 .attr("x", labelWidth)
				 .attr("y", function(d, i) { 
				 	return i*(barHeight + gap * 2);
				 })
				 .attr("width", function(d) { 
				 	return x(xValue(d)); 
				 })
				 .attr("height", barHeight)
				 .style("filter", function(d,i) {
				 	var shadow = options.shadowOnHover && d.selected;			 		
	 				return shadow ?  "url(#drop-shadow)" : "none";		            	
				 })
				 .on("mouseover", function(d) {       
		            d3.select(this).classed("hover", true);     
		            if (options.shadowOnHover) {
 						d3.select(this).style("filter", "url(#drop-shadow)");		            	
		            }   
		         })
				 .on("mouseout", function(d) {       
		            d3.select(this).classed("hover", false);        
		            if (options.shadowOnHover) {
		            	if (d3.select(this).attr("class").indexOf("selected") < 0) {
	 						d3.select(this).style("filter", "none");		            	
		            	}
		            }   
		         })
		         .on("click", function(d) {
		            var turnOn = d3.select(this).attr("class").indexOf("selected") < 0;
		            d3.select(this).classed("selected", turnOn);

		            d3.select(this).classed("hover", true);     

		            if (options.shadowOnHover) {
 						d3.select(this).style("filter", turnOn ? "url(#drop-shadow)" : "none");		            	
		            }   
		            d.selected = turnOn;
		            
		            dispatch.d3click(d);
		         });

			svg.selectAll("text.score")
				 .data(data)
				 .enter().append("text")
				 .attr("x", function(d) { return x(d.score) +  labelWidth + 10; })
				 .attr("y", function(d, i){ return i*(barHeight + gap * 2) + (barHeight / 2); } )
				 .attr("dx", -5)
				 .attr("dy", ".36em")
				 .attr("text-anchor", "start")
				 .attr('class', 'score')
				 .text(function(d) {return xValue(d)});

			svg.selectAll("text.name")
				 .data(data)
				 .enter().append("text")
				 .attr("x", 0)
				 .attr("y", function(d, i){ return i*(barHeight + gap * 2) + (barHeight / 2);} )
				 .attr("dy", ".36em")
				 .attr("text-anchor", "start")
				 .attr('class', 'name')
				 .text(function(d) {return yValue(d)});	

		});
	}

	chart.createDropShadowFilter = function(defs) {

		// create filter with id #drop-shadow
		// height=130% so that the shadow is not clipped
		var filter = defs.append("filter")
		    .attr("id", "drop-shadow")
		    .attr("height", "150%")
		    .attr("width", "150%");

		// SourceAlpha refers to opacity of graphic that this filter will be applied to
		// convolve that with a Gaussian with standard deviation 3 and store result
		// in blur
		filter.append("feGaussianBlur")
		    .attr("in", "SourceAlpha")
		    .attr("stdDeviation", 3)
		    .attr("result", "blur");

		// translate output of Gaussian blur to the right and downwards with 2px
		// store result in offsetBlur
		filter.append("feOffset")
		    .attr("in", "blur")
		    .attr("dx", 2)
		    .attr("dy", 2)
		    .attr("result", "offsetBlur");

		// overlay original SourceGraphic over translated blurred opacity by using
		// feMerge filter. Order of specifying inputs is important!
		var feMerge = filter.append("feMerge");

		feMerge.append("feMergeNode")
		    .attr("in", "offsetBlur")
		feMerge.append("feMergeNode")
		    .attr("in", "SourceGraphic");
	};

	chart.margin = function(_) {
	    if (!arguments.length) return margin;
	    margin = _;
	    return chart;
	};

	chart.width = function(_) {
	    if (!arguments.length) return width;
	    width = _;
	    return chart;
	};

	chart.barHeight = function(_) {
	    if (!arguments.length) return barHeight;
	    barHeight = _;
	    return chart;
	};

	chart.xValue = function(_) {
	    if (!arguments.length) return xValue;
	    xValue = _;
	    return chart;
	};

	chart.yValue = function(_) {
	    if (!arguments.length) return yValue;
	    yValue = _;
	    return chart;
	};


	chart.gap = function(_) {
	    if (!arguments.length) return gap;
	    gap = _;
	    return chart;
	};

	chart.labelWidth = function(_) {
	    if (!arguments.length) return labelWidth;
	    labelWidth = _;
	    return chart;
	};
	  
	chart.brush = function(_) {
	    if (!arguments.length) return brush;
	    brush = _;
	    return chart; 
	};


	chart.tooltipText = function(_) {
	    if (!arguments.length) return tooltipText;
	    tooltipText = _;
	    return chart;
	};

	// This adds the "on" methods to our custom exports
	d3.rebind(chart, dispatch, "on");

	return chart;
}
