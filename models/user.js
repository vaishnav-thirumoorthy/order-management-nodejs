const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const {
    validate
} = require('./cart')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    source: {
        type: Number,
        default: 1
    },
    password: {
        type: String,
        trim: true,
    },
    restaurant_agent: {
        type: Boolean,
        default: false
    },
    role: {
        type: Number,
        required: true,
        default: 1,
        validate(value) {
            if (value < 1 || value > 3) {
                throw new Error('Invalid role id')
            }
        }
    },
    role_name: {
        type: String,
        required: true,
        default: 'Customer'
    },
    isActive: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    },
    token_expires: {
        type: Number
    },
    pwd_token: {
        type: String
    },
    pwd_token_expires: {
        type: Number
    },
    created_at: {
        type: Date,
        default: Date.now
    }

})

userSchema.virtual('cart', {
    ref: 'Cart',
    localField: '_id',
    foreignField: 'user_id'
})

userSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user_id'
})


userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.restaurant_agent
    delete userObject.token
    delete userObject.token_expires
    delete userObject.pwd_token
    delete userObject.pwd_token_expires
    delete userObject.source
    delete userObject.__v

    return userObject
}


userSchema.pre('save', async function (next) {
    const user = this
    if (this.email == 'admin@localhost' || this.email == 'walkincustomer@localhost') {
        const crypted_password = await bcrypt.hash(user.password, 8)
        user.password = crypted_password
        next()
    }

    const isExists = await User.find({
        email: this.email
    })

    if (isExists.length == 0) return next()

    try {
        const crypted_password = await bcrypt.hash(user.password, 8)
        user.password = crypted_password
        next()
    } catch (error) {
        next(error)
    }

})


const User = mongoose.model('User', userSchema)

module.exports = User