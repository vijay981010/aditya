$(document).ready(function(){
    var boxId = 0
    var volId = 0            

    $('#actionBox').on('click', addBoxRow)
    $(document).on('click', '.removeBox', removeBoxRow)    
    
    function addBoxRow(e){
        e.preventDefault()
        $('#myTable').append(`<tr id="r${boxId++}">
            <td><input type='number' class='form-control text-center' onkeyup='addVol(${volId})' id='boxLength${volId}' name='boxLength' step='.01' required></td>
            <td><input type='number' class='form-control text-center' onkeyup='addVol(${volId})' id='boxWidth${volId}' name='boxWidth' step='.01' required></td>
            <td><input type='number' class='form-control text-center' onkeyup='addVol(${volId})' id='boxHeight${volId}' name='boxHeight' step='.01' required></td>
            <td><input type='number' class='form-control text-center' name='volumetricWeight' id='volumetricWeight${volId}' readonly='readonly'></td>
            <td><input type='number' class='form-control text-center' onkeyup='addVol(${volId})' name='actualWeight' step='.01' required></td>
            <td><button class="btn btn-danger removeBox"><i class="fa fa-minus-circle"></i></button></td>
            </tr>`)
        volId++
    }        
    
    function removeBoxRow(event){
        event.preventDefault()                
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        boxId--    
        //console.log('clicked remove box')
        addVol(volId)            
    }
    
    // ---------------------------------------------------- //

    var itemId = 0
    var invId = 0            

    $('#actionItem').on('click', addItemRow)
    $(document).on('click', '.removeItem', removeItemRow)
    
    function addItemRow(event){
        event.preventDefault()
        $('#myTable2').append(`<tr id="r${itemId++}">
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


function addVol(id){        
    let length = $(`#boxLength${id}`).val()                 
    let width = $(`#boxWidth${id}`).val()
    let height = $(`#boxHeight${id}`).val()
    let totalvolweight = 0
    if(length != '' && width != '' && height != ''){                
        let volweight = (length*width*height)/5000                
        $(`#volumetricWeight${id}`).val(volweight.toFixed(2))                                        
    }         
    let totvolweight = 0
    let totactualweight = 0  
    var volweight = $("input[name='volumetricWeight']").map(function(){return $(this).val();}).get()
    var actualweight = $("input[name='actualWeight']").map(function(){return $(this).val();}).get()
        for(let i = 0; i < volweight.length; i++){
            totvolweight = parseFloat(totvolweight) + parseFloat(volweight[i])
            totactualweight = parseFloat(totactualweight) + parseFloat(actualweight[i])
        }
        if(parseFloat(totvolweight) > parseFloat(totactualweight)){
            $('#chargeableWeight').val(totvolweight.toFixed(2));                    
        }else{
            $('#chargeableWeight').val(totactualweight.toFixed(2));                    
        }                                               
}

function addInv(id){
    let totval = 0      
        
    var itemqty = $("input[name='itemQuantity']").map(function(){return $(this).val();}).get()
    var itemprice = $("input[name='itemPrice']").map(function(){return $(this).val();}).get()
    for(let i = 0; i < itemqty.length; i++){
        totval = parseFloat(totval) + (parseFloat(itemqty[i])*parseFloat(itemprice[i]))
    }
    $('#totalValue').val(totval)

    /* let currency = $('#currency').val()
    //CHECK INVOICE TOTAL > 24000 INR//
    if(currency && currency != 'INR'){
        let amount = getExchange(currency)   
    } */
}

/* function getExchange(currency){
    $.ajax({
        url: `https://api.exchangerate-api.com/v4/latest/${currency}`,
        method: 'GET',
        error: function(xhr, status, error){
            alert('Some Unknown Error')
            console.log(xhr, status, error)
        },
        success: function(response){
            console.log(response)
            //return response
        }
    })
} */
