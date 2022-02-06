var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'

exports.primarydetails = (doc, order) => {

    doc
    .moveTo(40, 40).lineTo(40, 750).stroke() //left vertical line
    .moveTo(300, 60).lineTo(300, 290).stroke() //middle vertical line
    .moveTo(560, 40).lineTo(560, 750).stroke() //right vertical line

    .moveTo(40, 40).lineTo(560, 40).stroke() //top horizontal line

    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Invoice', 275, 45, {width: 50, align:'center'})

    .moveTo(40, 60).lineTo(560, 60).stroke() //2nd horizontal line       

    .text('SHIPPER:', 43, 65, {underline: true})
    .text(order.consignor, 43, 80)
    .font('Helvetica')
    .text(`${order.consignorAddress1}, ${order.consignorAddress2}, ${order.consignorCity}, ${order.consignorState}, ${order.consignorPincode}`, 43, 95, {width: 250, align:'left'})
    .font('Helvetica-Bold')
    .text(order.origin, 43, 155)
    .font('Helvetica')
    .text(`Tel No: ${order.consignorContactNumber}`, 43, 170)
    .text(`Reference: ${order.client.username}`, 43, 185)
    .text(`${order.docType}: ${order.docNumber}`, 43, 200)

    .font('Helvetica-Bold')
    .text('CONSIGNEE:', 303, 65, {underline: true})
    .text(order.consignee, 303, 80)
    .font('Helvetica')        
    .text(`${order.consigneeAddress1}, ${order.consigneeAddress2}, ${order.consigneeCity}, ${order.consigneeState}, ${order.consigneePincode}`, 303, 95, {width: 250, align:'left'})        
    .font('Helvetica-Bold')
    .text(order.destination, 303, 155)
    .font('Helvetica')  
    .text(`Tel No: ${order.consignorContactNumber}`, 303, 170)
    

    .moveTo(40, 215).lineTo(560, 215).stroke() //3rd horizontal line
    
    .text('DATE OF SHIPMENT:', 43, 220)
    .text(moment(order.bookingDate).format(shortDateFormat), 158, 220)
    .text(`AIRWAY BILL NO: ${order.awbNumber}`, 43, 235)
    .text(`COUNTRY OF ORIGIN: ${order.origin}`, 43, 250)
    .text(`FINAL DESTINATION: ${order.destination}`, 43, 265)

    .font('Helvetica-Bold')
    .text('TERMS,UNSOLICITED GIFT FROM INDIVIDUAL TO INDIVIDUAL', 303, 220, {width: 260, align:'left', underline: true})
    .font('Helvetica')
    .text(`NO OF BOX: ${order.numberOfBoxes}`, 303, 250)
    .text(`TOTAL WEIGHT: ${order.chargeableWeight}`, 303, 265)
    .text(`INVOICE NO & DATE: ${order.awbNumber}`, 303, 280)
  }

  exports.boxdetails = (s, doc, order) => {

    doc
    .moveTo(40, s).lineTo(560, s).stroke() //4th horizontal line

    .moveTo(40, s + 20).lineTo(560, s + 20).stroke() //5th horizontal line

    .font('Helvetica-Bold')
    .text('BOX NO', 80, s + 5) //s + 5, 295
    .text('DESCRIPTION', 250, s + 5) //s + 5, 295
    .text('QTY', 430, s + 5) //s + 5, 295
    .text('VALUE', 465, s + 5) //s + 5, 295
    .text('TOTAL', 515, s + 5, {width: 50, align: 'left'}) //s + 5, 295
    .text('TERMS,UNSOLICITED GIFT FROM INDIVIDUAL TO INDIVIDUAL', 178, s + 25, {width: 245, align: 'center'}) //s + 25, 315
    .text(order.currency, 475, s + 25) // s + 25, 315
    .text(order.currency, 525, s + 25, {width: 50, align:'left'}) // s + 25, 315

    .moveTo(40, s + 50).lineTo(560, s + 50).stroke() //5th horizontal line // s + 50, 340

    .moveTo(175, s).lineTo(175, 680).stroke() //bottom 2nd vertical line //s, 290
    .moveTo(420, s).lineTo(420, 750).stroke() //bottom 3rd vertical line //s, 290
    .moveTo(460, s).lineTo(460, 700).stroke() //bottom 4th vertical line //s, 290
    .moveTo(510, s).lineTo(510, 700).stroke() //bottom 5th vertical line //s, 290
}

exports.footerdetails = (page, totalPages, doc, order) => {
    doc
    .moveTo(40, 680).lineTo(560, 680).stroke() //3rd last horizontal line
    .moveTo(40, 700).lineTo(560, 700).stroke() //2nd last horizontal line
    .moveTo(40, 750).lineTo(560, 750).stroke() //bottom horizontal line
    .text('WE HERE BY CONFIRM THAT THE PARCEL DOES NOT INVOLVE ANY COMMERCIAL TRANSACTION. THE VALUE IS DECLARED FOR CUSTOMS PURPOSE ONLY.', 43, 705, {width: 380, height: 300, align:'left'})
    .font('Helvetica')
    .text(order.consignor, 422, 705, {width: 200, height:100, align:'left'})
    .font('Helvetica-Bold')
    .text('AUTHORISED SIGNATORY', 421, 740, {width: 200, height: 50, align:'left'})
    .font('Helvetica')
    .text(`Page No ${page} of ${totalPages}`, 270, 760, {height: 50})        
}