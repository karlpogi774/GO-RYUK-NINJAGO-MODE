const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "3.0.0",
  hasPermission: 1,
  credits: "ryuk",
  description: "Auto asar bot — pure chaos energy 💀",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status | setnick | setgname",
  cooldowns: 5
};

// ✅ YOUR ADMIN IDs HERE
const ADMIN_UIDS = ["61595507156493", "61595398037273"];

const DATA_PATH = path.join(__dirname, "ryuk_data.json");

const REACT_EMOJIS = ["💀", "🤡", "😂", "🗿", "🔥", "😬", "🤣", "💅"];

// ✅ NEW & MORE — PINOY ASAR VIBE LINES
const ROASTS = [
  "bro typed that and expected us to be impressed? 💀",
  "the silence after that message was louder than your whole speech 🗿",
  "somewhere a teacher is crying seeing how you use words 😭",
  "you really said that out loud… in text… for everyone to see 😬",
  "confidence? 100. brain cells? 0 🤡",
  "group chat was peaceful until you decided to speak 😐",
  "that message aged faster than leftover rice in the sun 💀",
  "bro thinks he's the main character but he's just the side character nobody likes 😂",
  "please go touch grass instead of typing nonsense here 🙏",
  "who gave you permission to be this embarrassing? 💅",
  "reading that hurt my eyes more than staring at the sun 🔥",
  "you put more effort into that message than your whole life bro 🗿",
  "say less, we already know you're just here for attention 😭",
  "your keyboard must be suffering carrying that level of nonsense 💀",
  "audacity? unmatched. common sense? nowhere to be found 🤡",
  "nobody asked but thanks for the unnecessary pain i guess 😂",
  "bro really woke up and chose to be a walking red flag today 🚩",
  "that was so unnecessary even my wifi disconnected out of embarrassment 😭",
  "if being weird was a job you'd be the ceo by now 🗿",
  "please stop, my phone is judging me for reading this 💀",
  "you sound like you googled 'how to be embarrassing' and followed every step 🤡",
  "the group chat doesn't need your wisdom bro, we need peace 😂",
  "one message and you already ruined everyone's mood. skill issue? 💅",
  "did you forget nobody actually asked for your opinion? 😬",
  "that's not a take bro that's a mistake in sentence form 🔥",
  "reading that gave me second hand embarrassment so strong i cringed irl 💀",
  "you're not funny you're just annoying there's a difference 🗿",
  "keep talking, we're all just collecting evidence 😭🤡",
  "bro thought he ate but he just choked on his own words 💀😂",
  "please log off, the internet will thank you 🙏😬"
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
  return data.active === true;
}

function isAdmin(uid) {
  return ADMIN_UIDS.includes(uid);
}

const isProcessing = new Set();

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;

  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;
  if (!isActive()) return;
  if (isProcessing.has(threadID)) return;
  
  isProcessing.add(threadID);

  try {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];

    api.sendMessage(randomRoast, threadID, (err, info) => {
      if (!err && info?.messageID) {
        api.setMessageReaction(randomEmoji, info.messageID, () => {}, true);
      }
      isProcessing.delete(threadID);
    });
  } catch {
    isProcessing.delete(threadID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (!isAdmin(senderID)) {
    return api.sendMessage("🚫 only admins can touch me bro 🗿", threadID, messageID);
  }

  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    data.activatedAt = Date.now();
    saveData(data);
    return api.sendMessage(
      "💀 ryuk — ACTIVATED\n\n" +
      "chaos mode: ON ♾️\n" +
      "auto-asar: ENABLED\n" +
      "react mode: ACTIVE\n\n" +
      "type /ryuk off to kill me",
      threadID, messageID
    );
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("😴 ryuk went to sleep. chaos paused for now.", threadID, messageID);
  }

  if (sub === "status") {
    if (!data.active) {
      return api.sendMessage("😐 ryuk is chilling. nothing happening here.", threadID, messageID);
    }
    return api.sendMessage("💀 ryuk is WIDE AWAKE. everyone better watch their words 💀", threadID, messageID);
  }

  if (sub === "setnick") {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const ids = threadInfo.participantIDs;
      api.sendMessage(`⏳ changing ${ids.length} people's names…`, threadID);
      for (const uid of ids) {
        api.changeNickname("ryuk victim 💀", threadID, uid, () => {});
      }
      return api.sendMessage("✅ done. everyone is now a ryuk victim 💀", threadID, messageID);
    } catch {
      return api.sendMessage("❌ can't do that bro, give me admin perms first 😭", threadID, messageID);
    }
  }

  if (sub === "setgname") {
    api.setTitle("ryuk's playground 💀", threadID, (err) => {
      if (err) return api.sendMessage("❌ need admin rights bro 😭", threadID, messageID);
      return api.sendMessage("✅ group is now ryuk's playground 💀", threadID, messageID);
    });
    return;
  }

  return api.sendMessage(
    "💀 ryuk commands:\n\n" +
    "/ryuk on — wake me up 💀\n" +
    "/ryuk off — put me to sleep 😴\n" +
    "/ryuk status — check if i'm watching 👀\n" +
    "/ryuk setnick — everyone becomes ryuk victim 💀\n" +
    "/ryuk setgname — group becomes ryuk's playground 💀",
    threadID, messageID
  );
};
