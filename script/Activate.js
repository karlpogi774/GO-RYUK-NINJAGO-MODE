const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "activate",
  version: "11.0.0",
  hasPermission: 0,
  credits: "sinzu",
  description: "Auto-roast bot with anti-detection 6s delay",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "/activate on | off | status",
  cooldowns: 6
};

// ADMIN ID RESTRICTION
const ADMIN_ID = "61595507156493";

const DATA_PATH = path.join(__dirname, "activate_data.json");

// Emojis for auto self-react
const REACT_EMOJIS = ["🔥", "💀", "🤣", "😆", "🤡", "👎", "🗿", "💩"];

// Tagalog roasts
const AUTO_REPLIES = [
  "Luh, nag-type pa talaga siya oh, akala mo naman may kumpirmasyon. 💀",
  "Lods, paki-delete na lang 'to bago pa makita ng iba, nakakahiya. 🤣",
  "Lakas ng loob mo mag-chat, pero yung sinabi mo walang kwenta.",
  "Sino nagtanong sa'yo? Lakas maka-main character ah.",
  "Bro, isip muna bago pindot ng send button, napapahalata ka eh.",
  "Pang-asar ba 'yan o self-humiliation? Clarify natin.",
  "Sana bago ka nag-text, nag-isip ka muna ng limang beses.",
  "Quiet ka na lang muna lods, nauubusan na kami ng patience sa'yo.",
  "I-off mo na wifi mo, hindi para sa'yo ang araw na 'to.",
  "Ganda ng sinabi mo ah, kasing ganda ng blankong papel. 🤡",
  "Ulitin mo nga 'yan, para mas lalo ka naming pagtawanan.",
  "May group chat restraint order ka na ba? Kasi lapit na kita i-report.",
  "Tigilan mo na 'yan, pati 'yung keyboard mo sumusuko na sa'yo.",
  "Confidence level: 100%. Sense level: 0%.",
  "Sige lang, ipagpatuloy mo 'yan... hanggang sa wala nang makipag-usap sa'yo."
];

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      return parsed;
    }
  } catch {}
  return { active: false };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function isActive() {
  return loadData().active === true;
}

// ===== ANTI-DETECTION SYSTEM =====
const lastResponseTime = new Map();
const MIN_DELAY = 5000;   // 5 seconds minimum
const MAX_DELAY = 8000;   // 8 seconds maximum — HINDI pare-pareho ang timing!

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get random delay para hindi ma-detect
function randomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  // Ignore empty messages, bot's own messages, and commands
  if (!body || senderID === api.getCurrentUserID() || body.toLowerCase().startsWith("/activate")) return;

  if (!isActive()) return;

  const now = Date.now();
  const lastTime = lastResponseTime.get(threadID) || 0;

  // Random cooldown check per GC
  const cooldown = randomDelay();
  if (now - lastTime < cooldown) return;

  lastResponseTime.set(threadID, now);

  try {
    // Random reply
    const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
    
    // Random typing delay — hindi laging 6 seconds
    const typingDelay = randomDelay();
    await sleep(typingDelay);

    // Send reply
    api.sendMessage({
      body: randomReply,
      mentions: [{ tag: `@${senderID}`, id: senderID }]
    }, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        // Small random delay before reaction
        await sleep(Math.floor(Math.random() * 800) + 400);
        api.setMessageReaction(randomEmoji, info.messageID, () => {}, true);
      }
    }, messageID);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  // Admin only
  if (senderID !== ADMIN_ID) {
    return api.sendMessage("❌ Hindi mo pwede gamitin 'to! 😂", threadID, messageID);
  }

  if (sub === "on") {
    data.active = true;
    saveData(data);
    return api.sendMessage(
      `✅ ACTIVATED\n\n` +
      `🛡️ Anti-Detection: ON (Random 5-8s delay)\n` +
      `⏱️ Reply: Random timing — hindi pare-pareho\n` +
      `✋ Gamitin: /activate off para itigil`,
      threadID,
      messageID
    );
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ DEACTIVATED", threadID, messageID);
  }

  if (sub === "status") {
    return api.sendMessage(
      isActive() 
        ? "✅ STATUS: ACTIVE — Bot ay nakabuhay at nagbabantay"
        : "⏸️ STATUS: OFF — Bot ay kasalukuyang nakahinto",
      threadID,
      messageID
    );
  }

  // Help message
  return api.sendMessage(
    `📌 Mga Command:\n\n` +
    `/activate on — Simulan ang bot\n` +
    `/activate off — Itigil ang bot\n` +
    `/activate status — Tignan ang kalagayan`,
    threadID,
    messageID
  );
};
