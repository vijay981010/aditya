    
document.querySelectorAll('.myClass')
    .forEach(item => {
        item.addEventListener('click', () => {
            let id = item.id
            let data = {}
            data.id = id
            if(item.checked == true){
                data.status = 'active'                                
            }else{
                data.status = 'inactive'                                
            }
            $.ajax({
                url: "http://localhost:3000/users/userstatus",
                method: "PATCH",
                data: data, 
                dataType: 'json',
                success: function(response){                                       
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
        })
    })
                
    








        



      
    




