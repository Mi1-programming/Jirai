/** @format */

const tasks = new Map();

class Task {
	/**
	 * Create a task which's progress will be tracked with websockets
	 * @param {string} id
	 */
	constructor(id) {
		this.id = id;
		this.listeners = new Set();
		this.taskCount = 0;
		this.stageArray = [];
		this.action = "Task Started";
		this.progress = 0.0;
	}
	/**
	 * Initialize the task with stages to complete it
	 * @param {{}} stages
	 */
	InitializeTask(stages) {
		// Results in objects with keys and values
		this.stageArray = Object.keys(stages).map((key) => {
			return { key: key, value: stages[key] };
		});
		this.taskCount = this.stageArray.length;
	}
	/**
	 * Updates the progress of a single listener
	 * @param {WebSocket} listener
	 */
	UpdateListener(listener) {
		listener.send(
			JSON.stringify({
				route: "task",
				id: this.id,
				action: this.action,
				progress: this.progress,
			}),
		);
	}
	/**
	 * Updates the what the current step and progress of the task is
	 * @param {string} action
	 */
	UpdateListeners(action) {
		this.action = action;
		this.progress = 1.0 - this.stageArray.length / this.taskCount;

		this.listeners.forEach((listener) => {
			this.UpdateListener(listener);
		});
	}
	/**
	 * Moves to the next stage of the task, and reports the progress.
	 * If the next task ID is behind multiple tasks in order, then those task are also completed
	 * @param {*} progress
	 */
	NextStage(stageId) {
		if (this.stageArray.length == 0) return;

		let removedStage = undefined;
		do {
			removedStage = this.stageArray.shift();
			if (removedStage.key === stageId) break;
		} while (removedStage != undefined);

		// Task is done
		if (this.stageArray.length == 0) {
			if (this.id != undefined) {
				DeleteTask(this.id);
			}
		}

		this.UpdateListeners(removedStage.value);
	}
	/**
	 *
	 * @param {WebSocket} ws
	 */
	RegisterListener(ws) {
		this.listeners.add(ws);
		this.UpdateListener(ws);
	}
	/**
	 *
	 * @param {WebSocket} ws
	 */
	UnregisterListener(ws) {
		this.listeners.delete(ws);
	}
}

/**
 * Create and register a task
 * @param {string} id
 * @returns {Task}
 */
function CreateTask(id) {
	const task = new Task(id);
	tasks.set(task.id, task);
	return task;
}
/**
 * Return a task by the task id
 * @param {string} taskId
 * @returns {Task}
 */
function FindTask(taskId) {
	const task = tasks.get(taskId);
	return task;
}
/**
 *
 * @param {string} taskId
 */
function DeleteTask(taskId) {
	tasks.delete(taskId);
}
/**
 * Initialize the task with stages to complete it
 * @param {string} taskId
 * @param {{}} stages
 */
function InitializeTask(taskId, stages) {
	const task = FindTask(taskId);
	if (task == undefined) {
		// Nobody wants to track this task
		return new Task(undefined);
	}
	task.InitializeTask(stages);
	return task;
}

module.exports = {
	Task,
	CreateTask,
	FindTask,
	DeleteTask,
	InitializeTask,
};
