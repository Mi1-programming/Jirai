/** @format */

const { loadEnvFile } = require("node:process");
const { existsSync } = require("node:fs");
const { CreateSocketServer } = require("./src/socket.cjs");
const express = require("express");
const path = require("node:path");
if (existsSync(".env")) {
	loadEnvFile(".env");
}
const app = express();
require("express-ws")(app);

app.use(express.json());

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

const socketServer = CreateSocketServer(app);
socketServer.Use(require("./src/sockets/taskSocket.cjs"));

app.use(require("./src/routes/evaluateRoute.cjs"));
app.use(require("./src/routes/taskRoute.cjs"));

const port = process.env.EXPRESS_PORT;
app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
