const express = require('express')
const router = express.Router()

router.post('/',(req,res,next)=>{

    res.status(201).json({
        message: 'POST a verkooptransactie'
    })
})

module.exports = router

