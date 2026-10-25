const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "activate",
  version: "6.1-safe",
  hasPermission: 0,
  credits: "sinzu - safe rewrite",
  description: "Safe Tagalog fun roast - auto on/off",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/activate on | off | roast | add <text> | listlines | status",
  cooldowns: 10
};

const DATA_PATH = path.join(__dirname, "activate_data.json");

const DEFAULT_ROASTS = [
  "Lods pahinga ka muna, masyado ka nang main character ngayong araw 😆",
  "Sige lang lods, confident ka eh, tuloy mo lang yan",
  "Parang blankong papel yang banat mo ah, malinis",
  "Bro isip muna bago send, para iwas sabog",
  "Quiet mode ka muna lods, recharge ka lang"
];

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch {}
  return { active: false, roasts: DEFAULT_ROASTS };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();
  if (!data.roasts || data.roasts.length === 0) data.roasts = DEFAULT_ROASTS;

  if (sub === "on") {
    data.active = true;
    saveData(data);
    return api.sendMessage("🔥 Auto-reply ON sa GC na to. Gamitin /activate off para i-stop.", threadID, messageID);
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ Auto-reply OFF na.", threadID, messageID);
  }

  if (sub === "roast") {
    const random = data.roasts[Math.floor(Math.random() * data.roasts.length)];
    return api.sendMessage(random, threadID, messageID);
  }

  if (sub === "add") {
    const text = args.slice(1).join(" ");
    if (!text) return api.sendMessage("Lagay ka ng text: /activate add <text>", threadID, messageID);
    data.roasts.push(text);
    saveData(data);
    return api.sendMessage(`Na-add: "${text}"`, threadID, messageID);
  }

  if (sub === "listlines") {
    let msg = `Lines (${data.roasts.length}):\n\n`;
    data.roasts.forEach((l, i) => msg += `${i+1}. ${l}\n`);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (sub === "status") {
    return api.sendMessage(`Status: ${data.active ? "ON 🔥" : "OFF"} - Lines: ${data.roasts.length}`, threadID, messageID);
  }

  return api.sendMessage(
    "Usage:\n/activate on - auto reply ON\n/activate off - auto reply OFF\n/activate roast - random line\n/activate add <text> - add line\n/activate listlines - list lines\n/activate status",
    threadID, messageID
  );
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  if (senderID === api.getCurrentUserID() || !body || body.startsWith("/")) return;

  const data = loadData();
  if (data.active !== true) return;

  const random = data.roasts[Math.floor(Math.random() * data.roasts.length)];
  return api.sendMessage(random, threadID, messageID);
};
