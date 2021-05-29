const crypto = require('crypto')
const express = require('express')
const router = express.Router()

const User = require('../models/user')
const validator = require('../Utils/validator')
const mailer = require('../Utils/mailer')

// ** Get Requests. List all agents and view an agent

router.get('/api/agents', async (req, res) => {
    try {
        const agents = await User.find({
            restaurant_agent: true,
            role: {
                $gt: 1
            }
        })
        if (agents.length == 0) return res.status(404).send({
            message: 'No data found'
        })
        res.status(200).send(agents)
    } catch (error) {
        res.status(500).send('Something went wrong')
    }
})

router.get('/api/agents/:id', async (req, res) => {
    try {
        if (!validator.isValidMongoID({
                id: req.params.id
            })) {
            return res.status(400).send({
                error: 'Invalid Agent ID. The agent ID should be single String of 12 bytes or a string of 24 hex characters'
            })
        }
        const agent = await User.findOne({
            _id: req.params.id
        })
        if (!agent) return res.status(404).send({
            message: 'No data available'
        })
        res.status(200).send(agent)
    } catch (error) {
        res.status(500).send('Something went wrong')
    }
})

// ** Create agents

router.post('/api/agents', async (req, res) => {
    try {

        //validate request

        const allowedValues = ['name', 'email', 'role']
        const request = Object.keys(req.body)

        const mandatory = []
        allowedValues.forEach((value) => {
            if (req.body[value] == undefined) {
                mandatory.push(value)
            }
        })

        if (mandatory.length != 0) {
            return res.status(400).send({
                error: {
                    message: `Missing mandatory field(s) - ${mandatory.join()}`
                }
            })
        }

        const invalidValue = request.filter((value) => {
            return !allowedValues.includes(value)
        })

        if (invalidValue.length != 0) {
            return res.status(400).send({
                error: {
                    message: `Invalid field(s) [${invalidValue.join()}] in request`
                }
            })
        }

        const errors = await validator.validateRequest(req)
        if (errors.length != 0) {
            return res.status(400).send({
                error: errors
            })
        }

        const isValidRole = validator.validateRole(req.body.role)
        if (!isValidRole) {
            return res.status(400).send({
                error: 'Invalid value for the field role'
            })
        }

        //create agent

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

        res.status(201).send(agent)
    } catch (error) {
        console.log(error)
        res.status(500).send('Something went wrong')
    }
})

// ** Update agents

router.put('/api/agents/:id', async (req, res) => {
    const req_body = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'role']
    const isValid = req_body.every((field) => allowedUpdates.includes(field))
    if (!isValid) return res.status(400).send({
        error: 'Invalid field in request'
    })

    try {
        const agent = await User.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            new: true,
            runValidators: true
        })
        if (!agent) return res.status(404).send({
            error: 'User not found'
        })
        res.status(200).send(agent)
    } catch (error) {
        res.status(500).send('Something went wrong')
    }
})

// ** Delete agent

router.delete('/api/agents/:id', async (req, res) => {
    try {
        const agent = await User.findOneAndDelete({
            _id: req.params.id
        })
        if (!agent) return res.status(404).send({
            message: 'The resource you are trying to delete does not exist'
        })
        res.status(204).send('No Content')
    } catch (error) {
        res.send(error)
    }
})


module.exports = router