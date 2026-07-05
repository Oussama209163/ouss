import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily to prevent startup crash if API key is missing.
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing on the server. Please check the Secrets panel in the Settings menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System Instruction that strictly guides the AI's behavior
const SYSTEM_INSTRUCTION = `You are "Ouss", the Customer Care Assistant for My Flex Health Malaysia.
My Flex Health Malaysia is an Australian-owned healthcare and training provider, established in 2005, with its Asian regional headquarters located in Kuala Lumpur, Malaysia.

Your mission is to provide professional, polite, and empathetic customer support to all inquiries about My Flex Health.

RULES OF ENGAGEMENT:
1. Always greet the customer politely and professionally in your responses (e.g., "Hello!", "Good day!", "Welcome to My Flex Health Malaysia!").
2. Always maintain a friendly, professional, confident, respectful, and caring demeanor. Use professional English (B2-C1).
3. Ask clarifying questions before making assumptions about the customer's needs. For example, if they inquire about home nursing, ask if they require short-term post-operative recovery or long-term eldercare support.
4. Keep responses clear, structured, and concise. Use clean bullet points or short paragraphs for readability.
5. NEVER make up company policies, procedures, or prices.
   - If a customer asks about prices, packages, or specific terms that you do not have on hand, politely advise them: "I do not have the exact pricing structure/policy on hand for this service, but I will check with our administration and care department. May I have your name, email, and phone number so that our team can get back to you with an official quote?"
6. Always thank the customer during the conversation (e.g., "Thank you for reaching out to us today.", "Thank you for sharing your concern.").
7. End every response by asking if there is anything else you can help them with (e.g., "Is there anything else I can assist you with today?", "Please let me know if there are any other questions you have!").

MY FLEX HEALTH MALAYSIA FACT SHEET:
- Services Offered:
  * Home Nursing & Eldercare: Skilled nursing (wound care, stoma care, injections, catheter care, medication management), post-hospitalization recovery, companion care, daily living assistance (bathing, mobility, feeding).
  * Caregiver Training: Certification courses, specialized eldercare training, and caregiver basic skills.
  * First Aid Training: CPR & AED training, Basic & Advanced First Aid (HRD Corp claimable for companies).
  * Clinical Services & Corporate Wellness: On-site health screening, vaccination programs, and medical surveillance for corporate clients.
- Office Hours: Monday to Friday, 9:00 AM to 6:00 PM (excluding public holidays).
- Contact Info:
  * Address: No. 2-1 & 2-2, Jalan Metro Pudu, Fraser Business Park, 55100 Kuala Lumpur, Malaysia.
  * Phone: +60 3 9226 2900
  * Email: info@myflexhealth.com
  * Website: www.myflexhealth.com
- Company Background: Australian-owned, operating in Malaysia since 2005, delivering high-quality training and home nursing services aligned with Australian healthcare standards.

CONVERSATION POSTURE:
- Respond in Markdown. Maintain double line breaks for paragraph separation.
- If they ask about services, explain the relevant service simply and clearly, then ask questions about their specific requirements (e.g., patient condition, location in Malaysia, timeline).
- Never claim to offer hospital stays or general surgery services; My Flex Health specializes in home nursing, clinic/wellness services, and training.
- Do not make up prices. Emphasize that customized care plans are built for each individual after a nurse assessment.
`;

