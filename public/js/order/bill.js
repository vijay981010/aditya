$(document).ready(function(){    
        
    $('#base').on('input', getTotal)
    $('#fuel').on('input', getTotal)
// ------------------- BASIC CHARGES  ------------------------ //
    
    $('#brCheck').change(function(){   
             
        if($(this).is(':checked') == true){
            let br = parseFloat($('#base').val())    
            if(br){
                let brgst = (br * 0.18).toFixed(1)                                
                $('#brGst').attr('value', brgst)
                $('#base').attr('readonly', true)                                
            }else{
                alert('Please enter base rate')
                $(this).prop('checked', false)
            }
        }else{
            $('#brGst').attr('value', 0)
            $('#base').attr('readonly', false)
        }            
    })
    
    $('#fsCheck').change(function(){   
             
        if($(this).is(':checked') == true){
            let fs = parseFloat($('#fuel').val())    
            if(fs){
                let fsgst = (fs * 0.18).toFixed(1)                                
                $('#fsGst').attr('value', fsgst)
                $('#fuel').attr('readonly', true)                                
            }else{
                alert('Please enter fuel surcharge')
                $(this).prop('checked', false)
            }
        }else{
            $('#fsGst').attr('value', 0)
            $('#fuel').attr('readonly', false)
        }            
    })

// ------------------- MISCALLANEOUS CHARGES TABLE ------------------------ //

    var chargeId = 0    
    var amountId = 0
    var checkId = 0
    var vatId = 0

    $('#actionCharge').on('click', addChargeRow)
    $(document).on('click', '.removeCharge', removeChargeRow)
    
    $(document).on('change', '.mc', calcGst)
    $(document).on('change', '.total', getTotal)
    $(document).on('input', '.total', getTotal)
        
    function getTotal(id){
        let totalAmount = 0
        let miscAmount = $("input[name='amount']").map(function(){return $(this).val();}).get()
        let mvatAmount = $("input[name='gst']").map(function(){return $(this).val();}).get()                 
        
        let baseAmount = parseFloat($('#base').val())
        let brgstAmount = parseFloat($('#brGst').val())
        
        let fuelAmount = parseFloat($('#fuel').val())
        let fsgstAmount = parseFloat($('#fsGst').val())
        
        totalAmount = totalAmount + baseAmount + brgstAmount + fuelAmount + fsgstAmount

        for(let i = 0; i < miscAmount.length; i++){
            totalAmount = totalAmount + parseFloat(miscAmount[i]) + parseFloat(mvatAmount[i])
        }
        
        //console.log(totalAmount)
        $('#totalBill').val(totalAmount)

    }
    

    function addChargeRow(event){
        event.preventDefault()
        $('#chargeTable').append(`<tr id="r${chargeId++}">
            <td><input type='text' class='form-control text-center' name='title' required></td>
            <td><input type='number' class='form-control text-center total' name='amount' value="0" id="amount${amountId++}"required></td>
            <td><label class="switch"><input type="checkbox" class="mc" id="${checkId++}"><span class='slider round'></span></label></td>
            <td><input type='number' class='form-control text-center' name='gst' id="gst${vatId++}" value="0" readonly></td>        
            <td><button class="btn btn-danger removeCharge"><i class="fa fa-minus-circle"></i></button></td>
            </tr>`)        
    }

    function calcGst(){        
        let i = parseFloat($(this)[0].id)
        
        if($(this).is(':checked') == true){            
            let amount = $(`#amount${i}`).val()
            
            if(amount){
                let gst = amount * 0.18
                $(`#gst${i}`).attr('value', gst.toFixed(1))
                $(`#amount${i}`).attr('readonly', true)
                getTotal(i)
            }else{
                alert('Please enter the charge')
                $(this).prop('checked', false)
            }            
        }else{
            $(`#gst${i}`).attr('value', 0)
            $(`#amount${i}`).attr('readonly', false)
            getTotal(i)
        }   
        
    }

    function removeChargeRow(event){
        event.preventDefault()                         
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        chargeId--    
        getTotal()
    }
})