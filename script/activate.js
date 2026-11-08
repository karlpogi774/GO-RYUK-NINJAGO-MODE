const fs = require("fs");
const path = require("path");

// ===== IMPORT ECLIPSE MODULES =====
const { calculateHumanDelay } = require("./human-delay");
const { humanize } = require("./human-mimic");
const { withTyping } = require("./human-typing");
const { rememberBanatReply, getUnusedReply } = require("./banat-memory");
const { getBanatConversationReply } = require("./triggers");
const { isDuplicateMessage } = require("./message-dedupe");

module.exports.config = {
  name: "activate",
  version: "11.0.0-safe",
  hasPermission: 0,
  credits: "sinzu & Eclipse · SAFE MODE",
  description: "⚠️ CONSERVATIVE — Slower, less frequent, anti-detect",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "/activate on | off | status | add | listlines | clearhistory",
  cooldowns: 8
};

// 🔒 AUTHORIZED OWNER & ADMIN UIDS
const AUTHORIZED_UIDS = [
  "61594325727109",
  "61595932841761"
];

const DATA_PATH = path.join(__dirname, "activate_data.json");

// 🛡️ SAFETY SETTINGS — CONSERVATIVE
const SAFETY = {
  MIN_COOLDOWN: 4000,        // ⏳ 4 seconds minimum between replies
  REPLY_CHANCE: 0.65,        // 🎲 65% lang sasagot — 35% chance manahimik
  TYPING_CHANCE: 0.85,       // ⌨️ 85% lang magpapakita ng typing indicator
  SILENT_HOURS: true,        // 🌙 Auto-pause 1 AM – 5 AM
  SILENT_START: 1,
  SILENT_END: 5
};

// Emojis for auto self-react — ONLY on own messages
const REACT_EMOJIS = ["😏", "🗿", "💀", "😂", "🤷"];

// Default Tagalog roasts — mas maikli, mas natural
const DEFAULT_TAGALOG_ROASTS = [
  "Bahala kayo diyan.",
  "Gets naman.",
  "Sige lang.",
  "Okay lang 'yan.",
  "Wala lang.",
  "Hahaha.",
  "Respeto lang naman ang hinihingi.",
  "Huwag masyadong seryoso.",
  "Kayo mag-usap, manonood lang ako.",
  "Ingat palagi.",
  "Hindi ko na masasagot 'yan.",
  "Kanya-kanya naman tayo ng pananaw.",
  "Sige na, tama na.",
  "Mabuti pa magpahinga na lang kayo.",
  "Huwag na mag-away.",
  "Kung masaya kayo, go lang.",
  "Wala akong pinipiling panig.",
  "Respeto sa opinyon ng iba.",
  "Okay, gets ko na ang punto mo.",
  "Ikaw lang nakakaramdam nun."
];

// ===== DATA MANAGEMENT =====
function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      if (!parsed.roasts || parsed.roasts.length === 0) {
        parsed.roasts = [...DEFAULT_TAGALOG_ROASTS];
      }
      return parsed;
    }
  } catch {}
  return { active: false, activatedBy: null, roasts: [...DEFAULT_TAGALOG_ROASTS] };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function isActive() {
  const data = loadData();
  return data.active === true;
}

