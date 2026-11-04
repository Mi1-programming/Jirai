/** @format */

const { FindTask } = require("../tasks.cjs");
const { CreateSocketRouter } = require("../socket.cjs");
const router = CreateSocketRouter();

router.Socket("track_task", function (ws, req, msg) {
	const taskId = msg.task_id;
	const task = FindTask(taskId);
	if (task == undefined) {
		console.warn(`No task found with uuid ${taskId}`);
		return;
	}
	task.RegisterListener(ws);
});

module.exports = router;
