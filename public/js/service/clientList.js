$('.clientList').on('click', function(){        
    $('#clientListModal').modal('show')

    let serviceName = $(this).data('srv')
    $('#serviceName').html(`Clients for ${serviceName} service`)

    let serviceId = $(this).data('id')    
    console.log(serviceId)
    $.ajax({
        url: `${environment.baseurl}/services/${serviceId}/clients`,
        method:'GET',
        error: function(xhr, status, error){
            alert('Some unknown error')
            console.log(xhr, status, error)
        },
        success: function(response){            
              
            let appendText = ``
            response.forEach(e => appendText += `<tr><td>${e}</td></tr>`)            
            console.log(appendText)

            $('#clientList').append(appendText)
        }            
    })
    
})

$('#clientListCloseModal').on('click', function(){
    $('#clientListModal').modal('hide')
})
