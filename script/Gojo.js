const fs = require("fs");
const path = require("path");

const ADMIN_ID = "61595507156493";
const TARGET_NAME = "Jehosh pogi";
const DEFAULT_EMOJI = "🔥";
const DATA_PATH = path.join(__dirname, "activate_data.json");

// Anti-spam configuration (Max 5 messages per 5 seconds)
const SPAM_THRESHOLD = 5;
const SPAM_INTERVAL = 5000;
const userMessageLogs = {};

module.exports.config = {
  name: "gojo",
  version: "2.0.0",
  hasPermission: 0,
  credits: "sinzu / edited",
  description: "Infinite auto-roast, anti-spam, auto-react, auto-nickname, and auto-group name lock with Admin protection.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/gojo on — start infinite global features\n/gojo off — stop\n/gojo status — check status",
  cooldowns: 5
};

// English roasts
const ROASTS = [
  "Bro really thought that message was necessary 💀",
  "The confidence… the delusion… unmatched.",
  "Say less, we already lost brain cells reading that.",
  "You typed all that just to embarrass yourself?",
  "Main character energy but the plot is mid.",
  "Who hurt you? Because that sentence hurt all of us.",
  "Please stop before the group chat files a restraining order.",
  "You really just said that out loud… in text… permanently.",
  "The audacity is loud but the intelligence is on mute.",
  "This is why group chats need a mute button for specific people.",
  "Bro woke up and chose violence against the English language.",
  "I’m not even mad, I’m just disappointed… and second-hand embarrassed.",
  "Your message just aged like milk left in the sun.",
  "Somewhere a grammar teacher is crying.",
  "This energy is giving ‘I peaked in high school’.",
  "You dropped that like it was fire. It was not.",
  "The group chat was peaceful until you arrived.",
  "Please log off for the sake of everyone’s mental health.",
  "That was a choice… a bold, terrible choice.",
  "I’m taking notes on how not to communicate."
];

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
  return !!data.active;
}

// ===== EVENT HANDLER (Runs on all messages & GC actions) =====
module.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, isGroup } = event;

  // Ignore bot's own actions or commands
  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  if (!isActive()) return;

  // 1. AUTO SELF-REACT
  try {
    api.setMessageReaction(DEFAULT_EMOJI, messageID, () => {}, true);
  } catch (err) {}

  // 2. ANTI-SPAM PROTECTION
  const now = Date.now();
  if (!userMessageLogs[senderID]) userMessageLogs[senderID] = [];
  userMessageLogs[senderID] = userMessageLogs[senderID].filter(t => now - t < SPAM_INTERVAL);
  userMessageLogs[senderID].push(now);

  if (userMessageLogs[senderID].length > SPAM_THRESHOLD) {
    api.sendMessage("⚠️ Spammer detected! Please slow down.", threadID);
    return;
  }

  // 3. AUTO CHANGE GROUP NAME & MEMBER NICKNAMES
  if (isGroup) {
    api.getThreadInfo(threadID, (err, info) => {
      if (err || !info) return;

      // Auto Group Name Lock
      if (info.threadName !== TARGET_NAME) {
        api.setTitle(TARGET_NAME, threadID, () => {});
      }

      // Auto Sender Nickname Lock
      if (info.nicknames && info.nicknames[senderID] !== TARGET_NAME) {
        api.changeNickname(TARGET_NAME, threadID, senderID, () => {});
      }
    });
  }

  // 4. AUTO-ROAST CHAT LINES
  const count = Math.floor(Math.random() * 4) + 4; // Pick 4 to 7 lines
  const shuffled = [...ROASTS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  for (let i = 0; i < selected.length; i++) {
    setTimeout(() => {
      api.sendMessage(selected[i], threadID);
    }, i * 800);
  }
};

// ===== COMMAND HANDLER =====
module.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, isGroup } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  // Admin Verification Check
  if (senderID !== ADMIN_ID) {
    return api.sendMessage("❌ Access Denied: Only Admin (ID: 61595507156493) can use this command.", threadID, messageID);
  }

  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    data.activatedAt = Date.now();
    saveData(data);

    // Enforce nicknames on all members in the GC when toggled ON
    if (isGroup) {
      api.getThreadInfo(threadID, (err, info) => {
        if (!err && info && info.participantIDs) {
          info.participantIDs.forEach((id) => {
            if (!info.nicknames || info.nicknames[id] !== TARGET_NAME) {
              api.changeNickname(TARGET_NAME, threadID, id, () => {});
            }
          });
        }
      });
      api.setTitle(TARGET_NAME, threadID, () => {});
    }

    return api.sendMessage(
      `🔥 GOJO BOT: ACTIVATED (INFINITE DURATION)\n\n` +
      `• Auto-Roast: ACTIVE\n` +
      `• Anti-Spam: ENABLED\n` +
      `• Auto Self-React: ACTIVE (${DEFAULT_EMOJI})\n` +
      `• Group Name Locked to: "${TARGET_NAME}"\n` +
      `• Member Nicknames Locked to: "${TARGET_NAME}"\n\n` +
      `Use /gojo off to stop.`,
      threadID,
      messageID
    );
  }

  if (sub === "off") {
    if (isActive()) {
      data.active = false;
      saveData(data);
      return api.sendMessage("✅ All Gojo bot active features turned OFF.", threadID, messageID);
    }
    return api.sendMessage("Gojo bot is not currently active.", threadID, messageID);
  }

  if (sub === "status") {
    const statusStr = isActive() ? "ACTIVE (Infinite Duration)" : "OFF";
    return api.sendMessage(
      `🤖 GOJO BOT STATUS\n` +
      `Status: ${statusStr}\n` +
      `Admin ID: ${ADMIN_ID}\n` +
      `Target Name: ${TARGET_NAME}`,
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    `Usage:\n` +
    `/gojo on — Start infinite global features\n` +
    `/gojo off — Stop all features\n` +
    `/gojo status — Check active status\n\n` +
    `Admin Only (ID: 61595507156493)`,
    threadID,
    messageID
  );
};
