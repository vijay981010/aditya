let miscClient = $('#miscClients').val()        

$('#clientId').change(function(){                
    let selectedOption = $('#clientId').find(':selected').html()
    console.log(selectedOption)    
    
    if(selectedOption == 'Miscellaneous'){
        $('#miscClients').attr('readonly', false)
        $('#miscClients').val(miscClient)
    }else{            
        $('#miscClients').val('')        
        $('#miscClients').attr('readonly', true)
    }        

    console.log($('#miscClients').val())
})