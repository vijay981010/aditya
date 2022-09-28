// -------------------------------------- CHECK SERVICE CATEGORY -------------------------------- //    
    
    $('#category').change(function(){                       
        if($(this).val()=='individual'){
            $('#client').attr('disabled', false)
        }else{
            $('#client').val('')            
            $('#client').attr('disabled', true)
        }
    })

// -------------------------------------- GET RATE -------------------------------- //

    $('.param').on('input', getParams)

    function getParams(){
        let serviceId = $('#service').val()
        let country = $('#destination').val()
        let weight = roundToFive($('#weight').val())
        console.log(serviceId, country, weight)
        if(serviceId && country && weight){
            getRate(serviceId, country, weight)
        }else{
            $('#rate').val('')
        }
    }

    function getRate(serviceId, country, weight){        
        $.ajax({
            url: `${environment.baseurl}/services/rate/checker`,
            method: "POST",
            data: {serviceId, country, weight}, 
            dataType: 'json',
            error: function(xhr, status, error){
                console.log(xhr, status, error)
                alert(xhr, status, error)                
            },
            success: function(result){ 
                //RESET LABEL
                $('#rateLabel').html('Rate')
                
                console.log(result)
                //$('#rate').attr('value', '') //CLEAR EXISTING VALUE//                
                if(result.data == "undefined"){
                    $('#rate').val('')
                    alert("Rate isn't defined for the inputted parameters")
                }else{                    
                    //$('#rate').attr('value', result.data)
                    $('#rate').val(result.data.toFixed(2))
                    //APPEND TO LABEL
                    if(result.gst) $('#rateLabel').append(' (inclusive of GST)')
                    if(!result.gst) $('#rateLabel').append(' (exclusive of GST)')                    
                }                    
                
            }
        })
    }

    
    var clientId = 0 

    $('#actionClient').on('click', addClientRow)
    $(document).on('click', '.removeClient', removeClientRow)

    function addClientRow(e){
        e.preventDefault()        
        let clientName = document.getElementById('client').value
        let client_id = $('#client').find(':selected').attr('data-id')                
        
        $('#clientTable')
        .append(`<tr id="r${clientId++}">                       
            <td>
                <input type='text' class='form-control text-center' name='clientName[]' value="${clientName}" readonly>
                <input type='hidden' class='form-control text-center' name='client[]' value="${client_id}">
            </td>                    
            <td><button class="btn btn-danger removeClient"><i class="fa fa-minus-circle"></i></button></td>
            </tr>`)                                 
    }

    function removeClientRow(event){
        event.preventDefault()                
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        clientId--                     
    }
    
    