// Smart Rule-Based Fallback Responder for Offline/No-API-Key usage
function getFallbackResponse(messages: any[]): string {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const query = lastMessage.toLowerCase();

  // Helper to check for keywords
  const contains = (...keys: string[]) => keys.some(key => query.includes(key));

  // 1. GREETING & BASICS
  if (contains("hello", "hi", "hey", "good day", "morning", "afternoon", "evening", "start", "welcome", "assalamu", "selamat")) {
    return `Hello and welcome back to My Flex Health Malaysia! Good day to you. 😊

My name is **Ouss**, your dedicated Customer Care Assistant. I am here to help you understand our specialized home care, eldercare services, caregiver training programs, first aid courses, and corporate wellness initiatives.

To help me provide the most helpful information for you, could you share a bit about:
* Are you looking for **home nursing care** for a family member, or are you interested in our **professional caregiver training or first aid certifications**?
* Where are you located in Malaysia?

Thank you for reaching out to us today. Is there anything else I can assist you with at this moment?`;
  }
  
  // 2. PRICING & COST
  if (contains("price", "cost", "rate", "how much", "charge", "package", "fee", "pay", "cheap", "expensive", "rm", "ringgit", "fees")) {
    return `Hello! Thank you for inquiring about our pricing and care rates.

At My Flex Health Malaysia, we believe in providing personalized, high-quality care tailored to each individual's unique clinical needs. Because of this, **our official company policy requires a clinical assessment by one of our senior nursing managers** before we can issue a customized care plan and quote. This ensures we match your loved one with the exact level of professional support they need.

To help us get back to you with an accurate estimate from our administration and care department, could you please share:
1. May I have your **full name, email address, and contact number**?
2. What is the current medical condition or clinical requirements of the patient?
3. Where is the patient located (e.g., Kuala Lumpur, Subang Jaya, Petaling Jaya)?

Alternatively, you are welcome to fill in the **Request Care Assessment** form on the right side of this screen with your name and phone number.

Thank you for your understanding. Once you share these details, we will have our care coordinator contact you within 24 business hours. Is there anything else I can help you with today?`;
  }
  
  // 3. HOME NURSING & ELDERCARE & DEMENTIA & STROKE
  if (contains("nurse", "nursing", "home care", "eldercare", "elderly", "wound", "diabetic", "stoma", "catheter", "stroke", "dementia", "patient", "companion", "bath", "recovery", "hospital", "father", "mother", "parent", "grandparent")) {
    return `Hello! Thank you for sharing your inquiry about our professional Home Nursing and Eldercare services.

We provide comprehensive, KKM-registered nursing care and daily living assistance directly in the comfort of your home, aligning with strict Australian clinical standards. Our home care services include:
* **Skilled Clinical Nursing**: Post-operative recovery, complex wound care (including diabetic wound dressing), stoma care, injections, catheterization, and medication administration.
* **Personal & Eldercare Support**: Assisted daily living (bathing, mobility support, safe feeding, companion care) to ensure your loved one's safety and comfort.

To help me tailor this information for you, may I ask:
* What is the current medical condition of your loved one, and do they have any specific clinical needs like wound care or mobility assistance?
* How many hours of care per day are you considering (e.g., short-term visits, 12-hour day shifts, or 24-hour round-the-clock support)?

Thank you for trusting My Flex Health. Is there anything else I can assist you with today?`;
  }
  
  // 4. CAREGIVER TRAINING & COURSES & CERTIFICATION
  if (contains("train", "course", "certif", "class", "study", "learn", "qualification", "career", "program", "caregiver training", "academy", "enroll", "student")) {
    return `Welcome! Thank you for your interest in our professional Caregiver Training programs.

My Flex Health Malaysia has been a leading training provider since 2005. We offer specialized training programs designed to equip you with essential hands-on skills aligned with Australian standards:
* **Professional Caregiver Certifications**: Covering fundamental eldercare, patient transfers, safety, nutrition, and psychological support.
* **Basic Skills for Families**: Designed specifically for family members who wish to care for their loved ones at home.

To help me provide the most relevant course schedule, could you please clarify:
* Are you seeking this certification for personal enrichment to care for a family member, or are you looking to start a professional career in healthcare?
* Would you prefer weekday or weekend schedules?

Thank you for reaching out to our training academy. Is there anything else I can help you with today?`;
  }
  
  // 5. FIRST AID & CPR & HRD CORP
  if (contains("first aid", "cpr", "aed", "choke", "resuscitation", "hrd corp", "hrdf", "claim", "emergency", "fire", "safety")) {
    return `Hello! Thank you for inquiring about our First Aid, CPR, and AED training courses.

My Flex Health Malaysia is an approved training provider, and our courses are fully **HRD Corp claimable** for registered companies under the Malaysian Human Resources Development Corporation. We provide:
* **Basic & Advanced First Aid**: Tailored for corporate safety teams, manufacturing sites, offices, and schools.
* **CPR & AED Training**: Hands-on practice using medical-grade manikins and simulated trainers.

To help me coordinate with our corporate training department, could you please share:
* Are you inquiring on behalf of a company looking to train a group of employees, or as an individual looking for personal certification?
* What is the estimated size of your training group?

Thank you for prioritizing safety. Is there anything else I can assist you with today?`;
  }
  
  // 6. CONTACT & PHONE & EMAIL & OFFICE
  if (contains("contact", "phone", "call", "email", "number", "tel", "reach", "write", "office", "speak", "customer service")) {
    return `Hello! Thank you for wanting to get in touch with us. We would be absolutely delighted to speak with you directly.

Here are our official contact details:
* **Phone Call Center**: [+60 3 9226 2900](tel:+60392262900)
* **General Email**: [info@myflexhealth.com](mailto:info@myflexhealth.com)
* **Office Hours**: Monday to Friday, 9:00 AM to 6:00 PM (Closed on weekends and public holidays).

Alternatively, you are welcome to fill in the **Request Care Assessment** form on the right side of this screen with your name and phone number. Our Senior Clinical Administrator will personally review your inquiry and call you back within 24 business hours.

Thank you again for reaching out. Is there anything else I can help you with today?`;
  }
  
  // 7. LOCATION & ADDRESS
  if (contains("location", "address", "where", "kuala lumpur", "kl", "hq", "branch", "place", "pudu", "fraser", "subang", "penang", "johor")) {
    return `Hello! Thank you for asking about our location.

Our Malaysian Regional Headquarters is located in Kuala Lumpur:
* **Address**: No. 2-1 & 2-2, Jalan Metro Pudu, Fraser Business Park, 55100 Kuala Lumpur, Malaysia.
* **Landmarks**: We are located in Fraser Business Park, which is highly accessible via public transport (near the Chan Sow Lin LRT station) and has convenient car parking.

We serve families across the Klang Valley (Kuala Lumpur, Selangor, Subang Jaya, Petaling Jaya, Shah Alam) as well as Penang and Johor Bahru.

Would you like to schedule an appointment to visit our office for a face-to-face consultation regarding home care or our caregiver courses? If so, please share your preferred day and time.

Thank you for your interest in visiting My Flex Health. Is there anything else I can assist you with today?`;
  }
  
  // 8. HOURS
  if (contains("hour", "time", "open", "close", "when", "saturday", "sunday", "holiday", "operating", "weekday", "weekend")) {
    return `Good day! Thank you for inquiring about our operating hours.

Our administrative office and care coordination center operate during these hours:
* **Monday to Friday**: 9:00 AM – 6:00 PM
* **Weekends & Public Holidays**: Closed

Please note that while our administrative office is closed on weekends, our **active home nursing care shifts** operate 24/7 as scheduled for our existing registered patients.

Would you like to schedule a call or a care assessment during our weekday operating hours?

Thank you for reaching out to us. Is there anything else I can assist you with?`;
  }

  // 9. GENERAL / UNKNOWN / HELP
  return `Hello! Thank you for sharing your message with me. 

I want to make sure I understand your exact needs perfectly. Could you please clarify if you are inquiring about:
* **Home Nursing & Eldercare** (such as specialized post-hospital wound care or daily companion assistance)?
* **Caregiver Training Certifications** (aligned with Australian standards)?
* **HRD Corp Claimable First Aid & CPR Courses**?

Please let me know a bit more details so I can provide the most helpful, professional guidance. You can also use the quick buttons at the top of the chat panel to query these services directly!

Thank you again for reaching out. Is there anything else I can help you with at this moment?`;
}

