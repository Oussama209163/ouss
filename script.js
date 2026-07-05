function openChat() {
  document.getElementById("chatBox").style.display = "flex";
}

function closeChat() {
  document.getElementById("chatBox").style.display = "none";
}

function sendMessage() {
  let input = document.getElementById("userInput");
  let text = input.value.trim().toLowerCase();

  if (text === "") return;

  let chatBody = document.getElementById("chatBody");

  // رسالة المستخدم
  let userMsg = document.createElement("p");
  userMsg.textContent = "You: " + text;
  userMsg.style.textAlign = "right";
  chatBody.appendChild(userMsg);

  input.value = "";

  // ردود خدمة العملاء
  let reply = "";

  if (text.includes("hello") || text.includes("hi")) {
    reply = "Hello 👋 Welcome to My Flex Health Support. How can I help you today?";
  }

  else if (text.includes("price") || text.includes("cost")) {
    reply = "Our services pricing depends on your needs. Please contact our support team via WhatsApp for details.";
  }

  else if (text.includes("service")) {
    reply = "We offer AI health guidance, fitness support, and customer assistance services.";
  }

  else if (text.includes("contact")) {
    reply = "You can contact us anytime via WhatsApp or the contact form below.";
  }

  else if (text.includes("problem") || text.includes("issue")) {
    reply = "Sorry for the inconvenience 😔 Please share your issue and our team will assist you shortly.";
  }

  else {
    reply = "Thank you for your message 🙏 Our support team will get back to you soon. You can also contact us on WhatsApp for faster response.";
  }

  // عرض الرد
  let botMsg = document.createElement("p");
  botMsg.textContent = "Support: " + reply;
  botMsg.style.color = "green";
  chatBody.appendChild(botMsg);

  chatBody.scrollTop = chatBody.scrollHeight;
}

Write to
