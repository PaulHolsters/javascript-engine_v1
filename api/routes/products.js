const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Product = require('../models/Product')

router.post('/', (req, res, next) => {
    Product.find().exec().then(products => {
        const specifications = req.body.specifications
        if (!specifications || !Array.isArray(specifications) || specifications.length === 0) {
            throw new Error('list of specifications not properly formed')
        } else {
            // nakijken of lijst met de specificaties geen dubbels bevat
            const checkForDuplicates = function (spec) {
                let count = 0
                for (let j = 0; j < specifications.length; j++) {
                    if (specifications[j].toString() === spec.toString()) {
                        count++
                    }
                }
                return count >= 2
            }
            if (specifications.every(checkForDuplicates)) {
                throw new Error('duplicates inside list of specifications')
            }
            for (let i = 0; i < products.length; i++) {
                // per opgehaald product maak je een lijst met de specificaties
                // en vergelijkt deze met de ingevoerde specificaties en checkt of de nieuwe lijst in zijn geheel uniek is
                const specificationIds = []
                for (let k = 0; k < products[i].specifications.length; k++) {
                    specificationIds.push(products[i].specifications[k])
                }
                if (JSON.stringify(specificationIds).toString() === JSON.stringify(specifications).toString()) {
                    throw new Error('list of specs not unique')
                }
            }
            // alle checks zijn ok dus het product mag gesaved worden
            const product = new Product(
                {
                    _id: new mongoose.Types.ObjectId(),
                    type: req.body.type,
                    model: req.body.model,
                    specifications: req.body.specifications,
                }
            )
            product.save().then((result) => {
                res.status(201).json({
                    message: 'product created',
                    product: result
                })
            }).catch(err => {
                res.status(500).json({
                    error: 'het product is niet conform'
                })
            })
        }
    }).catch(error => {
        res.status(500).json({
            error: error.message
        })
    })
})

