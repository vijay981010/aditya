const debug = require('debug')('c_app: errorHandler')
const logger = require('./helpers/logger')

exports.logErrors = (err, req, res, next) => {    
    debug(err.stack)         
    return res.status(500).render('error', {message: `Something broke! ${err.message}`, statusCode: '500'})    
}

exports.requestNotMatch = (req, res, next) =>{    
    //res.status(404).send("<h1>Page not found on the server</h1>")  
    return res.status(404).render('error', {message: `Page not found on the server`, statusCode: '404'})  
}


