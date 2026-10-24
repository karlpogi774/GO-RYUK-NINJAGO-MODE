const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "4.1.0",
  hasPermission: 2,
  credits: "sinzu & Gemini + Dola",
  description: "Infinite auto-roast • Fixed Self-React • Stable Setnick • Name Guard",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status | setgname <name> | setnick <name>",
  cooldowns: 2
};

const ADMIN_UIDS = [
  "61593892603402",
  "61594022290817",
  "61595507156493",
  "61595398037273"
];

const DEFAULT_LOCKED_NAME = "Ryuk";
const DATA_PATH = path.join(__dirname, "activate_data.json");

const EMOJIS = ["🥷", "🔥", "💀", "🗿", "😏", "🤌", "⚡", "👹"];

const ROASTS = [
  "Luh, nag-type pa talaga siya oh, akala mo naman may kumpirmasyon. 💀 💯 🤪",
  "Lods, paki-delete na lang 'to bago pa makita ng iba, nakakahiya. 🤣 💯 🤪",
  "Lakas ng loob mo mag-chat, pero yung sinabi mo walang kwenta. 💯 🤪",
  "Sino nagtanong sa'yo? Lakas maka-main character ah. 💯 🤪",
  "Bro, isip muna bago pindot ng send button, napapahalata ka eh. 💯 🤪",
  "Pang-asar ba 'yan o self-humiliation? Clarify natin. 💯 🤪",
  "Sana bago ka nag-text, nag-isip ka muna ng limang beses. 💯 🤪",
  "Quiet ka na lang muna lods, nauubusan na kami ng patience sa'yo. 💯 🤪",
  "I-off mo na wifi o data mo, hindi para sa'yo ang araw na 'to. 💯 🤪",
  "Ganda ng sinabi mo ah, kasing ganda ng blankong papel. 🤡 💯 🤪",
  "Ulitin mo nga 'yan, para mas lalo ka naming pagtawanan. 💯 🤪",
  "Bro really thought that message was necessary 💀 💯 🤪",
  "The confidence… the delusion… unmatched. 💯 🤪",
  "Say less, we already lost brain cells reading that. 💯 🤪",
  "You typed all that just to embarrass yourself? 💯 🤪",
  "Main character energy but the plot is mid. 💯 🤪",
  "Who hurt you? Because that sentence hurt all of us. 💯 🤪",
  "The audacity is loud but the intelligence is on mute. 💯 🤪",
  "This is why group chats need a mute button for specific people. 💯 🤪",
  "Pag-isipan mo munang mabuti bago ka mag-send ulit, nakaka-secondhand embarrassment ka bro. 💀 💯 🤪",
  "Akala mo siguro nakakatawa ka, paki-check nga ulit sa salamin. 💯 🤪",
  "Yung utak mo parang data connection, laging slow at paminsan-minsan nawawala. 📡 💯 🤪",
  "Mag-offline ka muna pre, magpahinga ka naman sa pagpapamukha na wala kang alam. 💯 🤪",
  "May award ka ba sa pagiging pinaka-epal sa GC? Kasi pasok na pasok ka. 💯 🤪",
  "Baka naman pwedeng mag-think before click kahit minsan lang? 💯 🤪",
  "Pakisara na lang yung app, wala ka ring maiisip na matino ngayon. 💯 🤪",
  "Tigilan mo na 'yan, pati 'yung keyboard mo sumusuko na sa'yo. 💯 🤪",
  "Confidence level: 100%. Sense level: 0%. 💯 🤪",
  "Ayan ka na naman, nagkakalat ka na naman ng ingay sa GC. 💯 🤪",
  "Subukan mo kayang mag-isip bago mag-type? Baka makatulong. 💯 🤪",
  "Ang ingay mo, wala ka namang maipagmamabang. 💯 🤪",
  "Kung degree ang pagiging corny, summa cum laude ka na siguro. 💯 🤪",
  "Bakit ka nag-chat? May humingi ba ng opinyon mo? 💯 🤪",
  "Hindi ka nakakatuwa, nakakaawa ka na pakinggan. 💯 🤪",
  "Yung utak mo parang Internet Explorer, huling-huli sa balita. 💯 🤪",
  "Lakas magmarunong pero nung nagtanong, nganga naman. 💯 🤪",
  "Tulog mo na lang 'yan lods, wala ka talagang mapapala ngayon. 💯 🤪",
  "Walang nakikinig sa'yo, kaya wag ka nang mag-aksaya ng laway. 💯 🤪",
  "Gusto mo ba ng medalya dahil sa walang katuturan mong sinabi? 💯 🤪",
  "Puro ka dada, zero performance ka naman sa totoong buhay. 💯 🤪",
  "Sana binasa mo muna bago mo pinindot 'yung send. 💯 🤪",
  "Dami mong sinasabi, wala namang katuturan. 💯 🤪",
  "Wala talagang value yung mga chat mo dito, paki-bawas-bawasan. 💯 🤪",
  "Ang sarap mo sanang suportahan kaso ang hirap mong ipagtanggol sa katangahan mo. 💯 🤪",
  "Lodi, hindi sa lahat ng pagkakataon kailangan mong mag-comment. 💯 🤪",
  "Isip ka muna bago mag-reply, para hindi ka nagmumukhang kawawa. 💯 🤪",
  "Hindi ko alam kung nagpapatawa ka o sadyang ganyan ka lang talaga mag-isip. 💯 🤪",
  "Nag-send ka pa nyan, kala mo naman ikatutuwa ng buong GC. 💯 🤪",
  "Pa-bida ka na naman, wala namang pumapansin sa'yo. 💯 🤪",
  "Magkano bayad sa'yo para maging ganyan ka-epal araw-araw? 💯 🤪",
  "May pa-type type ka pa, burahin mo na lang 'yan pre. 💯 🤪",
  "Minsan na nga lang mag-chat, nakakairita pa. 💯 🤪",
  "Grabe yung message, parang ginawa habang naglalakad nang nakapikit. 🚶‍♂️💀",
  "Kung pag-iisip ang usapan, naka-offline ka pa rin hanggang ngayon. 📵",
  "Hindi ko sasabihing wala kang utak… pero mas malinaw pa sa tubig ang ebidensya. 💧🤡",
  "Ang gulo ng sinabi mo, parang nabasa ko habang nalilito pa rin ako. 🤯",
  "Sayang lang yung data na nagamit mo para ipadala 'yan. 📉",
  "Kahit ang pader mas nakakaintindi kaysa sa sinabi mo. 🧱💀",
  "Huminga ka muna, baka masaktan ka pa sa sarili mong mga salita. 🌬️😌",
  "Hindi porket pwede kang magsalita, kailangan mo nang gawin. 🤐",
  "Parang luma at sira na ring telepono yung sinabi mo — hindi maintindihan. 📞❌",
  "Isipin mo na lang na wala kang sinabi, mas okay pa 'yun. ✨",
  "Yung typing speed mo mabilis, pero yung utak mo naka-pause pa. ⏸️🤖",
  "Sana may 'undo' button sa buhay para sa mga sinabi mo kanina. ↩️💀",
  "Ang lalim ng sinabi mo… kaso wala naman sa ilalim ang laman. 🕳️",
  "Baka pwedeng next time, wag na lang mag-chat? Salamat. 🙏😏",
  "Nagbasa ka ba ng libro kahit minsan? O sadyang ganito ka talaga. 📚❌",
  "Mukhang masakit maging ikalawang utak mo. Pasensya na sa'yo. 🫂💀",
  "Pag natapos ka na magsalita, sabihan mo ako para makahinga na tayo lahat. 😮‍💨",
  "Yung sinabi mo parang joke na walang punchline — nakakahiya lang. 🥲",
  "Hindi ka kailangang maging tama palagi, pero pwede bang minsan lang? 🥺🤏",
  "Kung tanga ay award, nanalo ka na ng grand champion. 🏆🤡",
  "Magsuot ka ng mask, hindi dahil sa virus — kundi para hindi na kami makarinig. 😷💀",
  "Mas may saysay pa ang katahimikan kaysa sa mga sinasabi mo. 🤫✨",
  "Sana may filter ang bibig mo, kasi puro kalat ang lumalabas. 🧹🤢",
  "Ang dali ng topic, pero ikaw pa ang naligaw ng daan. 🗺️😵",
  "Huwag mong piliting magmukhang matalino kung wala ka namang laman. 🧠❌",
  "Bumalik ka na lang kapag may laman na yang utak mo, sige. 👋😂",
  "Yung reply mo parang tinapay na walang palaman — walang lasa. 🍞😐",
  "Kahit si Google hindi alam kung paano sasagot sa kalokohan mo. 🔍❓",
  "Mabuti pa ang aso, tumatahol lang pero hindi nakakahiya. 🐶💀",
  "Baka naman nahihirapan ka na? Magpahinga ka muna pre. 🪑😅",
  "Ang ganda sana ng araw ko, hanggang sa nagbasa ako ng chat mo. 🌅💩",
  "Isipin mo muna bago ka mag-type — yung utak mo, gamitin mo naman minsan. 🧠✨",
  "Wala nang mas sasakit pa sa pagbasa ng message mo, promise. 🤕😂",
  "Sana nakita mo yung mukha ko habang binabasa ko 'yan — blankong pagkagulat. 😐💀",
  "Ang hirap intindihin, parang math na hindi ko talaga gusto. 📐😖",
  "May tinanong ba ako? Parang wala naman ah. 🤨✋",
  "Ikaw lang ang nakakaintindi sa sarili mo, at kahit ikaw siguro hindi rin sigurado. 🤪🌀",
  "Huwag ka nang mag-alala, nakakalimutan din naman agad namin ang sinabi mo. 😌🗑️",
  "Kaya pala tahimik ang paligid — dahil nagsalita ka na. 🤫📢",
  "Mabuti pa ang bato, hindi nagsasalita pero matatag pa rin. 🪨💪",
  "Ang bilis mong magsalita pero mabagal ka mag-isip. ⚡🐢",
  "Magbasa ka muna ng libro bago ka bumalik dito, please? 📖🙏",
  "Hindi insulto ang sinasabi ko, katotohanan lang na ayaw mong tanggapin. 🗡️😐",
  "Yung message mo parang ulap — maganda tingnan pero walang laman. ☁️💀",
  "Pagod na akong intindihin kung bakit ganyan ka mag-isip. 😩🤦",
  "Baka pwede mong ipaliwanag? Kasi kahit ang utak ko umiiwas na sa'yo. 🧠🏃‍♂️",
  "Mas maikli pa ang pasensya ko kaysa sa attention span mo. ⏳😒",
  "Sana next time mag-chat ka, may saysay naman kahit konti lang. 🙏✨",
  "Ang dami mong alam pero mali naman ang karamihan. 📚❌",
  "Parang na-stress ako bigla sa nabasa ko. Salamat ha? 😑💆",
  "Yung ngiti ko pilit na lang habang binabasa ko 'to. 😬💀",
  "Kung katahimikan ang ginto, milyonaryo ka na sana kung tumahimik ka. 🤫💰",
  "Hindi mo kailangang patunayan na mali ka — ginawa mo na agad. 🎯🤡",
  "Magsulat ka na lang sa pader, mas may saysay pa 'yun kaysa dito. 🧱✍️",
  "Nagkamali ka yata ng chat room, hindi 'to tambayan ng walang alam. 🚪👋",
  "Ang lakas ng loob mong magtanong kahit nandoon na ang sagot. 🤨👀",
  "Mag-enjoy ka na lang sa buhay mo, wag ka nang mag-chat dito. ✌️😊",
  "Sana naging mahinahon ka na lang, mas okay pa 'yun. 🕊️💙",
  "Hindi masamang magtanong — masama yung nagtatanong pero hindi nakikinig. 👂📢",
  "Ang sinabi mo parang kanta na paulit-ulit — nakakasawa na rin. 🎵😮‍💨",
  "May utak ka ba talaga o display lang sa ulo mo? 🧠🤔",
  "Yung reply mo parang laro na hindi ko na gustong laruin. 🎮🚫",
  "Mabuti pang matulog ka na, mas productive pa 'yun. 😴💤",
  "Konting respeto naman sa sarili mo, pre. 😌🤝",
  "Huwag mong piliting sumabay kung hindi mo kaya ang agos. 🌊🏊‍♂️",
  "Ang daming mas magandang gawin kaysa magbasa ng message mo. 🕐📉",
  "Sana sa susunod na buhay, may utak ka na. 🪦✨😂",
  "Wala akong masabi — masyadong malalim ang kawalan ng saysay. 🕳️🌑",
  "Ikaw ang dahilan kung bakit kailangan ng mute button ang mundo. 🔇🌍",
  "Ang hirap mong kausap — parang pader na hindi sumasagot pero mas matalino pa rin. 🧱🗣️",
  "Ikaw yung uri ng tao na mas maayos kapag tahimik. 🤫✨",
  "Walang nanalo sa argumentong kasama ka — kasi walang saysay. 🥀⚰️",
  "Mag-inom ka ng tubig, baka matunaw ang utak mo sa kakaisip ng kalokohan. 💧🧠",
  "Ang gulo ng sinabi mo, parang puzzle na nawawala ang mga piraso. 🧩❌❌",
  "Mas okay pang hindi magsalita kaysa magsalita pero mali naman. 🤐✅",
  "Sana natutunan mo na ang leksyon ngayon — wag basta magsalita nang walang laman. 📚💡",
  "Yung sinabi mo parang lumang balita — luma na, mali pa. 📰❌",
  "Ang lakas ng loob mong mag-post kahit alam mong walang kwenta. 💪💀",
  "Baka pwede mong bawasan ang pag-chat at dagdagan ang pag-iisip? Salamat. 🙏🧠",
  "Ikaw ang dahilan kung bakit mas gusto ko nang maging pader na lang. 🧱😌",
  "Ang dami mong sinasabi pero wala namang pumapasok sa utak namin. 🚧🧠❌",
  "Hindi ko matandaan ang sinabi mo — at ayaw ko ring maalala. 🧠✂️🗑️",
  "Sana may 'bawal mag-chat' sign para sa'yo lang. 🪧🚫😂",
  "Yung message mo parang hangin — dumaan lang, wala namang epekto. 💨🌬️",
  "Mas may karisma pa ang pader kaysa sa'yo eh. 🧱✨😂",
  "Pagod na ang mga mata ko kakabasa ng kalokohan mo. 👁️👁️😩",
  "Ang ganda sana ng usapan, hanggang sumagot ka. 💐☠️",
  "Wala ka namang tinutulong, puro ka lang salita. 🗣️⚡❌",
  "Sana tinago mo na lang yung sinabi mo, mas okay pa. 🤫📦🔒",
  "Bakit parang mas matalino pa ang aso ko kaysa sa sinabi mo? 🐕🧠😂",
  "Ang hirap mong intindihin — parang wikang hindi ko pa naririnig. 🌍🗣️❓",
  "Ikaw yung proof na pwede namang mabuhay nang walang utak. 🧠👻💀",
  "Mas maikli pa ang pasensya ko kaysa sa message mo — at mahaba na 'yun. ⏳📏😒",
  "Konting respeto sa sarili, pre. Hindi masama 'yun. 🙏😊",
  "Ang bilis mag-type pero mabagal mag-isip — classic ikaw. ⌨️🧠🐢",
  "Sana nakita mo yung mukha ko — parang nakakita ako ng multo. 👻😶💀",
  "Wala akong sasabihin — wala talagang maisip na maganda sa sinabi mo. 🚫💐",
  "Mabuti pang magbasa ka ng libro kaysa mag-chat dito. 📖✨",
  "Ang daming mas magandang gawin kaysa basahin 'yan. 🕐🚀",
  "Ikaw yung dahilan kung bakit mas gusto kong maging offline palagi. 📴😌",
  "Yung sinabi mo parang ulap — maganda tingnan pero wala namang tubig. ☁️💧❌",
  "Hindi masamang magkamali — masama yung ipinipilit mong tama ka kahit mali naman. ✅❌😤",
  "Sana matuto kang makinig bago ka magsalita — minsan lang naman hilingin 'yun. 🦻💡🙏",
  "Ang hirap mong sundan — parang kalsadang walang signpost. 🛣️🪧😵",
  "Yung message mo parang biro na hindi nakakatawa — awkward lang. 🥲💀",
  "Mas may saysay pa ang katahimikan kaysa sa ingay na galing sa'yo. 🤫🔇✨",
  "Ikaw ang dahilan kung bakit mas gusto kong magbasa na lang ng libro. 📚📖😊",
  "Wala akong masabi — talagang wala lang talaga. 🤐🤷‍♂️"
];

