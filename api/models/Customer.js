const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // identity
    companyName: {type: String, default:''},
    firstName: {type: String, default:''},
    lastName: {type: String, default:''},
    // address
    street: {type: String, default:''},
    houseNumber: {type: String, default:''},
    boxNumber: {type: String, default:''},
    postalCode: {type: String, default:''},
    city: {type: String, default:''},
    country: {type: String, default:''},
    // contact
    cellPhoneNumber: {type: String, default:''},
    phone: {type: String, default:''},
    email: {type: String, default:''},
    // financial
    VAT_percentage: {type: Number, default: 21},
    VAT_number: {type: String, default:''}
})

module.exports = mongoose.model('Customer',customerSchema)
