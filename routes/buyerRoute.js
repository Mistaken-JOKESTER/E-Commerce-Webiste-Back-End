const express = require('express')
const Buyer = require('../Models/Buyer')
const { upload, imageResize } = require('../Middleware/image')
const { authBuyer } = require('../Middleware/authetenctation')
const Product = require('../Models/Product')
const router = express.Router()

router.post('/register', upload.single('avatar'), async (req, res) => {
    try{
        const exesist = await Buyer.findOne({email: req.body.email})
        if(exesist){
            return res.status(400).send({error: 'email is invalid', message:'unsuccessful'})
        }
        if(req.body.password.length < 8){
            return res.send(400).send({error: 'password is two short', message:'unsuccessful'})
        }

        if(req.file){
            req.body.avatar = imageResize(req.file.buffer, 200, 200).toString('base64')
        }
        

        const buyer = new Buyer(req.body)
        await buyer.save()
        res.send({message: 'successful'})
    }
    catch(e) {
        console.log(e)
        res.status(500).send({message:'unsuccessful', e})
    }
})

router.post('/login', async (req, res) => {
    try{
        const buyer = await Buyer.findByCredentials(req.body.email, req.body.password)
        const token = await buyer.generateToken()
        res.send({message:'succesfull', token: token})
    } catch (e){
        console.log(e)
        res.status(500).send({message:'unsuccessful', error: e})
    }
})

router.post('/profile', authBuyer, async (req, res) => {
    try{  
        res.send({profile:req.buyer})
    } catch (e) {
        res.status(500).send({error: e})
    }
})

router.post('/update', authBuyer, upload.single('avatar'), async (req, res) => {
    try{
        if(req.file){
            req.body.avatar = imageResize(req.file.buffer, 200, 200).toString('base64')
        }
        const buyer = await req.buyer.updateBuyer(req.body)
        res.send({buyer, message:'Your Profile is updated and now you shop again'})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:e})
    }
})

router.post('/logout', authBuyer, async (req, res) => {
    try {
        req.buyer.tokens = []
        await req.buyer.save()
        res.send({message:'you are loged out see you later'})
    } catch(e){
        res.status(500).send({error:e, message:'Something went wrong'})
    }
})


router.delete('/delete', authBuyer, async (req, res) =>{
    try{
        const buyer = await req.buyer.remove()
        res.send({message: 'successful'})
    } catch(e) {
        res.status(500).send({error:e, message:'unsuccessfull'})
    }
})

router.get('/viewcart', authBuyer, async (req, res) =>{
    try{
        req.buyer.cartValue = 0
        const products = []
        for(const x in req.buyer.cart){
          let product = await Product.findById(req.buyer.cart[x].ID)
          if(product){
            product.count = req.buyer.cart[x].count
            products.push({product, count: req.buyer.cart[x].count})
            req.buyer.cartValue = req.buyer.cartValue + Number(product.price) * Number(req.buyer.cart[x].count)
          }
        }

        await req.buyer.save()

        res.send({cartCount: req.buyer.cartCount, productsData: products, cartValue : req.buyer.cartValue})
    } catch(e) {
        console.log(e)
        res.status(500).send({error:e, message:'unsuccessfull'})
    }
})

router.post('/addToCart',authBuyer, async (req, res) =>{
    try{
        console.log(req.body.product.ID)
        const productIndex = req.buyer.cart.findIndex((product) => {return product.ID == req.body.product.ID})
        console.log(productIndex)
        if(productIndex != -1){
            req.buyer.cart[productIndex].count = Number(req.buyer.cart[productIndex].count) + Number(req.body.product.count)
        } else {
            req.buyer.cart.push(req.body.product)
            req.buyer.cartCount = Number(req.buyer.cartCount) + 1
        }

        await req.buyer.save()
        res.send({message:'successful'})
    } catch (e) {
        console.log(e)
        res.status(500).send({error:e, message:'unsuccessful'})
    }
})

router.post('/removeFromCart', authBuyer, async (req, res) => {
    try{
        const cartCount = req.buyer.cartCount - 1
        const { price } = Product.findById(req.body.product.ID)
        await Buyer.updateOne(
            {
                _id:req.id
            },{   
                $pull: {cart: {ID : req.body.product.ID}},
                $set: {cartCount: cartCount}
            })
        
        res.send({message:'successful'})
    } catch (e){
        res.status(500).send({error:e})
    }
})
router.get('/emptyCart', authBuyer, async (req,res) =>{
    try{
        req.buyer.cart = []
        req.buyer.cartCount = 0
        req.buyer.cartValue = 0
        await req.buyer.save()
        res.send({message:'successful'})
    } catch(e) {
        res.status(500).send({error:e})
    }
})

router.get('/checkout', authBuyer, async (req, res) => {
    try{
        const cartValue = req.buyer.cartValue
        req.buyer.cart = []
        req.buyer.cartCount = 0
        req.buyer.cartValue = 0
        await req.buyer.save()
        res.send({
            cartValue, 
            message:`your Products will be delivered at ${req.buyer.address} ${req.buyer.city}`
        })
    } catch(e) {
        res.status(500).send({error: e, message:'something went wrong'})
    }
})

router.post('/directbuy', authBuyer, async (req, res) => {
    try{
        res.send({message:`Your ${req.body.product.name} will be delivered at ${req.buyer.address} ${req.buyer.city}`})
    } catch(e) {
        res.status(500).send({message:'something went wrong Please try again'})
    }
})


module.exports = router