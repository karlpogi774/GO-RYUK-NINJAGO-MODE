const fs = require("fs");
const path = require("path");

// ✅ ADMIN IDs
const ADMIN_IDS = [
  "61595507156493",
  "61595398037273"
];

module.exports.config = {
  name: "activate",
  version: "7.3-fixed",
  hasPermission: 0,
  credits: "sinzu + ryuk edit",
  description: "Auto-reply + Group Name Lock + Nickname Set",
  usePrefix: true,
  commandCategory: "Utility",
  usages: "/activate on | off | status | setname <name> | lockname on/off | setnick <nick> | setnickall <nick> | resetnickall",
  cooldowns: 5
};

const DATA_PATH = path.join(__dirname, "activate_data.json");

const DEFAULT_ROASTS = [
  "Lods pahinga ka muna, masyado ka nang main character ngayong araw 😆",
  "Sige lang lods, confident ka eh, tuloy mo lang yan",
  "Parang blankong papel yang banat mo ah, malinis",
  "Bro isip muna bago send, para iwas sabog",
  "Quiet mode ka muna lods, recharge ka lang",
  "Lods parang lowbat ka na, pahinga ka muna",
  "Ang tahimik mo kanina, bat ang ingay mo na ngayon",
  "Lods parang loading screen ka, tagal matapos",
  "Sige lods, ikaw na bida, kami na extra",
  "Relax lang lods, di ka pinag-aagawan",
  "Parang wifi mo lods, unstable ka ngayon",
  "Lods tulog ka muna, puyat ka na naman",
  "Bro parang kape ka, bigla kang sumulpot",
  "Lods ang lakas ng trip mo ngayon ah",
  "Parang jeep ka lods, puno ka na ng chismis",
  "Lods bawasan mo brightness mo, masyado kang shining",
  "Sige lang lods, tuloy mo lang yang energy mo",
  "Lods parang ulan ka, bigla ka na lang bumuhos",
  "Parang GCash ka lods, pending ka muna",
  "Lods parang alarm ka, ang ingay mo sa umaga",
  "Lods parang brownout ka, bigla kang nawala",
  "Bro parang meme ka, paulit-ulit ka na",
  "Lods parang ML ka, puro ka comeback",
  "Parang battery mo lods, 1 percent na lang",
  "Lods parang EDSA ka, traffic ka lagi",
  "Bro chill lang, di pa end of the world",
  "Lods parang playlist ka, paulit-ulit",
  "Parang exam ka lods, bigla kang sumulpot",
  "Lods parang chismis ka, mabilis ka kumalat",
  "Bro parang softdrinks ka, puro ka bula",
  "Lods parang jeep, di ka pa puno umaandar ka na",
  "Bro parang capslock ka, laging galit",
  "Lods parang popcorn ka, ang ingay mo",
  "Parang charger ka lods, lagi kang nawawala",
  "Lods parang ulam ka, panis ka na ata",
  "Lods pahinga ka muna, masyado ka nang main character ngayong araw 😆 bro",
  "Sige lang lods, confident ka eh, tuloy mo lang yan ah",
  "Parang blankong papel yang banat mo ah, malinis eh",
  "Bro isip muna bago send, para iwas sabog diba",
  "Quiet mode ka muna lods, recharge ka lang naman",
  "Lods parang lowbat ka na, pahinga ka muna 40",
  "Ang tahimik mo kanina, bat ang ingay mo na ngayon 😆",
  "Lods parang loading screen ka, tagal matapos 😂",
  "Sige lods, ikaw na bida, kami na extra haha",
  "Relax lang lods, di ka pinag-aagawan lods",
  "Parang wifi mo lods, unstable ka ngayon bro",
  "Lods tulog ka muna, puyat ka na naman ah",
  "Bro parang kape ka, bigla kang sumulpot eh",
  "Lods ang lakas ng trip mo ngayon ah diba",
  "Parang jeep ka lods, puno ka na ng chismis naman",
  "Lods bawasan mo brightness mo, masyado kang shining 50",
  "Sige lang lods, tuloy mo lang yang energy mo 😆",
  "Lods parang ulan ka, bigla ka na lang bumuhos 😂",
  "Parang GCash ka lods, pending ka muna haha",
  "Lods parang alarm ka, ang ingay mo sa umaga lods",
  "Lods parang brownout ka, bigla kang nawala bro",
  "Bro parang meme ka, paulit-ulit ka na ah",
  "Lods parang ML ka, puro ka comeback eh",
  "Parang battery mo lods, 1 percent na lang diba",
  "Lods parang EDSA ka, traffic ka lagi naman",
  "Bro chill lang, di pa end of the world 60",
  "Lods parang playlist ka, paulit-ulit 😆",
  "Parang exam ka lods, bigla kang sumulpot 😂",
  "Lods parang chismis ka, mabilis ka kumalat haha",
  "Bro parang softdrinks ka, puro ka bula lods",
  "Lods parang jeep, di ka pa puno umaandar ka na bro",
  "Bro parang capslock ka, laging galit ah",
  "Lods parang popcorn ka, ang ingay mo eh",
  "Parang charger ka lods, lagi kang nawawala diba",
  "Lods parang ulam ka, panis ka na ata naman",
  "Lods pahinga ka muna, masyado ka nang main character ngayong araw 😆 70",
  "Sige lang lods, confident ka eh, tuloy mo lang yan 😆",
  "Parang blankong papel yang banat mo ah, malinis 😂",
  "Bro isip muna bago send, para iwas sabog haha",
  "Quiet mode ka muna lods, recharge ka lang lods",
  "Lods parang lowbat ka na, pahinga ka muna bro",
  "Ang tahimik mo kanina, bat ang ingay mo na ngayon ah",
  "Lods parang loading screen ka, tagal matapos eh",
  "Sige lods, ikaw na bida, kami na extra diba",
  "Relax lang lods, di ka pinag-aagawan naman",
  "Parang wifi mo lods, unstable ka ngayon 80",
  "Lods tulog ka muna, puyat ka na naman 😆",
  "Bro parang kape ka, bigla kang sumulpot 😂",
  "Lods ang lakas ng trip mo ngayon ah haha",
  "Parang jeep ka lods, puno ka na ng chismis lods",
  "Lods bawasan mo brightness mo, masyado kang shining bro",
  "Sige lang lods, tuloy mo lang yang energy mo ah",
  "Lods parang ulan ka, bigla ka na lang bumuhos eh",
  "Parang GCash ka lods, pending ka muna diba",
  "Lods parang alarm ka, ang ingay mo sa umaga naman",
  "Lods parang brownout ka, bigla kang nawala 90",
  "Bro parang meme ka, paulit-ulit ka na 😆",
  "Lods parang ML ka, puro ka comeback 😂",
  "Parang battery mo lods, 1 percent na lang haha",
  "Lods parang EDSA ka, traffic ka lagi lods",
  "Bro chill lang, di pa end of the world bro",
  "Lods parang playlist ka, paulit-ulit ah",
  "Parang exam ka lods, bigla kang sumulpot eh",
  "Lods parang chismis ka, mabilis ka kumalat diba",
  "Bro parang softdrinks ka, puro ka bula naman",
  "Lods parang jeep, di ka pa puno umaandar ka na 100",
  "Bro parang capslock ka, laging galit 😆",
  "Lods parang popcorn ka, ang ingay mo 😂",
  "Parang charger ka lods, lagi kang nawawala haha",
  "Lods parang ulam ka, panis ka na ata lods"
];
function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch (e) {}
  return {
    active: false,
    roasts: DEFAULT_ROASTS,
    lockedGroupName: null,
    lockNameEnabled: false,
    defaultNickname: null,
    threadSettings: {}
  };
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const data = loadData();
  if (!data.roasts || data.roasts.length === 0) data.roasts = DEFAULT_ROASTS;

  const isAdminUser = ADMIN_IDS.includes(senderID) || senderID === api.getCurrentUserID();

  if (sub === "on") {
    data.active = true;
    saveData(data);
    return api.sendMessage("🔥 Auto-reply ON! Magre-reply ako sa bawat message pagkalipas ng 12 segundo.\nGamitin: /activate off para i-stop.", threadID, messageID);
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ Auto-reply OFF na.", threadID, messageID);
  }

  if (sub === "setname") {
    if (!isAdminUser) return api.sendMessage("❌ Admin lang pwede.", threadID, messageID);
    const newName = args.slice(1).join(" ");
    if (!newName) return api.sendMessage("Usage: /activate setname <Group Name>", threadID, messageID);
    data.lockedGroupName = newName;
    data.lockNameEnabled = true;
    if (!data.threadSettings[threadID]) data.threadSettings[threadID] = {};
    data.threadSettings[threadID].lockedName = newName;
    data.threadSettings[threadID].lockNameOn = true;
    saveData(data);
    await api.setTitle(newName, threadID);
    return api.sendMessage(`✅ Group Name Locked:「${newName}」`, threadID, messageID);
  }

  if (sub === "lockname") {
    if (!isAdminUser) return api.sendMessage("❌ Admin lang pwede.", threadID, messageID);
    const mode = (args[1] || "").toLowerCase();
    if (mode === "on") {
      data.lockNameEnabled = true;
      if (!data.threadSettings[threadID]) data.threadSettings[threadID] = {};
      data.threadSettings[threadID].lockNameOn = true;
      saveData(data);
      return api.sendMessage("🔒 Group Name Lock: ON", threadID, messageID);
    }
    if (mode === "off") {
      data.lockNameEnabled = false;
      if (data.threadSettings[threadID]) data.threadSettings[threadID].lockNameOn = false;
      saveData(data);
      return api.sendMessage("🔓 Group Name Lock: OFF", threadID, messageID);
    }
    return api.sendMessage("Usage: /activate lockname on | off", threadID, messageID);
  }

  if (sub === "setnickall") {
    if (!isAdminUser) return api.sendMessage("❌ Admin lang pwede.", threadID, messageID);
    const nick = args.slice(1).join(" ");
    if (!nick) return api.sendMessage("Usage: /activate setnickall <Nickname>\nExample: ⟪RYUK⟫ {name}", threadID, messageID);
    data.defaultNickname = nick;
    if (!data.threadSettings[threadID]) data.threadSettings[threadID] = {};
    data.threadSettings[threadID].defaultNick = nick;
    saveData(data);
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participants;
    let success = 0, fail = 0;
    api.sendMessage(`⏳ Nagseset ng nickname sa ${members.length} members...`, threadID);
    for (const member of members) {
      try {
        if (member.userID !== api.getCurrentUserID()) {
          let finalNick = nick.replace(/{name}/g, member.name || "Member");
          await api.changeNickname(finalNick, threadID, member.userID);
          success++;
        }
      } catch (e) { fail++; }
    }
    return api.sendMessage(`✅ Tapos!\n✅ Success: ${success}\n❌ Failed: ${fail}`, threadID, messageID);
  }

  if (sub === "setnick") {
    if (!isAdminUser) return api.sendMessage("❌ Admin lang pwede.", threadID, messageID);
    const nick = args.slice(1).join(" ");
    if (!nick) return api.sendMessage("Usage: /activate setnick <Nickname> — reply sa tao", threadID, messageID);
    if (event.messageReply && event.messageReply.senderID) {
      await api.changeNickname(nick, threadID, event.messageReply.senderID);
      return api.sendMessage(`✅ Nickname set: ${nick}`, threadID, messageID);
    }
    return api.sendMessage("⚠️ Reply ka muna sa message ng tao.", threadID, messageID);
  }

  if (sub === "resetnickall") {
    if (!isAdminUser) return api.sendMessage("❌ Admin lang pwede.", threadID, messageID);
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participants;
    let success = 0, fail = 0;
    api.sendMessage(`⏳ Nirereset ang nickname...`, threadID);
    for (const member of members) {
      try {
        if (member.userID !== api.getCurrentUserID()) {
          await api.changeNickname("", threadID, member.userID);
          success++;
        }
      } catch (e) { fail++; }
    }
    return api.sendMessage(`✅ Reset tapos!\n✅ Success: ${success}\n❌ Failed: ${fail}`, threadID, messageID);
  }

  if (sub === "roast") {
    const random = data.roasts[Math.floor(Math.random() * data.roasts.length)];
    return api.sendMessage(random, threadID, messageID);
  }

  if (sub === "add") {
    const text = args.slice(1).join(" ");
    if (!text) return api.sendMessage("/activate add <text>", threadID, messageID);
    data.roasts.push(text);
    saveData(data);
    return api.sendMessage(`Na-add: "${text}"`, threadID, messageID);
  }

  if (sub === "listlines") {
    let msg = `Lines (${data.roasts.length}):\n\n`;
    data.roasts.forEach((l, i) => msg += `${i+1}. ${l}\n`);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (sub === "status") {
    const ts = data.threadSettings[threadID] || {};
    return api.sendMessage(
      `📊 STATUS:\n` +
      `Auto-reply: ${data.active ? "✅ ON — 12s delay" : "❌ OFF"}\n` +
      `Group Name Lock: ${ts.lockNameOn ? "🔒 ON" : "🔓 OFF"}\n` +
      `Lines: ${data.roasts.length}`,
      threadID, messageID
    );
  }

  return api.sendMessage(
    "📖 Commands:\n" +
    "/activate on — i-on ang auto-reply\n" +
    "/activate off — i-off ang auto-reply\n" +
    "/activate status — tingnan status\n" +
    "/activate setname <Name> — i-lock group name\n" +
    "/activate setnickall <Name> — i-set nickname sa lahat",
    threadID, messageID
  );
};

