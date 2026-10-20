const fs = require("fs");
const path = require("path");

// ==========================================
// 🔥 RYUK — AUTO-REPLY SOLO MODE
// ✅ Magre-reply KAHIT walang nag-command
// ✅ LOCKED GC MODE — dito lang magre-reply
// ==========================================

const ADMIN_UID = ["61594022290817", "61595507156493", "61595424150097"];

function isAdmin(senderID) {
  return ADMIN_UID.includes(String(senderID).trim());
}

module.exports.config = {
  name: "ryuk",
  version: "1.1.0",
  hasPermission: 2,
  credits: "TITO KARL",
  description: "🔥 AUTO-REPLY — Magre-reply sa bawat message sa locked GC | Solo Mode",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "/ryuk lock | /ryuk unlock | /ryuk status | /ryuk setgname [name] | /ryuk setnick [name] | /ryuk addline [text] | /ryuk listlines | /ryuk delay [seconds]",
  cooldowns: 1
};

const DATA_PATH = path.join(__dirname, "ryuk_solo_data.json");
const DEFAULT_GC_NAME = "BLOØD ON TØP";

const REACT_EMOJIS = ["😏", "💀", "🔥", "⚡", "🗡️", "👑", "✨", "😈"];

const REPLY_LINES = [
  "😏 Nakikita kita...",
  "� Hindi mo kailangang magsalita para marinig kita.",
  "⚡ Bawat salita mo — alam ko kung saan papunta 'to.",
  "🗡️ Ingat ka sa mga sinasabi mo.",
  "👑 Dito lang ako. Hindi aalis.",
  "✨ Salita ka lang — handa akong makinig... o sumagot.",
  "🔥 Tahimik ka man o hindi — nandito lang ako.",
  "😈 Akala mo ba nakaligtas ka?",
  "🌑 Walang matatago dito.",
  "💪 Subukan mo lang — hindi kita titigilan.",
  "😌 Hinga ka muna. Nandito lang ako.",
  "⚡ Hindi kailangang tawagin para dumating ako.",
  "🖤 Bawat mensahe — may sagot dito.",
  "👁️ Nakatingin ako.",
  "✨ Handa akong sumagot — kahit hindi mo ako tawagin."
];

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      if (!parsed.lines || parsed.lines.length === 0) parsed.lines = REPLY_LINES;
      if (!parsed.gcName) parsed.gcName = DEFAULT_GC_NAME;
      if (!parsed.nickName) parsed.nickName = "";
      if (parsed.autoReply === undefined) parsed.autoReply = true; // ✅ ON by default
      if (!parsed.replyDelay) parsed.replyDelay = 2500;
      return parsed;
    }
  } catch {}
  return {
    lockedThreadID: null,
    gcName: DEFAULT_GC_NAME,
    nickName: "",
    lines: REPLY_LINES,
    autoReply: true, // ✅ Auto-reply ON
    replyDelay: 2500
  };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const lastReply = new Map();

// ===== AUTO-REVERT GC NAME =====
async function revertGcName(api, threadID, targetName) {
  try {
    const info = await api.getThreadInfo(threadID);
    if (info.threadName !== targetName) {
      await sleep(1000 + Math.floor(Math.random() * 500));
      api.setTitle(targetName, threadID, (err) => {
        if (!err) console.log(`🔄 Reverted GC name → "${targetName}"`);
      });
    }
  } catch (e) {}
}

// ===== RANDOM REPLY FUNCTION =====
async function sendRandomReply(api, threadID, senderID, messageID) {
  const data = loadData();
  
  // Check kung naka-ON ang auto-reply at locked GC lang
  if (!data.autoReply || !data.lockedThreadID || threadID !== data.lockedThreadID) return;
  
  // Huwag mag-reply sa sarili
  if (senderID === api.getCurrentUserID()) return;
  
  // Cooldown — para hindi spam
  const now = Date.now();
  if (now - (lastReply.get(threadID) || 0) < data.replyDelay) return;
  lastReply.set(threadID, now);

  try {
    const lines = data.lines || REPLY_LINES;
    const reply = lines[Math.floor(Math.random() * lines.length)];
    const emoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    await sleep(800 + Math.floor(Math.random() * 700));
    api.sendMessage(reply, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        await sleep(500);
        api.setMessageReaction(emoji, info.messageID, () => {}, true);
      }
    }, messageID);
  } catch (e) {}
}

