$(document).ready(function(){    
    var moduleId = 0 

    $('#actionModule').on('click', addModuleRow)
    $(document).on('click', '.removeModule', removeModuleRow)

    function addModuleRow(e){
        e.preventDefault()        
        let module = document.getElementById('accessRight').value
        
        $('#moduleTable')
        .append(`<tr id="r${moduleId++}">                       
            <td><input type='text' class='form-control text-center' name='accessRight[]' value="${module}" readonly="readonly"></td>                    
            <td><button class="btn btn-danger removeModule"><i class="fa fa-minus-circle"></i></button></td>
            </tr>`)                                 
    }

    function removeModuleRow(event){
        event.preventDefault()                
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        moduleId--                     
    }
})
