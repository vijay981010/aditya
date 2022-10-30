const app = require('../index')
let MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const mongoose = require('mongoose')

let mongo = null
beforeAll(async() => {             
    mongo = await MongoMemoryServer.create()
    const mongoUri = mongo.getUri()

    await mongoose.connect(mongoUri, {})    
})

beforeEach(async() => {
    const collections = await mongoose.connection.db.collections()

    for(let collection of collections){
        await collection.deleteMany({})
    }
})
    
afterAll(async() => {  
    if(mongo) await mongo.stop()

    await mongoose.connection.close()
})