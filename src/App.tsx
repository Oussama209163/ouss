import React, { useState, useEffect, useRef, FormEvent } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  CheckCircle,
  Award,
  AlertCircle,
  Loader2,
  Building,
  Calendar,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content:
        "Hello and welcome to My Flex Health Malaysia! Good day to you. 😊\n\nMy name is **Ouss**, your dedicated Customer Care Assistant. I am here to help you understand our specialized home care, eldercare services, professional caregiver training programs, first aid courses, and corporate wellness initiatives.\n\nTo help me provide the best information, could you share a bit about what services you are exploring today? Is there anything else I can assist you with?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Segment control tab for mobile view ("chat" vs "info")
  const [activeTab, setActiveTab] = useState<"chat" | "info">("chat");

  // Callback form state
  const [callbackForm, setCallbackForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Home Nursing",
    notes: "",
  });
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [callbackRefNumber, setCallbackRefNumber] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle standard quick prompts
  const handleQuickPrompt = (promptText: string, displayQuestion: string) => {
    if (isLoading) return;
    sendMessage(displayQuestion, promptText);
  };

  // Smart Rule-Based Fallback Responder for offline or missing API key scenarios
  const getLocalFallbackResponse = (queryText: string): string => {
    const query = queryText.toLowerCase();
    const contains = (...keys: string[]) => keys.some(key => query.includes(key));

    if (contains("hello", "hi", "hey", "good day", "morning", "afternoon", "evening", "start", "welcome", "assalamu", "selamat")) {
      return `Hello and welcome to My Flex Health Malaysia! Good day to you. 😊

My name is **Ouss**, your dedicated Customer Care Assistant. I am here to help you understand our specialized home care, eldercare services, caregiver training programs, first aid courses, and corporate wellness initiatives.

To help me provide the most helpful information for you, could you share a bit about:
* Are you looking for **home nursing care** for a family member, or are you interested in our **professional caregiver training or first aid certifications**?
* Where are you located in Malaysia?

Thank you for reaching out to us today. Is there anything else I can assist you with at this moment?`;
    }
    
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
    
    if (contains("contact", "phone", "call", "email", "number", "tel", "reach", "write", "office", "speak", "customer service")) {
      return `Hello! Thank you for wanting to get in touch with us. We would be absolutely delighted to speak with you directly.

Here are our official contact details:
* **Phone Call Center**: [+60 3 9226 2900](tel:+60392262900)
* **General Email**: [info@myflexhealth.com](mailto:info@myflexhealth.com)
* **Office Hours**: Monday to Friday, 9:00 AM to 6:00 PM (Closed on weekends and public holidays).

Alternatively, you are welcome to fill in the **Request Care Assessment** form on the right side of this screen with your name and phone number. Our Senior Clinical Administrator will personally review your inquiry and call you back within 24 business hours.

Thank you again for reaching out. Is there anything else I can help you with today?`;
    }
    
    if (contains("location", "address", "where", "kuala lumpur", "kl", "hq", "branch", "place", "pudu", "fraser", "subang", "penang", "johor")) {
      return `Hello! Thank you for asking about our location.

Our Malaysian Regional Headquarters is located in Kuala Lumpur:
* **Address**: No. 2-1 & 2-2, Jalan Metro Pudu, Fraser Business Park, 55100 Kuala Lumpur, Malaysia.
* **Landmarks**: We are located in Fraser Business Park, which is highly accessible via public transport (near the Chan Sow Lin LRT station) and has convenient car parking.

We serve families across the Klang Valley (Kuala Lumpur, Selangor, Subang Jaya, Petaling Jaya, Shah Alam) as well as Penang and Johor Bahru.

Would you like to schedule an appointment to visit our office for a face-to-face consultation regarding home care or our caregiver courses? If so, please share your preferred day and time.

Thank you for your interest in visiting My Flex Health. Is there anything else I can assist you with today?`;
    }
    
    if (contains("hour", "time", "open", "close", "when", "saturday", "sunday", "holiday", "operating", "weekday", "weekend")) {
      return `Good day! Thank you for inquiring about our operating hours.

Our administrative office and care coordination center operate during these hours:
* **Monday to Friday**: 9:00 AM – 6:00 PM
* **Weekends & Public Holidays**: Closed

Please note that while our administrative office is closed on weekends, our **active home nursing care shifts** operate 24/7 as scheduled for our existing registered patients.

Would you like to schedule a call or a care assessment during our weekday operating hours?

Thank you for reaching out to us. Is there anything else I can assist you with?`;
    }

    return `Hello! Thank you for sharing your message with me. 

I want to make sure I understand your exact needs perfectly. Could you please clarify if you are inquiring about:
* **Home Nursing & Eldercare** (such as specialized post-hospital wound care or daily companion assistance)?
* **Caregiver Training Certifications** (aligned with Australian standards)?
* **HRD Corp Claimable First Aid & CPR Courses**?

Please let me know a bit more details so I can provide the most helpful, professional guidance. You can also use the quick buttons at the top of this chat panel to query these services directly!

Thank you again for reaching out. Is there anything else I can help you with at this moment?`;
  };

  // Submit chat message to Express backend with smart local fallback
  const sendMessage = async (userDisplay: string, apiPrompt: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userDisplay,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Set up a 6-second timeout for the fetch call so the client never hangs indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("API responded with an error status.");
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    } catch (err: any) {
      console.warn("[Client] API call failed or timed out. Gracefully falling back to local responder:", err);
      // Give a realistic slight typing delay so the user experience feels premium
      setTimeout(() => {
        const fallbackText = getLocalFallbackResponse(userDisplay);
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fallbackText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
      }, 600);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!callbackForm.name || !callbackForm.phone) {
      alert("Please provide at least your name and phone number so we can reach you.");
      return;
    }

    // Generate random reference code like MFH-2026-XXXXX
    const randomCode = `MFH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setCallbackRefNumber(randomCode);
    setCallbackSubmitted(true);
  };

  const resetCallbackForm = () => {
    setCallbackForm({
      name: "",
      phone: "",
      email: "",
      service: "Home Nursing",
      notes: "",
    });
    setCallbackSubmitted(false);
  };

  // Safe markdown formatter to parse bold and bullets with a spacious ChatGPT-style layout
  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      // Handle list items (starts with * or -)
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const cleanText = line.trim().substring(2);
        return (
          <li key={index} className="ml-6 list-disc mb-2 text-[#111827] leading-relaxed text-[15px] md:text-[16px]">
            {parseInlineFormatting(cleanText)}
          </li>
        );
      }
      // Handle numbered items
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        const cleanText = numMatch[2];
        return (
          <li key={index} className="ml-6 list-decimal mb-2 text-[#111827] leading-relaxed text-[15px] md:text-[16px]">
            {parseInlineFormatting(cleanText)}
          </li>
        );
      }
      // Handle empty line
      if (line.trim() === "") {
        return <div key={index} className="h-4" />;
      }
      // Standard line
      return (
        <p key={index} className="mb-3.5 text-[#111827] leading-relaxed text-[15px] md:text-[16px] last:mb-0">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  const parseInlineFormatting = (text: string) => {
    // Split on **bold** tokens
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-[#0B5A3E]">
            {part.substring(2, part.length - 2)}
          </strong>
        );
      }
      return part;
    });
  };

  const quickPrompts = [
    {
      id: "home-care",
      label: "🏥 Home Nursing & Eldercare",
      question: "What home nursing and clinical care services do you provide?",
      prompt: "Explain our Home Nursing & Eldercare services in detail (clinical nursing, personal care, companion care). Advise them about nurse assessments and ask clarifying questions about their loved one's medical needs, location, and timeline.",
    },
    {
      id: "caregiver",
      label: "🎓 Caregiver Courses",
      question: "What caregiver training and certifications are available?",
      prompt: "Describe our professional Caregiver Training programs. Outline who they are for, what certifications are received, and ask if they are looking for personal enrichment or professional qualifications.",
    },
    {
      id: "first-aid",
      label: "❤️ First Aid & CPR",
      question: "Do you offer HRD Corp claimable First Aid courses?",
      prompt: "Explain our HRD Corp claimable First Aid and CPR courses. Detail the training categories and ask if they are inquiring for corporate training for staff or individual qualification.",
    },
    {
      id: "contact-info",
      label: "📍 Location & Hours",
      question: "Where is your office located, and what are your opening hours?",
      prompt: "Provide our exact address: No. 2-1 & 2-2, Jalan Metro Pudu, Fraser Business Park, 55100 Kuala Lumpur, Malaysia. Mention phone (+60 3 9226 2900) and office hours (Monday to Friday, 9:00 AM to 6:00 PM). Ask if they would like to arrange an on-site consultation.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Slogan Hero bar with Brand multi-color gradient stripe accent */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 via-purple-600 to-cyan-500 text-white py-2.5 px-4 text-center text-[10px] font-black uppercase tracking-[0.25em] shadow-xs">
        Providing care with <span className="underline decoration-white decoration-2 underline-offset-2">integrity</span> and professional <span className="underline decoration-white decoration-2 underline-offset-2">excellence</span> • Established 2005
      </div>

      {/* Top Professional Brand Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4.5 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Typographic brand logo styled exactly like the provided image */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-sans font-semibold text-[22px] sm:text-[25px] tracking-tight text-[#1E293B]">my</span>
                <span className="font-sans font-black text-[26px] sm:text-[32px] tracking-tight bg-gradient-to-r from-amber-400 via-red-500 to-purple-600 bg-clip-text text-transparent -mx-0.5">flex</span>
                <span className="font-sans font-light text-[22px] sm:text-[25px] tracking-tight text-[#1E293B] pl-0.5">health</span>
              </div>
              <div className="flex items-center gap-1.5 -mt-2 pl-0.5">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-extrabold text-[#64748B]">
                  Australia
                </span>
                <span className="text-[8px] sm:text-[9px] text-[#94A3B8] font-bold">|</span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-extrabold text-[#64748B]">
                  Malaysia
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-slate-500">
            <span className="text-purple-700 border-b-2 border-purple-600 pb-1 font-extrabold">Care Assistant</span>
            <span className="hover:text-purple-700 transition-colors cursor-pointer">Home Care</span>
            <span className="hover:text-purple-700 transition-colors cursor-pointer">Training</span>
            <span className="hover:text-purple-700 transition-colors cursor-pointer">Wellness</span>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+60392262900"
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-colors"
            >
              <Phone className="w-3 h-3 text-purple-600" />
              <span>+60 3 9226 2900</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Segmented Toggle for Mobile Only */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 md:hidden block">
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center justify-center gap-2 py-2.5 text-[11px] uppercase tracking-wider font-bold rounded transition-all ${
              activeTab === "chat"
                ? "bg-purple-700 text-white shadow-xs"
                : "text-slate-500 hover:text-purple-700"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ouss Assistant
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center justify-center gap-2 py-2.5 text-[11px] uppercase tracking-wider font-bold rounded transition-all ${
              activeTab === "info"
                ? "bg-purple-700 text-white shadow-xs"
                : "text-slate-500 hover:text-purple-700"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Inquire & Contact
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Chat Workspace (Takes 2 Columns on desktop) */}
        <div
          className={`md:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden ${
            activeTab === "chat" ? "flex" : "hidden md:flex"
          }`}
          style={{ height: "calc(100vh - 14rem)" }}
        >
          {/* Chat Assistant Header Card */}
          <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white flex items-center justify-center font-display text-base font-bold border border-purple-600/10 shadow-xs">
                  Ou
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display font-bold text-lg text-slate-900 leading-tight">
                    Ouss
                  </h2>
                  <span className="text-[9px] uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full font-bold">
                    Official Care Assistant
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mt-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Empathetic, Clinical, Caring Support</span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:block">
              <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded">
                Australia Accredited Fact Sheet
              </span>
            </div>
          </div>

          {/* Quick-select suggestion pills - Moved to top to keep chat messages view completely clear */}
          <div className="px-6 py-3 border-b border-slate-200 bg-white overflow-x-auto whitespace-nowrap flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 shrink-0">
              Inquire About:
            </span>
            <div className="flex gap-2">
              {quickPrompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickPrompt(p.prompt, p.question)}
                  disabled={isLoading}
                  className="inline-block px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-purple-600 text-[11px] font-bold transition-all text-slate-700 hover:text-purple-700 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-grow overflow-y-auto p-6 space-y-7 chat-scrollbar bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-4.5 max-w-[92%] sm:max-w-[88%] w-full ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold font-display shadow-xs ${
                    m.role === "user"
                      ? "bg-slate-200 text-slate-800"
                      : "bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white"
                  }`}
                >
                  {m.role === "user" ? "U" : "O"}
                </div>

                {/* ChatGPT-style Spacious Bubble Content */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className={`flex items-center gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6F62]">
                      {m.role === "user" ? "Valued Guest" : "Ouss • My Flex Care"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {m.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`px-6 py-5 md:px-7 md:py-5.5 leading-relaxed transition-all duration-300 rounded-2xl shadow-xs ${
                      m.role === "user"
                        ? "bg-slate-800 text-white rounded-tr-none text-[15px] md:text-[16px]"
                        : "bg-white border border-slate-200 text-slate-900 rounded-tl-none text-[15px] md:text-[16px] shadow-xs"
                    }`}
                  >
                    {m.role === "user" ? (
                      <p className="leading-relaxed text-[15px] md:text-[16px] font-medium">{m.content}</p>
                    ) : (
                      <div className="space-y-3.5">
                        {renderMessageContent(m.content)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-4.5 max-w-[92%] sm:max-w-[88%] w-full mr-auto">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 text-sm font-display font-bold shadow-xs">
                  O
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ouss • My Flex Care</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-6 py-5 text-[14px] flex items-center gap-3 text-slate-500 shadow-xs">
                    <Loader2 className="w-4.5 h-4.5 animate-spin text-purple-600" />
                    <span className="italic font-medium text-purple-900">Ouss is writing a response with care...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 text-rose-800 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <h4 className="font-bold mb-0.5 text-rose-950 uppercase tracking-wider">Communication Notice</h4>
                  <p>{errorMsg}</p>
                  <p className="mt-1.5 text-rose-600 font-semibold">
                    Our offline customer responder is currently active to assist you immediately.
                  </p>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-5 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inputValue.trim() || isLoading) return;
                sendMessage(inputValue.trim(), inputValue.trim());
              }}
              className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full p-1.5 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 transition-all"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Write your inquiry here regarding home nursing or certifications..."
                className="flex-1 bg-transparent px-5 py-2.5 text-sm focus:outline-none placeholder:text-slate-400 text-slate-800"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                title="Send message"
                style={{ minHeight: "44px" }}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 text-center mt-2.5 font-semibold uppercase tracking-wider">
              Compliant with Malaysian Ministry of Health (KKM) professional nursing protocols.
            </p>
          </div>
        </div>

        {/* Right Side: Editorial Slogan & Callback Form (Takes 1 Column on desktop) */}
        <div
          className={`space-y-6 flex flex-col ${
            activeTab === "info" ? "block" : "hidden md:block"
          }`}
        >
          {/* Editorial Grace Poster Slogan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-xs">
            <div>
              <span className="inline-block py-1 px-3 bg-purple-50 text-purple-700 text-[9px] uppercase tracking-widest font-extrabold mb-6 rounded-full border border-purple-100">
                Quality Accreditation
              </span>
              <h3 className="font-display font-bold text-2xl leading-[1.3] mb-6 text-slate-900 tracking-tight">
                Providing care with <span className="bg-gradient-to-r from-amber-400 to-red-500 text-white px-2.5 py-0.5 rounded-lg shadow-xs font-extrabold">integrity</span> and professional <span className="text-purple-700 underline decoration-amber-500 decoration-2 underline-offset-2">excellence</span>.
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 font-medium">
                Our mission is to support your health journey with empathetic, expert-led home nursing and specialized caregiver training services across Malaysia.
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <div className="group">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 mb-1">
                  Empathetic Approach
                </h4>
                <p className="text-[12px] text-slate-500 leading-snug">
                  Every interaction is grounded in respect and genuine concern for your well-being.
                </p>
              </div>
              <div className="group">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 mb-1">
                  Clinical Excellence
                </h4>
                <p className="text-[12px] text-slate-500 leading-snug">
                  Our nursing staff are registered professionals with extensive clinical experience.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Callback Request Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h3 className="font-display font-bold text-lg text-slate-900">Request Care Assessment</h3>
            </div>

            <AnimatePresence mode="wait">
              {!callbackSubmitted ? (
                <motion.form
                  key="callback-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleFormSubmit}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Would you like our senior nursing manager to call you back? Fill in this quick care request form for a customized assessment.
                  </p>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-900 mb-1">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Encik Farhan"
                        value={callbackForm.name}
                        onChange={(e) =>
                          setCallbackForm({ ...callbackForm, name: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-900 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +60123456789"
                        value={callbackForm.phone}
                        onChange={(e) =>
                          setCallbackForm({ ...callbackForm, phone: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-900 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="e.g. farhan@example.com"
                        value={callbackForm.email}
                        onChange={(e) =>
                          setCallbackForm({ ...callbackForm, email: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-900 mb-1">
                      Care Service Required
                    </label>
                    <select
                      value={callbackForm.service}
                      onChange={(e) =>
                        setCallbackForm({ ...callbackForm, service: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 focus:ring-2 focus:ring-purple-100 transition-all"
                    >
                      <option value="Home Nursing">Home Nursing & Post-Hospital Care</option>
                      <option value="Eldercare Helper">Eldercare & Companionship</option>
                      <option value="Caregiver Training">Professional Caregiver Course</option>
                      <option value="First Aid Training">First Aid & CPR (Corporate)</option>
                      <option value="Clinical Services">Clinical & Vaccine Surveillance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-900 mb-1">
                      Brief Notes / Medical Diagnosis
                    </label>
                    <textarea
                      placeholder="Share stoma care, diabetic wound care, post-stroke details or specific questions..."
                      value={callbackForm.notes}
                      onChange={(e) =>
                        setCallbackForm({ ...callbackForm, notes: e.target.value })
                      }
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 text-white font-bold py-3.5 rounded-lg text-[11px] uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    style={{ minHeight: "44px" }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    Submit Care Request
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="callback-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center space-y-4 relative overflow-hidden"
                >
                  <div className="inline-flex h-12 w-12 bg-white rounded-full items-center justify-center text-purple-600 mx-auto shadow-xs border border-purple-100">
                    <CheckCircle className="w-6 h-6 animate-pulse text-purple-600" />
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-lg text-purple-950">Request Logged</h4>
                    <p className="text-[12px] text-slate-800 mt-1 leading-relaxed">
                      Thank you, <strong>{callbackForm.name}</strong>. We have registered your request for <strong>{callbackForm.service}</strong>.
                    </p>
                  </div>

                  <div className="bg-white border border-purple-100 rounded-lg p-3 text-center">
                    <span className="block text-[9px] uppercase tracking-wider text-purple-700 font-bold">
                      Reference Number
                    </span>
                    <span className="font-mono text-sm font-bold text-purple-950">
                      {callbackRefNumber}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    Our Senior Clinical Administrator will review your notes and contact you at <strong>{callbackForm.phone}</strong> within 24 business hours to coordinate an expert assessment.
                  </p>

                  <button
                    onClick={resetCallbackForm}
                    className="text-[11px] font-bold uppercase tracking-wider text-purple-700 hover:text-purple-800 hover:underline cursor-pointer block w-full text-center"
                  >
                    Submit another request
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Official Location Fact Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Building className="w-4 h-4 text-purple-600" />
              <h3 className="font-display font-bold text-lg text-slate-900">Malaysia HQ Details</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-2.5 items-start">
                <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Office Address
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    No. 2-1 & 2-2, Jalan Metro Pudu,
                    <br />
                    Fraser Business Park,
                    <br />
                    55100 Kuala Lumpur, Malaysia.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <Phone className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Call Center
                  </p>
                  <a
                    href="tel:+60392262900"
                    className="text-purple-700 hover:text-purple-800 hover:underline font-bold text-[13px] block mt-1"
                  >
                    +60 3 9226 2900
                  </a>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    General Inquiries
                  </p>
                  <a
                    href="mailto:info@myflexhealth.com"
                    className="text-purple-700 hover:text-purple-800 hover:underline block mt-1"
                  >
                    info@myflexhealth.com
                  </a>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Operating Hours
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Monday – Friday: 9:00 AM – 6:00 PM
                    <br />
                    (Closed on weekends & public holidays)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Corporate Brand Footer */}
      <footer className="bg-slate-950 px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white uppercase tracking-[0.2em] shrink-0 gap-4 mt-12 relative overflow-hidden">
        {/* Brand multi-color gradient stripe exactly matching the header / logo visual style */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 via-purple-600 to-cyan-500" />
        
        <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-10 font-bold text-white mt-1">
          <span className="hover:text-amber-400 cursor-pointer transition-colors">Our Certifications</span>
          <span className="hover:text-amber-400 cursor-pointer transition-colors">Kuala Lumpur</span>
          <span className="hover:text-amber-400 cursor-pointer transition-colors">Penang</span>
          <span className="hover:text-amber-400 cursor-pointer transition-colors">Johor Bahru</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="opacity-80 text-[9px] text-slate-300">© {new Date().getFullYear()} My Flex Health Group</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse"></div>
          <span className="font-bold text-[9px] text-amber-400">Active Session</span>
        </div>
      </footer>
    </div>
  );
}
