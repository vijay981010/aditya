$('#awbSearch').on('click', function(){
    if($('#awb').val() == ''){
        alert('Please select an AWB!')
    }else{
        let awb = $('#awb').val()
        //console.log(awb)
        getOrder(awb)
    }
})

$('#removeArchive').on('click', function(){
    $('.archivedOrder').empty()
})

function getOrder(param){         
               
    $.ajax({
        url: `${environment.baseurl}/orders/search/awb`,
        method: 'GET',
        data: {param},
        dataType: 'json',
        error: function(xhr, status, error){
            alert('Some unknown error!')
            console.log(xhr, status, error)
        },
        success: function(response){
            if(response.data == 'undefined'){
                alert('No data found for the parameter!')
            }else{
                console.log(response)                
            // --- convert dates --- //
                response.forEach(item => {
                    item.bookingDate = moment(item.bookingDate).format('DD-MM-YYYY')
                })                 
                
            // --- render data --- //                
                response.forEach(data => {
                    let clientName = data.client.username
                    if(clientName=='Miscellaneous') clientName = data.miscClients
                    let action = `<td><div class="dropdown">
                        <button class="btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Action
                        </button>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" href="${environment.baseurl}/orders/${data._id}">Primary Details</a>
                        <a class="dropdown-item" href="${environment.baseurl}/orders/${data._id}/box">Box Details</a>                                
                        <a class="dropdown-item" href="${environment.baseurl}/orders/${data._id}/track">Tracking Details</a>                                
                        <a class="dropdown-item" href="${environment.baseurl}/orders/${data._id}/bill">Bill Details</a>
                        </div></div></td>`

                    
                
                    $('#archiveTable').append(`<tbody><tr class='archivedOrder'><td>${data.bookingDate}</td><td>${data.awbNumber}</td>
                    <td>${data.trackingStatus}</td><td>${clientName}</td><td>${data.consignor}</td><td>${data.consignee}</td>
                    ${action}<td>${data.origin}</td><td>${data.destination}</td><td>${data.numberOfBoxes}</td><td>${data.chargeableWeight}</td>
                    <td>${data.trackingNumber}</td><td>${data.vendorName}</td></tr></tbody>`)
                })
            }                        
        }
    })         
}




