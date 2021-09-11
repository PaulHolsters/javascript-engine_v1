const mongoose = require('mongoose')

const specificationSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // identity
    specification: {type: String, required: true},
    // category
    type: {
        type: String,
        required: true,
        enum: ['basic', 'option', 'extra']
    },
    // financial
    price: {
        type: Number,
        required: function () {
            let verb = 'patch'
            if(this.type){
                verb = 'post'
            }
            switch (verb){
                case 'post':
                    return (this['type']!=='basic')
                case 'patch':
                    return (this._update['$set'].type!=='basic')
            }
        },
        validate:function () {
            let verb = 'patch'
            if(this.type){
                verb = 'post'
            }
            switch (verb){
                case 'post':
                    return !(this['type']==='basic'&&this['price']!==null)
                case 'patch':
                    return !(this._update['$set'].type==='basic'&&this._update['$set'].price!==null)
            }
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
