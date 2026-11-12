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
  version: "10.3.2",
  hasPermission: 2,
  credits: "sinzu & Eclipse",
  description: "Tagalog Auto-Roast · Sequential/Human Delay · Anti-Spam · Anti-Dupe · Multi-Admin Lock",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/activate on | off | status | add <text> | listlines | setnick",
  cooldowns: 5
};

// 🔒 AUTHORIZED ADMIN UIDS
const AUTHORIZED_UIDS = [
  "61596315422605",
  "61595955098183",
  "61596600291238"   // ✅ NAIDAGDAG
];

const DATA_PATH = path.join(__dirname, "activate_data.json");

// Emojis for auto self-react
const REACT_EMOJIS = ["🔥", "💀", "🤣", "😆", "🤡", "👎"];

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
  "Ulitin mo nga 'yan, para mas lalo ka naming pagtawanan.",
  "May group chat restraint order ka na ba? Kasi lapit na kita i-report.",
  "Tigilan mo na 'yan, pati 'yung keyboard mo sumusuko na sa'yo.",
  "Confidence level: 100%. Sense level: 0%.",
  "Sige lang, ipagpatuloy mo 'yan... hanggang sa wala nang makipag-usap sa'yo.",
  "Mukhang naubusan na ng brain cells, pahinga ka muna.",
  "Ang daldal mo pero wala namang laman. Classic.",
  "Hindi lahat kailangan sagutin, lalo na ikaw.",
  "Pwede bang mag-pause ka muna? Sayang lang data mo.",
  "Ang hirap kausap, parang pader na nagsasalita."
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

// ===== ANTI-SPAM SYSTEM =====
const lastResponseTime = new Map();
const recentMessageCount = new Map();
const COOLDOWN_DELAY = 1800;

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

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;

  if (!isActive()) return;

  // Skip duplicate messages
  if (isDuplicateMessage(messageID)) return;

  // Ignore own messages & command
  if (!body || senderID === api.getCurrentUserID() || body.toLowerCase().startsWith("/activate")) return;

  const now = Date.now();
  const lastTime = lastResponseTime.get(threadID) || 0;

  // Anti-spam check
  if (now - lastTime < COOLDOWN_DELAY) return;
  lastResponseTime.set(threadID, now);

  // Track recent messages for timing context
  const recent = recentMessageCount.get(threadID) || 0;
  recentMessageCount.set(threadID, Math.min(10, recent + 1));
  setTimeout(() => recentMessageCount.set(threadID, Math.max(0, recentMessageCount.get(threadID) - 1)), 30000);

  try {
    const data = loadData();
    const roastsList = data.roasts || DEFAULT_TAGALOG_ROASTS;

    // Step 1: Check triggers first
    let replyText = getBanatConversationReply(body, threadID);
    
    // Step 2: Fallback to sequential roasts — avoid repeats
    if (!replyText) {
      const candidate = getSequentialReply(threadID, roastsList);
      replyText = getUnusedReply(threadID, [candidate, ...roastsList.filter(r => r !== candidate)]);
      rememberBanatReply(threadID, replyText);
    }

    // Step 3: Humanize the text
    replyText = humanize(replyText, {
      abbreviate: false,
      typos: false,
      punctuation: true
    });

    // Step 4: Calculate natural delay
    const delayResult = calculateHumanDelay(replyText, {
      incomingText: body,
      recentMessages: recent,
      mode: "normal"
    });

    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    // Step 5: Send with typing indicator + natural delay
    await withTyping(api, threadID, delayResult.totalMs, async () => {
      api.sendMessage({
        body: replyText,
        mentions: [{ tag: `@${senderID}`, id: senderID }]
      }, threadID, async (err, info) => {
        if (!err && info && info.messageID) {
          await sleep(400 + Math.floor(Math.random() * 400));
          api.setMessageReaction(randomEmoji, info.messageID, (reactErr) => {
            if (reactErr) console.error("Self-react error:", reactErr);
          }, true);
        }
      }, messageID);
    });
  } catch (error) {
    console.error("Auto-reply error:", error);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  // 🔒 ADMIN LOCK
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
    return api.sendMessage(
      `🔥 TAGALOG GLOBAL AUTO-ROAST: ON\n\n` +
      `Mode: Sequential + Trigger replies ✅\n` +
      `Timing: Human Delay + Typing Indicator\n` +
      `Anti-Spam: 1.8s cooldown\n` +
      `Anti-Duplicate: ENABLED ✅\n` +
      `Security: MULTI-ADMIN LOCKED 🔒\n` +
      `Total Admins: ${AUTHORIZED_UIDS.length}\n\n` +
      `/activate off para itigil.`,
      threadID,
      messageID
    );
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ Naka-OFF na ang global auto-roast.", threadID, messageID);
  }

  if (sub === "status") {
    if (!data.active) {
      return api.sendMessage("Naka-OFF ang global auto-roast sa kasalukuyan.", threadID, messageID);
    }
    const totalLines = (data.roasts || DEFAULT_TAGALOG_ROASTS).length;
    return api.sendMessage(
      `🔥 ACTIVE — ECLIPSE AUTO-ROAST\n` +
      `Mode: Sequential + Keyword Triggers\n` +
      `Timing: Human Delay + Typing Indicator\n` +
      `Anti-Dupe + Anti-Spam: ENABLED ✅\n` +
      `Kabuuan ng mga linya: ${totalLines}\n` +
      `Admin Status: Verified 🔒 (${AUTHORIZED_UIDS.length} admins)`,
      threadID,
      messageID
    );
  }

  if (sub === "add") {
    const customLine = args.slice(1).join(" ");
    if (!customLine) {
      return api.sendMessage("❌ Gamitin: /activate add <yung linya>", threadID, messageID);
    }
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

  if (sub === "setnick") {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs;
      api.sendMessage(`⏳ Binabago ang nicknames ng ${participantIDs.length} miyembro...`, threadID);
      for (const userID of participantIDs) {
        await sleep(500);
        api.changeNickname("Ryuk pogi", threadID, userID, (err) => {
          if (err) console.error(`Nickname change failed for ${userID}:`, err);
        });
      }
      return api.sendMessage("✅ Done — lahat ng nicknames ay 'Ryuk pogi' na.", threadID, messageID);
    } catch {
      return api.sendMessage("❌ Bigo. Siguraduhing admin ang bot.", threadID, messageID);
    }
  }

  return api.sendMessage(
    `Mga Command:\n` +
    `/activate on — Simulan\n` +
    `/activate off — Itigil\n` +
    `/activate status — Tingnan status\n` +
    `/activate add <text> — Magdagdag ng linya\n` +
    `/activate listlines — Ilista lahat\n` +
    `/activate setnick — Gawing 'Ryuk pogi' ang lahat ng nick`,
    threadID,
    messageID
  );
};
