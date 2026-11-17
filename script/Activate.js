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
  version: "10.7.1",
  hasPermission: 2,
  credits: "sinzu & Eclipse",
  description: "Tagalog Auto-Roast · Auto GC Name · Spam Mode · Anti-Spam · Anti-Dupe · Multi-Admin Lock",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/activate on | off | status | add | listlines | setnick | startgcname | stopgcname | spam | spamstop",
  cooldowns: 5
};

// 🔒 AUTHORIZED ADMIN UIDS
const AUTHORIZED_UIDS = [
  "61596315422605",
  "61595955098183",
  "61596600291238",
  "61596182742640"
];

const DATA_PATH = path.join(__dirname, "activate_data.json");

// ⏱️ DELAY SETTINGS — UPDATED TO 5 SECONDS
const GC_NAME_DELAY_MS = 5000;      // 🏷️ Auto GC Name: 5 seconds
const SPAM_DELAY_MS = 5000;         // 💬 Spam Mode: 5 seconds

// 📢 AUTO GROUP CHAT NAMES
const AUTO_GC_NAMES = [
  "😏 Nandito lang ako...",
  "Hoy! Gising na kayo!",
  "Bakit ang tahimik niyo?",
  "Ako lang ba ang buhay dito?",
  "Hello? May tao ba diyan?",
  "Sige na magsalita naman kayo",
  "Pag ako lang magsasalita...",
  "Wala bang may sasabihin?",
  "Edi ako na lang magsasalita 😎",
  "Ang boring naman dito eh",
  "Kausapin niyo naman ako 😭",
  "Pag hindi kayo magsalita...",
  "Ako magpapasaya sa inyo 😌",
  "Bakit walang nagre-reply?",
  "Okay lang ako naman masaya mag-isa 😤"
];

// 💬 SPAM MESSAGES
const SPAM_MESSAGES = [
  "Mga tol, gising na kayo diyan! 😂",
  "Ang tahimik naman dito, may buhay pa ba kayo?",
  "Hello? May tao ba diyan o patay na ang GC?",
  "Ayan na ako, bakit kayo tahimik?",
  "Sige na magsalita naman kayo, ang boring eh",
  "Andito na ang hari ng kalokohan 😎",
  "Buhay pa ba ang group chat na 'to?",
  "Pag may tumahimik, automatic talo 😏",
  "Wala bang may gustong magsalita? Sige ako na lang",
  "Ang lungkot naman dito, parang sementeryo 😭",
  "Gising mga pare, oras na para mag-ingay!",
  "Bakit walang nagre-reply? Masama ba timpla ng kape niyo?",
  "Kung tahimik kayo, ako magsasalita para sa inyo 😌",
  "Ingay naman diyan, wag kayong mahiyain!",
  "Ako lang ba ang buhay dito? Hello? 🙋"
];

// Default Tagalog roasts
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
  "Confidence level: 100%. Sense level: 0%.",
  "Ang daldal mo pero wala namang laman. Classic.",
  "Ang hirap kausap, parang pader na nagsasalita."
];

// ===== STATE MANAGEMENT =====
const gcNameActive = new Map();
const gcNameIndex = new Map();
const gcNameTimer = new Map();

const spamActive = new Map();
const spamIndex = new Map();
const spamTimer = new Map();

const lastResponseTime = new Map();
const recentMessageCount = new Map();
const threadSequence = new Map();
const COOLDOWN_DELAY = 1800;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  } catch (e) {
    console.error("[ACTIVATE] Load error:", e);
  }
  return { active: false, activatedBy: null, roasts: [...DEFAULT_TAGALOG_ROASTS] };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error("[ACTIVATE] Save error:", e);
    return false;
  }
}

function isActive() {
  return loadData().active === true;
}

// ===== SEQUENTIAL ROAST PICKER =====
function getSequentialReply(threadID, replies) {
  const list = replies || DEFAULT_TAGALOG_ROASTS;
  if (!threadSequence.has(threadID)) threadSequence.set(threadID, 0);
  let idx = threadSequence.get(threadID);
  const line = list[idx];
  idx = (idx + 1) % list.length;
  threadSequence.set(threadID, idx);
  return line;
}

// ===== 🏷️ AUTO GC NAME MODE =====
function getNextGcName(threadID) {
  if (!gcNameIndex.has(threadID)) gcNameIndex.set(threadID, 0);
  let idx = gcNameIndex.get(threadID);
  const name = AUTO_GC_NAMES[idx];
  idx = (idx + 1) % AUTO_GC_NAMES.length;
  gcNameIndex.set(threadID, idx);
  return name;
}

