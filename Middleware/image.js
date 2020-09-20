const multer = require('multer')
const sharp  = require('sharp')
const path = require('path')

const upload  = multer({
    // storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb, req)
    }
}).single('imagePic') //this is name attribute of input in from where file is uploaded


function checkFileType(file, cb, req){
    // allowed exte
    const fileTypes = /image|jpeg|jpg|png|gif/
    //check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())

    //check mine type
    const mimeType = fileTypes.test(file.mimetype)

    if(mimeType && extname){
        return cb(null, true)
    } else {
        req.errorMessage = 'Please provide jpeg/jpg/png type image of less than 1MB'
        return cb(null, true)
    }
}

const imageResize = async function(dataBuffer, xSize, ySize){
    const image = await sharp(dataBuffer).resize(xSize, ySize).png()
    return image
}

module.exports = { upload, imageResize }