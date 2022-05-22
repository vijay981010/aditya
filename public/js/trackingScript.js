$(document).ready(function(){
    $('#trackDetails').submit(getTrackingHistory)
    
    //CREATE HEADER ARR//
    let shipmentInfoArr = ['orderDateData', 'consignorData', 'consigneeData', 'destinationData',
    'trackingNumberData', 'noteData', 'userData', 'forwardingNumberData', 'vendorData']
    
    function getTrackingHistory(event){
        event.preventDefault()
        
        //CLEAR EXISTING RENDER IF ANY//
        $('#trackingScan').html('')	
        shipmentInfoArr.forEach(info => $(`#${info}`).html(''))
        
        var trackingNumber = $('#trackingNumber').val()
        let user = $('#un').val()
    
        $.ajax({
                url: `https://digitalawb.herokuapp.com/orders/track/details`,
                method: "GET",
                data: { trackingNumber, user }, 
                dataType: 'json',
                cache: false,
                beforeSend: function() {
                  $("#overlay").show();
               },
               error: function(xhr, status, error){
                    alert('Some Unknown Error')  
                    console.log(xhr, status, error)
               },
                success: function(response){                                                                   
                    console.log(response)
                    //hide the loading screen
                    $("#overlay").hide()
    
                    if(response.status == 'Success'){
                        //GET ORDER FROM RESPONSE//
                        let order = response.order
                        
                        //GET FORWARDING NUMBER//
                        let forwardingNumber = order.trackingNumber
						let linkBtn = `<a href="${response.link}" class="btn-sm btn-primary" target="_blank">Track Further</a>`
						if(response.link)
						    forwardingNumber = `${order.trackingNumber} ${linkBtn}`
						
						console.log(forwardingNumber)
						//UNHIDE TRACKING DETAILS//
                        $('#trackingDetails').show()
                        
                        //scroll to tracking details section//
                        $('html, body').animate({
                            scrollTop: $("#trackInfo").offset().top
                        }, 1000)
                        
                        //CHECK MISCELLANEOUS CLIENT//
                        let clientName = order.client.username
                        if(order.miscClients) clientName = order.miscClients
                        
                        //CREATE VALUE ARR//
                        let bookingDate = moment(order.bookingDate).format('DD-MM-YYYY')
                        let shipmentValueArr = [bookingDate, order.consignor, order.consignee, order.destination, 
                        order.awbNumber, order.clientNote, clientName, forwardingNumber, order.vendorName]
                        
                        //render shipment details table
                        shipmentInfoArr.forEach((info,i) => {
                            $(`#${info}`).html(shipmentValueArr[i])
                        })                                                
    
                        // --- convert dates --- //
                        order.trackingDetails.forEach(item => {
                            item.statusDate = moment(item.statusDate).format('DD-MM-YYYY')
                        })
    
                        //render tracking history table
                        order.trackingDetails.forEach(scan => {
                            $('#trackingScan').append(`<tr><td>${scan.statusDate}</td><td>${scan.statusTime}</td><td>${scan.statusLocation}</td><td>${scan.statusActivity}</td></tr>`)                                
                        })
                    }else{
                        var url = window.location.origin+'/'
                        console.log(url)
                        localStorage.setItem('url',url)
                        window.open ('tracking.php?str='+trackingNumber,'_self',false)
                        //alert('Did not found tracking Number. Please check and re-enter')
                    }                            
                },
            })
    }
})
    
