const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "activate",
  version: "2.3.0",
  hasPermission: 0,
  credits: "sinzu • updated by RYUK",
  description: "🔥 DUMMYLANDIA EDITION — Hindi mahihinto sa /silent!",
  usePrefix: true,
  commandCategory: "Fun",
  cooldowns: 5
};

// 🔒 ADMIN UIDS
const ADMIN_UIDS = [
  "61595507156493",
  "61595398037273",
  "61595932841761"
];

const DATA_PATH = path.join(__dirname, "activate_data.json");

// 😂 RANTER EMOJIS
const REACT_EMOJIS = ["🤡", "💩", "😹", "🤌", "🙄", "💀", "🗑️", "🤦"];

// 🗣️ PINOY RANTER LINES
const ROASTS = [
  "🤡 Luh? Akala mo naman may sense sinabi mo",
  "💀 Utak mo parang basura, tapos ikaw pa may ganang magsalita",
  "🗑️ Pwede ba mag log out ka muna? Nasasaktan mata ko sa tipa mo",
  "😹 Grabe confidence pero yung laman ng utak hanggang tuhod lang",
  "🤌 Wag ka magpanggap matalino, halata naman wala kang maisip",
  "🙄 Ang daming sinabi pero wala namang kwenta parang ikaw",
  "💩 Sayang lang data mo dyan, wala naman papuntang utak yan",
  "🤦 Tumahimik ka na lang mas okay pa, di ka mapapahiya",
  "🔥 Ikaw yung patunay na hindi lahat nabigyan ng utak",
  "💀 Tapos ka na ba? Pwede ka na umalis, umiikot mundo ko sa kalokohan mo",
  "🤡 Wag kang magaling, alam nating ikaw ang pinaka-dito sa atin",
  "🗑️ Salita mo parang basura — itatapon ko lang agad",
  "😹 Sa dinami dami ng pwedeng sabihin, yan pa ang napili mo?",
  "🤌 Isipin mo muna bago mo pindutin send, please lang",
  "🙄 Ang gulo ng isip mo parang hindi nagalit na chat",
  "💀 Pag nagsasalita ka parang nawawalan ng pag asa ang mundo",
  "🤡 Dummy detected 🚨 wag ka na magtago, halata ka na",
  "🗑️ Quality zero pero confidence unlimited — ikaw talaga 'to",
  "😹 Nagbasa ka ba o galing lang yan sa hangin?",
  "🤦 Sana next life may utak ka na, para hindi ganito kalaman ang chat mo"
];

function isAdmin(uid) {
  return ADMIN_UIDS.includes(uid);
}

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch {}
  return { active: false, activatedBy: null };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const isProcessing = new Set();

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;

  // ❌ HUWAG PAPATIN SA /silent — IGNORING IT
  if (body && body.trim().toLowerCase() === "/silent") {
    // ✅ HINDI MAG-STOP — magre-reply pa rin sa susunod na message!
    return api.sendMessage("😹 /silent? Hindi ako natitinag pre — RANTING MODE ON PA RIN 💯", threadID);
  }

  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;
  
  const data = loadData();
  if (!data.active) return;
  if (isProcessing.has(threadID)) return;
  
  isProcessing.add(threadID);

  try {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    setTimeout(() => {
      api.sendMessage(randomRoast, threadID, (err, info) => {
        if (!err && info?.messageID) {
          api.setMessageReaction(randomEmoji, info.messageID, (reactErr) => {
            if (reactErr) console.error("React error:", reactErr);
          }, true);
        }
        isProcessing.delete(threadID);
      });
    }, 3000);
  } catch (error) {
    console.error("Error:", error);
    isProcessing.delete(threadID);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (!isAdmin(senderID)) {
    return api.sendMessage("❌ Wala kang permission gamitin 'to, admin lang pwede!", threadID, messageID);
  }

  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    saveData(data);
    return api.sendMessage(
      "🔥 DUMMYLANDIA AUTO-RANT: ON ✅\n\n" +
      "Mode: HINDI MATITINAG 💪\n" +
      "/silent won't stop me 😹💯\n" +
      "/activate off — only admins can stop",
      threadID, messageID
    );
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ DUMMYLANDIA Auto-rant turned OFF — by Admin only 🔒", threadID, messageID);
  }

  if (sub === "status") {
    return api.sendMessage(
      data.active
        ? "🔥 RANTING MODE ACTIVE — HINDI MATITINAG 💪😹"
        : "😴 Currently OFF",
      threadID, messageID
    );
  }

  return api.sendMessage(
    "📖 Commands:\n" +
    "/activate on — Start 🔥\n" +
    "/activate off — Stop 😴\n" +
    "/activate status — Check 📊\n\n" +
    "💪 /silent won't stop me!",
    threadID, messageID
  );
};
    
