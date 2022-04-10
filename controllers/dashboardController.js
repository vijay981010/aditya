const debug = require('debug')('dev')
const User = require('../model/userModel')
const Order = require('../model/orderModel')

exports.index = async (req, res, next) => {
    try{
        
        let userId = req.user.id
        let role = req.user.role
        
        const user = await User.findById(userId)
        
        //INITIALISE ALL ORDER VARIABLE//
        let allOrders

        //INITIALISE TOTAL API VARIABLE FOR ADMIN//
        let totalApi

        //GET ALL ORDERS FOR CLIENT USERS//
        allOrders = await Order.find({client: userId}).select('apiCount') 

        //GET ALL ORDERS FOR ADMIN USER//
        if(role == 'admin'){
            allOrders = await Order.find().populate('client').select('apiCount') 
            allOrders = allOrders.filter(elem => elem.client.admin == userId)

            totalApi = allOrders.map(item => item.apiCount) //GET APICOUNT ARRAY//
            totalApi = totalApi.reduce((a, b) => a + b, 0) //GET SUM OF APICOUNT//
        }  

        let totAllOrders = allOrders.length //GET COUNT OF FILTERED ORDERS//
            
            
        let apiCredit //INITIALISE APICREDIT VARIABLE FOR ADMIN//

        //GET APICREDIT OF ADMIN USER//
        if(role == 'admin'){
            let adminUser = await User.findById(userId).select('apiCredit')
            apiCredit = adminUser.apiCredit
        }

        //DEFINE COLOR ACCORDING TO APICREDIT COUNT//
        let color = 'bg-success'
        if(apiCredit <= 25) color = 'bg-danger'
        

        res.render('dashboard/dashboard', {apiCredit, totalApi, totAllOrders, user, color})
        
        
    }catch(err){
        next(err)
    }    
}