// deze route geeft alle producten terug terug (mét bijhorende specificaties)
router.get('/', (req, res, next) => {
    Product.find().populate('specifications').exec().then(result => {
        // het is mogelijk dat result een lege array is omdat er nog geen specificaties zijn aangemaakt
        res.status(200).json(result)
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

// zoeken op type is toegevoegd omdat dit in een dropdown gevraagd wordt en dus een standaard feature is
router.get('/type/:productType', (req, res, next) => {
    const type = req.params.productType
    Product.find().populate('specifications').where('type').equals(type).exec().then(result => {
        // het is mogelijk dat result een lege array is omdat er nog geen producten van dit type zijn aangemaakt
        res.status(200).json({
            product: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

// zoeken op model is toegevoegd omdat dit in een dropdown gevraagd wordt en dus een standaard feature is
router.get('/model/:productModel', (req, res, next) => {
    const model = req.params.productModel
    Product.find().populate('specifications').where('model').equals(model).exec().then(result => {
        // het is mogelijk dat result een lege array is omdat er nog geen producten van dit type zijn aangemaakt
        res.status(200).json({
            product: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.get('/id/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findById(id).populate('specifications').exec().then(result => {
        res.status(200).json({
            // the customer can be null if the customer was erased before
            product: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

// Je kan via deze route een bestaande klant aanpassen. Er wordt geen historiek van deze aanpassingen bijgehouden. Verander je dus iets aan een klant
// dan is dat definitief. Je kan dus achteraf bijvoorbeeld geen historiek opvragen van alle adressen waar een bepaalde klant heeft gewoond.
router.patch('/:productId', (req, res, next) => {
    // todo : ga goed na dat alle velden afzonderlijk geüpdatet kunnen worden d.w.z. ook de specificaties afzonderlijk
    // todo: ga ook na of de VEREISTEN voor een product ook bij het updaten te allen tijde GERESPECTEERD worden
    const id = req.params.productId
    Product.findByIdAndUpdate(id, req.body).exec().then(result => {
        // result bevat de oorspronkeljke versie, vóór de update
        res.status(200).json({
            // the customer can be null if the customer was erased before
            updatedProduct: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

// Klanten kunnen definitief verwijderd. Hieraan zijn geen voorwaarden gesteld. Ook als er aan deze klant (klantID) offertes of facturen verbonden zijn
// kan de klant met het klantID volledig verwijderd worden. Dit kan omdat alle klantgegevens ook steeds in het document staan van de desbtreffende
// enititeit die gebruik maakt van de klantgegevens. Je moet dus nooit een join leggen om alle relevante gegevens van bijvoorbeeld een offerte of een factuur
// terug te vinden. In al deze entiteiten bevinden zich naast de gegevens van een klant (en hetzelfde geldt voor de gegevens van een product)
// ook altijd het klantID. Als je een klant opzoekt via deze API en het klantID kunnen de gegevens dus verschillen met de gegevens voor datzelfde ID op
// de corresponderende entiteit (bv. een offerte). Toch is een klantID op een corresponderend document toch nog nuttig. Je kan bv. offertes of facturen sorteren op basis
// van klant zuiver door gebruik te maken van de ID. Vervolgens gebruik je de huidige naam van de klant zoals je deze via deze API kan terugvinden.
// Natuurlijk is het mogelijk dat de klant ondertussen verwijderd is. Bij zo'n sortering kan je dan voor deze gevallen de naam op het document (bv. offerte of factuur)
// gebruiken. Deze gevallen kunnen dan mogelijks licht afwijken van een correcte alfabetische rangschikking.
router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findByIdAndRemove(id).exec(
    ).then(
        result => {
            // result bevat de oorspronkeljke versie, vóór de update
            res.status(200).json({
                deleted: result
            })
        }
    ).catch(err => {
            res.status(500).json({
                error: err
            })
        }
    )
})

/****                           FILTEREN VAN PRODUCTEN    (op basis van type en/of model en/of basisprijs )             ******/
// todo: vervang de attribuutnaam 'model' door 'package'

router.get('/filter/:filterString', (req, res, next) => {
    // helper function
    const generateString = function () {
        const filterString = (req.params.filterString)
        const filterArray = []
        const arr1 = filterString.split('&')
        for (let i = 0; i < arr1.length; i++) {
            const arr2 = arr1[i].split(',')
            for (let j = 0; j < arr2.length; j++) {
                filterArray.push(arr2[j])
            }
        }
        // filter Array heeft elke voorwaarde behalve de clausules
        let processedString = filterString
        const filterArrayProcessed = []
        for (let i = 0; i < filterArray.length; i++) {
            filterArrayProcessed.push(filterArray[i])
            if (processedString.indexOf("&") > processedString.indexOf(",")) {
                // > betekent dat het LL bestaat én dat & eerder voorkomt dan , en dat laatste komt mogelijk helemaal niet voor
                filterArrayProcessed.push('and')
                const index = processedString.indexOf("&") + 1
                processedString = processedString.substr(index)
            } else if (processedString.indexOf(",") > processedString.indexOf("&")) {
                filterArrayProcessed.push('or')
                const index = processedString.indexOf(",") + 1
                processedString = processedString.substr(index)
            }
        }
        //todo 2: zorg er ook voor dat je conditions kan grouperen via haakjes
        const createCondition = function (subject, clause, values) {
            // returns part of the filter conditions as a string
            // values can be a string or an array
            switch (clause) {
                case 'regex':
                    return 'where(\'' + subject + '\',new RegExp(\'' + values + '\',\'i\')).'
                case 'similar':
                    // exact match
                    if (typeof values === 'number') {
                        return 'where({' + subject + ',' + values + '}).'
                    } else {
                        return 'where({' + subject + ',\'' + values + '\'}).'
                    }
                case 'and':
                    const clauseStart = 'and(['
                    const clauseEnd = ']).'
                    let clauseMid = ''
                    if (Array.isArray(values)) {
                        for (let i = 0; i < values.length; i++) {
                            // possible types: object, Number, String
                            // in this loop the objects as element in the array of the and function get created one by one
                            // todo check if ending the array with a comma is not a problem
                            let strObj = '{' + subject + ':'
                            switch (typeof values[i]) {
                                case 'object':
                                    for (let prop in values[i]) {
                                        if (values[i].hasOwnProperty(prop)) {
                                            strObj += '$' + prop + ':' + values[i][prop] + '},'
                                        }
                                    }
                                    break
                                case 'number':
                                    strObj += values[i] + '},'
                                    break
                                case 'string':
                                    strObj += '\'' + values[i] + '\'},'
                                    break
                            }
                            clauseMid += strObj
                        }
                    } else {
                        // values is a number (which means one value to exactly match the subject - use regex for a single string exact match!)
                        let strObj = '{' + subject + ':' + values + '}'
                        clauseMid += strObj
                    }
                    return clauseStart + clauseMid + clauseEnd
                case 'or':
                    // todo add or when and works properly!
                    break

            }
        }
        // format filterArrayProcessed = [[condition-string],[and/or]]
        // format condition string: subject:type:value
        // possible types: regex, similar, lte, lt, gt, gte
        // possible values: number (all types may be used), string (only similar or regex)
        // the condition-string still needs to be manipulated before createCondition can be called
        // you get the values part out of the condition-string
        // createCondition creates one condition at the time which means 1 where/and/or clause
        // and/or can have multiple values if they handle about the same subject
        // you can do this when the element +2 places is the same subject as the current subject-element
        // subject, clause, values are the parameters of the createCondition function
        // they are the same as subject:type:value for the string-condition but values can be one or multiple values
        // while value in subject:type:value is always a number or a string not a row of values
        for (let i = 0; i < filterArrayProcessed.length; i++) {

        }
    }

    let responseStringStart = 'Product.find().populate(\'specifications\').'
    let responseStringMid = generateString()
    let responseStringEnd = 'exec().then(result=>{res.status(200).json(result)}).catch(err=>{res.status(500).json({error: err})})'

    const responseString = responseStringStart + responseStringMid + responseStringEnd
    //console.log(responseString)
    eval(responseString)
})

module.exports = router
