const mongoose = require('mongoose')


const specificationSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // identity
    specification: {type: String, required: true},
    // category
    type: {type: String, required: true, enum: ['basic', 'option', 'extra']},
    // financial
    price: {
        type: Number,
        required: function () {
            return this['type'] === 'option';
        },
        validate:function () {
            return this['type'] !== 'basic';
        }
    }
})

specificationSchema.index({
    specification: 1,
    type: -1,
}, {
    unique: true,
});

module.exports = mongoose.model('Specification', specificationSchema)
