
  var transactions = {};
  var outflows = 0;

  Papa.parse('/finances/transactions.csv', {
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
      var start_time = new Date('2015-10').getTime();

      // Only get transactions past the start time
      if (curr_time >= start_time) {  
      
        // Split the date to use for the cat array key
        var split = el.Date.split('/');
        var curr_date = split[2] + '-' + split[0];
      
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
  
    // Create a graph for each month of transactions
    $.each(transactions, function(i, el) {
      // Get human readable month and year
      var d = new Date(i);
      var date = month[d.getMonth()] + " " + d.getFullYear();
    
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
            +"<div class='six columns'><canvas width='400' height='400' id='" + month[d.getMonth()] + "'></canvas></div>"
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
  
      var c = document.getElementById(month[d.getMonth()]).getContext('2d');;
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

  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
