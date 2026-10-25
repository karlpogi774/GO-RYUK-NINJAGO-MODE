const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "activate",
  version: "6.0.0-safe",
  hasPermission: 0,
  credits: "sinzu - safe rewrite",
  description: "Safe Tagalog fun roast - command only",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/activate roast | /activate add <text> | /activate listlines | /activate status",
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
  return { roasts: DEFAULT_ROASTS };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();
  if (!data.roasts || data.roasts.length === 0) data.roasts = DEFAULT_ROASTS;

  if (sub === "roast" || sub === "") {
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
    return api.sendMessage(`Safe mode ON - command only, no auto reply. Lines: ${data.roasts.length}`, threadID, messageID);
  }

  return api.sendMessage(
    "Usage:\n/activate roast - random fun line\n/activate add <text> - add line\n/activate listlines - list lines\n/activate status",
    threadID, messageID
  );
};
