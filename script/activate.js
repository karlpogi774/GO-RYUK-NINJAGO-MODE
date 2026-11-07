const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports.config = {
  name: "activate",
  version: "10.0.0",
  hasPermission: 0,
  credits: "sinzu",
  description: "Admin-locked AI Tagalog auto-roast with quote reply, 2s slow-motion duration, auto GC name/nicknames 'Ryuk pogi', and FB auto-commenter.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/activate on | off | status | setnick | setgname | autocomment <postID> <count>",
  cooldowns: 5
};

// =========================================================
// ADMIN ID LOCK & GEMINI API KEY
const ADMIN_ID = "61595932841761";
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
// =========================================================

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const DATA_PATH = path.join(__dirname, "activate_data.json");
const REACT_EMOJIS = ["🔥", "💀", "🤣", "😆", "🤡", "👎"];

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch {}
  return { active: false, activatedBy: null };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function isActive() {
  const data = loadData();
  return data.active === true;
}

// ===== FUNCTION PARA SA AI TAGALOG ROAST GENERATION =====
async function generateAIRoast(userMessage) {
  try {
    const prompt = `Ikaw si "Ryuk pogi", isang basagero at mapangasir na kaibigan sa Facebook group chat. 
    Bumara ka nang maikli at nakakatawang Tagalog o Taglish reply batay sa chat ng tao na ito: "${userMessage}".
    Mga alituntunin:
    1. 1 hanggang 2 pangungusap lang (maximum 20 words).
    2. Gumamit ng modernong Tagalog chat slang (lods, bro, wtf, 💀, 🤣, etc.).
    3. Huwag maging sobrang bastos, dapat pang-asar lang na nakakatawa.`;

    const result = await aiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("AI Generation Error:", error);
    const fallbacks = [
      "Luh, nag-type pa talaga siya oh, akala mo naman may kumpirmasyon. 💀",
      "Lods, paki-delete na lang 'to bago pa makita ng iba, nakakahiya. 🤣",
      "Bro, isip muna bago pindot ng send button, napapahalata ka eh.",
      "Confidence level: 100%. Sense level: 0%."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// ===== SLOW-MOTION & ANTI-SPAM SYSTEM =====
const lastResponseTime = new Map();
const COOLDOWN_DELAY = 2000; // 2 Seconds Slow Motion Duration for Chat

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getRandomDelay(minSec, maxSec) {
  return Math.floor(Math.random() * (maxSec - minSec + 1) + minSec) * 1000;
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData } = event;

  if (!isActive()) return;

  // AUTO ENFORCE GC NAME CHANGE TO "Ryuk pogi"
  if (logMessageType === "log:thread-name" || logMessageType === "log:subscribe" || logMessageType === "log:unsubscribe") {
    if (logMessageData && logMessageData.name !== "Ryuk pogi") {
      api.setTitle("Ryuk pogi", threadID, (err) => {
        if (err) console.error("Auto GC name enforcement failed:", err);
      });
    }
    return;
  }

  // Ignore empty messages, bot's own messages, and the /activate command itself
  if (!body || senderID === api.getCurrentUserID() || body.toLowerCase().startsWith("/activate")) return;

  const now = Date.now();
  const lastTime = lastResponseTime.get(threadID) || 0;

  // SLOW MOTION 2-SECOND COOLDOWN CHECK
  if (now - lastTime < COOLDOWN_DELAY) {
    return;
  }

  lastResponseTime.set(threadID, now);

  try {
    const aiRoastReply = await generateAIRoast(body);
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    await sleep(2000);

    // AUTO REPLY WITH DIRECT QUOTE
    api.sendMessage({
      body: aiRoastReply,
      mentions: [{ tag: `@${senderID}`, id: senderID }]
    }, threadID, async (err, info) => {
      if (!err && info && info.messageID) {
        await sleep(800);
        api.setMessageReaction(randomEmoji, info.messageID, (reactErr) => {
          if (reactErr) console.error("Self-react error:", reactErr);
        }, true);
      }
    }, messageID);
  } catch (error) {
    console.error("Auto-reply error:", error);
  }
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  // ADMIN PERMISSION CHECK
  if (senderID !== ADMIN_ID) {
    return api.sendMessage("❌ Ops! Si Boss Admin (ID: 61595932841761) lang ang pwedeng gumamit ng command na ito.", threadID, messageID);
  }

  // Turn ON Infinite Duration with AI Mode
  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    data.activatedAt = Date.now();
    saveData(data);

    api.setTitle("Ryuk pogi", threadID, () => {});

    return api.sendMessage(
      `🔥 AI-POWERED TAGALOG AUTO-ROAST: ON\n\n` +
      `👑 Authorized Admin: 61595932841761\n` +
      `AI Engine: Gemini Flash (Dynamic Tagalog lines)\n` +
      `Duration: INFINITE ♾️\n` +
      `Mode: Reply to Message (Direct Quote)\n` +
      `Anti-Spam Delay: SLOW MOTION (2s Cooldown)\n` +
      `Auto GC Name Enforcement: ACTIVE ("Ryuk pogi")\n\n` +
      `Gamitin ang /activate off para i-stop.`,
      threadID,
      messageID
    );
  }

  // Turn OFF
  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ Naka-OFF na ang AI Tagalog auto-roast.", threadID, messageID);
  }

  // Check Status
  if (sub === "status") {
    if (!data.active) {
      return api.sendMessage("Naka-OFF ang AI auto-roast sa kasalukuyan.", threadID, messageID);
    }
    return api.sendMessage(
      `🔥 Ang AI Tagalog Auto-roast ay ACTIVE (INFINITE ♾️)\n` +
      `Engine: Real-time Gemini AI Response\n` +
      `Anti-Spam: 2s Slow Motion Cooldown\n` +
      `Auto GC Name: "Ryuk pogi"`,
      threadID,
      messageID
    );
  }

  // Set All Members' Nicknames to "Ryuk pogi"
  if (sub === "setnick") {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs;

      api.sendMessage(`⏳ Binabago ang nicknames ng lahat ng ${participantIDs.length} miyembro papuntang "Ryuk pogi"...`, threadID);

      for (const userID of participantIDs) {
        await sleep(500);
        api.changeNickname("Ryuk pogi", threadID, userID, (err) => {
          if (err) console.error(`Failed nickname change for ${userID}:`, err);
        });
      }
      return api.sendMessage("✅ Tagumpay na nabago ang lahat ng nicknames papuntang 'Ryuk pogi'.", threadID, messageID);
    } catch (e) {
      return api.sendMessage("❌ Bigo sa pagbago ng nicknames. Siguraduhing admin ang bot.", threadID, messageID);
    }
  }

  // Manual Set Group Name to "Ryuk pogi"
  if (sub === "setgname") {
    api.setTitle("Ryuk pogi", threadID, (err) => {
      if (err) {
        return api.sendMessage("❌ Bigo sa pagbago ng pangalan ng group chat.", threadID, messageID);
      }
      return api.sendMessage("✅ Ang pangalan ng GC ay pinalitan na sa 'Ryuk pogi'.", threadID, messageID);
    });
    return;
  }

  // ===== SAFE FACEBOOK POST AUTO-COMMENTER =====
  if (sub === "autocomment") {
    const targetPostID = args[1];
    const amount = parseInt(args[2]) || 5;

    if (!targetPostID) {
      return api.sendMessage("❌ Paki-lagay ang Post ID!\nHalimbawa: /activate autocomment 123456789 5", threadID, messageID);
    }

    if (amount > 15) {
      return api.sendMessage("⚠️ Para maiwasan ang Facebook ban, maximum ng 15 comments lang bawat batch.", threadID, messageID);
    }

    api.sendMessage(`🚀 Magsisimula nang mag-comment ng ${amount} AI-generated Tagalog lines sa FB Post ID: ${targetPostID}...`, threadID, messageID);

    (async () => {
      for (let i = 0; i < amount; i++) {
        const aiComment = await generateAIRoast("Maglagay ng pambara o nakakatawang Tagalog comment sa post na 'to.");
        
        const safeDelay = getRandomDelay(4, 8);
        await sleep(safeDelay);

        if (typeof api.postComment === "function") {
          api.postComment(aiComment, targetPostID, (err) => {
            if (err) console.error(`FB Auto-Comment Error:`, err);
          });
        } else {
          api.sendMessage(aiComment, targetPostID, (err) => {
            if (err) console.error(`FB Comment Error:`, err);
          });
        }
      }
      api.sendMessage(`✅ Tapos na ang pag-comment ng ${amount} AI Tagalog lines sa FB post!`, threadID);
    })();

    return;
  }

  return api.sendMessage(
    `Mga Paggamit (Usage - Admin Only):\n` +
    `/activate on — Simulan ang AI Tagalog auto-roast (2s Slow Motion)\n` +
    `/activate off — Itigil ang auto-roast\n` +
    `/activate status — Tignan ang status\n` +
    `/activate setnick — Gawing 'Ryuk pogi' ang lahat ng nicknames\n` +
    `/activate setgname — Gawing 'Ryuk pogi' ang pangalan ng GC\n` +
    `/activate autocomment <postID> <count> — Mag-comment ng AI Tagalog lines sa FB Post`,
    threadID,
    messageID
  );
};
