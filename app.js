//environment
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

//require
const express = require('express')
var cookieParser = require('cookie-parser')
let session = require('express-session')
const mongoose = require('mongoose')
const errorHandler = require('./errorHandler')
const cors = require('cors')
const methodOverride = require('method-override')
var compression = require('compression')
var helmet = require('helmet')

//app
const app = express()

var moment = require('moment');
var shortDateFormat = 'DD-MM-yyyy';
var reverseDateFormat ='DD-MMMM-YYYY';
app.locals.moment = moment;
app.locals.shortDateFormat = shortDateFormat;
app.locals.reverseDateFormat = reverseDateFormat;

//route require
const indexRouter = require('./routes/index')
const dashboardRouter = require('./routes/dashboard')
const orderRouter = require('./routes/order')
const userRouter = require('./routes/user')
const manifestRouter = require('./routes/manifest')
const serviceRouter = require('./routes/service')


//set view and static files
app.set('view engine', 'ejs')
app.use(methodOverride('_method'))
app.use(express.static('public'))



//bodyparser and cookieparser middleware
app.use(express.json())
app.use(cookieParser())
/* app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
        "style-src": ["stackpath.bootstrapcdn.com", "'unsafe-inline'", "cdn.jsdelivr.net", "cdn.datatables.net", "'self'", "digitalawb.in"],
        "script-src-elem": ["'self'", "stackpath.bootstrapcdn.com", "code.jquery.com", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "cdn.datatables.net", "digitalawb.in"], 
        "script-src-attr": ["'unsafe-inline'"],       
        },                    
    })
) */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'"],
            scriptSrc: ["'self'"],
            reportUri: '/report-violation',
            objectSrc: ["'self'"],
            upgradeInsecureRequests: true,
        },
    },
    referrerPolicy: {policy: 'same-origin'},
    featurePolicy: {},
}))
app.use(express.urlencoded({ extended: true }))


//session middleware
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60*2 }
}))

app.use(cors())

//compression for all routes
app.use(compression())

//route
app.use('/', indexRouter)
app.use('/dashboard', dashboardRouter)
app.use('/orders', orderRouter)
app.use('/users', userRouter)
app.use('/manifest', manifestRouter)
app.use('/services', serviceRouter)


// Error Handling middleware
app.use(errorHandler.logErrors)
app.use(errorHandler.requestNotMatch)


//connect db
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected"));

mongoose.connection.on("error", err => console.log(`DB connection error : ${err.message}`));

//listen
app.listen(process.env.PORT, () => console.log(`App listening on port: ${process.env.PORT}`))