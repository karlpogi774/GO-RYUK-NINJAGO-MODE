const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "activate",
  version: "7.1-full+typing",
  hasPermission: 0,
  credits: "sinzu + ryuk edit",
  description: "Auto-reply + Group Name Lock + Mass Nickname Set + Typing Indicator",
  usePrefix: true,
  commandCategory: "Utility",
  usages: "/activate on | off | status | setname <group name> | lockname on/off | setnick <nickname> | setnickall <nickname> | resetnickall",
  cooldowns: 5
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
  return {
    active: false,
    roasts: DEFAULT_ROASTS,
    lockedGroupName: null,
    lockNameEnabled: false,
    defaultNickname: null,
    threadSettings: {}
  };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// --- COMMAND HANDLER ---
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();
  if (!data.roasts || data.roasts.length === 0) data.roasts = DEFAULT_ROASTS;

  const isAdmin = (await api.getThreadInfo(threadID)).adminIDs.includes(senderID) || senderID === api.getCurrentUserID();

  if (sub === "on") {
    data.active = true;
    saveData(data);
    return api.sendMessage("🔥 Auto-reply ON sa GC na to. Gamitin /activate off para i-stop.", threadID, messageID);
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ Auto-reply OFF na.", threadID, messageID);
  }

  if (sub === "setname") {
    if (!isAdmin) return api.sendMessage("❌ Admin lang pwede gamitin to.", threadID, messageID);
    const newName = args.slice(1).join(" ");
    if (!newName) return api.sendMessage("Usage: /activate setname <Group Name>", threadID, messageID);
    
    data.lockedGroupName = newName;
    data.lockNameEnabled = true;
    if (!data.threadSettings[threadID]) data.threadSettings[threadID] = {};
    data.threadSettings[threadID].lockedName = newName;
    data.threadSettings[threadID].lockNameOn = true;
    
    saveData(data);
    await api.setTitle(newName, threadID);
    return api.sendMessage(`✅ Group name set at LOCKED:「${newName}」\nKapag may nagpalit, ibabalik ko agad to.`, threadID, messageID);
  }

  if (sub === "lockname") {
    if (!isAdmin) return api.sendMessage("❌ Admin lang pwede gamitin to.", threadID, messageID);
    const mode = (args[1] || "").toLowerCase();
    if (mode === "on") {
      data.lockNameEnabled = true;
      if (!data.threadSettings[threadID]) data.threadSettings[threadID] = {};
      data.threadSettings[threadID].lockNameOn = true;
      saveData(data);
      return api.sendMessage("🔒 Group Name Lock: ON", threadID, messageID);
    }
    if (mode === "off") {
      data.lockNameEnabled = false;
      if (data.threadSettings[threadID]) data.threadSettings[threadID].lockNameOn = false;
      saveData(data);
      return api.sendMessage("🔓 Group Name Lock: OFF", threadID, messageID);
    }
    return api.sendMessage("Usage: /activate lockname on | off", threadID, messageID);
  }

  if (sub === "setnickall") {
    if (!isAdmin) return api.sendMessage("❌ Admin lang pwede gamitin to.", threadID, messageID);
    const nick = args.slice(1).join(" ");
    if (!nick) return api.sendMessage("Usage: /activate setnickall <Nickname>\nExample: /activate setnickall ⟪RYUK⟫ {name}", threadID, messageID);
    
    data.defaultNickname = nick;
    if (!data.threadSettings[threadID]) data.threadSettings[threadID] = {};
    data.threadSettings[threadID].defaultNick = nick;
    saveData(data);

    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participants;
    let success = 0, fail = 0;

    api.sendMessage(`⏳ Nagseset ng nickname sa ${members.length} members...`, threadID);

    for (const member of members) {
      try {
        if (member.userID !== api.getCurrentUserID()) {
          let finalNick = nick.replace(/{name}/g, member.name || "Member");
          await api.changeNickname(finalNick, threadID, member.userID);
          success++;
        }
      } catch (e) { fail++; }
    }

    return api.sendMessage(`✅ Tapos na!\n✅ Success: ${success}\n❌ Failed: ${fail}\nTemplate: "${nick}"`, threadID, messageID);
  }

  if (sub === "setnick") {
    if (!isAdmin) return api.sendMessage("❌ Admin lang pwede gamitin to.", threadID, messageID);
    const nick = args.slice(1).join(" ");
    if (!nick) return api.sendMessage("Usage: /activate setnick <Nickname> — reply to someone's message to set theirs", threadID, messageID);
    
    if (event.messageReply && event.messageReply.senderID) {
      await api.changeNickname(nick, threadID, event.messageReply.senderID);
      return api.sendMessage(`✅ Nickname na-set: ${nick}`, threadID, messageID);
    }
    return api.sendMessage("⚠️ Reply ka muna sa message ng taong papalitan mo ng nickname, tapos gamitin ang command.", threadID, messageID);
  }

  if (sub === "resetnickall") {
    if (!isAdmin) return api.sendMessage("❌ Admin lang pwede gamitin to.", threadID, messageID);
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participants;
    let success = 0, fail = 0;

    api.sendMessage(`⏳ Nirereset ang nickname ng ${members.length} members...`, threadID);

    for (const member of members) {
      try {
        if (member.userID !== api.getCurrentUserID()) {
          await api.changeNickname("", threadID, member.userID);
          success++;
        }
      } catch (e) { fail++; }
    }

    return api.sendMessage(`✅ Reset tapos!\n✅ Success: ${success}\n❌ Failed: ${fail}`, threadID, messageID);
  }

  if (sub === "roast") {
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
    const ts = data.threadSettings[threadID] || {};
    return api.sendMessage(
      `📊 STATUS:\n` +
      `Auto-reply: ${data.active ? "ON 🔥" : "OFF"}\n` +
      `Group Name Lock: ${ts.lockNameOn ? "🔒 ON → " + (ts.lockedName || data.lockedGroupName) : "🔓 OFF"}\n` +
      `Default Nick: ${ts.defaultNick || data.defaultNickname || "Wala"}\n` +
      `Lines: ${data.roasts.length}`,
      threadID, messageID
    );
  }

  return api.sendMessage(
    "📖 Usage Guide:\n\n" +
    "🔧 General:\n" +
    "/activate on/off — start/stop auto-reply\n" +
    "/activate status — show current settings\n\n" +
    "🏷️ Group Name:\n" +
    "/activate setname <Name> — set at lock group name\n" +
    "/activate lockname on/off — i-on/off ang pagbabalik ng name\n\n" +
    "👤 Nicknames:\n" +
    "/activate setnickall <Name> — i-set sa LAHAT ng member\n" +
    "   pwede gamitin: {name} = tunay na pangalan nila\n" +
    "   Example: ⟪RYUK⟫ {name}\n" +
    "/activate setnick <Name> — reply sa tao tapos set name\n" +
    "/activate resetnickall — alisin lahat ng nickname\n\n" +
    "💬 Auto-reply:\n" +
    "/activate roast — send random line\n" +
    "/activate add <text> — add reply line\n" +
    "/activate listlines — view all lines",
    threadID, messageID
  );
};

