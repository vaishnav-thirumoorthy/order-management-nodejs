const User = require('../models/user')

const InitializeAdmin = async () => {
    let admin = await User.find({email: 'admin@localhost'})
    
    if (admin.length == 0) {
        admin = new User({
            name: 'Super Admin',
            email: 'admin@localhost',
            password : 'admin',
            restaurant_agent: true,
            role: 2,
            isActive: 1,
            role_name: 'Administrator'
        })
        return await admin.save()
    }
    else {
        return
    }
}

const InitializeWalkInCustomer = async() => {
    let user = await User.find({source: 0})
    if (user.length == 0) {
        user = new User({
            name: 'Walk In Customer',
            email: 'walkincustomer@localhost',
            password : 'customer',
            source: 0,
            isActive: 1
        })
        return await user.save()
    }
    else {
        return
    }

}

module.exports = {InitializeAdmin, InitializeWalkInCustomer}