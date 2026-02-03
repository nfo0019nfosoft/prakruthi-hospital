document.addEventListener("DOMContentLoaded", () => {

  /* ================= EMAILJS INIT ================= */
  emailjs.init("v2VvWHO-dN87FZVZK");

  /* ================= ELEMENTS ================= */
  const chatbotBox = document.getElementById("chatbot-box");
  const toggleBtn = document.getElementById("chatbot-toggle");
  const closeBtn = document.getElementById("chatbot-close");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-input");
  const body = document.getElementById("chatbot-body");
  const endChatBtn = document.getElementById("end-chat");
  const quickActions = document.getElementById("quick-actions");

  if (!chatbotBox || !body || !endChatBtn) {
    console.error("Chatbot elements missing");
    return;
  }

  /* ================= CHAT ID ================= */
  function generateChatId() {
    const now = new Date();
    return `PH-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}-${Date.now()}`;
  }
  const chatId = generateChatId();

  /* ================= CHAT HISTORY ================= */
  let chatHistory = [];

  /* ================= BOT STATE ================= */
  let botState = "WELCOME";
  let appointmentData = {
    department: "",
    name: "",
    phone: ""
  };

  /* ================= GREETING ================= */
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning ☀️";
    if (hour < 17) return "Good afternoon 🌤️";
    return "Good evening 🌙";
  }

  /* ================= AUTO OPEN ================= */
  setTimeout(() => {
    chatbotBox.style.display = "flex";

    addMessage(
      `${getGreeting()} 👋
Welcome to Prakruthi Hospital.
How can I help you today?`,
      "bot-msg"
    );

    showQuickActions("welcome");
  }, 800);

  /* ================= QUICK ACTIONS ================= */
  function showQuickActions(type) {
    quickActions.innerHTML = "";
    let buttons = "";

    if (type === "welcome") {
      buttons = `
        <button data-action="appointment">📅 Book Appointment</button>
        <button data-action="emergency">🚨 Emergency</button>
        <button data-action="location">📍 Location</button>
      `;
    }

    if (type === "department") {
      buttons = `
        <button data-action="dept_gyn">👩‍⚕️ Women’s Health (Gynaecology)</button>
        <button data-action="dept_obs">🤰 Pregnancy Care (Obstetrics)</button>
        <button data-action="dept_general">🩺 General Surgery</button>
        <button data-action="dept_unsure">❓ Not sure / Need guidance</button>
      `;
    }

    if (type === "confirm") {
      buttons = `
        <button data-action="confirm">✅ Confirm Appointment</button>
        <button data-action="change">✏️ Change Details</button>
        <button data-action="call">📞 Call Hospital</button>
      `;
    }

    if (type === "post_info") {
      buttons = `
        <button data-action="appointment">📅 Book Appointment</button>
        <button data-action="end">No, thank you</button>
      `;
    }

    quickActions.innerHTML = buttons;

    quickActions.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        quickActions.innerHTML = "";
        processMessage(btn.dataset.action);
      };
    });

    body.appendChild(quickActions);
    body.scrollTop = body.scrollHeight;
  }

  /* ================= MESSAGE SEND ================= */
  sendBtn.onclick = () => {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    processMessage(msg);
  };

  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendBtn.click();
  });

  /* ================= MESSAGE HANDLER ================= */
  function processMessage(msg) {
    addMessage(msg, "user-msg");

    chatHistory.push({
      sender: "User",
      message: msg,
      time: new Date().toLocaleTimeString()
    });

    setTimeout(() => {
      const reply = getBotReply(msg);

      addMessage(reply, "bot-msg");

      chatHistory.push({
        sender: "Bot",
        message: reply,
        time: new Date().toLocaleTimeString()
      });
    }, 400);
  }

  /* ================= BOT LOGIC ================= */
  function getBotReply(msg) {
    msg = msg.toLowerCase();

    /* ---- APPOINTMENT START ---- */
    if (msg === "appointment") {
      botState = "APPT_DEPT";
      setTimeout(() => showQuickActions("department"), 300);
      return "Sure 🙂 Please choose the type of care you are looking for:";
    }

    /* ---- DEPARTMENT SELECTION ---- */
    if (msg.startsWith("dept_")) {
      if (msg === "dept_gyn") appointmentData.department = "Gynaecology";
      if (msg === "dept_obs") appointmentData.department = "Obstetrics";
      if (msg === "dept_general") appointmentData.department = "General Surgery";
      if (msg === "dept_unsure") appointmentData.department = "General Consultation";

      botState = "APPT_NAME";
      return "Thank you. May I have your full name, please?";
    }

    /* ---- NAME ---- */
    if (botState === "APPT_NAME") {
      appointmentData.name = msg;
      botState = "APPT_PHONE";
      return "And your mobile number, please?";
    }

    /* ---- PHONE ---- */
    if (botState === "APPT_PHONE") {
      appointmentData.phone = msg;
      botState = "APPT_CONFIRM";

      setTimeout(() => showQuickActions("confirm"), 300);

      return `Please confirm the details below:

Department: ${appointmentData.department}
Name: ${appointmentData.name}
Phone: ${appointmentData.phone}`;
    }

    /* ---- CONFIRM ---- */
    if (msg === "confirm") {
      botState = "DONE";
      setTimeout(() => showQuickActions("post_info"), 300);
      return `✅ Your appointment request has been shared with our team.
We will contact you shortly.`;
    }

    if (msg === "change") {
      botState = "APPT_DEPT";
      setTimeout(() => showQuickActions("department"), 300);
      return "No problem 🙂 Please select the department again.";
    }

    /* ---- LOCATION ---- */
    if (msg.includes("location")) {
      setTimeout(() => showQuickActions("post_info"), 300);
      return `📍 Prakruthi Hospital
Vegetable Market Road,
Huzurabad`;
    }

    /* ---- EMERGENCY ---- */
    if (msg.includes("emergency")) {
      setTimeout(() => showQuickActions("post_info"), 300);
      return `🚨 This may need immediate medical attention.
Please call us now:
📞 +91 99110 50572`;
    }

    /* ---- CALL ---- */
    if (msg.includes("call")) {
      setTimeout(() => showQuickActions("post_info"), 300);
      return `📞 You can call us directly:
+91 99110 50572`;
    }

    /* ---- DEFAULT ---- */
    setTimeout(() => showQuickActions("welcome"), 300);
    return "I’m here to help you with appointments, location, or emergency assistance.";
  }

  /* ================= ADD MESSAGE ================= */
  function addMessage(text, className) {
    const div = document.createElement("div");
    div.className = className;
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  /* ================= FORMAT CHAT ================= */
  function formatChatHistory() {
    return chatHistory
      .map(c => `[${c.time}] ${c.sender}: ${c.message}`)
      .join("\n");
  }

  /* ================= SEND EMAIL ================= */
  function sendChatToHospital() {
    const conversationText = formatChatHistory();
    emailjs.send(
      "service_friwemt",
      "template_cxyv8yf",
      {
        chat_id: chatId,
        conversation: conversationText
      }
    );
  }

  /* ================= END CHAT ================= */
  endChatBtn.onclick = () => {
    if (chatHistory.length) sendChatToHospital();
    chatbotBox.style.display = "none";
  };

});
