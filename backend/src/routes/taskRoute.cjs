/** @format */

const { CreateTask } = require("../tasks.cjs");
const express = require("express");
const router = express.Router();

router.post("/api/task", async (req, res) => {
	const taskId = req.body.task_id;
	CreateTask(taskId);
	res.status(200).end();
});

module.exports = router;
