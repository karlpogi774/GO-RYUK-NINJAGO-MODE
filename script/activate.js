const fs = require("fs");
const path = require("path");

// ADMIN UID RESTRICTION
const ADMIN_UID = ["61594022290817", "61595507156493", "61595424150097"];

function isAdmin(senderID) {
  return ADMIN_UID.includes(String(senderID).trim());
}

module.exports.config = {
  name: "activate",
  version: "12.3.0",
  hasPermission: 2,
  credits: "Ryuk",
  description: "3 Admins • Auto GC Name Revert • setgname/setnick work anytime • Infinite commands",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "/activate on | off | status | add <text> | listlines | setnick [name] | setgname [name]",
  cooldowns: 3
};

const DATA_PATH = path.join(__dirname, "activate_data.json");
const DEFAULT_LOCKED_NAME = "The one they can't change";

const REACT_EMOJIS = ["🔥", "💀", "🤣", "😆", "🤡", "👎", "⚡", "😈"];

const DEFAULT_TAGALOG_ROASTS = [
  "Luh, nag-type pa talaga siya oh, akala mo naman may kumpirmasyon. 💀",
  "Lods, paki-delete na lang 'to bago pa makita ng iba, nakakahiya. 🤣",
  "Lakas ng loob mo mag-chat, pero yung sinabi mo walang kwenta.",
  "Sino nagtanong sa'yo? Lakas maka-main character ah.",
  "Bro, isip muna bago pindot ng send button, napapahalata ka eh.",
  "Pang-asar ba 'yan o self-humiliation? Clarify natin.",
  "Sana bago ka nag-text, nag-isip ka muna ng limang beses.",
  "Quiet ka na lang muna lods, nauubusan na kami ng patience sa'yo.",
  "I-off mo na wifi mo, hindi para sa'yo ang araw na 'to.",
  "Ganda ng sinabi mo ah, kasing ganda ng blankong papel. 🤡",
  "Ulitin mo nga 'yan, para mas lalo ka naming pagtawanan.",
  "May group chat restraint order ka na ba? Kasi lapit na kita i-report.",
  "Tigilan mo na 'yan, pati 'yung keyboard mo sumusuko na sa'yo.",
  "Confidence level: 100%. Sense level: 0%.",
  "Sige lang, ipagpatuloy mo 'yan... hanggang sa wala nang makipag-usap sa'yo."
];

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      if (!parsed.roasts || parsed.roasts.length === 0) parsed.roasts = DEFAULT_TAGALOG_ROASTS;
      if (!parsed.gcName) parsed.gcName = DEFAULT_LOCKED_NAME;
      if (!parsed.nickName) parsed.nickName = DEFAULT_LOCKED_NAME;
      return parsed;
    }
  } catch {}
  return { 
    active: false, 
    activatedBy: null, 
    roasts: DEFAULT_TAGALOG_ROASTS, 
    gcName: DEFAULT_LOCKED_NAME,
    nickName: DEFAULT_LOCKED_NAME
  };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function isActive() {
  const data = loadData();
  return data.active === true;
}

