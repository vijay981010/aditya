let miscClient = $('#miscClients').val()        

$('#clientId').change(function(){                
    let selectedOption = $('#clientId').find(':selected').html()
    
    if(selectedOption == 'Miscellaneous'){
        $('#miscClients').attr('disabled', false)
        $('#miscClients').val(miscClient)
    }else{            
        $('#miscClients').val('')
        $('#miscClients').attr('disabled', true)
    }        
})