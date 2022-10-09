let debug = require('debug')('c_app: detailedInvoice')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'
const { ToWords } = require('to-words')
const {removeNextLine} = require('../pdf/pdfLibrary')

exports.detailedInvoice = (doc, orders, invoice, user, compData) => {
    doc.info['Title'] = `invoice${invoice.invoiceNumber}` //TITLE TO PDF//
    debug(user.invoiceSettings.layout)
// ---- Calculate Total Number of Pages ------ //
    
    let start = 0
    let initialbreakpoint = 7
    let breakpoint = 14
    let fconst = 14
    let len = orders.length
    
    if(user.invoiceSettings.layout == 'portrait'){
        initialbreakpoint = 15, breakpoint = 22, fconst = 30
    }

    let runs = Math.floor((len - initialbreakpoint) / breakpoint)   
    
    

    // --- total pages and total value computation --- //
    let totalPages = 0    

    if(len <= initialbreakpoint){
        totalPages = 1      
    }else if(len > initialbreakpoint && len <= (initialbreakpoint + breakpoint)){
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
            invoiceeDetails(doc, user, invoice)
            tabl(doc, user, orders, compData, start, initialbreakpoint)
            start = initialbreakpoint
            if(initialbreakpoint + breakpoint > len){
                breakpoint = len
            }else{
                breakpoint = initialbreakpoint + breakpoint
            }
        }
        if(i > 0){
            debug(i, start, breakpoint)
            tabl(doc, user, orders, compData, start, breakpoint)

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
        
        footerDetails(doc, user, i + 1, footerTotPages)

        //render totals on last page//
        if(i == totalPages - 1){
            summ(doc, user, invoice, compData)
            if(user.invoiceDefaultNote || invoice.note) displayNote(doc, user, invoice.note, user.invoiceDefaultNote,totalPages+1)
        }

    }    
    
}

// ----------------------------------- FUNCTIONS -------------------------------- //

function invoicerDetails(doc, user){    
    let x = 0, y = 25, g=20, g2 = 15   
    let vertical = 595 //842    
    let fs = 14/* 16 */, fs2 = 11/* 12 */

    if(user.invoiceSettings.layout == 'landscape'){
        vertical = 842, fs = 16, fs2 = 12
    }

    let centerAlign = {width: vertical, align: 'center'}    
    
    doc
    .font('Helvetica-Bold').fontSize(fs)    
    .text(user.displayName, x, y, centerAlign) 
    .font('Helvetica').fontSize(fs2)
    .text(user.address, x, y+g, centerAlign)    
    .text(`Contact Number: ${user.contactNumber}`, x, y+g+g2, centerAlign)
    .text(`Email: ${user.email}`, x, y+g+(2*g2), centerAlign)
    .text(`Website: ${user.website}`, x, y+g+(3*g2), centerAlign)
    .text(`GST: ${user.gstNumber}`, x, y+g+(4*g2), centerAlign)    
    .moveTo(x+10, y+g+(5*g2)).lineTo(vertical-10, y+g+(5*g2)).stroke()
}

// ------------------------------------------------------------------------------- //

function invoiceeDetails(doc, user, invoice){
    let clientName = invoice.client.username
    if(invoice.client.companyName) clientName = invoice.client.companyName

    let gst = `GST: ${invoice.client.gstNumber}`
    if(!invoice.client.gstNumber) gst = `GST: N/A`

    let fs = 14/* 16 */, fs2 = 11/* 12 */

    let x = 0, y = 135, g=20, g2 = 15
    let x2 = 396/* 560 */, x3 = 415/* 630 */
    let margin = 30   
    let onethird = 199/* 281 */, full = 595/* 842 */, twofifth = 308/* 351 */
    
    if(user.invoiceSettings.layout == 'landscape'){
        x2 = 560, x3 = 630, fs = 16, fs2 = 12, onethird = 281, full = 842, twofifth = 351
    }

    let leftAlign = {width: twofifth, align: 'left'}        
    let rightAlign = {width: onethird, align: 'right'}    
    let centerAlign = {width: full, align: 'center'}    

    doc
    .font('Helvetica-Bold').fontSize(fs)    
    .text('Sales Invoice', x, y, centerAlign)
    
    doc
    .font('Helvetica-Bold').fontSize(fs2)
    .text(clientName, x+margin, y+g, leftAlign)
    .font('Helvetica').fontSize(fs2)
    .text(invoice.client.address, x+margin, y+g+g2, leftAlign)
    .text(gst, x+margin, y+g+(4*g2), leftAlign)

    doc
    .font('Helvetica').fontSize(fs2)
    .text(invoice.invoiceNumber, x2-margin, y+g, rightAlign)
    .text(moment(invoice.invoiceDate).format(shortDateFormat), x2-margin, y+g+g2, rightAlign)
    .text(moment(invoice.invoiceStartDate).format(shortDateFormat), x2-margin, y+g+(2*g2), rightAlign)
    .text(moment(invoice.invoiceEndDate).format(shortDateFormat), x2-margin, y+g+(3*g2), rightAlign)
    .text(invoice.admin.sacCode, x2-margin, y+g+(4*g2), rightAlign)

    doc
    .font('Helvetica-Bold').fontSize(fs2)    
    .text('Inv. No', x3-margin, y+g, leftAlign)
    .text('Inv. Date', x3-margin, y+g+g2, leftAlign)
    .text('Inv. Start Date', x3-margin, y+g+(2*g2), leftAlign)
    .text('Inv. End Date', x3-margin, y+g+(3*g2), leftAlign)
    .text('SAC Code', x3-margin, y+g+(4*g2), leftAlign)
    
}

