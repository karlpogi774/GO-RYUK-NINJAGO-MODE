const fs = require("fs");
const path = require("path");

const { calculateHumanDelay } = require("./human-delay");
const { humanize } = require("./human-mimic");
const { withTyping } = require("./human-typing");
const { rememberBanatReply, getUnusedReply } = require("./banat-memory");
const { getBanatConversationReply } = require("./triggers");
const { isDuplicateMessage } = require("./message-dedupe");

module.exports.config = {
  name: "activate",
  version: "10.3.5",
  hasPermission: 0,
  credits: "sinzu & Eclipse",
  description: "Tagalog Auto-Roast · Bago Lang · 6s Delay · Multi-Admin Lock",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/activate on | off | status | add <text> | listlines | setnick",
  cooldowns: 6
};

const AUTHORIZED_UIDS = [
  "61596315422605",
  "61595955098183",
  "61596600291238"
];

const DATA_PATH = path.join(__dirname, "activate_data.json");
const REACT_EMOJIS = ["🔥", "💀", "🤣", "😆", "🤡", "👎"];
const REPLY_DELAY = 6000; // ⏳ 6 segundo

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

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      if (!parsed.roasts || parsed.roasts.length === 0) parsed.roasts = [...DEFAULT_TAGALOG_ROASTS];
      return parsed;
    }
  } catch {}
  return { active: false, activatedBy: null, roasts: [...DEFAULT_TAGALOG_ROASTS] };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function isActive() {
  return loadData().active === true;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const lastResponseTime = new Map();
const recentMessageCount = new Map();
const lastProcessedTime = new Map();
const COOLDOWN_DELAY = 6000; // ⏳ 6 segundo cooldown

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

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, timestamp } = event;
  const botID = api.getCurrentUserID();
  const now = Date.now();

  if (!isActive()) return;
  if (!body || senderID === botID) return;
  if (body.toLowerCase().startsWith("/activate")) return;
  if (isDuplicateMessage(messageID)) return;

  // ✅ Bago lang ang sasagutin
  const msgTime = timestamp || now;
  const lastTime = lastProcessedTime.get(threadID) || 0;
  if (msgTime < lastTime) return;
  lastProcessedTime.set(threadID, msgTime);

  if (now - (lastResponseTime.get(threadID) || 0) < COOLDOWN_DELAY) return;
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

    replyText = humanize(replyText, { abbreviate: false, typos: false, punctuation: true });
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    // ⏳ 6 segundo bago mag-send
    await api.sendTypingIndicator(threadID);
    await sleep(REPLY_DELAY);

    api.sendMessage({
      body: replyText,
      mentions: [{ tag: `@${senderID}`, id: senderID }]
    }, threadID, async (err, info) => {
      if (!err && info?.messageID) {
        await sleep(400 + Math.floor(Math.random() * 400));
        api.setMessageReaction(randomEmoji, info.messageID, () => {}, true);
      }
    }, messageID);
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  if (!AUTHORIZED_UIDS.includes(senderID)) return api.sendMessage("❌ Hindi awtorisadong admin.", threadID, messageID);

  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    saveData(data);
    return api.sendMessage("✅ Bot ON — 6 segundo delay bago mag-reply.\nPinakabagong mensahe lang ang sasagutin.", threadID, messageID);
  }
  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("⏳ Bot OFF.", threadID, messageID);
  }
  if (sub === "status") {
    const totalLines = (data.roasts || DEFAULT_TAGALOG_ROASTS).length;
    return api.sendMessage(`Status: ${isActive() ? "✅ ON" : "⏳ OFF"}\nReply delay: 6 segundo ⏳\nReply lines: ${totalLines}\nMode: Bago lang ang sasagutin ✅`, threadID, messageID);
  }
  if (sub === "add") {
    const customLine = args.slice(1).join(" ");
    if (!customLine) return api.sendMessage("❌ /activate add <text>", threadID, messageID);
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
        api.changeNickname("Ryuk pogi", threadID, userID, () => {});
      }
      return api.sendMessage("✅ Done — lahat ng nicknames ay 'Ryuk pogi' na.", threadID, messageID);
    } catch {
      return api.sendMessage("❌ Bigo. Siguraduhing admin ang bot.", threadID, messageID);
    }
  }
  return api.sendMessage(
    `Commands:\n` +
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
