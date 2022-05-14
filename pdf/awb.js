
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'
const debug = require('debug')('dev')
const {getEvenNumbers} = require('./pdfLibrary')

let full = 595
let centerAlign = {width:full, align:'center'} 

exports.generateAwb = (doc, order, user, consignee) => {

    //COMPUTE TOTAL VOLUMETRIC WEIGHT AND ACTUAL WEIGHT//
    let totalVolWeight = 0
    let totalActualWeight = 0

    order.boxDetails.forEach(box => {
        totalVolWeight += box.volumetricWeight
        totalActualWeight += box.actualWeight
    })    
    
    totalVolWeight = totalVolWeight.toFixed(2)
    totalActualWeight = totalActualWeight.toFixed(2)

    doc.info['Title'] = `awb${order.awbNumber}` //TITLE TO PDF//
    
    //ACCORDING TO COPY TYPE RENDER PDFS//
    if(consignee){
      let copy = 'CONSIGNEE COPY'//COPY NAME      
      
      let titleX = 0; let titleY = 20
      let copyX = 40; let copyY = 60
      let gap = 420

      let evenNos = getEvenNumbers(order.numberOfBoxes)
      debug(evenNos)

      for(let i = 0; i < order.numberOfBoxes; i++){        
        if(evenNos.indexOf(i) != -1){
          doc.addPage()
          titleX = 0; titleY = 20; copyX = 40; copyY = 60
        }
        debug(titleY, copyY)  
        awbTitle(doc, user, titleX, titleY)  
        awbCopy(doc, user, order, consignee, totalVolWeight, totalActualWeight, copy, i+1, copyX, copyY)        
        titleY +=  gap
        copyY += gap

        //RENDER CUT LINE IN MIDDLE OF EVERY PAGE//
        doc.moveTo(0, 420).lineTo(full, 420).stroke()
      }

      
    }else{
      //COPY NAME//
      let copy1 = 'ACCOUNT COPY'
      let copy2 = 'CONSIGNOR COPY'

      //CALL FUNCTIONS//
      awbTitle(doc, user, 0, 20)
      awbCopy(doc, user, order, consignee, totalVolWeight, totalActualWeight, copy1, '', 40, 60)    

      awbTitle(doc, user, 0, 440)
      awbCopy(doc, user, order, consignee, totalVolWeight, totalActualWeight, copy2, '', 40, 480)

      doc.moveTo(0, 420).lineTo(full, 420).stroke() //RENDER CUT LINE IN BETWEEN PAGE//
    }

}

function awbTitle(doc, user, x, y){  
  //GET LOGO FILE PREFIX//
  let filePrefix = user.trackingId
  if(user.role == 'client') filePrefix = user.admin.trackingId

  //MAIN TITLE//
  doc
  .font('Helvetica-Bold').fontSize(20)
  .text(`AIRWAY BILL`, x, y, centerAlign)   
  
  //CHECK FOR DISPLAY NAME//
  if(user.role=='admin' && !user.settings.displayNoName){
    doc
    .font('Helvetica-Bold').fontSize(15)
    .text(user.displayName, x, y+20, centerAlign)
  }
  
  //CHECK FOR LOGO//
  if(user.role=='admin' && user.settings.awbPrintBranding || user.role=='client' && user.admin.clientSettings.awbPrintBranding){
      doc.image(`${filePrefix}-logo.png`, x+40, y-20, {width: 60, align:'left'})
  }
}

// ----------------------------------------------------------------------------------------------------------------- //

