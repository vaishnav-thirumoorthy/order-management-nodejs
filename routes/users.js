const express = require('express')
const router = express.Router()

router.get('/users', async (req, res) => {
   res.render('agent_users', {layout: 'main', name:'Users'})
})

router.get('/users/customers', async (req, res) => {
    const showCustomer = true
    res.render('agent_users', {layout: 'main', name:'Users', value: showCustomer })
 })

module.exports = router