// ==============================================
// ✅ FIXED AUTO-REPLY — SIGURADONG GAGANA
// ==============================================
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, logMessageType, logMessageData } = event;
  const botID = api.getCurrentUserID();

  // --- GROUP NAME LOCK ---
  if (logMessageType === "log:thread-name") {
    const data = loadData();
    const ts = data.threadSettings[threadID] || {};
    const lockedName = ts.lockedName || data.lockedGroupName;
    const shouldLock = ts.lockNameOn || data.lockNameEnabled;
    if (shouldLock && lockedName && logMessageData.name !== lockedName) {
      setTimeout(async () => {
        try { await api.setTitle(lockedName, threadID); } catch (e) {}
      }, 1000);
    }
    return;
  }

  // ❌ HINDI MAGRE-REPLY KUNG: ikaw ang nag-send, walang text, o command
  if (!body || body.trim() === "") return;
  if (senderID === botID) return;
  if (body.trim().startsWith("/")) return;

  // ✅ KUNG NAKA-ON ANG AUTO-REPLY
  const data = loadData();
  if (!data.active) return;

  // ✅ 12 SEGUNDO DELAY BAGO MAG-REPLY
  setTimeout(() => {
    const randomReply = data.roasts[Math.floor(Math.random() * data.roasts.length)];
    api.sendMessage(randomReply, threadID);
  }, 12000); // 12,000ms = 12 segundo
};
