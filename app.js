const express = require('express')
const mongoose = require('mongoose')
const buyer = require('./routes/buyerRoute')
const seller = require('./routes/sellerRoute')
const marketPlace = require('./routes/marketPlace')
const cors = require('cors')

const PORT = process.env.PORT || 3000

mongoose.connect('mongodb://127.0.0.1:27017/Ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/buyer', buyer)
app.use('/seller', seller)
app.use('/marketPlace', marketPlace)

app.get('/', (req, res) => {
    res.send({msg:"hello how are you"})
})

app.listen(PORT, console.log('Port is up on 3000'))