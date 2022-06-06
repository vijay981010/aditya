let debug = require('debug')('c_app: ledgerExport')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'

exports.generateLedgerExport = (workbook, txns, summary) => {
    
// --------------------------------------- INITIALIZE VARIABLES ---------------------------------- //    
    const sheet = workbook.addWorksheet('ledgerExport')

    let fontOpts = {'bold': true, 'name': 'Calibri'}
    let fontOpts2 = {'name': 'Calibri'}
    let alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}

    let trbl = {top: {style: 'thin'}, right: {style: 'thin'}, bottom: {style: 'thin'}, left: {style: 'thin'}}

// --------------------------------------- HEADERS ---------------------------------- //    
    let headerArray = ['Date', 'Description', 'Debit', 'Credit']   

    for(let i = 0; i < headerArray.length; i++){
        let w = 15
        if(i == 1) w = 40
        sheet.getColumn(i+1).width = w     
        sheet.getRow(1).getCell(i+1).border = trbl
        sheet.getRow(1).getCell(i+1).alignment = {horizontal: 'center'} 
        sheet.getRow(1).getCell(i+1).value = {'richText': [{'font' : fontOpts, 'text': headerArray[i]}]}
    }        

    txns.forEach((item,i) => {

        let date, debit, credit, description
        
        item.date ? date = item.date : date = item.bookingDate        
        
        if(item.totalBill){
            debit = item.totalBill
        }else if(item.type=='debit'){
            debit = item.amount
        }

        if(item.type=='credit') credit = item.amount
        item.description ? description = item.description : description = `awb number: ${item.awbNumber}`        
        
        let currentArr = [moment(date).format(shortDateFormat), description, debit, credit]        
        
        for(let j = 0; j < currentArr.length; j++){
            let row = i+2, cell = j+1
            if(!currentArr[j]) currentArr[j] = ''   
            sheet.getRow(row).height = 35
            sheet.getRow(row).getCell(cell).border = trbl       
            sheet.getRow(row).getCell(cell).alignment = alignment
            sheet.getRow(row).getCell(cell).value = {'richText': [{'font' : fontOpts2, 'text': currentArr[j]}]}
        }         
                
    })

    let len = txns.length
    for(let i = 0; i < 2; i++){
        for(let j = 0; j < headerArray.length; j++){  
            let row = len + i + 2, cell = j+1            
            sheet.getRow(row).height = 35
            sheet.getRow(row).getCell(cell).border = trbl                    
            sheet.getRow(row).getCell(cell).alignment = alignment    
            sheet.getRow(row).getCell(cell).value = {'richText': [{'font' : fontOpts, 'text': summary[i][headerArray[j]]}]}
        }                
    }        

}

/* function renderRow(sheet, start, arr, height, border, fontOpts, alignment){
    for(let i = start; i < arr.length + start; i++){
        let objArr = Object.values(arr[i])
        for(let j = 0; j < objArr.length; i++){
            let row = i + 2, cell = j + 1
            if(!objArr[j]) objArr[j] = ''
            sheet.getRow(row).height = height
            sheet.getRow(row).getCell(cell).border = border
            sheet.getRow(row).getCell(cell).alignment = alignment
            sheet.getRow(row).getCell(cell).value = {'richText': [{'font' : fontOpts, 'text': objArr[j]}]}
        }
    }    
} */