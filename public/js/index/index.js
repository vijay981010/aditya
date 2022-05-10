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

// ------------------ TEXTAREA ENTER PREVENT NEXT LINE ------------------ // 

  $(".noEnter").keydown(function(e){
    if (e.keyCode == 13 && !e.shiftKey)
    {
      // prevent default behavior
      e.preventDefault();
      //alert("ok");
      return false;
      }
    })

// ------------------ GOBACK ------------------ //   
  $('#goBack').on('click', function(){
      history.back()
  })

});

  