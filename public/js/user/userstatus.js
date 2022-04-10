
document.querySelectorAll('.myClass')
    .forEach(item => {
        item.addEventListener('click', () => {     
            let burl                   
            if(window.location.hostname == 'localhost'){
                burl = "http://localhost:3000"
            }else{
                burl = "https://nodejs-courierapp.herokuapp.com"
            }
            console.log(burl)
            let id = item.id
            let data = {}
            data.id = id
            if(item.checked == true){
                data.status = 'active'                                
            }else{
                data.status = 'inactive'                                
            }
            $.ajax({
                url: `${burl}/users/userstatus`,
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
                
    








        



      
    




