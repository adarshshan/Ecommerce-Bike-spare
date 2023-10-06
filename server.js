const express = require('express');
const app = express();
const port = 3000

app.get('/home',(req,res)=>{
    res.send('hello how are you? ')
})

app.listen(port,()=>console.log('server is running on port 3000'));
