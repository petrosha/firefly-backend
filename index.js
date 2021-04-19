const app = require("./app");
const http = require("http");

const logger = require("./utils/logs");
const configs = require("./utils/configs");

const server = http.createServer(app);
server.listen(configs.SERVER_PORT, () => {
    logger.info(`Server running on port ${configs.SERVER_PORT}`)
})