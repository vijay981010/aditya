$(document).ready(function(){
    var statusId = 0              

    $('#actionStatus').on('click', addStatusRow)
    $(document).on('click', '.removeStatus', removeStatusRow)
    
    function addStatusRow(e){
        e.preventDefault()
        $('#statusTable').append(`<tr id="r${statusId++}">
            <td><input class='form-control text-center dateStat' name='statusDate[]' required></td>
            <td><input class='form-control text-center timeStat' name='statusTime[]' required></td>
            <td><input type='text' class='form-control text-center' name='statusLocation[]' required></td>
            <td><input type='text' class='form-control text-center' name='statusActivity[]' required></td>            
            <td><button class="btn btn-danger removeStatus"><i class="fa fa-minus-circle"></i></button></td>
            </tr>`)        
    }            
    
    function removeStatusRow(event){
        event.preventDefault()                
        var child = $(this).closest('tr').nextAll()

        child.each(function () {                
            var id = $(this).attr('id')
            var dig = parseInt(id.substring(1))
            $(this).attr('id', `r${dig - 1}`)
        })
            
        $(this).closest('tr').remove()              
        statusId--                     
    }       
    
    // ----------- FLATPICKR ---------------- //

    const config2 = {
        enableTime: false,    
        dateFormat: "d-m-Y",
        maxDate: 'today'
    }

    const config3 = {
        enableTime: true,
        noCalendar: true,        
        dateFormat: "H:i",                
    }

    $('body').on('focus', ".dateStat", function(){
        flatpickr('.dateStat', config2)
    })

    $('body').on('focus', ".timeStat", function(){
        flatpickr('.timeStat', config3)
    })
})