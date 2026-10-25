const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "12.0.0-FINAL",
  hasPermission: 0,
  credits: "sinzu + Ryūk Ninja Mode",
  description: "PERFECT — 11s exact delay, NEVER stop replying, sequential loop, anti-detect",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status | reset",
  cooldowns: 1
};

const ADMIN_UIDS = [
  "61593892603402",
  "61594022290817",
  "61595507156493",
  "61595398037273"
];

const DATA_PATH = path.join(__dirname, "ryuk_state.json");
const EMOJI = "😆";
const REPLY_DELAY = 11000; // ✅ EXACTLY 11 SECONDS — NO CHANGES

// ==============================================
// SEQUENTIAL LINES — LINE #1 → #100 → BACK TO #1
// ==============================================
const ROASTS = [
  "/silent Line #001: Ang galing mong manghusga pero sarili mo hindi mo kayang ituwid. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #002: Luh, nag-type pa talaga siya oh, akala mo naman may punto. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #003: Paki-delete na lang 'to bago pa makita ng iba, nakakahiya sayo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #004: Lakas ng loob mo mag-chat, pero yung sinabi mo walang kwenta. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #005: Sino nagtanong sa'yo? Lakas maka-main character ah. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #006: Isip muna bago pindot ng send button, napapahalata ka eh. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #007: Sana bago ka nag-text, nag-isip ka muna ng limang beses. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #008: Quiet ka na lang muna lods, nauubusan na kami ng pasensya sa'yo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #009: Yung utak mo parang data connection, laging mabagal at nawawala. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #010: Ang ingay mo na naman, wala ka namang ambag dito. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #011: Sino bang niloloko mo dito? Sarili mo lang naman. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #012: Pilit na pilit yung hirit mo, ulitin mo sa iba baka sakaling tumawa sila. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #013: May award ka ba sa pagiging epal? Kasi sure panalo ka na. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #014: Mag-aral ka munang mag-isip bago ka mag-type dito sa GC. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #015: Wala ka bang ibang gagawin kundi magpakita ng katangahan? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #016: Nakakaubos ka talaga ng brain cells, promise. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #017: Uminom ka muna ng tubig bago ka mag-kalat dito. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #018: Sows, akala mo naman may natuwa sa sinabi mo kanina. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #019: Manahimik ka na lang kasi masikip na yung hangin dito dahil sayo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #020: Hiyang-hiya naman kami sa confidence mo na walang laman. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #021: Ulitin mo nga 'yan, pero sa harap ng salamin ha. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #022: Hindi ka nakakatawa, nakakaawa ka na talaga. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #023: Lakas ng trip mo ah, tinaasan mo pa yung standard ng kapeng mapait. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #024: Huwag ka nang umepal kung wala ka namang maibubuga. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #025: Parang kang sirang plaka, paulit-ulit na walang kwenta. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #026: Huwag mo nang ipilit, halatang wala kang naitulong dito. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #027: Napaka-ingay mo naman, wala ka namang sustansya sa utak. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #028: Nakakairita na yung presensya mo dito sa totoo lang. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #029: Wala ka bang ibang libangan bukod sa pagpapansin? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #030: Ayan ka na naman sa mga hirit mong walang saysay. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #031: Mag-off ka na muna ng data, masisira lang araw namin dahil sayo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #032: Akala mo siguro cool ka kapag ganyan mga banat mo? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #033: Subukan mo kayang tumahimik kahit isang araw lang ha. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #034: Nakakaawa na yung pagpapansin mo sa totoo lang. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #035: Wala ka bang ibang masabi kundi paulit-ulit na 'yan? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #036: Ang sakit sa ulo ng mga pinagsasabi mo palagi. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #037: Tumigil ka na bago ka pa masabihan ng masakit na salita. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #038: Wala ka nang mapapala sa pinagagawa mo ngayon. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #039: Isang malaking ewan talaga sa'yo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #040: Sino bang nagturo sa'yong mag-chat ng ganyan katanga? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #041: Huwag ka nang umasa na may matutuwa sa mga sinasabi mo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #042: Napakalakas ng loob mong mag-ingay dito sa GC. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #043: Magtago ka na lang sa lungga mo kung saan tahimik. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #044: Wala ka talagang kwenta kausap, sorry na lang. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #045: Paulit-ulit na lang yung mga pinagsasabi mo araw-araw. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #046: Hindi nakakagulat na ganyan ka mag-isip palagi. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #047: Bakit ba nandito ka pa sa GC na ito kung wala kang ambag? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #048: Wala ka namang naitulong kundi bwisitin kaming lahat. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #049: Isip-isip din pag may time, hindi puro satsat lang. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #050: Nakakarindi na mga sinasabi mo, seryoso na. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #051: Ang galing mo talagang mag-aksaya ng oras namin. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #052: Wala ka bang ibang alam kundi manggulo lang dito? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #053: Tumigil ka na, wala namang natutuwa sa'yo dito. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #054: Sarap mong i-kick dito sa totoo lang, wag na lang. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #055: Huwag ka nang mag-ilusyon na may bilib sa mga sinasabi mo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #056: Napaka-feelingero mo naman masyado ngayon. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #057: Uwi na, gabi na, nagkakalat ka lang dito sa GC. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #058: Wala ka talagang silbi dito, tanggapin mo na. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #059: Puro ka salita, wala namang gawa — ganyan ka palagi. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #060: Sawa na kami sa mga chats mo, totoo naman eh. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #061: Mag-desisyon ka nang magbago kahit ngayon lang naman. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #062: Hindi ka naman kawalan dito sa GC natin eh. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #063: Bakit ba ang hilig mong magpakahiya sa sarili mo? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #064: Wala ka nang pagbabago, pareho ka pa rin dati. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #065: Ang hirap mong intindihin kasi puro sabaw utak mo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #066: Mag-isip ka muna bago mo pindutin yung send button ha. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #067: Nakakairita na yung mga banat mo, seryoso na. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #068: Wala ka bang ibang hobby bukod sa mang-inis ng iba? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #069: Sobra na yung kayabangan mo ha, dahan-dahan lang. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #070: Wala ka namang maipagmamalaki sa totoo lang eh. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #071: Nakakasawa na yung mga gimik mo araw-araw na lang. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #072: Tumahimik ka na lang para kahit paano may silbi ka. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #073: Ang corny mo sobra, promise hindi nakakatawa. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #074: Huwag ka nang umapoy dyan sa init ng ulo mo ha. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #075: Wala ka bang ibang alam sabihin kundi paulit-ulit? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #076: Nakakaantok yung mga pinagsasabi mo palagi eh. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #077: Magpahinga ka na lang kaysa magkalat dito sa GC. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #078: Hindi nakakabilib yung ganyan mong ugali ha. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #079: Ang layo na ng narating ng katangahan mo talaga. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #080: Huwag kang masyadong mayabang kung wala kang maipakita. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #081: Sino bang niloloko mo dito sa harap namin lahat? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #082: Napaka-walang kwenta naman ng hirit na 'yan kanina. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #083: Mag-focus ka na lang sa sarili mo kaysa sa iba. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #084: Wala ka talagang mapapala dyan sa ginagawa mo. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #085: Ang ingay-ingay mo, wala ka namang kwenta kausap. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #086: Lumipat ka na lang ng ibang GC kung pwede naman. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #087: Huwag ka nang magmatigas kung mali ka naman eh. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #088: Sarap mong tapunan ng malamig na tubig ngayon. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #089: Wala ka talagang pakialam sa paligid mo noh? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #090: Nakakainis na yung pagka-epal mo, seryoso na. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #091: Magtino ka naman kahit sandali lang sa maghapon. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #092: Wala ka bang ibang topic kundi sarili mo lang naman? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #093: Ang galing mo talagang bwisitin kaming lahat dito. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #094: Huwag ka nang umasa pa na may magbabago. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #095: Napaka-epal mo sa totoo lang eh, wag na lang. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #096: Wala ka na bang ibang masabi kundi paulit-ulit? 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #097: Ang boring mo kasama at kausap, totoo naman. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #098: Mag-isip ka nga ng matino kahit minsan naman ha. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #099: Umay na umay na kami sa mga sinasabi mo palagi. 💀 💯 - gø Ryūk nīnjāgø mødē",
  "/silent Line #100: Wala kang mararating sa ugali mong ganyan palagi. 💀 💯 - gø Ryūk nīnjāgø mødē"
];

