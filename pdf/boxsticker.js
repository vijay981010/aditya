var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'
const debug = require('debug')('dev')
const {getStartRange, getEvenNumbers} = require('./pdfLibrary')

exports.boxstickergenerate = (doc, order, user) => {
    
    //ADD PAGE//
    doc.addPage()    

    //PDF TITLE//
    doc.info['Title'] = `boxlabel${order.awbNumber}`

    //REGISTER FONTS//
    doc.registerFont('reg', 'Helvetica')
    doc.registerFont('bold', 'Helvetica-Bold')
    let fs = 11; let fs2 = 20; let fs3 = 12

    //PDF VARIABLES//
    let fullx = 595; let halfx = fullx/2
    let fully = 842

    //POSITION VARIABLES//
    let x = 30; let y = 30; let w = fullx - x  
    
    //MIDDLE LINE//
    doc.moveTo(x-30, fully/2).lineTo(fullx, fully/2).stroke()    

  // ------- RENDER PDF -------- //
    //GET EVEN NUMBERS//
    let evenNos = getEvenNumbers(order.numberOfBoxes)
    debug(evenNos)
    for(let i = 0; i < order.numberOfBoxes; i++){        
      if(evenNos.indexOf(i) != -1){
          doc.addPage()          
          .moveTo(x-30, fully/2).lineTo(fullx, fully/2).stroke()

          y = 30      
      }
      title()
      fromInfo(25)
      toInfo(120)      
      shipmentInfo(250)
      barCode(310)
      boxInfo(i+1)
      y = 450
    }    

    function title(){            
      let unit = (fs2 * 7.5)/9 //GET UNIT WIDTH VALUE//
      let w = order.service.length * unit //GET TOTAL WIDTH VALUE DEPENDING ON CHARACTERS//
      doc.fillColor('black')
      .rect(x, y, w, 30).fill()

      doc.fillColor('white').font('bold').fontSize(fs2)
      .text(order.service, x, y + 7.5, {width: w, align:'center'})
      .fillColor('black')
    }

    function fromInfo(start){
      //GET SHIPPER INFO//
      let consignorAddress = `${order.consignorAddress1}, ${order.consignorAddress2}, ${order.consignorCity}, ${order.consignorState}, ${order.consignorPincode}`
      //let consignorPhone = `Tel No: ${order.consignorContactNumber}`

      let shipperArr = ['FROM', order.consignor, consignorAddress, order.origin, '']   
      
      //CHECK IF COMPANY//
      if(order.consignorCompanyName) shipperArr.splice(1, 0, order.consignorCompanyName)

      let lwArr = shipperArr.map(info => {        
        let x
        info == consignorAddress ? x = 45 : x = 15
        return x
      })
      
      //IF COMPANY ADJUST//
      if(order.consignorCompanyName){
        lwArr.splice(2, 1, 30)
        lwArr.splice(1, 0, 15)
      }              
      
      let lineArr = getStartRange(15, lwArr)             
      
      shipperArr.forEach((info,i) => {        
        if(info == order.origin || i == 0){
          doc.font('bold').fontSize(fs)
          .text(info, x, y + start + lineArr[i], {width: fullx/1.5 - x, align:'left'})
        }else{
          doc.font('reg').fontSize(fs)
          .text(info, x, y + start + lineArr[i], {width: fullx/1.5 - x, align:'left'})
        }
      })

      doc.moveTo(x, y + start + 105).lineTo(fullx-30, y + start + 105).stroke()
    }

    function toInfo(start){
      //GET CONSIGNEE INFO//
      let consigneeAddress = `${order.consigneeAddress1}, ${order.consigneeAddress2}, ${order.consigneeCity}, ${order.consigneeState}, ${order.consigneePincode}`
      let consigneePhone = `Tel No: ${order.consigneeContactNumber}`
      
      let consigneeArr = ['TO', order.consignee, consigneeAddress, order.destination, consigneePhone]

      //CHECK IF COMPANY//
      
      if(order.consigneeCompanyName) consigneeArr.splice(1, 0, order.consigneeCompanyName)
      
      let lwArr = consigneeArr.map(info => {        
        let x
        info == consigneeAddress ? x = 51 : x = 17
        return x
      })
      
      //IF COMPANY ADJUST//
      if(order.consigneeCompanyName) lwArr.splice(3, 1, 34)                    

      let lineArr = getStartRange(17, lwArr) 

      consigneeArr.forEach((info,i) => {        
        if(info == order.destination || i == 0){
          doc.font('bold').fontSize(14)
          .text(info, x, y + start + lineArr[i], {width: fullx/1.5 - x, align:'left'})
        }else{
          doc.font('reg').fontSize(14)
          .text(info, x, y + start + lineArr[i], {width: fullx/1.5 - x, align:'left'})
        }
      })

      doc.moveTo(x, y + start + 135).lineTo(fullx-30, y + start + 135).stroke()
    }

    function shipmentInfo(start){
      let shipmentDate = `Shipment Date: ${moment(order.bookingDate).format(shortDateFormat)}`
      let awb = `Waybill Number: ${order.awbNumber}`
      //let weight = `Weight: ${order.chargeableWeight}`
      let boxes = `No. of Box: ${order.numberOfBoxes}`

      let shipmentArr = [shipmentDate, awb, boxes]

      let lwArr = [15, 15, 15]
      let lineArr = getStartRange(15, lwArr)

      shipmentArr.forEach((shipment,i) => {
          doc.font('reg').fontSize(fs)
          .text(shipment, x, y + start + lineArr[i], {width: w, align:'left'})
      })
    }

    function barCode(start){
      doc.image(`box_${order.awbNumber}.png`, fullx/2 - 40, y + start, {width: 80, height: 60, align: 'center'})      
    }

    function boxInfo(current){
      let unit = (fs3 * 7.5)/12 //GET UNIT WIDTH VALUE//  
      
      //DETERMIN CLIENT NAME//
      let clientName      
      order.client.username != 'Miscellaneous' ? clientName = order.client.username : clientName = order.miscClients       

      // ----------- //
      let lwArr = [30, 30]
      let lineArr = getStartRange(65, lwArr)
      
      let infoArr = [clientName, order.service]
      let wArr = infoArr.map(info => info.length * unit)  
      
      // ----------- //
      doc.font('bold').fontSize(fs2)
      .text(`Box No. ${current}/${order.numberOfBoxes}`, fullx/2, y + 40, {width: fullx/2 - x, align:'right'})
      
      // ----------- //
      lineArr.forEach((line,i) => {
        doc.fillColor('black')
        .rect(fullx - x - wArr[i], y + line, wArr[i], 25).fill()

        doc.fillColor('white').font('bold').fontSize(fs3)
        .text(infoArr[i], fullx - x - wArr[i], y + line + 7.5, {width: wArr[i], align:'center'})
      })      
            
    }      
}
  
