const express = require('express')
const {home, createUser, deleteUser} = require('../Controllers/userControllers.js')

const router = express.Router()


router.get('/',home)
router.post('/createuser',createUser)


module.exports = router