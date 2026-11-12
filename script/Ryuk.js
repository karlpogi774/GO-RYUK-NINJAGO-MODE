const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "3.2.0",
  credits: "ryuk",
  description: "Walang tigil na asaran — kahit sunod-sunod kayo, sasagot pa rin ako",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/activate on | off | status",
  cooldowns: 5
};

// Updated Admin IDs
const ADMIN_IDS = [
  "61595507156493",
  "61595398037273",
  "61596315422605",
  "61595955098183",
  "61596600291238"
];

const DATA_PATH = path.join(__dirname, "ryuk_data.json");
const REACT_EMOJIS = ["💀", "🤡", "😂", "🗿", "🔥", "💩", "😏", "🙄"];

const ROASTS = [
  "— tignan mo yung message mo tapos sabihin mo sa sarili mo: 'nagkamali ako' 💀",
  "— tahimik na lang sana mas okay pa eh 🗿",
  "— grabe yung tiwala sa sarili pero kulang sa utak 😭",
  "— isip ka muna bago ka mag-type parang awa mo na 🤡",
  "— bawal ang walang laman dito ah, umuwi ka na lang 🏃💨",
  "— akala mo ang galing, pero wala naman talaga 😂",
  "— ang lakas ng loob mo pero mahina ang rason 🙄",
  "— hindi nakakatuwa, nakakalungkot lang 💀",
  "— mas maganda pa yung pader kaysa sa sinabi mo 🧱",
  "— pahinga ka muna, baka mapagod ang utak mo eh 😏",
  "— hindi lahat ng nasa isip, kailangan sabihin alam mo ba yun?",
  "— parang radyong sira, paulit-ulit at walang saysay 📻",
  "— salamat sa walang kwentang update, hindi ko naman hiningi 💀",
  "— ikaw ba yung dahilan kung bakit may mute button ang gc? 🤫",
  "— maganda umaga, pero hindi para sa sinabi mo 🤡",
  "— mas masarap pa ang kanin kaysa sa sinabi mo kanina 🍚",
  "— may mga bagay na mas mabuting manahimik ka na lang talaga",
  "— hindi ako galit, nadidisappoint lang talaga ako sayo 😔",
  "— ang bigat ng message mo pero magaan ang laman 🎈",
  "— susunod na kaibigan, salamat sa wala 😂",
  "— tigil na bago pa magalit ang lahat dito eh 💀",
  "— yung sinabi mo, parang hangin — dumaan lang tapos wala 🪁",
  "— masyado kang nagsasalita, masyado ring kulang sa laman",
  "— ang ganda sana ng araw, tapos dumating ka 🥲",
  "— huwag mong pilitin kung hindi naman talaga para sayo 🚪",
  "— isang salita lang: kawawa 💀🤡",
  "— subukan mong mag-isip minsan, masarap sa pakiramdam 🧠✨",
  "— wala akong masabi, puro lang awa 🗿💀",
  "— parang joke na hindi nakakatawa pero paulit-ulit 😭",
  "— salamat sa pag-share, pero hindi ko naman kailangan 💩"
];

let lastMessageTime = {};

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch {}
  return { active: false, activatedBy: null };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function isActive() {
  return loadData().active === true;
}

function isAdmin(userID) {
  return ADMIN_IDS.includes(userID);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;
  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;
  if (!isActive()) return;

  const replyDelay = 11000;
  lastMessageTime[threadID] = Date.now();
  const marker = lastMessageTime[threadID];

  await delay(replyDelay);
  if (marker !== lastMessageTime[threadID]) return;

  try {
    const pick = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    const emoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
    api.sendMessage(pick, threadID, (err, info) => {
      if (!err && info?.messageID) api.setMessageReaction(emoji, info.messageID, () => {}, true);
    });
  } catch (err) {
    console.error("ryuk event error:", err);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    saveData(data);
    return api.sendMessage(
      "🤖 ryuk • ACTIVE ✅\n⏳ Reply delay: 11 seconds\n♾️ Mode: HINDI TITIGIL\n💀 Asaran: ON GOING\n\nGamitin /activate off para itigil",
      threadID, messageID
    );
  }

  if (sub === "off") {
    if (!isAdmin(senderID)) return api.sendMessage("❌ Hindi ka admin — hindi mo pwedeng itigil si ryuk!", threadID, messageID);
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ ryuk — OFF na muna 😴", threadID, messageID);
  }

  if (sub === "status") {
    if (!isActive()) return api.sendMessage("🤖 ryuk — OFF ngayon. Gamitin /activate on para simulan.", threadID, messageID);
    return api.sendMessage(
      "🤖 ryuk — ACTIVE ✅\n⏳ Delay: 11 seconds\n♾️ Walang tigil mode: ON\n💀 Asaran: Full power",
      threadID, messageID
    );
  }

  return api.sendMessage(
    "🤖 ryuk — Commands:\n/activate on — simulan ang asaran\n/activate off — itigil (admin lang)\n/activate status — check status",
    threadID, messageID
  );
};
  
