const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "lockgcname",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Bloody",
  description: "Auto-revert GC name kapag may nagpalit",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "/lockgcname on | off | set <name> | status",
  cooldowns: 3
};

const AUTHORIZED_UIDS = [
  "61596315422605",
  "61595955098183",
  "61596600291238",
  "61596182742640"
];

const DATA_FILE = path.join(__dirname, "gcname-lock.json");

const active = new Map();
const targetName = new Map();
const lastKnownName = new Map();

function loadData(threadID) {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const all = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      return all[threadID] || null;
    }
  } catch (e) {}
  return null;
}

function saveData(threadID, name) {
  try {
    let all = {};
    if (fs.existsSync(DATA_FILE)) {
      all = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
    all[threadID] = name;
    fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
  } catch (e) {}
}

function isSameName(a, b) {
  return String(a || "").trim() === String(b || "").trim();
}

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, logMessageType, logMessageData } = event;
  
  if (!active.get(threadID)) return;
  if (logMessageType !== "log:thread-name") return;
  
  const newName = logMessageData?.name || "";
  const desired = targetName.get(threadID);
  
  if (!desired) return;
  if (isSameName(newName, desired)) {
    lastKnownName.set(threadID, newName);
    return;
  }
  
  const prevName = lastKnownName.get(threadID) || "(unknown)";
  console.log(`[LOCK-NAME] Detected change: "${prevName}" → "${newName}" — reverting to: "${desired}"`);
  
  setTimeout(() => {
    api.setTitle(desired, threadID, (err) => {
      if (err) console.error("[LOCK-NAME] Revert failed:", err?.message);
      else lastKnownName.set(threadID, desired);
    });
  }, 1000);
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  if (!AUTHORIZED_UIDS.includes(senderID)) {
    return api.sendMessage("❌ Hindi ka awtorisado.", threadID, messageID);
  }
  
  const cmd = (args[0] || "").toLowerCase();
  
  if (cmd === "set") {
    const name = args.slice(1).join(" ").trim();
    if (!name) {
      return api.sendMessage("❌ Gamitin: /lockgcname set <pangalan ng GC>", threadID, messageID);
    }
    targetName.set(threadID, name);
    saveData(threadID, name);
    return api.sendMessage(`✅ Nakatakdang pangalan: "${name}"\n\nGamitin: /lockgcname on para i-lock`, threadID, messageID);
  }
  
  if (cmd === "on") {
    const saved = loadData(threadID);
    if (saved) targetName.set(threadID, saved);
    
    if (!targetName.get(threadID)) {
      return api.sendMessage("❌ Walang nakatakdang pangalan!\nGamitin muna: /lockgcname set <pangalan>", threadID, messageID);
    }
    
    try {
      const info = await api.getThreadInfo(threadID);
      lastKnownName.set(threadID, info.threadName || "");
    } catch (e) {}
    
    active.set(threadID, true);
    return api.sendMessage(
      `🔒 GC NAME LOCK: NAKA-ON ✅\n\n` +
      `✅ Locked name: "${targetName.get(threadID)}"\n` +
      `⚠️ Kapag may nagpalit — babalik agad dito!\n\n` +
      `/lockgcname off para i-off`,
      threadID, messageID
    );
  }
  
  if (cmd === "off") {
    active.set(threadID, false);
    return api.sendMessage("🔓 GC NAME LOCK: NAKA-OFF ✅", threadID, messageID);
  }
  
  if (cmd === "status") {
    const status = active.get(threadID) ? "🔒 LOCKED" : "🔓 UNLOCKED";
    const name = targetName.get(threadID) || "Wala pa";
    return api.sendMessage(`📊 Status: ${status}\nTarget Name: "${name}"`, threadID, messageID);
  }
  
  return api.sendMessage(
    "📋 COMMANDS:\n\n" +
    "/lockgcname set <pangalan> — itakda ang pangalan\n" +
    "/lockgcname on — i-lock ang pangalan\n" +
    "/lockgcname off — i-unlock\n" +
    "/lockgcname status — check status\n\n" +
    "⚠️ I-ADMIN MUNA ANG BOT SA GC!",
    threadID, messageID
  );
};
