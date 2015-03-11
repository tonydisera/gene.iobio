function featureMatrixD3() {
   var dispatch = d3.dispatch("d3click", "d3mouseover", "d3mouseout", "d3rowup", "d3rowdown");

  // dimensions
  var margin = {top: 10, right: 10, bottom: 10, left: 10};  
  // scales
  var x = d3.scale.ordinal(),
      y = d3.scale.ordinal();

  // color scheme
  var colorScale = null;

  var container = null;

  var tooltipHTML = function(colObject, rowIndex) {
    return "tootip at row " + rowIndex;
  }
 
  // variables 
  var heightPercent = "100%",
      widthPercent = "100%",
      showTransition = true,
      matrixRows = null,
      matrixRowNames = null;
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
      height = matrixRowNames.length * cellSize;   
      height += margin.top + margin.bottom + columnLabelHeight;
      var innerHeight = height - margin.top - margin.bottom - columnLabelHeight;

      width = data.length * cellSize;   
      width += margin.left + margin.right + rowLabelWidth;
      var innerWidth = width - margin.left - margin.right - rowLabelWidth;

      container = d3.select(this);



    
      x.domain(data.map(function(d) {  return d.type + " " + d.start + " " + d.alt + "->" + d.ref }));
      x.rangeRoundBands([0, innerWidth], 0, 0);
 
      y.domain(matrixRowNames);
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
                        .ticks(matrixRowNames.length);
                       
                        
      
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
         .attr("width", width)
         .attr('viewBox', "0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom));



      svg.selectAll("g.group").remove();
      var g =  svg.selectAll("g.group").data([data])
        .enter()
        .append("g")
        .attr("class", "group")
        .attr("transform",  "translate(" + rowLabelWidth + "," + (+columnLabelHeight - cellSize) + ")");


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
      svg.selectAll("g.y").data([matrixRowNames]).enter()
          .append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(1," + columnLabelHeight + ")")
          .call(yAxis)
          .selectAll("text")
          .style("text-anchor", "start")
          .attr("x", "4")
          .attr("dx", ".8em")
          .attr("dy", ".15em");

      // Make up and down buttons more prominent when user mouses over row label.
      /*
      svg.selectAll(".y.axis .tick")
          .on('mouseover', function(d,i) {
            container.selectAll('.y.axis .up').classed("faded", true);
            container.selectAll('.y.axis .down').classed("faded", true);
            d3.select(this).selectAll(".up").classed("faded", i == 0);
            d3.select(this).selectAll(".down").classed("faded", i == matrixRowNames.length - 1);
          });
      */

      // Add the up and down arrows to the x-axis
      svg.selectAll("g.y.axis .tick .up").remove();
      svg.selectAll("g.y.axis .tick")
         .append("g")
         .attr("class", "up faded")
         .attr("transform", "translate(0, -12)")
         .append("polygon")
         .attr("points", "1,8 5,4 9,8")
         .attr("x", "0")
         .attr("y", "0")
         .on("click", function(d,i) {
            // We want to mark the row label that is going to be shifted up
            // or down so that after the matrix is resorted and rewdrawn,
            // the row that the user was moving is highlighted to show the
            // user what row we just shifted up or down..
            matrixRows.forEach( function(matrixRow) {
              matrixRows[i].current = 'N';
            });
            matrixRows[i].current = 'Y';
            container.select(".y.axis").selectAll("text").each( function(d1,i1) {
              if (i1 == i) {
                d3.select(this).classed('current', true);
              } else {
                d3.select(this).classed('current', false);
              }
            });
            // When the user clicks on the 'up' button for a row label,
            // disppatch the event so that the app can shift
            // the rows and re-sort the matrix data.
            dispatch.d3rowup(i);
         })
        .on("mouseover", function(d,i) {
            container.selectAll('.y.axis .up').classed("faded", true);
            container.selectAll('.y.axis .down').classed("faded", true);
            d3.select(this.parentNode).classed("faded", false);
         });



      svg.selectAll("g.y.axis .tick .down").remove();
      svg.selectAll("g.y.axis .tick")
         .append("g")
         .attr("class", "down faded")
         .attr("transform", "translate(10, 8)")
         .append("polygon")
         .attr("points", "1,8 5,4 9,8")
         .attr("x", "0")
         .attr("y", "0")
         .style("transform", "rotate(180deg)")
         .on("click", function(d,i) {
            // We want to mark the row label that is going to be shifted up
            // or down so that after the matrix is resorted and rewdrawn,
            // the row that the user was moving is highlighted to show the
            // user what row we just shifted up or down..
            matrixRows.forEach( function(matrixRow) {
              matrixRow.current = 'N';
            });
            matrixRows[i].current = 'Y';
            container.select(".y.axis").selectAll("text").each( function(d1,i1) {
              if (i1 == i) {
                d3.select(this).classed('current', true);
              } else {
                d3.select(this).classed('current', false);
              }
            });
            // When the user clicks on the 'up' button for a row label,
            // disppatch the event so that the app can shift
            // the rows and re-sort the matrix data.
            dispatch.d3rowdown(i);
         })
         .on("mouseover", function(d,i) {
            container.selectAll('.y.axis .up').classed("faded", true);
            container.selectAll('.y.axis .down').classed("faded", true);
            d3.select(this.parentNode).classed("faded", false);
         });
  
      // Highlight of the last row label that we moved up or down.  Highlight this
      // row label so that user can keep track of the row he just moved.
      svg.selectAll(".y.axis .tick text").each( function(d,i) {
        d3.select(this).classed('current', matrixRows[i].current == 'Y');
      });
      // On the highlight matrix row, don't fade the arrow buttons.
      svg.selectAll(".y.axis .tick .up").each( function(d,i) {
        d3.select(this).classed('faded', matrixRows[i].current != 'Y');
      });
      svg.selectAll(".y.axis .tick .down").each( function(d,i) {
        d3.select(this).classed('faded', matrixRows[i].current != 'Y');
      });

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
            return showTransition ? 0 : cellSize - 1; 
          })
          .attr('y', showTransition ? 0 : y(matrixRowNames[i]) + y.rangeBand())
          .attr('width', cellSize - 1)
          .style('fill', function(d, i) { 
            return (d == '1' ? colorScale[matrixRowNames.length-1-i] : "lightgrey");
          });

      cols.append('rect')
          .attr('class', 'column-box')
          .attr('x', function(d,i) { 
            return 0;
          })
          .attr('height', function(d, i) { 
            return (cellSize * matrixRowNames.length) - 1;
          })
          .attr('y', y(matrixRowNames[0]) + y.rangeBand())
          .attr('width', cellSize - 1);
     
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
            .on("click", function(d, i) {                
              var colObject = d3.select(this.parentNode).datum();
              var colIndex = Math.floor(i / matrixRowNames.length); 
              var rowIndex = d;
              var on = !(d3.select(this.parentNode).select(".column-box").attr("class").indexOf("current") > -1);
              d3.select(this.parentNode).select(".column-box").classed("current", on);
              d3.select(this.parentNode).classed("current", on);
              var textDOM = container.selectAll('.x.axis .tick text')[0][colIndex];
              d3.select(textDOM).classed("current", on);
              dispatch.d3click(colObject, rowIndex);
            });


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
                return  cellSize - 1;
              })
              .attr('y', function(d, i) {             
                return y(matrixRowNames[i]) + y.rangeBand();
              })
              .attr('height', function(d) { 
                return cellSize - 1; 
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

  chart.matrixRows = function(_) {
    if (!arguments.length) return matrixRows;
    matrixRows = _;
    matrixRowNames = matrixRows.map( function(row) {
      return row.name;
    });
    colorScale = colorbrewer.YlGnBu[matrixRows.length+1];
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