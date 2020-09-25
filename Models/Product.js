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

productSchema.statics.marketPlace = async () => {
	let products = []
	const categories = ['Clothing', 'AutoMobile', 'Electronics', 'Etables', 'Sports']

	for (let i = 0; i < categories.length; i++) {
        const product = await Product.findOne({ category: categories[i] })
        
		if (product) {
            
			products.push({
                name: product.name,
                category: product.category,
                price: product.price,
                stock:product.stock,
                _id:product._id,
                productAvatar:product.productAvatar
            })
		}
	}

	return products
}

productSchema.statics.byCategory = async (category) => {
	const products = await Product.find({category},{
        discription: 0,
        specs: 0,
        owner: 0, 
    })

    if(!products.length){
        return {error:{message:'there is no product in this category'}}
    }

	return products
}


const Product = mongoose.model('Product', productSchema)
module.exports = Product
