const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "8.1.0",
  hasPermission: 0,
  credits: "sinzu & Gemini",
  description: "Ryuk Bot with 10s delay, 😆 reaction, and roast lines.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status",
  cooldowns: 5
};

const ADMIN_UIDS = [
  "61593892603402",
  "61594022290817",
  "61595507156493",
  "61595398037273"
];

const DATA_PATH = path.join(__dirname, "ryuk_state.json");
const EMOJI = "😆";

const ROASTS = [
  "Luh, nag-type pa talaga siya oh, akala mo naman may kumpirmasyon. 💀",
  "Lods, paki-delete na lang 'to bago pa makita ng iba, nakakahiya. 🤣",
  "Lakas ng loob mo mag-chat, pero yung sinabi mo walang kwenta.",
  "Sino nagtanong sa'yo? Lakas maka-main character ah.",
  "Bro, isip muna bago pindot ng send button, napapahalata ka eh.",
  "Sana bago ka nag-text, nag-isip ka muna ng limang beses.",
  "Quiet ka na lang muna lods, nauubusan na kami ng patience sa'yo.",
  "Yung utak mo parang data connection, laging slow at nawawala."
];

function getState() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch (e) {}
  return { active: false };
}

function saveState(state) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {}
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  const state = getState();

  if (!state.active || !body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  // 1. Fixed Auto-Reaction
  try {
    api.setMessageReaction(EMOJI, messageID, () => {}, true);
  } catch (e) {}

  // 2. Trigger Typing Indicator
  let endTyping;
  try {
    if (typeof api.sendTypingIndicator === "function") {
      endTyping = api.sendTypingIndicator(threadID, () => {});
    }
  } catch (e) {}

  // 3. Exactly 10 Seconds Delay
  await sleep(10000);

  // Stop Typing Indicator
  try {
    if (typeof endTyping === "function") {
      endTyping();
    }
  } catch (e) {}

  // 4. Roast Reply (Naka-balik na ulit ang lines)
  const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  api.sendMessage({ body: roast, mentions: [{ tag: `@${senderID}`, id: senderID }] }, threadID, messageID);
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  
  if (!ADMIN_UIDS.includes(String(senderID))) return;

  if (sub === "on") {
    saveState({ active: true });
    await sleep(2000);
    return api.sendMessage("🔥 Ryuk Safe Mode: ACTIVATED (10s Delay + 😆 + Roasts)", threadID, messageID);
  }

  if (sub === "off") {
    saveState({ active: false });
    return api.sendMessage("✅ Ryuk Safe Mode: TURNED OFF", threadID, messageID);
  }

  if (sub === "status") {
    const state = getState();
    return api.sendMessage(`📌 Ryuk Status: ${state.active ? "ACTIVE" : "OFF"}`, threadID, messageID);
  }

  return api.sendMessage("Usage: /ryuk on | off | status", threadID, messageID);
};
