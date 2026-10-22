const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "activate",
  version: "12.0.0",
  hasPermission: 0,
  credits: "sinzu",
  description: "7s delay • Advanced Anti-Detection",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "/activate on | off | status",
  cooldowns: 7
};

// ADMIN ID RESTRICTION
const ADMIN_ID = "61595507156493";

const DATA_PATH = path.join(__dirname, "activate_data.json");

// Emojis for auto self-react — mas kaunti para hindi halata
const REACT_EMOJIS = ["🤣", "💀", "🔥"];

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
  return { active: false, lastReplied: {} };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function isActive() {
  return loadData().active === true;
}

// ==========================================
// 🛡️ ADVANCED ANTI-DETECTION SYSTEM
// ==========================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ⏱️ 7 seconds base ± random variation para hindi robot ang dating
const BASE_DELAY = 7000;
const VARIANCE = 2000; // ±2 seconds

function getHumanDelay() {
  return BASE_DELAY + Math.floor(Math.random() * VARIANCE * 2) - VARIANCE;
}

// Para hindi mag-reply sa sunod-sunod na mensahe ng iisang tao
const recentReplies = new Map();
const REPLY_COOLDOWN = 25000; // 25 seconds bago pwede mag-reply ulit sa parehong tao

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  // ❌ Ignore: walang text, sariling message, command, maikling text
  if (!body || senderID === api.getCurrentUserID() || 
      body.toLowerCase().startsWith("/activate") ||
      body.trim().length < 2) return;

  if (!isActive()) return;

  // ✅ Huwag mag-reply agad kung kakareply lang sa taong 'to
  const lastReplyTime = recentReplies.get(`${threadID}-${senderID}`) || 0;
  if (Date.now() - lastReplyTime < REPLY_COOLDOWN) return;

  // ✅ Huwag mag-reply kung maraming nag-chat sabay-sabay
  const threadActivity = recentReplies.get(`activity-${threadID}`) || 0;
  if (Date.now() - threadActivity < 1500) {
    recentReplies.set(`activity-${threadID}`, Date.now());
    return;
  }
  recentReplies.set(`activity-${threadID}`, Date.now());

  try {
    // ⏱️ Human-like delay: ~7 seconds ± random
    const humanDelay = getHumanDelay();
    await sleep(humanDelay);

    // ✅ Pumili ng reply — minsan huwag na mag-reply para hindi masyadong active
    if (Math.random() < 0.25) { // 25% chance na hindi mag-reply kahit may message
      return;
    }

    // Random reply
    const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    // I-record na nakareply na sa taong ito
    recentReplies.set(`${threadID}-${senderID}`, Date.now());

    // Send reply — WALANG @mention palagi para hindi halata
    const shouldMention = Math.random() > 0.3; // 70% chance lang mag-mention
    const messageBody = shouldMention 
      ? { body: randomReply, mentions: [{ tag: `@${senderID}`, id: senderID }] }
      : { body: randomReply };

    api.sendMessage(messageBody, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        // ✅ Reaction — minsan lang mag-react
        if (Math.random() > 0.4) { // 60% chance lang mag-react
          await sleep(Math.floor(Math.random() * 1200) + 600);
          api.setMessageReaction(randomEmoji, info.messageID, () => {}, true);
        }
      }
    }, messageID);
  } catch (error) {
    console.error("Bot Error:", error.message);
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
      `⏱️ Reply Delay: ~7s (Human-like ± random)\n` +
      `🛡️ Anti-Detection: MAXIMUM\n` +
      `✋ /activate off para itigil`,
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
        ? "✅ ACTIVE — Nagbabantay nang ligtas"
        : "⏸️ OFF — Naka-hinto ang bot",
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    `📌 Commands:\n\n` +
    `/activate on — I-ON ang bot\n` +
    `/activate off — I-OFF ang bot\n` +
    `/activate status — Tignan ang status`,
    threadID,
    messageID
  );
};
  
