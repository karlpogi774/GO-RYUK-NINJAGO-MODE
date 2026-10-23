const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "17.2.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "Fast Reply + Smart Anti-Detect",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "ryuk on | ryuk off",
  cooldowns: 0
};

const ADMIN_ID = "61595507156493";
const DATA_PATH = path.join(__dirname, "ryuk_data.json");

const AUTO_REPLIES = [
  "Sige lang.",
  "Gets ko.",
  "Bahala ka.",
  "Sige na lang.",
  "Okay lang 'yan.",
  "Kaya mo 'yan.",
  "Nandito lang ako."
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ⏱️ 1-2 segundo — mabilis pero hindi eksaktong pareho palagi
const MIN_DELAY = 1000;
const MAX_DELAY = 2000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🛡️ ANTI-DETECT PROTECTION
const lastReply = new Map();
let replyCountThisMinute = 0;
let lastMinuteReset = Date.now();

const MAX_REPLIES_PER_MINUTE = 6;     // Max 6 reply kada minuto
const PER_PERSON_GAP = 12000;         // 12 segundo bago ulit sa parehong tao

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!body || senderID === api.getCurrentUserID()) return;
  
  const msg = body.toLowerCase().trim();
  if (msg === "ryuk") return;
  if (!isActive()) return;

  // Reset counter kada minuto
  const now = Date.now();
  if (now - lastMinuteReset > 60000) {
    replyCountThisMinute = 0;
    lastMinuteReset = now;
  }

  // 🚫 Limit: hindi lalampas sa 6 reply kada minuto
  if (replyCountThisMinute >= MAX_REPLIES_PER_MINUTE) return;

  // 🚫 Hindi agad sasagot sa parehong tao
  const key = `${threadID}-${senderID}`;
  if (now - (lastReply.get(key) || 0) < PER_PERSON_GAP) return;

  try {
    const delay = getRandomDelay();
    await sleep(delay);

    // 🎲 25% chance HUWAG sumagot — para hindi mukhang robot
    if (Math.random() < 0.25) return;

    lastReply.set(key, Date.now());
    replyCountThisMinute++;
    
    api.sendMessage(pickRandom(AUTO_REPLIES), threadID, messageID);
    
  } catch (e) {
    console.log("Error:", e.message);
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
    return api.sendMessage("🥷 ON — 1-2s delay + Anti-Detect ON", threadID, messageID);
  }

  if (cmd === "ryuk off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("😹 OFF", threadID, messageID);
  }
};
  
