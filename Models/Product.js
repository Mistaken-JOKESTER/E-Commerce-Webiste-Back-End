const mongoose = require('mongoose')
const vlaidator  = require('validator')
const { ObjectId } = require('mongodb')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    price: {
        type: Number,
        trim: true,
        required: true
    },
    category: {
        type:String, 
        required: true,
        enum:['Clothing', 'AutoMobile', 'Electronics', 'Etables', 'Sports']
    },
    stock: {
        type: Number,
        trim: true,
        required: true
    },
    discription: {
        type: String,
        trim: true,
        lowercase:true,
        required: true
    },
    specs:[{
        type: Map,
        of: String
    }],
    productAvatar: {
        type:String,
        //required:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Seller'
    }

})

productSchema.methods.updateProduct = async function(body){
    const validUpdates = ['name', 'price', 'stock', 'discription', 'specs', 'image']
    const updates = Object.keys(body)
    const updatePossible = updates.every(update => validUpdates.includes(update))

    if(!updatePossible){
        throw new Error('Please enter valid informtion to update')
    }

    let product = this 
    updates.forEach(update => product[update] = body[update])
    await product.save()
    return product
}

productSchema.statics.marketPlace = () => {
    let products = []
    const categories = ['Clothing', 'AutoMobile', 'Electronics', 'Etables', 'Sports']
        
        categories.forEach( async category => {
            let product = await Product.findOne({category})
            if(product){
                console.log(product.name)
                products.push({product})
            } 
        })
    
    return products
}


const Product = mongoose.model('Product', productSchema)
module.exports = Product
