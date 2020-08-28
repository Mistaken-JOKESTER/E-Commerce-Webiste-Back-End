const multer = require('multer')
const sharp  = require('sharp')

const upload  = multer({
    // storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        if(file){
            return req.file = null
        }
        checkFileType(file, cb)
    }
}) //.single('avatar') //this is name attribute of input in from where file is uploaded


function checkFileType(file, cb){
    // allowed exte
    const fileTypes = /image|jpeg|jpg|png|gif/
    //check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())

    //check mine type
    const mimeType = fileTypes.test(file.mimetype)

    if(mimeType && extname){
        return cb(null, true)
    } else {
        return cb('Error: images only')
    }
}

const imageResize = async function(dataBuffer, xSize, ySize){
    const image = await sharp(dataBuffer).resize(xSize, ySize).toBuffer().png()
    return image
}

module.exports = { upload, imageResize }