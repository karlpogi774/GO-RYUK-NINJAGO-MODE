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
  version: "10.6.3",
  hasPermission: 0,
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

// ⏱️ DELAY SETTINGS
const GC_NAME_DELAY_MS = 2000;      // 🏷️ Auto GC Name: 2 seconds
const SPAM_DELAY_MS = 9000;         // 💬 Spam Mode: 9 seconds

// 📢 AUTO GROUP CHAT NAMES
const AUTO_GC_NAMES = [
  "👻 Tahimik masyado dito ah",
"🌙 Tulog na ba ang lahat?",
"⚡ Ako na bahala mag-ingay!",
"🔥 Gising na kayo diyan!",
"💀 Patay na ba ang GC natin?",
"🎤 Magkwento naman kayo oh",
"🥺 Kausapin niyo naman ako",
"😤 Edi ako mag-iingay mag-isa",
"✨ Ako lang ba ang active dito?",
"🙋 Hello? May tao ba?",
"😐 Grabe ang katahimikan niyo",
"😎 Ako ang hari ng grupong ito",
"😭 Huwag niyo akong iwan mag-isa",
"🤨 Bakit walang nagre-reply?",
"💬 Kahit isang salita naman oh",
"🌀 Palit-palit tayo ng pangalan",
"🌟 Maging masaya tayo diyan!",
"😴 Tulog na yata kayong lahat",
"🚨 May buhay pa ba diyan?",
"🎈 Ang boring naman masyado",
"🗣️ Magsalita naman kayo plss",
"🤔 Nandito pa ba kayo?",
"😜 Kung ayaw niyo magsalita...",
"💡 Mag-usap naman tayo oh",
"🌞 Magandang araw sa inyo!",
"🌙 Magandang gabi naman pala",
"⚡ Andito pa ako wag kayong mag-alala",
"🔥 Walang titigil hanggang di kayo magsalita!",
"🤖 Ako ang inyong GC guardian",
"👋 Hello mga tol nandito ako!",
"😏 Hihintayin ko kayong magsalita",
"🎯 Ako ang hindi titigil sa pagpapalit",
"🌀 Walang paulit-ulit dito!",
"✨ Bawat segundo bago ang pangalan",
"💪 Kaya ko 'to mag-isa kung kailangan",
"😂 Pwede bang maging maingay tayo?",
"🚀 Simulan na natin ang ingayan!",
"🌊 Dumating na ang ingay!",
"🎪 Masaya tayo dito okay?",
"🦁 Lakas ng boses ko dito eh",
"🌈 Bakit kayo malungkot? Ngumiti naman kayo",
"🔄 Palit ulit! Hindi mauubusan!",
"⚡ Mabilis na ako ha, 2 seconds bawat isa!",
"🏁 Sino ang mauunang magsalita?",
"🎊 Unang magsalita panalo!",
"💎 Maging mabait tayo sa isa't isa",
"🌍 Nandito lang ako para sa inyo",
"🔔 Mag-ingay naman diyan!",   
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
  "Ako lang ba ang buhay dito? Hello? 🙋", 
  "🔮 Bakit kayo parang nawala bigla?",
"🎭 Sino ang magpapangiti sa akin dito?",
"🎇 Ang tahimik, parang walang tao sa mundo",
"🛸 May nakakarinig ba sa akin diyan?",
"🏠 Nasa bahay pa ba kayo o nawala na?",
"📱 Check niyo naman ang chat natin oh",
"🎁 May sorpresa ako kung magsalita kayo",
"🎀 Huwag niyo akong hintayin magalit 😤",
"🪄 Bigla na lang kayong magsasalita... ngayon!",
"📢 Naririnig niyo ba ako o mahina signal?",
"🎰 Sana may mag-reply bago ako maubusan ng linya",
"🎳 Kayo ang paborito kong ka-chat kahit tahimik kayo",
"🏆 Makaka-tagal ba kayong hindi magsalita?",
"🎡 Umikot na ang mundo, kayo pa rin tahimik",
"🎢 Minsan lang ako magtanong — kamusta kayo?",
"🎠 Basta nandito ako, hindi kayo mag-iisa",
"🎪 Kahit walang reply, andito pa rin ako",
"🎯 Hindi ako aalis hanggang di kayo magsalita",
"🎲 Kung magsalita kayo, masaya tayo!",
"🎺 Hello hello, nandito pa ba ang mga kaibigan ko?",
"🎻 Tahimik masyado, gusto niyo ng musika?",
"🎼 Kung hindi kayo magsalita, kakantahin ko kayo 😂",
"🎽 Magbihis na kayo, andito na ang saya!",
"🎾 Pag tumahimik kayo, ako ang mananalo 😏",
"🎿 Mabilis ang oras, huwag nating sayangin",
"🏂 Sama-sama tayong mag-enjoy dito",
"🏄 Huwag mag-alala, nandito lang ako",
"🚣 Kung may problema ka, sabihin mo lang",
"🏔️ Mataas man ang bundok, aabutin kita 😌",
"🌊 Malawak man ang dagat, makakausap kita",
"☀️ Magliwanag ang araw sa inyo",
"🌙 Kahit gabi, nandito pa rin ako",
"⭐ Kayo ang bituin ng grupong ito",
"🌠 Hiling ko lang — magsalita naman kayo",
"🌤️ Maganda ang panahon, mag-usap tayo",
"🌥️ Kahit maulap, masaya pa rin tayo",
"🌦️ Ulan man o araw, hindi ako aalis",
"🌧️ Huwag malungkot, nandito ako",
"🌩️ Kahit may bagyo, kakausapin pa rin kita",
"⚡ Mabilis ako, pero matiyaga ako sa inyo",
"🔥 Hindi ako mauubusan ng sasabihin",
"💧 Kahit tuyo na ang lalamunan ko, magsasalita pa rin ako 😅",
"🌱 Tumubo na ang damo, kayo pa rin tahimik 😂",
"🌳 Lumaki na ang puno, wala pa ring reply",
"🍂 Nahulog na ang dahon, hello naman oh",
"❄️ Nag-yelo na ang paligid, kayo lang ang mainit sa puso ko",
"🌸 Namumukadkad na ang bulaklak, magsalita na kayo", 
  "🌺 Magandang umaga/hapon sa inyo!",
"🐻 Huwag kayong mahiya, parang tayo lang 'to",
"🐼 Kahit tahimik kayo, nandito lang ako",
"🐨 Matiyaga ako, hihintayin ko kayo",
"🐯 Huwag kang matakot, hindi ako nangangagat 😂",
"🦁 Ikaw ang bida sa grupong ito!",
"🐮 Moo... kahit baka magsalita na lang 😭",
"🐷 Hindi ako baboy na walang pakialam 😤",
"🐸 Croak croak — magsalita naman kayo!",
"🐹 Kahit hamster mas madaldal pa sa inyo",
"🐰 Mabilis ang oras, wag nating sayangin",
"🐥 Magsalita na kayo, parang sisiw lang ako 😢",
"🐣 Lumabas na kayo sa inyong shell!",
"🐤 Chip chip — may nakakarinig ba?",
"🦋 Magbago na ang araw natin, mag-usap tayo",
"🐝 Busy ba kayo? Saglit lang naman oh",
"🐞 Kahit insekto may sasabihin pa",
"🐢 Huwag mabagal, magsalita na!",
"🐍 Hindi ako ahas, kaibigan mo ako 😊",
"🐴 Tara, takbo tayo sa kwentuhan!",
"🐵 Huwag mag-monkey-business, magsalita na 😏",
"🐔 Tumilaok na ang manok, gising na kayo!",
"🐶 Hello hello! May tao ba?",
"🐱 Meow... kahit purr lang naman oh 😺",
"🐭 Makinig kayo, may sasabihin ako!",
"🐯 Lakas ng loob ko kausapin kayo",
"🐰 Mabilis ako magpalit, pero ikaw huli 😜",
"🦊 Matalino ka naman, alam mo kung paano mag-reply",
"🐻 Matatag ako, hindi ako bibitaw 😤",
"🐼 Panda rin gusto ng atensyon 😢",
"🐨 Tahimik ka na naman ah, parang koala",
"🦁 Hari ka ng puso ko, magsalita naman",
"🐮 Baka naman nawalan ng gatas? 😂",
"🐷 Busog na kayo kaya tahimik na",
"🐸 Tumalon na kayo sa usapan natin!",
"🐹 Kwentuhan tayo, kahit sandali lang",
"🐰 Tumatakbo ang oras, wag magpatumpik-tumpik",
"🦋 Magbago na ang isip mo, mag-reply na 😊",
"🐝 Puro kayo busy, pero saglit lang naman",
"🐞 Kahit maliit ang boses mo, maririnig kita",
"🐢 Dahan-dahan lang, nandito pa rin ako",
"🐍 Walang makakatalo sa paghihintay ko sa'yo",
"🐴 Kayanatin natin ang kwentuhan!",
"🐵 Mag-usap tayo, wag maging alien 😂",
"🐔 Gising na, umaga na naman!",
  "🌊 Dumating na ang alon, sumabay kayo!",
"🏝️ Nasa isla ba kayo? Hello naman oh!",
"🗺️ Saan na kayo nagpunta? Miss ko na kayo!",
"🏔️ Mataas man ang bundok, maririnig kita",
"🌲 Nasa gubat ba kayo? Kaway kayo dyan!",
"🌊 Hindi ako bibitaw, kahit anong mangyari",
"⚓ Dito lang ako, ang inyong angkla",
"🚢 Sumakay na kayo, layag na tayo!",
"🌅 Ang ganda ng paglubog ng araw — kaso wala kayong reply 😅",
"🌄 Ang ganda ng pagsikat — magsalita naman kayo",
"🏖️ Magpahinga tayo, mag-usap tayo sandali",
"🌴 Paligid lang ako, wag kayong mag-alala",
"🏔️ Aakyatin ko ang bundok para lang makausap kayo",
"🌊 Lalanguyin ko ang dagat para sa atin 😌",
"⛰️ Matibay ang pundasyon ng pagkakaibigan natin",
"🌌 Sa dulo ng uniberso, hahanapin ko kayo",
"🌠 Gumawa ng hiling — magsalita na kayo",
"✨ Ang bawat segundo mahalaga",
"💫 Wag nating sayangin ang oras",
"🌟 Kayo ang liwanag ng grupong ito",
"🌙 Kahit madilim, nandito ang liwanag natin",
"☀️ Ang araw ay sumisikat para sa ating lahat",
"🌈 May pag-asa pa — magsalita na lang kayo 😏",
"☁️ Sa itaas man ng ulap, naririnig kita",
"⛈️ Kahit may bagyo, magkasama pa rin tayo",
"❄️ Kahit yelo matunaw, hindi ako aalis",
"🔥 Ang apoy ay hindi mamatay, katulad ng paghihintay ko",
"💧 Ang tubig ay dumadaloy, wag tayong huminto",
"🌱 May paglago pa tayo — mag-usap tayo",
"🌻 Laging haharap sa liwanag, katulad ko sa inyo",
"🌷 Maganda ang buhay kapag magkausap tayo",
"🌹 Wag mong hayaang malanta ang usapan natin",
"🍀 May swerte kung magkausap tayo",
"🎋 Matibay tayo kahit anong hangin",
"🌾 Mag-ani tayo ng magagandang alaala",
"🍁 Ang pagbabago ay maganda — magsalita ka",
"🍂 Kahit malayo ang tingin mo, nandito lang ako",
"🎑 Tumingin ka sa langit — nandito lang ako 😊",
"🎇 Ang bawat bituin nagbabantay sa atin",
"🎆 Ang saya kung magkausap tayong lahat!",
"🎈 Palipad tayo ng pangarap — magsalita ka",
"🎁 May regalo ako — ang oras ko para sa inyo",
"🎀 Maging mabait tayo sa isa't isa palagi",
"🎊 Magdiwang tayo — magsimula sa isang salita"
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
      `Auto GC Name: ${gcNameRunning} (2s delay)\n` +
      `Spam Mode: ${spamRunning} (9s delay)\n` +
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
      "⏱️ Delay: 2 segundo bawat palit\n" +
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
      "⏱️ Delay: 9 segundo bawat mensahe\n" +
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
    "/activate startgcname — simulan (2s)\n" +
    "/activate stopgcname — itigil\n\n" +
    "💬 SPAM MODE:\n" +
    "/activate spam [msg] — simulan (9s)\n" +
    "/activate spamstop — itigil",
    threadID, messageID
  );
};
