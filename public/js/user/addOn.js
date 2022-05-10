document.querySelectorAll('.myClass2')
.forEach(item => {
    item.addEventListener('click', function(){
        updateAddOn('admin', item)
    })
})

document.querySelectorAll('.myClass3')
.forEach(item => {
    item.addEventListener('click', function(){
        updateAddOn('client', item)
    })
})

function updateAddOn(role, item){     
    console.log(item.name) 

    let clientId = $('#clientId').val()
    let addOn = item.name
    let status
    item.checked == true ? status = true : status = false                                        

    $.ajax({
        url: `${environment.baseurl}/users/${clientId}/addons`,
        method: "POST",
        data: {addOn, status, role}, 
        dataType: 'json',
        success: function(response){                                       
            console.log(response)  
            if(response.message == 'success'){                                               
                $('#success').show()                           
                setTimeout(function(){                            
                    $('#success').hide()
                }, 1500)                  
            }else if(response.message == 'error'){
                $('#warning').show()
                setTimeout(function(){                            
                    $('#warning').hide()
                }, 1500)                        
            }else{
                $('#danger').show()  
                setTimeout(function(){                            
                    $('#danger').hide()
                }, 1500)                      
            }                 
        }
    })
}