const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "13.0.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "RYUK Bot • 7s Delay • Anti-Detection",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "ryuk on | ryuk off | ryuk status",
  cooldowns: 7
};

// ADMIN ID RESTRICTION
const ADMIN_ID = "61595507156493";

const DATA_PATH = path.join(__dirname, "ryuk_data.json");

// Auto-reaction emojis
const REACT_EMOJIS = ["😏", "🗿", "💀", "🥷", "😹", "👁️"];

// ✅ MAIKLI • MARAMI • RANDOM
const AUTO_REPLIES = [
  "Oo naman, sigurado.",
  "Sige nga, anong meron?",
  "Hm, talaga ba?",
  "Kung ganun nga.",
  "Sige lang, bahala ka.",
  "Ganyan ba ang gusto mo?",
  "Sige, susundin ko.",
  "Gets ko na.",
  "Kung ganun, ganun na lang.",
  "Nasa sa'yo 'yan.",
  "Sige, wala akong problema.",
  "Kung kaya mo, go lang.",
  "Bahala ka, hindi ako makikialam.",
  "Gusto mo ba talaga 'yan?",
  "Sige, obserbahan ko lang.",
  "Kung masaya ka, sige.",
  "Wala akong masabi.",
  "Ikaw ang mas nakakaalam.",
  "Sige, nandito lang ako.",
  "Kung iyan ang desisyon mo.",
  "Tao ka lang, nagkakamali rin.",
  "Hindi lahat kailangan sagot.",
  "Pahinga ka muna.",
  "Minsan tahimik ay mas mabuti.",
  "Oras ang magsasabi.",
  "Hindi kailangan madali.",
  "Dahan-dahan lang.",
  "Kayang-kaya mo 'yan.",
  "Huwag kang magmadali.",
  "Andito lang ako kung kailangan mo.",
  "Hindi ka nag-iisa.",
  "Breathe in, breathe out.",
  "Kalmado lang tayo.",
  "May tamang panahon para sa lahat.",
  "Tiwala lang sa proseso.",
  "Hindi kailangang madaliin ang lahat.",
  "Gabi na, pahinga na.",
  "Bukas may bagong simula.",
  "Okay lang na hindi okay.",
  "Hindi ka makasalanan.",
  "Patawarin mo ang sarili mo.",
  "Sapat ka na.",
  "Wag mong piliting magmadali.",
  "Darating din ang tamang pagkakataon.",
  "Magtiwala ka lang.",
  "Hindi lahat kontrolado mo.",
  "Tanggapin mo na lang minsan.",
  "Mas mahalaga ang kapayapaan mo.",
  "Worth it ang paghihintay.",
  "Ikaw lang ang kailangan mong patunayan sa sarili mo."
];

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
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

// ==========================================
// 🛡️ ANTI-DETECTION SYSTEM
// ==========================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ⏱️ ~7 seconds ± random
const BASE_DELAY = 7000;
const VARIANCE = 2000;
function getHumanDelay() {
  return BASE_DELAY + Math.floor(Math.random() * VARIANCE * 2) - VARIANCE;
}

const recentReplies = new Map();
const REPLY_COOLDOWN = 25000;

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  // Ignore: walang text, sariling message, command
  if (!body || senderID === api.getCurrentUserID()) return;
  
  const lowerBody = body.toLowerCase().trim();
  if (lowerBody === "ryuk on" || lowerBody === "ryuk off" || lowerBody === "ryuk status") return;

  if (!isActive()) return;

  // Cooldown per person
  const lastReplyTime = recentReplies.get(`${threadID}-${senderID}`) || 0;
  if (Date.now() - lastReplyTime < REPLY_COOLDOWN) return;

  // Anti-spam burst
  const threadActivity = recentReplies.get(`activity-${threadID}`) || 0;
  if (Date.now() - threadActivity < 1500) {
    recentReplies.set(`activity-${threadID}`, Date.now());
    return;
  }
  recentReplies.set(`activity-${threadID}`, Date.now());

  try {
    const humanDelay = getHumanDelay();
    await sleep(humanDelay);

    // 20% chance skip reply
    if (Math.random() < 0.2) return;

    const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    recentReplies.set(`${threadID}-${senderID}`, Date.now());

    // 60% chance lang mag-mention
    const shouldMention = Math.random() > 0.4;
    const messageBody = shouldMention 
      ? { body: randomReply, mentions: [{ tag: `@${senderID}`, id: senderID }] }
      : { body: randomReply };

    api.sendMessage(messageBody, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        if (Math.random() > 0.35) {
          await sleep(Math.floor(Math.random() * 1000) + 500);
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

  // Admin only
  if (senderID !== ADMIN_ID) {
    return api.sendMessage("❌ Hindi mo pwede gamitin 'to!", threadID, messageID);
  }

  if (cmd === "ryuk on") {
    data.active = true;
    saveData(data);
    api.setMessageReaction("🥷", messageID, () => {}, true);
    return api.sendMessage(
      `🥷 RYUK: ONLINE\n\n` +
      `⏱️ Delay: ~7s\n` +
      `🛡️ Anti-Detection: ACTIVE\n` +
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
        ? "🥷 RYUK: ACTIVE — Nagbabantay..."
        : "😹 RYUK: OFFLINE — Nagpapahinga...",
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    `🥷 RYUK BOT\n\n` +
    `ryuk on    → I-ON 🥷\n` +
    `ryuk off   → I-OFF 😹\n` +
    `ryuk status → Tignan status`,
    threadID,
    messageID
  );
};
  
