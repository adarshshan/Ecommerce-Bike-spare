const express = require('express')
const router = express.Router()
const multer = require('multer')
const controller = require('../../controller/productController')
const adminAuth = require('../../middlware/adminAuth')

// let storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
//     }
// })

// let upload = multer({
//     storage: storage,
// }).single('image')

// router.use(multer({destination:'./uploads/',storage: storage}).array('image',12));
let storrage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads')
    },
    filename:function (req,file,cb){
        cb(null,file.fieldname + "_" + Date.now()+"_"+file.originalname)
    }
})

let upload=multer({
    storage:storrage,
}).array('image',12)

// router.use(adminAuth)

router.get(`/`, controller.productHome)

router.post(`/`,upload, controller.addProduct)

router.get('/add', controller.addProdutPage)

router.get('/delete/:id', controller.deleteProduct)

router.get('/update/:id', controller.updateProductpage)

router.post('/update/:id', controller.updateProduct)

module.exports = router;