let mediaRecorder;
const wrapperClass = "ui-recorder";
const parts = [];
(() => {
	function createElement(type, objects, className) {
		const element = document.createElement(type);
		element.className = className;
		Object.keys(objects).forEach((object) => {
			element.style[object] = objects[object];
		});
		return element;
	}

	function handleWrapperBtn() {
		removeUIRecorder();
		mediaRecorder.stop();
		mediaRecorder.onstop = async () => {
			console.log("Played!");
			const blob = new Blob(
				parts.length == 0 ? [] : [parts[parts.length - 1]],
				{
					type: "audio/wav",
				}
			);
			const file = new File([blob], "voice.wav", {
				type: "audio/wav",
			});
			await handleSave(file);
		};
	}

	function handleUIRecorder() {
		const body = document.querySelector("body");
		body.style.position = "relative";
		const wrapperExists = document.querySelector(`.${wrapperClass}`);
		if (!wrapperExists) {
			const wrapper = createElement(
				"button",
				{
					background: "white",
					position: "absolute",
					width: "200px",
					height: "30px",
					left: "15px",
					bottom: "30px",
					textAlign: "center",
				},
				wrapperClass
			);
			wrapper.innerHTML = "Stop Recording";
			wrapper.addEventListener("click", handleWrapperBtn);
			body.appendChild(wrapper);
		}
	}

	function removeUIRecorder() {
		const body = document.querySelector("body");
		const wrapper = document.querySelector(`.${wrapperClass}`);
		body.removeChild(wrapper);
	}

	chrome.runtime.onMessage.addListener(async (requester, sender, response) => {
		if (requester.type == "NEW") {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: false,
			});
			mediaRecorder = new MediaRecorder(stream);
			if (mediaRecorder.state != "inactive") {
				mediaRecorder.stop();
			}
			mediaRecorder.start();
			console.log("Playing...");
			handleUIRecorder();
			mediaRecorder.ondataavailable = (e) => {
				parts.push(e.data);
			};
		}
		if (requester.type == "UPLOAD") {
			if (mediaRecorder.state != "inactive") {
				removeUIRecorder();
				mediaRecorder.stop();
				mediaRecorder.onstop = async () => {
					console.log("Played!");
					const blob = new Blob(
						parts.length == 0 ? [] : [parts[parts.length - 1]],
						{
							type: "audio/wav",
						}
					);
					const file = new File([blob], "voice.wav", {
						type: "audio/wav",
					});
					await handleSave(file);
				};
			}
		}
	});
})();

const handleSave = async (file) => {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h",
		{
			headers: {
				Authorization: "Bearer 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",
			},
			method: "POST",
			body: file,
		}
	);
	const result = await response.json();
	console.log(result.text);
	chrome.storage.sync.set({
		["text"]: result.text,
	});
	chrome.runtime.sendMessage({
		text: result.text,
	});
	try {
		console.log("Is Copy");
		copyWord(result.text);
	} catch (err) {
		console.log(err.message);
	}
};

function copyWord(word) {
	navigator.clipboard.writeText(word);
	alert("Copied the text: " + word);
}
