
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'
const debug = require('debug')('dev')

exports.generateAwb = (doc, order, user, office) => {
    debug(office)
    let totalVolWeight = 0
    let totalActualWeight = 0

    order.boxDetails.forEach(box => {
        totalVolWeight += box.volumetricWeight
        totalActualWeight += box.actualWeight
    })    

    doc.info['Title'] = `awb${order.awbNumber}`

    doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(`AIRWAY BILL`, 175, 50, {width: 250, align: 'center'})
    .fontSize(15)

    if(user.username != 'eps'){
      doc.text(user.displayName, 175, 75, {width: 250, align: 'center'}) //user.username
    }
    

    doc
    .lineWidth(2)
    .moveTo(40, 100).lineTo(560, 100).stroke() // first horizontal line
    .moveTo(40, 485).lineTo(560, 485).stroke() // last horizontal line    
    .moveTo(40, 100).lineTo(40, 485).stroke() // first vertical line
    .moveTo(560, 100).lineTo(560, 485).stroke() // last vertical line

    .moveTo(40, 150).lineTo(440, 150).stroke() //second horizontal line
    .moveTo(40, 200).lineTo(560, 200).stroke() //third horizontal line
    .moveTo(40, 325).lineTo(560, 325).stroke() //fourth horizontal line
    .moveTo(40, 350).lineTo(560, 350).stroke() //fifth horizontal line
    .moveTo(40, 385).lineTo(560, 385).stroke() //sixth horizontal line
    .moveTo(40, 435).lineTo(450, 435).stroke() //seventh horizontal line

    .moveTo(270, 100).lineTo(270, 324).stroke() //first-third first vertical line
    .moveTo(440, 100).lineTo(440, 324).stroke() //first-third second vertical line

    .moveTo(140, 100).lineTo(140, 150).stroke() //accounts first vertical line
    .moveTo(195, 100).lineTo(195, 150).stroke() //accounts second vertical line
    .moveTo(40, 125).lineTo(270, 125).stroke() //accounts horizontal line

    .moveTo(440, 175).lineTo(560, 175).stroke() //box horizontal line
    .moveTo(510, 175).lineTo(510, 200).stroke() //box vertical line

    .moveTo(440, 262.5).lineTo(560, 262.5).stroke() //boxtype-chargeable weight horizontal line

    .moveTo(170, 325).lineTo(170, 350).stroke() //weight first vertical line
    .moveTo(300, 325).lineTo(300, 350).stroke() //weight second vertical line
    .moveTo(430, 325).lineTo(430, 350).stroke() //weight thirs vertical line

    .moveTo(285, 350).lineTo(285, 485).stroke() //last-part first vertical line
    .moveTo(450, 350).lineTo(450, 485).stroke() //last-part second vertical line

    .moveTo(165, 435).lineTo(165, 485).stroke() //received-by vertical line

    .moveTo(365, 435).lineTo(365, 485).stroke() //accounts copy vertical line

    doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('ACCOUNT', 65, 110)
    .text('ORIGIN', 150, 110)
    .text('DESTINATION', 205, 110)
    .text('SHIPPER', 45, 155)
    if(order.consignorCompanyName){
      doc
      .text(order.consignorCompanyName, 45, 165)
      .text(order.consignor, 45, 175)
      .text('ATTN:NAME/DEPT:', 45, 185)
    }else{
      doc
      .text(order.consignor, 45, 165)
      .text('ATTN:NAME/DEPT:', 45, 175)
    }
    doc
    .text('CONSIGNEE', 275, 155)
    if(order.consigneeCompanyName){
      doc
      .text(order.consigneeCompanyName, 275, 165)
      .text(order.consignee, 275, 175)
      .text('ATTN:NAME/DEPT:', 275, 185)
    }else{
      doc
      .text(order.consignee, 275, 165)
      .text('ATTN:NAME/DEPT:', 275, 175)
    }
    doc
    .text('NO. OF BOX', 445, 185)

    .text('SHIPPER ADDRESS', 45, 205)
    .text('PINCODE:', 45, 295, {width: 220, align:'left'})
    .text('TEL NO:', 45, 305, {width: 220, align:'left'})
    .text('AADHAR NO:', 45, 315, {width: 220, align:'left'})

    .text('CONSIGNEE ADDRESS', 275, 205)
    .text('PINCODE:', 275, 295, {width: 220, align:'left'})
    .text('TEL NO:', 275, 305, {width: 220, align:'left'})    

    .text('CHARGEABLE WEIGHT (KG)', 455, 210, {align: 'center'})
    .text('TYPE', 485, 280)
    .text('VOLUMETRIC WEIGHT (KG)', 45, 335)
    .text('ACTUAL WEIGHT (KG)', 320, 335)
    .text('DESCRIPTION AND VALUE OF GOODS:', 50, 355)
    .text('SERVICE:', 300, 360)
    .text('BOX DIMENSIONS', 460, 365)

    doc
    .font('Helvetica')
    .fontSize(9)
    if(order.client.username != 'Miscellaneous'){
      doc.text(order.client.username, 65, 130, {width: 60, align:'left'})
    }else{
      doc.text(order.miscClients, 65, 130, {width: 60, align:'left'})
    }    
    doc
    .text(order.origin, 160, 130, {width: 60, align:'left'})
    .text(order.destination, 200, 130, {width: 60, align:'left'})
        
    .text(order.numberOfBoxes, 530, 185)
    
    .text(order.consignorAddress1, 45, 215, {width: 220, align:'left'})
    .text(order.consignorAddress2, 45, 245, {width: 220, align:'left'})
    .text(order.consignorCity, 45, 265, {width: 220, align:'left'})
    .text(order.consignorState, 45, 275, {width: 220, align:'left'})
    .text(order.origin, 45, 285, {width: 220, align:'left'})
    .text(order.consignorPincode, 95, 295, {width: 220, align:'left'})
    .text(order.consignorContactNumber, 85, 305, {width: 220, align:'left'})
    .text(`${order.docType}: ${order.docNumber}`, 105, 315, {width: 220, align:'left'})

    .text(order.consigneeAddress1, 275, 215, {width: 160, align:'left'})
    .text(order.consigneeAddress2, 275, 245, {width: 160, align:'left'})
    .text(order.consigneeCity, 275, 265, {width: 220, align:'left'})
    .text(order.consigneeState, 275, 275, {width: 220, align:'left'})
    .text(order.destination, 275, 285, {width: 220, align:'left'})
    .text(order.consigneePincode, 325, 295, {width: 220, align:'left'})
    .text(order.consigneeContactNumber, 315, 305, {width: 220, align:'left'})    

    if(!office){
      doc
      .text(order.chargeableWeight, 455, 240, {align: 'center'})
      .text(totalVolWeight, 175, 335)
      .text(totalActualWeight, 450, 335)
    } 
    doc
    .text(order.boxType, 485, 300)

    .text(order.service, 345, 360, {width: 75, align: 'center'})

    .text('AS PER ATTACHED INVOICE', 50, 365)

    order.boxDetails.forEach((box, i) => {
      doc
      .text(`${box.boxLength}x${box.boxWidth}x${box.boxHeight}`, 480, 425 + (i*15), {width: 50, align: 'center'})
    })    

    doc
    .font('Helvetica')
    .fontSize(8)
    .text('The Shipper has read, understood and agrees to the standard terms andconditions of carriage', 45, 390, {width: 225, align: 'left'})
    .text("SHIPPER'S SIGN", 45, 420)

    .text('RECEIVED IN GOOD ORDER AND CONDITION', 295, 390, {width: 155, align: 'left'})
    .text("RECEIVER'S SIGN", 295, 420)

    .text("RECEIVED BY", 45, 440)
    .text("Parcel Solution", 45, 450)

    .text("DATE", 45, 470)
    .text(moment(order.bookingDate).format(shortDateFormat), 70, 470) //moment(order.bookingDate).format(shortDateFormat)

    .text("REFERENCE NO", 175, 440)

    .text("ACCOUNTS COPY", 300, 450, {width: 50, align: 'left'})

    .text("DATE & TIME", 380, 450, {width: 50, align: 'left'})

    doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('AIRWAY BILL NO', 310, 110)
    .text(order.awbNumber, 310, 125, { width: 100, align: 'center' })
    .image(`awb_${order.awbNumber}.png`, 455, 105, {width: 90, align:'center'})
}