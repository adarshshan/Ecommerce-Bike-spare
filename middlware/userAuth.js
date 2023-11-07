

const isuserAuth = (req, res, next) => {
    if(req.session.userlogin){
        next()
    }else{
        return res.redirect('/users/login')
    }
}

module.exports=isuserAuth;