function regionD3() {
   
  // dimensions
  var margin = {top: 0, right: 0, bottom: 20, left: 110},
      width = 800,
      height = 100;  
  // scales
  var x = d3.scale.linear();
  // axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(tickFormatter);
  // variables 
  var borderRadius = 1,
      regionStart = undefined,
      regionEnd = undefined,
      heightPercent = "100%",
      widthPercent = "100%";

  //  options
  var defaults = {};
      
      
  function chart(selection, options) {
    // merge options and defaults
    options = $.extend(defaults,options);
    
    // determine inner height (w/o margins)
    var innerHeight = height - margin.top - margin.bottom;

    selection.each(function(data) {

      // set svg element
      var container = d3.select(this).classed('ibo-region', true);      
      x.domain([regionStart, regionEnd]);
      x.range([0, width - margin.left - margin.right]);

      // Select the svg element, if it exists.
      var svg = container.selectAll("svg").data([0]);

      svg.enter()
        .append("svg")
        .attr("width", widthPercent)
        .attr("height", heightPercent)
        .attr('viewBox', "0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom))
        .attr("preserveAspectRatio", "xMaxYMid meet");

      // The chart dimensions could change after instantiation, so update viewbox dimensions
      // every time we draw the chart.
      d3.select(this).selectAll("svg")
         .attr('viewBox', "0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom));


      // Create the X-axis.   
      var g = svg;
      svg.selectAll(".x.axis").remove();    
      svg.append("g").attr("class", "x axis").attr("transform", "translate(0,0)");    

      

      svg.select(".x.axis").transition()
          .duration(200)
          .call(xAxis);       

    });

  }
 
  function tickFormatter (d) {
    if ((d / 1000000) >= 1)
      d = d / 1000000 + "M";
    else if ((d / 1000) >= 1)
      d = d / 1000 + "K";
    return d;            
  }

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

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.widthPercent = function(_) {
    if (!arguments.length) return widthPercent;
    widthPercent = _;
    return chart;
  };

  chart.heightPercent = function(_) {
    if (!arguments.length) return heightPercent;
    heightPercent = _;
    return chart;
  };
  
  chart.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return chart;
  };
    
  chart.xAxis = function(_) {
    if (!arguments.length) return xAxis;
    xAxis = _;
    return chart; 
  };


  chart.regionStart = function(_) {
    if (!arguments.length) return regionStart;
    regionStart = _;
    return chart;
  };
  chart.regionEnd = function(_) {
    if (!arguments.length) return regionEnd;
    regionEnd = _;
    return chart;
  };


  return chart;
}