$('#consignor').on('change', function(){
    let consignorName = $(this).val()
            
    if(consignorName){
        fetchData('consignor', consignorName)            
    }
})

$('#consignee').on('change', function(){
    let consigneeName = $(this).val()
            
    if(consigneeName){
        fetchData('consignee', consigneeName)            
    }
})

function fetchData(role, name){
    $.ajax({
            url: `${environment.baseurl}/walkins/search`,
            method: 'GET',
            data: {role, name},
            dataType: 'json',
            error: function(xhr, status, error){
                alert('Some unknown error!!!')
                console.log(xhr, status, error)
            },
            success: function(response){
                if(role == 'consignor'){
                    if(response == null){
                        $('#origin').val('')
                        $('#origin').attr('disabled', false)

                        $('#consignorContactNumber').val('')
                        $('#consignorContactNumber').attr('readonly', false)

                        $('#consignorEmail').val('')
                        $('#consignorEmail').attr('readonly', false)

                        $('#consignorAddress1').val('')
                        $('#consignorAddress1').attr('readonly', false)

                        $('#consignorAddress2').val('')
                        $('#consignorAddress2').attr('readonly', false)

                        $('#consignorPincode').val('')
                        $('#consignorPincode').attr('readonly', false)

                        $('#consignorCity').val('')
                        $('#consignorCity').attr('readonly', false)

                        $('#consignorState').val('')
                        $('#consignorState').attr('readonly', false)

                        $('#docType').val('')
                        $('#docType').attr('disabled', false)

                        $('#docNumber').val('')
                        $('#docNumber').attr('readonly', false)
                    }else{
                        $('#origin').val(response.country)
                        $('#origin').attr('disabled', true)
                        $('#hOri').val(response.country)       
                        $('#hOri').attr('disabled', false)

                        $('#consignorContactNumber').val(response.contactNumber)
                        $('#consignorContactNumber').attr('readonly', true)

                        $('#consignorEmail').val(response.email)
                        $('#consignorEmail').attr('readonly', true)

                        $('#consignorAddress1').val(response.address1)
                        $('#consignorAddress1').attr('readonly', true)

                        $('#consignorAddress2').val(response.address2)
                        $('#consignorAddress2').attr('readonly', true)

                        $('#consignorPincode').val(response.pincode)
                        $('#consignorPincode').attr('readonly', true)

                        $('#consignorCity').val(response.city)
                        $('#consignorCity').attr('readonly', true)

                        $('#consignorState').val(response.state)
                        $('#consignorState').attr('readonly', true)

                        $('#docType').val(response.docType)
                        $('#docType').attr('disabled', true)
                        $('#hDT').val(response.docType)       
                        $('#hDT').attr('disabled', false)

                        $('#docNumber').val(response.docNumber)
                        $('#docNumber').attr('readonly', true)
                    }
                }else if(role == 'consignee'){
                    if(response == null){
                        $('#destination').val('')                        
                        $('#destination').attr('disabled', false)

                        $('#consigneeContactNumber').val('')
                        $('#consigneeContactNumber').attr('readonly', false)

                        $('#consigneeEmail').val('')
                        $('#consigneeEmail').attr('readonly', false)

                        $('#consigneeAddress1').val('')
                        $('#consigneeAddress1').attr('readonly', false)

                        $('#consigneeAddress2').val('')
                        $('#consigneeAddress2').attr('readonly', false)                        

                        $('#consigneePincode').val('')
                        $('#consigneePincode').attr('readonly', false)

                        $('#consigneeCity').val('')
                        $('#consigneeCity').attr('readonly', false)

                        $('#consigneeState').val('')
                        $('#consigneeState').attr('readonly', false)                        
                    }else{
                        $('#destination').val(response.country)
                        $('#destination').attr('disabled', true)
                        $('#hDest').val(response.country)       
                        $('#hDest').attr('disabled', false)                 

                        $('#consigneeContactNumber').val(response.contactNumber)
                        $('#consigneeContactNumber').attr('readonly', true)

                        $('#consigneeEmail').val(response.email)
                        $('#consigneeEmail').attr('readonly', true)

                        $('#consigneeAddress1').val(response.address1)
                        $('#consigneeAddress1').attr('readonly', true)

                        $('#consigneeAddress2').val(response.address2)
                        $('#consigneeAddress2').attr('readonly', true)                        

                        $('#consigneePincode').val(response.pincode)
                        $('#consigneePincode').attr('readonly', true)

                        $('#consigneeCity').val(response.city)
                        $('#consigneeCity').attr('readonly', true)

                        $('#consigneeState').val(response.state)
                        $('#consigneeState').attr('readonly', true)                        
                    }
                }
            }
        })
}