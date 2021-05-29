const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
    try{
        const conn =  await mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: true, useUnifiedTopology: true })
        console.log(`Mongodb connected`)
    }
    catch(error)
    {
        throw new Error(error)
    }
}

module.exports = connectDB
