const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Menu = require('../models/menu')
const MenuItem = require('../models/menu_items')


router.post('/admin/menus', async (req, res) => {
    try {
        if ( req.body.name == '' || req.body.status == 'Choose a status' || req.body.status == undefined )
        {
            req.flash('error_msg', `Please enter correct menu name and status`)
            return res.redirect('/admin/new-menu')
        }
        const menu = new Menu(req.body)
        const response = await menu.save()
        req.flash('success_msg', 'Menu Created Successfully')
        res.redirect('/admin/menus/' + response._id)
    } catch (error) {
        req.flash('error_msg', `Something went wrong ${error}`)
        res.redirect('/admin/menus')
    }

})

router.get('/admin/menus/:id/edit', async (req, res) => {
    const menu = await Menu.find({
        _id: req.params.id
    }).lean()
    const status = menu[0].status == 1 ? 'Active' : 'Inactive'
    const active = menu[0].status == 1 ? true : false
    const inactive = menu[0].status == 2 ? true : false
    const menu_id = req.params.id
    const menuItems = await MenuItem.find({
        menu_id: req.params.id
    }).lean()

    res.render('menu_edit', {
        layou: 'main',
        page_name: 'Admin',
        menu: menu,
        items: menuItems,
        active: active,
        inactive: inactive,
        status: status,
        menu_id: menu_id,
        view: false,
        edit: true
    })
})

//rename menu

// router.post('/admin/menus/:id', async (req, res) => {
//     await Menu.findByIdAndUpdate({
//         _id: req.params.id
//     }, {
//         $set: req.body
//     }, {
//         new: true,
//         runValidators: true
//     })
//     req.flash('success_msg', 'Menu Updated')
//     res.redirect('/admin/menus/' + req.params.id)
// })


router.get('/admin/menus', async (req, res) => {
    const activeMenus = await Menu.find({
        status: 1
    }).lean()
    const inactiveMenus = await Menu.find({
        status: 2
    }).lean()

    res.render('menu', {
        layout: 'main',
        page_name: 'Admin',
        activeMenu: activeMenus,
        inactiveMenu: inactiveMenus
    })
})

router.get('/admin/menus/:id', async (req, res) => {
    const menu = await Menu.find({
        _id: req.params.id
    }).lean()
    const status = menu[0].status == 1 ? 'Active' : 'Inactive'
    const active = menu[0].status == 1 ? true : false
    const inactive = menu[0].status == 2 ? true : false
    const menu_id = req.params.id
    const menuItems = await MenuItem.find({
        menu_id: req.params.id
    }).lean()

    res.render('menu_edit', {
        layou: 'main',
        page_name: 'Admin',
        menu: menu,
        items: menuItems,
        active: active,
        inactive: inactive,
        status: status,
        menu_id: menu_id,
        view: true,
        edit: false
    })
})


router.get('/admin/new-menu', (req, res) => {
    res.render('menu_create', {
        layout: 'main',
        page_name: 'Admin'
    })
})


router.get('/admin/menus/:id/add', async (req, res) => {
    const menu = await Menu.find({
        _id: req.params.id
    }).lean()
    const menu_id = menu[0]._id
    const status = menu[0].status == 1 ? 'Active' : 'Inactive'
    const menuitems = await MenuItem.find({
        menu_id: {
            $not: {
                $all: [mongoose.Types.ObjectId(req.params.id)]
            }
        }
    }).lean()
    res.render('add_menu_items', {
        layout: 'main',
        page_name: 'Admin',
        menu: menu,
        items: menuitems,
        status: status,
        menu_id: menu_id
    })
})

//set menu status as active/inactive

router.put('/admin/menus/:id', async (req, res) => {
    try {
        var keys = Object.keys(req.body)
        if (keys.includes('name')){
            if(req.body['name'] == '')
            {
                req.flash('error_msg', `Name cannot be empty. Please enter a name`)
                return res.redirect('/admin/menus/' + req.params.id)    
            }
            const menu = await Menu.findOne({name: req.body['name']})
            if (menu != null){
                req.flash('error_msg', `This name is already taken. Please enter a new name`)
                return res.redirect('/admin/menus/' + req.params.id)    
            }
        }

        await Menu.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            new: true,
            runValidators: true
        })
        req.flash('success_msg', 'Menu Updated')
        res.redirect('/admin/menus/' + req.params.id)    
    } catch (error) {
        req.flash('error_msg', `Something went wrong`)
        res.redirect('/admin/menus/' + req.params.id)    
        
    }
    
})


router.put('/admin/menus/:id/add_item', async (req, res) => {
    try {
        const menuItem = await Menu.addItemToMenu(req.params.id, req.body.item_id)
        req.flash('success_msg', 'Item Successfully added to the Menu')
        res.redirect('/admin/menus/' + req.params.id + '/add')    
    } catch (error) {
        req.flash('error_msg', `Something went wrong`)
        res.redirect('/admin/menus/' + req.params.id + '/add')    
    }
    

})

router.get('/admin/menu_items/:id/quick_add', async (req, res) => {
    const menu = await Menu.find({
        _id: req.params.id
    }).lean()
    const menu_id = menu[0]._id
    const status = menu[0].status == 1 ? 'Active' : 'Inactive'
    const menuitems = await MenuItem.find({
        menu_id: {
            $not: {
                $all: [mongoose.Types.ObjectId(req.params.id)]
            }
        }
    }).lean()
    res.render('add_menu_items', {
        layout: 'main',
        page_name: 'Admin',
        menu: menu,
        items: menuitems,
        status: status,
        menu_id: menu_id,
        quick_add: true
    })
})


router.delete('/admin/menus/:id', async (req, res) => {
    await Menu.findOneAndDelete({
        _id: req.params.id
    })
    req.flash('succes_msg', 'Menu Deleted Successfully')
    res.redirect('/admin/menus')
})

router.delete('/admin/menus/:id/menu_items/:item_id', async (req, res) => {
    const menuitem = await MenuItem.findOneAndUpdate({
        _id: req.params['item_id']
    }, {
        $unset: {
            menu_id: req.params.id
        }
    }, {
        new: true,
        runValidators: true
    })
    req.flash('success_message', 'Item removed from the menu')
    res.redirect('/admin/menus/' + req.params.id)
})

module.exports = router