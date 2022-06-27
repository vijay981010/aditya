const debug = require('debug')('c_app: exportService')

exports.getService = (workbook, service, fsc) => {
    const zoneSheet = workbook.addWorksheet('zonedata')
    const rateSheet = workbook.addWorksheet('ratedata')
    
    //COMPUTE DATA FOR ZONESHEET//
    let zonelist = service.zone.map(item => item.zoneName)
    let countrylist = service.zone.map(item => item.countries)
    
    //GET DATA FOR RATESHEET//
    let weightlist = service.zone[0].ratechart.map(rate => rate.weight)
    let ratelistArr = []
    service.zone.forEach(item => {
        let temp = []                
        item.ratechart.forEach(rate => {
            //CHECK IF WITH FSC OR W/O FSC
            let pushVal = reversePercentage(rate.rate, service.serviceFsc)
            if(fsc) pushVal = rate.rate

            temp.push(pushVal)
        })
        ratelistArr.push(temp)
    })

    let ratedataListHeaderArr = service.zone.map(item => item.zoneName)
    ratedataListHeaderArr.unshift('weight')
    
    //SET FIXED EXCEL VARIABLES//
    let fontOpts = {'bold': true, 'name': 'Calibri'}
    let fontOpts2 = {'name': 'Calibri'}

// -------------------------------- ZONE DATA SHEET ------------------------------------- //

    zonelist.forEach((item,i) => {
        zoneSheet.getRow(1).getCell(i+1).alignment = {horizontal: 'center'}
        zoneSheet.getRow(1).getCell(i+1).value = {'richText': [{'font': fontOpts, 'text': item}]}
    })

    countrylist.forEach((country,i) => {        
        for(let j = 0; j < country.length; j++){            
            zoneSheet.getRow(j+2).getCell(i+1).alignment = {horizontal: 'center'}
            zoneSheet.getRow(j+2).getCell(i+1).value = {'richText': [{'font': fontOpts2, 'text': country[j]}]}
        }        
    })

// -------------------------------- RATE DATA SHEET ------------------------------------- //

    ratedataListHeaderArr.forEach((item,i) => {
        rateSheet.getRow(1).getCell(i+1).alignment = {horizontal: 'center'}
        rateSheet.getRow(1).getCell(i+1).value = {'richText': [{'font': fontOpts, 'text': item}]}
    })

    weightlist.forEach((weight,i) => {        
        rateSheet.getRow(i+2).getCell(1).alignment = {horizontal: 'center'}
        rateSheet.getRow(i+2).getCell(1).value = {'richText': [{'font': fontOpts2, 'text': weight}]}
    })

    ratelistArr.forEach((rate,i) => {        
        for(let j = 0; j < rate.length; j++){            
            rateSheet.getRow(j+2).getCell(i+2).alignment = {horizontal: 'center'}
            rateSheet.getRow(j+2).getCell(i+2).value = {'richText': [{'font': fontOpts2, 'text': rate[j]}]}
        }        
    })
    
}

//-------------------------------------------------- //


function reversePercentage(finalNum, per) {
    return ((finalNum*100)/(per+100))
 }