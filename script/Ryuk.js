const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "15.3.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "RYUK Bot • Sticker + Emoji + Text Reply",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "ryuk on | ryuk off | ryuk status",
  cooldowns: 0
};

// ADMIN ID RESTRICTION
const ADMIN_ID = "61595507156493";

const DATA_PATH = path.join(__dirname, "ryuk_data.json");

// 🎯 RANDOM EMOJIS
const EMOJIS = [
  "😏", "🗿", "💀", "🔥", "👁️", "😹", "🤣", "😆",
  "✨", "⚡", "🌙", "🖤", "🕊️", "🦋", "🌑", "😤",
  "🤫", "😌", "👀", "💅", "🤔", "😎", "🤐", "👻"
];

// 🎯 RANDOM STICKERS (mga sikat na sticker IDs)
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
  "1526943930887533",
  "1526943894220869",
  "1526943924220867",
  "1526943904220868",
  "1526943887554203",
  "1526943937554200"
];

// 🎯 MAIKLI AT MARAMING LINYA
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

// ==========================================
// ⚡ 1-2 SECOND DELAY • TEXT + EMOJI + STICKER
// ==========================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MIN_DELAY = 1000;
const MAX_DELAY = 2000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!body || senderID === api.getCurrentUserID()) return;
  
  const lowerBody = body.toLowerCase().trim();
  
  // ❌ Huwag mag-reply sa "ryuk" lang
  if (lowerBody === "ryuk") return;
  
  if (!["ryuk on", "ryuk off", "ryuk status"].includes(lowerBody) && !isActive()) return;
  
  if (!isActive()) return;

  try {
    const delay = getRandomDelay();
    await sleep(delay);

    // Random lahat
    const randomText = pickRandom(AUTO_REPLIES);
    const randomEmoji = pickRandom(EMOJIS);
    const randomSticker = pickRandom(STICKERS);
    
    // Ipagcombine ang text + emoji
    const finalText = `${randomText} ${randomEmoji}`;
    
    // 50% chance mag-mention
    const shouldMention = Math.random() > 0.5;
    
    // 📤 Ipadala: TEXT + STICKER sabay
    api.sendMessage({
      body: shouldMention 
        ? `${randomEmoji} @${senderID} — ${randomText}`
        : finalText,
      mentions: shouldMention ? [{ tag: `@${senderID}`, id: senderID }] : undefined,
      sticker: randomSticker
    }, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        // 40% chance mag-react pa rin
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
    return api.sendMessage(`🥷 RYUK: ONLINE\n\n✅ Sticker + Emoji + Text Mode ACTIVE`, threadID, messageID);
  }

  if (cmd === "ryuk off") {
    data.active = false;
    saveData(data);
    api.setMessageReaction("😹", messageID, () => {}, true);
    return api.sendMessage(`😹 RYUK: OFFLINE`, threadID, messageID);
  }

  if (cmd === "ryuk status") {
    return api.sendMessage(
      isActive() 
        ? "🥷 RYUK: ACTIVE — Text + Emoji + Sticker ✅"
        : "😹 RYUK: OFFLINE",
      threadID,
      messageID
    );
  }
};
  
