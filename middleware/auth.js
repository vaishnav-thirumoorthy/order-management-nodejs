const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        if (req.user.restaurant_agent == false ) return res.redirect('/orders/new')
        else return res.redirect('/a/dashboard')
    }
    else return next()
}

const isAuth = (req, res, next) => {
    if(req.isAuthenticated()) return next()

    req.flash('error_msg', 'You have to be logged in to view the page')
    res.redirect('/users/login')
    
}

const isAdmin = (req, res, next) => {
    if(req.user.role == 2) return next ()
    else {
        req.flash('error_msg', 'You are not allowed to view this page')
        res.redirect('/a/dashboard')
    }
}

const isAgent = (req,res,next) => {
    if (req.user.restaurant_agent == true) return next ()
    else {
        res.redirect('/orders/new')
    }
}

module.exports = {isAuth, isLoggedIn, isAgent, isAdmin}