$(document).ready( function () {

  let dtConfig = {
    "scrollX": true,          
    "order": [],
    "pageLength": 100    
  }
    
// ------------------ DATATABLE ------------------ //
  $('#myTable').DataTable(dtConfig);    

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
    
  flatpickr("#inputDate", config)
  flatpickr(".inputDate", config)

// ------------------ MuLTISELECT ------------------ //        
    
  $('.mult').select2()

});

  