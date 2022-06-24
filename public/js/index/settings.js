let environment = {}

if(window.location.hostname == 'localhost'){
    environment.baseurl = "http://localhost:3000"    
}else{
    environment.baseurl = `https://${window.location.hostname}`
}

// -------- GET NUMBER ROUNDED TO NEAREST 0.5 OR 1 --------- //

function roundToFive(num){
    let roundNum = Math.floor(num)
    let deciDigit = (num - roundNum).toFixed(1)
    if(deciDigit == 0.5 || deciDigit == 0){ // equals to 0.5 or 0
      return num
    }else if(deciDigit < 0.5){ // less than 0.5
      return Math.round(num) + 0.5   
    }else if(deciDigit > 0.5){  //greater than 0.5
      return Math.ceil(num)
    }
}

// -------- GET DATE X DAYS AGO --------- //

function getDateXDaysAgo(numOfDays, date = new Date()) {
  const daysAgo = new Date(date.getTime());

  daysAgo.setDate(date.getDate() - numOfDays);

  return daysAgo;
}

// ---------------------------------------- //

function getDaysDifference(c){  
  let date = new Date(c)
  let today = new Date()

  if(date.getTime() < today.getTime()) return 0

  let diff = today.setDate(date.getDate() - today.getDate())
  return new Date(diff).getDate()
}

// --------- DELETE FUNCTION ------------- //

function sendAlert(url, msg){
    
  let pw = prompt('Are you sure you want to delete, then enter password', '')
  if(pw == '' || pw == null){        
  }else{                      
      $.ajax({
          url: url,
          method: "DELETE",
          data: {pw}, 
          dataType: 'json',
          error: function(xhr, status, error){
              console.log(xhr, status, error)                
              alert('Some Unknown Error')
          },
          success: function(response){  
              if(response.msg == 'success'){
                  alert(msg)
                  location.reload()                  
              }else if(response.msg == 'error'){
                  alert('Incorrect Password')    
              }               
                                                    
          }
      })
  }
}

// --------------- COMMON ITEM DETAILS FUNCTIONS --------------------------- //
function getOptionString(arr, item){
  let optionListArr = []
  arr.forEach(elem => {
      let temp = `<option value="${elem[item]}">${elem[item]}</option>`
      optionListArr.push(temp)
  })
  return optionListArr.join("")
}

function addInv(){
  let totval = 0      
      
  var itemqty = $("input[name='itemQuantity']").map(function(){return $(this).val();}).get()
  var itemprice = $("input[name='itemPrice']").map(function(){return $(this).val();}).get()
  for(let i = 0; i < itemqty.length; i++){
      totval = parseFloat(totval) + (parseFloat(itemqty[i])*parseFloat(itemprice[i]))
  }
  $('#totalValue').val(totval.toFixed(2))
      
}


//https://nodejs-courierhub.herokuapp.com