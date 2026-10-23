const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "3.5.0",
  hasPermission: 2,
  credits: "sinzu & Gemini",
  description: "Fast Reply — 1s Delay + Self-React + Anti-Spam + Name Guard",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status | setgname <name> | setnick <name>",
  cooldowns: 1
};

// ================= CONFIGURATION =================
const ADMIN_UIDS = [
  "61593892603402",
  "61594022290817",
  "61595507156493",
  "61595398037273"
];

const DEFAULT_LOCKED_NAME = "Ryuk";
const DATA_PATH = path.join(__dirname, "activate_data.json");

// ✅ SELF-REACT EMOJIS
const SELF_REACT_EMOJIS = ["🥷", "🗡️", "⚔️", "🔥", "💀"];

const ROASTS = [
  "Luh, nag-type pa talaga siya oh, akala mo naman may kumpirmasyon. 💀 💯 🤪",
  "Lods, paki-delete na lang 'to bago pa makita ng iba, nakakahiya. 🤣 💯 🤪",
  "Lakas ng loob mo mag-chat, pero yung sinabi mo walang kwenta. 💯 🤪",
  "Sino nagtanong sa'yo? Lakas maka-main character ah. 💯 🤪",
  "Bro, isip muna bago pindot ng send button, napapahalata ka eh. 💯 🤪",
  "Pang-asar ba 'yan o self-humiliation? Clarify natin. 💯 🤪",
  "Sana bago ka nag-text, nag-isip ka muna ng limang beses. 💯 🤪",
  "Quiet ka na lang muna lods, nauubusan na kami ng patience sa'yo. 💯 🤪",
  "I-off mo na wifi o data mo, hindi para sa'yo ang araw na 'to. 💯 🤪",
  "Ganda ng sinabi mo ah, kasing ganda ng blankong papel. 🤡 💯 🤪",
  "Ulitin mo nga 'yan, para mas lalo ka naming pagtawanan. 💯 🤪",
  "Bro really thought that message was necessary 💀 💯 🤪",
  "The confidence… the delusion… unmatched. 💯 🤪",
  "Say less, we already lost brain cells reading that. 💯 🤪",
  "You typed all that just to embarrass yourself? 💯 🤪",
  "Main character energy but the plot is mid. 💯 🤪",
  "Who hurt you? Because that sentence hurt all of us. 💯 🤪",
  "The audacity is loud but the intelligence is on mute. 💯 🤪",
  "This is why group chats need a mute button for specific people. 💯 🤪",
  "Pag-isipan mo munang mabuti bago ka mag-send ulit, nakaka-secondhand embarrassment ka bro. 💀 💯 🤪",
  "Akala mo siguro nakakatawa ka, paki-check nga ulit sa salamin. 💯 🤪",
  "Yung utak mo parang data connection, laging slow at paminsan-minsan nawawala. 📡 💯 🤪",
  "Mag-offline ka muna pre, magpahinga ka naman sa pagpapamukha na wala kang alam. 💯 🤪",
  "May award ka ba sa pagiging pinaka-epal sa GC? Kasi pasok na pasok ka. 💯 🤪",
  "Baka naman pwedeng mag-think before click kahit minsan lang? 💯 🤪",
  "Pakisara na lang yung app, wala ka ring maiisip na matino ngayon. 💯 🤪",
  "Tigilan mo na 'yan, pati 'yung keyboard mo sumusuko na sa'yo. 💯 🤪",
  "Confidence level: 100%. Sense level: 0%. 💯 🤪",
  "Ayan ka na naman, nagkakalat ka na naman ng ingay sa GC. 💯 🤪",
  "Subukan mo kayang mag-isip bago mag-type? Baka makatulong. 💯 🤪",
  "Ang ingay mo, wala ka namang maipagmamabang. 💯 🤪",
  "Kung degree ang pagiging corny, summa cum laude ka na siguro. 💯 🤪",
  "Bakit ka nag-chat? May humingi ba ng opinyon mo? 💯 🤪",
  "Hindi ka nakakatuwa, nakakaawa ka na pakinggan. 💯 🤪",
  "Yung utak mo parang Internet Explorer, huling-huli sa balita. 💯 🤪",
  "Lakas magmarunong pero nung nagtanong, nganga naman. 💯 🤪",
  "Tulog mo na lang 'yan lods, wala ka talagang mapapala ngayon. 💯 🤪",
  "Walang nakikinig sa'yo, kaya wag ka nang mag-aksaya ng laway. 💯 🤪",
  "Gusto mo ba ng medalya dahil sa walang katuturan mong sinabi? 💯 🤪",
  "Puro ka dada, zero performance ka naman sa totoong buhay. 💯 🤪",
  "Sana binasa mo muna bago mo pinindot 'yung send. 💯 🤪",
  "Dami mong sinasabi, wala namang katuturan. 💯 🤪",
  "Wala talagang value yung mga chat mo dito, paki-bawas-bawasan. 💯 🤪",
  "Ang sarap mo sanang suportahan kaso ang hirap mong ipagtanggol sa katangahan mo. 💯 🤪",
  "Lodi, hindi sa lahat ng pagkakataon kailangan mong mag-comment. 💯 🤪",
  "Isip ka muna bago mag-reply, para hindi ka nagmumukhang kawawa. 💯 🤪",
  "Hindi ko alam kung nagpapatawa ka o sadyang ganyan ka lang talaga mag-isip. 💯 🤪",
  "Nag-send ka pa nyan, kala mo naman ikatutuwa ng buong GC. 💯 🤪",
  "Pa-bida ka na naman, wala namang pumapansin sa'yo. 💯 🤪",
  "Magkano bayad sa'yo para maging ganyan ka-epal araw-araw? 💯 🤪",
  "May pa-type type ka pa, burahin mo na lang 'yan pre. 💯 🤪",
  "Minsan na nga lang mag-chat, nakakairita pa. 💯 🤪"
];

