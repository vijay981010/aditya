const mongoose = require('mongoose')

const Schema = mongoose.Schema

const countryStateSchema = new Schema({
    country: {
        type: String,
    },
    state: {
        type: Array,
    }
})

const Countrystate = mongoose.model('Countrystate', countryStateSchema)

module.exports = Countrystate