const mongoose = require('mongoose')
var Float = require('mongoose-float').loadType(mongoose);

require('dotenv').config()

const menuItemSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Float,
        required: true
    },
    image: {
        type: String,
        default: process.env.DEFAULT_IMAGE_S3
    },
    menu_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Menu',
        }
    ]
        
    
})

menuItemSchema.methods.toJSON = function(){
    const menuItem = this
    const menuItemObject = menuItem.toObject()

    delete menuItemObject.__v
    return menuItemObject
}

const MenuItem = mongoose.model('Menu Item', menuItemSchema)

module.exports = MenuItem