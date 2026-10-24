const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "4.1.0",
  hasPermission: 2, // Permission Level 2 (Bot Owner)
  credits: "sinzu & Gemini",
  description: "Infinite global auto-roast with Guaranteed Typing Indicator on every line, Multi-Admin Locks, Anti-Spam, Render fix, 2s setnick delay, Auto React, and Name Guard.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status | setgname <name> | setnick <name>",
  cooldowns: 2
};

// ================= CONFIGURATION =================
// LISTAHAN NG MGA ADMIN UIDs (APAT NA AUTHORIZED ACCOUNTS)
const ADMIN_UIDS = [
  "61593892603402",
  "61594022290817",
  "61595507156493",
  "61595398037273"
];

const DEFAULT_LOCKED_NAME = "Ryuk";
const DATA_PATH = path.join(__dirname, "activate_data.json");

const EMOJIS = ["😆"];

// Massive List of Roast Lines
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
const SPAM_USER_LIMIT = 2500; // 2.5s cooldown per user
const COOLDOWN_DELAY = 2000;    // 2s delay between auto-replies

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

// HELPER FUNCTION: MANDATORY TYPING INDICATOR BEFORE SENDING ANY MESSAGE
async function sendWithTyping(api, threadID, messageObject, messageIDToReply = null) {
  try {
    api.sendTypingIndicator(threadID, () => {});
  } catch (e) {}

  await sleep(2000); // Wait 2 seconds while typing animation shows up

  return new Promise((resolve) => {
    if (messageIDToReply) {
      api.sendMessage(messageObject, threadID, resolve, messageIDToReply);
    } else {
      api.sendMessage(messageObject, threadID, resolve);
    }
  });
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
          sendWithTyping(api, threadID, `🚫 GC Name is locked! Reverting back to: "${currentLockedGName}"`);
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
      await sleep(1000);
      api.changeNickname(currentLockedNick, threadID, changedUser, () => {});
    }
    return;
  }

  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  // ALWAYS AUTO-REACT TO EVERY MESSAGE
  try {
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    api.setMessageReaction(randomEmoji, messageID, () => {}, true);
  } catch (e) {}

  // 3. ANTI-SPAM & RATE LIMIT CHECK FOR TEXT REPLIES
  const now = Date.now();
  const lastUserTime = userLastMsgTime.get(senderID) || 0;
  const lastThreadTime = threadLastReplyTime.get(threadID) || 0;

  if (now - lastUserTime < SPAM_USER_LIMIT || now - lastThreadTime < COOLDOWN_DELAY) {
    return;
  }
  userLastMsgTime.set(senderID, now);
  threadLastReplyTime.set(threadID, now);

  // 4. AUTO REPLY ROAST WITH MANDATORY TYPING INDICATOR ON EVERY LINE
  const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  
  await sendWithTyping(
    api, 
    threadID, 
    {
      body: randomRoast,
      mentions: [{ tag: `@${senderID}`, id: senderID }]
    }, 
    messageID
  );
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (!checkIsAdmin(senderID)) {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    return await sendWithTyping(api, threadID, randomRoast, messageID);
  }

  // /ryuk on
  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    data.activatedAt = Date.now();
    saveData(data);

    return await sendWithTyping(
      api,
      threadID,
      `🔥 GLOBAL AUTO-ROAST & PROTECTION (INFINITY MODE): ACTIVATED\n\n` +
      `• Typing Indicator: ENABLED ON ALL LINES ✍️\n` +
      `• Mode: Infinite / Permanent (Walang Hinto)\n` +
      `• Anti-Spam: ENABLED\n` +
      `• Locked GC Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `• Locked Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"\n` +
      `• Auto-Reply Cooldown: 2 Seconds\n` +
      `• Setnick Delay: 2 Seconds/User\n\n` +
      `GUMAGANA ITO NANG WALANG HINTO AT WALANG TIME LIMIT!\n` +
      `Gamitin ang "/ryuk off" kapag gustong ihinto.`,
      messageID
    );
  }

  // /ryuk off
  if (sub === "off") {
    if (isActive()) {
      data.active = false;
      saveData(data);
      return await sendWithTyping(api, threadID, "✅ Infinite Auto-Roast turned OFF.", messageID);
    }
    return await sendWithTyping(api, threadID, "Auto-roast is currently OFF.", messageID);
  }

  // /ryuk setgname <name>
  if (sub === "setgname") {
    const newGName = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.lockedGName = newGName;
    saveData(data);

    api.setTitle(newGName, threadID, async (err) => {
      if (err) return await sendWithTyping(api, threadID, "❌ Failed to change GC Name.", messageID);
      return await sendWithTyping(api, threadID, `🔒 GC Name locked and updated to: "${newGName}"`, messageID);
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

      await sendWithTyping(api, threadID, `⏳ Locking all nicknames to: "${newNick}" (2s delay per user)...`, messageID);

      for (const uid of participantIDs) {
        await sleep(2000);
        await new Promise((resolve) => {
          api.changeNickname(newNick, threadID, uid, () => resolve());
        });
      }
      return await sendWithTyping(api, threadID, `🔒 All nicknames locked to: "${newNick}"`, messageID);
    } catch (e) {
      return await sendWithTyping(api, threadID, "❌ Failed to set nicknames. Make sure bot is GC Admin!", messageID);
    }
  }

  // /ryuk status
  if (sub === "status") {
    if (!isActive()) {
      return await sendWithTyping(api, threadID, "Global auto-roast is currently OFF.", messageID);
    }
    return await sendWithTyping(
      api,
      threadID,
      `🔥 Global Auto-roast is ACTIVE (INFINITY MODE)\n\n` +
      `⏱️ Duration: NO TIME LIMIT (Walang Hinto)\n` +
      `✍️ Typing Indicator: Active on all lines\n` +
      `🛡️ Anti-Spam: Active\n` +
      `📌 Locked GC Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `📌 Locked Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"`,
      messageID
    );
  }

  return await sendWithTyping(
    api,
    threadID,
    `Usage (Admin Only):\n` +
    `/ryuk on — Start Infinite Auto-Roast\n` +
    `/ryuk off — Stop Auto-Roast\n` +
    `/ryuk setgname <name> — Lock GC Name (Default: Ryuk)\n` +
    `/ryuk setnick <name> — Lock All Nicknames (Default: Ryuk)\n` +
    `/ryuk status — Check status`,
    messageID
  );
};
