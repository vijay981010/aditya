const debug = require('debug')('dev')
const logger = require('./helpers/logger')

exports.logErrors = (err, req, res, next) => {    
    debug(err.stack)
    req.session.destroy()
    //res.status(500).send('<h1>Something broke!</h1>')
    res.render('error', {message: `Something broke!`, statusCode: '500'})
    logger.error(`STATUSCODE: ${res.statusCode}, \n STATUSMESSAGE: ${res.statusMessage}, \n ERROR: ${err.message}, \n URL: ${req.originalUrl}, \n HTTP METHOD: ${req.method}, \n IP: ${req.ip}`)
    next();
}

exports.requestNotMatch = (req, res, next) =>{    
    //res.status(404).send("<h1>Page not found on the server</h1>")  
    res.render('error', {message: `Page not found on the server`, statusCode: '404'})  
}


