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
                    let awb = response.order.awbNumber
                    let current = response.currentStatus || response.order.trackingDetails[0].statusActivity
                    
                    $(`#${awb}`).html(`<a data-toggle="tooltip" title='${current}''>${current}</a>`)
                }
            })              
        })   
     }                        
})