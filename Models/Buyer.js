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
        required: true
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
        required: true
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
    address:{
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
        type:Buffer
    },
    cart:[{
        productId: ObjectId,
        productCount: {type: Number, default: 1}
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

buyerSchema.methods.updateBuyer = function(body){
    const validUpdates = ['firstName', 'secondName', 'email','phNumber','address','city','state','password','avatar']
    const updates = Object.keys(body)
    const updatePossible = updates.every(update => validUpdates.includes(update))

    if(!updatePossible){
        throw new Error('Please enter valid informtion to update')
    }

    const buyer = this 
    updates.forEach(update => buyer[update] = body[update])
    buyer.save()
    return buyer
}

buyerSchema.statics.findByCredentials= async (email, password) => {
    const buyer = await Buyer.findOne({email})

    if(!buyer){
        throw new Error('Unable to login')
    }
    const compare = await bcrypt.compare(password, buyer.password)
    if(!compare){
        throw new Error('Unable to login')
    }

    return buyer
}

buyerSchema.methods.generateToken = async function() {
    const buyer = this
    const token = jwt.sign({ id: buyer._id.toString() }, 'Secrete is here')
    buyer.tokens.push(token.toString())

    await buyer.save()
    return token
}

const Buyer = mongoose.model('Buyer', buyerSchema)
module.exports = Buyer