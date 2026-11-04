import { ClientSocket } from "./clientSocket"
import { v4 as uuidv4 } from "uuid"

export class Task {
	/**
	 *
	 * @param {Function} callback - The task
	 */
	constructor(callback) {
		this.id = uuidv4()
		this.callback = callback
		this.listeners = new Map()
	}
	/**
	 *
	 * @param {string} id
	 * @param {Function} callback
	 */
	Listen(id, callback) {
		this.listeners.set(id, callback)
	}
	Mute(id) {
		this.listeners.delete(id)
	}
	/**
	 *
	 * @param {{}} params
	 * @returns {*}
	 */
	async Do() {
		return await this.callback(this.id)
	}
	/**
	 * Updates the listeners on the progress of this task
	 * @param {{}} params
	 */
	Progress(params) {
		this.listeners.forEach((listener) => {
			listener(params)
		})
	}
}
export class TaskManager {
	/**
	 *
	 * @param {ClientSocket} clientSocket
	 */
	constructor(clientSocket) {
		this.activeTasks = new Map()
		this.clientSocket = clientSocket
		this.clientSocket.Subscribe("task", this.Handle.bind(this))
	}
	/**
	 * Completes the task and tracks it's progress
	 * @param {Task} task
	 * @param {Function} callback
	 */
	async Complete(task, callback) {
		// Create task on server
		await fetch("/api/task", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ task_id: task.id }),
		})

		// Start listening to the task
		this.clientSocket.Send({
			route: "track_task",
			task_id: task.id,
		})
		this.activeTasks.set(task.id, task)

		// Actually do the task
		const result = await task.Do()
		this.Destroy(task.id)
		if (callback == undefined) return
		callback(result)
	}
	/**
	 *
	 * @param {string} id
	 * @returns {Task}
	 */
	Get(id) {
		const activeTask = this.activeTasks.get(id)
		if (activeTask == undefined) {
			console.warn(`Tried handling a task which doesn't exist with id of (${id})`)
			return
		}
		return activeTask
	}
	/**
	 *
	 * @param {{}} params
	 */
	Handle(params) {
		const activeTask = this.Get(params.id)
		if (activeTask == undefined) return
		activeTask.Progress(params)
	}
	/**
	 *
	 * @param {string} id
	 */
	Destroy(id) {
		this.activeTasks.delete(id)
	}
}
