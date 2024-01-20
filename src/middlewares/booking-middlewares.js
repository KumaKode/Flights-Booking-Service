const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const { ErrorResponse, SuccessResponse } = require("../utils/common");

function validateCreateRequest(req, res, next) {
  ErrorResponse.message = "Something went wrong while creating booking";
  if (!req.body.flightId) {
    ErrorResponse.error = new AppError(
      ["flightId not found in the incoming request"],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  next();
}

function validatePaymentRequest(req, res, next) {
  ErrorResponse.message = "Something went wrong while creating booking";
  if (!req.body.totalCost) {
    ErrorResponse.error = new AppError(
      ["totalCost not found in the incoming request"],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  if (!req.body.bookingId) {
    ErrorResponse.error = new AppError(
      ["bookingId not found in the incoming request"],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }
  next();
}

module.exports = {
  validateCreateRequest,
  validatePaymentRequest,
};
