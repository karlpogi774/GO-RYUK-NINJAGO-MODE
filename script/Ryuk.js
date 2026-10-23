const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "15.4.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "RYUK Bot • Text + Emoji + Sticker",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "ryuk on | ryuk off | ryuk status",
  cooldowns: 0
};

// 🔑 ADMIN ID MO
const ADMIN_ID = "61595507156493";

const DATA_PATH = path.join(__dirname, "ryuk_data.json");

// 😊 RANDOM EMOJIS
const EMOJIS = [
  "😏", "🗿", "💀", "🔥", "👁️", "😹", "🤣", "😆",
  "✨", "⚡", "🌙", "🖤", "🕊️", "🦋", "🌑", "😤",
  "🤫", "😌", "👀", "💅", "🤔", "😎", "🤐", "👻"
];

// 🖼️ STICKERS
const STICKERS = [
  "1526943907554201",
  "1526943897554202",
  "1526943914220867",
  "1526943884220870",
  "1526943920887533",
  "1526943890887536",
  "1526943900887534",
  "1526943927554200",
  "1526943877554204",
  "1526943934220866",
  "1526943940887532",
  "1526943910887535",
  "1526943880887537",
  "1526943917554200",
  "1526943930887533"
];

// 💬 AUTO-REPLY LINES
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
  "Kaya mo 'yan.",
  "Meron akong sasabihin...",
  "Tara lang.",
  "Hindi lahat kailangan sagot.",
  "Tandaan mo 'to.",
  "Ikaw ang may kontrol.",
  "Magtiwala ka sa sarili mo.",
  "Hinga, tapos tuloy lang.",
  "Kaya mo 'yan palagi.",
  "Andito lang ako kung kailangan mo.",
  "Hindi ka nag-iisa."
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

// ⏱️ DELAY: 1-2 segundo
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MIN_DELAY = 1000;
const MAX_DELAY = 2000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 📥 HANDLE MESSAGES
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!body || senderID === api.getCurrentUserID()) return;
  
  const lowerBody = body.toLowerCase().trim();
  
  // Huwag sagutin kung "ryuk" lang
  if (lowerBody === "ryuk") return;
  
  // Kung hindi active at hindi command — huwag sagot
  if (!["ryuk on", "ryuk off", "ryuk status"].includes(lowerBody) && !isActive()) return;
  
  if (!isActive()) return;

  try {
    const delay = getRandomDelay();
    await sleep(delay);

    const randomText = pickRandom(AUTO_REPLIES);
    const randomEmoji = pickRandom(EMOJIS);
    const randomSticker = pickRandom(STICKERS);
    
    const shouldMention = Math.random() > 0.5;
    
    api.sendMessage({
      body: shouldMention 
        ? `${randomEmoji} @${senderID} — ${randomText}`
        : `${randomText} ${randomEmoji}`,
      mentions: shouldMention ? [{ tag: `@${senderID}`, id: senderID }] : undefined,
      sticker: randomSticker
    }, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        if (Math.random() > 0.6) {
          await sleep(Math.floor(Math.random() * 500) + 200);
          api.setMessageReaction(pickRandom(EMOJIS), info.messageID, () => {}, true);
        }
      }
    }, messageID);
    
  } catch (error) {
    console.error("RYUK Error:", error.message);
  }
};

// ⌨️ COMMANDS
module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  const cmd = body.toLowerCase().trim();
  const data = loadData();

  // Hindi admin = dedma lang
  if (senderID !== ADMIN_ID) return;

  if (cmd === "ryuk on") {
    data.active = true;
    saveData(data);
    api.setMessageReaction("🥷", messageID, () => {}, true);
    return api.sendMessage(`🥷 RYUK: ONLINE\n\n✅ Text + Emoji + Sticker`, threadID, messageID);
  }

  if (cmd === "ryuk off") {
    data.active = false;
    saveData(data);
    api.setMessageReaction("😹", messageID, () => {}, true);
    return api.sendMessage(`😹 RYUK: OFFLINE`, threadID, messageID);
  }

  if (cmd === "ryuk status") {
    return api.sendMessage(
      isActive() ? "🥷 RYUK: ACTIVE ✅" : "😹 RYUK: OFFLINE",
      threadID,
      messageID
    );
  }
};
  
