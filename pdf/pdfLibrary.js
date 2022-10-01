exports.getStartRange = (start, widthArr) => {
    let startArr = [start]        
    for(let i = 0; i < widthArr.length-1; i++){
        let temp =   startArr[i] + widthArr[i]
        startArr.push(temp)  
    }
    return startArr
  }

exports.getEvenNumbers = (num) => {
    let arr = []
    for(let i = 1; i <= num; i++){
      arr.push(i)
    }    
    return arr.filter(item => item%2 == 0)    
  }

exports.removeNextLine = (strValue) => {
    strValue = strValue.split('\r')
    return strValue.join(" ")
    // const regEx = /[\r|/]/g
    // return str.replace(regEx, " ")
  
}