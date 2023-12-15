const mongoose=require('mongoose')

module.exports.dbconnect=()=>{
    mongoose.connect(process.env.MONGO, {
        serverSelectionTimeoutMS: 30000}) 
.then(()=>{ 
    console.log('Mongodb is connected...')
})
.catch((err)=>{
    console.log(`err is ${err}`);
    console.log("Failed to connect with mongodb...")  
})
}