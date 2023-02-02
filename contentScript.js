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
      //   console.log("Played!");
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
          backgroundColor: "#e1d9d9",
          padding: "16px",
          fontSize: "14px",
          fontWeight: 600,
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          color: "#e43030",
          position: "absolute",
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
      //   console.log("Playing...");
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
          //   console.log("Played!");
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
  //   console.log(result.text);
  chrome.storage.sync.set({
    ["text"]: result.text,
  });
  chrome.runtime.sendMessage({
    text: result.text,
  });
  try {
    // console.log("Is Copy");
    copyWord(result.text);
  } catch (err) {
    // console.log(err.message);
  }
};

function handleUIShowWord(word) {
  const head = document.querySelector("head");
  const newStyleTag = document.createElement("style");
  const innerNewStyleText = `
		.modal {
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: rgba(0, 0, 0, 0.3);
			opacity: 0;
			transition: opacity ease 0.6s;
		}

		.modal.open {
			opacity: 1;
		}

    .title {
      font-size: 28px;
    }

		.modal-content {
			width: 600px;
			max-width: calc(100% - 64px);
			min-height: 160px;
			display: flex;
      flex-direction: column;
			justify-content: center;
			align-items: center;
			background-color: #fff;
      border-radius: 20px;
			font-size: 24px;
			font-weight: 600;
			transform: translateY(-180px);
			opacity: 0;
			transition: all ease 0.6s;
		}

		.modal-content.open {
			transform: translateY(0);
			opacity: 1;
		}
	`;
  newStyleTag.innerHTML = innerNewStyleText;
  head.appendChild(newStyleTag);

  const body = document.querySelector("body");
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
		<div class="modal-content">
      <p class="title">You just said:</p>
      ${word}
    </div>
	`;
  body.appendChild(modal);
  const modalContent = document.querySelector(".modal-content");

  setTimeout(() => {
    modal.classList.add("open");
    modalContent.classList.add("open");
  }, 1000);

  setTimeout(() => {
    modal.classList.remove("open");
    modalContent.classList.remove("open");
  }, 4000);
}

function removeUIShowWord() {
  const body = document.querySelector("body");
  const modal = document.querySelector(".modal");
  setTimeout(() => {
    body.removeChild(modal);
  }, 6000)
}

function copyWord(word) {
  navigator.clipboard.writeText(word);
  handleUIShowWord(word);
  removeUIShowWord();
  // alert("Copied the text: " + word);
}
