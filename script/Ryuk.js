const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "14.0.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "RYUK Bot • Safe Delay • Low Profile",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "ryuk on | ryuk off | ryuk status",
  cooldowns: 10
};

// ADMIN ID RESTRICTION
const ADMIN_ID = "61595507156493";

const DATA_PATH = path.join(__dirname, "ryuk_data.json");

// Auto-reaction emojis — mas kaunti para hindi halata
const REACT_EMOJIS = ["😏", "🗿", "💀"];

// Maiikling linya
const AUTO_REPLIES = [
  "Sige lang.",
  "Gets ko.",
  "Bahala ka.",
  "Kung ganun.",
  "Sige na lang.",
  "Wala akong masabi.",
  "Ikaw ang mas nakakaalam.",
  "Nandito lang ako.",
  "Kalmado lang.",
  "Dahan-dahan lang.",
  "Tiwala lang.",
  "Hindi kailangan madali.",
  "Pahinga ka muna.",
  "Okay lang 'yan.",
  "Ganyan talaga minsan.",
  "Huwag magmadali.",
  "Darating din tayo doon.",
  "Hinga lang ng malalim.",
  "Subok lang 'yan.",
  "Kaya mo 'yan."
];

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch {}
  return { active: false };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function isActive() {
  return loadData().active === true;
}

// ==========================================
// 🛡️ LOW PROFILE — MAS LIGTAS NA SETTINGS
// ==========================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ⏱️ RECOMMENDED: 9 hanggang 12 seconds
const MIN_DELAY = 9000;   // 9s minimum
const MAX_DELAY = 12000;  // 12s maximum

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

const recentReplies = new Map();
const PERSON_COOLDOWN = 45000; // 45 segundo bago ulit sa parehong tao
const MAX_REPLIES_PER_GC = 8; // Hanggang 8 reply lang bawat GC kada cycle
let gcReplyCount = new Map();

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!body || senderID === api.getCurrentUserID()) return;
  
  const lowerBody = body.toLowerCase().trim();
  if (["ryuk on", "ryuk off", "ryuk status"].includes(lowerBody)) return;

  if (!isActive()) return;

  // Limit: Hindi lalampas sa 8 reply bawat GC
  gcReplyCount.set(threadID, (gcReplyCount.get(threadID) || 0) + 1);
  if (gcReplyCount.get(threadID) > MAX_REPLIES_PER_GC) return;

  // Cooldown per tao
  const lastReply = recentReplies.get(`${threadID}-${senderID}`) || 0;
  if (Date.now() - lastReply < PERSON_COOLDOWN) return;

  try {
    const delay = getRandomDelay();
    await sleep(delay);

    // 40% chance HUWAG sumagot — mas natural!
    if (Math.random() < 0.4) return;

    // Reset counter minsan
    if (Math.random() < 0.1) gcReplyCount.set(threadID, 0);

    const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    recentReplies.set(`${threadID}-${senderID}`, Date.now());

    // 50% chance lang mag-mention
    const shouldMention = Math.random() > 0.5;
    const msgBody = shouldMention 
      ? { body: randomReply, mentions: [{ tag: `@${senderID}`, id: senderID }] }
      : { body: randomReply };

    api.sendMessage(msgBody, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        // 40% chance lang mag-react
        if (Math.random() > 0.6) {
          await sleep(Math.floor(Math.random() * 1500) + 800);
          api.setMessageReaction(randomEmoji, info.messageID, () => {}, true);
        }
      }
    }, messageID);
  } catch (error) {
    console.error("RYUK Error:", error.message);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  const cmd = body.toLowerCase().trim();
  const data = loadData();

  if (senderID !== ADMIN_ID) {
    return api.sendMessage("❌ Hindi mo pwede gamitin 'to!", threadID, messageID);
  }

  if (cmd === "ryuk on") {
    data.active = true;
    saveData(data);
    api.setMessageReaction("🥷", messageID, () => {}, true);
    return api.sendMessage(
      `🥷 RYUK: ONLINE\n\n` +
      `⏱️ Reply Delay: 9-12 seconds\n` +
      `🛡️ Low Profile Mode: ON\n` +
      `✋ I-type: ryuk off`,
      threadID,
      messageID
    );
  }

  if (cmd === "ryuk off") {
    data.active = false;
    saveData(data);
    api.setMessageReaction("😹", messageID, () => {}, true);
    return api.sendMessage("😹 RYUK: OFFLINE", threadID, messageID);
  }

  if (cmd === "ryuk status") {
    return api.sendMessage(
      isActive() 
        ? "🥷 RYUK: ACTIVE — Mabagal pero ligtas"
        : "😹 RYUK: OFFLINE — Nagpapahinga",
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    `🥷 RYUK BOT\n\n` +
    `ryuk on    → I-ON 🥷\n` +
    `ryuk off   → I-OFF 😹\n` +
    `ryuk status → Status`,
    threadID,
    messageID
  );
};
  
