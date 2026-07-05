document.addEventListener("DOMContentLoaded", function () {

    const chatButton = document.getElementById("startChat");

    if (chatButton) {
        chatButton.addEventListener("click", function () {

            alert(
`Welcome to My Flex Health AI Assistant!

This AI assistant is dedicated to helping you with:

• Elderly Care
• Home Nursing
• Caregivers
• Physiotherapy
• Dementia Care
• Palliative Care
• Home Healthcare Services

AI chat integration is coming soon.`
            );

        });
    }function openChat() {
  document.getElementById("chatBox").style.display = "flex";
}

function closeChat() {
  document.getElementById("chatBox").style.display = "none";
}

function sendMessage() {
  let input = document.getElementById("userInput");
  let text = input.value;

  if (text.trim() === "") return;

  let chatBody = document.getElementById("chatBody");

  let userMsg = document.createElement("p");
  userMsg.textContent = text;
  userMsg.style.textAlign = "right";
  chatBody.appendChild(userMsg);

  let botMsg = document.createElement("p");
  botMsg.textContent = "AI: Thanks for your message. (Demo mode)";
  botMsg.style.color = "green";
  chatBody.appendChild(botMsg);

  input.value = "";
  chatBody.scrollTop = chatBody.scrollHeight;
}
Sent
Compose
Write to


});
