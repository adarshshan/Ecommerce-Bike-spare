const mongoose=require('mongoose')


const categorieSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    created_at:{
        type:Date,
        default:Date.now
    },
    modified_at:{
        type:Date

    }
})

const categorie=mongoose.model('categorie',categorieSchema)
module.exports=categorie