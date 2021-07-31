const mongoose = require('mongoose')
const Specification = require('../models/Specification')
const productSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // category
    type: {type: String, required: true, enum: ['hottub', 'sauna', 'tiny house']},
    // identity
    model: {type: String, required: true},
    // of het id geldig is en de array uniek (niet de individuele id's!) wordt onderzocht bij het router deel
    specifications: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Specification', required: true}],
        required: true,
        validate: function () {
            // gaat na of specifications enkel geldige id's bevat
            return Specification.find().then((specs) => {
                for (let i = 0; i < this['specifications'].length; i++) {
                    let id_valid = false
                    for (let j = 0; j < specs.length; j++) {
                        if (specs[j]._id.toString() === this['specifications'][i].toString()) {
                            id_valid = true
                        }
                    }
                    if (!id_valid) {
                        return false
                    }
                }
                return true
            })
        }
    }
},{})


productSchema.index({
    type: -1,
    model: 1,
}, {
    unique: true
});

module.exports = mongoose.model('Product', productSchema)
