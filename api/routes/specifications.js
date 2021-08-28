const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')


const Specification = require('../models/Specification')

router.post('/', (req, res, next) => {
    const specification = new Specification(
        {
            _id: new mongoose.Types.ObjectId(),
            specification: req.body.specification,
            type: req.body.type,
            price: req.body.price
        }
    )
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
            if(spec.price === undefined){
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
    Specification.findById(id).exec().then(result => {
        res.status(200).json({
            // the customer can be null if the customer was erased before
            specification: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

// Je kan via deze route een bestaande klant aanpassen. Er wordt geen historiek van deze aanpassingen bijgehouden. Verander je dus iets aan een klant
// dan is dat definitief. Je kan dus achteraf bijvoorbeeld geen historiek opvragen van alle adressen waar een bepaalde klant heeft gewoond.
router.patch('/:specificationId', (req, res, next) => {
    const id = req.params.specificationId
    Specification.findByIdAndUpdate(id, req.body).exec().then(result => {
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

// Klanten kunnen definitief verwijderd. Hieraan zijn geen voorwaarden gesteld. Ook als er aan deze klant (klantID) offertes of facturen verbonden zijn
// kan de klant met het klantID volledig verwijderd worden. Dit kan omdat alle klantgegevens ook steeds in het document staan van de desbtreffende
// enititeit die gebruik maakt van de klantgegevens. Je moet dus nooit een join leggen om alle relevante gegevens van bijvoorbeeld een offerte of een factuur
// terug te vinden. In al deze entiteiten bevinden zich naast de gegevens van een klant (en hetzelfde geldt voor de gegevens van een product)
// ook altijd het klantID. Als je een klant opzoekt via deze API en het klantID kunnen de gegevens dus verschillen met de gegevens voor datzelfde ID op
// de corresponderende entiteit (bv. een offerte). Toch is een klantID op een corresponderend document toch nog nuttig. Je kan bv. offertes of facturen sorteren op basis
// van klant zuiver door gebruik te maken van de ID. Vervolgens gebruik je de huidige naam van de klant zoals je deze via deze API kan terugvinden.
// Natuurlijk is het mogelijk dat de klant ondertussen verwijderd is. Bij zo'n sortering kan je dan voor deze gevallen de naam op het document (bv. offerte of factuur)
// gebruiken. Deze gevallen kunnen dan mogelijks licht afwijken van een correcte alfabetische rangschikking.
router.delete('/:specificationId', (req, res, next) => {
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
    console.log(responseString)
    eval(responseString)
})

module.exports = router
