const debug = require('debug')('dev')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'

exports.detailedInvoice = (doc, orders, invoice) => {
// ---- Calculate Total Number of Pages ------ //
    let start = 0  
    let breakpoint = 8
    let fconst = 8
    //debug(orders.length % breakpoint)
    let totalPages
    if(orders.length % breakpoint > 0){
        totalPages = Math.ceil(orders.length / breakpoint)
    }else if(orders.length % breakpoint == 0){
        totalPages = orders.length / breakpoint
    }

// ----- In case, there is only one page, then new breakpoint is set
    if(totalPages == 1){
        breakpoint = orders.length
    }

    //debug(totalPages)

// ---- Loop through each page by virtually splitting the array as per the breakpoint ---- //
    for(let i = 0; i < totalPages; i++){             
        //debug(start, breakpoint)
        doc.addPage()

        //debug(i, start, breakpoint)
        invoicerDetails(doc)
        awbTable(doc, orders, start, breakpoint)
        footerDetails(doc, i + 1, totalPages)
        if(i == totalPages - 1){
            summ(doc, invoice)
        }
        
        start = breakpoint //update the startpoint for next page
        
        //update the breakpoint with a condition for last element
        if((breakpoint + fconst) > orders.length){
            breakpoint = orders.length
        }else{
            breakpoint += fconst
        }
    }
    
}

// ----------------------------------- FUNCTIONS -------------------------------- //

function invoicerDetails(doc){
    let x = 410, y = 30, g = 15

    // LOGO
    /* doc
    .image('detailed-anshika-logo.jpg', 560, 15, {width: 30, align:'right'})  */

    // COMPANY NAME
    doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('ANSHIKA INTERNATIONAL LTD.', x, y, {width: 400, align: 'right'}) //user.companyName
    .font('Helvetica')
    .fontSize(12)    

    // UPPER LINE
    doc
    .moveTo(30, 50).lineTo(810, 50).stroke()

    //LOWER LINE
    doc
    .moveTo(30, 80).lineTo(810, 80).stroke()

    // DOCUMENT TITLE
    doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('DETAILED INVOICE', 30, 30, {width: 200, align: 'left'})
}

// ------------------------------------------------------------------------------- //

function awbTable(doc, orders, start, breakpoint){
    let x = 20, y = 60, g = 25, dateG = 60, awbG = 160, destG = 270, consG = 420, wG = 630, aG = 700
    let c = 0 // a counter for getting same row distance values on each page

    doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Sr.No.', x, y, {width: 100, align: 'center'})
    .text('Date', x + dateG, y, {width: 100, align: 'center'})
    .text('AWB', x + awbG, y, {width: 100, align: 'center'})
    .text('Destination', x + destG, y, {width: 150, align: 'center'})
    .text('Consignee', x + consG, y, {width: 230, align: 'center'})
    .text('Weight', x + wG, y, {width: 100, align: 'center'})
    .text('Amount', x + aG, y, {width: 100, align: 'center'})    
    
    for(let i = start; i < breakpoint; i++){
        let iv = (2*c) + 1

        doc
        .font('Helvetica')
        .text(i+1, x, y + (iv*g), {width: 100, align: 'center'})
        .text(moment(orders[i].bookingDate).format(shortDateFormat), x + dateG, y + (iv*g), {width: 100, align: 'center'})
        .text(orders[i].awbNumber, x + awbG, y + (iv*g), {width: 100, align: 'center'})
        .text(orders[i].destination, x + destG, y + (iv*g), {width: 150, align: 'center'})
        .text(orders[i].consignee, x + consG, y + (iv*g), {width: 230, align: 'center'})
        .text(orders[i].chargeableWeight, x + wG, y + (iv*g), {width: 100, align: 'center'})
        .text(orders[i].billAmount, x + aG, y + (iv*g), {width: 100, align: 'center'})

        c++
    }    

}

function footerDetails(doc, current, total){
    doc
    .fontSize(10)
    //.moveTo(330, 40).lineTo(470, 40).stroke()
    .text(`Page ${current} of ${total}`, 350, 10, {width: 100, align: 'center'})
}

function summ(doc, invoice){
    let x = 20, consG = 530, wG = 630, aG = 700, y = 515

    doc
    .moveTo(30, 505).lineTo(810, 505).stroke()
    .moveTo(30, 535).lineTo(810, 535).stroke()
    
    doc
    .fontSize(14)
    .text(invoice.totalChargeableWeight, x + wG, y, {width: 100, height: 30, align: 'center'})
    .text(invoice.forwardingCharges, x + aG, y, {width: 100, height: 30, align: 'center'})
    .font('Helvetica-Bold')
    .text('Total', x + consG, y, {width: 100, height: 30, align: 'center'})


    doc
    .font('Helvetica')
    .fontSize(10)
    .text(`Produced By: RAVI PITTALA on ${invoice.invoiceDate}`, x + 270, 540, {width: 500, height: 30, align: 'right'})
}