const lastResponseTime = new Map();
const COOLDOWN_DELAY = 2000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ===== AUTO-REVERT GC NAME =====
async function checkAndRevertName(api, threadID, targetName) {
  try {
    const info = await api.getThreadInfo(threadID);
    if (info.threadName !== targetName) {
      await sleep(800 + Math.floor(Math.random() * 700));
      api.setTitle(targetName, threadID, (err) => {
        if (err) console.error("❌ Revert failed:", err);
        else console.log(`✅ GC Name reverted to: "${targetName}"`);
      });
    }
  } catch (e) {
    console.error("❌ Check error:", e);
  }
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData, isGroup, type } = event;
  const data = loadData();
  const lockedGcName = data.gcName || DEFAULT_LOCKED_NAME;

  // ===== AUTO-REVERT — GAGANA KAHIT NAKA-OFF ANG BOT =====
  if (isGroup && logMessageType === "log:thread-name") {
    if (logMessageData && logMessageData.name !== lockedGcName) {
      console.log(`⚠️ Name changed to: "${logMessageData.name}" — Reverting...`);
      checkAndRevertName(api, threadID, lockedGcName);
    }
    return;
  }

  if (type === "message_unsend" && isActive()) {
    return api.sendMessage(`👀 Uh-oh! May nag-unsend ng message sa GC! Huli ka pero hindi kulong. 🤫`, threadID);
  }

  if (!body || senderID === api.getCurrentUserID()) return;
  const lowerBody = body.trim().toLowerCase();

  // ===== SETGNAME VIA CHAT — GAGANA KAHIT NAKA-OFF ANG BOT =====
  if (lowerBody.startsWith("setgname")) {
    if (!isAdmin(senderID)) {
      return api.sendMessage("❌ Restricted: Admin lamang ang pwedeng magpalit ng GC Name.", threadID, messageID);
    }
    const newGcName = body.slice(8).trim() || DEFAULT_LOCKED_NAME;
    if (!isGroup) return api.sendMessage("❌ Gamitin lang ito sa Group Chat.", threadID, messageID);
    
    data.gcName = newGcName;
    saveData(data);
    api.setTitle(newGcName, threadID, (err) => {
      if (err) return api.sendMessage("❌ Hindi ko mabago ang pangalan. Siguraduhing admin ang bot.", threadID, messageID);
      return api.sendMessage(`✅ ✅ GC Name set to: "${newGcName}"\n🔒 Auto-revert: ON — babalik agad kapag may nagpalit!`, threadID, messageID);
    });
    return;
  }

  // ===== SETNICK VIA CHAT — GAGANA KAHIT NAKA-OFF ANG BOT =====
  if (lowerBody.startsWith("setnick")) {
    if (!isAdmin(senderID)) {
      return api.sendMessage("❌ Restricted: Admin lamang ang pwedeng magpalit ng Nicknames.", threadID, messageID);
    }
    const newNick = body.slice(7).trim();
    if (!newNick) return api.sendMessage("❌ Ilagay ang pangalan.\nHalimbawa: setnick Ryuk", threadID, messageID);
    if (!isGroup) return api.sendMessage("❌ Gamitin lang ito sa Group Chat.", threadID, messageID);
    
    data.nickName = newNick;
    saveData(data);
    
    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs;
      
      api.sendMessage(`⏳ Binabago ang nickname ng ${members.length} miyembro...`, threadID);
      
      for (const id of members) {
        await sleep(500);
        api.changeNickname(newNick, threadID, id, (err) => {
          if (err) console.error(`❌ Failed for ${id}:`, err);
        });
      }
      return api.sendMessage(`✅ ✅ Lahat ng nickname ay: "${newNick}"`, threadID, messageID);
    } catch (e) {
      return api.sendMessage("❌ Error. Siguraduhing admin ang bot sa GC.", threadID, messageID);
    }
  }

  if (!isActive()) return;
  if (lowerBody.startsWith("/activate")) return;
  
  const now = Date.now();
  if (now - (lastResponseTime.get(threadID) || 0) < COOLDOWN_DELAY) return;
  lastResponseTime.set(threadID, now);

  try {
    const lines = data.roasts || DEFAULT_TAGALOG_ROASTS;
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    await sleep(2000);
    api.sendMessage({
      body: randomLine,
      mentions: [{ tag: `@${senderID}`, id: senderID }]
    }, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        await sleep(800);
        api.setMessageReaction(randomEmoji, info.messageID, () => {}, true);
      }
    }, messageID);
  } catch (e) {
    console.error("❌ Reply error:", e);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, isGroup } = event;
  
  if (!isAdmin(senderID)) {
    return api.sendMessage("❌ Access Denied: Admin lamang ang pwedeng gumamit ng commands.", threadID, messageID);
  }

  const cmd = (args[0] || "").toLowerCase();
  const data = loadData();

  if (cmd === "on") {
    data.active = true;
    data.activatedBy = senderID;
    saveData(data);
    const name = data.gcName || DEFAULT_LOCKED_NAME;
    if (isGroup) api.setTitle(name, threadID, () => {});
    return api.sendMessage(
      `✅ BOT ACTIVATED — INFINITE MODE ♾️\n\n` +
      `• Auto-Revert GC Name: ✅ ALWAYS ON\n` +
      `• setgname/setnick: ✅ Gagana kahit naka-OFF\n` +
      `• Auto-Reply: ✅ ACTIVE\n` +
      `• Locked Name: "${name}"\n\n` +
      `Commands:\n` +
      `setgname [pangalan] — I-lock ang GC name\n` +
      `setnick [pangalan] — Palitan nickname ng lahat\n` +
      `/activate off — I-pause auto-reply`,
      threadID, messageID
    );
  }

  if (cmd === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage(`✅ Auto-reply paused.\n🔒 Pero setgname at auto-revert ay GAGANA PA RIN FOREVER ♾️`, threadID, messageID);
  }

  if (cmd === "status") {
    const totalLines = (data.roasts || DEFAULT_TAGALOG_ROASTS).length;
    return api.sendMessage(
      `📊 BOT STATUS\n` +
      `• Auto-Reply: ${data.active ? "✅ ON" : "⏸️ OFF"}\n` +
      `• Auto-Revert GC Name: ✅ ALWAYS ACTIVE ♾️\n` +
      `• Locked GC Name: "${data.gcName || DEFAULT_LOCKED_NAME}"\n` +
      `• Nickname: "${data.nickName || DEFAULT_LOCKED_NAME}"\n` +
      `• Reply Lines: ${totalLines}\n` +
      `• Admins: 3 (61594022290817, 61595507156493, 61595424150097)\n` +
      `• setgname/setnick: ✅ FOREVER ACTIVE — hindi kailangan i-on ang bot`,
      threadID, messageID
    );
  }

  if (cmd === "add") {
    const line = args.slice(1).join(" ");
    if (!line) return api.sendMessage("❌ Ilagay ang linyang idadagdag.", threadID, messageID);
    if (!data.roasts) data.roasts = DEFAULT_TAGALOG_ROASTS;
    data.roasts.push(line);
    saveData(data);
    return api.sendMessage(`✅ Naidagdag:\n"${line}"`, threadID, messageID);
  }

  if (cmd === "listlines") {
    const list = data.roasts || DEFAULT_TAGALOG_ROASTS;
    let msg = `📜 Reply Lines (${list.length}):\n\n`;
    list.forEach((l, i) => msg += `${i + 1}. ${l}\n`);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (cmd === "setnick") {
    if (!isGroup) return api.sendMessage("❌ Gamitin lang sa GC.", threadID, messageID);
    const newNick = args.slice(1).join(" ");
    if (!newNick) return api.sendMessage("❌ Halimbawa: /activate setnick Ryuk", threadID, messageID);
    
    data.nickName = newNick;
    saveData(data);
    
    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs;
      api.sendMessage(`⏳ Binabago ang nickname ng ${members.length} miyembro...`, threadID);
      
      for (const id of members) {
        await sleep(500);
        api.changeNickname(newNick, threadID, id, () => {});
      }
      return api.sendMessage(`✅ ✅ Lahat ng nickname: "${newNick}" ♾️`, threadID, messageID);
    } catch (e) {
      return api.sendMessage("❌ Siguraduhing admin ang bot sa GC.", threadID, messageID);
    }
  }

  if (cmd === "setgname") {
    if (!isGroup) return api.sendMessage("❌ Gamitin lang sa GC.", threadID, messageID);
    const newName = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.gcName = newName;
    saveData(data);
    api.setTitle(newName, threadID, (err) => {
      if (err) return api.sendMessage("❌ Hindi mabago ang pangalan.", threadID, messageID);
      return api.sendMessage(`✅ ✅ GC Name: "${newName}"\n🔒 Auto-revert: ACTIVE FOREVER ♾️ — babalik agad kapag may nagpalit!`, threadID, messageID);
    });
    return;
  }

  return api.sendMessage(
    `🔒 COMMANDS:\n\n` +
    `📌 Kahit walang /activate — i-type lang sa chat:\n` +
    `setgname [pangalan] — I-lock ang GC name\n` +
    `setnick [pangalan] — Palitan nickname ng lahat\n\n` +
    `📌 Gamit ang /activate:\n` +
    `/activate on — I-on ang auto-reply\n` +
    `/activate off — I-pause ang auto-reply\n` +
    `/activate status — Tignan ang status\n` +
    `/activate add <text> — Magdagdag ng reply line\n` +
    `/activate listlines — Ilista ang lahat ng lines\n\n` +
    `♾️ setgname at auto-revert: GAGANA FOREVER — hindi kailangan i-on ang bot!`,
    threadID, messageID
  );
};