function getState() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch (e) {}
  return { active: false, index: 0 };
}

function saveState(state) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {}
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==============================================
// MAIN — NEVER STOP REPLYING TO ANY MEMBER
// ==============================================
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  const state = getState();
  const botID = api.getCurrentUserID();

  // ❌ Skip only: off / empty msg / command / bot's own msg
  if (!state.active || !body || body.startsWith("/") || senderID === botID) return;

  // ✅ REACT — sa iba lang, hindi sa sarili
  try {
    api.setMessageReaction(EMOJI, messageID, () => {}, true);
  } catch (e) {}

  // ✅ EXACTLY 11 SECONDS DELAY — hindi magbabago
  await sleep(REPLY_DELAY);

  // ✅ NEXT LINE IN ORDER — loop back to #1 pag dulo
  let idx = state.index || 0;
  if (idx >= ROASTS.length) idx = 0;

  // ✅ BUILD MESSAGE — /silent FIRST so command WON'T light up
  const lineText = ROASTS[idx];
  const finalBody = `${lineText}\n/silent @${senderID}`;

  // ✅ SEND — kahit sino mag-chat, laging REPLY
  api.sendMessage({
    body: finalBody,
    mentions: [{ tag: `@${senderID}`, id: senderID }]
  }, threadID, () => {});

  // ✅ SAVE NEXT LINE NUMBER
  saveState({ active: true, index: idx + 1 });
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  
  if (!ADMIN_UIDS.includes(String(senderID))) return;

  if (sub === "on") {
    saveState({ active: true, index: 0 });
    await sleep(1500);
    return api.sendMessage("/silent 🔥 Ryūk Ninja Mode: ACTIVATED ✅\n⏱ Delay: 11 seconds EXACT\n🔁 Loop: ON\n♾ NEVER stop replying\n- gø Ryūk nīnjāgø mødē", threadID, messageID);
  }

  if (sub === "off") {
    saveState({ active: false, index: 0 });
    return api.sendMessage("/silent ✅ Ryūk Ninja Mode: TURNED OFF\n- gø Ryūk nīnjāgø mødē", threadID, messageID);
  }

  if (sub === "status") {
    const state = getState();
    const pos = (state.index || 0) + 1;
    return api.sendMessage(`/silent 📌 STATUS:\n${state.active ? "✅ ACTIVE" : "❌ OFF"}\n⏱ Delay: 11 seconds\n📝 Next Line: #${pos} of ${ROASTS.length}\n♾ Loop: ON\n- gø Ryūk nīnjāgø mødē`, threadID, messageID);
  }

  if (sub === "reset") {
    saveState({ active: getState().active, index: 0 });
    return api.sendMessage("/silent 🔄 Line reset to #1\n- gø Ryūk nīnjāgø mødē", threadID, messageID);
  }

  return api.sendMessage("/silent USAGE:\n/ryuk on — Start\n/ryuk off — Stop\n/ryuk status — Check\n/ryuk reset — Back to Line #1\n- gø Ryūk nīnjāgø mødē", threadID, messageID);
};
