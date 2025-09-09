async function query(data) {
  try {
    const response = await fetch(
      "https://cloud.flowiseai.com/api/v1/prediction/1a848939-802f-4520-94c0-adf6306b9426",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    // Combine all possible error message fields
    const errorText = `${result.text || ""} ${
      result.message || ""
    }`.toLowerCase();

    const isBillingError =
      errorText.includes("status 402") ||
      errorText.includes("billing required") ||
      errorText.includes("replicate.com/account/billing") ||
      errorText.includes("payment required") ||
      response.status === 402;

    if (result.error || isBillingError) {
      throw new Error("Replicate billing required.");
    }

    return result;
  } catch (error) {
    console.error("API Error:", error);
    return { error: true, message: error.message || "Unknown error" };
  }
}

async function queryStylingTips(data) {
  try {
    const response = await fetch(
      "https://cloud.flowiseai.com/api/v1/prediction/be5c3e18-2c5f-4c87-81f4-aea3fcdbbd5f",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    const text = (result.text || "").toLowerCase();

    const isBillingError =
      text.includes("status 402") ||
      text.includes("billing required") ||
      text.includes("replicate.com/account/billing");

    if (result.error || isBillingError) {
      throw new Error("Replicate billing required.");
    }

    return result;
  } catch (error) {
    console.error("Styling API Error:", error);
    return { error: true, message: error.message || "Unknown error" };
  }
}

const textarea = document.getElementById("designPrompt");
const chat = document.getElementById("chatHistory");
const modelArea = document.getElementById("modelPlaceholder");
const heightSlider = document.getElementById("heightSlider");
const heightValue = document.getElementById("heightValue");
const measurementsInput = document.getElementById("measurements");
const skinToneSlider = document.getElementById("skinToneSlider");
const skinTonePreview = document.getElementById("skinTonePreview");
const regenerateBtn = document.getElementById("regenerateWithTips");
const gallery = document.getElementById("gallery");
const downloadBtn = document.getElementById("downloadImage");

let previousDesigns = [];
let lastPromptText = "";
let lastStylingTips = "";

function formatHeight(inches) {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
}

function describeBodyShape(measurements) {
  const [b, w, h] = measurements.split("-").map((m) => parseInt(m.trim()));
  if (!b || !w || !h) return "a standard body shape";
  if (b / w > 1.2 && h / w > 1.2) return "an hourglass-shaped figure";
  if (h > b && h / w > 1.2) return "a pear-shaped body";
  if (b > h && b / w > 1.2) return "an apple-shaped body";
  return "a rectangular body type";
}

function describeHeight(h) {
  h = parseInt(h);
  if (h < 60) return "a petite height";
  if (h <= 65) return "an average height";
  if (h <= 69) return "a tall height";
  return "a very tall height";
}

heightSlider.addEventListener("input", () => {
  heightValue.textContent = formatHeight(heightSlider.value);
});

skinToneSlider.addEventListener("input", () => {
  const v = skinToneSlider.value;
  const r = Math.round(241 - (241 - 141) * (v / 100));
  const g = Math.round(194 - (194 - 85) * (v / 100));
  const b = Math.round(125 - (125 - 36) * (v / 100));
  skinTonePreview.style.background = `rgb(${r}, ${g}, ${b})`;
});

textarea.addEventListener("keypress", async function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const userPrompt = textarea.value.trim();
    if (!userPrompt) return;

    regenerateBtn.style.display = "none";
    lastPromptText = userPrompt;
    lastStylingTips = "";

    const h = parseInt(heightSlider.value);
    const height = formatHeight(h);
    const heightDesc = describeHeight(h);
    const measurements = measurementsInput.value.trim() || "not specified";
    const bodyShape = describeBodyShape(measurements);
    const tone = skinToneSlider.value;
    const skinToneDesc = tone < 33 ? "fair" : tone > 66 ? "dark" : "medium";

    const fullPrompt = `${userPrompt}
Create a full-body fashion illustration of a character with ${bodyShape}, ${heightDesc} (${height}), and ${skinToneDesc} skin tone.
Show realistic body proportions and how the outfit fits.`;

    textarea.value = "";
    appendBubble(fullPrompt, "user");
    modelArea.textContent = "Designing...";
    modelArea.style.background = "radial-gradient(circle, #333, #111)";

    const imgRes = await query({ question: fullPrompt });

    if (imgRes.error) {
      appendBubble("❗ It looks like you've hit your usage limit.", "ai");
      modelArea.style.background = "#222";
      modelArea.textContent = "Image generation failed.";
      return;
    }

    const imgURL = extractImageUrl(imgRes.text);
    if (imgURL) {
      modelArea.style.background = `url('${imgURL}') no-repeat center/cover`;
      modelArea.textContent = "";
      typeEffect("Here’s what I crafted for you! ✨", "ai");
      showDownloadButton(imgURL);
      addToGallery(imgURL);

      const tipsRes = await queryStylingTips({ question: userPrompt });
      if (tipsRes.error) return;

      const tips = tipsRes.text || tipsRes.stylingTips || "";
      if (tips) {
        lastStylingTips = tips;
        typeEffect("Here are a few styling tips 💡", "ai");
        tips
          .split("\n")
          .filter((t) => t.trim() !== "")
          .forEach((tip, idx) => {
            setTimeout(() => typeEffect(`💡 ${tip}`, "ai"), 1000 * (idx + 1));
          });
        regenerateBtn.style.display = "block";
      }
    } else {
      modelArea.style.background = "#222";
      modelArea.textContent = "No image found.";
      appendBubble(
        "❗ Unable to generate an image at this moment. Please try again later.",
        "ai"
      );
    }
  }
});

