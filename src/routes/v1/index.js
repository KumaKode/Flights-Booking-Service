const express = require("express");
const router = express.Router();

const { InfoController } = require("../../controllers");
const bookingRoutes = require("./booking-routes");

router.get("/info", InfoController.getInfo);
router.use("/bookings", bookingRoutes);

module.exports = router;
