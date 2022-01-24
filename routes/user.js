const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../model/user')
const auth = require('../middleware/auth')
require('dotenv').config()

router.post(
    '/signup',
    [
        check('user_name', 'Please enter a valid username')
            .not()
            .isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a valid password').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const {
            user_name,
            email,
            password
        } = req.body

        try {
            let user = await User.findOne({
                email
            })

            if (user) {
                return res.status(400).json({
                    message: 'User already exists'
                })
            }

            user = new User({
                user_name,
                email,
                password
            })
            const salt = bcrypt.genSaltSync(10)
            user.password = bcrypt.hashSync(password, salt)
            await user.save()
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err
                    res.status(200).json({
                        token
                    })
                }
            )
        } catch (err) {
            console.log(err.message)
            res.status(500).send('Error in saving')
        }
    }
)

router.post(
    '/login',
    [
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a valid password').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()
            })
        }
        const { email, password } = req.body
        try {
            let user = await User.findOne({
                email
            })
            if (!user) {
                return res.status(400).json({
                    message: 'User not exist'
                })
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    message: 'Incorrect password !'
                })
            }
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: 3600
                },
                (err, token) => {
                    if (err) throw err
                    res.status(200).json({
                        token
                    })
                }
            )
        } catch (err) {
            console.error(err)
            res.status(500).json({
                message: 'Server error'
            })
        }
    }
)

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.json(user)
    } catch (e) {
        res.send({ message: 'Error in fetching user' })
    }
})

module.exports = router