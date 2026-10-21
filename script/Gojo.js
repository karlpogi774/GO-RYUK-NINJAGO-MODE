const fs = require("fs");
const path = require("path");

const ADMIN_IDS = [
  "61594055835097",
  "61595507156493"
];

const DATA_FILE = path.join(__dirname, "gojo_exact_data.json");

const DEFAULT_DATA = {
  active: true,
  autoReact: true,
  delay: 2000,
  totalReplies: 0,
  maxRepliesPerWindow: 5,
  rateLimitWindowMs: 60000,
  userCooldownMs: 10000,
  triggers: ["gojo", "satoru", "infinity"]
};

const MAX_QUEUE = 25;
const MAX_SEEN_MESSAGES = 5000;
const MAX_COOLDOWN_ENTRIES = 3000;

const USER_COOLDOWN = new Map();
const SEEN_MESSAGES = new Set();
const REPLY_QUEUE = [];
const REPLY_TIMES = [];

let queueRunning = false;

const GOJO_QUOTES = [
  "♾️ The strongest is here. Relax, I've got this.",
  "😎 Don't worry. I'm the strongest.",
  "♾️ Infinity protects what matters.",
  "💙 Relax. Everything is under control.",
  "👁️ You called Gojo Satoru?",
  "🔥 The difference between us is absolute.",
  "♾️ My technique is on another level.",
  "😏 Sorry, I'm too strong.",
  "💙 Stay calm. The strongest has arrived.",
  "👑 Gojo Satoru. Remember the name."
];

function isAdmin(senderID) {
  return ADMIN_IDS.includes(String(senderID));
}

function loadSystemData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const saved = JSON.parse(
        fs.readFileSync(DATA_FILE, "utf8")
      );

      return {
        ...DEFAULT_DATA,
        ...saved
      };
    }
  } catch (error) {
    console.error("[GOJO] Data load error:", error.message);
  }

  return { ...DEFAULT_DATA };
}

let SYSTEM_DATA = loadSystemData();

function saveSystemData() {
  try {
    const tempFile = DATA_FILE + ".tmp";

    fs.writeFileSync(
      tempFile,
      JSON.stringify(SYSTEM_DATA, null, 2),
      "utf8"
    );

    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    console.error("[GOJO] Data save error:", error.message);
  }
}

function randomQuote() {
  return GOJO_QUOTES[
    Math.floor(Math.random() * GOJO_QUOTES.length)
  ];
}

function rememberMessage(messageID) {
  if (SEEN_MESSAGES.has(messageID)) {
    return false;
  }

  SEEN_MESSAGES.add(messageID);

  while (SEEN_MESSAGES.size > MAX_SEEN_MESSAGES) {
    const oldest = SEEN_MESSAGES.values().next().value;
    SEEN_MESSAGES.delete(oldest);
  }

  return true;
}

function trimCooldowns() {
  if (USER_COOLDOWN.size <= MAX_COOLDOWN_ENTRIES) {
    return;
  }

  const entriesToRemove =
    USER_COOLDOWN.size - MAX_COOLDOWN_ENTRIES;

  let removed = 0;

  for (const key of USER_COOLDOWN.keys()) {
    USER_COOLDOWN.delete(key);
    removed++;

    if (removed >= entriesToRemove) {
      break;
    }
  }
}

function isCommandMessage(body) {
  return /^\s*[!/](gojo|help)\b/i.test(
    String(body || "")
  );
}

function matchesTrigger(body, data) {
  const text = String(body || "").toLowerCase();

  return (data.triggers || []).some(trigger => {
    const normalized = String(trigger).toLowerCase().trim();

    if (!normalized) return false;

    return text.includes(normalized);
  });
}

function canReplyNow() {
  const now = Date.now();

  while (
    REPLY_TIMES.length &&
    now - REPLY_TIMES[0] >= SYSTEM_DATA.rateLimitWindowMs
  ) {
    REPLY_TIMES.shift();
  }

  return (
    REPLY_TIMES.length <
    SYSTEM_DATA.maxRepliesPerWindow
  );
}

function safeReact(api, messageID) {
  if (typeof api.setMessageReaction !== "function") {
    return;
  }

  api.setMessageReaction(
    "😆",
    messageID,
    error => {
      if (error) {
        console.error("[GOJO] Reaction failed:", error.message || error);
      }
    },
    true
  );
}

function enqueueReply(item) {
  if (REPLY_QUEUE.length >= MAX_QUEUE) {
    console.warn("[GOJO] Queue full; message skipped.");
    return false;
  }

  REPLY_QUEUE.push(item);
  processQueue();

  return true;
}

