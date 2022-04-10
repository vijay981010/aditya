const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Manifest = require('../model/manifestModel')
const debug = require('debug')('dev')
const mongoose = require('mongoose')
const {processRequest} = require('../helpers/helpers')
const ExcelJs = require('exceljs')
var moment = require('moment')
var shortDateFormat = 'DD-MM-yyyy'


const db = mongoose.connection;

exports.manifestList = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId)
        const manifestList = await Manifest.find({admin: userId})
        res.render('manifest/list', {user, manifestList}) 
    }catch(err){
        next(err)
    }
}

exports.manifestForm = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId)
        const countries = await db.collection('countries').find().toArray()
        let orderList = await Order.find().populate('client').sort({bookingDate: 'desc', createdAt: 'desc'}).limit(100)
        orderList = orderList.filter(elem => elem.client.admin == userId)
        res.render('manifest/add', {user, countries, orderList})
    }catch(err){
        next(err)
    }
}

exports.manifestGenerate = async(req, res, next) => {
    try{
        //debug(req.body)
        let { admin, manifestNumber, manifestDate, dispatchTo, 
        manifestOrigin, manifestDestination, manifestMode,
        mawbNumber, cdNumber, runNumber, flightNumber, 
        bagNumber, order} = req.body
        
        order = await Order.find({awbNumber: order})
        order = order.map(item => item._id)
        //debug(order)                

        let bagArr = []

        if(bagNumber && order){            
            bagArr = processRequest([bagNumber, order], ['bagNumber', 'order'], bagNumber.length)            
        }
        //debug(bagArr)

        let obj = { admin, manifestNumber, manifestDate, dispatchTo, 
            manifestOrigin, manifestDestination, manifestMode,
            mawbNumber, cdNumber, runNumber, flightNumber, 
            bagDetails: bagArr, totalAwbs: bagArr.length }
        
        const manifest = new Manifest(obj)

        await manifest.save()
        
        res.redirect('/manifest/list')
        
    }catch(err){
        next(err)
    }
}

exports.manifestUpdateForm = async(req, res, next) => {
    try{
        let userId = req.user.id
        let manifestId = req.params.manifestId

        const user = await User.findById(userId)
        const countries = await db.collection('countries').find().toArray()

        let orderList = await Order.find().populate('client').exec()
        orderList = orderList.filter(elem => elem.client.admin == userId)

        let manifest = await Manifest.findById(manifestId)
        //res.json(manifest)

        //convert the order id to awb numbers
        let awbnumbers = manifest.bagDetails.map(item => item.order)
        awbnumbers = await Order.find({_id: awbnumbers})
        awbnumbers = awbnumbers.map(item => item.awbNumber)
        //debug(awbnumbers)   
        //res.json(awbnumbers)     

        res.render('manifest/edit', {user, countries, orderList, manifest, awbnumbers})
    }catch(err){
        next(err)
    }
}

exports.manifestUpdate = async(req, res, next) => {
    try{
        let { admin, manifestNumber, manifestDate, dispatchTo, 
            manifestOrigin, manifestDestination, manifestMode,
            mawbNumber, cdNumber, runNumber, flightNumber, 
            bagNumber, order} = req.body

            let manifestId = req.params.manifestId
            
            order = await Order.find({awbNumber: order})
            order = order.map(item => item._id)
            //debug(order)                
    
            let bagArr = []
    
            if(bagNumber && order){            
                bagArr = processRequest([bagNumber, order], ['bagNumber', 'order'], bagNumber.length)            
            }
            //debug(bagArr)
    
            let obj = { admin, manifestNumber, manifestDate, dispatchTo, 
                manifestOrigin, manifestDestination, manifestMode,
                mawbNumber, cdNumber, runNumber, flightNumber, 
                bagDetails: bagArr, totalAwbs: bagArr.length }
                    
            await Manifest.findByIdAndUpdate(manifestId, obj, {new: true})
            
            res.redirect('/manifest/list')
    }catch(err){
        next(err)
    }
}

