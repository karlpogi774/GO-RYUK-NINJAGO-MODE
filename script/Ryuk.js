const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk", // ✅ Maliit na letter na
  version: "3.9.0",
  hasPermission: 2,
  credits: "sinzu & Gemini + Dola",
  description: "Infinite global auto-roast with Typing Indicator, Self-React, Multi-Admin Locks, Anti-Spam, Render fix, Name Guard.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status | setgname <name> | setnick <name>", // ✅ Maliit na /ryuk
  cooldowns: 2
};

// ================= CONFIGURATION =================
const ADMIN_UIDS = [
  "61593892603402",
  "61594022290817",
  "61595507156493",
  "61595398037273"
];

const DEFAULT_LOCKED_NAME = "ryuk"; // ✅ Maliit na letter
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
  "Minsan na nga lang mag-chat, nakakairita pa. 💯 🤪",
  "I-tago mo muna 'yang phone mo lods, nagpapatunay ka lang ng kawalan ng amag sa utak. 💀 💯 🤪",
  "Ang lakas ng radar mo sa pagiging corny, panalo ka na naman ngayon. 💯 🤪",
  "Lodi, subukan mo kayang mag-unseat muna sa chat box? Nakaka-distract ka. 💯 🤪",
  "Kung nakakamatay lang ang pagiging epal, matagal ka nang wala rito. 💯 🤪",
  "Ano 'yan, joke o confession of stupidity? Pabasa naman ng guide. 💯 🤪",
  "Hindi ka ba napapagod na maging tampulan ng tawanan araw-araw? 💯 🤪",
  "Bro, stop cooking... you're burning the whole kitchen down. 💀 💯 🤪",
  "Ang hangin mo masyado, wala ka namang maipakitang resibo. 💯 🤪",
  "Gusto ko sana kitang barahin kaso baka maiyak ka pa. 💯 🤪",
  "Sayang naman yung pinaload mo, ginamit mo lang sa katangahan. 💯 🤪",
  "Sana maging kasing linaw ng paningin mo yung kalokohang pinagsasabi mo. 💯 🤪",
  "Huwag ka nang mag-salita pre, nababawasan IQ ng buong group chat. 💯 🤪",
  "Kahit sinong admin dito, gustong-gusto ka nang i-remove kaso naaawa lang. 🤡 💯 🤪",
  "Lakas mag-attitude, kasing babaw naman ng plato 'yang dahilan mo. 💯 🤪",
  "Yung confidence mo parang wifi na 1-bar, napaka-weak. 💀 💯 🤪",
  "Sana naman pumasok sa utak mo na walang may pake sa sinasabi mo. 💯 🤪",
  "Gusto mo yata ng trophy para sa pinakamakuwan sa GC ah? 💯 🤪",
  "Sana itinulog mo na lang 'yan, nabawasan pa kami ng braincells. 💯 🤪"
];

