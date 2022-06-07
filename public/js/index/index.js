$(document).ready( function () {

  let dtConfig = {              
    "order": [],
    "pageLength": 100
  }

  if(window.matchMedia("(max-width: 768px)").matches) {
    dtConfig.scrollX = true 
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

  const config2 = {
    enableTime: false,    
    altInput: true,
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",    
    onOpen: function(selectedDates, dateStr, instance) {
        $(instance.altInput).prop('readonly', true);
      },
      onClose: function(selectedDates, dateStr, instance) {
        $(instance.altInput).prop('readonly', false);
        $(instance.altInput).blur();
      }
  }
    
    
  flatpickr("#inputDate", config)
  flatpickr("#noLimitDate", config2)
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

// -------------------------------------------- //
if($('#paymentInfo')){
  let paymentDate = $('#paymentNotification').data('id')
  let remainingDays = getDaysDifference(paymentDate)
  let appendTxt = `<span> Kindly clear in ${remainingDays} days for uninterrupted service.</span>` 
  if(remainingDays == 31) appendTxt = `<span> Subscription will expire tomorrow.</span>`
  if(remainingDays == 1) appendTxt = `<span> Subscription will expire day after tomorrow.</span>`
  $('#paymentInfo').append(appendTxt)
  
}


});

  