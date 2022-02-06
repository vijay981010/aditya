$(document).ready(function(){
    var bagId = 0              

    $('#actionBag').on('click', addBagRow)
    $(document).on('click', '.removeBag', removeBagRow)
    
    function addBagRow(e){
        e.preventDefault()
        $('#bagTable').append(`<tr id="r${bagId++}">
            <td><input type='text' class='form-control text-center' name='bagNumber' required></td>
            <td><input type='text' class='form-control text-center' name='order' required></td>                    
            <td><button class="btn btn-danger removeBag"><i class="fa fa-minus-circle"></i></button></td>
            </tr>`)        
    }        
    
    function removeBagRow(event){
        event.preventDefault()                
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        bagId--                     
    }        
})