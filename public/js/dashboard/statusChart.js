

// Draw the chart and set the chart values
/* function drawChart1() {
    var data1 = google.visualization.arrayToDataTable([
        ['Status', 'Number of orders'],      
        ['Issue', 50],
        ['Delivered', 100],
        ['In-Transit', 50]      
    ])
   
} */

$(document).ready(function(){
    
    google.charts.load('current', {'packages':['corechart']}) //load google charts
    
    let current = new Date()
    current = current.toISOString()
    current = current.split('T')[0]
    
    let tendays = getDateXDaysAgo(9)
    tendays = tendays.toISOString()
    tendays = tendays.split('T')[0]

    getStatus(tendays, current)
    
    $('#weekStatus').on('click', function(e){
        e.preventDefault()
        //console.log('clicked')
        let current = new Date()
        current = current.toISOString()
        current = current.split('T')[0]
        
        let sevendays = getDateXDaysAgo(6)
        sevendays = sevendays.toISOString()
        sevendays = sevendays.split('T')[0] 
        
        getStatus(sevendays, current)
    })

    $('#monthStatus').on('click', function(e){
        e.preventDefault()
        //console.log('clicked')
        let current = new Date()
        current = current.toISOString()
        current = current.split('T')[0]
        
        let month = getDateXDaysAgo(29)
        month = month.toISOString()
        month = month.split('T')[0] 
        
        getStatus(month, current)
    })

    $('#statusRange').on('click', function(e){
        e.preventDefault()
        //console.log('clicked')
        
        let startDate = $('#statusStart').val()
        let endDate = $('#statusEnd').val()

        let startCheck = new Date(startDate).getTime()
        let endCheck = new Date(endDate).getTime()
        //console.log(startCheck, endCheck)
        startCheck > endCheck ? alert('End date should be greater than or equal to start date. Please re-enter!!!') : getStatus(startDate, endDate)        
    })

 // ------------------------------- FUNCTIONS --------------------------------- //    

    function getStatus(start, end){
        //console.log(start, end)
        $.ajax({
            url: `${environment.baseurl}/orders/search/history`,
            method: 'GET',
            data: {start, end},
            dataType: 'json',
            error: function(xhr, status, error){
                alert('Some unknown error!!')
                console.log(xhr, status, error)
            },
            success: function(response){
                
                // --- create final array to pass to chart --- //
                let finalStatusArr = [
                    ['Status', 'Number Of Orders'],
                    ['Issue', response.statusObj.isuStat],
                    ['Delivered', response.statusObj.delStat],                    
                    ['Return', response.statusObj.rtnStat],
                    ['Booked', response.statusObj.schStat],
                    ['In-Transit', response.statusObj.intStat],
                    ['Others', response.statusObj.infoStat],
                ]

                let total = response.totFilteredOrders

                $('#del').html(response.statusObj.delStat)
                $('#int').html(response.statusObj.intStat)
                $('#isu').html(response.statusObj.isuStat)
                $('#sch').html(response.statusObj.schStat)
                $('#info').html(response.statusObj.infoStat)
                $('#rtn').html(response.statusObj.rtnStat)

                //call drawchart function
                google.charts.setOnLoadCallback(function(){
                    drawStatusChart(finalStatusArr, total)
                })                
               
            }
        })
    }                   
        

    // ------------ GOOGLE CHARTS FUNCTION ------------- //

    function drawStatusChart(arr, total) {
        // Define the chart to be drawn.          
        
        var data = google.visualization.arrayToDataTable(arr)                

        // Optional; add a title and set the width and height of the chart
        var options = {
            title: `Total Orders: ${total}`, 
            is3D: true,
            'height':500,          
            'chartArea.left': 100,
            'chartArea.right': 10,
            'chartArea.top': 40,
            'colors': ['red', 'green', 'black', 'blue', 'orange', 'grey']
        } 

        // Instantiate and draw the chart.
        var statusChart = new google.visualization.PieChart(document.getElementById('piechart'))
        statusChart.draw(data, options)
        
    }

    
    
})
      