async function startGcNameMode(api, threadID) {
  if (gcNameActive.get(threadID)) return false;
  gcNameActive.set(threadID, true);

  const nameLoop = async () => {
    if (!gcNameActive.get(threadID)) return;
    try {
      const newName = getNextGcName(threadID);
      api.setTitle(newName, threadID, (err) => {
        if (err) console.error("[GC-NAME] Error:", err?.message || err);
      });
    } catch (e) {
      console.error("[GC-NAME] Loop error:", e);
    }
    if (gcNameActive.get(threadID)) {
      gcNameTimer.set(threadID, setTimeout(nameLoop, GC_NAME_DELAY_MS));
    }
  };
  nameLoop();
  return true;
}

function stopGcNameMode(threadID) {
  gcNameActive.set(threadID, false);
  if (gcNameTimer.has(threadID)) {
    clearTimeout(gcNameTimer.get(threadID));
    gcNameTimer.delete(threadID);
  }
  gcNameIndex.delete(threadID);
  return true;
}

// ===== 💬 SPAM MESSAGE MODE =====
function getNextSpamMessage(threadID, customMsg = null) {
  if (customMsg) return customMsg;
  if (!spamIndex.has(threadID)) spamIndex.set(threadID, 0);
  let idx = spamIndex.get(threadID);
  const msg = SPAM_MESSAGES[idx];
  idx = (idx + 1) % SPAM_MESSAGES.length;
  spamIndex.set(threadID, idx);
  return msg;
}

async function startSpamMode(api, threadID, customMsg = null) {
  if (spamActive.get(threadID)) return false;
  spamActive.set(threadID, true);

  const spamLoop = async () => {
    if (!spamActive.get(threadID)) return;
    try {
      const msg = customMsg || getNextSpamMessage(threadID);
      api.sendMessage(msg, threadID, (err) => {
        if (err) console.error("[SPAM] Error:", err?.message || err);
        if (spamActive.get(threadID)) {
          spamTimer.set(threadID, setTimeout(spamLoop, SPAM_DELAY_MS));
        }
      });
    } catch (e) {
      console.error("[SPAM] Loop error:", e);
      if (spamActive.get(threadID)) {
        spamTimer.set(threadID, setTimeout(spamLoop, SPAM_DELAY_MS));
      }
    }
  };
  spamLoop();
  return true;
}