function isSilentHours() {
  if (!SAFETY.SILENT_HOURS) return false;
  const hour = new Date().getHours();
  return hour >= SAFETY.SILENT_START || hour < SAFETY.SILENT_END;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ===== SEQUENTIAL LINE PICKER =====
const threadSequence = new Map();
function getSequentialReply(threadID, replies) {
  const list = replies || DEFAULT_TAGALOG_ROASTS;
  if (!threadSequence.has(threadID)) threadSequence.set(threadID, 0);
  let idx = threadSequence.get(threadID);
  const line = list[idx];
  idx = (idx + 1) % list.length;
  threadSequence.set(threadID, idx);
  return line;
}

// ===== ANTI-SPAM =====
const lastResponseTime = new Map();
const recentMessageCount = new Map();

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  const botID = api.getCurrentUserID();

  if (!isActive()) return;
  if (!body || senderID === botID) return;
  if (body.toLowerCase().startsWith("/activate")) return;
  if (isDuplicateMessage(messageID)) return;

  // 🌙 Auto-pause during silent hours
  if (isSilentHours()) return;

  const now = Date.now();
  const lastTime = lastResponseTime.get(threadID) || 0;

  // Anti-spam cooldown
  if (now - lastTime < SAFETY.MIN_COOLDOWN) return;

  // 🎲 Random chance to stay silent — mas natural
  if (Math.random() > SAFETY.REPLY_CHANCE) return;

  lastResponseTime.set(threadID, now);
  const recent = recentMessageCount.get(threadID) || 0;
  recentMessageCount.set(threadID, Math.min(10, recent + 1));
  setTimeout(() => recentMessageCount.set(threadID, Math.max(0, recentMessageCount.get(threadID) - 1)), 30000);

  try {
    const data = loadData();
    const roastsList = data.roasts || DEFAULT_TAGALOG_ROASTS;

    // Step 1: Check triggers first
    let replyText = getBanatConversationReply(body, threadID);
    
    // Step 2: Sequential + avoid repeats
    if (!replyText) {
      const candidate = getSequentialReply(threadID, roastsList);
      replyText = getUnusedReply(threadID, [candidate, ...roastsList.filter(r => r !== candidate)]);
      rememberBanatReply(threadID, replyText);
    }

    // Step 3: Humanize
    replyText = humanize(replyText, {
      abbreviate: false,
      typos: false,
      punctuation: true
    });

    // Step 4: Natural delay
    const delayResult = calculateHumanDelay(replyText, {
      incomingText: body,
      recentMessages: recent,
      mode: "slow" // ⬅️ Mas mabagal = mas ligtas
    });

    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
    const showTyping = Math.random() < SAFETY.TYPING_CHANCE;

    // Step 5: Send — minsan walang typing indicator para hindi predictable
    if (showTyping) {
      await withTyping(api, threadID, delayResult.totalMs, async () => {
        sendReply();
      });
    } else {
      await sleep(delayResult.totalMs);
      sendReply();
    }

    function sendReply() {
      api.sendMessage({
        body: replyText,
        mentions: [{ tag: `@${senderID}`, id: senderID }]
      }, threadID, async (err, info) => {
        if (!err && info?.messageID) {
          await sleep(600 + Math.floor(Math.random() * 600));
          api.setMessageReaction(randomEmoji, info.messageID, (reactErr) => {}, true);
        }
      }, messageID);
    }
  } catch (error) {
    console.error("⚠️ Reply skipped:", error.message);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!AUTHORIZED_UIDS.includes(senderID)) {
    return api.sendMessage("❌ Restricted — Admin only.", threadID, messageID);
  }

  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    data.activatedAt = Date.now();
    saveData(data);
    return api.sendMessage(
      `✅ BOT ACTIVATED — SAFE MODE\n\n` +
      `⏱ Min delay: ${SAFETY.MIN_COOLDOWN/1000}s+\n` +
      `🎲 Reply chance: ${Math.round(SAFETY.REPLY_CHANCE*100)}%\n` +
      `🌙 Silent hours: ${SAFETY.SILENT_START}:00–${SAFETY.SILENT_END}:00\n` +
      `⚠️ Use responsibly — no script is 100% undetectable\n\n` +
      `/activate off para itigil.`,
      threadID,
      messageID
    );
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("⏳ Bot deactivated.", threadID, messageID);
  }

  if (sub === "status") {
    const active = isActive();
    const totalLines = (data.roasts || DEFAULT_TAGALOG_ROASTS).length;
    return api.sendMessage(
      `${active ? "✅ ONLINE" : "⏳ OFFLINE"} — Safe Mode\n\n` +
      `Reply lines: ${totalLines}\n` +
      `Silent hours: ${SAFETY.SILENT_HOURS ? "ON" : "OFF"}\n` +
      `Admin: Verified 🔒`,
      threadID,
      messageID
    );
  }

  if (sub === "add") {
    const customLine = args.slice(1).join(" ");
    if (!customLine) return api.sendMessage("❌ Gamitin: /activate add <text>", threadID, messageID);
    if (!data.roasts) data.roasts = [...DEFAULT_TAGALOG_ROASTS];
    data.roasts.push(customLine);
    saveData(data);
    return api.sendMessage(`✅ Naidagdag:\n"${customLine}"`, threadID, messageID);
  }

  if (sub === "listlines") {
    const list = data.roasts || DEFAULT_TAGALOG_ROASTS;
    let msg = `📜 Reply Lines (${list.length}):\n\n`;
    list.forEach((line, i) => msg += `${i + 1}. ${line}\n`);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (sub === "clearhistory") {
    threadSequence.delete(threadID);
    return api.sendMessage("✅ Reply sequence reset na.", threadID, messageID);
  }

  return api.sendMessage(
    `Commands:\n` +
    `/activate on — Simulan\n` +
    `/activate off — Itigil\n` +
    `/activate status — Tingnan status\n` +
    `/activate add <text> — Magdagdag ng linya\n` +
    `/activate listlines — Ilista lahat\n` +
    `/activate clearhistory — I-reset ang sequence`,
    threadID,
    messageID
  );
};
      
