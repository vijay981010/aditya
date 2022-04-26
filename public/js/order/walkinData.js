$('#consignor').on('change', function(){    
    let consignorName = $(this).val() //GET INPUTTED CONSIGNOR VALUE//
    
    //CHECK IF ADMIN OR CLIENT AND GET ID//
    let id
    if($('#client').val()){
        id = $('#client').val()
    }else if($('#admin').val()){
        id = $('#admin').val()
    }    
     
    //FETCH AND REMDER CONSIGNOR DATA//
    if(consignorName){
        fetchData('consignor', consignorName, id)            
    }
})

$('#consignee').on('change', function(){
    let consigneeName = $(this).val() //GET INPUTTED CONSIGNEE VALUE//

    //CHECK IF ADMIN OR CLIENT AND GET ID//
    let id
    if($('#client').val()){
        id = $('#client').val()
    }else if($('#admin').val()){
        id = $('#admin').val()
    }
            
    //FETCH AND REMDER CONSIGNEE DATA//
    if(consigneeName){
        fetchData('consignee', consigneeName, id)            
    }
})

function fetchData(role, name, id){
    
    $.ajax({
            url: `${environment.baseurl}/walkins/search`,
            method: 'GET',
            data: {role, name, id},
            dataType: 'json',
            error: function(xhr, status, error){
                alert('Some unknown error!!!')
                console.log(xhr, status, error)
            },
            success: function(response){
                if(role == 'consignor'){
                    
                    let idArr = ['consignorContactNumber','consignorEmail','consignorAddress1','consignorAddress2',
                    'consignorPincode','consignorCity','consignorState','docNumber']                                        

                    if(response == null){
                        $('#origin').val('')
                        $('#origin').attr('disabled', false)
                        
                        $('#docType').val('')
                        $('#docType').attr('disabled', false)

                        idArr.forEach(id => {
                            $(`#${id}`).val('')
                            $(`#${id}`).attr('readonly', false)
                        })                       
                    }else{
                        let valArr = [response.contactNumber,response.email,response.address1,response.address2,
                        response.pincode,response.city,response.state,response.docNumber]

                        $('#origin').val(response.country)
                        $('#origin').attr('disabled', true)
                        $('#hOri').val(response.country)       
                        $('#hOri').attr('disabled', false)

                        $('#docType').val(response.docType)
                        $('#docType').attr('disabled', true)
                        $('#hDT').val(response.docType)       
                        $('#hDT').attr('disabled', false)

                        idArr.forEach((id,i) => {
                            $(`#${id}`).val(valArr[i])
                            $(`#${id}`).attr('readonly', true)
                        })                        
                    }
                }else if(role == 'consignee'){

                    let idArr = ['consigneeContactNumber','consigneeEmail','consigneeAddress1','consigneeAddress2',
                    'consigneePincode','consigneeCity','consigneeState']                    

                    if(response == null){
                        $('#destination').val('')                        
                        $('#destination').attr('disabled', false)

                        idArr.forEach(id => {
                            $(`#${id}`).val('')
                            $(`#${id}`).attr('readonly', false)
                        })                      
                    }else{
                        let valArr = [response.contactNumber,response.email,response.address1,response.address2,
                        response.pincode,response.city,response.state]

                        $('#destination').val(response.country)
                        $('#destination').attr('disabled', true)
                        $('#hDest').val(response.country)       
                        $('#hDest').attr('disabled', false)  
                        
                        idArr.forEach((id,i) => {
                            $(`#${id}`).val(valArr[i])
                            $(`#${id}`).attr('readonly', true)
                        })                                               
                    }
                }
            }
        })
}