/* google.charts.load('current', {'packages':['corechart']})
google.charts.setOnLoadCallback(drawChart1)

// Draw the chart and set the chart values
function drawChart1() {
    var data1 = google.visualization.arrayToDataTable([
        ['Status', 'Number of orders'],      
        ['Issue', 50],
        ['Delivered', 100],
        ['In-Transit', 50]      
    ])

    // Optional; add a title and set the width and height of the chart
    var options1 = {
        title: 'Booked Orders: 200', 
        is3D: true,
        'height':400,          
        'chartArea.left': 100,
        'chartArea.right': 10,
        'colors': ['red', 'green', 'orange']
    };

    // Display the chart inside the <div> element with id="piechart"
    var chart1 = new google.visualization.PieChart(document.getElementById('piechart'))
    chart1.draw(data1, options1)
}

$('#statusRange').on('click', function(){
    console.log('clicked status')
}) */
      
