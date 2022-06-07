$(document).ready(function(){
    var billId = 0
    //var invId = 0            

    $('#actionBill').on('click', addBillRow)        
    $(document).on('click', '.removeBill', removeBillRow)
    //$(document).on('keyup', '.invoice', addInv)      

    function addBillRow(event){
        console.log('clicked')
        event.preventDefault()
            
        $('#billTable')
        .append(`<tr id="r${billId++}">
        <td><input type='text' class='form-control text-center' name='name[]' required></td>
        <td><input type='text' class='form-control text-center' name='description[]' required></td>
        <td><input type='number' min="0" class='form-control text-center' name='amount[]' required></td>
        <td><button class="btn btn-danger removeBill"><i class="fa fa-minus-circle"></i></button></td>        
        </tr>`)
        //invId++

    }

    function removeBillRow(event){
        event.preventDefault()                         
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        itemId--
        //addInv(invId)
    }
    
})

/* function addInv(){
    let totval = 0      
        
    var itemqty = $("input[name='itemQuantity']").map(function(){return $(this).val();}).get()
    var itemprice = $("input[name='itemPrice']").map(function(){return $(this).val();}).get()
    for(let i = 0; i < itemqty.length; i++){
        totval = parseFloat(totval) + (parseFloat(itemqty[i])*parseFloat(itemprice[i]))
    }
    $('#totalValue').val(totval.toFixed(2))
        
}

function getOptionString(arr, item){
    let optionListArr = []
    arr.forEach(elem => {
        let temp = `<option value="${elem[item]}">${elem[item]}</option>`
        optionListArr.push(temp)
    })
    return optionListArr.join("")
} */