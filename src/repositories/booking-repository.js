const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
const { Op } = require("sequelize");

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async createBooking(data, transaction) {
    const booking = await Booking.create(data, { transaction: transaction });
    return booking;
  }

  async get(data, transaction) {
    const response = await this.model.findByPk(data, {
      transaction: transaction,
    });
    if (!response) {
      throw new AppError(
        "Not able to fund the resource",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async update(id, data, transaction) {
    const response = await this.model.update(
      data,
      {
        where: {
          id: id,
        },
      },
      { transaction: transaction }
    );
    return response;
  }

  async cancelOldBookings(timestamp) {
    console.log("in repo");
    const response = await Booking.update(
      { status: "Cancelled" },
      {
        where: {
          [Op.and]: [
            {
              createdAt: {
                [Op.lt]: timestamp,
              },
            },
            {
              status: {
                [Op.ne]: "Booked",
              },
            },
            {
              status: {
                [Op.ne]: "Cancelled",
              },
            },
          ],
        },
      }
    );
    return response;
  }
}

module.exports = BookingRepository;
