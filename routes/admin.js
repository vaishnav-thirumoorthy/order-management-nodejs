const express = require('express')
const User = require('../models/user')
const router = express.Router()

const Auth = require('../middleware/auth')
const Validator = require('../Utils/validator')
const mailer = require('../Utils/mailer')
const crypto = require('crypto')


router.get('/admin', (req, res) => {
    res.render('admin', {
        layout: 'main',
        page_name: 'Admin'
    })
})

router.get('/admin/agents', async (req, res) => {
    try {
        const agents = await User.find({
            restaurant_agent: true
        }).lean()
        res.render('agents', {
            layout: 'main',
            page_name: 'Admin',
            agents: agents,
            email: req.user.email
        })
    } catch (error) {
        req.flash('err_msg', 'Something went wrong')
        res.redirect('/a/dashboard')
    }

})

router.get('/admin/agents/manage', (req, res) => {
    res.render('agent_manage', {
        layout: 'main',
        page_name: 'Admin',
        create: true
    })
})

router.get('/admin/agents/:id', async (req, res) => {
    try {
        if (!Validator.isValidMongoID({
                id: req.params.id
            })) {
            req.flash('error_msg', 'Unable to get agent details. There are no agents with this ID')
            return res.redirect('/admin/agents')
        }
        const agent = await User.findOne({
            _id: req.params.id
        }).lean()

        if (agent == undefined || agent == null) {
            req.flash('error_msg', 'Unable to get agent details. There are no agents with this ID')
            return res.redirect('/admin/agents')
        }

        if (req.user.role == agent.role && req.user.email != agent.email) {
            req.flash('error_msg', 'You are not allowed to view this page')
            return res.redirect('/admin/agents')
        }

        res.render('agent_manage', {
            layout: 'main',
            page_name: 'Admin',
            agent: agent,
            update: true
        })
    } catch (error) {
        console.log(error)
    }

})

// CREATE AGENT


router.post('/agents', async (req, res) => {
    try {
        const errors = await Validator.validateRequest(req)
        if (req.body.role < 2 || req.body.role > 3) errors.push("Invalid Role ID")
        if (req.body.role == 'Choose a role' || req.body.role == undefined) errors.push("Please select a Role")
        if (errors.length > 0) {
            req.flash('error', errors)
            return res.redirect('/admin/agents/manage')
        }

        req.body['role_name'] = req.body.role == 2 ? 'Administrator' : 'Supervisor'
        req.body['restaurant_agent'] = true

        let token = (crypto.randomBytes(16)).toString('hex')
        req.body['token'] = token
        req.body['token_expires'] = Math.floor(Date.now() / 1000) + 86400

        const agent = await User.create(new User(req.body));
        
        const msg = mailer.activationEmailBody({
            to: agent.email,
            name: agent.name,
            token
        })
        const response = await mailer.sendMail(msg)

        req.flash('success_msg', `Agent created with ${req.body['role_name']} privileges`)
        res.redirect('/admin/agents')

    } catch (error) {
        req.flash('error_msg', `${error}`)
        res.redirect('/admin/agents')
    }

})

router.put('/agents/:id', async (req, res) => {
    try {
        const errors = await Validator.validateAgentEmail(req)
        if (req.body.role < 2 || req.body.role > 3) errors.push("Invalid Role ID")
        if (req.body.role == 'Choose a role' || req.body.role == undefined) errors.push("Please select a Role")
        if (errors.length > 0) {
            req.flash('error', errors)
            return res.redirect('/admin/agents/' + req.params.id)
        }

        const agent = await User.findById(req.params.id)

        if (req.params.id == req.user._id && req.body.email != req.user.email)
        {
            const role_name = req.body.role == 2 ? 'Administrator' : 'Supervisor'
            req.body['role_name'] = role_name
            Object.keys(req.body).forEach((key) => {
                agent[key] = req.body[key]
            })
            let token = (crypto.randomBytes(16)).toString('hex')
            agent['isActive'] = 0
            agent['password'] = ''
            agent['token'] = token
            agent['token_expires'] = Math.floor(Date.now() / 1000) + 86400

            await agent.save();

            const msg = mailer.activationEmailBody({
                to: agent.email,
                name: agent.name,
                token
            })
            const response = await mailer.sendMail(msg)
            return res.redirect('/logout')

        }

        if (agent.email != req.body.email)
        {
            const role_name = req.body.role == 2 ? 'Administrator' : 'Supervisor'
            req.body['role_name'] = role_name
            Object.keys(req.body).forEach((key) => {
                agent[key] = req.body[key]
            })
    
            let token = (crypto.randomBytes(16)).toString('hex')
            agent['isActive'] = 0
            agent['password'] = ''
            agent['token'] = token
            agent['token_expires'] = Math.floor(Date.now() / 1000) + 86400

            await agent.save();

            const msg = mailer.activationEmailBody({
                to: agent.email,
                name: agent.name,
                token
            })
            const response = await mailer.sendMail(msg)
            req.flash('success_msg', `Agent updated`)
            return res.redirect('/admin/agents')
        }

        const role_name = req.body.role == 2 ? 'Administrator' : 'Supervisor'
        req.body['role_name'] = role_name
        Object.keys(req.body).forEach((key) => {
            agent[key] = req.body[key]
        })

        await agent.save()
        req.flash('success_msg', `Agent updated`)
        res.redirect('/admin/agents')
    } catch (error) {
        req.flash('error_msg', `${error}`)
        res.redirect('/admin/agents')
    }

})

router.delete('/admin/agents/:id', async (req, res) => {
    try {
        const agent = await User.deleteOne({
            _id: req.params.id
        })
        req.flash('success_msg', 'Agent deleted')
        res.redirect('/admin/agents')
    } catch (error) {
        req.flash('error_msg', `${error}`)
        res.redirect('/admin/agents')
    }

})

module.exports = router