function awbCopy(doc, user, order, consignee, totalVolWeight, totalActualWeight, copy, currentBox, x, y){
  //CHECK MISCELLANEOUS USER//
  let accountData
  order.client.username != 'Miscellaneous' ? accountData = order.client.username : accountData = order.miscClients  

  //MAIN BOX//
  doc
  .lineWidth(2)
  .rect(x, y, 520, 335).stroke()

  //INTERNAL HORIZONTAL LINES//
  let vgArr = [25, 50, 75, 100, 131, 162, 193, 225, 255, 305]
  let hsgArr = [0, 0, 400, 0, 400, 400, 400, 0, 0, 0, 0]
  let hegArr = [230, 400, 520, 520, 520, 520, 520, 520, 520, 410]

  for(let i = 0; i < vgArr.length; i++){
    doc
    .moveTo(x + hsgArr[i], y + vgArr[i])
    .lineTo(x + hegArr[i], y + vgArr[i])
    .stroke()
  }

  //INTERNAL VERTICAL LINES//
  let hgArr = [100, 125, 155, 230, 245, 325, 400, 410, 470]
  let vsgArr = [0, 305, 0, 0, 225, 305, 0, 225, 75]  
  let vegArr = [50, 335, 50, 224, 335, 335, 224, 335, 100]

  for(let i = 0; i < hgArr.length; i++){
    doc
    .moveTo(x + hgArr[i], y + vsgArr[i])
    .lineTo(x + hgArr[i], y + vegArr[i])
    .stroke()
  }

  //AWBNO BOX //
    doc
    .font('Helvetica-Bold').fontSize(12)
    .text('AIRWAY BILL NO', 275, y+10, {width: 160, align:'center'})
    .text(order.awbNumber, 275, y+25, { width: 160, align: 'center' })
    .image(`awb_${order.awbNumber}.png`, 455, y+5, {width: 90, height: 65, align:'center'})

  //TITLES OF BOXES//
    doc
    .fontSize(8)
    .text('ACCOUNT', 40, y+10, { width: 100, align: 'center' })    
    .text('ORIGIN', 145, y+10, { width: 45, align: 'center' })
    .text('DESTINATION', 195, y+10, { width: 75, align: 'center' })
    .text('SHIPPER', 45, y+55)

    if(order.consignorCompanyName){
      doc
      .text(order.consignorCompanyName, 45, y+65)
      .text(order.consignor, 45, y+75)
      .text('ATTN:NAME/DEPT:', 45, y+85)
    }else{
      doc
      .text(order.consignor, 45, y+65)
      .text('ATTN:NAME/DEPT:', 45, y+75)
    }

    doc
    .text('CONSIGNEE', 275, y+55)

    if(order.consigneeCompanyName){
      doc
      .text(order.consigneeCompanyName, 275, y+65)
      .text(order.consignee, 275, y+75)
      .text('ATTN:NAME/DEPT:', 275, y+85)
    }else{
      doc
      .text(order.consignee, 275, y+65)
      .text('ATTN:NAME/DEPT:', 275, y+75)
    }

    doc
    .text('NO. OF BOX', 445, y+85, { width: 60, align: 'center' })

    .text('SHIPPER ADDRESS', 45, y+105)
    .text('PINCODE:', 45, y+195, {width: 220, align:'left'})
    .text('TEL NO:', 45, y+205, {width: 220, align:'left'})
    

    .text('CONSIGNEE ADDRESS', 275, y+105)
    .text('ZIPCODE:', 275, y+195, {width: 220, align:'left'})
    .text('TEL NO:', 275, y+205, {width: 220, align:'left'})    

    .text('CHARGEABLE WEIGHT (KG)', 440, y+105, {width: 120, align: 'center'})
    .text('SHIPMENT TYPE', 440, y+200, {width: 120, align: 'center'})
    .text('VOLUMETRIC WEIGHT (KG)', 440, y+137.5, {width: 120, align: 'center'})
    .text('ACTUAL WEIGHT (KG)', 440, y+170, {width: 120, align: 'center'})
    .text('DESCRIPTION AND VALUE OF GOODS:', 45, y+230)
    .text(`SERVICE: ${order.service}`, 290, y+235, {width: 150, align: 'left'})
    .text('BOX DIMENSIONS', 450, y+235, {width: 110, align: 'center'})

    doc
    .font('Helvetica').fontSize(9)    
    .text(accountData, 40, y+29, { width: 100, align: 'center' })
      
    doc
    .text(order.origin, 145, y+29, { width: 45, align: 'center' })
    .text(order.destination, 195, y+29, { width: 75, align: 'center' })      
    
    .text(order.consignorAddress1, 45, y+115, {width: 220, align:'left'})
    .text(order.consignorAddress2, 45, y+145, {width: 220, align:'left'})
    .text(order.consignorCity, 45, y+165, {width: 220, align:'left'})
    .text(order.consignorState, 45, y+175, {width: 220, align:'left'})
    .text(order.origin, 45, y+185, {width: 220, align:'left'})
    .text(order.consignorPincode, 95, y+195, {width: 220, align:'left'})
    .text(order.consignorContactNumber, 85, y+205, {width: 220, align:'left'})
    .text(`${order.docType}: ${order.docNumber}`, 45, y+215, {width: 220, align:'left'})

    .text(order.consigneeAddress1, 275, y+115, {width: 160, align:'left'})
    .text(order.consigneeAddress2, 275, y+145, {width: 160, align:'left'})
    .text(order.consigneeCity, 275, y+165, {width: 220, align:'left'})
    .text(order.consigneeState, 275, y+175, {width: 220, align:'left'})
    .text(order.destination, 275, y+185, {width: 220, align:'left'})
    .text(order.consigneePincode, 325, y+195, {width: 220, align:'left'})
    .text(order.consigneeContactNumber, 315, y+205, {width: 220, align:'left'})    

    if(!consignee){
      doc
      .text(order.chargeableWeight, 440, y+115, {width: 120, align: 'center'})
      .text(totalVolWeight, 440, y+147.5, {width: 120, align: 'center'})
      .text(totalActualWeight, 440, y+180, {width: 120, align: 'center'})
    } 
    doc
    .text(order.boxType, 440, y+210, {width: 120, align: 'center'})    

    .text('As Per Attached Invoice', 45, y+240)

      

    //RENDER BOX NUMBER AND BOX DIMENSIONS//
    if(!consignee){
      doc.text(order.numberOfBoxes, 510, y+85, { width: 50, align: 'center' }) 

      order.boxDetails.forEach((box, i) => {
        doc.text(`${box.boxLength}x${box.boxWidth}x${box.boxHeight}`, 450, y+260 + (i*10), {width: 110, height:10, align: 'center'})          
      })
    }else{
      doc.text(`${currentBox}/${order.numberOfBoxes}`, 510, y+85, { width: 50, align: 'center' }) 
      let idx = currentBox-1
      let dimension = `${order.boxDetails[idx].boxLength}x${order.boxDetails[idx].boxWidth}x${order.boxDetails[idx].boxHeight}`
      doc.text(`${dimension}`, 450, y+290, {width: 110, height:10, align: 'center'})
    }

    //RENDER COPY NAME//
    doc
    .rect(285, y+305, 80, 30).fill('black')
    .font('Helvetica-Bold').fill('white')
    .text(copy, 290, y+310, {width: 70, height:30, align: 'left'})

    doc
    .font('Helvetica').fontSize(8).fill('black')
    .text('The Shipper has read, understood and agrees to the standard terms andconditions of carriage', 45, y+260, {width: 225, align: 'left'})    
    .text("SHIPPER'S SIGN", 45, y+290, {height:15})
    
    .text('RECEIVED IN GOOD ORDER AND CONDITION', 290, y+260, {width: 155, height:15, align: 'left'})
    .text("RECEIVER'S SIGN", 290, y+290, {height:15})

    .text("RECEIVED BY", 45, y+310, {width: 125, height:15, align: 'left'})

    .text("REFERENCE NO", 170, y+310, {height:15})

    

    .text("DATE", 370, y+310, {width: 50, height:15, align: 'left'})
    .text(moment(order.bookingDate).format(shortDateFormat), 370, y+325, {width: 50, height:15, align: 'left'})  
    
}

// -------------------------------------------- //

