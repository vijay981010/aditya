$(document).ready(function(){
    //setInterval(runCron, 5000)
    runCron()

    function runCron(){            
        let x = []
        let statCron = []

        document.querySelectorAll('.cron').forEach(item => {
            x.push(item.innerHTML)
        })

        x.forEach((elem,i) => {       
                
            $.ajax({
                url: `${environment.baseurl}/orders/track/details`,
                method: 'GET',
                data: {elem},
                dataType: 'json',
                cache: false,
                error: function(xhr, status, error){
                    alert('Some unknown error')
                    console.log(xhr, status, error)
                },
                success: function(response){
                    let awb = response.order.awbNumber //GET AWB NUMBER//
                    let statusCode = response.order.trackingStatus //GET TRACKING STATUS//
                    
                // -------- GET COLOR CODE -------- //
                    let color = 'badge badge-secondary' //DEFAULT COLOR CODE
                    
                    //ARRAY OF STATUS CODE//
                    let intArr = ['INT', 'PKP', 'OOD', 'DNB']
                    let isuArr = ['UND', 'CAN', 'ONH', 'NWI', 'NFI', 'ODA', 'OTH',
                     'SMD', 'CRTA', 'CNA', 'DEX', 'DRE', 'PNR', 'LOST', 'PKF', 'PCAN']
                    let rtnArr = ['RTO', 'RTD', 'RCAN', 'RCLO', 'RDEL', 'RINT', 'ROOP',
                     'RPKP', 'RPSH', 'RSMD', 'RSCH']

                    //ACCORDING TO DIFFERENT STATUS CODE//
                    if(statusCode == 'SCH') color = 'badge badge-primary'
                    if(intArr.indexOf(statusCode) != -1) color = 'badge badge-warning'
                    if(isuArr.indexOf(statusCode) != -1) color = 'badge badge-danger'
                    if(statusCode == 'DEL') color = 'badge badge-success'
                    if(rtnArr.indexOf(statusCode) != -1) color = 'badge badge-dark'
                                    
                    
                    //GET CURRENT STATUS//
                    let current = response.currentStatus || response.order.trackingDetails[0].statusActivity
                    
                    //RENDER ON PAGE//
                    $(`#${awb}`).html(`<h6><span class='${color}'><a data-toggle="tooltip" title='${current}''>${statusCode}</a></span></h6>`)
                }
            })              
        })   
     }                        
})