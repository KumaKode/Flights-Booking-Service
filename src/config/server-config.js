const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  Flight_Service: process.env.Flight_Service,
  User_Service: process.env.User_Service,
};
