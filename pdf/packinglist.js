var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'
const debug = require('debug')('c_app: packingList')
const {getStartRange} = require('./pdfLibrary')
const { ToWords } = require('to-words')

//NUMBER TO WORDS CONFIG//
const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    //currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  }
})

exports.generatePackingListPdf = (doc, order, itemArr, boxArr, totArr) => {
    doc.info['Title'] = `packinglist${order.awbNumber}` //TITLE TO PDF//

    //REGISTER FONTS//
    doc.registerFont('reg', 'Helvetica')
    doc.registerFont('bold', 'Helvetica-Bold')
    let fs = 10; let fs2 = 9.5; let fs3 = 14

    //ADD PAGE//
    doc.addPage()

    //PDF VARIABLES//
    let fullx = 595; let halfx = fullx/2
    let fully = 842      
    
    //POSITION VARIABLES//
    let x = 30; let y = 30; let w = fullx - x
    let id = 0 //TO KEEP TRACK OF ORDER RENDERED//
    
    //FIXED TEXT//
    let indi = 'Terms, Unsolicited Gift From Individual to Individual'
    if(order.invoiceType == 'company') indi = ''    
    let disclaimer = `We here by Confirm that the Parcel does not Involve any Commercial Transaction. The Value is Declared for Customs Purpose Only`

    //DEFINE COLUMN STARTS AND WIDTHS //
    let widthArr = [90, 230, 70, 45, 47.5, 52.5] //DEFINE COLUMN WIDTHS//

    //DEFINE COLUMN START POINTS//
    let startArr = getStartRange(30, widthArr) 

// ---------------- RENDER SECTION --------------------- //                
    //RENDER VALUES//            
    let maxLen = 31 //GET ITEMS MAX CHARACTER FOR A LINE//
    let pg1Limit = 27; let addPgLimit = 40
    let rowHeightArr = itemArr.map(item => Math.ceil(item.itemName.length / maxLen))                 
    
    let page = 1
    while(rowHeightArr.length > 0){  
      console.log(`Page No: ${page}`)
      let pageSet = getList(rowHeightArr, page, pg1Limit, addPgLimit)
      
      if(page > 1){
        doc.addPage()
        container()   
        title(page)
        boxHeaderInfo(30, 50, 630)
        boxValueInfo(85, pageSet, pageSet.length) 
        footerInfo(page, rowHeightArr.length)             
      }else{
        container()            
        title()            
        shipmentInfo()      
        boxHeaderInfo(225,245,435)
        boxValueInfo(280, pageSet, pageSet.length)
        footerInfo(page, rowHeightArr.length)          
      }
      rowHeightArr.splice(0, pageSet.length)
      page++
    }

    summaryInfo()

// ---------------- RENDER FUNCTIONS --------------------- // 
  //OUTSIDE BORDER CONTAINER//
  function container(){
      doc.rect(x, y, fullx - (2*x), fully - (2*y)).stroke()
  }

  //TITLE AND PAGE NUMBER//
  function title(){
      doc.font('bold').fontSize(fs3)
      .text('INVOICE', x-30, y + 7, {width: fullx, align:'center'})

      doc.font('reg').fontSize(fs)
      .text(`Page No: ${page}`, x-30, y-15, {width: fullx, align:'center'})
      
      doc.moveTo(x, y + 25).lineTo(w, y + 25).stroke()
  }

  //SHIPMENT INFO//
  function shipmentInfo(){
      doc.moveTo(halfx, y + 25).lineTo(halfx, y + 220).stroke()
      doc.moveTo(x, y + 160).lineTo(w, y + 160).stroke()

      let consignorAddress = `${order.consignorAddress1}, ${order.consignorAddress2}, ${order.consignorCity}, ${order.consignorState}, ${order.consignorPincode}`
      let consignorPhone = `Tel No: ${order.consignorContactNumber}`
      
      //DETERMINE REF//
      let ref
      order.client.username != 'Miscellaneous' ? ref = `Reference: ${order.client.username}` : ref = `Reference: ${order.miscClients}`
      
      let docs = `${order.docType}: ${order.docNumber}`      

      let consigneeAddress = `${order.consigneeAddress1}, ${order.consigneeAddress2}, ${order.consigneeCity}, ${order.consigneeState}, ${order.consigneePincode}`
      let consigneePhone = `Tel No: ${order.consigneeContactNumber}`      

      let shipperArr = ['SHIPPER:', order.consignor, consignorAddress, order.origin, consignorPhone, ref, docs]
      let consigneeArr = ['CONSIGNEE:', order.consignee, consigneeAddress, order.destination, consigneePhone, '', '']

      let propArr = [true]
      let lwArr = [15, 15, 45, 15, 15, 15, 15]
      //let lineArr = [0, 15, 30, 75, 90, 105, 120]
      

      //CHECK IF COMPANY//
      if(order.consignorCompanyName || order.consigneeCompanyName){
        shipperArr.splice(1, 0, order.consignorCompanyName) 
        consigneeArr.splice(1, 0, order.consigneeCompanyName) 
        lwArr.splice(2, 1, 30)
        lwArr.splice(1, 0, 15)
        
      }      

      let lineArr = getStartRange(0, lwArr)      
      
      for(let i = 0; i < shipperArr.length; i++){        
          if(i < 2 || i == 3){
            doc
            .font('bold').fontSize(fs)        
            .text(shipperArr[i], x+5, y+30+lineArr[i], {width: halfx - x - 5, align:'left', underline: propArr[i]})
            .text(consigneeArr[i], halfx + 5, y+30+lineArr[i], {width: halfx - x - 5, align:'left', underline: propArr[i]})
          }else{
            doc
            .font('reg').fontSize(fs)        
            .text(shipperArr[i], x+5, y+30+lineArr[i], {width: halfx - x - 5, align:'left'})
            .text(consigneeArr[i], halfx + 5, y+30+lineArr[i], {width: halfx - x - 5, align:'left'})
          }
      }

      // ------------------------------ //
      let shipmentTitleArr = ['Date Of Shipment:', 'Airway Bill No:', 'Country Of Origin:', 'Final Destination:']
      let shipmentValArr = [moment(order.bookingDate).format(shortDateFormat), order.awbNumber, order.origin, order.destination]

      let invoiceTitleArr = ['', 'No. Of Box:', 'Total Weight:', 'Invoice No. & Date:']
      let invoiceValArr = [indi, order.numberOfBoxes, order.chargeableWeight, order.awbNumber]

      for(let i = 0; i < shipmentTitleArr.length; i++){
          if(i == 0){
            doc.font('bold').fontSize(fs)  
            .text(`${invoiceTitleArr[i]}${invoiceValArr[i]}`, halfx + 5, 195 + (i*15), {width: halfx - x - 5, align:'left', underline: true})          
            .text(`${shipmentTitleArr[i]}${shipmentValArr[i]}`, x+5, 195 + (i*15), {width: halfx - x - 5, align:'left'})
          }else{
            doc.font('reg').fontSize(fs)
            .text(`${shipmentTitleArr[i]}${shipmentValArr[i]}`, x+5, 195 + (i*15), {width: halfx - x - 5, align:'left'})
            .text(`${invoiceTitleArr[i]}${invoiceValArr[i]}`, halfx + 5, 195 + (i*15), {width: halfx - x - 5, align:'left'})
          }        
      }
  }

  //BOX DETAILS HEADERS//
  function boxHeaderInfo(h1, h2, h3){
      //HORIZONTAL LINES//
      let wArr = [20, 30, h3, 25, 25]
      let hGapArr = getStartRange(h1-5, wArr)
      
      //let hGapArr = [220, 240, 270, 705, 730]      
      hGapArr.forEach(gap => {
        doc.moveTo(x, y + gap).lineTo(w, y + gap).stroke()
      })

    // ------------- HEADER RENDITION -----------------//
      let h1Arr = ['Box No', 'Description', 'HSN', 'Qty', 'Value', 'Total']
      let h2Arr = ['', indi, '', '', order.currency, order.currency]        

      //RENDER HEADERS//
      for(let i = 0; i < startArr.length; i++){          
        doc.font('bold').fontSize(fs)
        .text(h1Arr[i], startArr[i], y + h1, {width: widthArr[i], align:'center'})        
        .text(h2Arr[i], startArr[i], y + h2, {width: widthArr[i], align:'center'})                      
        .moveTo(startArr[i], y+h1-5).lineTo(startArr[i], y+730).stroke()                     
      }            
  }      

  //BOX DETAILS VALUES//
  function boxValueInfo(start, hArr, itemSet){        
      hArr = hArr.map(item => item*15)
      let rowStartArr = getStartRange(start, hArr)        
      
      for(let i = 0; i < itemSet; i++){   
        let qty = `${itemArr[id].itemQuantity} ${itemArr[id].packagingType}`
        debug(boxArr[id])            
        let boxRowArr = [boxArr[id], itemArr[id].itemName, itemArr[id].hsnCode, qty, itemArr[i].itemPrice, totArr[id]] //
        
        for(let j = 0; j < startArr.length; j++){                     
          let yPos = y + rowStartArr[i]   

          doc.font('reg').fontSize(fs)                 
          .text(boxRowArr[j], startArr[j], yPos, {width: widthArr[j], align:'center'})                            
        }      
        id++ //INCREMENT GLOBAL ITEM TRACKER//
      }
  }
  
  //FOOTER AND CONTINUED TEXT//
  function footerInfo(page, remItems){
      let f1Arr = [disclaimer, `Authorized Signatory`]  //${order.consignor}
      let width2Arr = [390, 145] 

      let start2Arr = getStartRange(30, width2Arr)                

      for(let i = 0; i < start2Arr.length; i++){
        doc.font('bold').fontSize(fs)
        .text(f1Arr[i], start2Arr[i]+5, y + 735, {width: width2Arr[i]-5, height:30, align:'left'})  
        .moveTo(start2Arr[i], y+730).lineTo(start2Arr[i], fully-y).stroke()                                                 
      }

      let finalTxt = ''
      if(page == 1 && remItems >= pg1Limit){
        finalTxt = 'Continued'
      }else if(page > 1 && remItems >= addPgLimit){
        finalTxt = 'Continued'
      }

      doc.font('reg').fontSize(fs)
      .text(finalTxt, x-30, fully-20, {width: fullx, height:10, align:'center'})
  }
  
  //SUMMARY TEXT//
  function summaryInfo(){
      let words = toWords.convert(order.totalValue)
      debug(words)

      let totArr = [`${order.currency} ${words} only`, '', 'Total', order.currency, order.totalValue]  
      let width3Arr = [230, 70, 45, 47.5, 52.5]

      let start3Arr = getStartRange(120, width3Arr)        

      for(let i = 0; i < totArr.length; i++){
        doc.font('bold').fontSize(fs2)
        .text(totArr[i], start3Arr[i], y + 710, {width: width3Arr[i], height:30, align:'center'})                                                           
      }
  }
}

// ---------------- LIBRARY FUNCTIONS ------------------ //

function getList(arr, page, pg1Limit, addPgLimit){
  let limit
  page == 1 ? limit = pg1Limit : limit = addPgLimit
  let tot = []
  let count = 0
  arr.forEach(item => {    
    count += item
    if(count <= limit){
      tot.push(item)
    }
  })
  return tot
}
