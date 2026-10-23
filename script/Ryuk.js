const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "16.1.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "RYUK — Simple & Natural Reply",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "ryuk on | ryuk off",
  cooldowns: 0
};

const ADMIN_ID = "61595507156493";
const DATA_PATH = path.join(__dirname, "ryuk_data.json");

// 💬 Mga simpleng linya — parang usapan lang
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
  "Hinga lang.",
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ⏱️ 4 hanggang 6 segundo — parang nagta-type lang ng tao
const MIN_DELAY = 4000;
const MAX_DELAY = 6000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const lastReplyTime = new Map();
const PERSON_COOLDOWN = 35000; // 35 segundo bago ulit sa parehong tao

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!body || senderID === api.getCurrentUserID()) return;
  
  const lowerBody = body.toLowerCase().trim();
  
  if (lowerBody === "ryuk") return;
  if (!["ryuk on", "ryuk off", "ryuk status"].includes(lowerBody) && !isActive()) return;
  if (!isActive()) return;

  // 🚫 Hindi agad sasagot sa parehong tao
  const lastTime = lastReplyTime.get(`${threadID}-${senderID}`) || 0;
  if (Date.now() - lastTime < PERSON_COOLDOWN) return;

  try {
    const delay = getRandomDelay();
    await sleep(delay);

    // 🎲 30% chance hindi sumagot — minsan wala lang talagang masabi
    if (Math.random() < 0.3) return;

    const randomText = pickRandom(AUTO_REPLIES);
    lastReplyTime.set(`${threadID}-${senderID}`, Date.now());

    // ✅ TEXT LANG — walang sticker, walang sobrang emoji
    api.sendMessage(randomText, threadID, messageID);
    
  } catch (error) {
    console.error("RYUK Error:", error.message);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  const cmd = body.toLowerCase().trim();
  const data = loadData();

  if (senderID !== ADMIN_ID) return;

  if (cmd === "ryuk on") {
    data.active = true;
    saveData(data);
    return api.sendMessage(`🥷 RYUK: ONLINE`, threadID, messageID);
  }

  if (cmd === "ryuk off") {
    data.active = false;
    saveData(data);
    return api.sendMessage(`😹 RYUK: OFFLINE`, threadID, messageID);
  }

  if (cmd === "ryuk status") {
    return api.sendMessage(
      isActive() ? "🥷 ACTIVE — nandito lang ako" : "😹 OFFLINE — pahinga muna",
      threadID,
      messageID
    );
  }
};
  
