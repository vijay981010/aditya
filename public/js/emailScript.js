$(document).on('click','#send_mail', SendMail)
//console.log($('#mailId')[0].innerText)	
//let mailId = $('#mailId').val()
//console.log(mailId)

function SendMail(){
    let mailId = $('#mailId').val()
    console.log(mailId)
    let email = $('#email').val(); let name = $('#name').val(); let phone = $('#phone').val()
    let origin = $('#origin').val(); let destination = $('#destination').val(); let weight = $('#weight').val()
    let contents = $('#contents').val()

    let fieldArr = [name, email, phone, origin, destination, weight, contents] 
    let data = {name, email, phone, origin, destination, weight, contents}
    let fieldNameArr = ['name', 'email', 'phone', 'origin', 'destination', 'weight', 'contents']

    fieldArr.forEach((field,i) => {
        if(field.trim() == ''){
            alert(`Please enter ${fieldNameArr[i]}`)
            $(`#${field}`).focus()
            return false
        }
    })    
    
    data.mailId = mailId
    data.webAddr = window.location.hostname
    console.log(data)
    $.blockUI({ message: '<h3>Sending Email...</h3>' })
    $.ajax({
        url: `${window.location.protocol}//${window.location.hostname}/SendUserQuery.php`,
        data: data,
        Method:'POST',
        success: function(result){
            $.unblockUI();
            if(result.statusCode == '01'){
                toastr.success("Mail sent successfully!")
                
                fieldNameArr.forEach(field => {
                    $(`#${field}`).val('')
                })                
            }else if(result.statusCode == '02'){
                toastr.success("Please fill all fields")
            }                                            
        }
    })
}