exports.manifestExcel = async(req, res, next) => {
    try{
        let userId = req.user.id
        let manifestId = req.params.manifestId

        let manifest = await Manifest.findById(manifestId)
        let user = await User.findById(userId)

        let orders = manifest.bagDetails.map(item => item.order)
        orders = await Order.find({_id: orders})

        const workbook = new ExcelJs.Workbook()

        const sheet = workbook.addWorksheet('Manifest') 

        // ---------------------------- BORDERS -------------------- //

        let row5 = sheet.getRow(5)
        let row6 = sheet.getRow(6)   
        let row7 = sheet.getRow(7) 
        let row8 = sheet.getRow(8) 
        let row9 = sheet.getRow(9) 
        let row10 = sheet.getRow(10) 
        let row11 = sheet.getRow(11) 
        let row12 = sheet.getRow(12) 
        let row14 = sheet.getRow(14) 
        let row15 = sheet.getRow(15)
        let row16 = sheet.getRow(16) 
        
        
        row5.getCell(1).border = {top: {style: 'thin'}}
        row5.getCell(2).border = {top: {style: 'thin'}}
        row5.getCell(3).border = {top: {style: 'thin'}}
        row5.getCell(4).border = {top: {style: 'thin'}, right: {style: 'thin'}, left: {style: 'thin'}}

        row6.getCell(3).border = {right: {style: 'thin'}}
        row6.getCell(4).border = {right: {style: 'thin'}, left: {style: 'thin'}}

        row7.getCell(1).border = {bottom: {style: 'thin'}}
        row7.getCell(2).border = {bottom: {style: 'thin'}}
        row7.getCell(3).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}    
        row7.getCell(4).border = {right: {style: 'thin'}, bottom: {style: 'thin'}, left: {style: 'thin'}}
        
        row5.getCell(8).border = {top: {style: 'thin'}, right: {style: 'thin'}, left: {style: 'thin'}}
        row5.getCell(9).border = {top: {style: 'thin'}, right: {style: 'thin'}}
        row6.getCell(8).border = {right: {style: 'thin'}, left: {style: 'thin'}}
        row6.getCell(9).border = {right: {style: 'thin'}}
        row7.getCell(8).border = {right: {style: 'thin'}, left: {style: 'thin'}}
        row7.getCell(9).border = {right: {style: 'thin'}}
        row8.getCell(8).border = {right: {style: 'thin'}, left: {style: 'thin'}}
        row8.getCell(9).border = {right: {style: 'thin'}}
        row9.getCell(8).border = {right: {style: 'thin'}, left: {style: 'thin'}}
        row9.getCell(9).border = {right: {style: 'thin'}}
        row10.getCell(8).border = {right: {style: 'thin'}, left: {style: 'thin'}}
        row10.getCell(9).border = {right: {style: 'thin'}}
        row11.getCell(8).border = {right: {style: 'thin'}, left: {style: 'thin'}}
        row11.getCell(9).border = {right: {style: 'thin'}}
        row12.getCell(8).border = {right: {style: 'thin'}, bottom: {style: 'thin'}, left: {style: 'thin'}}
        row12.getCell(9).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        
        row14.getCell(1).border = {top: {style: 'thin'}, bottom: {style: 'thin'}}
        row14.getCell(2).border = {top: {style: 'thin'}, bottom: {style: 'thin'}}
        row14.getCell(3).border = {top: {style: 'thin'}, bottom: {style: 'thin'}, left: {style: 'thin'}, right: {style: 'thin'}}   
        row14.getCell(4).border = {top: {style: 'thin'}, right: {style: 'thin'}, bottom: {style: 'thin'}}
        row14.getCell(5).border = {top: {style: 'thin'}, right: {style: 'thin'}, bottom: {style: 'thin'}}     
        row14.getCell(6).border = {top: {style: 'thin'}, right: {style: 'thin'}, bottom: {style: 'thin'}}
        row14.getCell(7).border = {top: {style: 'thin'}, bottom: {style: 'thin'}}
        row14.getCell(8).border = {top: {style: 'thin'}, bottom: {style: 'thin'}}
        row14.getCell(9).border = {top: {style: 'thin'}, right: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}}

        row15.getCell(1).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row15.getCell(2).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row15.getCell(3).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row15.getCell(4).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row15.getCell(5).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row15.getCell(6).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row15.getCell(7).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row15.getCell(8).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row15.getCell(9).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}

        row16.getCell(1).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row16.getCell(2).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row16.getCell(3).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row16.getCell(4).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row16.getCell(5).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row16.getCell(6).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row16.getCell(7).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row16.getCell(8).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        row16.getCell(9).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}

        // --------------------------- COLUMN WIDTH ---------------- //

        sheet.getColumn(3).width = 50
        sheet.getColumn(4).width = 50
        sheet.getColumn(8).width = 25
        sheet.getColumn(9).width = 25

        row14.height = 40
        row16.height = 40
        
        // ------------------------- HEADER ------------------------------ //

        let fontOpts = {'bold': true, 'name': 'Calibri'}

        sheet.mergeCells('A1: I1')
        sheet.getCell('A1').alignment = {horizontal: 'center'}
        sheet.getCell('A1').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'New Form Courier Bill Of Export - II (CBE x - II)'
            }
        ]
        }

        sheet.mergeCells('A2: I2')
        sheet.getCell('A2').alignment = {horizontal: 'center'}
        sheet.getCell('A2').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': '( See Regulation 6 )'
            }
        ]
        }

        sheet.mergeCells('A3: I3')
        sheet.getCell('A3').alignment = {horizontal: 'center'}
        sheet.getCell('A3').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'Courier Shipping Bill'
            }
        ]
        }

        // ---------------------------------- FROM - TO ----------------------------- //

        sheet.mergeCells('A5: C5')    
        sheet.getCell('A5').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'FROM:'
            }
        ]
        }
            
        sheet.getCell('D5').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'TO:'
            }
        ]
        }

        sheet.mergeCells('A6: C6')    
        sheet.getCell('A6').value = user.username
        
        sheet.getCell('D6').value = manifest.dispatchTo

        sheet.mergeCells('A7: C7')    
        sheet.getCell('A7').value = manifest.manifestOrigin
        
        sheet.getCell('D7').value = manifest.manifestDestination

        // ----------------------------- MANIFEST DETAILS --------------------- //
        
        sheet.getCell('H5').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'ARRIVAL DATE:'
            }
        ]
        }    

        sheet.getCell('H6').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'ORIGIN:'
            }
        ]
        }

        sheet.getCell('I6').value = manifest.manifestOrigin

        sheet.getCell('H7').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'MAWB:'
            }
        ]
        }

        sheet.getCell('I7').value = manifest.mawbNumber

        sheet.getCell('H8').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'TOTAL BAGS:'
            }
        ]
        }

        sheet.getCell('H9').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'DESTINATION:'
            }
        ]
        }

        sheet.getCell('I9').value = manifest.manifestDestination

        sheet.getCell('H10').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'FLIGHT NO:'
            }
        ]
        }

        sheet.getCell('I10').value = manifest.flightNumber

        sheet.getCell('H11').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'CD NO:'
            }
        ]
        }

        sheet.getCell('I11').value = manifest.cdNumber

        sheet.getCell('H12').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'RUN NO:'
            }
        ]
        }

        sheet.getCell('I12').value = manifest.runNumber

        // ----------------------------------- TABLE HEADERS 1 --------------------------------- //

        sheet.mergeCells('A14: B14')  
        sheet.getCell('A14').alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}  
        sheet.getCell('A14').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': user.username
            }
        ]
        }

        sheet.mergeCells('C14: D14')    
        sheet.getCell('C14').alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell('C14').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'Name of Land Custom Station'
            }
        ]
        }

        sheet.getCell('E14').alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}
        sheet.getCell('E14').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'Place of Loading'
            }
        ]
        }

        sheet.mergeCells('G14: H14')   
        sheet.getCell('G14').alignment = {horizontal: 'center', vertical: 'middle'} 
        sheet.getCell('G14').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'Customs Department Serial No. /Date'
            }
        ]
        }

        // ----------------------------------- TABLE HEADERS 2 --------------------------------- //

        sheet.getCell('C15').alignment = {horizontal: 'center'} 
        sheet.getCell('C15').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'LHR'
            }
        ]
        }

        sheet.getCell('E15').alignment = {horizontal: 'center'} 
        sheet.getCell('E15').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'Gf - 057'
            }
        ]
        }

        sheet.getCell('G15').alignment = {horizontal: 'center'} 
        sheet.getCell('G15').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'BOM'
            }
        ]
        }

        // ----------------------------------- TABLE HEADERS 3 --------------------------------- //

        sheet.getCell('A16').alignment = {horizontal: 'center', vertical: 'middle'} 
        sheet.getCell('A16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'S.NO'
            }
        ]
        }

        sheet.getCell('B16').alignment = {horizontal: 'center', vertical: 'middle', wrapText: true} 
        sheet.getCell('B16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': 'Invoice No. & Date'
            }
        ]
        }

        sheet.getCell('C16').alignment = {horizontal: 'center', vertical: 'middle'} 
        sheet.getCell('C16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': `Consignor's Name And Address`
            }
        ]
        }

        sheet.getCell('D16').alignment = {horizontal: 'center', vertical: 'middle'} 
        sheet.getCell('D16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': `Consignee's Name And Address`
            }
        ]
        }

        sheet.getCell('E16').alignment = {horizontal: 'center', vertical: 'middle', wrapText: true} 
        sheet.getCell('E16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': `No.of Packages`
            }
        ]
        }

        sheet.getCell('F16').alignment = {horizontal: 'center', vertical: 'middle'} 
        sheet.getCell('F16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': `Weight`
            }
        ]
        }

        sheet.getCell('G16').alignment = {horizontal: 'center', vertical: 'middle', wrapText: true} 
        sheet.getCell('G16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': `Value  INR`
            }
        ]
        }

        sheet.getCell('H16').alignment = {horizontal: 'center', vertical: 'middle'} 
        sheet.getCell('H16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': `Description Of Goods`
            }
        ]
        }

        sheet.getCell('I16').alignment = {horizontal: 'center', vertical: 'middle'} 
        sheet.getCell('I16').value = {
        'richText': [
            {
            'font' : fontOpts, 
            'text': `Bag No`
            }
        ]
        }  

        let itemArray = []    

        for(let i = 0; i < orders.length; i++){
        let temp = []
        for(let j = 0; j < orders[i].boxDetails.length; j++){    
            for(let k = 0; k < orders[i].boxDetails[j].itemDetails.length; k++){      
            temp.push(orders[i].boxDetails[j].itemDetails[k].itemName)
            }    
        }  
        itemArray.push(temp)
        }


        let itemStringArray = []

        for(let i = 0; i < itemArray.length; i++){
        let itemString = ''
        for(let j = 0; j < itemArray[i].length; j++){    
            itemString += itemArray[i][j] + ','    
        }
        itemString = itemString.slice(0, -1)  
        itemStringArray.push(itemString)
        }

        manifest.bagDetails.forEach((bag, i) => {      

        sheet.getRow(17 + (8 * i)).height = 60

        sheet.getCell(`A${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell(`A${17 + (8 * i)} `).value = i + 1

        sheet.getCell(`B${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell(`B${17 + (8 * i)} `).value = orders[i].awbNumber

        sheet.getCell(`C${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell(`C${17 + (8 * i)} `).value = orders[i].consignor

        sheet.getCell(`C${18 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`C${18 + (8 * i)} `).value = orders[i].consignorAddress1

        sheet.getCell(`C${19 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`C${19 + (8 * i)} `).value = orders[i].consignorAddress2

        sheet.getCell(`C${20 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`C${20 + (8 * i)} `).value = orders[i].consignorCity

        sheet.getCell(`C${21 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`C${21 + (8 * i)} `).value = orders[i].consignorState

        sheet.getCell(`C${22 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`C${22 + (8 * i)} `).value = orders[i].consignorPincode

        sheet.getCell(`C${23 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`C${23 + (8 * i)} `).value = orders[i].origin

        sheet.getCell(`C${24 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`C${24 + (8 * i)} `).value = `Tel: ${orders[i].consignorContactNumber}`

        sheet.getCell(`D${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell(`D${17 + (8 * i)} `).value = orders[i].consignee

        sheet.getCell(`D${18 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`D${18 + (8 * i)} `).value = orders[i].consigneeAddress1

        sheet.getCell(`D${19 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`D${19 + (8 * i)} `).value = orders[i].consigneeAddress2

        sheet.getCell(`D${20 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`D${20 + (8 * i)} `).value = orders[i].consigneeCity

        sheet.getCell(`D${21 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`D${21 + (8 * i)} `).value = orders[i].consigneeState

        sheet.getCell(`D${22 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`D${22 + (8 * i)} `).value = orders[i].consigneePincode

        sheet.getCell(`D${23 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`D${23 + (8 * i)} `).value = orders[i].destination

        sheet.getCell(`D${24 + (8 * i)} `).alignment = {horizontal: 'center'}
        sheet.getCell(`D${24 + (8 * i)} `).value = `Tel: ${orders[i].consigneeContactNumber}`

        sheet.getCell(`E${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell(`E${17 + (8 * i)} `).value = orders[i].numberOfBoxes

        sheet.getCell(`F${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell(`F${17 + (8 * i)} `).value = orders[i].chargeableWeight

        sheet.getCell(`G${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell(`G${17 + (8 * i)} `).value = orders[i].totalValue

        sheet.getCell(`H${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}
        sheet.getCell(`H${17 + (8 * i)} `).value = itemStringArray[i]

        sheet.getCell(`I${17 + (8 * i)} `).alignment = {horizontal: 'center', vertical: 'middle'}
        sheet.getCell(`I${17 + (8 * i)} `).value = bag.bagNumber

        //------- borders -------- //
        for(let j = 17; j < 25; j++){
            for(let k = 1; k < 10; k++){
            sheet.getRow(j + (8 * i)).getCell(k).border = {right: {style: 'thin'}}
            if(j == 24){
                sheet.getRow(j + (8 * i)).getCell(k).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
            }          
            }
        }      
        })
        

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        res.setHeader("Content-Disposition",`attachment; filename=manifest_${manifest.manifestNumber}.xlsx`)

        return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
        })

    }catch(err){
        next(err)
    }
}

exports.ediExcel = async(req, res, next) => {
    try{
        let userId = req.user.id
        let manifestId = req.params.manifestId

        let manifest = await Manifest.findById(manifestId)
        let user = await User.findById(userId)

        let orders = manifest.bagDetails.map(item => item.order)
        orders = await Order.find({_id: orders})

        // -------------------------- item serialization computation ------------------ //

        let itemArray = []    

        for(let i = 0; i < orders.length; i++){
            let temp = []
            for(let j = 0; j < orders[i].boxDetails.length; j++){    
                for(let k = 0; k < orders[i].boxDetails[j].itemDetails.length; k++){      
                    temp.push(orders[i].boxDetails[j].itemDetails[k].itemName)
                }    
            }  
            itemArray.push(temp)
        }

        let itemStringArray = []

        for(let i = 0; i < itemArray.length; i++){
        let itemString = ''
        for(let j = 0; j < itemArray[i].length; j++){    
            itemString += itemArray[i][j] + ','    
        }
        itemString = itemString.slice(0, -1)  
        itemStringArray.push(itemString)
        }

        // ------------------------------------- excel start ----------------------- //

        const workbook = new ExcelJs.Workbook()

        const sheet = workbook.addWorksheet('EDI')

        let fontOpts = {'bold': true, 'name': 'Calibri'}    

        let headerArray = ['MAWB_Number', 'No_of_Bags_Pkgs_Pieces_ULD', 'Numbers_of_HAWBS', 'HAWB_Number',
        'Description_of_Goods', `VALUE`, 'Consignor_Name', 'Address_1', 'Address_2', 'City', 'State', 
        'Postal_Code', 'Country', 'Consignee_Name', 'Address_1', 'Address_2', 'City', 'State', 
        'Postal_Code', 'Country', 'Weight', 'Total_IGST_Paid', 'Payment_through_IGST', 'Bond_or_UT', 
        'Date_of_EXPORT_Invoice', 'Export_Invoice_no', 'Date_of_GST_Invoice', 'Gst_Invoice_no', 'Gstin_id', 
        'Gstin_type', 'MHBS_NO', 'HAWB_CRN', 'CRN_No/CRN_MHBS_NO', 'Invoice_Value', 'Invoice_Currency', 
        'FOB_Value', 'AD Code']

        let colWidthArray = [20, 30, 20, 15, 60, 15, 30, 50, 50, 20, 20, 20, 20, 30, 50, 50, 20, 20, 20, 20, 8, 15, 20, 15, 30, 25, 20, 15, 
        30, 15, 15, 20, 30, 15, 20, 15, 8]
    

        // ---------------------------- HEADERS -------------------------------- //        

        headerArray.forEach((header,i) => {
        sheet.getRow(1).getCell(i + 1).alignment = {horizontal: 'center'}
        sheet.getRow(1).getCell(i + 1).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        sheet.getRow(1).getCell(i + 1).value = {        
            'richText': [
            {
                'font': fontOpts,
                'text': header
            }          
            ]
        }
        sheet.getColumn(i + 1).width = colWidthArray[i]
        })

        // --------------------------- values tables --------------------------- //
        
        manifest.bagDetails.forEach((bag, i) => {
        sheet.getRow(i + 2).height = 30   
        

        for(let j = 1; j < 38; j++){
            sheet.getRow(i + 2).getCell(j).alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}        
            sheet.getRow(i + 2).getCell(j).border = {right: {style: 'thin'}, bottom: {style: 'thin'}}
        }
        
        sheet.getRow(i + 2).getCell(1).value = manifest.mawbNumber
            
        sheet.getRow(i + 2).getCell(2).value = orders[i].numberOfBoxes
                
        sheet.getRow(i + 2).getCell(3).value = orders[i].numberOfBoxes
        
        sheet.getRow(i + 2).getCell(4).value = orders[i].awbNumber
        
        sheet.getRow(i + 2).getCell(5).value = itemStringArray[i]

        sheet.getRow(i + 2).getCell(6).value = orders[i].totalValue

        sheet.getRow(i + 2).getCell(7).value = orders[i].consignor

        sheet.getRow(i + 2).getCell(8).value = orders[i].consignorAddress1

        sheet.getRow(i + 2).getCell(9).value = orders[i].consignorAddress2

        sheet.getRow(i + 2).getCell(10).value = orders[i].consignorCity

        sheet.getRow(i + 2).getCell(11).value = orders[i].consignorState

        sheet.getRow(i + 2).getCell(12).value = orders[i].consignorPincode

        sheet.getRow(i + 2).getCell(13).value = orders[i].origin

        sheet.getRow(i + 2).getCell(14).value = orders[i].consignee

        sheet.getRow(i + 2).getCell(15).value = orders[i].consigneeAddress1

        sheet.getRow(i + 2).getCell(16).value = orders[i].consigneeAddress2

        sheet.getRow(i + 2).getCell(17).value = orders[i].consigneeCity

        sheet.getRow(i + 2).getCell(18).value = orders[i].consigneeState

        sheet.getRow(i + 2).getCell(19).value = orders[i].consigneePincode

        sheet.getRow(i + 2).getCell(20).value = orders[i].destination

        sheet.getRow(i + 2).getCell(21).value = orders[i].chargeableWeight

        sheet.getRow(i + 2).getCell(22).value = 0

        sheet.getRow(i + 2).getCell(23).value = 'N'

        sheet.getRow(i + 2).getCell(24).value = 'UT'

        sheet.getRow(i + 2).getCell(25).value = moment(manifest.manifestDate).format(shortDateFormat)

        sheet.getRow(i + 2).getCell(26).value = orders[i].awbNumber

        sheet.getRow(i + 2).getCell(27).value = moment(orders[i].bookingDate).format(shortDateFormat)

        sheet.getRow(i + 2).getCell(28).value = orders[i].awbNumber.substring(2)

        sheet.getRow(i + 2).getCell(29).value = orders[i].docNumber

        sheet.getRow(i + 2).getCell(30).value = orders[i].docType

        sheet.getRow(i + 2).getCell(32).value = 'Y'

        sheet.getRow(i + 2).getCell(34).value = orders[i].totalValue

        sheet.getRow(i + 2).getCell(35).value = orders[i].currency

        sheet.getRow(i + 2).getCell(36).value = orders[i].totalValue

        sheet.getRow(i + 2).getCell(37).value = 0
        })
        

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        res.setHeader("Content-Disposition",`attachment; filename=EDI_${manifest.manifestNumber}.xlsx`)

        return workbook.xlsx.write(res).then(function (){
            res.status(200).end();
        })
    }catch(err){
        next(err)
    }
}