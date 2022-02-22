$(document).ready( function () {
    
    // ------------------ DATATABLE ------------------ //
    $('#myTable').DataTable({
        "scrollX": true,          
        "order": []    
        /* "sScrollX": "80%",
        "sScrollXInner": "110%",
        "bScrollCollapse": true */          
    });    

    // ------------------ FLATPICKR ------------------ //
    const config = {
        enableTime: false,    
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        maxDate: "today",
        onOpen: function(selectedDates, dateStr, instance) {
            $(instance.altInput).prop('readonly', true);
          },
          onClose: function(selectedDates, dateStr, instance) {
            $(instance.altInput).prop('readonly', false);
            $(instance.altInput).blur();
          }
    }    
    
    flatpickr("#inputDate", config);

    // ------------------ MuLTISELECT ------------------ //        
    
    $('.mult').select2()

});

  