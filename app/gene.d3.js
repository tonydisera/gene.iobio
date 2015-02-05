// TODO ADD PROJECT INFO
// consumes data in following format
// var data = [ {name: 'somename',
//              features : [{start:someInt, end:someInt, feature_type:utr, strand:'+'},
//                          {start:someInt, end:someInt, feature_type:cds}, ...]
//            }, ... ]
//

function geneD3() {
  // defaults

  // dispatch events
  var dispatch = d3.dispatch("d3brush", "d3selected");

  var selectedTranscript = null;


  // dimensions
  var margin = {top: 30, right: 0, bottom: 20, left: 110},
      width = 800,
      height = 400;  
  // scales
  var x = d3.scale.linear(),
      y = d3.scale.linear();
  // axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(tickFormatter);
  // variables 
  var trackHeight = 20,
      borderRadius = 1,
      utrHeight = undefined,
      cdsHeight = undefined,
      arrowHeight = undefined,
      regionStart = undefined,
      regionEnd = undefined,
      showXAxis = true,
      widthPercent = null,
      heightPercent = null,
      showBrush = false,
      showLabel = false;
      

  //  options
  var defaults = {};
      
      
  function chart(selection, options) {
    // merge options and defaults
    options = $.extend(defaults,options);
    // set variables if not user set
    cdsHeight = cdsHeight || trackHeight;
    utrHeight = utrHeight || cdsHeight / 2;
    arrowHeight = arrowHeight || trackHeight / 2;


    selection.each(function(data) {

       // calculate height
       height = data.length * (trackHeight + arrowHeight);

       // determine inner height (w/o margins)
       var innerHeight = height - margin.top - margin.bottom;

       // set svg element
       var container = d3.select(this).classed('ibo-gene', true);      

      // Update the x-scale.
      if (regionStart && regionEnd) {
        x.domain([regionStart, regionEnd]);
      } else {
        x.domain([ d3.min(data, function(d) { 
                     return d3.min(d.features, function(f) { return parseInt(f.start); }) 
                   }),
                   d3.max(data, function(d) { 
                     return d3.max(d.features, function(f) { return parseInt(f.end); }) 
                   }) 
                ]);

      }
      x  .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      y  .domain([0, data.length]);
      y  .range([innerHeight , 0]);


      // Select the svg element, if it exists.
      var svg = container.selectAll("svg").data([0]);

      var brushAllowance = showBrush ? 20 : 0;

      svg.enter()
        .append("svg")
        .attr("width", widthPercent ? widthPercent : width)
        .attr("height", heightPercent ? heightPercent : height+margin.top+margin.bottom+brushAllowance);

      // The chart dimensions could change after instantiation, so update viewbox dimensions
      // every time we draw the chart.
      if (widthPercent && heightPercent) {
        d3.select(this).selectAll("svg")
          .attr('viewBox', "0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom+brushAllowance))
          .attr("preserveAspectRatio", "xMaxYMid meet");
      } 

      d3.select(this).selectAll("svg")
        .attr("width", widthPercent ? widthPercent : width)
        .attr("height", heightPercent ? heightPercent : height+margin.top+margin.bottom+brushAllowance);



      // Otherwise, create the skeletal chart.      
      var gEnter = svg.selectAll("g").data([0]).enter().append('g');    

      var g = svg.select('g');
      // Update the inner dimensions.
      g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.selectAll("line.brush-line").remove();

      // Brush
      var brush = d3.svg.brush()
        .x(x)
        .on("brushend", function() {
            var extentRect = d3.select("g.x.brush rect.extent");
            
            var xExtent = +extentRect.attr("x") + (+extentRect.attr("width") / 2);
            var heightExtent = +extentRect.attr("height") - 10;

            g.selectAll("line.brush-line").remove();

            if (!brush.empty()) {
              g.append('line')
                .attr('class', 'brush-line')
                .attr('x1', xExtent)
                .attr('x2', xExtent)          
                .attr('y1', heightExtent -20)
                .attr('y2', heightExtent -10);

               g.append('line')
                .attr('class', 'brush-line')
                .attr('x1', 80 )
                .attr('x2',  width - margin.left - margin.right - 80)          
                .attr('y1', heightExtent - 10)
                .attr('y2', heightExtent - 10);

            }

            dispatch.d3brush(brush);
         });



      var axisEnter = svg.selectAll("g.x.axis").data([0]).enter().append('g');   
      if (showXAxis) {
        axisEnter.attr("class", "x axis")
                 .attr("transform",   "translate(" + margin.left + "," + "0" + ")");
        svg.selectAll("g.x.axis").attr("transform",   "translate(" + margin.left + "," + "0" + ")");
      }  


      if (showBrush) {
        var brushHeight = height + 30;
        var brushY = -30;
        g.selectAll("g.x.brush").remove();
        g.selectAll("g.x.brush").data([0]).enter().append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", brushY)
            .attr("height", brushHeight);
           
        }    

      // add tooltip div
      var tooltip = container.selectAll(".tooltip").data([0])
        .enter().append('div')
          .attr("class", "tooltip")               
          .style("opacity", 0);

               
      // Start gene model
      // add elements
      var transcript = g.selectAll('.transcript').data(data);
      transcript.enter().append('g')
          .attr('class', 'transcript')
          .attr('transform', function(d,i) { return "translate(0," + y(i+1) + ")"});
      

      transcript.selectAll(".reference").remove();
      transcript.selectAll('.reference').data(function(d) { return [[d.start, d.end]] })
        .enter().append('line')
          .attr('class', 'reference')
          .attr('x1', function(d) { return d3.round(x(d[0]))})
          .attr('x2', function(d) { return d3.round(x(d[1]))})                    
          .attr('y1', trackHeight/2)
          .attr('y2', trackHeight/2);



      transcript.selectAll(".name").remove();
      if (showLabel) {
        transcript.selectAll('.name').data(function(d) { return [[d.start, d.transcript_id]] })
                  .enter().append('text')
                    .attr('class', 'name')
                    .attr('x', function(d) { return margin.left > 5 ?  5 - margin.left : 0 })
                    .attr('y', 0 )
                    .attr('text-anchor', 'top')
                    .attr('alignment-baseline', 'left')
                    .text(function(d) { return d[1]; })
                    .style('fill-opacity', 0)
                    .on("mouseover", function(d) {
                      d3.select(this).style("font-style", "bold");
                      d3.select(this.parentNode).attr("class", "transcript selected");
                      selectedTranscript = d3.select(this.parentNode)[0][0].__data__;
                    })
                    .on("mouseout", function(d) {
                      d3.select(this).style("font-style", "regular");
                      d3.select(this.parentNode).attr("class", "transcript");
                    });

      }
      
      transcript.selectAll(".arrow").remove();
      transcript.selectAll('.arrow').data(centerSpan)
        .enter().append('path')
          .attr('class', 'arrow')
          .attr('d', centerArrow);      
      
      transcript.selectAll('.utr').data(function(d) { 
        return d['features'].filter( function(d) { var ft = d.feature_type.toLowerCase(); return ft == 'utr' || ft == 'cds';}) 
      }).enter().append('rect')
          .attr('class', function(d) { return d.feature_type.toLowerCase();})          
          .attr('rx', borderRadius)
          .attr('ry', borderRadius)
          .attr('x', function(d) { return d3.round(x(d.start))})
          .attr('width', function(d) { return d3.round(x(d.end) - x(d.start))})
          .attr('y', trackHeight /2)
          .attr('height', 0)
          .on("mouseover", function(d) {  
              var tooltip = container.select('.tooltip');
              tooltip.transition()        
                 .duration(200)      
                 .style("opacity", .9);      
              tooltip.html(d.feature_type + ': ' + d.start + ' - ' + d.end)                                 
                 .style("left", (d3.event.pageX) + "px") 
                 .style("text-align", 'left')    
                 .style("top", (d3.event.pageY - 24) + "px");    
                 })                  
           .on("mouseout", function(d) {       
              container.select('.tooltip').transition()        
                 .duration(500)      
                 .style("opacity", 0);   
           });           

      // exit
      transcript.exit().remove();

      // update 
      transcript.transition()
          .duration(700)
          .attr('transform', function(d,i) { return "translate(0," + y(i+1) + ")"});

      transcript.selectAll('.reference').transition()
        .duration(700)
        .attr('x1', function(d) { return x(d[0])})
        .attr('x2', function(d) { return x(d[1])});

      transcript.selectAll('.arrow').transition()
        .duration(700)
        .attr('d', centerArrow);

      transcript.selectAll('.name').transition()
        .duration(700)
        .attr('x', function(d) { return margin.left > 5 ?  5 - margin.left : 0; })
        .attr('y', function(d) { return margin.left > 5 ? trackHeight : -10; })   
        .text(function(d) { return d[1]; })                
        .style('fill-opacity', 1);

      transcript.selectAll('.utr,.cds').sort(function(a,b){ return parseInt(a.start) - parseInt(b.start)})
        .transition()        
          .duration(700)
          .attr('x', function(d) { return d3.round(x(d.start))})
          .attr('width', function(d) { return d3.round(x(d.end) - x(d.start))})
          .attr('y', function(d) { 
            if(d.feature_type.toLowerCase() =='utr') return (trackHeight - utrHeight)/2; 
            else return (trackHeight - cdsHeight)/2; })
          .attr('height', function(d) { 
            if(d.feature_type.toLowerCase() =='utr') return utrHeight; 
            else return cdsHeight; });          

      // Update the x-axis.
      svg.select(".x.axis").transition()
          .duration(200)
          .call(xAxis);  
        
    });

  }
  // moves selection to front of svg
  function moveToFront(selection) {
    return selection.each(function(){
       this.parentNode.appendChild(this);
    });
  }

  // updates the hash with the center of the biggest span between features
  function centerSpan(d) {    
    var span = 0;
    var center = 0;
    var sorted = d.features
      .filter(function(f) { var ft = f.feature_type.toLowerCase(); return ft == 'utr' || ft == 'cds'})
      .sort(function(a,b) { return parseInt(a.start) - parseInt(b.start)});

    for (var i=0; i < sorted.length-1; i++) {
      var currSpan = parseInt(sorted[i+1].start) - parseInt(sorted[i].end);
      if (span < currSpan) {
        span = currSpan;
        center = parseInt(sorted[i].end) + span/2;
      }
    }      
    d.center = center;
    return [d]; 
  }

  // generates the arrow path
  function centerArrow(d) {
    var arrowHead = parseInt(d.strand + '5');
    var pathStr = "M ";            
    pathStr += x(d.center) + ' ' + (trackHeight - arrowHeight)/2;
    pathStr += ' L ' + parseInt(x(d.center)+arrowHead) + ' ' + trackHeight/2;
    pathStr += ' L ' + x(d.center) + ' ' + parseInt(trackHeight + arrowHeight)/2;
    return pathStr;
  }

  function tickFormatter (d,i) {

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
  chart.trackHeight = function(_) {
    if (!arguments.length) return trackHeight;
    trackHeight = _;
    return chart;
  };

  chart.utrHeight = function(_) {
    if (!arguments.length) return utrHeight;
    utrHeight = _;
    return chart;
  };

  chart.cdsHeight = function(_) {
    if (!arguments.length) return cdsHeight;
    cdsHeight = _;
    return chart;
  };

  chart.arrowHeight = function(_) {
    if (!arguments.length) return arrowHeight;
    arrowHeight = _;
    return chart;
  };

  chart.showXAxis = function(_) {
    if (!arguments.length) return showXAxis;
    showXAxis = _;
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

  chart.showBrush = function(_) {
    if (!arguments.length) return showBrush;
    showBrush = _;
    return chart;
  }

  chart.selectedTranscript = function(_) {
    if (!arguments.length) return selectedTranscript;
    selectedTranscript = _;
    return chart;
  }

  chart.showLabel = function(_) {
    if (!arguments.length) return showLabel;
    showLabel = _;
    return chart;
  }
  // This adds the "on" methods to our custom exports
  d3.rebind(chart, dispatch, "on");

  return chart;
}