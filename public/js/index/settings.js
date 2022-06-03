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


//https://nodejs-courierhub.herokuapp.com