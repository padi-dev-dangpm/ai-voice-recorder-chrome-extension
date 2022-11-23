document.addEventListener("DOMContentLoaded", async () => {
	const openBtn = document.querySelector(".open-btn");
	const closeBtn = document.querySelector(".close-btn");
	const showTextBtn = document.querySelector(".show-text-btn");

	const p = document.querySelector(".show-state");

	openBtn.addEventListener("click", () => {
		chrome.runtime.sendMessage({
			type: "RECORD",
		});
	});

	closeBtn.addEventListener("click", () => {
		chrome.runtime.sendMessage({
			type: "STOP",
		});
	});

	showTextBtn.addEventListener("click", async () => {
		const data = await new Promise((resolve) => {
			chrome.storage.sync.get(["text"], (obj) => {
				resolve(obj["text"] ? obj["text"] : []);
			});
		});

		p.innerHTML = `You just said: ${data}`;
	});
});
