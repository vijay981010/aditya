$(document).ready(function(){
    $('#trackDetails').submit(getTrackingHistory)
    
    function getTrackingHistory(event){
        event.preventDefault()
        $('#trackingScan').html('')	
        $('#trackingDetails').hide()			
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
                        //GET FORWARDING NUMBER//
                        let forwardingNumber = response.order.trackingNumber
                        let linkBtn = `<a href="${response.link}" class="btn-sm btn-primary" target="_blank">Track Further</a>`
                        if(response.link)
                            forwardingNumber = `${response.order.trackingNumber} ${linkBtn}`

                        //UNHIDE TRACKING DETAILS TABLE//
                        $('#trackingDetails').show()

                        //scroll to tracking details section//
                        $('html, body').animate({
                            scrollTop: $("#trackInfo").offset().top
                        }, 1000)

                        //CHECK MISCELLANEOUS CLIENT//
                        let clientName = response.order.client.username
                        if(response.order.miscClients) clientName = response.order.miscClients

                        //render shipment details table
                        $('#orderDateData').html(moment(response.order.bookingDate).format('DD-MM-YYYY'))
                        $('#consignorData').html(response.order.consignor)
                        $('#consigneeData').html(response.order.consignee)
                        $('#destinationData').html(response.order.destination)
                        $('#trackingNumberData').html(response.order.awbNumber)
                        $('#noteData').html(response.order.clientNote)
                        $('#userData').html(clientName)								
                        $('#forwardingNumberData').html(forwardingNumber)
                        $('#vendorData').html(response.order.vendorName)
    
                        // --- convert dates --- //
                        response.order.trackingDetails.forEach(item => {
                            item.statusDate = moment(item.statusDate).format('DD-MM-YYYY')
                        })
    
                        //render tracking history table
                        response.order.trackingDetails.forEach(scan => {
                            $('#trackingScan').append(`<tr><td>${scan.statusDate}</td><td>${scan.statusTime}</td><td>${scan.statusLocation}</td><td>${scan.statusActivity}</td></tr>`)                                
                        })
                    }else{                        
                        alert('Did not found tracking Number. Please check and re-enter')
                    }                            
                },
            })
    }
})