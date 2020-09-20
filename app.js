const express = require('express')
const mongoose = require('mongoose')
const buyer = require('./routes/buyerRoute')
const seller = require('./routes/sellerRoute')
const marketPlace = require('./routes/marketPlace')
const cors = require('cors')


mongoose.connect(process.env.MONGODB_URL, {
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

app.listen(process.env.PORT, console.log('Port is up on 3000'))