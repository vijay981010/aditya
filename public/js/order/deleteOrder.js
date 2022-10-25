//$('.delete').on('click', sendAlert)
$(document).on('click', '.delete', sendAlert)

function sendAlert(){          
    let orderId = $(this).attr('data-id')
    let awb = $(this).attr('data-awb')

    let pw = confirm(`Are you sure you want to delete awb : ${awb} ??`)
    
    if(pw){
        $.ajax({
            url: `${environment.baseurl}/orders/${orderId}/delete`,
            method: "DELETE",                
            error: function(xhr, status, error){
                console.log(xhr, status, error)                
                alert('Some Unknown Error')
            },
            success: function(response){  
                if(response.msg == 'success'){
                    alert(`Order: ${awb} deleted`)
                    location.reload()                  
                }else if(response.msg == 'error'){
                    alert('Incorrect Password')    
                }               
                                                        
            }
        })
    }    
}
