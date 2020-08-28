const express = require('express')
const Product = require('../Models/Product')

const router = express.Router()

router.get('/', async (req, res) => {
    try{
        const products = await Product.marketPlace()
        res.send({productData:products, message:'For more poducts search by category'})
    } catch(e) {
        console.log(e)
        res.status(500).send({error: e, message:'Something Went wrong or there is no product to buy'})
    }
})

router.post('/bycategory', async (req, res) => {
    try{
        const products = await  Product.find({category: req.query.category})
        res.send(products)
    } catch(e){
        console.log(e)
        res.status(500).send({error:e, message:'Something went worng or this is no product in this category'})
    }
})

router.post('/product', async (req, res)=> {
    try{
        const product = await Product.findById(req.query.productID)
        res.send(product)
    } catch(e) {
        res.status(500).send({error:e, message:'Something went worng'})
    }
})

router.post('/product/directBuy', async (req, res) => {
    try{    
        const product = await Product.findById(req.query.productID)
        res.send({message: `your ${product.name} will be dilvered at ${req.body.address}, ${req.body.city} and you have to pay ${product.price} rupees`})
    } catch(e) {
        res.status(500).send({error: e, message: 'something went wrong try agian'})
    }
})
//'Clothing', 'AutoMobile', 'Electronics', 'Etables', 'Sports', 'Musical Instruments'

module.exports = router