function processQueue() {
  if (queueRunning || REPLY_QUEUE.length === 0) {
    return;
  }

  queueRunning = true;

  (async () => {
    try {
      while (REPLY_QUEUE.length > 0) {
        const item = REPLY_QUEUE.shift();

        if (!SYSTEM_DATA.active) {
          continue;
        }

        if (!canReplyNow()) {
          console.warn("[GOJO] Rate limit reached; queued reply skipped.");
          continue;
        }

        await new Promise(resolve => {
          setTimeout(resolve, SYSTEM_DATA.delay);
        });

        if (!SYSTEM_DATA.active) {
          continue;
        }

        if (!canReplyNow()) {
          continue;
        }

        await new Promise(resolve => {
          item.api.sendMessage(
            `♾️ GOJO SATORU\n\n${randomQuote()}`,
            item.threadID,
            error => {
              if (error) {
                console.error(
                  "[GOJO] Send failed:",
                  error.message || error
                );
              } else {
                REPLY_TIMES.push(Date.now());
                SYSTEM_DATA.totalReplies =
                  (SYSTEM_DATA.totalReplies || 0) + 1;
                saveSystemData();
              }

              resolve();
            },
            item.messageID
          );
        });
      }
    } catch (error) {
      console.error("[GOJO] Queue error:", error.message);
    } finally {
      queueRunning = false;

      if (REPLY_QUEUE.length > 0) {
        processQueue();
      }
    }
  })();
}

module.exports.config = {
  name: "gojo",
  version: "10.0.0",
  hasPermission: 0,
  credits: "Gojo Infinity Framework",
  description: "Gojo trigger replies, auto-reaction and admin controls.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/gojo on | off | status | reacton | reactoff | quote",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const senderID = String(event.senderID || "");
  const threadID = event.threadID;
  const action = String(args?.[0] || "help").toLowerCase();

  if (!isAdmin(senderID)) {
    return api.sendMessage(
      "⛔ Admin only. / Mga admin lang ang puwedeng gumamit nito.",
      threadID
    );
  }

  switch (action) {
    case "on":
      SYSTEM_DATA.active = true;
      saveSystemData();

      return api.sendMessage(
        "♾️ Gojo is ON.\nGojo is ready to respond to trigger messages.\nHanda nang sumagot si Gojo kapag may trigger.",
        threadID
      );

    case "off":
      SYSTEM_DATA.active = false;
      REPLY_QUEUE.length = 0;
      saveSystemData();

      return api.sendMessage(
        "💤 Gojo is OFF.\nNaka-off na ang Gojo.",
        threadID
      );

    case "status":
      return api.sendMessage(
        [
          "♾️ GOJO STATUS",
          `Active: ${SYSTEM_DATA.active}`,
          `Auto-react: ${SYSTEM_DATA.autoReact}`,
          `Total replies: ${SYSTEM_DATA.totalReplies}`,
          `Queue: ${REPLY_QUEUE.length}/${MAX_QUEUE}`,
          `Rate limit: ${SYSTEM_DATA.maxRepliesPerWindow} replies per ${SYSTEM_DATA.rateLimitWindowMs / 1000}s`,
          `Admins: ${ADMIN_IDS.join(", ")}`
        ].join("\n"),
        threadID
      );

    case "reacton":
      SYSTEM_DATA.autoReact = true;
      saveSystemData();

      return api.sendMessage(
        "😆 Auto-react enabled. / Naka-on na ang auto-react.",
        threadID
      );

    case "reactoff":
      SYSTEM_DATA.autoReact = false;
      saveSystemData();

      return api.sendMessage(
        "🔕 Auto-react disabled. / Naka-off na ang auto-react.",
        threadID
      );

    case "quote":
      return api.sendMessage(randomQuote(), threadID);

    case "help":
    default:
      return api.sendMessage(
        [
          "♾️ GOJO COMMANDS",
          "/gojo on - Enable Gojo",
          "/gojo off - Disable Gojo",
          "/gojo status - View status",
          "/gojo reacton - Enable reactions",
          "/gojo reactoff - Disable reactions",
          "/gojo quote - Random quote",
          "",
          "Admin only / Para lang sa admins."
        ].join("\n"),
        threadID
      );
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const threadID = event.threadID;
    const senderID = String(event.senderID || "");
    const messageID = String(event.messageID || "");
    const body = String(event.body || "");

    if (!threadID || !senderID || !messageID) {
      return;
    }

    const botID = String(
      typeof api.getCurrentUserID === "function"
        ? api.getCurrentUserID()
        : ""
    );

    if (senderID === botID || isAdmin(senderID)) {
      return;
    }

    if (!SYSTEM_DATA.active || isCommandMessage(body)) {
      return;
    }

    if (!rememberMessage(messageID)) {
      return;
    }

    if (SYSTEM_DATA.autoReact) {
      safeReact(api, messageID);
    }

    if (!matchesTrigger(body, SYSTEM_DATA)) {
      return;
    }

    const cooldownKey = `${threadID}:${senderID}`;
    const now = Date.now();
    const lastTime = USER_COOLDOWN.get(cooldownKey) || 0;

    if (now - lastTime < SYSTEM_DATA.userCooldownMs) {
      return;
    }

    if (!canReplyNow()) {
      return;
    }

    USER_COOLDOWN.set(cooldownKey, now);
    trimCooldowns();

    enqueueReply({
      api,
      threadID,
      messageID
    });
  } catch (error) {
    console.error("[GOJO] Event error:", error.message);
  }
};
