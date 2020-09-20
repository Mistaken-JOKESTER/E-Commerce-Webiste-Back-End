const express = require('express')
const Buyer = require('../Models/Buyer')
const { upload, imageResize } = require('../Middleware/image')
const { authBuyer } = require('../Middleware/authetenctation')
const Product = require('../Models/Product')
const router = express.Router()
const validator = require('validator')

router.post('/register', upload,  async (req, res) => {
    try{
        const obj = JSON.parse(JSON.stringify(req.body)); 
        console.log(obj)

        if(!validator.isEmail(obj.email)){
            return res.send({error: {message:'email is invalid'} })
        }

        const exesist = await Buyer.findOne({email: obj.email})

        if(exesist){
            return res.send({error: {message:'email is invalid'} })
        }
        if(req.body.password.length < 8){
            return res.send({error: {message:'password must have atleast 8 letters'}})
        }
        if(req.errorMessage){
            return res.send({error:{message: req.errorMessage}})
        }

        obj.avatar = req.file.buffer.toString('base64')
        
        const buyer = new Buyer(obj)
        await buyer.save()
        const name = obj.firstName + ' ' + obj.secondName
        res.send({name})
    }
    catch(e) {
        console.log(e)
        res.send({message:'unsuccessful', error: e})
    }
})

router.post('/login', async (req, res) => {
    try{
        const buyer = await Buyer.findByCredentials(req.body.email, req.body.password)
        const token = await buyer.generateToken()
        res.send({token: token})
    } catch (e){
        res.send({error: 'Please check email and passowrd'})
    }
})

router.get('/welcome',authBuyer, (req, res) => {
    try{

        const name = req.buyer.firstName + ' ' + req.buyer.secondName
        res.send({name, avatar: req.buyer.avatar, cartCount: req.buyer.cartCount})
    } catch(e){
        res.send({error: "error"})
    }
})

router.get('/profile', authBuyer, async (req, res) => {
    try{  
        const buyer = await Buyer.findById(req.id, {_id:0, tokens:0, state:0, password: 0, cart: 0})
        res.send(buyer)
    } catch (e) {
        res.send({error: {message:'somthing Wrong happend please refresh or login again'}})
    }
})

router.post('/update', authBuyer, upload, async (req, res) => {
    try{
        const obj = JSON.parse(JSON.stringify(req.body))

        if(req.errorMessage){
            return res.send({error:{message: req.errorMessage}})
        }
        if(req.file){
            obj.avatar = req.file.buffer.toString('base64')
        }
        
        const buyer = await req.buyer.updateBuyer(obj)
        res.send({message:'Your Profile is updated and now you shop again'})
    } catch(e) {
        console.log('error occured')
        console.log(e)
        res.send({error:{message: "please check information you filled or refresh and try again"}})
    }
})

router.post('/logout', authBuyer, async (req, res) => {
    try {
        req.buyer.tokens = []
        await req.buyer.save()
        res.send({message:'you are loged out see you later'})
    } catch(e){
        res.send({error:{message:'Something went wrong refresh and try agian'}})
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
          let product = await Product.findById(req.buyer.cart[x].ID, {
            owner: 0,
            discription: 0,
            stock: 0,
            specs: 0
          })
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
        console.log(req.body)
        const productIndex = req.buyer.cart.findIndex((product) => {return product.ID == req.body.product.ID})
        console.log(productIndex)
        if(productIndex != -1){
            req.buyer.cart[productIndex].count = Number(req.buyer.cart[productIndex].count) + req.body.product.count
        } else {
            req.buyer.cart.push(req.body.product)
            req.buyer.cartCount = Number(req.buyer.cartCount) + 1
        }

        await req.buyer.save()
        res.send({message:'successful', cartCount:req.buyer.cartCount})
    } catch (e) {
        console.log(e)
        res.send({error:{ message:'Unable to add to Cart Try agian'}})
    }
})

router.post('/removeFromCart', authBuyer, async (req, res) => {
    try{
        const cartCount = req.buyer.cartCount - 1
        const { price } = Product.findById(req.body.productID)
        const buyer = await Buyer.updateOne(
            {
                _id:req.id
            },{   
                $pull: {cart: {ID : req.body.productID}},
                $set: {cartCount: cartCount}
            })
        
        res.send({message:'successful', cartCount})
    } catch (e){
        res.send({error:{message:'Something wrong happend refresh the page'}})
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
        res.send({error:{meassage:e}})
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
            message:`your Products will be delivered at ${req.buyer.address} ${req.buyer.city} and will coast you $${cartValue}`
        })
    } catch(e) {
        res.status(500).send({error: e, message:'something went wrong'})
    }
})

router.post('/directbuy', authBuyer, async (req, res) => {
    try{
        const product = await Product.findById(req.body.product.ID)
        console.log(product.price, req.body)
        const price = product.price * req.body.product.count
        console.log(price)
        res.send({message:`Your ${product.name} will be delivered at ${req.buyer.address} ${req.buyer.city} and you have to pay $${price.toString()}`})
    } catch(e) {
        console.log(e)
        res.send({error:{message:'something went wrong Please try again'}})
    }
})


module.exports = router