const express = require('express')
const Seller = require('../Models/Seller')
const { authSeller } = require('../Middleware/authetenctation')
const { upload, imageResize } = require('../Middleware/image')
const Product = require('../Models/Product')

const router = express.Router()

router.post('/register', upload.single('avatar'), async (req, res) => {
    try{
        const exesist = await Seller.findOne({email: req.body.email})
        if(exesist){
            return res.status(400).send({error: 'email is invalid', message:'unsuccessful'})
        }
        if(req.body.password.length < 8){
            return res.send(400).send({error: 'password is two short', message:'unsuccessful'})
        }

        if(req.file){
            req.body.avatar = imageResize(req.file.buffer, 200, 200).toString('base64')
        }

        const seller = new Seller(req.body)
        await seller.save()
        res.send({message: 'successful'})
    }
    catch(e) {
        console.log(e)
        res.status(500).send({message:'unsuccessful', e})
    }
})

router.post('/login', async (req, res) => {
    try{
        const seller = await Seller.findByCredentials(req.body.email, req.body.password)
        const token = await seller.generateToken()
        res.send({message:'succesfull', token: token})
    } catch (e){
        console.log(e)
        res.status(500).send({message:'unsuccessful', error: e})
    }
})

router.post('/profile', authSeller, async (req, res) => {
    try{
        res.send({profile: req.seller})

    } catch (e) {
        res.status(500).send({error: e, message:'Something Wrong has happened'})
    }
})

router.post('/update', authSeller, upload.single('avatar'),  async (req, res) => {
    try{
        if(req.file){
            req.body.avatar = imageResize(req.file.buffer, 200, 200).toString('base64')
        }

        const seller= await req.seller.updateSeller(req.body)
        res.send({message:'Your Profile is updated', seller})
    } catch(e) {
        res.status(500).send({error:e})
    }
})

router.post('/logout', authSeller, async (req, res) => {
    try {
        req.seller.tokens = []
        await req.seller.save()
        res.send({message:'You are logged out succesfully'})
    } catch(e){
        res.status(500).send({error: e, message:'Something wrong has happened please try again later'})
    }
})


router.delete('/delete', authSeller, async (req, res) =>{
    try{
        const seller = await req.seller.remove()
        res.send({message: 'successful'})
    } catch(e) {
        res.status(500).send({error:e, message:'unsuccessfull'})
    }
})

router.post('/viewProducts', authSeller, async (req, res) => {
    try{
        await req.seller.populate('products').execPopulate()
        console.log(req.seller.products)
        res.send({products: req.seller.products})
    } catch(e) {
        res.status(500).send({error:e, message:'unsuccessfull'})
    }
})

router.post('/viewProduct', authSeller, async (req, res) => {
    try{
        const product = await Product.findById(req.query.productID)
        res.send({product})
    } catch(e) {
        res.send({message:'something went Wrong', error: e})
    }
})

router.post('/updateProduct', authSeller, async (req, res) => {
    try{
        let product = await Product.findById(req.query.productID)
        product = await product.updateProduct(req.body)
        res.send({product, message:'Product has been updated succesfully'})
    } catch(e) {
        console.log(e)
        res.send({message:'something went Wrong', error: e})
    }
})

router.post('/addProduct', authSeller, upload.single('productAvatar'), async (req, res) => {
    try{
        req.body.product.owner = req.seller._id
        if(req.file){
            req.body.product.productAvatar = imageResize(req.file.buffer, 400, 400).toString('base64')
        }
        
        const product = new Product(req.body.product)
        await product.save()
        req.seller = await req.seller.toJson()
        res.send({product, seller: req.seller})
    }catch(e){
        res.status(500).send({error: e, message:'Something went wrong please try again'})
    }
})

router.post('/removeProduct', authSeller, async (req, res) => {
    try{
        const product = await Product.deleteOne({_id: req.query.productID})
        res.send({ message:'product is removed from marketplace'})
    } catch(e) {
        console.log(e)
        res.status(500).send({error: e, message:'Something went wrong please try again'})
    }
})

module.exports = router