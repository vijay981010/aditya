$(document).ready(function(){
    
    google.charts.load('current', {'packages':['corechart']}) //load google charts
    
    let current = new Date()
    current = current.toISOString()
    current = current.split('T')[0]
    
    let tendays = getDateXDaysAgo(9)
    tendays = tendays.toISOString()
    tendays = tendays.split('T')[0]

    getHistory(tendays, current)
    
    $('#weekHistory').on('click', function(e){
        e.preventDefault()
        //console.log('clicked')
        let current = new Date()
        current = current.toISOString()
        current = current.split('T')[0]
        
        let sevendays = getDateXDaysAgo(6)
        sevendays = sevendays.toISOString()
        sevendays = sevendays.split('T')[0] 
        
        getHistory(sevendays, current)
    })

    $('#monthHistory').on('click', function(e){
        e.preventDefault()
        //console.log('clicked')
        let current = new Date()
        current = current.toISOString()
        current = current.split('T')[0]
        
        let month = getDateXDaysAgo(29)
        month = month.toISOString()
        month = month.split('T')[0] 
        
        getHistory(month, current)
    })

    $('#historyRange').on('click', function(e){
        e.preventDefault()
        //console.log('clicked')
        
        let startDate = $('#historyStart').val()
        let endDate = $('#historyEnd').val()

        let startCheck = new Date(startDate).getTime()
        let endCheck = new Date(endDate).getTime()
        //console.log(startCheck, endCheck)
        startCheck > endCheck ? alert('End date should be greater than or equal to start date. Please re-enter!!!') : getHistory(startDate, endDate)        
    })

 // ------------------------------- FUNCTIONS --------------------------------- //    

    function getHistory(start, end){
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
                
                // --- convert dates --- //
                let total = response.totFilteredOrders
                response.dateArray = response.dateArray.map(item => {                    
                    return moment(item).format('DD-MM-YYYY')                    
                })
                
                // --- create final array to pass to chart --- //
                let finalArr = response.dateArray.map((item,i) => {
                    let temp = []
                    temp.push(item)
                    temp.push(response.histArr[i])
                    return temp
                  })

                finalArr.unshift(['', 'orders']) //add at start of array
                                  
                //call drawchart function
                google.charts.setOnLoadCallback(function(){
                    drawChart(finalArr, total)
                })
               
            }
        })
    }                   
        

    // ------------ GOOGLE CHARTS FUNCTION ------------- //

    function drawChart(arr, total) {
        // Define the chart to be drawn.          
        
        var data = google.visualization.arrayToDataTable(arr)                

        var options = {
            title: `Number of Orders: ${total}`,
            height: 460,
        }; 

        // Instantiate and draw the chart.
        var chart = new google.visualization.ColumnChart(document.getElementById('histogram'))
        chart.draw(data, options)
    }    
    
})