// API routes first
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    console.log(`[API] Received chat request. Message count: ${messages ? messages.length : 0}`);

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array provided." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.warn("[API] GEMINI_API_KEY is missing, empty, or set to a placeholder. Using smart local fallback responder.");
      const replyText = getFallbackResponse(messages);
      return res.json({ content: replyText });
    }

    // Filter messages to ensure the conversation history begins with a 'user' turn.
    // Gemini's generateContent API requires the first turn to be 'user' (it cannot start with 'model').
    let chatHistory = [...messages];
    while (chatHistory.length > 0 && chatHistory[0].role === "assistant") {
      chatHistory.shift();
    }

    if (chatHistory.length === 0) {
      return res.status(400).json({ error: "No user messages found to generate a response." });
    }

    // Format the history for the SDK contents parameter
    const contents = chatHistory.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    console.log(`[API] Calling Gemini with formatted contents (${contents.length} turns)...`);

    try {
      // Query Gemini
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I am here to assist you, but I could not formulate a response. Please let me know how I can help.";
      console.log("[API] Gemini successfully responded.");
      return res.json({ content: replyText });
    } catch (geminiError: any) {
      console.warn("[API] Gemini API call failed. Using smart local fallback responder. Error:", geminiError.message || geminiError);
      const replyText = getFallbackResponse(messages);
      return res.json({ content: replyText });
    }
  } catch (error: any) {
    console.error("[API] General Router Error:", error);
    return res.status(500).json({
      error: "An error occurred while processing the chat request.",
      details: error.message || String(error),
    });
  }
});

// Configure Vite middleware in development, serve static files in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
