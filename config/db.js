const mongoose = require('mongoose')
require('dotenv').config()

const MONGOURI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, {
            useNewUrlParser: true
        })
        console.log('Connected to DB !!')
    } catch (e) {
        console.log(e)
        throw e
    }
}

module.exports = InitiateMongoServer