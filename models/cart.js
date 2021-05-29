const mongoose = require('mongoose')
var Float = require('mongoose-float').loadType(mongoose);

const cartSchema = new mongoose.Schema({
    items: [{
        item_id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu Item',
            },
        name: String,
        quantity: {
            type: Number,
            default: 0
        },
        price: Float,
        value: Float
    }],
    total : {
        type: Float,
        default: 0
    },
    status : { 
        type: Number,
        required: true,
        default: 1
    },
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart