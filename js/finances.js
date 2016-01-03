
  var transactions = {};
  var outflows = 0;

  Papa.parse('/finances/transactions-2.csv', {
    delimeter: ',',
    download: true,
    header: true,
    skipEmptyLines: true,
  	complete: function(results) {
      parseResults(results);
    }
  });

  function parseResults(results) {
    $.each(results.data, function(i, el) {

      var curr_time = new Date(el.Date).getTime()
      var start_time = new Date('2015/10/01').getTime();

      // Only get transactions past the start time
      if (curr_time >= start_time) {  
      
        // Split the date to use for the cat array key
        var split = el.Date.split('/');
        var month = split[0];
        var curr_date = split[2] + '/' + month + '/01'
      
        // initialize categories array for this date if doesn't exit
        if (typeof transactions[curr_date] == 'undefined') {
          transactions[curr_date] = {
            categories: {},
            outflow: 0,
            inflow: 0
          }
        }
      
        // Get total outflows
        if (el.Outflow != "$0.00") { // is outflow
          var cat = el[ 'Sub Category' ];
        
          // Leave these categories out
          if (cat != 'Venture Card' && cat != "Available this month" && cat != "Rent" && cat != "") {
            var value = Number(el.Outflow.replace(/[^0-9\.]+/g,""))
        
            // If category isn't already in categories array, add it
            if (typeof transactions[curr_date].categories[cat] == 'undefined') {
              transactions[curr_date].categories[cat] = {
                value: value
              }
            } else {          
              transactions[curr_date].categories[cat] = {
                value: transactions[curr_date].categories[cat].value += value
              }
            }
          
            transactions[curr_date]['inflow'] += value;
          }
        }
      
        // Get total outflows
        if (el.Inflow != "$0.00") { // is outflow
          var cat = el[ 'Sub Category' ];
        
          if (cat == "Available this month") {
            var value = Number(el.Inflow.replace(/[^0-9\.]+/g,""));
            transactions[curr_date]['outflow'] += value;
          }
        }
      }
    });
    console.log(transactions);
    // Create a graph for each month of transactions
    $.each(transactions, function(i, el) {
      // Get human readable month and year
      var d = new Date(i);
      var date = months[d.getMonth()] + " " + d.getFullYear();
    
      var outflow = "$" + addCommas(el.outflow.toFixed(2));
      var inflow = "$" + addCommas(el.inflow.toFixed(2));
    
      var month_markup = 
        "<div class='month'>"
          +"<div class='container'>"
            +"<div class='twelve columns'>"
              +"<h2>" + date + "</h2>"
            +"</div>"
          +"</div>"
          +"<div class='container'>"
            +"<div class='six columns'><div class='inflow'><span>Inflow</span><span>" + inflow + "</span></div><div class='outflow'><span>Outflow</span><span>" + outflow + "</span></div></div>"
            +"<div class='six columns'><canvas width='400' height='400' id='" + months[d.getMonth()] + "'></canvas></div>"
          +"</div>"
        +"</div>";
    
      $(".months").prepend(month_markup);
  
      // Now that we have our categories, format them in a way that the chart parse
      var data = [];
      $.each(el.categories, function(label, cat) {
        data.push({
          label: label,
          value: cat.value.toFixed(2),
          color: randomColor(),
          highlight: "#738085"
        });
      });
  
      var options = {
        tooltipTemplate: "<%= label %>: $<%= addCommas(value) %>",
        segmentStrokeWidth: 1,
        responsive: true
      }
  
      var c = document.getElementById(months[d.getMonth()]).getContext('2d');;
      myNewChart = new Chart(c).Pie(data, options);
    });
  }

  function addCommas(nStr)
  {
      nStr += '';
      x = nStr.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
  }

  var months = new Array();
  months[0] = "January";
  months[1] = "February";
  months[2] = "March";
  months[3] = "April";
  months[4] = "May";
  months[5] = "June";
  months[6] = "July";
  months[7] = "August";
  months[8] = "September";
  months[9] = "October";
  months[10] = "November";
  months[11] = "December";
