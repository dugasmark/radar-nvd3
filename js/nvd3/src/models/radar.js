nv.models.radar = function() {

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------
    
    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , width = 500
        , height = 500
        , color = nv.utils.defaultColor() // a function that returns a color
        , getValue = function(d) { return d.value } // accessor to get the x value from a data point
        , size = 5
        , scales = d3.scale.linear()
        , radius
        , max = 5
        , startAngle = 0
        , cursor = 0
        , clipEdge = false
        ;
    
    var line = d3.svg.line()
        .x(function(d) { return d.x})
		.y(function(d) { return d.y});

    var  scatter = nv.models.scatter()
        .size(16) // default size
        .sizeDomain([16,256])
    ;

  //============================================================


  //============================================================
  // Private Variables
  //------------------------------------------------------------


  //============================================================


  function chart(selection) {
    selection.each(function(data) {
        
        var availableWidth = width - margin.left - margin.right,
            availableHeight = height - margin.top - margin.bottom,
            container = d3.select(this)
            ;

       // max = max || d3.max(data, getValue) > 0 ? d3.max(data, getValue) : 1

        scales.domain([0, max]).range([0,radius]);

        var current = 0;
        if (cursor < 0) {
            current = Math.abs(cursor);  
        }
        else if (cursor > 0) {
             current = size - cursor;
        }


        //------------------------------------------------------------
        // Setup Scales

        data = data.map(function(serie, i) {
            serie.values = serie.values.map(function(value, j) {
                value.x = calculateX(value.value, j, size);
                value.y = calculateY(value.value, j, size);
                value.serie = i;
                value.focus = (current == j) ? true : false;
                return value;
            });
            return serie;
        });

        //------------------------------------------------------------

        

        //------------------------------------------------------------
        // Setup containers and skeleton of chart

        var wrap = container.selectAll('g.nv-wrap.nv-radar').data([data]);
        var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-radar');
        var defsEnter = wrapEnter.append('defs');
        var gEnter = wrapEnter.append('g');
        var g = wrap.select('g')
        
        gEnter.append('g').attr('class', 'nv-groups');
        gEnter.append('g').attr('class', 'nv-scatterWrap');

        
       // wrap.attr('transform', 'translate(' + radius + ',' + radius + ')');

        //------------------------------------------------------------

        // Points
        scatter
            .xScale(scales)
            .yScale(scales)
            .zScale(scales)
            .color(color)
            .width(availableWidth)
            .height(availableHeight);

        var scatterWrap = wrap.select('.nv-scatterWrap');
        //.datum(data); // Data automatically trickles down from the wrap

        d3.transition(scatterWrap).call(scatter);

        defsEnter.append('clipPath')
            .attr('id', 'nv-edge-clip-' + scatter.id())
            .append('rect');
        
        wrap.select('#nv-edge-clip-' + scatter.id() + ' rect')
            .attr('width', availableWidth)
            .attr('height', availableHeight);
        
        g.attr('clip-path', clipEdge ? 'url(#nv-edge-clip-' + scatter.id() + ')' : '');
        scatterWrap
            .attr('clip-path', clipEdge ? 'url(#nv-edge-clip-' + scatter.id() + ')' : '');


        // Series
        var groups = wrap.select('.nv-groups').selectAll('.nv-group').data(function(d) { return d }, function(d) { return d.key });
        groups.enter().append('g')
            .style('stroke-opacity', 1e-6)
            .style('fill-opacity', 1e-6);
        d3.transition(groups.exit())
            .style('stroke-opacity', 1e-6)
            .style('fill-opacity', 1e-6)
            .remove();
        groups
            .attr('class', function(d,i) { return 'nv-group nv-series-' + i })
            .style('fill', function(d,i){ return color(d,i); })
            .style('stroke', function(d,i){ return color(d,i); });
        d3.transition(groups)
            .style('stroke-opacity', 1)
            .style('fill-opacity', .5);
        
        var lineRadar = groups.selectAll('path.nv-line').data(function(d) { return [d.values] });
        
        lineRadar.enter().append('path')
            .attr('class', 'nv-line')
            .attr('d', line );
    
    
        d3.transition(lineRadar.exit())
            .attr('d', line)
            .remove();
            
        lineRadar
            .style('fill', function(d){ return color(d,d[0].serie); })
            .style('stroke', function(d,i,j){ return color(d,d[0].serie); })  
          
        d3.transition(lineRadar)
            .attr('d', line );
    
                

    });

    return chart;
  }

    // compute an angle
    function angle(i, length) {
        return i * (2 * Math.PI / length ) + ((2 * Math.PI)  * startAngle / 360) + (cursor*2*Math.PI)/length;
    }

    // x-caclulator
    // d is the datapoint, i is the index, length is the length of the data
    function calculateX(d, i, length) {
        var l = scales(d);
        return Math.sin(angle(i, length)) * l;
    }

    // y-calculator
    function calculateY(d, i, length) {
        var l = scales(d);
        return Math.cos(angle(i, length)) * l;
    }


    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = scatter.dispatch;
    chart.scatter = scatter;

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
        margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
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
    
    chart.size = function(_) {
        if (!arguments.length) return size;
        size = _;
        return chart;
    };
    
    chart.scales = function(_) {
        if (!arguments.length) return scales;
        scales = _;
        return chart;
    };
 
    chart.max = function(_) {
        if (!arguments.length) return max;
        max = _;
        return chart;
    };
    
    chart.radius = function(_) {
        if (!arguments.length) return radius;
        radius = _;
        return chart;
    };
    
    chart.color = function(_) {
        if (!arguments.length) return color;
        color = nv.utils.getColor(_);
        return chart;
    };
    
    chart.startAngle = function(_) {
        if (!arguments.length) return startAngle;
        startAngle = _;
        return chart;
    };
    
    chart.cursor = function(_) {
        if (!arguments.length) return cursor;
        cursor = _;
        return chart;
    };
    
  //============================================================


  return chart;
}
