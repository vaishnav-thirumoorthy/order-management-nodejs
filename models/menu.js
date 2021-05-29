const mongoose = require('mongoose')
const MenuItem = require('./menu_items')

const menuSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 4
    },
    status:{
        type: Number,
        required: true,
        default: 1,
        validate(value){
            if(value > 2 || value < 1)
            {
                throw new Error('Invalid status code')
            }
        }
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

menuSchema.virtual('menu_items', {
    ref:'Menu Item',
    localField: '_id',
    foreignField: 'menu_id'
})

menuSchema.methods.toJSON = function () {
    const menu = this
    const menuObject = menu.toObject()
    delete menuObject.__v
    return menuObject
}

menuSchema.statics.addItemToMenu = async function(id, item_id) {
    try {
        req = {}
        const menuItem = await MenuItem.findOne({_id: item_id})
        if ( menuItem['menu_id'].includes(id))
        {
            req['menu_id'] = menuItem['menu_id']
        }
        else{
            menuItem['menu_id'].push(id)
            req['menu_id'] = menuItem['menu_id']
        }
        const updatedItem = await MenuItem.findOneAndUpdate({_id:item_id}, {$set:req}, {new:true, runValidators:true})
        return updatedItem
    } catch (error) {
        return(error)
    }
    
}

menuSchema.pre('remove', async function(next){

    try {
        const menu = this
        await MenuItem.updateMany({menu_id:this._id}, {$unset:{menu_id:this._id}})    
        next()
    } catch (error) {
        next(error)
    }
    

})

const Menu = mongoose.model('Menu', menuSchema)

module.exports = Menu