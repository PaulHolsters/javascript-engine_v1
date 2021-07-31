'use strict'
const express = require('express')

const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

mongoose.connect('mongodb+srv://ph:'+ process.env.MONGO_ATLAS_PW +'@administry-1.nnow2.mongodb.net/vitaline-db?retryWrites=true&w=majority',
{
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true, //this is the code I added that solved it all: should be false in production!!
    keepAlive: true,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    useFindAndModify: false,
    useUnifiedTopology: true
}
,(err)=>{console.log(err)})

// logging middleware which will do it's thing and then forwards the request automatically to the next middleware
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const customerRoutes = require('./routes/customers')
const specificationsRoutes = require('./routes/specifications')
const productsRoutes = require('./routes/products')

app.use(((req, res, next) => {
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, PATCH, DELETE, POST, GET')
        return res.status(200).json({})
    }
    next()
}))

// setting up middlewares
app.use('/customers',customerRoutes)
app.use('/specifications',specificationsRoutes)
app.use('/products',productsRoutes)

// handle all non-defined requests
app.use((req,res,next)=>{
    const err = new Error('not found')
    err.status = 404
    next(err)
})

app.use((error, req, res, next) =>{
    res.status(error.status || 500).json({
        message: error.message
    })
})

module.exports = app