function stopSpamMode(threadID) {
  spamActive.set(threadID, false);
  if (spamTimer.has(threadID)) {
    clearTimeout(spamTimer.get(threadID));
    spamTimer.delete(threadID);
  }
  spamIndex.delete(threadID);
  return true;
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!isActive()) return;
  if (isDuplicateMessage(messageID)) return;
  if (!body || senderID === api.getCurrentUserID()) return;
  if (body.toLowerCase().startsWith("/activate")) return;

  const now = Date.now();
  const lastTime = lastResponseTime.get(threadID) || 0;
  if (now - lastTime < COOLDOWN_DELAY) return;
  lastResponseTime.set(threadID, now);

  const recent = recentMessageCount.get(threadID) || 0;
  recentMessageCount.set(threadID, Math.min(10, recent + 1));
  setTimeout(() => recentMessageCount.set(threadID, Math.max(0, recentMessageCount.get(threadID) - 1)), 30000);

  try {
    const data = loadData();
    const roastsList = data.roasts || DEFAULT_TAGALOG_ROASTS;

    let replyText = getBanatConversationReply(body, threadID);
    if (!replyText) {
      const candidate = getSequentialReply(threadID, roastsList);
      replyText = getUnusedReply(threadID, [candidate, ...roastsList.filter(r => r !== candidate)]);
      rememberBanatReply(threadID, replyText);
    }
    if (!replyText) return;

    replyText = humanize(replyText, { abbreviate: false, typos: false, punctuation: true });
    const delayResult = calculateHumanDelay(replyText, { incomingText: body, recentMessages: recent, mode: "normal" });

    await withTyping(api, threadID, delayResult.totalMs, async () => {
      api.sendMessage({
        body: replyText,
        mentions: [{ tag: `@${senderID}`, id: senderID }]
      }, threadID, undefined, messageID);
    });
  } catch (error) {
    console.error("[EVENT] Error:", error);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args = [] }) {
  const { threadID, messageID, senderID } = event;

  if (!AUTHORIZED_UIDS.includes(senderID)) {
    return api.sendMessage("❌ Restricted: Ikaw ay hindi awtorisadong admin.", threadID, messageID);
  }

  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    data.activatedAt = Date.now();
    saveData(data);
    return api.sendMessage("🔥 AUTO-ROAST: ON ✅\n\n/activate off para itigil", threadID, messageID);
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ AUTO-ROAST: OFF", threadID, messageID);
  }

  if (sub === "status") {
    const gcNameRunning = gcNameActive.get(threadID) ? "🟢 ON" : "🔴 OFF";
    const spamRunning = spamActive.get(threadID) ? "🟢 ON" : "🔴 OFF";
    return api.sendMessage(
      "📊 STATUS:\n\n" +
      `Auto-Roast: ${data.active ? "🟢 ON" : "🔴 OFF"}\n` +
      `Auto GC Name: ${gcNameRunning} (5s delay)\n` +
      `Spam Mode: ${spamRunning} (5s delay)\n` +
      `Admin: ${AUTHORIZED_UIDS.length} verified 🔒`,
      threadID, messageID
    );
  }

  if (sub === "add") {
    const line = args.slice(1).join(" ").trim();
    if (!line) return api.sendMessage("❌ Gamitin: /activate add <text>", threadID, messageID);
    if (!data.roasts) data.roasts = [...DEFAULT_TAGALOG_ROASTS];
    data.roasts.push(line);
    saveData(data);
    return api.sendMessage(`✅ Naidagdag: "${line}"`, threadID, messageID);
  }

  if (sub === "listlines") {
    const list = data.roasts || DEFAULT_TAGALOG_ROASTS;
    return api.sendMessage(`📜 Reply Lines (${list.length}):\n\n${list.map((l,i)=>`${i+1}. ${l}`).join('\n')}`, threadID, messageID);
  }

  if (sub === "setnick") {
    try {
      const info = await api.getThreadInfo(threadID);
      const pids = info.participantIDs || [];
      api.sendMessage(`⏳ Binabago ${pids.length} nicknames...`, threadID, messageID);
      for (const uid of pids) {
        await sleep(500);
        api.changeNickname("Ryuk pogi", threadID, uid, () => {});
      }
      return api.sendMessage("✅ Done — lahat ay 'Ryuk pogi' na!", threadID, messageID);
    } catch {
      return api.sendMessage("❌ Siguraduhing admin ang bot.", threadID, messageID);
    }
  }

  if (sub === "startgcname") {
    if (gcNameActive.get(threadID)) {
      return api.sendMessage("⚠️ Naka-ON na! Gamitin: /activate stopgcname", threadID, messageID);
    }
    await startGcNameMode(api, threadID);
    return api.sendMessage(
      "🏷️ AUTO GC NAME: NAKA-ON ✅\n\n" +
      "⏱️ Delay: 5 segundo bawat palit\n" +
      "💬 Hiwalay sa Spam Mode!\n\n" +
      "/activate stopgcname para itigil",
      threadID, messageID
    );
  }

  if (sub === "stopgcname") {
    stopGcNameMode(threadID);
    return api.sendMessage("🛑 AUTO GC NAME: NAKA-OFF ✅", threadID, messageID);
  }

  if (sub === "spam") {
    if (spamActive.get(threadID)) {
      return api.sendMessage("⚠️ Spam Mode ay ON na! Gamitin: /activate spamstop", threadID, messageID);
    }
    const custom = args.slice(1).join(" ").trim() || null;
    await startSpamMode(api, threadID, custom);
    return api.sendMessage(
      "💬 SPAM MODE: NAKA-ON ✅\n\n" +
      "⏱️ Delay: 5 segundo bawat mensahe\n" +
      "🏷️ Hindi babaguhin ang pangalan ng GC!\n\n" +
      "/activate spamstop para itigil",
      threadID, messageID
    );
  }

  if (sub === "spamstop") {
    stopSpamMode(threadID);
    return api.sendMessage("🛑 SPAM MODE: NAKA-OFF ✅", threadID, messageID);
  }

  return api.sendMessage(
    "📋 MGA COMMANDS:\n\n" +
    "🔥 AUTO-ROAST:\n" +
    "/activate on / off / status\n" +
    "/activate add <text> — magdagdag ng banat\n" +
    "/activate listlines — ilista lahat\n" +
    "/activate setnick — gawing 'Ryuk pogi' lahat ng nick\n\n" +
    "🏷️ AUTO GC NAME:\n" +
    "/activate startgcname — simulan (5s)\n" +
    "/activate stopgcname — itigil\n\n" +
    "💬 SPAM MODE:\n" +
    "/activate spam [msg] — simulan (5s)\n" +
    "/activate spamstop — itigil",
    threadID, messageID
  );
};
