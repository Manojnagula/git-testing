const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Name is require'],
        trim: true,
        maxLength:[30,'Name must be lessthan 30 chars' ]
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true
    }
})

module.exports = mongoose.model('User', userSchema)