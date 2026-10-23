const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "18.0.0",
  role: "0",
  hasPrefix: true,
  aliases: ["ryuk"],
  description: "RYUK all-group auto-reply with bounded queue and cooldowns",
  usage: "ryuk on | off | status | reacton | reactoff | delay <ms> | cooldown <ms>",
  credits: "RYUK",
  cooldown: 2
};

const ADMIN_IDS = ["61595507156493"];
const DATA_PATH = path.join(__dirname, "ryuk_data.json");

const DEFAULTS = {
  active: false,
  autoReact: false,
  delayMs: 1800,
  cooldownMs: 15000,
  maxQueue: 40,
  replies: [
    "Gets ko. 😎",
    "Sige lang, tuloy mo.",
    "Okay, noted.",
    "Haha, ayos yan.",
    "Ano pa balita?",
    "I see. Tuloy mo lang.",
    "Sige, nandito lang ako.",
    "Fair enough.",
    "Tama, gets ko point mo.",
    "Haha, grabe naman. 😂",
    "Copy! 👍",
    "Okay lang 'yan.",
    "Salamat sa update.",
    "Ano sa tingin mo?",
    "Interesting 'yan ah.",
    "Go lang, nakikinig ako.",
    "Haha, sige na nga.",
    "Ayos, tuloy lang.",
    "Gets. Salamat sa pagsabi.",
    "Noted, boss."
  ]
};

let data = loadData();
const seenMessages = new Map();
const lastReplyByPerson = new Map();
const queue = [];

let processing = false;
let lastGlobalReplyAt = 0;

const MAX_SEEN = 3000;
const MAX_PERSON_KEYS = 2000;
const GLOBAL_MIN_GAP_MS = 1200;

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const parsed = JSON.parse(
        fs.readFileSync(DATA_PATH, "utf8")
      );

      return {
        ...DEFAULTS,
        ...parsed
      };
    }
  } catch (error) {
    console.error(
      "[RYUK] Could not load data:",
      error.message
    );
  }

  return { ...DEFAULTS };
}

