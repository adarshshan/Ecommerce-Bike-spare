const multer=require('multer')

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

module.exports=upload