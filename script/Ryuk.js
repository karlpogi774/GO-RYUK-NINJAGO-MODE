const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "5.1.0",
  hasPermission: 0,
  credits: "sinzu & Gemini",
  description: "Anti-Detection Infinite Auto-Roast with 5s delay, fixed 😆 auto-react, and Multi-Admin Locks.",
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
const FIXED_EMOJI = "😆"; // FIXED AUTO-REACT EMOJI

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

// 5 SECONDS SAFE TIMINGS
const SPAM_USER_LIMIT = 5000; 
const COOLDOWN_DELAY = 5000;   

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

// 5 SECONDS DELAY SENDER
async function sendDelayedMessage(api, threadID, msgObj, replyToID = null) {
  // Safe 5 Seconds Delay
  await sleep(5000);

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

  // 1. AUTO SETGNAME LOCK
  if (logMessageType === "log:thread-name") {
    if (logMessageData && logMessageData.name !== currentLockedGName) {
      api.setTitle(currentLockedGName, threadID, () => {});
    }
    return;
  }

  // 2. AUTO SETNICK LOCK
  if (logMessageType === "log:user-nickname") {
    const changedUser = logMessageData ? logMessageData.participant_id : null;
    if (changedUser && logMessageData.nickname !== currentLockedNick) {
      await sleep(2000);
      api.changeNickname(currentLockedNick, threadID, changedUser, () => {});
    }
    return;
  }

  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  // FIXED AUTO-REACT WITH 😆
  try {
    api.setMessageReaction(FIXED_EMOJI, messageID, () => {}, true);
  } catch (e) {}

  // 3. 5 SECONDS RATE LIMIT CHECK
  const now = Date.now();
  if (now - (userLastMsgTime.get(senderID) || 0) < SPAM_USER_LIMIT || now - (threadLastReplyTime.get(threadID) || 0) < COOLDOWN_DELAY) {
    return;
  }
  userLastMsgTime.set(senderID, now);
  threadLastReplyTime.set(threadID, now);

  // 4. AUTO-REPLY ROAST WITH 5s DELAY
  const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  await sendDelayedMessage(api, threadID, { body: randomRoast, mentions: [{ tag: `@${senderID}`, id: senderID }] }, messageID);
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (!checkIsAdmin(senderID)) {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    return await sendDelayedMessage(api, threadID, randomRoast, messageID);
  }

  if (sub === "on") {
    data.active = true;
    saveData(data);
    return await sendDelayedMessage(
      api, threadID,
      `🔥 GLOBAL AUTO-ROAST & PROTECTION: ACTIVATED\n\n` +
      `• Mode: Safe Anti-Detection Mode 🛡️\n` +
      `• Reply Delay: Fixed 5 Seconds ⏱️\n` +
      `• Auto-React: Fixed 😆\n` +
      `• Locked GC Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `• Locked Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"\n\n` +
      `Gamitin ang "/ryuk off" kapag gustong ihinto.`,
      messageID
    );
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return await sendDelayedMessage(api, threadID, "✅ Infinite Auto-Roast turned OFF.", messageID);
  }

  if (sub === "status") {
    return await sendDelayedMessage(
      api, threadID,
      `🔥 Status: ${data.active ? "ACTIVE (SAFE 5s DELAY)" : "OFF"}\n` +
      `📌 Reaction: 😆\n` +
      `📌 Locked Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `📌 Locked Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"`,
      messageID
    );
  }

  if (sub === "setgname") {
    const newGName = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.lockedGName = newGName;
    saveData(data);
    api.setTitle(newGName, threadID, () => {});
    return await sendDelayedMessage(api, threadID, `🔒 GC Name locked and updated to: "${newGName}"`, messageID);
  }

  if (sub === "setnick") {
    const newNick = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.lockedNick = newNick;
    saveData(data);

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs || [];

      await sendDelayedMessage(api, threadID, `⏳ Locking all nicknames to: "${newNick}" (3s delay per user)...`, messageID);

      for (const uid of participantIDs) {
        await sleep(3000);
        api.changeNickname(newNick, threadID, uid, () => {});
      }
      return await sendDelayedMessage(api, threadID, `🔒 All nicknames locked to: "${newNick}"`, messageID);
    } catch (e) {
      return await sendDelayedMessage(api, threadID, "❌ Failed to set nicknames. Make sure bot is GC Admin!", messageID);
    }
  }

  return await sendDelayedMessage(api, threadID, "Usage: /ryuk on | off | status | setgname <name> | setnick <name>", messageID);
};
