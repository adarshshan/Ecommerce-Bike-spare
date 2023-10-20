

const isadminAuth = (req, res, next) => {
    try {
        if (req.session.login) {
            next()
        } else {
            return res.redirect('/admin/login')
        }
    } catch (error) {
        console.log('Error is at isadminAuth '+error)
    }
    
}

module.exports = isadminAuth;