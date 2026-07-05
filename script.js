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
    }

});
