const debug = require('debug')('c_app: packingListExcel')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'
const { ToWords } = require('to-words')

//NUMBER TO WORDS CONFIG//
const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      //currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
    }
  })

exports.generatePackingList = (workbook, order, itemArr, boxArr, totArr) => {
    const sheet = workbook.addWorksheet('PackingList')

// ---------------------------- BORDERS, MERGE CELLS -------------------- //    
    let trbl = {top: {style: 'thin'}, right: {style: 'thin'}, bottom: {style: 'thin'}, left: {style: 'thin'}} 

    sheet.mergeCells(`A1: H1`)  
    sheet.getRow(1).getCell(1).border = trbl
    
    for(let i = 2; i < 17; i++){
        sheet.mergeCells(`A${i}: D${i}`)
        sheet.mergeCells(`E${i}: H${i}`)

        sheet.getRow(i).getCell(1).border = trbl            
        sheet.getRow(i).getCell(5).border = trbl 
           
        sheet.getRow(i).getCell(1).alignment = {horizontal: 'left'}
        sheet.getRow(i).getCell(5).alignment = {horizontal: 'left'}    
    }    
    
    sheet.mergeCells(`B17: D17`) 
    sheet.mergeCells(`B18: D18`)  

    for(let i = 1; i < 9; i++){
        sheet.getRow(17).getCell(i).border = trbl
        sheet.getRow(18).getCell(i).border = trbl

        sheet.getColumn(i).width = 15
    }
    
// --------------------------------------- HEADERS ---------------------------------- //

    let fontOpts = {'bold': true, 'name': 'Calibri'}
    let fontOpts2 = {'name': 'Calibri'}

    sheet.getRow(1).getCell(1).alignment = {horizontal: 'center'}
    sheet.getRow(1).getCell(1).value = {
        'richText': [{'font' : fontOpts, 'text': 'Invoice'}]
    }

    sheet.getRow(2).getCell(1).value = {
        'richText': [{'font' : fontOpts, 'text': 'Shipper'}]
    }

    sheet.getRow(2).getCell(5).value = {
        'richText': [{'font' : fontOpts, 'text': 'Consignee'}]
    }

    let headerArray = ['Box No.', 'Description', 'HSN', 'Qty', 'Value', 'Total']      
    let header2Array = ['', 'TERMS,UNSOLICITED GIFT FROM INDIVIDUAL TO INDIVIDUAL', '', '', order.currency, order.currency] 
    sheet.getRow(18).height = 50 

    for(let i = 1; i < 3; i++){                     
        sheet.getRow(17).getCell(i).alignment = {horizontal: 'center'}        
        sheet.getRow(18).getCell(i).alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}                       
        
        sheet.getRow(17).getCell(i).value = {
            'richText': [{'font' : fontOpts, 'text': headerArray[i-1]}]
        }
        sheet.getRow(18).getCell(i).value = {
            'richText': [{'font' : fontOpts, 'text': header2Array[i-1]}]
        }        
    }    

    for(let i = 5; i < 9; i++){              
        sheet.getRow(17).getCell(i).alignment = {horizontal: 'center'}            
        sheet.getRow(18).getCell(i).alignment = {horizontal: 'center', vertical: 'middle'}                    

        sheet.getRow(17).getCell(i).value = {
            'richText': [{'font' : fontOpts, 'text': headerArray[i-3]}]
        }
        sheet.getRow(18).getCell(i).value = {
            'richText': [{'font' : fontOpts, 'text': header2Array[i-3]}]
        }
    }     
    
