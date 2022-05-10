$(document).ready(function(){
    var itemId = 0
    var invId = 0            

    $('#actionItem').on('click', addItemRow)        
    $(document).on('click', '.removeItem', removeItemRow)

    function addItemRow(event){
        event.preventDefault()
            
        $('#myTable2')
        .append(`<tr id="r${itemId++}">
        <td class="col-sm-1"><input type='number' class='form-control text-center' name='boxNumber' required></td>
        <td class="col-sm-2"><select class='form-select text-center' name='itemType' required><option value=''>--Select item type--</option><option value='normal'>normal</option><option value='nonDG'>non-DG</option></select></td>
        <td class="col-sm-4"><input type='text' class='form-control text-center' name='itemName' required></td>
        <td class="col-sm-2"><input type='text' class='form-control text-center' name='hsnCode'></td>
        <td class="col-sm-1"><input type='number' class='form-control text-center' onkeyup='addInv(${invId})' name='itemQuantity' step='.01' required></td>
        <td class="col-sm-1"><input type='number' class='form-control text-center' onkeyup='addInv(${invId})' name='itemPrice' step='.01' required></td>
        <td class="col-sm-1"><button class="btn btn-danger removeItem"><i class="fa fa-minus-circle"></i></button></td>
        </tr>`)
        invId++

    }

    function removeItemRow(event){
        event.preventDefault()                         
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        itemId--
        addInv(invId)
    }
    
})

function addInv(id){
    let totval = 0      
        
    var itemqty = $("input[name='itemQuantity']").map(function(){return $(this).val();}).get()
    var itemprice = $("input[name='itemPrice']").map(function(){return $(this).val();}).get()
    for(let i = 0; i < itemqty.length; i++){
        totval = parseFloat(totval) + (parseFloat(itemqty[i])*parseFloat(itemprice[i]))
    }
    $('#totalValue').val(totval.toFixed(2))
        
}