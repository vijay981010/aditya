
$(document).on('click', '.deleteInvoice', sendAlert)

function sendAlert(){
    
    let pw = prompt('Are you sure you want to delete, then enter password', '')
    if(pw == '' || pw == null){        
    }else{                
        let invoiceId = $(this).attr('data-id')
        $.ajax({
            url: `${environment.baseurl}/invoices/${invoiceId}/delete`,
            method: "DELETE",
            data: {pw}, 
            dataType: 'json',
            error: function(xhr, status, error){
                console.log(xhr, status, error)                
                alert('Some Unknown Error')
            },
            success: function(response){  
                if(response.msg == 'success'){
                    alert(`Invoice deleted`)
                    location.reload()                  
                }else if(response.msg == 'error'){
                    alert('Incorrect Password')    
                }               
                                                      
            }
        })
    }
}