function saveData() {
  const tempPath = `${DATA_PATH}.tmp`;

  try {
    fs.writeFileSync(
      tempPath,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    fs.renameSync(tempPath, DATA_PATH);
  } catch (error) {
    console.error(
      "[RYUK] Could not save data:",
      error.message
    );

    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (_) {}
  }
}

function isAdmin(senderID, admin = []) {
  const id = String(senderID || "");

  return (
    ADMIN_IDS.includes(id) ||
    (
      Array.isArray(admin) &&
      admin.map(String).includes(id)
    )
  );
}

function trimMap(map, maxSize) {
  while (map.size > maxSize) {
    map.delete(map.keys().next().value);
  }
}

function rememberMessage(messageID) {
  if (!messageID) return false;

  const id = String(messageID);

  if (seenMessages.has(id)) {
    return false;
  }

  seenMessages.set(id, Date.now());
  trimMap(seenMessages, MAX_SEEN);

  return true;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendMessage(
  api,
  text,
  threadID,
  replyToID
) {
  return new Promise((resolve, reject) => {
    try {
      api.sendMessage(
        text,
        threadID,
        (err, info) => {
          if (err) return reject(err);
          resolve(info);
        },
        replyToID
      );
    } catch (error) {
      reject(error);
    }
  });
}

function sendReaction(api, messageID, reaction) {
  return new Promise((resolve, reject) => {
    try {
      api.setMessageReaction(
        reaction,
        messageID,
        err => {
          if (err) return reject(err);
          resolve();
        },
        true
      );
    } catch (error) {
      reject(error);
    }
  });
    }function parseCommand(body, prefix) {
  if (typeof body !== "string") return null;

  const trimmed = body.trim();
  const p = typeof prefix === "string" ? prefix : "";
  const normalized = trimmed.toLowerCase();

  const withoutPrefix =
    p && normalized.startsWith(p.toLowerCase())
      ? trimmed.slice(p.length).trim()
      : trimmed;

  const match = withoutPrefix.match(/^ryuk(?:\s+([\s\S]*))?$/i);

  return match
    ? (match[1] || "").trim().split(/\s+/).filter(Boolean)
    : null;
}

async function handleCommand({ api, event, args, admin }) {
  const { threadID, messageID } = event;
  const senderID = String(event.senderID || "");
  const action = String(args[0] || "help").toLowerCase();

  if (!isAdmin(senderID, admin)) {
    await sendMessage(
      api,
      "RYUK: Admin lang ang puwedeng magbago ng settings.",
      threadID,
      messageID
    ).catch(err =>
      console.error("[RYUK] Permission reply failed:", err.message)
    );
    return;
  }

  switch (action) {
    case "on":
      data.active = true;
      saveData();
      await sendMessage(
        api,
        "🥷 RYUK ON. Replies enabled sa lahat ng GC.",
        threadID,
        messageID
      );
      return;

    case "off":
      data.active = false;
      queue.length = 0;
      saveData();
      await sendMessage(
        api,
        "RYUK OFF. Auto-replies stopped.",
        threadID,
        messageID
      );
      return;

    case "status":
      await sendMessage(
        api,
        `RYUK STATUS
Auto-reply: ${data.active ? "ON" : "OFF"}
Auto-react: ${data.autoReact ? "ON" : "OFF"}
Delay: ${data.delayMs} ms
Person cooldown: ${data.cooldownMs} ms
Queue: ${queue.length}/${data.maxQueue}`,
        threadID,
        messageID
      );
      return;

    case "reacton":
      data.autoReact = true;
      saveData();
      await sendMessage(
        api,
        "RYUK auto-react ON.",
        threadID,
        messageID
      );
      return;

    case "reactoff":
      data.autoReact = false;
      saveData();
      await sendMessage(
        api,
        "RYUK auto-react OFF.",
        threadID,
        messageID
      );
      return;

    case "delay": {
      const ms = Number(args[1]);

      if (!Number.isFinite(ms) || ms < 1000 || ms > 10000) {
        await sendMessage(
          api,
          "Usage: ryuk delay 1000-10000 (milliseconds).",
          threadID,
          messageID
        );
        return;
      }

      data.delayMs = Math.floor(ms);
      saveData();

      await sendMessage(
        api,
        `RYUK delay set to ${data.delayMs} ms.`,
        threadID,
        messageID
      );
      return;
    }

    case "cooldown": {
      const ms = Number(args[1]);

      if (!Number.isFinite(ms) || ms < 5000 || ms > 120000) {
        await sendMessage(
          api,
          "Usage: ryuk cooldown 5000-120000 (milliseconds).",
          threadID,
          messageID
        );
        return;
      }

      data.cooldownMs = Math.floor(ms);
      saveData();

      await sendMessage(
        api,
        `Person cooldown set to ${data.cooldownMs} ms.`,
        threadID,
        messageID
      );
      return;
    }

    case "help":
    default:
      await sendMessage(
        api,
        "RYUK COMMANDS\n" +
          "ryuk on - enable replies\n" +
          "ryuk off - disable replies\n" +
          "ryuk status - view settings\n" +
          "ryuk reacton - enable reactions\n" +
          "ryuk reactoff - disable reactions\n" +
          "ryuk delay 1000-10000 - set reply delay\n" +
          "ryuk cooldown 5000-120000 - set per-person cooldown",
        threadID,
        messageID
      );
  }
      }async function processQueue(api) {
  if (processing) return;

  processing = true;

  try {
    while (queue.length > 0) {
      const item = queue.shift();

      if (!item || !data.active) continue;

      const key = `${item.threadID}:${item.senderID}`;
      const previous = lastReplyByPerson.get(key) || 0;

      if (Date.now() - previous < data.cooldownMs) continue;

      const globalWait =
        GLOBAL_MIN_GAP_MS - (Date.now() - lastGlobalReplyAt);

      if (globalWait > 0) {
        await sleep(globalWait);
      }

      await sleep(data.delayMs);

      if (!data.active) continue;

      try {
        if (
          data.autoReact &&
          item.messageID &&
          typeof api.setMessageReaction === "function"
        ) {
          await sendReaction(api, item.messageID, "👍").catch(err =>
            console.error("[RYUK] Reaction failed:", err.message)
          );
        }

        await sendMessage(
          api,
          pickReply(),
          item.threadID,
          item.messageID
        );

        const sentAt = Date.now();

        lastReplyByPerson.set(key, sentAt);
        trimMap(lastReplyByPerson, MAX_PERSON_KEYS);
        lastGlobalReplyAt = sentAt;
      } catch (error) {
        console.error("[RYUK] Reply failed:", error.message);
      }
    }
  } finally {
    processing = false;

    if (queue.length > 0 && data.active) {
      setImmediate(() => processQueue(api));
    }
  }
}

function pickReply() {
  const replies =
    Array.isArray(data.replies) && data.replies.length
      ? data.replies
      : DEFAULTS.replies;

  return replies[Math.floor(Math.random() * replies.length)];
}

module.exports.run = async function ({
  api,
  event,
  args = [],
  prefix,
  admin = []
}) {
  const parsed = parseCommand(event.body || "", prefix);

  if (!parsed) return;

  return handleCommand({
    api,
    event,
    args: args.length ? args : parsed,
    admin
  });
};

module.exports.handleEvent = async function ({
  api,
  event,
  prefix
}) {
  if (!event || !event.threadID || !event.senderID) return;

  if (
    event.type !== "message" &&
    event.type !== "message_reply"
  ) {
    return;
  }

  if (typeof event.body !== "string" || !event.body.trim()) {
    return;
  }

  const senderID = String(event.senderID);
  let botID = "";

  try {
    botID = String(
      typeof api.getCurrentUserID === "function"
        ? api.getCurrentUserID()
        : ""
    );
  } catch (_) {}

  if (senderID === botID) return;
  if (parseCommand(event.body, prefix)) return;
  if (!data.active || !rememberMessage(event.messageID)) return;

  const key = `${event.threadID}:${senderID}`;

  if (
    Date.now() - (lastReplyByPerson.get(key) || 0) <
    data.cooldownMs
  ) {
    return;
  }

  if (queue.length >= data.maxQueue) return;

  queue.push({
    threadID: event.threadID,
    senderID,
    messageID: event.messageID
  });

  processQueue(api).catch(error =>
    console.error("[RYUK] Queue failed:", error.message)
  );
};
