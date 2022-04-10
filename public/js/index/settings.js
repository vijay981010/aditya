let environment = {}

if(window.location.hostname == 'localhost'){
    environment.baseurl = "http://localhost:3000"    
}else{
    environment.baseurl = `https://${window.location.hostname}`
}

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


//https://nodejs-courierhub.herokuapp.com