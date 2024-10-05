const express = require('express');
const router =  express.Router();
const userController = require('../controller/userController');
router.post("/createUser",userController.createuser)

router.post("/getUser", userController.getUserByEmail)

export default router;