const debug = require('debug')('dev')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'

exports.generateOrderExport = (workbook, orders) => {
// --------------------------------------- PROCESS DATA ---------------------------------- //    
    let boxNoArr=[]; lengthArr=[]; widthArr=[]; heightArr=[]; volWtArr=[]; actWtArr=[]
    let itemArr = []; let hsnArr=[]; let qtyArr=[]; let priceArr=[]; 
    let titleArr=[]; let amountArr=[]; let gstArr=[];

    orders.forEach(order => {
        let temp=[]; lengthTemp=[]; widthTemp=[]; heightTemp=[]; volWtTemp=[]; actWtTemp=[]
        let itemTemp=[]; let hsnTemp=[]; let qtyTemp=[]; let priceTemp=[]; 
        let titleTemp=[]; let amountTemp=[]; let gstTemp=[];

        order.boxDetails.forEach((box,i) => {
            
            box.itemDetails.forEach(item => {
                itemTemp.push(item.itemName); hsnTemp.push(item.hsnCode); qtyTemp.push(item.itemQuantity)
                priceTemp.push(item.itemPrice); 
            })

            temp.push(i+1); lengthTemp.push(box.boxLength); widthTemp.push(box.boxWidth)
            heightTemp.push(box.boxHeight); volWtTemp.push(box.volumetricWeight); actWtTemp.push(box.actualWeight)  
        })
        
        order.chargeDetails.forEach(charge => {
            titleTemp.push(charge.title); amountTemp.push(charge.amount); gstTemp.push(charge.gst)
        })

        boxNoArr.push(temp); lengthArr.push(lengthTemp); widthArr.push(widthTemp); heightArr.push(heightTemp)
        volWtArr.push(volWtTemp); actWtArr.push(actWtTemp); 
        itemArr.push(itemTemp); hsnArr.push(hsnTemp); qtyArr.push(qtyTemp); priceArr.push(priceTemp); 
        titleArr.push(titleTemp); amountArr.push(amountTemp); gstArr.push(gstTemp)

    })        


// --------------------------------------- INITIALIZE VARIABLES ---------------------------------- //    
    const sheet = workbook.addWorksheet('orderExport')

    let fontOpts = {'bold': true, 'name': 'Calibri'}
    let fontOpts2 = {'name': 'Calibri'}

    let trbl = {top: {style: 'thin'}, right: {style: 'thin'}, bottom: {style: 'thin'}, left: {style: 'thin'}}

// --------------------------------------- HEADERS ---------------------------------- //    
    let headerArray = ['Date', 'User', 'AWB', 'Consignor', 'Company Name', 'Contact', 'Email', 'Address1', 'Address2', 'Pincode', 'City', 
    'State', 'Country', 'Doc', 'Doc Number', 'Consignee', 'Company Name', 'Contact', 'Email', 'Address1', 'Address2', 'Pincode', 'City', 
    'State', 'Country', 'Boxes', 'Box Type', 'Length', 'Width', 'Height', 'Vol Wt', 'Act Wt', 'Chg Wt', 'Invoice Type', 'Items',
    'Hsn Codes', 'Quantities', 'Prices', 'Total Value', 'Currency', 'Tracking No', 'Vendor', 'Status', 'Coforwarder AWB', 'Client Note',
    'Self Note', 'Base Rate', 'GST', 'FSC', 'GST', 'Charges', 'Amounts', 'GST', 'Total Bill']   

    for(let i = 0; i < headerArray.length; i++){
        sheet.getRow(1).getCell(i+1).alignment = {horizontal: 'center'} 
        sheet.getRow(1).getCell(i+1).value = {'richText': [{'font' : fontOpts, 'text': headerArray[i]}]}
    }

    orders.forEach((order,i) => {
        let clientName = order.client.username
        if(order.miscClients) clientName = order.miscClients

        let currentArr = [moment(order.bookingDate).format(shortDateFormat), clientName, order.awbNumber, order.consignor, 
        order.consignorCompanyName, order.consignorContactName, order.consignorEmail, order.consignorAddress1, order.consignorAddress2, 
        order.consignorPincode, order.consignorPincode, order.consignorCity, order.consignorState, order.origin, order.consignee, 
        order.consigneeCompanyName, order.consigneeContactName, order.consigneeEmail, order.consigneeAddress1, order.consigneeAddress2, 
        order.consigneePincode, order.consigneePincode, order.consigneeCity, order.consigneeState, order.origin, boxNoArr[i],
        order.boxType, lengthArr[i], widthArr[i], heightArr[i], volWtArr[i], actWtArr[i], order.chargeableWeight, order.invoiceType,
        itemArr[i], hsnArr[i], qtyArr[i], priceArr[i], order.totalValue, order.currency, order.trackingNumber, order.vendorName, order.trackingStatus,
        order.coforwarderAwb, order.clientNote, order.selfNote, order.baseRate, order.brGst, order.fuelSurcharge, order.fsGst, 
        titleArr[i], amountArr[i], gstArr[i], order.totalBill
    ]
        
        for(let j = 0; j < currentArr.length; j++){
            if(!currentArr[j]) currentArr[j] = ''            
            sheet.getRow(i+2).getCell(j+1).alignment = {horizontal: 'center'}
            sheet.getRow(i+2).getCell(j+1).value = {'richText': [{'font' : fontOpts2, 'text': currentArr[j]}]}
        }                
    })


}