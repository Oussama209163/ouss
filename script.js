function openChat() {
  document.getElementById("chatBox").style.display = "flex";
}

function closeChat() {
  document.getElementById("chatBox").style.display = "none";
}

async function sendMessage() {
  let input = document.getElementById("userInput");
  let text = input.value;

  if (text.trim() === "") return;

  let chatBody = document.getElementById("chatBody");

  // عرض رسالة المستخدم
  let userMsg = document.createElement("p");
  userMsg.textContent = "You: " + text;
  userMsg.style.textAlign = "right";
  chatBody.appendChild(userMsg);

  input.value = "";

  // رسالة تحميل
  let loadingMsg = document.createElement("p");
  loadingMsg.textContent = "AI is typing...";
  loadingMsg.style.color = "gray";
  chatBody.appendChild(loadingMsg);

  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful health assistant." },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();

    let reply = data.choices[0].message.content;

    loadingMsg.remove();

    let botMsg = document.createElement("p");
    botMsg.textContent = "AI: " + reply;
    botMsg.style.color = "green";

    chatBody.appendChild(botMsg);

    chatBody.scrollTop = chatBody.scrollHeight;

  } catch (error) {
    loadingMsg.remove();

    let errorMsg = document.createElement("p");
    errorMsg.textContent = "AI: Error connecting to server.";
    errorMsg.style.color = "red";
    chatBody.appendChild(errorMsg);
  }
}
