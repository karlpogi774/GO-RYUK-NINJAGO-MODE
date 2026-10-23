const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "15.2.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "RYUK Bot • No Cooldown • Auto-Reply Only",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "ryuk on | ryuk off | ryuk status",
  cooldowns: 0
};

// ADMIN ID RESTRICTION
const ADMIN_ID = "61595507156493";

const DATA_PATH = path.join(__dirname, "ryuk_data.json");

const REACT_EMOJIS = ["😏", "🗿", "💀"];

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
// ⚡ 1-2 SECOND DELAY • WALANG COOLDOWN
// ==========================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MIN_DELAY = 1000;
const MAX_DELAY = 2000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!body || senderID === api.getCurrentUserID()) return;
  
  const lowerBody = body.toLowerCase().trim();
  
  // ❌ Huwag mag-reply sa paulit-ulit na "ryuk" — dedma lang
  if (lowerBody === "ryuk") return;
  
  if (!["ryuk on", "ryuk off", "ryuk status"].includes(lowerBody) && !isActive()) return;
  
  if (!isActive()) return;

  try {
    const delay = getRandomDelay();
    await sleep(delay);

    // 10% chance sumagot — walang skip
    const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    const shouldMention = Math.random() > 0.4;
    const msgBody = shouldMention 
      ? { body: randomReply, mentions: [{ tag: `@${senderID}`, id: senderID }] }
      : { body: randomReply };

    api.sendMessage(msgBody, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        // 50% chance mag-react
        if (Math.random() > 0.5) {
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

  // ❌ Kung hindi Admin — dedma lang
  if (senderID !== ADMIN_ID) return;

  if (cmd === "ryuk on") {
    data.active = true;
    saveData(data);
    api.setMessageReaction("🥷", messageID, () => {}, true);
    return api.sendMessage(`🥷 RYUK: ONLINE`, threadID, messageID);
  }

  if (cmd === "ryuk off") {
    data.active = false;
    saveData(data);
    api.setMessageReaction("😹", messageID, () => {}, true);
    return api.sendMessage(`😹 RYUK: OFFLINE`, threadID, messageID);
  }

  if (cmd === "ryuk status") {
    return api.sendMessage(
      isActive() ? "🥷 RYUK: ACTIVE" : "😹 RYUK: OFFLINE",
      threadID,
      messageID
    );
  }
};
