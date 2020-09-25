const express = require('express')
const Product = require('../Models/Product')

const router = express.Router()

router.get('/', async (req, res) => {
    try{
        const products = await Product.marketPlace()
        res.send({productData:products, message:'For more poducts search by category'})
    } catch(e) {
        
        res.status(500).send({error: e, message:'Something Went wrong or there is no product to buy'})
    }
})

router.post('/bycategory', async (req, res) => {
    try{
        const products = await Product.byCategory(req.query.category)
        res.send({productData:products})
    } catch(e){
        
        res.send({error:e, message:'Something went worng or this is no product in this category'})
    }
})

router.get('/product', async (req, res)=> {
    try{
        const product = await Product.findById(req.query.productID, {owner: 0})
        if(!product){
            throw new Error({error: { message: 'May be product is removed from market' }})
        }
        res.send(product)
    } catch(e) {
        res.send({error: { message: 'Market Place is under construction' }})
    }
})

router.post('/product/directbuy', async (req, res) => {
    try{    
        const product = await Product.findById(req.body.product.ID)
        const price =  product.price * req.body.product.count
        res.send({message: `your ${product.name} will be dilvered at ${req.body.address} and you have to pay $${price} rupees`})
    } catch(e) {
        res.status(500).send({error: e, message: 'something went wrong try agian'})
    }
})
//'Clothing', 'AutoMobile', 'Electronics', 'Etables', 'Sports'

module.exports = router