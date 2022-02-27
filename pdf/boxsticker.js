const {createCanvas} = require('canvas')
var JsBarcode = require('jsbarcode')
const fs = require('fs')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'
const logger = require('../helpers/logger')
const debug = require('debug')('dev')
let stream = require('stream')
const fsPromises = require('fs').promises

exports.boxstickergenerate = (current, doc, order, user) => {
  logger.info(`inside box function`)
  doc.info['Title'] = `boxsticker${order.awbNumber}`

  doc    
    .fillColor('black')
    .rect(40, 75, 150, 30).fill()

    .lineWidth(1.5)
    .moveTo(40, 120)
    .lineTo(560, 120).stroke()

    doc
    .fillColor('white')
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(order.service, 40, 80)

    doc.fillColor('black')
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('FROM', 40, 140)
    .font('Helvetica')
    .text(order.consignor, 40, 155)
    .text(`${order.consignorAddress1}, ${order.consignorAddress2}, ${order.consignorCity}, ${order.consignorState}, ${order.consignorPincode}`, 40, 170, {width: 350, align:'left'})    
    .font('Helvetica-Bold')
    .text(order.origin, 40, 215)
    .font('Helvetica')
    .text(`TEL NO: ${order.consignorContactNumber}`, 40, 230)

    .lineWidth(1.5)
    .moveTo(40, 260)
    .lineTo(560, 260).stroke()

    .font('Helvetica-Bold')
    .fontSize(16)
    .text(`BOX NO ${current + 1}/${order.numberOfBoxes}`, 465, 140, {width: 100, align:'left'})
    .rect(440, 160, 115, 30).fill()
    .rect(440, 210, 115, 30).fill()
    .fillColor('white')
    .fontSize(11)
    .text(order.client.username, 445, 165)
    .text(order.service, 445, 215)

    .fillColor('black')
    .font('Helvetica-Bold')
    .fontSize(16)
    .text('TO', 40, 270)
    .font('Helvetica')
    .text(order.consignee, 40, 290)
    .text(`${order.consigneeAddress1}, ${order.consigneeAddress2}, ${order.consigneeCity}, ${order.consigneeState}, ${order.consigneePincode}`, 40, 310, {width: 450, align:'left'})
    .font('Helvetica-Bold')
    .text(order.destination, 40, 370)
    .font('Helvetica')
    .text(`TEL NO: ${order.consigneeContactNumber}`, 40, 390)

    .lineWidth(1.5)
    .moveTo(40, 410)
    .lineTo(560, 410).stroke()

    .fontSize(14)
    .text(`SHIPMENT DATE:`, 40, 430) 
    .text(moment(order.bookingDate).format(shortDateFormat), 160, 430)
    .text(`SHIPMENT WEIGHT: ${order.chargeableWeight}`, 40, 450)
    .text(`NO OF BOX: ${order.numberOfBoxes}`, 40, 470)
    .text(`WAYBILL NO: ${order.awbNumber}`, 300, 450)

    //.image(`box_${order.awbNumber}.png`, 265, 490, {width: 80, align:'center'}) 

    .lineWidth(1.5)
    .moveTo(40, 550)
    .lineTo(560, 550).stroke()

    .text('Office Purpose Only', 230, 570, {width: 150, align:'center'})
    //.image(`box_${order.awbNumber}.png`, 265, 590, {width: 80, align:'center'}) 

    .lineWidth(1.5)
    .moveTo(40, 650)
    .lineTo(560, 650).stroke()

    .text(user.username, 230, 670, {width: 150, align:'center'})
        
}
  
