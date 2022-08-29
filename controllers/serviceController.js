const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Service = require('../model/serviceModel')
const fs = require('fs').promises
const path = require('path')
var excelToJson = require('convert-excel-to-json')
const mongoose = require('mongoose')
const ExcelJs = require('exceljs')
const {getService} = require('../excel/service')

const db = mongoose.connection

exports.list = async(req, res, next) => {
    try{
        let userId = req.user.id
        const user = await User.findById(userId).populate({path: 'admin', select: 'username'})

        const countries = await db.collection('countries').find().toArray()

        let zonePop = {path: 'zone', select: 'zoneName countries'}
        let clientPop = {path: 'client', select: 'username'}
        let filter = {admin: userId}
        if(user.role=='client') filter = {$or: [{client: userId}, {admin: user.admin._id, category:'common'}]}

        const serviceList = await Service.find(filter).sort({updatedAt: 'asc'}).populate(zonePop).populate(clientPop)
        res.render('service/list', {user, countries, serviceList}) 
    }catch(err){
        next(err)
    }
}

exports.form = async(req, res, next) => renderServiceForm(req, res, next)

exports.checkFile = async (req, res, next) => {
    let debug = require('debug')('c_app: checkFile')
    
    //1.GET FILEPATH AND INITIALIZE ERROR OBJECT
    let filePath = __dirname + '/uploads/' + req.file.filename 
    let iAlert = [] 

    //2.CHECK EXTENSION AND FILE SIZE//
    const ext = path.extname(req.file.originalname)            
    if(ext != '.xlsx') iAlert.push({msg: `Only XLSX files allowed`, id:'FILE ERROR'})               
    if(req.file.size > 100000) iAlert.push({msg: `Max 100kb allowed`, id:'FILE ERROR'})    
    
    //3. RENDER ERRORS AND UNLINK FILE// 
    try{
        if(iAlert.length > 0){            
            await fs.unlink(filePath)                
            return renderServiceForm(req, res, next, iAlert)            
        }
    }catch(err){
        return next(err)
    }                 

    //IF NO ERROR GO TO DATA PROCESSING//
    next()
    
}

exports.processService = async(req, res, next) => {
    try{
        let debug = require('debug')('c_app: createService') //DEBUG//
        
        //GET FORM DATA//
        let {serviceCode, displayName, serviceGst, serviceFsc, admin, client, category} = req.body

        //PARSE SERVICE GST//
        serviceGst = JSON.parse(serviceGst)
        
        //CAPITALIZE SERVICE CODE//
        serviceCode = serviceCode.toUpperCase()

//GET EXCEL DATA//
        let filePath = __dirname + '/uploads/' + req.file.filename //GET FILEPATH//
        
        //GET EXCEL DATA//
        let data = excelToJson({
            sourceFile: filePath        
        })

        let zoneData = data.zonedata
        let rateData = data.ratedata

        await fs.unlink(filePath) //REMOVE FILE//                

//SHEET DATA VALIDATION//
        let alert = []
        
        //1. CHECK SHEET NAMES//        
        if(zoneData == undefined || rateData == undefined)
            alert.push({msg: `Incorrect Sheet Names in excel file. Please check`, id: 'SHEET ERROR'})        

        //2. CHECK IF COUNTRY NAMES ARE CORRECT// 
        let countryArr = []   
        
        //GET HEADERS//
        let zoneArray = Object.values(zoneData[0]) 
        let keysArr = Object.keys(rateData[0])
        let zoneKeys = Object.keys(zoneData[0])   

        //CHECK IF ZONE AND RATE HAVE SAME NUMBER OF HEADERS
        if(zoneArray.length + 1 != keysArr.length) alert.push({msg: 'ZONE AND RATE HEADERS ARE NOT SAME', id: 'HEADER ERROR'})

        //CHECK IF BLANKS EXISTS IN RATEDATA
        let rateDataCheck = rateData.map(item => Object.values(item).length)
        if([... new Set(rateDataCheck)].length != 1) alert.push({msg: 'BLANKS/EXTRAS IN RATECHART', id: 'RATE ERROR'})            

        //REMOVE HEADERS ELEMENT FROM ZONEDATA ARRAY//
        zoneData.shift() 
        rateData.shift()

        //CHECK IF RATEDATA IS NUMBER
        if(rateData.map(item => Object.values(item).map(elem => parseFloat(elem))).map(item => item.includes(NaN)).includes(true))
            alert.push({msg: 'RATE CHART HAS A NON-NUMERIC VALUE', id: 'RATE ERROR'})

        //PROCESS ZONEDATA TO GET COUNTRIES ARRAY//                      
        for(let i = 0; i < zoneKeys.length; i++){
            let temp = []
            for(let j = 0; j < zoneData.length; j++){                
                if(zoneData[j][zoneKeys[i]] != undefined) temp.push(zoneData[j][zoneKeys[i]])                    
            }
            countryArr.push(temp)
        }
        
        //CHECK IF COUNTRY NAMES ARE CORRECT//    
        let countries = await db.collection('countries').find().toArray()        
        countries = countries.map(country => country.name)

        countryArr.forEach(country => {
            country.forEach(item => {
                if(countries.indexOf(item) == -1) alert.push({msg: `INCORRECT COUNTRY: ${item}`, id: 'COUNTRY ERROR'})                
            })
        })
        
        //RENDER ERROR MESSAGES//  
        if(alert.length > 0)  return renderServiceForm(req, res, next, alert)

//PROCESS EXCEL AND FORM DATA IF NO ERROR//                
        //COMPUTE FRACTION VALUE FROM PERCENTAGE        
        let sFsc = 0
        if(serviceFsc != 0) sFsc = serviceFsc/100                    
        
        let finalArr = processServiceExcel(keysArr, rateData, sFsc, serviceGst, zoneArray, countryArr)   
        //debug(finalArr)       

//WRITE TO DB//
        let obj = {serviceCode, displayName, serviceFsc, serviceGst, zone: finalArr, admin, client, category}        

        if(req.params.serviceId){
            await Service.findByIdAndUpdate(req.params.serviceId, obj)
        }else{
            const newService = new Service(obj)
            await newService.save()
        }        

        res.redirect('/services/list')

    }catch(err){
        next(err)
    }
}

