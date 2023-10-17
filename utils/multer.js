const multer=require('multer')

const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,new Date().toISOString()+"_"+file.originalname)
    }
})

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/png' || file.mimetype==='image/jpeg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}
module.exports={
    fileFilter,fileStorage
}