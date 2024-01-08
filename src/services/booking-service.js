const axios = require("axios");
const { ServerConfig } = require("../config");

const { BookingRepository } = require("../repositories");
const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const AppError = require("../utils/errors/app-error");

const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();

  try {
    const flight = await axios.get(
      `${ServerConfig.Flight_Service}/api/v1/flights/${data.flightId}`
    );

    const flightData = flight.data.data;
    console.log(flightData);

    if (data.noOfSeats > flightData.total_seats) {
      throw new AppError(
        "Not enough seats available",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const totalBillingAmount = data.noOfSeats * flightData.price;
    console.log(totalBillingAmount);
    const bookingPayload = { ...data, totalCost: totalBillingAmount };
    console.log(bookingPayload);
    const booking = await bookingRepository.create(bookingPayload, transaction);

    await axios.patch(
      `${ServerConfig.Flight_Service}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: data.noOfSeats,
      }
    );

    await transaction.commit();
    return booking;
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      let explaination = [];
      error.errors.forEach((err) => {
        explaination.push(err.message);
      });
      await transaction.rollback();
      throw new AppError(explaination, StatusCodes.BAD_REQUEST);
    }

    await transaction.rollback();
    throw error;
    // throw new AppError(
    //   "Cannot Create a new Booking",
    //   StatusCodes.INTERNAL_SERVER_ERROR
    // );
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId, transaction);
    console.log(bookingDetails);
    if (bookingDetails.status == "Cancelled") {
      await transaction.commit();
      return true;
    }
    await axios.patch(
      `${ServerConfig.Flight_Service}/api/v1/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: 0,
      }
    );
    await bookingRepository.update(
      bookingId,
      { status: "Cancelled" },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function makePayment(data) {
  console.log(data);
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(
      data.bookingId,
      transaction
    );
    if (bookingDetails.status === "Cancelled") {
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }
    console.log(bookingDetails);
    const bookingTime = new Date(bookingDetails.createdAt);

    const currentTime = new Date();
    console.log(currentTime - bookingTime);
    if (currentTime - bookingTime > 300000) {
      await cancelBooking(data.bookingId);
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }
    if (bookingDetails.totalCost != data.totalCost) {
      throw new AppError(
        "The amount of the payment doesnt match",
        StatusCodes.BAD_REQUEST
      );
    }
    if (bookingDetails.userId != data.userId) {
      throw new AppError(
        "The user corresponding to the booking doesnt match",
        StatusCodes.BAD_REQUEST
      );
    }
    // we assume here that payment is successful
    await bookingRepository.update(
      data.bookingId,
      { status: "Booked" },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    //console.log(error);
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      let explaination = [];
      error.errors.forEach((err) => {
        explaination.push(err.message);
      });
      await transaction.rollback();
      throw new AppError(explaination, StatusCodes.BAD_REQUEST);
    }

    await transaction.rollback();
    throw error;
  }
}

async function cancelOldBookings() {
  try {
    console.log("Inside service");
    const time = new Date(Date.now() - 1000 * 300); // time 5 mins ago
    const response = await bookingRepository.cancelOldBookings(time);

    return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelOldBookings,
};