// ✅ ANTI-SPAM SYSTEM
const userMessageLog = new Map();
const threadLastReplyTime = new Map();
const userLastReply = new Map();

const COOLDOWN_DELAY = 1000;        // ⚡ 1 SECOND — Mabilis na!
const USER_COOLDOWN = 3000;          // ⚡ 3 segundo bago sagutin ulit ang parehong tao
const MAX_MSGS_PER_USER = 5;         // 5 mensahe lang
const TIME_WINDOW = 8000;            // sa loob ng 8 segundo
const MAX_REPLIES_PER_MINUTE = 20;   // Mas marami na pwede kada minuto
let minuteReplyCount = 0;
let lastMinuteReset = Date.now();

let localMemoryData = { active: false, activatedBy: null, lockedGName: DEFAULT_LOCKED_NAME, lockedNick: DEFAULT_LOCKED_NAME };

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const content = fs.readFileSync(DATA_PATH, "utf8");
      localMemoryData = JSON.parse(content);
      return localMemoryData;
    }
  } catch (err) {
    console.error("[Data Load Error]:", err.message);
  }
  return localMemoryData;
}

function saveData(data) {
  localMemoryData = data;
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[Data Save Error]:", err.message);
  }
}

function isActive() {
  const data = loadData();
  return Boolean(data.active);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function checkIsAdmin(senderID) {
  return ADMIN_UIDS.includes(String(senderID));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ✅ ANTI-SPAM CHECK
function isSpamming(senderID) {
  const now = Date.now();
  if (!userMessageLog.has(senderID)) {
    userMessageLog.set(senderID, []);
  }
  const messages = userMessageLog.get(senderID);
  messages.push(now);
  
  while (messages.length > 0 && now - messages[0] > TIME_WINDOW) {
    messages.shift();
  }
  return messages.length > MAX_MSGS_PER_USER;
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData } = event;
  const data = loadData();
  const currentUserID = api.getCurrentUserID();

  if (!isActive()) return;

  const currentLockedGName = data.lockedGName || DEFAULT_LOCKED_NAME;
  const currentLockedNick = data.lockedNick || DEFAULT_LOCKED_NAME;

  // 1. AUTO SETGNAME LOCK
  if (logMessageType === "log:thread-name") {
    const newName = logMessageData ? logMessageData.name : "";
    if (newName !== currentLockedGName) {
      api.setTitle(currentLockedGName, threadID, (err) => {
        if (!err) {
          api.sendMessage(`🚫 GC Name is locked! Reverting back to: "${currentLockedGName}"`, threadID);
        }
      });
    }
    return;
  }

  // 2. AUTO SETNICK LOCK
  if (logMessageType === "log:user-nickname") {
    const changedUser = logMessageData ? logMessageData.participant_id : null;
    const newNick = logMessageData ? logMessageData.nickname : "";

    if (changedUser && newNick !== currentLockedNick) {
      await sleep(500); // ⚡ Mabilis na revert
      api.changeNickname(currentLockedNick, threadID, changedUser, () => {});
    }
    return;
  }

  if (!body || body.startsWith("/") || senderID === currentUserID) return;

  // ✅ RESET MINUTE COUNTER
  const now = Date.now();
  if (now - lastMinuteReset > 60000) {
    minuteReplyCount = 0;
    lastMinuteReset = now;
  }

  // ✅ ANTI-SPAM CHECK
  if (isSpamming(senderID)) return;

  // ✅ LIMIT
  if (minuteReplyCount >= MAX_REPLIES_PER_MINUTE) return;

  // ✅ USER COOLDOWN
  const userKey = `${threadID}-${senderID}`;
  if (now - (userLastReply.get(userKey) || 0) < USER_COOLDOWN) return;

  // ✅ THREAD COOLDOWN
  const lastThreadTime = threadLastReplyTime.get(threadID) || 0;
  if (now - lastThreadTime < COOLDOWN_DELAY) return;
  threadLastReplyTime.set(threadID, now);

  // ✅ AUTO REPLY ROAST — 1 SECOND DELAY
  const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  minuteReplyCount++;
  userLastReply.set(userKey, now);
  
  await sleep(1000); // ⚡ 1 SECOND — Mabilis na!

  api.sendMessage({
    body: randomRoast,
    mentions: [{ tag: `@${senderID}`, id: senderID }]
  }, threadID, messageID, async (err, info) => {
    // ✅ SELF-REACT
    if (!err && info && info.messageID) {
      const selfEmoji = pickRandom(SELF_REACT_EMOJIS);
      setTimeout(() => {
        api.setMessageReaction(selfEmoji, info.messageID, () => {}, true);
      }, 200);
    }
  });
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!checkIsAdmin(senderID)) {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    return api.sendMessage(randomRoast, threadID, messageID);
  }

  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  // /ryuk on
  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    data.activatedAt = Date.now();
    saveData(data);

    return api.sendMessage(
      `🔥 FAST MODE — ACTIVATED ⚡\n\n` +
      `• ⏱️ Reply Delay: 1 SECOND\n` +
      `• ✅ Self-React: ON\n` +
      `• ✅ Anti-Spam: ON\n` +
      `• 🔒 GC Name & Nick Guard: ON\n\n` +
      `/ryuk off — Stop`,
      threadID,
      messageID
    );
  }

  // /ryuk off
  if (sub === "off") {
    if (isActive()) {
      data.active = false;
      saveData(data);
      return api.sendMessage("✅ Turned OFF.", threadID, messageID);
    }
    return api.sendMessage("Already OFF.", threadID, messageID);
  }

  // /ryuk setgname <name>
  if (sub === "setgname") {
    const newGName = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.lockedGName = newGName;
    saveData(data);

    api.setTitle(newGName, threadID, (err) => {
      if (err) return api.sendMessage("❌ Failed.", threadID, messageID);
      return api.sendMessage(`🔒 GC Name locked to: "${newGName}"`, threadID, messageID);
    });
    return;
  }

  // /ryuk setnick <name>
  if (sub === "setnick") {
    const newNick = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.lockedNick = newNick;
    saveData(data);

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs || [];

      api.sendMessage(`⏳ Locking nicknames to: "${newNick}"...`, threadID);

      for (const uid of participantIDs) {
        await sleep(1000); // ⚡ 1 second per user
        api.changeNickname(newNick, threadID, uid, () => {});
      }
      return api.sendMessage(`🔒 All nicknames locked to: "${newNick}"`, threadID, messageID);
    } catch (e) {
      return api.sendMessage("❌ Failed.", threadID, messageID);
    }
  }

  // /ryuk status
  if (sub === "status") {
    if (!isActive()) {
      return api.sendMessage("Currently OFF.", threadID, messageID);
    }
    return api.sendMessage(
      `🔥 FAST MODE — ACTIVE ⚡\n\n` +
      `⏱️ Reply: 1 SECOND\n` +
      `✅ Self-React: ON\n` +
      `✅ Anti-Spam: ON\n` +
      `📌 GC Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `📌 Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"`,
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    `Usage:\n` +
    `/ryuk on — Start ⚡\n` +
    `/ryuk off — Stop\n` +
    `/ryuk setgname <name>\n` +
    `/ryuk setnick <name>\n` +
    `/ryuk status`,
    threadID,
    messageID
  );
};
  
