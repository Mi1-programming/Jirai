/** @format */

class LLMSession {
	constructor(instructions, llmOptions) {
		this.llmOptions = llmOptions;
		this.messages = [
			{
				role: "user",
				content: instructions,
			},
		];
		this.events = new Map();
	}
	CallEvent(name, params) {
		const event = this.events.get(name);
		if (event == undefined) return;
		event.forEach((listener) => {
			listener(params);
		});
	}
	/**
	 * @param {RequestInit} options
	 */
	async Connect(options) {
		this.CallEvent("connect");
	}
	/**
	 *
	 * @param {RequestInit} options
	 */
	async Converse(options) {
		this.CallEvent("converse");
	}
	async Close() {
		this.CallEvent("close");
	}
	ToolCall(call) {
		this.CallEvent("toolcall", call);
	}
	/**
	 *
	 * @param {string} name
	 * @param {Function} callback
	 */
	AddEventListener(name, callback) {
		let event = this.events.get(name);
		if (event == undefined) {
			event = [];
		}
		event.push(callback);
		this.events.set(name, event);
	}
}

module.exports = {
	LLMSession,
};
