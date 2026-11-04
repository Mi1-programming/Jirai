/** @format */

class SocketRouter {
	constructor() {
		this.routes = new Map();
	}
	/**
	 * Adds a route to this router
	 * @param {string} route
	 * @param {function} handle
	 */
	Socket(route, handle) {
		this.routes.set(route, handle);
	}
}

const CreateSocketRouter = function () {
	const router = new SocketRouter();
	return router;
};

class SocketServer {
	constructor() {
		this.routes = new Map();
	}

	/**
	 *
	 * @param {SocketRouter} router
	 */
	Use(router) {
		for (const [key, value] of router.routes.entries()) {
			this.routes.set(key, value);
		}
	}
}

/**
 *
 * @returns {SocketServer}
 */
function CreateSocketServer(app) {
	const server = new SocketServer();

	app.ws("/ws", function (ws, req) {
		ws.on("message", function (msg) {
			try {
				const jsonMessage = JSON.parse(msg);
				const route = server.routes.get(jsonMessage.route);
				if (route == undefined) {
					console.warn(
						`Route (${jsonMessage.route}) was not found from socket server`,
					);
					return;
				}
				route(ws, req, jsonMessage);
			} catch (error) {
				console.error(error);
			}
		});
	});

	return server;
}

module.exports = {
	CreateSocketServer,
	CreateSocketRouter,
};
