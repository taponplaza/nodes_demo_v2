$(document).ready(function () {
  // Initialize the Socket.IO client
  var socket = io.connect();
  var data = [];
    
  var margin = {top: 20, right: 80, bottom: 100, left: 40};

  var svg = d3.select("svg"),
  width = +svg.attr("width") - margin.left - margin.right;
  height = +svg.attr("height") - margin.top - margin.bottom;
  
  var parseTime = d3.timeParse("%H:%M:%S");
  
  var x = d3.scaleTime()
      .range([0, width]);
  var y = d3.scaleSqrt()
      .range([height, 0]);
  
  var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat(d3.timeFormat("%H:%M:%S"))
  
  var yAxisLeft = d3.axisLeft()
      .scale(y)
  
  var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });
  
  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);
  
  var main = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    main.append("path")
        .datum(data)
        .attr("clip-path", "url(#clip)")
        .attr("class", "line line")
        .attr("d", line);
  
    main.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
  
    main.append("g")
        .attr("class", "y axis axisLeft")
        .call(yAxisLeft)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperatura");
  
  function Update(Newdata) {
   //Appending some data to simulate an update event...
      data.push(Newdata);
        
      //Redefine axes
      x.domain([data[0].date, data[data.length - 1].date]);
      y.domain(d3.extent(data, function(d) { return d.value; }));
  
      //Redefine paths
      line = d3.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.value); });
  
      var trans_dur = 250; //define the length of the transitions (in ms)
  
      //Update and animate changes
      main.selectAll("path.line.line").datum(data).transition().duration(trans_dur)
          .attr("d", line);
  
      main.selectAll("g.x.axis").transition().duration(trans_dur)
          .call(xAxis);
  
      main.selectAll("g.y.axis.axisLeft").transition().duration(trans_dur)
          .call(yAxisLeft);      
  }

  // Listen for data updates from the server
  socket.on("updateSensorData", function (msg) {
      console.log("Received sensorData :: " + msg.date + " :: " + msg.value);
      msg.date = parseTime(msg.date);
      Update(msg);
  });
});