// ------------------------------------------------------------------------------- //

function tabl(doc, user, orders, compData, start, breakpoint){
    let compr = 7
    
    if(user.invoiceSettings.layout == 'portrait'){
        compr = 15
    }

    let x = 30
    let y
    breakpoint <= compr ? y = 255 : y = 45
    debug(breakpoint, y)

    let fs = 8.5/* 11 */, rw = 575/* 825 */
    
    let g=30, g2 = 25        
    let c = 0 // a counter for getting same row distance values on each page
    
    //let widthArr = [30, 70, 60, 130, 170, 30, 50, 50, 50, 50, 50, 50]
    let widthArr = [25, 49, 39, 90, 100, 18, 37, 37, 37, 37, 37, 40]
    let headerArr = ['Sr No', 'Date', 'AWB', 'Destination', 'Consignee', 'D/S', 'Weight', 'Amount', 'FSC', 'Charges', 'Tax', 'Total']

    if(user.invoiceSettings.layout == 'landscape'){
        fs = 11, rw = 825
        widthArr = [30, 70, 60, 130, 170, 30, 50, 50, 50, 50, 50, 50]
    }

    if(user.role=='admin' && user.settings.noTaxColumn){
        headerArr = ['Sr', 'Date', 'AWB', 'Destination', 'Consignee', 'D/S', 'Weight', 'Amount', 'FSC', 'Charges', 'Sub-Total']        
        widthArr = [20, 45, 50, 90, 130, 18, 38, 38, 38, 38, 40]
        if(user.invoiceSettings.layout == 'landscape'){
            fs = 11
            widthArr = [30, 70, 60, 130, 170, 30, 60, 60, 60, 60, 60]
        }
    }

    let valueArr = [1, '20-04-2022', '1234567', 'United Kingdom', 'Aditya Nair Aditya Nair Aditya Nair', 'spx', 20, 10000, 1000, 1000, 12000]
    let startArr = [30]    
    
    for(let i = 0; i < widthArr.length; i++){
        let temp =   startArr[i] + widthArr[i]
        startArr.push(temp)  
      }    

    doc.rect(10, y-10, rw, 30).fill('#4287f5')
    
    doc
    .font('Helvetica-Bold').fontSize(fs).fill('white')    

    for(let i = 0; i < startArr.length; i++){
        doc
        .text(headerArr[i], startArr[i], y, {width: widthArr[i], align:'center'})        
               
    }

    doc
    .font('Helvetica').fontSize(fs).fill('black')
    
    for(let i = start; i < breakpoint; i++){
        //let s = i+1
        let s = c + 1
        let valueArr = [
            i+1, moment(orders[i].bookingDate).format(shortDateFormat), orders[i].awbNumber, orders[i].destination,
            orders[i].consignee, orders[i].boxType, orders[i].chargeableWeight.toFixed(2), orders[i].baseRate.toFixed(2), 
            orders[i].fuelSurcharge.toFixed(2), compData.chargesArr[i].toFixed(2), compData.taxArr[i].toFixed(2), 
            compData.totalBillArr[i].toFixed(2)
        ]

        if(user.role=='admin' && user.settings.noTaxColumn){
            valueArr = [
                i+1, moment(orders[i].bookingDate).format(shortDateFormat), orders[i].awbNumber, orders[i].destination,
                orders[i].consignee, orders[i].boxType, orders[i].chargeableWeight.toFixed(2), orders[i].baseRate.toFixed(2), 
                orders[i].fuelSurcharge.toFixed(2), compData.chargesArr[i].toFixed(2), compData.subTotalArr[i].toFixed(2)
            ]
        }
        
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

function footerDetails(doc, user, current, total){
    let w = 595//842
    let y = 802//575    

    if(user.invoiceSettings.layout == 'landscape'){
        w = 842, y = 802
    }

    doc
    .fontSize(10)    
    .text(`Page ${current} of ${total}`, 0, y, {width: w, height:15, align: 'center'})
}

// ------------------------------------------------------------------------------- //

function summ(doc, user, invoice, compData){
    let x3 = 480/* 680 */, x2 = 396/* 560 */, y = 723, y2 = 729/* 490 */
    let margin = 30, g=18, g2 = 15
    let onethird = 198/* 281 */, full = 595/* 842 */
    let fs = 9/* 12 */, rx1 = 425/* 640 */, rw1 = 155/* 195 */, rw2 = /* 155 */109, rm = 5/* 7 */

    if(user.invoiceSettings.layout == 'landscape'){
        x3 = 680, x2 = 560, y = 490, onethird = 281, full = 842
        fs = 12, rx1 = 640, rw1 = 195, rw2 = 109, rm = 7
    }

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

    //debug(words.length * 7)
    
    doc.rect(rx1, y+50, rw1, 18).fill('#4287f5') //HIGHLIGHT FOR TOTAL AMOUNT IN FIGURES//
    doc.rect(10, y+50, rw2 + (words.length * rm) , 18).fill('#4287f5') //HIGHLIGHT FOR TOTAL AMOUNT IN WORDS//    

    //TITLES OF TOTAL AMOUNT IN FIGURES//
    doc
    .font('Helvetica-Bold').fontSize(fs).fill('black') 
    
    if(invoice.gstType == 'igst' || !invoice.gstType){
        doc
        .text('Sub-Total', x3-margin, y+g, leftAlign)
        .text('IGST(@18%)', x3-margin, y+(2*g), leftAlign)
    }

    if(invoice.gstType == 'cgst'){
        doc
        .text('Sub-Total', x3-margin, y2, leftAlign)
        .text('CGST(@9%)', x3-margin, y2+g2, leftAlign)
        .text('SGST(@9%)', x3-margin, y2+(2*g2), leftAlign)
    }
            
    doc
    .text('Total Amount(in Words)', 30, y+(2*g), {width: 842, height:15, align: 'left'})
        
    .font('Helvetica-Bold').fontSize(fs).fill('white') 
    .text('Total', x3-margin, y+(3*g), leftAlign)

    //TOTAL AMOUNT IN WORDS//             
    .text(words, 30, y+(3*g), {width: 842, height:15, align: 'left'})

    //VALUES OF TOTAL AMOUNT IN FIGURES//
    doc
    .font('Helvetica').fontSize(fs).fill('black') 
    
    if(invoice.gstType == 'igst' || !invoice.gstType){
        doc
        .text(subTotal.toFixed(2), x2-margin, y+g, rightAlign)
        .text(compData.totalTax.toFixed(2), x2-margin, y+(2*g), rightAlign)
    }

    if(invoice.gstType == 'cgst'){
       doc
       .text(subTotal.toFixed(2), x2-margin, y2, rightAlign)
       .text((compData.totalTax/2).toFixed(2), x2-margin, y2+g2, rightAlign)
       .text((compData.totalTax/2).toFixed(2), x2-margin, y2+(2*g2), rightAlign)
    }
        
    doc
    .font('Helvetica-Bold').fontSize(fs).fill('white')
    .text(compData.totalBill, x2-margin, y+(3*g), rightAlign)
    
}

// ------------------------------------------------------------------------------- //

function displayNote(doc, user, addNote, defaultNote, total){
    
    let x = 30, y = 65, g = 15, w = 560 /* 792 */, xw = 595/* 842 */, yp = 802//575  
    let fs = 13/* 16 */, fs2 = 11//14

    if(user.invoiceSettings.layout == 'landscape'){
        w = 792, xw = 842, yp = 575, fs = 16, fs2 = 14        
    }

    let leftAlign = {width: w, align: 'left'}            
    
    //RENDER NOTE ALWAYS ON NEW PAGE WITH FOLLOWING DEFAULTS//
    doc
    .addPage() 
    .font('Helvetica-Bold').fontSize(fs).fill('black')    
    .text('Note', 30, 45, leftAlign) 
    .font('Helvetica').fontSize(fs2)    
       
    
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
    .text(`Page ${total} of ${total}`, 0, yp, {width: xw, height:15, align: 'center'})
}