import { shallowRef } from "vue"

export class ClientSocket {
	constructor() {
		this.socket = null
		this.requestQueue = []
		this.routes = new Map()
	}
	Connect() {
		this.socket = new WebSocket("/ws")
		this.socket.addEventListener("open", () => {
			this.SendQueue()
		})
		this.socket.addEventListener("message", (event) => {
			let message

			try {
				message = JSON.parse(event.data)
			} catch (error) {
				console.warn(error)
				return
			}

			this.Process(message)
		})
	}
	SendImmediate(params) {
		this.socket.send(JSON.stringify(params))
	}
	Send(params) {
		if (this.socket == undefined) {
			console.warn("Connect() the client socket before using Send()")
			return
		}

		const socketConnected = this.socket.readyState === this.socket.OPEN
		if (socketConnected) {
			this.SendImmediate(params)
			return
		}
		this.requestQueue.push(params)

		const socketBroken =
			this.socket.readyState == this.socket.CLOSED || this.socket.readyState == this.socket.CLOSING
		if (socketBroken) this.Connect()
	}
	SendQueue() {
		let params = this.requestQueue.shift()
		while (params != undefined) {
			this.socket.send(JSON.stringify(params))
			params = this.requestQueue.shift()
		}
	}
	Process(msg) {
		const route = this.routes.get(msg.route)
		if (route == undefined) {
			console.warn(`Invalid route provided (${msg.route})`)
			return
		}
		route(msg)
	}
	/**
	 * Subsribe to websocket routes
	 * @param {string} route
	 * @param {Function} callback
	 */
	Subscribe(route, callback) {
		this.routes.set(route, callback)
	}
	/**
	 *
	 * @param {string} route
	 */
	Unsubscribe(route) {
		this.routes.delete(route)
	}
}
