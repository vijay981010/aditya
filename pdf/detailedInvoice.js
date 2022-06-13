let debug = require('debug')('c_app: detailedInvoice')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'
const { ToWords } = require('to-words')
const {removeNextLine} = require('../pdf/pdfLibrary')

exports.detailedInvoice = (doc, orders, invoice, user, compData) => {
    doc.info['Title'] = `invoice${invoice.invoiceNumber}` //TITLE TO PDF//

// ---- Calculate Total Number of Pages ------ //
    
    let start = 0
    let initialbreakpoint = 7
    let breakpoint = 14
    let fconst = 14
    let len = orders.length
    let runs = Math.floor((len-7) / breakpoint)    

    // --- total pages and total value computation --- //
    let totalPages = 0    

    if(len <= 7){
        totalPages = 1      
    }else if(len > 7 && len <= 21){
        totalPages = 2
    }else{
        totalPages = runs + 2 
    }

    debug(totalPages)

// ----- In case, there is only one page, then new breakpoint is set
    if(totalPages == 1){
        initialbreakpoint = len
    }

    //debug(totalPages)

// ---- Loop through each page by virtually splitting the array as per the breakpoint ---- //
    for(let i = 0; i < totalPages; i++){             
        //debug(start, breakpoint)
        doc.addPage()

        if(i == 0){
            invoicerDetails(doc, user)
            invoiceeDetails(doc, invoice)
            tabl(doc, orders, compData, start, initialbreakpoint)
            start = 7
            if(21 > len){
                breakpoint = len
            }else{
                breakpoint = 21
            }
        }
        if(i > 0){
            debug(i, start, breakpoint)
            tabl(doc, orders, compData, start, breakpoint)

            //update the startpoint for next page
            start = breakpoint

            //update the breakpoint with a condition for last element
            if((breakpoint + fconst) > len){
                breakpoint = len
            }else{
                breakpoint += fconst
            }
        }
        
        //IF DEFAULT NOTE ADDED, INCREASE TOTAL PAGE COUNT//
        let footerTotPages = totalPages
        if(user.invoiceDefaultNote) footerTotPages = totalPages + 1
        
        footerDetails(doc, i + 1, footerTotPages)

        //render totals on last page//
        if(i == totalPages - 1){
            summ(doc, invoice, compData)
            if(user.invoiceDefaultNote || invoice.note) displayNote(doc, invoice.note, user.invoiceDefaultNote,totalPages+1)
        }

    }    
    
}

// ----------------------------------- FUNCTIONS -------------------------------- //

function invoicerDetails(doc, user){    
    let x = 0, y = 25, g=20, g2 = 15   
    let vertical = 842
    let centerAlign = {width: vertical, align: 'center'}
    
    doc
    .font('Helvetica-Bold').fontSize(16)    
    .text(user.displayName, x, y, centerAlign) 
    .font('Helvetica').fontSize(12)
    .text(user.address, x, y+g, centerAlign)    
    .text(`Contact Number: ${user.contactNumber}`, x, y+g+g2, centerAlign)
    .text(`Email: ${user.email}`, x, y+g+(2*g2), centerAlign)
    .text(`Website: ${user.website}`, x, y+g+(3*g2), centerAlign)
    .text(`GST: ${user.gstNumber}`, x, y+g+(4*g2), centerAlign)    
    .moveTo(x+10, y+g+(5*g2)).lineTo(vertical-10, y+g+(5*g2)).stroke()
}

// ------------------------------------------------------------------------------- //

