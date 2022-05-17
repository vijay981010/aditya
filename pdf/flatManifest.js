const debug = require('debug')('dev')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'

exports.generateFlatManifest = (doc, orders, user, date) => {
    doc.info['Title'] = `manifest_${date}`
    
// -------------------- CALCULATE TOTAL PAGES --------------------- //
    let totalItems = orders.length     
    
    //TO RENDER EACH PAGE WITH ONLY 20 ITEMS//
    let start = 0 
    let breakPoint = 20

    let totalPages = Math.ceil(totalItems/breakPoint)
    
    debug(totalPages)      

// -------------------- PDF RENDER SECTION --------------------- //
    let id = 0 //TO KEEP TRACK OF ORDER RENDERED//

    //PDF VARIABLES//
    let full = 595
    let centerAlign = {width:full,height:15,align:'center'}  
    let leftAlign = {width:full,align:'left'} 
    let rightAlign = {width:full,align:'right'}
         
    //RENDER PDF PAGES
    for(let i = 0; i < totalPages; i++){

      //SET BREAKPOINT IF ONLY ONE PAGE//
      if(totalPages == 1){
        breakPoint = totalItems
      }

      //GENERATE PDF//
      doc.addPage()  
      header(doc, user, date, 0, 30)    
      orderTabl(doc, orders, 0, 110, 30, start, breakPoint)
      footer(doc, 0, 780, i+1, totalPages)

      //UPDATE BREAKPOINT//
      if(totalPages > 1){          
        let remainingItems = totalItems - id 
        if(remainingItems < 20)
          breakPoint = remainingItems
      }
    }

    // -------------------------------------------------------------- //

    function header(doc, user, date, x, y){                               
        //TITLE//
        doc
        .font('Helvetica-Bold').fontSize(20)
        .text('MANIFEST', x,y,centerAlign)

        //DETAILS//
        doc
        .font('Helvetica').fontSize(12)
        .text(`To: ${user.admin.displayName}`, x+30, y+30, leftAlign)
        .text(`From: ${user.username}`, x+30, y+50, leftAlign)        
        .text(`Date: ${moment(date).format(shortDateFormat)}`, x-30, y+30, rightAlign)

        doc.moveTo(x+20,y+70).lineTo(full-20,y+70).stroke()
    }

    // -------------------------------------------------------------------------------------------------- //

    function orderTabl(doc, orders, x, y, g, start, breakPoint){        
        debug(start, breakPoint)

        let widthArr = [30, 80, 180, 50, 150, 50] //DEFINE COLUMN WIDTHS//
        let headerArr = ['Sr No', 'AWB', 'Consignee', 'Weight', 'Destination', 'Pieces'] //DEFINE HEADER VALUES//

        //DEFINE COLUMN START POINTS//
        let startArr = [30]        
        for(let i = 0; i < widthArr.length; i++){
            let temp =   startArr[i] + widthArr[i]
            startArr.push(temp)  
        }

        //RENDER HEADERS//
        for(let i = 0; i < startArr.length; i++){
            doc          
            .font('Helvetica-Bold').fontSize(11)
            .text(headerArr[i], startArr[i], y, {width: widthArr[i], align:'center'})                         
        }

        //RENDER VALUES//
        for(let i = start; i < breakPoint; i++){   
            debug(`entry no:${i+1}`)
            let valueArr = [id+1, orders[id].awbNumber, orders[id].consignee, orders[id].chargeableWeight,
            orders[id].destination, orders[id].numberOfBoxes]
            
            for(let j = 0; j < startArr.length; j++){
                let c = i + 1 //TO INCREMENT ROW POSITION//  
                
                doc
                .font('Helvetica').fontSize(11)
                .text(valueArr[j], startArr[j], y+(c*g), {width: widthArr[j], align:'center'})            
            }      
            id++
        }
    }

    // -------------------------------------------------------------------------------------------------- //

    function footer(doc, x, y, current, total){        
        doc.moveTo(x+20,y).lineTo(575,y).stroke()
        doc.text(`Page No: ${current} of ${total}`, x, y+20, centerAlign)
    }
}

