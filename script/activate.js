const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "activate",
  version: "7.1-safe-typing",
  hasPermission: 1,
  credits: "sinzu - safe rewrite",
  description: "Safe roast + group name protect + nickname + typing",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/activate on | off | roast | setgc | cleargc | setnick | setnickall | status",
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
  return { active: false, roasts: DEFAULT_ROASTS, groupLocks: {} };
}
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// function para may typing indicator
function sendWithTyping(api, msg, threadID, messageID) {
  api.sendTypingIndicator(threadID, (err) => {
    setTimeout(() => {
      api.sendMessage(msg, threadID, messageID);
    }, 1500); // 1.5 sec typing
  });
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const data = loadData();
  if (!data.roasts) data.roasts = DEFAULT_ROASTS;
  if (!data.groupLocks) data.groupLocks = {};

  const sub = (args[0] || "").toLowerCase();

  if (sub === "on") {
    data.active = true; saveData(data);
    return sendWithTyping(api, "🔥 Auto-reply ON sa GC na to.", threadID, messageID);
  }
  if (sub === "off") {
    data.active = false; saveData(data);
    return sendWithTyping(api, "✅ Auto-reply OFF na.", threadID, messageID);
  }
  if (sub === "roast") {
    const random = data.roasts[Math.floor(Math.random() * data.roasts.length)];
    return sendWithTyping(api, random, threadID, messageID);
  }
  if (sub === "add") {
    const text = args.slice(1).join(" ");
    if (!text) return sendWithTyping(api, "Lagay ka ng text: /activate add <text>", threadID, messageID);
    data.roasts.push(text); saveData(data);
    return sendWithTyping(api, `Na-add: "${text}"`, threadID, messageID);
  }
  if (sub === "setgc") {
    const name = args.slice(1).join(" ");
    if (!name) return sendWithTyping(api, "Usage: /activate setgc <group name>", threadID, messageID);
    data.groupLocks[threadID] = name; saveData(data);
    api.sendTypingIndicator(threadID, () => {
      setTimeout(() => {
        api.setTitle(name, threadID, (err) => {
          if (err) return api.sendMessage("Di ko ma-set, need admin yung bot.", threadID, messageID);
          api.sendMessage(`🔒 Group name na-set sa: "${name}"`, threadID, messageID);
        });
      }, 1200);
    });
    return;
  }
  if (sub === "cleargc") {
    delete data.groupLocks[threadID]; saveData(data);
    return sendWithTyping(api, "🔓 Group name lock tinanggal na.", threadID, messageID);
  }
  if (sub === "setnick") {
    const nick = args.slice(1).join(" ");
    if (!nick) return sendWithTyping(api, "Usage: /activate setnick <nickname>", threadID, messageID);
    api.sendTypingIndicator(threadID, () => {
      setTimeout(() => {
        api.changeNickname(nick, threadID, senderID, (err) => {
          if (err) return api.sendMessage("Di ko ma-set nickname, need admin.", threadID, messageID);
          api.sendMessage(`Nickname mo set sa: ${nick}`, threadID, messageID);
        });
      }, 1200);
    });
    return;
  }
  if (sub === "setnickall") {
    const nick = args.slice(1).join(" ");
    if (!nick) return sendWithTyping(api, "Usage: /activate setnickall <nickname>", threadID, messageID);
    const info = await api.getThreadInfo(threadID);
    api.sendMessage(`Sige set ko ${Math.min(info.participantIDs.length, 20)} members, may typing delay para di ma-detect...`, threadID);
    let count = 0;
    for (const userID of info.participantIDs) {
      await new Promise(r => setTimeout(r, 1500));
      api.sendTypingIndicator(threadID);
      api.changeNickname(nick, threadID, userID);
      count++;
      if (count >= 20) break;
    }
    return sendWithTyping(api, `✅ Done ${count} members: ${nick}`, threadID, messageID);
  }

  return sendWithTyping(api, "Usage:\n/activate on/off\n/activate roast\n/activate setgc <name>\n/activate cleargc\n/activate setnick <name>\n/activate setnickall <name>", threadID, messageID);
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData } = event;
  if (senderID === api.getCurrentUserID()) return;

  const data = loadData();

  if (logMessageType === "log:thread-name") {
    const locked = data.groupLocks ? data.groupLocks[threadID] : null;
    if (locked && logMessageData && logMessageData.name !== locked) {
      api.sendTypingIndicator(threadID, () => {
        setTimeout(() => {
          api.setTitle(locked, threadID);
          api.sendMessage(`🔒 Binalik ko GC name sa: "${locked}"`, threadID);
        }, 1500);
      });
    }
    return;
  }

  if (!body || body.startsWith("/")) return;
  if (data.active !== true) return;

  const random = data.roasts[Math.floor(Math.random() * data.roasts.length)];
  api.sendTypingIndicator(threadID, () => {
    setTimeout(() => {
      api.sendMessage(random, threadID, messageID);
    }, 1300);
  });
};
