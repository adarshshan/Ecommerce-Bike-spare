

const isadminAuth = (req, res, next) => {
    if (req.session.login) {
        next()
    } else {
        return res.redirect('/admin/login')
    }
}

module.exports = isadminAuth;