exports.rateChecker = async(req, res, next) => {
    try{
        //debug(req.body)
        let {serviceId, country, weight} = req.body
        //debug(weight)
        let ratelist = await Service.findById(serviceId)
        let gst = ratelist.serviceGst
        //debug(ratelist)    

    //------- FILTER ZONE BY COUNTRY ------------- //
        let zoneArr = ratelist.zone
        let filteredZone = zoneArr.filter(zone => zone.countries.indexOf(country) != -1)
        //debug(filteredZone.length)
        if(filteredZone.length == 0){            
            res.json({data: 'undefined'})
        }else{
        // ------------ FILTER RATE BY WEIGHT ---------- //
           let match = filteredZone[0].ratechart.filter(rate => rate.weight == weight)
           //debug(match)
           if(match.length == 0){
            res.json({data: 'undefined'})
           }else{
            res.json({data: match[0].rate, gst})
           }           
        }
        
    }catch(err){
        next(err)
    }
}

exports.serviceExport = async(req, res, next) => {
    try{
        let {serviceId, fsc} = req.params    
        
        let role = req.user.role

        let service = await Service.findById(serviceId)

        //MAKE FILENAME
        let fileName
        if(role == 'admin'){
            fsc ? fileName = `${service.serviceCode}_withfsc.xlsx` : fileName = `${service.serviceCode}_withoutfsc.xlsx`            
        }else if(role == 'client'){
            fileName = `${service.displayName}.xlsx`
        }
        
         
        const workbook = new ExcelJs.Workbook()

        getService(workbook, service, fsc)        

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition",`attachment; filename=${fileName}`)

        return workbook.xlsx.write(res).then(function () {
            res.status(200).end()
        })
        //res.json(service)        
    }catch(err){
        next(err)
    }
}


async function renderServiceForm(req, res, next, alert){
    try{
        let debug = require('debug')('c_app: renderServiceForm')

        let userId = req.user.id
        const user = await User.findById(userId)  
        
        let clientList = await User.find({admin: userId}).where('username').ne('Miscellaneous').select('username')        

        //RENDER INFO FOR ADD SERVICE//
        let renderData = { user, clientList, service: new Service() }
        let renderView = 'service/add'

        //RENDER INFO FOR UPDATE SERVICE//
        if(req.params.serviceId){
            let serviceId = req.params.serviceId
            let serviceFields = 'serviceCode serviceGst category displayName serviceFsc'
            let clientPop = {path: 'client', select: 'username'}
            const service = await Service.findById(serviceId).populate(clientPop).select(serviceFields)
            renderData = { user, clientList, service }
            renderView = 'service/edit'
        }

        debug(renderData.service)

        //VALIDATION CHECK//
        if(alert) renderData.alert = alert

        res.render(renderView, renderData)
    }catch(err){
        next(err)
    }    
}

function processServiceExcel(keysArr, rateData, sFsc, serviceGst, zoneArray, countryArr){
    let finalrate = []   
    let finalArr = []
    
    //PROCESS RATEDATA TO GET FINALRATE//
    for(let i = 1; i < keysArr.length; i++){  
        let ratechart = []
        for(let j = 0; j < rateData.length; j++){                
            let obj = {} //INITIATE TEMP OBJ//           
            
            //ADD FUEL SURCHARGE//
            let rate = parseFloat(rateData[j][keysArr[i]])
            let fsc = sFsc*rate
            rate += fsc 
            
            //CHECK AND ADD GST
            if(serviceGst) rate = rate + (rate*0.185) 

            //ADD TO OBJECT
            obj.weight = rateData[j][keysArr[0]]
            obj.rate = rate.toFixed(2)
            
            //PUSH OBJ TO ARRAY
            ratechart.push(obj)
            
        } 
        finalrate.push(ratechart)         
    }

    //MAP THE GENERATED ARRAYS TO OBJECT KEYS AND PUSH OBJ TO FINAL ARRAY//
    for(let i = 0; i < zoneArray.length; i++){
        let obj = {}            
        obj.zoneName = zoneArray[i]
        obj.countries = countryArr[i]
        //console.log(finalrate[i])  
        obj.ratechart = finalrate[i]  
        finalArr.push(obj)
    }

    return finalArr
}