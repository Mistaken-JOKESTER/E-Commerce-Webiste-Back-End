const jwt = require('jsonwebtoken')
const Buyer = require('../Models/Buyer')
const Seller = require('../Models/Seller')

const authBuyer = async (req, res, next) =>{
    try {
        const token = req.headers['auth']
        const decode = jwt.verify(token, process.env.JWT_SECRETE)
        const buyer = await Buyer.findOne({_id:decode.id})

        if(!buyer){
            console.log("buyer not found")
            return res.send({error:'error'})
        }

        const tokenExesist = buyer.tokens.includes(token);

        if(!tokenExesist){
            console.log('token not found')
            return res.send({error:'error'})
        }
        req.token = token
        req.buyer = buyer
        req.id = decode.id
        next()
    } catch (e){
        console.log(e)
        res.status(500).send({error:'Please login again', message:'unsuccessful'})
    }
        
}

const authSeller = async (req, res, next) =>{
    try {
        const token = req.headers['auth']
        const decode = jwt.verify(token, process.env.JWT_SECRETE)
        const seller = await Seller.findById(decode.id)

        if(!seller){
            console.log("seller not found")
            return res.send({error:'error'})
        }

        const tokenExesist = seller.tokens.includes(token.toString());

        if(!tokenExesist){  
            console.log('token not found')
            return res.send({error:'error'})
        }

        req.seller = seller
        req.seller.tokens=token
        req.id = decode.id
        next()
    } catch (e){
        console.log(e)
        res.send({error:'Please login again', message:'unsuccessful'})
    }
        
}

module.exports = { authBuyer, authSeller}