const threadLastReplyTime = new Map();
const COOLDOWN_DELAY = 2000;

let localMemoryData = { active: false, activatedBy: null, lockedGName: DEFAULT_LOCKED_NAME, lockedNick: DEFAULT_LOCKED_NAME };

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const content = fs.readFileSync(DATA_PATH, "utf8");
      localMemoryData = JSON.parse(content);
      return localMemoryData;
    }
  } catch (err) {
    console.error("[Data Load Error]:", err.message);
  }
  return localMemoryData;
}

function saveData(data) {
  localMemoryData = data;
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[Data Save Error]:", err.message);
  }
}

function isActive() {
  const data = loadData();
  return Boolean(data.active);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function checkIsAdmin(senderID) {
  return ADMIN_UIDS.includes(String(senderID));
}

// ===== EVENT HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID, logMessageType, logMessageData } = event;
  const data = loadData();

  if (!isActive()) return;

  const currentLockedGName = data.lockedGName || DEFAULT_LOCKED_NAME;
  const currentLockedNick = data.lockedNick || DEFAULT_LOCKED_NAME;

  // 1. AUTO SETGNAME LOCK
  if (logMessageType === "log:thread-name") {
    const newName = logMessageData ? logMessageData.name : "";
    if (newName !== currentLockedGName) {
      api.setTitle(currentLockedGName, threadID, (err) => {
        if (!err) {
          api.sendMessage(`🚫 GC Name is locked! Reverting back to: "${currentLockedGName}"`, threadID);
        }
      });
    }
    return;
  }

  // 2. AUTO SETNICK LOCK
  if (logMessageType === "log:user-nickname") {
    const changedUser = logMessageData ? logMessageData.participant_id : null;
    const newNick = logMessageData ? logMessageData.nickname : "";

    if (changedUser && newNick !== currentLockedNick) {
      await sleep(1500);
      api.changeNickname(currentLockedNick, threadID, changedUser, (err) => {
        if (err) console.log(`[Nick Lock Skipped]: ${err.message}`);
      });
    }
    return;
  }

  if (!body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  // 3. COOLDOWN
  const now = Date.now();
  const lastThreadTime = threadLastReplyTime.get(threadID) || 0;
  if (now - lastThreadTime < COOLDOWN_DELAY) return;
  threadLastReplyTime.set(threadID, now);

  // 4. AUTO-REACT to user's message
  const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  api.setMessageReaction(randomEmoji, messageID, (err) => {
    if (err) console.log("[React Skipped]:", err.message);
  }, true);

  // 5. SEND ROAST + SELF-REACT
  const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  await sleep(1000);

  api.sendMessage({
    body: randomRoast,
    mentions: [{ tag: `@${senderID}`, id: senderID }]
  }, threadID, async (err, info) => {
    if (err) return console.log("[Send Error]:", err.message);
    
    // ✅ FIXED SELF-REACT — may delay at check
    if (info && info.messageID) {
      await sleep(600); // wait bago mag-react
      try {
        const selfEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        api.setMessageReaction(selfEmoji, info.messageID, (reactErr) => {
          if (reactErr) console.log("[Self-React Skipped]:", reactErr.message);
        }, true);
      } catch (e) {
        console.log("[Self-React Fail]:", e.message);
      }
    }
  });
};

// ===== COMMAND HANDLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!checkIsAdmin(senderID)) {
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    return api.sendMessage(randomRoast, threadID, messageID);
  }

  const sub = (args[0] || "").toLowerCase();
  const data = loadData();

  if (sub === "on") {
    data.active = true;
    data.activatedBy = senderID;
    data.activatedAt = Date.now();
    saveData(data);
    return api.sendMessage(
      `🔥 GLOBAL AUTO-ROAST: ACTIVATED\n\n` +
      `• Mode: Infinite / Permanent\n` +
      `• Locked GC Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `• Locked Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"\n` +
      `• ✅ Auto-React + Self-React: ENABLED\n\n` +
      `/ryuk off — to stop`,
      threadID, messageID
    );
  }

  if (sub === "off") {
    if (isActive()) {
      data.active = false;
      saveData(data);
      return api.sendMessage("✅ Auto-Roast turned OFF.", threadID, messageID);
    }
    return api.sendMessage("Auto-roast is already OFF.", threadID, messageID);
  }

  if (sub === "setgname") {
    const newGName = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.lockedGName = newGName;
    saveData(data);
    api.setTitle(newGName, threadID, (err) => {
      if (err) return api.sendMessage("❌ Failed to change GC Name.", threadID, messageID);
      return api.sendMessage(`🔒 GC Name locked to: "${newGName}"`, threadID, messageID);
    });
    return;
  }

  if (sub === "setnick") {
    const newNick = args.slice(1).join(" ") || DEFAULT_LOCKED_NAME;
    data.lockedNick = newNick;
    saveData(data);
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs || [];
      
      api.sendMessage(`⏳ Locking all nicknames to: "${newNick}" (3s delay each)...`, threadID);
      
      // ✅ MAS STABLE — 3 SECONDS DELAY
      for (const uid of participantIDs) {
        await sleep(3000);
        api.changeNickname(newNick, threadID, uid, (err) => {
          if (err) console.log(`[Nick Skip ${uid}]:`, err.message);
        });
      }
      return api.sendMessage(`🔒 All nicknames locked to: "${newNick}" ✅`, threadID, messageID);
    } catch (e) {
      return api.sendMessage("❌ Failed to set nicknames.", threadID, messageID);
    }
  }

  if (sub === "status") {
    if (!isActive()) return api.sendMessage("Auto-roast is OFF.", threadID, messageID);
    return api.sendMessage(
      `🔥 Auto-Roast is ACTIVE\n\n` +
      `📌 GC Name: "${data.lockedGName || DEFAULT_LOCKED_NAME}"\n` +
      `📌 Nickname: "${data.lockedNick || DEFAULT_LOCKED_NAME}"\n` +
      `✨ Auto-React: ON | Self-React: ON`,
      threadID, messageID
    );
  }

  return api.sendMessage(
    `Usage:\n` +
    `/ryuk on — Start\n` +
    `/ryuk off — Stop\n` +
    `/ryuk setgname <name> — Lock GC Name\n` +
    `/ryuk setnick <name> — Lock All Nicknames\n` +
    `/ryuk status — Check status`,
    threadID, messageID
  );
};
  
