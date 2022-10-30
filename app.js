//environment
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

//require
const mongoose = require('mongoose')
const app = require('./index')

//connect db
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected"));

mongoose.connection.on("error", err => console.log(`DB connection error : ${err.message}`));

//listen
app.listen(process.env.PORT, () => console.log(`App listening on port: ${process.env.PORT}`))