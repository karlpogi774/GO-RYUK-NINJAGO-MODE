const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "15.0.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "RYUK Bot • 1-2s Delay • Anti-Spam ON",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "ryuk on | ryuk off | ryuk status",
  cooldowns: 2
};

// ADMIN ID RESTRICTION
const ADMIN_ID = "61595507156493";

const DATA_PATH = path.join(__dirname, "ryuk_data.json");

const REACT_EMOJIS = ["🥷"];

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
// ⚡ 1-2 SECOND DELAY + ANTI-SPAM SYSTEM
// ==========================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ⏱️ 1 hanggang 2 segundo — mabilis pero random
const MIN_DELAY = 1000;   // 1s minimum
const MAX_DELAY = 2000;   // 2s maximum

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

// 🛡️ ANTI-SPAM SYSTEM
const recentReplies = new Map();
const PERSON_COOLDOWN = 15000;      // 15s bago ulit sa parehong tao
const GC_COOLDOWN = 3000;           // 3s pagitan ng reply sa GC
const MAX_REPLIES_PER_GC = 10;      // Hanggang 10 reply lang bawat GC
const MAX_PER_MINUTE = 4;           // Hanggang 4 reply kada minuto bawat GC

let gcReplyCount = new Map();
let minuteTracker = new Map();

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!body || senderID === api.getCurrentUserID()) return;
  
  const lowerBody = body.toLowerCase().trim();
  if (["ryuk on", "ryuk off", "ryuk status"].includes(lowerBody)) return;

  if (!isActive()) return;

  // 🚫 ANTI-SPAM: Limit bawat GC
  gcReplyCount.set(threadID, (gcReplyCount.get(threadID) || 0) + 1);
  if (gcReplyCount.get(threadID) > MAX_REPLIES_PER_GC) return;

  // 🚫 ANTI-SPAM: Per minute limit
  const now = Date.now();
  const minuteKey = `${threadID}-${Math.floor(now / 60000)}`;
  minuteTracker.set(minuteKey, (minuteTracker.get(minuteKey) || 0) + 1);
  if (minuteTracker.get(minuteKey) > MAX_PER_MINUTE) return;

  // 🚫 ANTI-SPAM: Cooldown per tao
  const lastReply = recentReplies.get(`${threadID}-${senderID}`) || 0;
  if (now - lastReply < PERSON_COOLDOWN) return;

  // 🚫 ANTI-SPAM: GC flood protection
  const lastGCReply = recentReplies.get(`gc-last-${threadID}`) || 0;
  if (now - lastGCReply < GC_COOLDOWN) return;

  try {
    const delay = getRandomDelay();
    await sleep(delay);

    // 25% chance HUWAG sumagot — para hindi mukhang robot
    if (Math.random() < 0.25) return;

    // Reset counter minsan
    if (Math.random() < 0.2) gcReplyCount.set(threadID, 0);

    const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    recentReplies.set(`${threadID}-${senderID}`, now);
    recentReplies.set(`gc-last-${threadID}`, now);

    // 60% chance mag-mention
    const shouldMention = Math.random() > 0.4;
    const msgBody = shouldMention 
      ? { body: randomReply, mentions: [{ tag: `@${senderID}`, id: senderID }] }
      : { body: randomReply };

    api.sendMessage(msgBody, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        // 40% chance lang mag-react
        if (Math.random() > 0.6) {
          await sleep(Math.floor(Math.random() * 600) + 300);
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
      `⏱️ Reply Delay: 1-2 seconds ⚡\n` +
      `🛡️ Anti-Spam: ACTIVE ✅\n` +
      `⚠️ Mag-ingat — mabilis ang delay!\n` +
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
        ? "🥷 RYUK: ACTIVE — 1-2s delay + Anti-Spam ON"
        : "😹 RYUK: OFFLINE",
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
         
