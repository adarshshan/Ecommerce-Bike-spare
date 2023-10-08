const mongoose=require('mongoose')


const categorieSchema= new mongoose.Schema({
    name:String
})

const categorie=mongoose.model('categorie',categorieSchema)
module.exports=categorie