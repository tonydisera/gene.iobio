function featureMatrixD3() {
   var dispatch = d3.dispatch("d3click", "d3mouseover", "d3mouseout");

  // dimensions
  var margin = {top: 10, right: 10, bottom: 10, left: 10};  
  // scales
  var x = d3.scale.ordinal(),
      y = d3.scale.ordinal();

  // color scheme
  var colorScale = d3.scale.category20();   

  var tooltipHTML = function(colObject, rowIndex) {
    return "tootip at row " + rowIndex;
  }
 
  // variables 
  var heightPercent = "100%",
      widthPercent = "100%",
      showTransition = true,
      columnNames = null,
      cellSize = 10,
      rowLabelWidth = 100,
      columnLabelHeight = 100;
      
  //  options
  var defaults = {};

      
  function chart(selection, options) {
    // merge options and defaults
    options = $.extend(defaults,options);

    selection.each(function(data) {
      // Calculate height of matrix
      height = columnNames.length * cellSize;   
      height += margin.top + margin.bottom + columnLabelHeight;
      var innerHeight = height - margin.top - margin.bottom - columnLabelHeight;

      width = data.length * cellSize;   
      width += margin.left + margin.right + rowLabelWidth;
      var innerWidth = width - margin.left - margin.right - rowLabelWidth;

      var container = d3.select(this);



    
      x.domain(data.map(function(d) {  return d.type + " " + d.start + " " + d.alt + "->" + d.ref }));
      x.rangeRoundBands([0, innerWidth], 0, 0);
 
      y.domain(columnNames);
      y.rangeRoundBands([0, innerHeight], 0, 0);

    
      // axis
      var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("start")
                        .outerTickSize(0)   
                        .ticks(data.length);
                       

      var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .outerTickSize(0)   
                        .ticks(matrixColumns.length);
                       
                        
      
      // Select the svg element, if it exists.
      var svg = container.selectAll("svg").data([0]);

      svg.enter()
        .append("svg")
        .attr("width", width)
        .attr("height", heightPercent)
        .attr('viewBox', "0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom))
        .attr("preserveAspectRatio", "xMinYMid meet");

      // The chart dimensions could change after instantiation, so update viewbox dimensions
      // every time we draw the chart.
      d3.select(this).selectAll("svg")
         .attr('viewBox', "0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom));

      var g =  svg.selectAll("g.group").data([data]).enter()
        .append("g")
        .attr("class", "group")
        .attr("transform",  "translate(" + rowLabelWidth + "," + (+columnLabelHeight - 20) + ")")
     

      // Create the X-axis at the top.  This will show the labels for the columns 
      svg.selectAll(".x.axis").remove();    
      svg.selectAll("g.x").data([data]).enter()
          .append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(" + (+rowLabelWidth + d3.round(cellSize/2)) + "," + columnLabelHeight + ")")
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "start")
          .attr("dx", ".8em")
          .attr("dy", ".15em")
          .attr("transform", function(d) {
            return "rotate(-65)" ;
          }); 

      // Create the y-axis at the top.  This will show the labels for the rows 
      svg.selectAll(".y.axis").remove();    
      svg.selectAll("g.y").data([matrixColumns]).enter()
          .append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(0," + columnLabelHeight + ")")
          .call(yAxis)
          .selectAll("text")
          .style("text-anchor", "start")
          .attr("dx", ".8em")
          .attr("dy", ".15em");
                       
      
      // Hide the ticks and the path of the x-axis, we are just interested
      // in the text
      svg.selectAll("g.x.axis .tick line").classed("hide", true);
      svg.selectAll("g.x.axis path").classed("hide", true);
      svg.selectAll("g.y.axis .tick line").classed("hide", true);
      svg.selectAll("g.y.axis path").classed("hide", true);
          

      // add tooltip div
      var tooltip = container.selectAll(".tooltip").data([0])
        .enter().append('div')
          .attr("class", "tooltip")               
          .style("opacity", 0);




      // Generate the cols
      var cols = g.selectAll('.col').data(data);
      cols.enter().append('g')
          .attr('class', 'col')
          .attr('transform', function(d,i) { 
            return "translate(" + (x.rangeBand() * (i+1)) + ",0)";
          });
      

      // Generate cells
      cols.selectAll('.cell').data(function(d) { 
        return d['features'];
      }).enter().append('rect')
          .attr('class', function(d) { return "cell" + (d == '1' ? " on" : ""); })          
          .attr('x', function(d,i) { 
            return 0;
          })
          .attr('height', function(d, i) { 
            return showTransition ? 0 : cellSize;; 
          })
          .attr('y', showTransition ? 0 : y(columnNames[i]) + y.rangeBand())
          .attr('width', cellSize)
          .style('fill', function(d, i) { 
            return (d == '1' ? colorScale(i) : "lightgrey");
          });

    

     
      g.selectAll('.cell')
           .on("mouseover", function(d) {  
              var tooltip = container.select('.tooltip');
              tooltip.transition()        
                 .duration(1000)      
                 .style("opacity", .9);  

              var colObject = d3.select(this.parentNode).datum();
              var rowIndex = d;

              tooltip.html(tooltipHTML(colObject, rowIndex));

              var h = tooltip[0][0].offsetHeight;
              var w = tooltip[0][0].offsetWidth;

              tooltip.style("left", (d3.event.pageX - w) + "px") 
                     .style("text-align", 'left')    
                     .style("top", (d3.event.pageY - h) + "px");   
              
              dispatch.d3mouseover(colObject, rowIndex ); 
            })                  
           .on("mouseout", function(d) {       
              container.select('.tooltip').transition()        
                 .duration(500)      
                 .style("opacity", 0);   
              dispatch.d3mouseout(); 
            })
            .on("click", function(d) {                
              var colObject = d3.select(this.parentNode).datum();
              var rowIndex = d;
              dispatch.d3click(colObject, rowIndex);
            });

      // exit
      cols.exit().remove();

      // update 
      if (showTransition) {
        cols.transition()
            .duration(1000)
            .attr('transform', function(d,i) { 
                return "translate(" + (x.rangeBand() * (i+1)) + ",0)";
            });


        cols.selectAll('.cell')
              .transition()        
              .duration(1000)
              .attr('x', function(d,i) { 
                return 0;
              })
              .attr('width', function(d) { 
                return cellSize;
              })
              .attr('y', function(d, i) {             
                return y(columnNames[i]) + y.rangeBand();
              })
              .attr('height', function(d) { 
                return cellSize; 
              });


 
      }
    });

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

  chart.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return chart;
  };
    
  chart.xAxis = function(_) {
    if (!arguments.length) return xAxis;
    xAxis = _;
    return chart; 
  };

  chart.yAxis = function(_) {
    if (!arguments.length) return yAxis;
    yAxis = _;
    return chart; 
  };  


  chart.showTransition = function(_) {
    if (!arguments.length) return showTransition;
    showTransition = _;
    return chart;
  }

  chart.columnNames = function(_) {
    if (!arguments.length) return columnNames;
    columnNames = _;
    return chart;
  }

  chart.cellSize = function(_) {
    if (!arguments.length) return cellSize;
    cellSize = _;
    return chart;
  }
  chart.rowLabelWidth = function(_) {
    if (!arguments.length) return rowLabelWidth;
    rowLabelWidth = _;
    return chart;
  }
  chart.columnLabelHeight = function(_) {
    if (!arguments.length) return columnLabelHeight;
    columnLabelHeight = _;
    return chart;
  }
  chart.tooltipHTML = function(_) {
    if (!arguments.length) return tooltipHTML;
    tooltipHTML = _;
    return chart;
  }


  
  // This adds the "on" methods to our custom exports
  d3.rebind(chart, dispatch, "on");

  return chart;
}