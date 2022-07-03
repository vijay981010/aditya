$(document).ready(function(){      
    
    processTable('actionDf', 'removeDf', 'dispatchFrom', 'dfTable')
    processTable('actionDt', 'removeDt', 'dispatchTo', 'dtTable')

})


function processTable(actionId, tableClass, valueId, tableId){
    var rowId = 0         

    $(`#${actionId}`).on('click', function(e){
        e.preventDefault()     

        let item = document.getElementById(valueId).value
        if(item.trim()==''){
            alert('Please input a text!!')
            return false
        }

        let elem = `<tr id="r${rowId++}"><td><input type='text' class='form-control text-center' name='${valueId}[]' value="${item}" readonly></td>                    
        <td><button class="btn btn-danger removeDf"><i class="fa fa-minus-circle"></i></button></td></tr>`
        
        $(`#${tableId}`).append(elem) 
    })   

    $(document).on('click', `.${tableClass}`, function(e){
        e.preventDefault()                
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        rowId--
    }) 
}