// Anti-Spam Memory Maps & Cooldowns
const userLastMsgTime = new Map();
const threadLastReplyTime = new Map();
const SPAM_USER_LIMIT = 2500;
const COOLDOWN_DELAY = 2000;

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

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData } = event;
  const data = loadData();

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
      await sleep(1500);
      api.changeNickname(currentLockedNick, threadID, changedUser, (err) => {
        if (err) console.log("[Nick Lock Skipped]:", err.message);
      });
    }
    return;
  }

  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  // AUTO-REACT to user's message
  try {
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    api.setMessageReaction(randomEmoji, messageID, (err) => {
      if (err) console.log("[React Skipped]:", err.message);
    }, true);
  } catch (e) {}

  // ANTI-SPAM CHECK
  const now = Date.now();
  const lastUserTime = userLastMsgTime.get(senderID) || 0;
  const lastThreadTime = threadLastReplyTime.get(threadID) || 0;

  if (now - lastUserTime < SPAM_USER_LIMIT || now - lastThreadTime < COOLDOWN_DELAY) {
    return;
  }
  userLastMsgTime.set(senderID, now);
  threadLastReplyTime.set(threadID, now);

  // ✅ FIXED TYPING INDICATOR + SELF-REACT
  const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

  api.sendTypingIndicator(threadID); // Ipakita muna ang "typing..."
  await sleep(1500); // Maghintay habang nakita ang typing

  api.sendMessage({
    body: randomRoast,
    mentions: [{ tag: `@${senderID}`, id: senderID }]
  }, threadID, async (err, info) => {
    if (err) return console.log("[Send Error]:", err.message);

    // ✅ SELF-REACT — Bot reacts to its own message
    if (info && info.messageID) {
      await sleep(600); // Maghintay sandali bago mag-react
      try {
        const selfEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        api.setMessageReaction(selfEmoji, info.messageID, (reactErr) => {
          if (reactErr) console.log("[Self-React Skipped]:", reactErr.message);
        }, true);
      } catch (e) {
        console.log("[Self-React Fail]:", e.message);
      }
    }
  });
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!checkIsAdmin(senderID)) {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    api.sendTypingIndicator(threadID);
    await sleep(1200);
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

    api.sendTypingIndicator(threadID);
    await sleep(1000);
    return api.sendMessage(
      `🔥 GLOBAL AUTO-ROAST: ACTIVATED\n\n` +
      `✍️ Typing Indicator: ENABLED\n` +
      `✨ Self-React: ENABLED\n` +
      `🛡️ Anti-Spam: ENABLED\n` +
      `🔒 Permission Required: Level 2\n` +
      `📌 Locked GC Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `📌 Locked Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"\n\n` +
      `/ryuk off — to stop`,
      threadID, messageID
    );
  }

  // /ryuk off
  if (sub === "off") {
    if (isActive()) {
      data.active = false;
      saveData(data);
      api.sendTypingIndicator(threadID);
      await sleep(1000);
      return api.sendMessage("✅ Auto-Roast turned OFF.", threadID, messageID);
    }
    return api.sendMessage("Auto-roast is currently OFF.", threadID, messageID);
  }

  // /ryuk setgname <name>
  if (sub === "setgname") {
    const newGName = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.lockedGName = newGName;
    saveData(data);

    api.setTitle(newGName, threadID, (err) => {
      if (err) return api.sendMessage("❌ Failed to change GC Name.", threadID, messageID);
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

      api.sendMessage(`⏳ Locking all nicknames to: "${newNick}" (3s delay each)...`, threadID);

      // Mas matagal na delay para hindi ma-rate limit
      for (const uid of participantIDs) {
        await sleep(3000);
        api.changeNickname(newNick, threadID, uid, (err) => {
          if (err) console.log(`[Nick Skip ${uid}]:`, err.message);
        });
      }
      return api.sendMessage(`🔒 All nicknames locked to: "${newNick}" ✅`, threadID, messageID);
    } catch (e) {
      return api.sendMessage("❌ Failed to set nicknames. Make sure bot is GC Admin!", threadID, messageID);
    }
  }

  // /ryuk status
  if (sub === "status") {
    if (!isActive()) {
      return api.sendMessage("Global auto-roast is currently OFF.", threadID, messageID);
    }
    api.sendTypingIndicator(threadID);
    await sleep(1000);
    return api.sendMessage(
      `🔥 Auto-Roast is ACTIVE\n\n` +
      `✍️ Typing Indicator: ON\n` +
      `✨ Self-React: ON\n` +
      `🛡️ Anti-Spam: ON\n` +
      `📌 GC Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `📌 Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"`,
      threadID, messageID
    );
  }

  return api.sendMessage(
    `Usage:\n` +
    `/ryuk on — Start\n` +
    `/ryuk off — Stop\n` +
    `/ryuk setgname <name> — Lock GC Name\n` +
    `/ryuk setnick <name> — Lock All Nicknames\n` +
    `/ryuk status — Check status`,
    threadID, messageID
  );
};
  
