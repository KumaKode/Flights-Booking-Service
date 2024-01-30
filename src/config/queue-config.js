const amqplib = require("amqplib");
const isDocker = require("./is-docker");

let connection, channel;

const connectionString = isDocker()
  ? "amqp://rabbitmq:5672"
  : "amqp://localhost";

async function connectQueue() {
  try {
    connection = await amqplib.connect(connectionString);
    channel = await connection.createChannel();

    await channel.assertQueue("notification_queue");
  } catch (error) {
    console.log(error);
  }
}

async function sendData(data) {
  try {
    await channel.sendToQueue(
      "notification_queue",
      Buffer.from(JSON.stringify(data))
    );
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  connectQueue,
  sendData,
};
