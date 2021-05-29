const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

//get the user model

const User = require('../models/user')


module.exports = function(passport) {
    passport.use(new LocalStrategy({usernameField: 'email'},
        async (email, password, done) => {
        try{
            const user = await User.findOne({ email })
            if (!user) { 
              return done(null, false, { message: 'Email address is not registered'}); 
            }
            if (user.isActive == 0){
              return done(null, false, { message: 'Please activate your account to login'}); 
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) { return done(null, false, { message: `Incorrect password. If you do not remember your password, please contact support to reset and login.` }); }
            return done(null, user);
        }
        catch(err){
            return done(err)
        }
            
    }));

    passport.serializeUser(function(user, done) {
        done(null, {id:user.id, agent:user.restaurant_agent, role:user.role});
      });
      
      passport.deserializeUser(function({id}, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}
