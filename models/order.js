const mongoose = require('mongoose')
var Float = require('mongoose-float').loadType(mongoose);

const orderSchema = new mongoose.Schema({
    order_number:{
        type: Float
    },
    items : [{
        item_id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu Item'
        },
        name: String,
        quantity: Number,
        price: Float,
        value: Float
    }],
    total: {
        type: Float,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 1
    },
    rating : {
        type: Number
    },
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date
    }
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order