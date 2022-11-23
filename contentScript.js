let mediaRecorder;
const parts = [];
(() => {
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
			console.log("Playing...");
			mediaRecorder.start();
			console.log("1.", mediaRecorder.state);
			mediaRecorder.ondataavailable = (e) => {
				parts.push(e.data);
			};
		}
		if (requester.type == "UPLOAD") {
			if (mediaRecorder.state != "inactive") {
				mediaRecorder.stop();
				mediaRecorder.onstop = async () => {
					console.log("Played!");
					console.log(parts);
					console.log("2.", mediaRecorder.state);
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
			} else {
				console.log("Wrong state!");
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
};
