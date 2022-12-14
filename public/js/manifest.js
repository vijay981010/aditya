$(document).ready(function(){    
    var bagId = 0         

    $('#actionBag').on('click', addBagRow)
    $(document).on('click', '.removeBag', removeBagRow)    

    function addBagRow(e){
        e.preventDefault()
        let bagnumber = document.getElementById('bagNumber').value
        let orderid = document.getElementById('order').value
        let awbnumber = $('#order').find(':selected').attr('data-awb')
        let mhbsnumber = document.getElementById('mhbsNumber').value  
        
        if(bagnumber.trim() == '' || orderid == '' || mhbsnumber.trim() == ''){
            alert('Please input all values!!')
            return false
        }
        
        $('#bagTable')
        .append(`<tr id="r${bagId++}">
            <td><input type='text' class='form-control text-center' name='bagNumber[]' value="${bagnumber}" readonly></td>            
            <td>
                <input type='text' class='form-control text-center' name='awb[]' value="${awbnumber}" readonly>
                <input type='hidden' class='form-control text-center' name='order[]' value="${orderid}">            
            </td>
            <td><input type='text' class='form-control text-center' name='mhbsNumber[]' value="${mhbsnumber}" readonly></td>                    
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
        //console.log('clicked remove bag')                
    }

})

