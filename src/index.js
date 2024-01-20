const express = require("express");
const CRON = require("./utils/common/cron-jobs");

const { ServerConfig, Logger, QueueConfig } = require("./config");
const apiRoutes = require("./routes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, async () => {
  console.log("Successfully started the server");
  Logger.info("Successfully started the server");

  CRON();
  await QueueConfig.connectQueue();
});