function invoiceeDetails(doc, invoice){
    let clientName = invoice.client.username
    if(invoice.client.companyName) clientName = invoice.client.companyName

    let x = 0, y = 135, g=20, g2 = 15
    let x2 = 560, x3 = 630
    let margin = 30   
    let onethird = 281, full = 842, twofifth = 351
    let leftAlign = {width: twofifth, align: 'left'}        
    let rightAlign = {width: onethird, align: 'right'}    
    let centerAlign = {width: full, align: 'center'}

    doc
    .font('Helvetica-Bold').fontSize(16)    
    .text('Sales Invoice', x, y, centerAlign)
    
    doc
    .font('Helvetica-Bold').fontSize(12)
    .text(clientName, x+margin, y+g, leftAlign)
    .font('Helvetica').fontSize(12)
    .text(invoice.client.address, x+margin, y+g+g2, leftAlign)
    .text(`GST: ${invoice.client.gstNumber}`, x+margin, y+g+(4*g2), leftAlign)

    doc
    .font('Helvetica').fontSize(12)
    .text(invoice.invoiceNumber, x2-margin, y+g, rightAlign)
    .text(moment(invoice.invoiceDate).format(shortDateFormat), x2-margin, y+g+g2, rightAlign)
    .text(moment(invoice.invoiceStartDate).format(shortDateFormat), x2-margin, y+g+(2*g2), rightAlign)
    .text(moment(invoice.invoiceEndDate).format(shortDateFormat), x2-margin, y+g+(3*g2), rightAlign)
    .text(invoice.admin.sacCode, x2-margin, y+g+(4*g2), rightAlign)

    doc
    .font('Helvetica-Bold').fontSize(12)    
    .text('Invoice Number', x3-margin, y+g, leftAlign)
    .text('Invoice Date', x3-margin, y+g+g2, leftAlign)
    .text('Invoice Start Date', x3-margin, y+g+(2*g2), leftAlign)
    .text('Invoice End Date', x3-margin, y+g+(3*g2), leftAlign)
    .text('SAC Code', x3-margin, y+g+(4*g2), leftAlign)
    
}

// ------------------------------------------------------------------------------- //

function tabl(doc, orders, compData, start, breakpoint){
    
    let x = 30
    let y
    breakpoint <= 7 ? y = 255 : y = 45
    debug(breakpoint, y)
    
    let g=30, g2 = 25        
    let c = 0 // a counter for getting same row distance values on each page
    
    let widthArr = [30, 70, 60, 130, 170, 30, 50, 50, 50, 50, 50, 50]
    let headerArr = ['Sr No', 'Date', 'AWB', 'Destination', 'Consignee', 'D/S', 'Weight', 'Amount', 'FSC', 'Charges', 'Tax', 'Total']
    let valueArr = [1, '20-04-2022', '1234567', 'United Kingdom', 'Aditya Nair Aditya Nair Aditya Nair', 'spx', 20, 10000, 1000, 1000, 12000]
    let startArr = [30]    
    
    for(let i = 0; i < widthArr.length; i++){
        let temp =   startArr[i] + widthArr[i]
        startArr.push(temp)  
      }    

    doc.rect(10, y-10, 825, 30).fill('#4287f5')
    
    doc
    .font('Helvetica-Bold').fontSize(11).fill('white')    

    for(let i = 0; i < startArr.length; i++){
        doc
        .text(headerArr[i], startArr[i], y, {width: widthArr[i], align:'center'})        
               
    }

    doc
    .font('Helvetica').fontSize(11).fill('black')
    
    for(let i = start; i < breakpoint; i++){
        //let s = i+1
        let s = c + 1
        let valueArr = [
            i+1, moment(orders[i].bookingDate).format(shortDateFormat), orders[i].awbNumber, orders[i].destination,
        orders[i].consignee, orders[i].boxType, orders[i].chargeableWeight.toFixed(2), orders[i].baseRate.toFixed(2), 
        orders[i].fuelSurcharge.toFixed(2), compData.chargesArr[i].toFixed(2), compData.taxArr[i].toFixed(2), 
        compData.totalBillArr[i].toFixed(2)
    ]
        
        for(let j = 0; j < startArr.length; j++){
            doc
            .text(valueArr[j], startArr[j], y+(s*g), {width: widthArr[j], align:'center'})            
        }    
        c++     
    }

    /* for(let i = start; i < breakpoint; i++){
        //let s = i+1
        let s = c + 1
        let valueArr = [1, '20-04-2022', '1234567', 'United Kingdom', 'Aditya Nair Aditya Nair Aditya Nair', 'spx', 20, 10000, 1000, 1000, 12000]
        
        for(let j = 0; j < startArr.length; j++){
            doc
            .text(valueArr[j], startArr[j], y+(s*g), {width: widthArr[j], align:'center'})            
        }      
        c++   
    } */    

}

