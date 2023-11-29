const express = require('express')
const router = express.Router()

router.get('/',async (req,res)=>{
    try {
        res.render('admin/dashboard.ejs',{title:'Dashboard'});
    } catch (error) {
        console.log(error)
    }
})

module.exports=router;