// ===== EVENT HANDLER — AUTO-REPLY ON EVERY MESSAGE =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData, isGroup, type } = event;
  const data = loadData();

  // Auto-revert GC name — always active
  if (isGroup && logMessageType === "log:thread-name" && data.gcName) {
    if (logMessageData.name !== data.gcName) {
      revertGcName(api, threadID, data.gcName);
    }
    return;
  }

  // Auto-reply sa BAWAT message — kahit walang command! ✅
  if (body && !body.startsWith("/ryuk") && senderID !== api.getCurrentUserID()) {
    sendRandomReply(api, threadID, senderID, messageID);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, isGroup } = event;

  if (!isAdmin(senderID)) {
    return api.sendMessage("❌ Hindi ikaw ang may hawak ng susi.", threadID, messageID);
  }

  const cmd = (args[0] || "").toLowerCase();
  const data = loadData();

  if (cmd === "lock") {
    if (!isGroup) return api.sendMessage("❌ Gamitin lang sa Group Chat.", threadID, messageID);
    data.lockedThreadID = threadID;
    data.autoReply = true;
    saveData(data);
    return api.sendMessage(
      "✅ 🔒 GC LOCKED — AUTO-REPLY ACTIVE\n\n" +
      "✅ Magre-reply ako sa BAWAT message dito!\n" +
      "✅ Kahit walang nag-command — sagot agad ako!\n" +
      "❌ Sa ibang GC — mananahimik ako.\n\n" +
      `🔒 Locked GC: "${(await api.getThreadInfo(threadID)).threadName}"`,
      threadID, messageID
    );
  }

  if (cmd === "unlock") {
    data.lockedThreadID = null;
    saveData(data);
    return api.sendMessage("🔓 UNLOCKED — Hindi na ako magre-reply automatically.", threadID, messageID);
  }

  if (cmd === "off") {
    data.autoReply = false;
    saveData(data);
    return api.sendMessage("⏸️ Auto-reply OFF — Magre-reply lang ako kapag may command.", threadID, messageID);
  }

  if (cmd === "on") {
    data.autoReply = true;
    saveData(data);
    return api.sendMessage("✅ Auto-reply ON — Magre-reply ako sa bawat message!", threadID, messageID);
  }

  if (cmd === "status") {
    const lockedName = data.lockedThreadID ? "✅ LOCKED — SOLO MODE ON" : "🔓 UNLOCKED";
    const autoStatus = data.autoReply ? "✅ ACTIVE — Sagot sa bawat message!" : "⏸️ PAUSED — Command lang";
    return api.sendMessage(
      `🔥 RYUK — STATUS\n\n` +
      `Mode: ${lockedName}\n` +
      `Auto-Reply: ${autoStatus}\n` +
      `Reply Delay: ${(data.replyDelay / 1000).toFixed(1)}s\n` +
      `Locked GC Name: "${data.gcName}"\n` +
      `Reply Lines: ${(data.lines || REPLY_LINES).length}\n` +
      `Admins: 3`,
      threadID, messageID
    );
  }

  if (cmd === "setgname") {
    const newName = args.slice(1).join(" ").trim() || DEFAULT_GC_NAME;
    data.gcName = newName;
    saveData(data);
    api.setTitle(newName, threadID, () => {});
    return api.sendMessage(
      `✅ ✅ GC Name: "${newName}"\n` +
      `🔒 Auto-revert: ACTIVE — babalik agad kapag may nagpalit!`,
      threadID, messageID
    );
  }

  if (cmd === "setnick") {
    const newNick = args.slice(1).join(" ").trim();
    if (!newNick) return api.sendMessage("❌ Ilagay ang pangalan.\nHalimbawa: /ryuk setnick RYUK", threadID, messageID);
    data.nickName = newNick;
    saveData(data);
    return api.sendMessage(
      `✅ ✅ Nickname set to: "${newNick}"\n\n` +
      `I-apply sa lahat: /ryuk applynick`,
      threadID, messageID
    );
  }

  if (cmd === "applynick") {
    if (!data.nickName) return api.sendMessage("❌ Walang nakaset na nickname.\nGamitin muna: /ryuk setnick [pangalan]", threadID, messageID);
    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs;
      api.sendMessage(`⏳ Binabago ang nickname ng ${members.length} miyembro...`, threadID);
      for (const id of members) {
        await sleep(400);
        api.changeNickname(data.nickName, threadID, id, () => {});
      }
      return api.sendMessage(`✅ ✅ Lahat ng nickname: "${data.nickName}"`, threadID, messageID);
    } catch (e) {
      return api.sendMessage("❌ Siguraduhing admin ang bot.", threadID, messageID);
    }
  }

  if (cmd === "delay") {
    const sec = parseInt(args[0]);
    if (!sec || sec < 1 || sec > 60) return api.sendMessage("❌ Ilagay ang seconds (1-60).\nHalimbawa: /ryuk delay 3", threadID, messageID);
    data.replyDelay = sec * 1000;
    saveData(data);
    return api.sendMessage(`✅ Reply delay set to ${sec}s`, threadID, messageID);
  }

  if (cmd === "addline") {
    const text = args.slice(1).join(" ").trim();
    if (!text) return api.sendMessage("❌ Ilagay ang reply text.", threadID, messageID);
    if (!data.lines) data.lines = REPLY_LINES;
    data.lines.push(text);
    saveData(data);
    return api.sendMessage(`✅ Naidagdag:\n"${text}"`, threadID, messageID);
  }

  if (cmd === "listlines") {
    const list = data.lines || REPLY_LINES;
    let msg = `📜 REPLY LINES (${list.length}):\n\n`;
    list.forEach((l, i) => msg += `${i + 1}. ${l}\n`);
    return api.sendMessage(msg, threadID, messageID);
  }

  return api.sendMessage(
    `🔥 RYUK — COMMANDS\n\n` +
    `/ryuk lock       → I-lock + AUTO-REPLY dito lang ✅\n` +
    `/ryuk unlock     → I-unlock\n` +
    `/ryuk on         → I-ON auto-reply\n` +
    `/ryuk off        → I-OFF auto-reply\n` +
    `/ryuk status     → Tignan status\n` +
    `/ryuk setgname [name] → I-lock GC name\n` +
    `/ryuk setnick [name]  → I-set nickname\n` +
    `/ryuk applynick       → I-apply sa lahat\n` +
    `/ryuk delay [1-60]    → Palitan reply speed\n` +
    `/ryuk addline [text]  → Dagdag reply line\n` +
    `/ryuk listlines       → Ilista lahat ng replies\n\n` +
    `💡 Kapag naka-LOCK — magre-reply ako sa BAWAT message!\n` +
    `   Kahit walang nag-command — sagot agad! 😎🔥`,
    threadID, messageID
  );
};
  
