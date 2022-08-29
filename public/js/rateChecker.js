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

/* function roundToFive(num){
    let roundNum = Math.floor(num)
    let deciDigit = (num - roundNum).toFixed(1)
    if(deciDigit == 0.5 || deciDigit == 0){ // equals to 0.5 or 0
      return num
    }else if(deciDigit < 0.5){ // less than 0.5
      return Math.round(num) + 0.5   
    }else if(deciDigit > 0.5){  //greater than 0.5
      return Math.ceil(num)
    }
  } */