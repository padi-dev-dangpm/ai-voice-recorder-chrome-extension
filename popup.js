document.addEventListener("DOMContentLoaded", async () => {
  const openBtn = document.querySelector(".open-btn");
  const closeBtn = document.querySelector(".close-btn");

  const p = document.querySelector(".show-state");
  const microImg = document.querySelector(".caption-img");

  openBtn.addEventListener("click", () => {
    microImg.src = "./assets/podcast.gif";

    chrome.runtime.sendMessage({
      type: "RECORD",
    });
  });

  closeBtn.addEventListener("click", () => {
    microImg.src = "./assets/podcast.png";

    chrome.runtime.sendMessage({
      type: "STOP",
    });
  });

  const data = await new Promise((resolve) => {
    chrome.storage.sync.get(["text"], (obj) => {
      resolve(obj["text"] ? obj["text"] : []);
    });
  });

  p.innerHTML = `You just said: ${data}`;
});