// --- EVENT HANDLER — Auto-reply + Group Name Protection + TYPING INDICATOR ---
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData } = event;
  const botID = api.getCurrentUserID();

  if (logMessageType === "log:thread-name") {
    const data = loadData();
    const ts = data.threadSettings[threadID] || {};
    const lockedName = ts.lockedName || data.lockedGroupName;
    const shouldLock = ts.lockNameOn || data.lockNameEnabled;

    if (shouldLock && lockedName && logMessageData.name !== lockedName) {
      setTimeout(async () => {
        try {
          await api.setTitle(lockedName, threadID);
          api.sendMessage(`🔒 Hindi pwedeng palitan ang Group Name! Ibinalik ko na sa:「${lockedName}」`, threadID);
        } catch (e) {}
      }, 800);
    }
    return;
  }

  if (senderID === botID || !body || body.startsWith("/")) return;

  const data = loadData();
  if (data.active !== true) return;

  const typingTime = 1500 + Math.floor(Math.random() * 1500);

  api.sendTypingIndicator(threadID);

  const typingInterval = setInterval(() => {
    api.sendTypingIndicator(threadID);
  }, 3000);

  setTimeout(() => {
    clearInterval(typingInterval);
    const random = data.roasts[Math.floor(Math.random() * data.roasts.length)];
    api.sendMessage(random, threadID);
  }, typingTime);
};
