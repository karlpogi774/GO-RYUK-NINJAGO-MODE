const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "7.0.0",
  hasPermission: 0,
  credits: "sinzu & Gemini",
  description: "Continuous background typing loop with auto-roast.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off",
  cooldowns: 2
};

const ADMIN_UIDS = [
  "61593892603402",
  "61594022290817",
  "61595507156493",
  "61595398037273"
];

const DATA_PATH = path.join(__dirname, "ryuk_loop_state.json");
const EMOJI = "😆";
let typingInterval = null;

const ROASTS = [
  "Luh, nag-type pa talaga siya oh, akala mo naman may kumpirmasyon. 💀 💯 🤪",
  "Lods, paki-delete na lang 'to bago pa makita ng iba, nakakahiya. 🤣 💯 🤪",
  "Lakas ng loob mo mag-chat, pero yung sinabi mo walang kwenta. 💯 🤪",
  "Sino nagtanong sa'yo? Lakas maka-main character ah. 💯 🤪",
  "Bro, isip muna bago pindot ng send button, napapahalata ka eh. 💯 🤪",
  "Sana bago ka nag-text, nag-isip ka muna ng limang beses. 💯 🤪",
  "Quiet ka na lang muna lods, nauubusan na kami ng patience sa'yo. 💯 🤪",
  "Yung utak mo parang data connection, laging slow at paminsan-minsan nawawala. 📡 💯 🤪"
];

function getState() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch (e) {}
  return { active: false, targetThread: null };
}

function saveState(state) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {}
}

function startContinuousTyping(api, threadID) {
  if (typingInterval) clearInterval(typingInterval);
  
  // Continuous Loop - magpa-ping ng typing every 4 seconds
  typingInterval = setInterval(() => {
    try {
      if (typeof api.sendTypingIndicator === "function") {
        api.sendTypingIndicator(threadID, () => {});
      }
    } catch (e) {}
  }, 4000);
}

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  const state = getState();

  // Auto resume sa background typing loop kung active
  if (state.active && state.targetThread && !typingInterval) {
    startContinuousTyping(api, state.targetThread);
  }

  if (!state.active || !body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  // Auto React
  try {
    api.setMessageReaction(EMOJI, messageID, () => {}, true);
  } catch (e) {}

  // Auto Roast Reply
  const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  api.sendMessage({
    body: randomRoast,
    mentions: [{ tag: `@${senderID}`, id: senderID }]
  }, threadID, messageID);
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();

  if (!ADMIN_UIDS.includes(String(senderID))) return;

  if (sub === "on") {
    saveState({ active: true, targetThread: threadID });
    startContinuousTyping(api, threadID);
    return api.sendMessage("🔥 Ryuk Continuous Typing Loop: ACTIVATED", threadID, messageID);
  }

  if (sub === "off") {
    saveState({ active: false, targetThread: null });
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    return api.sendMessage("✅ Ryuk Continuous Typing Loop: TURNED OFF", threadID, messageID);
  }

  return api.sendMessage("Usage: /ryuk on | off", threadID, messageID);
};
