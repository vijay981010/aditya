$(document).ready(function(){      
    var serviceId = 0         

    $('#actionService').on('click', addServiceRow)   
    $(document).on('click', '.removeService', removeServiceRow) 
    
    function addServiceRow(e){
        e.preventDefault()        
        let service = document.getElementById('serviceAccess').value

        $('#serviceTable')
        .append(`<tr id="r${serviceId++}">                       
            <td><input type='text' class='form-control text-center' name='serviceAccess[]' value="${service}" readonly="readonly"></td>                    
            <td><button class="btn btn-danger removeService"><i class="fa fa-minus-circle"></i></button></td>
            </tr>`)                                 
    }

    function removeServiceRow(event){
        event.preventDefault()                
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        serviceId--                     
    }

})