// ------------------------------------------------------------------------------- //

function footerDetails(doc, current, total){
    doc
    .fontSize(10)
    //.moveTo(330, 40).lineTo(470, 40).stroke()
    .text(`Page ${current} of ${total}`, 0, 575, {width: 842, height:15, align: 'center'})
}

// ------------------------------------------------------------------------------- //

function summ(doc, invoice, compData){
    let x3 = 680, x2 = 560, y = 490
    let margin = 30, g=18
    let onethird = 281, full = 842
    let leftAlign = {width: onethird, height:15, align: 'left'}
    let rightAlign = {width: onethird, height:15, align: 'right'}
    let subTotal = compData.totalBaseRate + compData.totalCharges + compData.totalFsc  

    //NUMBER TO WORDS CONFIG//
    const toWords = new ToWords({
        localeCode: 'en-IN',
        converterOptions: {
          currency: true,
          ignoreDecimal: false,
          ignoreZeroCurrency: false,
          doNotAddOnly: false,
        }
      })
    
    //COMPUTE BILL FROM FIGURES TO WORDS//
    let billInStrings = compData.totalBill.toString() //CONVERT TO STRING//
    let words = toWords.convert(billInStrings)

    debug(words)
    
    doc.rect(640, 540, 195, 18).fill('#4287f5') //HIGHLIGHT FOR TOTAL AMOUNT IN FIGURES//
    doc.rect(10, 540, 155+(words.length*7) , 18).fill('#4287f5') //HIGHLIGHT FOR TOTAL AMOUNT IN WORDS//    

    //TITLES OF TOTAL AMOUNT IN FIGURES//
    doc
    .font('Helvetica-Bold').fontSize(12).fill('black')    
    .text('Sub-Total', x3-margin, y+g, leftAlign)
    .text('IGST(@18%)', x3-margin, y+(2*g), leftAlign)
    .text('Total Amount(in Words)', 30, y+(2*g), {width: 842, height:15, align: 'left'})
        
    .font('Helvetica-Bold').fontSize(12).fill('white') 
    .text('Total', x3-margin, y+(3*g), leftAlign)

    //TOTAL AMOUNT IN WORDS//             
    .text(words, 30, y+(3*g), {width: 842, height:15, align: 'left'})

    //VALUES OF TOTAL AMOUNT IN FIGURES//
    doc
    .font('Helvetica').fontSize(12).fill('black')    
    .text(subTotal.toFixed(2), x2-margin, y+g, rightAlign)
    .text(compData.totalTax.toFixed(2), x2-margin, y+(2*g), rightAlign)

    .font('Helvetica-Bold').fontSize(12).fill('white')
    .text(compData.totalBill, x2-margin, y+(3*g), rightAlign)
    
}

// ------------------------------------------------------------------------------- //

function displayNote(doc, addNote, defaultNote, total){
    
    let x = 30, y = 65, g = 15
    let leftAlign = {width: 792, align: 'left'}    
    
    //RENDER NOTE ALWAYS ON NEW PAGE WITH FOLLOWING DEFAULTS//
    doc
    .addPage() 
    .font('Helvetica-Bold').fontSize(16).fill('black')    
    .text('Note', 30, 45, leftAlign) 
    .font('Helvetica').fontSize(14)    
       
    
    if(defaultNote) defaultNote = removeNextLine(defaultNote)        
    if(addNote) addNote = removeNextLine(addNote)

    if(defaultNote && addNote){
        doc.text(`${defaultNote}\n\n${addNote}`, x, y+g, leftAlign)
    }else if(addNote && !defaultNote){
        doc.text(addNote, x, y+g, leftAlign)
    }else if(defaultNote && !addNote){
        doc.text(defaultNote, x, y+g, leftAlign)
    }       

    //PAGE NUMBER//
    doc
    .fontSize(10)    
    .text(`Page ${total} of ${total}`, 0, 575, {width: 842, height:15, align: 'center'})
}