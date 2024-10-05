const express = require("express");
const router = express.Router();
const bayController = require("../controller/bayController");

// Route to create a new bay
router.post("/createBay", bayController.createbay);

// Other routes can also go here
router.get("/bays", bayController.getAllBay);
router.get("/bays/:id", bayController.getBayById);
router.post("/baysByType", bayController.getBayByType);

// router.get("/getBays", bayController.getBays);

module.exports = router;
