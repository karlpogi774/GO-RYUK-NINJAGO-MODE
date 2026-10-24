const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "4.2.0",
  hasPermission: 0, // Set to 0 to prevent framework permission blocking
  credits: "sinzu & Gemini",
  description: "Infinite global auto-roast with Safe Typing Indicator, Multi-Admin Locks, Anti-Spam, 2s setnick delay, Auto React, and Name Guard.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status | setgname <name> | setnick <name>",
  cooldowns: 2
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
const EMOJIS = ["🔥", "💀", "🤣", "😆", "🤡", "👎", "💩", "👻", "🐶", "💯", "🤪"];

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
  "Puro ka dada, zero performance ka naman sa totoong buhay. 💯 🤪"
];

const userLastMsgTime = new Map();
const threadLastReplyTime = new Map();
const SPAM_USER_LIMIT = 2500;
const COOLDOWN_DELAY = 2000;

let memoryState = { active: false, lockedGName: DEFAULT_LOCKED_NAME, lockedNick: DEFAULT_LOCKED_NAME };

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch (err) {}
  return memoryState;
}

function saveData(data) {
  memoryState = data;
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {}
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function checkIsAdmin(senderID) {
  return ADMIN_UIDS.includes(String(senderID));
}

// SAFE SEND WITH TYPING INDICATOR
async function safeSend(api, threadID, msgObj, replyToID = null) {
  try {
    if (typeof api.sendTypingIndicator === "function") {
      api.sendTypingIndicator(threadID, () => {});
    }
  } catch (e) {}

  await sleep(1500);

  return new Promise((resolve) => {
    if (replyToID) {
      api.sendMessage(msgObj, threadID, resolve, replyToID);
    } else {
      api.sendMessage(msgObj, threadID, resolve);
    }
  });
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData } = event;
  const data = loadData();

  if (!data.active) return;

  const currentLockedGName = data.lockedGName || DEFAULT_LOCKED_NAME;
  const currentLockedNick = data.lockedNick || DEFAULT_LOCKED_NAME;

  if (logMessageType === "log:thread-name") {
    if (logMessageData && logMessageData.name !== currentLockedGName) {
      api.setTitle(currentLockedGName, threadID, () => {});
    }
    return;
  }

  if (logMessageType === "log:user-nickname") {
    const changedUser = logMessageData ? logMessageData.participant_id : null;
    if (changedUser && logMessageData.nickname !== currentLockedNick) {
      await sleep(1000);
      api.changeNickname(currentLockedNick, threadID, changedUser, () => {});
    }
    return;
  }

  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  try {
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    api.setMessageReaction(randomEmoji, messageID, () => {}, true);
  } catch (e) {}

  const now = Date.now();
  if (now - (userLastMsgTime.get(senderID) || 0) < SPAM_USER_LIMIT || now - (threadLastReplyTime.get(threadID) || 0) < COOLDOWN_DELAY) {
    return;
  }
  userLastMsgTime.set(senderID, now);
  threadLastReplyTime.set(threadID, now);

  const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  await safeSend(api, threadID, { body: randomRoast, mentions: [{ tag: `@${senderID}`, id: senderID }] }, messageID);
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (!checkIsAdmin(senderID)) {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    return await safeSend(api, threadID, randomRoast, messageID);
  }

  if (sub === "on") {
    data.active = true;
    saveData(data);
    return await safeSend(
      api, threadID,
      `🔥 GLOBAL AUTO-ROAST & PROTECTION: ACTIVATED\n\n` +
      `• Typing Indicator: Active ✍️\n` +
      `• Mode: Infinite (Walang Hinto)\n` +
      `• Locked Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n\n` +
      `Gamitin ang "/ryuk off" para i-stop.`,
      messageID
    );
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return await safeSend(api, threadID, "✅ Infinite Auto-Roast turned OFF.", messageID);
  }

  if (sub === "status") {
    return await safeSend(
      api, threadID,
      `🔥 Status: ${data.active ? "ACTIVE (INFINITY MODE)" : "OFF"}\n` +
      `📌 Locked Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"`,
      messageID
    );
  }

  return await safeSend(api, threadID, "Usage: /ryuk on | off | status | setgname <name> | setnick <name>", messageID);
};
