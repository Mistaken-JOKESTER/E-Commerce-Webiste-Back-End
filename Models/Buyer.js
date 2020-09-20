const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Timestamp, ObjectId } = require('mongodb')

const buyerSchema = new mongoose.Schema({
    firstName:{
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'What is you first name']
        // validate(value){
        //     if(!validator.isAlphanumeric(value)){
        //         throw new Error('Name should only contain Alphabets')
        //     }
        // }
    },
    secondName:{
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'We also need second name']
        // validate(value){
        //     if(!validator.isAlphanumeric(value)){
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
    },
    phNumber:{
        type: String,
        minlength:[10, 'phone number is two short'],
        maxlength:[10, 'phone number is too large'],
        required:true,
        trim:true,
        validate(value){
                 if(!validator.isNumeric(value)){
                     throw new Error('Phone no should only contain numbers')
                 }
             }
    },
    address:{
        type:String,
        trim: true,
        lowercase: true,
        required: [true, 'Where we will deliver your product']
    },
    city:{
        type: String,
        required:[true, 'Please provide the name city']
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
    },
    cart:[{
        ID: {type: String},
        count:{type:Number, default: 1}
    }],
    cartCount:{
        type:Number,
        default: 0
    },
    cartValue:{
        type: Number,
        default:0
    }
}, {
    Timestamp: true
})

buyerSchema.pre('save', async function(next){
    const buyer = this

    if(buyer.isModified('password'))
        buyer.password = await bcrypt.hash(buyer.password, 10)

    next()
})

buyerSchema.methods.updateBuyer = async function(body){
    const validUpdates = ['firstName', 'secondName', 'email','phNumber','address','city','state','password','avatar']
    const updates = Object.keys(body)
    const updatePossible = updates.every(update => validUpdates.includes(update))

    if(!updatePossible){
        throw new Error('Please enter valid informtion to update')
    }

    const buyer = this 
    updates.forEach(update => buyer[update] = body[update])
    await buyer.save()
    return buyer
}

buyerSchema.statics.findByCredentials= async (email, password) => {
    const buyer = await Buyer.findOne({email})

    if(!buyer){
        throw new Error()
    }
    const compare = await bcrypt.compare(password, buyer.password)
    if(!compare){
        throw new Error()
    }

    return buyer
}

buyerSchema.methods.generateToken = async function() {
    const buyer = this
    const token = jwt.sign({ id: buyer._id.toString() }, process.env.JWT_SECRETE)
    buyer.tokens.push(token.toString())

    await buyer.save()
    return token
}

const Buyer = mongoose.model('Buyer', buyerSchema)
module.exports = Buyer