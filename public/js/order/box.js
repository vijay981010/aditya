$(document).ready(function(){
    var boxId = 0
    var volId = 0            

    $('#actionBox').on('click', addBoxRow)
    $(document).on('click', '.removeBox', removeBoxRow)    
    $(document).on('keyup', '.box', function(){
        console.log($(this)[0].id)
        let id = $(this)[0].id               
        addVol(id)
    })      
    
    function addBoxRow(e){
        e.preventDefault()
        $('#myTable').append(`<tr id="r${boxId++}">
            <td><input type='number' class='form-control text-center box' id='boxL${volId}' name='boxLength' step='.01' required></td>
            <td><input type='number' class='form-control text-center box' id='boxW${volId}' name='boxWidth' step='.01' required></td>
            <td><input type='number' class='form-control text-center box' id='boxH${volId}' name='boxHeight' step='.01' required></td>
            <td><input type='number' class='form-control text-center' name='volumetricWeight' id='volumetricWeight${volId}' readonly='readonly'></td>
            <td><input type='number' class='form-control text-center box' name='actualWeight' step='.01' required></td>
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

    
})


function addVol(id){        
    id = parseFloat(id.substring(4, id.length))
    let length = $(`#boxL${id}`).val()                 
    let width = $(`#boxW${id}`).val()
    let height = $(`#boxH${id}`).val()    
    
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