regenerateBtn.addEventListener("click", async () => {
  if (!lastPromptText || !lastStylingTips) return;
  regenerateBtn.style.display = "none";

  const h = parseInt(heightSlider.value);
  const height = formatHeight(h);
  const heightDesc = describeHeight(h);
  const measurements = measurementsInput.value.trim() || "not specified";
  const bodyShape = describeBodyShape(measurements);
  const tone = skinToneSlider.value;
  const skinToneDesc = tone < 33 ? "fair" : tone > 66 ? "dark" : "medium";

  const combinedPrompt = `${lastPromptText}
Include these style details: ${lastStylingTips}
Create a full-body fashion illustration of a character with ${bodyShape}, ${heightDesc} (${height}), and ${skinToneDesc} skin tone.
Show realistic body proportions and how the outfit fits.`;

  appendBubble(combinedPrompt, "user");
  modelArea.textContent = "Regenerating...";
  modelArea.style.background = "radial-gradient(circle, #333, #111)";

  const res = await query({ question: combinedPrompt });

  if (res.error) {
    appendBubble(
      "❗ Unable to regenerate. Looks like you've reached your usage limit. Please check your billing or plan.",
      "ai"
    );
    modelArea.style.background = "#222";
    modelArea.textContent = "Image generation failed.";
    return;
  }

  const imgURL = extractImageUrl(res.text);
  if (imgURL) {
    modelArea.style.background = `url('${imgURL}') no-repeat center/cover`;
    modelArea.textContent = "";
    typeEffect(
      "Here's your updated look with the styling tips included! ✨",
      "ai"
    );
    showDownloadButton(imgURL);
    addToGallery(imgURL);

    const newTipsRes = await queryStylingTips({ question: combinedPrompt });
    if (newTipsRes.error) return;

    const newTips = newTipsRes.text || newTipsRes.stylingTips || "";
    if (newTips) {
      lastStylingTips = newTips;
      typeEffect(
        "Here are updated styling tips for the regenerated look 💡",
        "ai"
      );
      newTips
        .split("\n")
        .filter((t) => t.trim() !== "")
        .forEach((tip, idx) => {
          setTimeout(() => typeEffect(`💡 ${tip}`, "ai"), 1000 * (idx + 1));
        });
      regenerateBtn.style.display = "block";
    }
  } else {
    modelArea.style.background = "#222";
    modelArea.textContent = "Could not regenerate image.";
    appendBubble("❗ No image returned. Try again later.", "ai");
  }
});

function extractImageUrl(text) {
  const match = text.match(/https?:\/\/[\S]+?\.(jpg|jpeg|png|webp)/);
  return match ? match[0] : null;
}

function appendBubble(text, sender) {
  const b = document.createElement("div");
  b.className = `chat-bubble ${sender}`;
  b.textContent = text;
  chat.appendChild(b);
  chat.scrollTop = chat.scrollHeight;
}

function typeEffect(text, sender) {
  let i = 0;
  const b = document.createElement("div");
  b.className = `chat-bubble ${sender}`;
  chat.appendChild(b);
  const interval = setInterval(() => {
    b.textContent += text.charAt(i);
    i++;
    chat.scrollTop = chat.scrollHeight;
    if (i >= text.length) clearInterval(interval);
  }, 40);
}

function addToGallery(imageUrl) {
  previousDesigns.push(imageUrl);
  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.height = "90px";
  img.style.borderRadius = "10px";
  img.style.cursor = "pointer";
  img.title = "Click to view";
  img.onclick = () => {
    modelArea.style.background = `url('${imageUrl}') no-repeat center/cover`;
    modelArea.textContent = "";
    showDownloadButton(imageUrl);
    typeEffect("Here's the design you revisited 💫", "ai");
  };
  gallery.appendChild(img);
}

function showDownloadButton(imageUrl) {
  downloadBtn.style.display = "block";
  downloadBtn.onclick = async () => {
    try {
      const response = await fetch(imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "FashAura_Design.png";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Download failed. Try again.");
      console.error("Download error:", err);
    }
  };
}

// Voice Input
const micBtn = document.getElementById("micBtn");
micBtn.addEventListener("click", () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Sorry, your browser doesn't support speech recognition.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  micBtn.textContent = "🎙 Listening...";
  recognition.start();
  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    textarea.value = spokenText;
    micBtn.textContent = "🎤";
  };
  recognition.onerror = () => {
    micBtn.textContent = "🎤";
    alert("Couldn’t understand. Try again?");
  };
});

// Feedback Modal
function openFeedbackModal() {
  document.getElementById("feedbackPopupModal").style.display = "block";
}

function closeFeedbackModal() {
  document.getElementById("feedbackPopupModal").style.display = "none";
}

window.addEventListener("click", function (event) {
  const modal = document.getElementById("feedbackPopupModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
