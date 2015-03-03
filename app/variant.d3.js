function variantD3() {
   var dispatch = d3.dispatch("d3brush", "d3rendered", "d3mouseover", "d3mouseout");

  // dimensions
  var margin = {top: 30, right: 0, bottom: 20, left: 110},
      width = 800,
      height = 100;  
  // scales
  var x = d3.scale.linear(),
      y = d3.scale.linear();
  // axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(tickFormatter);
  // variables 
  var borderRadius = 1,
      variantHeight = 10,
      regionStart = undefined,
      regionEnd = undefined,
      showXAxis = false,
      heightPercent = "100%",
      widthPercent = "100%",
      showBrush = false,
      brushHeight = null,
      verticalLayers = 1,
      verticalPadding = 4,
      showTransition = true,
      lowestWidth = 3,
      dividerLevel = null;

  //  options
  var defaults = {};

  var tooltipHTML = function(variant) {
    return (variant.type + ': ' 
          + variant.start 
          + (variant.end > variant.start+1 ?  ' - ' + variant.end : ""));
  }

  var clazz = function (d) { 
    var impacts = "";
    var colorimpacts = "";
    var effects = "";
    for (key in d.impact) {
      impacts += " " + key;
      colorimpacts += " " + 'impact_'+key;
    }
    for (key in d.effectCategory) {
      effects += " " + key;
    }
    return  'variant ' + d.type.toLowerCase() + impacts + effects + colorimpacts;
  };

  function getSymbol(d,i) {
     if (d.type.toUpperCase() == 'DEL') {
        return 'triangle-up';
     } else if (d.type.toUpperCase() == 'INS') {
        return  'circle';
     } else if (d.type.toUpperCase() == 'COMPLEX') {
        return 'diamond';
     }
  }
      
      
  function chart(selection, options) {
    // merge options and defaults
    options = $.extend(defaults,options);

    // Recalculate the height based on the number of vertical layers
    // Not sure why, but we have to bump up the layers by one; otherwise,
    // y will be negative for first layer
    height = verticalLayers * (variantHeight + verticalPadding);  
    //height += (variantHeight + verticalPadding);  
    // Account for the margin when we are showing the xAxis
    if (showXAxis) {
      //height += margin.bottom; 
    }
    if (dividerLevel) {
      height += (variantHeight + verticalPadding);  
    }
    var dividerY = dividerLevel ? height - ((dividerLevel + 1) * (variantHeight + verticalPadding)) : null;
    
    
    // determine inner height (w/o margins)
    var innerHeight = height - margin.top - margin.bottom;

    selection.each(function(data) {
       // set svg element
       var container = d3.select(this).classed('ibo-variant', true);      

      // Update the x-scale.
      // Update the x-scale.
      if (regionStart && regionEnd) {
        x.domain([regionStart, regionEnd]);
      }  else {
        x.domain([ d3.min(data, function(d) { 
                       return d3.min(d.features, function(f) { 
                        return parseInt(f.start); 
                      }) 
                     }),
                     d3.max(data, function(d) { 
                       return d3.max(d.features, function(f) { 
                        return parseInt(f.end); 
                      }) 
                     }) 
                  ]);
    
      }
      x.range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      y  .domain([0, data.length]);
      y  .range([innerHeight , 0]);

      // Find out the smallest interval between variants on the x-axis
      // for each level. For a single nucleotide variant, what is 
      // the standard width we would like to show given the minimum 
      // distance between all variants.  
      // TODO:  Need to use this as a factor for increasing
      // width of multi-base variants.
      minWidth = 6;   
      // For each level
      for (var l = 0; l < verticalLayers; l++) {
        // For each row in array (per variant set; only one variant set)
        var minInterval = null;
        data.forEach( function(d) {
          // For each variant.  Calculate the distance on the screen
          // between the 2 variants.
          for (var i = 0; i < d.features.length - 1; i++) {
            if (d.features[i].level == l) {
              // find the next feature at the same level
              var nextPos = null;
              for (var next = i+1; next < d.features.length; next++) {
                if (d.features[next].level == l) {
                  nextPos = next;
                  break;
                }
              }
              if (nextPos) {
                var interval = Math.round(x(d.features[nextPos].start) - x(d.features[i].end));
                interval = Math.max(interval, 1);
                if (minInterval == null || interval < minInterval) {
                  minInterval = interval;
                }
              } else {
                // We couldn't find a second position at the same
                // level
              }
            }
          }
          // Once we know the smallest interval for a level, compare it
          // so that we can keep track of the smallest between all levels.
          // This will determine the width of a snp.        
          if ( minInterval != null && minInterval < minWidth) {
            minWidth = minInterval;
          }

        });
      }

      // TODO:  Come up with a better pileup algorithm to ensure
      // there is at least one pixel between each variant.  This
      // works if the variant can be 1 pixel width, but we really want
      // to signify a square for snps.  For now, try out
      // a rectangle with a min width of 3.
      minWidth = Math.max(minWidth, lowestWidth);

      var symbolScale = d3.scale.linear()
                    .domain([1,6])
                    .range([15,25]);

      var symbolSize = symbolScale(minWidth);
     

      // Brush
      var brush = d3.svg.brush()
        .x(x)
        .on("brushend", function() {
            dispatch.d3brush(brush);
         });


      // Select the svg element, if it exists.
      var svg = container.selectAll("svg").data([0]);

      svg.enter()
        .append("svg")
        .attr("width", widthPercent)
        .attr("height", heightPercent)
        .attr('viewBox', "0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom))
        .attr("preserveAspectRatio", "xMinYMid meet");

      // The chart dimensions could change after instantiation, so update viewbox dimensions
      // every time we draw the chart.
      d3.select(this).selectAll("svg")
         .attr('viewBox', "0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom));


      // Create the X-axis.   
      var g = svg;
      svg.selectAll(".x.axis").remove();    
      if (showXAxis) {
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (y.range()[0] + margin.bottom) + ")");    
      } 

      // Create dividing line
      svg.selectAll(".divider").remove();
      if (dividerLevel) {
        var divider = svg.append("g")
                         .attr("class", "divider")
                         .attr("transform", "translate(0," + dividerY + ")");
        divider.append("line").attr("class", "dashed")
                              .attr("x1", 0)
                              .attr("x2", width)
                              .attr("y",  0);
        divider.append("text").attr("x", width / 2)
                              .attr("y", 20)
                              .text("Heterozygous");
        divider.append("text").attr("x", width / 2)
                              .attr("y", -10)
                              .text("Homozygous");

      }

      
      
      // add tooltip div
      var tooltip = container.selectAll(".tooltip").data([0])
        .enter().append('div')
          .attr("class", "tooltip")               
          .style("opacity", 0);

      
      // Update the inner dimensions.
      g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Start variant model
      // add elements
      var track = g.selectAll('.track.snp').data(data);
      track.enter().append('g')
          .attr('class', 'track snp')
          .attr('transform', function(d,i) { return "translate(0," + y(i+1) + ")"});
      
      var trackindel = g.selectAll('.track.indel').data(data);
      trackindel.enter().append('g')
          .attr('class', 'track indel')
          .attr('transform', function(d,i) { return "translate(0," + y(i+1) + ")"});


      if (showBrush) {
        if (brushHeight == null ) {
          brushHeight = variantHeight;
          brushY = 0;
        } else {
          brushY = 0;
        }
        track.selectAll("g.x.brush").data([0]).enter().append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", brushY)
            .attr("height", brushHeight);
      }    
      

      track.selectAll('.variant').remove();
      trackindel.selectAll('.variant').remove();


      // snps
      track.selectAll('.variant').data(function(d) { 
        return d['features'].filter( function(d) { return d.type.toUpperCase() == 'SNP'; }) ;
      }).enter().append('rect')
          .attr('class', function(d) { return clazz(d); })          
          .attr('rx', borderRadius)
          .attr('ry', borderRadius)
          .attr('x', function(d) { 
            return Math.round(x(d.start));
          })
          .attr('width', function(d) { 
            return showTransition ? 0 : Math.max(Math.round(x(d.end) - x(d.start)), minWidth);
          })
          .attr('y', 0)
          .attr('height', variantHeight);

     
      // insertions and deletions
      trackindel.selectAll('.variant').data(function(d) { 
        var indels = d['features'].filter( function(d){ 
          return d.type.toUpperCase() == 'DEL' 
              || d.type.toUpperCase() == 'INS' 
              || d.type.toUpperCase() == 'COMPLEX'; 
        });
        return indels;
      }).enter().append('path')
          .attr("d", function(d,i) {
            return d3.svg
                     .symbol()
                     .type( getSymbol(d,i) )
                     .size(symbolSize)();
          })
          .attr('class', function(d) { return clazz(d); })    
          .attr("transform", function(d) { 
            var xCoord = x(d.start);
            var yCoord = showTransition ? 0 : height - ((d.level + 1) * (variantHeight + verticalPadding));
            var tx = "translate(" + xCoord + "," + yCoord + ")"; 
            return tx;
           });



      

      g.selectAll('.variant')
           .on("mouseover", function(d) {  
              var tooltip = container.select('.tooltip');
              tooltip.transition()        
                     .duration(1000)      
                     .style("opacity", .9);  
              
              tooltip.html(tooltipHTML(d));

              var h = tooltip[0][0].offsetHeight;
              var w = tooltip[0][0].offsetWidth;

              if (d3.event.pageX < w) {
                w = 0;
              }

              tooltip.style("left", (d3.event.pageX - w) + "px") 
                     .style("text-align", 'left')    
                     .style("top", (d3.event.pageY - h) + "px");   
              
              dispatch.d3mouseover(d); 
            })                  
           .on("mouseout", function(d) {       
              container.select('.tooltip').transition()        
                 .duration(500)      
                 .style("opacity", 0);   
              dispatch.d3mouseout(); 
            });           





      // exit
      track.exit().remove();
      trackindel.exit().remove();

      // update 
      if (showTransition) {
        track.transition()
            .duration(1000)
            .attr('transform', function(d,i) { return "translate(0," + y(i+1) + ")"});


        track.selectAll('.variant.snp').sort(function(a,b){ return parseInt(a.start) - parseInt(b.start)})
            .transition()        
              .duration(1000)
              .attr('x', function(d) { 
                return d3.round(x(d.start));
              })
              .attr('width', function(d) { 
                return Math.max(Math.round(x(d.end) - x(d.start)), minWidth);
              })
              .attr('y', function(d) {             
                return height - ((d.level + 1) * (variantHeight + verticalPadding));
              })
              .attr('height', function(d) { 
                return variantHeight; 
              });

        trackindel.selectAll('.variant.del')
            .transition()  
              .duration(1000) 
              .attr("d", function(d,i) {
                return d3.svg
                     .symbol()
                     .type(getSymbol(d,i))
                     .size(symbolSize)();
              }) 
              .attr("transform", function(d) { 
                  var xCoord = x(d.start);
                  var yCoord = height - ((d.level + 1) * (variantHeight + verticalPadding));
                  var tx = "translate(" + xCoord + "," + yCoord + ")"; 
                  return tx;
              });

        trackindel.selectAll('.variant.ins')
            .transition()                 
              .duration(1000)  
              .attr("d", function(d,i) {
                return d3.svg
                     .symbol()
                     .type(getSymbol(d,i))
                     .size(symbolSize)();
              })
              .attr("transform", function(d) { 
                  var xCoord = x(d.start);
                  var yCoord = height - ((d.level + 1) * (variantHeight + verticalPadding));
                  var tx = "translate(" + xCoord + "," + yCoord + ")"; 
                  return tx;
              });

          trackindel.selectAll('.variant.complex')
            .transition()                 
              .duration(1000)  
              .attr("d", function(d,i) {
                return d3.svg
                     .symbol()
                     .type(getSymbol(d,i))
                     .size(symbolSize)();
              })
              .attr("transform", function(d) { 
                  var xCoord = x(d.start);
                  var yCoord = height - ((d.level + 1) * (variantHeight + verticalPadding));
                  var tx = "translate(" + xCoord + "," + yCoord + ")"; 
                  return tx;
              });                 
       

      } 




      // Generate the x axis
      if (showXAxis) {
        svg.select(".x.axis").transition()
            .duration(200)
            .call(xAxis);       
      }

      
      dispatch.d3rendered();
 
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


  chart.variantHeight = function(_) {
    if (!arguments.length) return variantHeight;
    variantHeight = _;
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

  chart.showXAxis = function(_) {
    if (!arguments.length) return showXAxis;
    showXAxis = _;
    return chart; 
  };

   chart.showBrush = function(_) {
    if (!arguments.length) return showBrush;
    showBrush = _;
    return chart;
  }

  chart.brushHeight = function(_) {
    if (!arguments.length) return brushHeight;
    brushHeight = _;
    return chart;
  }

  chart.verticalLayers = function(_) {
    if (!arguments.length) return verticalLayers;
    verticalLayers = _;
    return chart;
  }

  chart.verticalPadding = function(_) {
    if (!arguments.length) return verticalPadding;
    verticalPadding = _;
    return chart;
  }


  chart.showTransition = function(_) {
    if (!arguments.length) return showTransition;
    showTransition = _;
    return chart;
  }

   chart.clazz = function(_) {
    if (!arguments.length) return clazz;
    clazz = _;
    return chart;
  }

  chart.lowestWidth = function(_) {
    if (!arguments.length) return lowestWidth;
    lowestWidth = _;
    return chart;
  }

  chart.dividerLevel = function(_) {
    if (!arguments.length) return dividerLevel;
    dividerLevel = _;
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