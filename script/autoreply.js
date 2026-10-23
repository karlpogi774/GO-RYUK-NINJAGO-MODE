const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "autoreply",
  version: "19.0.0",
  hasPermission: 0,
  credits: "RYUK",
  description: "🌿 Natural Reply — Hindi Halata",
  usePrefix: false,
  commandCategory: "Admin",
  usages: "autoreply on | autoreply off",
  cooldowns: 0
};

const ADMIN_ID = "61595507156493";
const DATA_PATH = path.join(__dirname, "autoreply_data.json");

const AUTO_REPLIES = [
  "Sige lang.",
  "Gets ko.",
  "Bahala ka.",
  "Sige na lang.",
  "Okay lang 'yan.",
  "Kaya mo 'yan.",
  "Nandito lang ako.",
  "Ganoon talaga minsan.",
  "Ako rin naman eh."
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

// ⏱️ 5 hanggang 12 segundo — parang totoong tao na nag-iisip
const MIN_DELAY = 5000;
const MAX_DELAY = 12000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🛡️ PROTECTION — para hindi mag-overload
const lastReply = new Map();
const gcCounter = new Map();
let minuteCount = 0;
let hourCount = 0;
let lastMinute = Date.now();
let lastHour = Date.now();

const MAX_PER_MINUTE = 4;      // 4 reply lang kada minuto
const MAX_PER_HOUR = 25;       // 25 reply lang kada oras
const MAX_PER_GC = 8;          // 8 reply lang sa iisang GC kada oras
const PER_PERSON_GAP = 45000;  // 45 segundo bago ulit sa parehong tao

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!body || senderID === api.getCurrentUserID()) return;
  
  const msg = body.toLowerCase().trim();
  if (msg === "autoreply") return;
  if (!isActive()) return;

  const now = Date.now();

  // Reset kada minuto
  if (now - lastMinute > 60000) {
    minuteCount = 0;
    lastMinute = now;
  }

  // Reset kada oras
  if (now - lastHour > 3600000) {
    hourCount = 0;
    lastHour = now;
    gcCounter.clear();
  }

  // 🚫 Sobrang daming tanong = huwag sagutin
  if (minuteCount >= MAX_PER_MINUTE) return;
  if (hourCount >= MAX_PER_HOUR) return;

  // 🚫 Limit sa bawat GC
  gcCounter.set(threadID, (gcCounter.get(threadID) || 0) + 1);
  if (gcCounter.get(threadID) > MAX_PER_GC) return;

  // 🚫 Huwag sagutin agad ang parehong tao
  const key = `${threadID}-${senderID}`;
  if (now - (lastReply.get(key) || 0) < PER_PERSON_GAP) return;

  try {
    const delay = getRandomDelay();
    await sleep(delay);

    // 🎲 40% chance HUWAG sumagot — minsan hindi tao rin nakakasagot agad
    if (Math.random() < 0.4) return;

    lastReply.set(key, Date.now());
    minuteCount++;
    hourCount++;
    
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

  if (cmd === "autoreply on") {
    data.active = true;
    saveData(data);
    return api.sendMessage("🌿 AutoReply ON — Natural Mode", threadID, messageID);
  }

  if (cmd === "autoreply off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("😿 AutoReply OFF", threadID, messageID);
  }
};
