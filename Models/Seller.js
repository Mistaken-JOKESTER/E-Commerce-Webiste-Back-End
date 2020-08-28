const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Product = require('./Product')
const { Timestamp } = require('mongodb')

const sellerSchema = new mongoose.Schema({
    firstName:{
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        // validate(value){
        //     if(!validator.isAplha(value)){
        //         throw new Error('Name should only contain Alphabets')
        //     }
        // }
    },
    secondName:{
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        // validate(value){
        //     if(!validator.isAplha(value)){
        //         throw new Error('Name should only contain Alphabets')
        //     }
        // }
    },
    shopName:{
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        // validate(value){
        //     if(!validator.isAplha(value)){
        //         throw new Error('Name should only contain Alphabets')
        //     }
        // }
    },
    email:{
        type: String,
        trim: true,
        unique: true,
        lowercase:true,
        required: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Please enter a valid Email')
            }
        }
    },
    phNumber:{
        type: Number,
        minlength:10,
        maxlength:10,
        required:true,
        trim:true
    },
    shopAddress:{
        type:String,
        trim: true,
        lowercase: true,
        required: true
    },
    city:{
        type: String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        trim: true,
        minlength: 7
    },
    tokens:[String],
    avatar:{
        type:String
    }
}, {
    Timestamp: true
})

sellerSchema.virtual('products', {
    ref:'Product',
    localField:'_id',
    foreignField:'owner'
})

sellerSchema.pre('save', async function(next){
    const seller = this
    if(seller.isModified('password'))
        seller.password = await bcrypt.hash(seller.password, 10)
    
    next()
})

sellerSchema.pre('remove', async (next) => {
    const seller = this
    await Product.deleteMany({owner: seller._id})
    next()
})

sellerSchema.methods.updateSeller = async function(body){
    const validUpdates = ['firstName', 'secondName', 'shopName', 'email','phNumber','shopAddress','city','state','password','avatar']
    const updates = Object.keys(body)
    const updatePossible = updates.every(update => validUpdates.includes(update))

    if(!updatePossible){
        throw new Error('Please enter valid informtion to update')
    }

    const seller = this 
    updates.forEach(update => seller[update] = body[update])
    await seller.save()
    return seller
}

sellerSchema.statics.findByCredentials= async (email, password) => {
    const seller = await Seller.findOne({email})

    if(!seller){
        throw new Error('Unable to login')
    }
    const compare = await bcrypt.compare(password, seller.password)
    if(!compare){
        throw new Error('Unable to login')
    }

    return seller
}

sellerSchema.methods.generateToken = async function() {
    const seller = this
    const token = jwt.sign({ id: seller._id.toString() }, 'Secrete is here', { expiresIn: '3h'})
    seller.tokens.push(token.toString())

    await seller.save()
    return token
}

sellerSchema.methods.toJson = function(){
    const seller = this
    delete seller.token
    delete seller.password
    return seller
}

const Seller = mongoose.model('Seller', sellerSchema)
module.exports = Seller