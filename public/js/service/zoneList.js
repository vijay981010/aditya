$('.zoneList').on('click', function(){        
    $('#zoneListModal').modal('show')

    let serviceName = $(this).data('srv')
    $('#zoneListModalLabel').html(`Zone List for ${serviceName} service`)

    let serviceId = $(this).data('id')    
    console.log(serviceId)
    $.ajax({
        url: `${environment.baseurl}/services/${serviceId}/zones`,
        method:'GET',
        error: function(xhr, status, error){
            alert('Some unknown error')
            console.log(xhr, status, error)
        },
        success: function(response){            
            console.log(response)  
            let appendText = ``
            response.forEach(e => appendText += `<tr><td>${e.zoneName}</td><td>${e.countries}</td></tr>`)            
            console.log(appendText)

            $('#zoneList').append(appendText)
        }            
    })
    
})

$('#zoneListCloseModal').on('click', function(){
    $('#zoneListModal').modal('hide')
})
