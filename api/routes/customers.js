const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Customer = require('../models/Customer')

router.post('/', (req, res, next) => {
    // Er wordt niet gecontroleerd of alle velden correct zijn ingevuld, dat wordt afgecheckt in de frontend
    const customer = new Customer({
        _id: new mongoose.Types.ObjectId(),
        // identity
        companyName: req.body.companyName,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        // address
        street: req.body.street,
        houseNumber: req.body.houseNumber,
        boxNumber: req.body.boxNumber,
        postalCode: req.body.postalCode,
        city: req.body.city,
        country: req.body.country,
        // contact
        cellPhoneNumber: req.body.cellPhoneNumber,
        phone: req.body.phone,
        email: req.body.email,
        // financial
        VAT_percentage: req.body.VAT_percentage,
        VAT_number: req.body.VAT_number
    })
    customer.save().then(result => {
        res.status(201).json({
            message: 'customer created',
            customer: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.get('/', (req, res, next) => {
    Customer.find().exec().then(result => {
        // het is mogelijk dat result een lege array is omdat er nog geen klanten zijn aangemaakt
        res.status(200).json(result)
    }).catch(err => {
        res.status(500).json({
            error:err
        })
    })
})

router.get('/:customerId', (req, res, next) => {
    const id = req.params.customerId
    Customer.findById(id).exec().then(result => {
        res.status(200).json({
            // the customer can be null if the customer was erased before
            customer: result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

// Je kan via deze route een bestaande klant aanpassen. Er wordt geen historiek van deze aanpassingen bijgehouden. Verander je dus iets aan een klant
// dan is dat definitief. Je kan dus achteraf bijvoorbeeld geen historiek opvragen van alle adressen waar een bepaalde klant heeft gewoond.
router.patch('/:customerId', (req, res, next) => {
    const id = req.params.customerId
    Customer.findByIdAndUpdate(id,req.body).exec().then(result=>{
        // result bevat de oorspronkeljke versie, vóór de update
        res.status(200).json({
            // the customer can be null if the customer was erased before
            updatedCustomer: result
        })
    }).catch(err=>{
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
router.delete('/:customerId', (req, res, next) => {
    const id = req.params.customerId
    Customer.findByIdAndRemove(id).exec(

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

module.exports = router