// --------------------------------------- VALUES ---------------------------------- //
    
    let shipperArr = [order.consignor, order.consignorAddress1, order.consignorAddress2, order.consignorPincode,
        order.consignorCity, order.consignorState, order.origin, `Tel. No: ${order.consignorContactNumber}`, 
        `Reference: ${order.client.username}`, `${order.docType}: ${order.docNumber}`, 
        `Date Of Shipment: ${moment(order.bookingDate).format(shortDateFormat)}`, `Airway Bill No: ${order.awbNumber}`,
        `Country Of Origin: ${order.origin}`, `Final Destination: ${order.destination}`]

    let consigneeArr = [order.consignee, order.consigneeAddress1, order.consigneeAddress2, order.consigneePincode,
        order.consigneeCity, order.consigneeState, order.destination, `Tel. No: ${order.consigneeContactNumber}`, '', '',
        'Terms,Unsolicited Gift From Individual to Individual', `No. Of Box: ${order.numberOfBoxes}`, `Total Weight: ${order.chargeableWeight}`,
        `Invoice No. and Date: ${order.awbNumber}`]

    for(let i = 3; i < 17; i++){        
        sheet.getRow(i).getCell(1).value = {
            'richText': [{'font' : fontOpts2, 'text': shipperArr[i-3]}]
        }

        sheet.getRow(i).getCell(5).value = {
            'richText': [{'font' : fontOpts2, 'text': consigneeArr[i-3]}]
        }
    }

    for(let j = 0; j < itemArr.length; j++){
        let start = j + 19
        sheet.mergeCells(`B${start}: D${start}`)  
        
        //let valueArr = [`${compData.boxNumberArray[j]} ${compData.dimensionArray[j]}`, compData.itemArray[j]]
        let valueArr = [boxArr[j], itemArr[j].itemName]
        for(let i = 1; i < 3; i++){
            sheet.getRow(start).height = 30
            sheet.getRow(start).getCell(i).alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}
            sheet.getRow(start).getCell(i).border = trbl    
            
            if(valueArr[i-1] != 'undefined undefined'){
                sheet.getRow(start).getCell(i).value = {
                    'richText': [{'font' : fontOpts2, 'text': valueArr[i-1]}] 
                }
            }            
        }            
    }

    for(let j = 0; j < itemArr.length; j++){
        let start = j + 19        
        let qty = `${itemArr[j].itemQuantity} ${itemArr[j].packagingType}` 
        //let valueArr = [compData.qtyArray[j], compData.priceArray[j], compData.totalArray[j]]
        let valueArr = [itemArr[j].hsnCode, qty, itemArr[j].itemPrice, totArr[j]]

        for(let i = 5; i < 9; i++){
            sheet.getRow(start).getCell(i).alignment = {horizontal: 'center', vertical: 'middle'}
            sheet.getRow(start).getCell(i).border = trbl   

            sheet.getRow(start).getCell(i).value = {
                'richText': [{'font' : fontOpts2, 'text': valueArr[i-5]}] 
            }
        }            
    }

// --------------------------------------- FOOTER ---------------------------------- //
    let maxHeight = 36
    let filledRows = itemArr.length + 19
    let footerStart
    debug(filledRows)
    //ADJUST FOOTER START DEPENDING ON TOTAL ITEMS//
    if(filledRows >= maxHeight){
        footerStart = filledRows + 1
    }else{
        footerStart = maxHeight
    }        

    let footerEnd = footerStart + 1
    debug(footerStart, footerEnd)
    //AREA AFTER ALL ITEMS ARE RENDERED//
    for(let i = filledRows; i < footerStart; i++){
        sheet.mergeCells(`B${i}: D${i}`) 
        for(let j = 1; j < 9; j++){
            sheet.getRow(i).getCell(j).border = trbl            
        }        
    } 

    let words = toWords.convert(order.totalValue)

    //FINAL TOTAL SUMMARY SECTION//
    let footerArr = [`${order.currency} ${words} only`, '', 'Total', order.currency, order.totalValue]
    for(let i = 4; i < 9; i++){
        sheet.getRow(footerStart - 1).getCell(i).alignment = {horizontal: 'center'}
        sheet.getRow(footerStart - 1).getCell(i).value = {
            'richText': [{'font' : fontOpts, 'text': footerArr[i-4]}]
        }
    }    

// --------------------------- LAST ROWS --------------------------- //
    //MERGE ROWS AND CELLS//
    sheet.mergeCells(`A${footerStart}:E${footerEnd}`)
    sheet.mergeCells(`F${footerStart}:H${footerEnd}`)

    sheet.getRow(footerStart).getCell(1).border = trbl
    sheet.getRow(footerStart).getCell(5).border = trbl    
    
    //SET HEIGHT//
    sheet.getRow(footerStart).height = 40   

    //RENDER VALUES//
    sheet.getRow(footerStart).getCell(1).alignment = {horizontal: 'left', vertical: 'middle', wrapText: true}
    sheet.getRow(footerStart).getCell(1).value = {
        'richText': [{'font' : fontOpts, 'text': `We here by Confirm that the Parcel does not involve any Commercial Transaction. The Value is declared for Customs Purpose only`}]
    }

    sheet.getRow(footerStart).getCell(6).alignment = {horizontal: 'center'}
    sheet.getRow(footerStart).getCell(6).value = {
        'richText': [{'font' : fontOpts, 'text': `Authorized Signatory: ${order.consignor}`}]
    }
}