const User = require('../models/userModel.js')

exports.home = (req,res)=>{
    res.send("<h1>Home response</h1>")
}
exports.createUser = async(req, res)=>{
    try{
        const {name, email} = req.body
        console.log({name,email})

        if(!name || !email) {
            throw new Error('name and email are required')
        }

        //check if the user is exists
        const userExists = await User.findOne({email})

        if(userExists){
            throw new Error('user already exists')
        }

        const user = await User.create({
            name,
            email
        })

        res.status(201).json({
            success: true,
        message: "User created successfully",
        user      
    })

    }catch(error){
        console.log(error);
        res.status(400).json({
            success : false,
            message: error.message
        })

    }
}