const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')


const Specification = require('../models/Specification')

router.post('/', (req, res, next) => {
    // in een post request verwijst 'this' in het model naar het onderstaande object
    const specification = new Specification(
        {
            _id: new mongoose.Types.ObjectId(),
            specification: req.body.specification,
            type: req.body.type,
            price: req.body.price
        }
    )
    // todo add a callbackfunctions to do very non-generic validations here instead of in the model
    specification.save().then(result => {
        res.status(201).json({
            message: 'specification created',
            specification: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

// deze route geeft alle specificaties terug, ongeacht het type (standard, option, extra)
router.get('/', (req, res, next) => {
    Specification.find().select('specification type price _id').populate('specifications').exec().then(result => {
        // het is mogelijk dat result een lege array is omdat er nog geen specificaties zijn aangemaakt
        const listOfObjects = result.map(spec=>{
            if(spec.price === undefined || spec.price===null){
                return {
                    specification:spec.specification,
                    type:spec.type,
                    price:'n.v.t.',
                    id:spec._id
                }
            }
            return {
                specification:spec.specification,
                type:spec.type,
                price:spec.price,
                id:spec._id
            }
        })
        res.status(200).json({
            listOfObjects:listOfObjects,
            numberOfObjects:listOfObjects.length,
            listOfProperties:['specification','type','price'],
            numberOfProperties: 3
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

// zoeken op type is toegevoegd omdat dit in een dropdown gevraagd wordt en dus een standaard feature is
router.get('/type/:specificationType', (req, res, next) => {
    const type = req.params.specificationType
    Specification.find().where('type').equals(type).exec().then(result => {
        // het is mogelijk dat result een lege array is omdat er nog geen specificaties zijn aangemaakt
        res.status(200).json(result)
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.get('/id/:specificationId', (req, res, next) => {
    const id = req.params.specificationId
    // todo beautify this response
    Specification.findById(id).select('specification type price _id').exec().then(result => {
        if(result.price === undefined||result.price === null){
            res.status(200).json({
                // the customer can be null if the customer was erased before
                specification: result.specification,
                type: result.type,
                price: null,
                id:result.id
            })
        } else{
            res.status(200).json({
                // the customer can be null if the customer was erased before
                specification: result.specification,
                type: result.type,
                price: result.price,
                id:result.id
            })
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.patch('/id/:specificationId', (req, res, next) => {
    const id = req.params.specificationId
    console.log(req.body)
    Specification.findByIdAndUpdate({_id:id}, {specification:req.body.specification,type:req.body.type,price:req.body.price} ,
    {
        new: true
        ,runValidators:true,
        context: 'query'
    }).exec().then(result => {
        // result bevat de oorspronkeljke versie, vóór de update
        res.status(200).json({
            // the customer can be null if the customer was erased before
            updatedCustomer: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.delete('/id/:specificationId', (req, res, next) => {
    const id = req.params.specificationId
    Specification.findByIdAndRemove(id).exec(
    ).then(
        result => {
            // result bevat de oorspronkeljke versie, vóór de update
            res.status(200).json(result)
        }
    ).catch(err => {
            res.status(500).json({
                error: err
            })
        }
    )
})

/* de volgende routes zijn filters voor de tabel met specificaties:
    je kan filteren op specificatie (s), type (t) , prijs (p) of een combinatie van deze 3
    dit geeft 2² = 8 filters en dus 8 routes
    voor p moet steeds een functie en een bedrag worden gegeven.
    de functies zijn: gte gt lte lt e
    dit kan 2 keer gebeuren met een tussen route voegsel van and of or
 */

/****                           FILTEREN VAN SPECIFICATIES     (op basis van type, specificatie, prijs)             ******/

router.get('/filter/:filterOn/:filterDetail', (req, res, next) => {
    // helper function
    const generateString = function () {
        const details = (req.params.filterDetail).split('*')
        let conditions
        const filterOn = req.params.filterOn
        let responseStr = ''
        // todo maak ook de mogelijkheid om meerdere types te selecteren zodat '/type/:specificationType' een overbodige route wordt
        // todo gebruik + om 2 types aan elkaar te rijgen
        // todo 2 types zijn altijd een OR clausule
        switch (filterOn) {
            case 'stp':
                conditions = details[2].split('-')
                if (conditions.length === 5) {
                    return 'where(\'specification\', new RegExp(\'' + details[0] + '\',\'i\')).where(\'type\', \'' + details[1] + '\').'
                        +'where(\'price\').'+conditions[2]+'([{price:{$'+conditions[0] + ':'
                        + Number(conditions[1]) + '}},{price:{$'+conditions[3]
                        + ':' + Number(conditions[4]) + '}}]).'
                } else {
                    return 'where(\'specification\', new RegExp(\'' + details[0] + '\',\'i\')).where(\'type\', \'' + details[1] + '\').'
                        +'where(\'price\').'+conditions[0] + '(' + Number(conditions[1]) + ').'
                }
            case 'st':
                return 'where(\'specification\', new RegExp(\'' + details[0] + '\',\'i\')).where(\'type\', \'' + details[1] + '\').'
            case 'tp':
                conditions = details[1].split('-')
                if (conditions.length === 5) {
                    return 'where(\'type\', \'' + details[0] + '\').'
                        +'where(\'price\').'+conditions[2]+'([{price:{$'+conditions[0] + ':'
                        + Number(conditions[1]) + '}},{price:{$'+conditions[3]
                        + ':' + Number(conditions[4]) + '}}]).'
                } else {
                    return 'where(\'type\', \'' + details[0] + '\').'
                        +'where(\'price\').'+conditions[0] + '(' + Number(conditions[1]) + ').'
                }
            case 'sp':
                conditions = details[1].split('-')
                if (conditions.length === 5) {
                    return 'where(\'specification\', new RegExp(\'' + details[0] + '\',\'i\')).'
                        +'where(\'price\').'+conditions[2]+'([{price:{$'+conditions[0] + ':'
                        + Number(conditions[1]) + '}},{price:{$'+conditions[3]
                        + ':' + Number(conditions[4]) + '}}]).'
                } else {
                    return 'where(\'specification\', new RegExp(\'' + details[0] + '\',\'i\')).'
                        +'where(\'price\').'+conditions[0] + '(' + Number(conditions[1]) + ').'
                }
            case 's':
                return 'where(\'specification\', new RegExp(\'' + details[0] + '\',\'i\')).'
            case 't':
                return 'where(\'type\', \'' + details[0] + '\').'
            case 'p':
                conditions = details[0].split('-')
                if (conditions.length === 5) {
                    return 'where(\'price\').'+conditions[2]+'([{price:{$'+conditions[0] + ':'
                        + Number(conditions[1]) + '}},{price:{$'+conditions[3]
                        + ':' + Number(conditions[4]) + '}}]).'
                } else {
                    return 'where(\'price\').'+conditions[0] + '(' + Number(conditions[1]) + ').'
                }
            default:
                // dit zal gewoon alle specificaties terugsturen
                return ''
        }

    }

    let responseStringStart = 'Specification.find().'
    let responseStringMid = generateString()
    let responseStringEnd = 'exec().then(result=>{res.status(200).json(result)}).catch(err=>{res.status(500).json({error: err})})'

    const responseString = responseStringStart + responseStringMid + responseStringEnd
    //console.log(responseString)
    eval(responseString)
})

module.exports = router
