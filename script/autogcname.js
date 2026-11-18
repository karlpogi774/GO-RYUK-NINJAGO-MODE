const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "autogcname",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Ryuk",
  description: "Auto Change GC Name — AYAW NA AGAD",
  usePrefix: false,
  commandCategory: "Auto",
  usages: "",
  cooldowns: 0
};

// ===== SETTINGS =====
const ENABLED_BY_DEFAULT = true;       // ✅ AYAW NA AGAD PAG BUKAS NG BOT
const CHANGE_DELAY = 2000;             // ⏱️ 2 segundo — palitan mo kung gusto mo

// ===== MGA PANGALAN NG GC — DAGDAGAN MO KUNG GUSTO MO =====
const GC_NAMES = [
  "😏 Nandito lang ako...",
  "Hoy! Gising na kayo!",
  "Bakit ang tahimik niyo?",
  "Ako lang ba ang buhay dito?",
  "Hello? May tao ba diyan?",
  "Sige na magsalita naman kayo",
  "Pag ako lang magsasalita...",
  "Wala bang may sasabihin?",
  "Edi ako na lang magsasalita 😎",
  "Ang boring naman dito eh",
  "Kausapin niyo naman ako 😭",
  "Pag hindi kayo magsalita...",
  "Ako magpapasaya sa inyo 😌",
  "Bakit walang nagre-reply?",
  "Okay lang ako naman masaya mag-isa 😤",
  "✨ Mag-usap tayo, wag mahiya!",
  "🔥 Gising na ang lahat dyan!",
  "💫 Tahimik masyado ang GC natin ah",
  "⚡ May buhay pa ba dyan? Hello?",
  "🌟 Nandito lang ako, wag kayong mag-alala",
  "🌀 Palit-palit tayo, hindi mauubusan!",
  "🎯 Unang magsalita panalo!",
  "💎 Maging masaya tayo diyan okay?",
  "🌙 Tulog na ba ang tropa?",
  "☀️ Magandang araw sa inyo mga tol!",
  "🚀 Simulan na ang kwentuhan!",
  "🎪 Ang boring kung tahimik tayo eh",
  "🗣️ Kahit hi lang, send naman oh!",
  "🤔 Nandito pa ba kayo o nawala na?",
  "😎 Ako ang taga-ingay kapag tahimik kayo",
  "😭 Huwag niyo akong iwan mag-isa",
  "😤 Ako mag-iingay hanggang magsalita kayo",
  "🙋 May tao ba diyan? Sumagot naman!",
  "🌈 Ngumiti naman kayo diyan!",
  "🔄 Bawat 2s — bago hindi paulit!",
  "🏁 Sino mauuna maghi?",
  "🎊 Magandang araw — mag-usap tayo!",
  "🌍 Mahalaga kayo dito ❤️",
  "🔔 Mag-ingay naman, buhay pa tayo!",
  "💡 May kwento ako — makinig kayo 😏",
  "🍀 Good vibes lang dito tayo!",
  "🦋 Bawasan ang hiya, dagdagan ang kwento",
  "🌊 Parang alon — tayo at mag-usap!",
  "🎈 Bawat salita, mahalaga 'yan dito",
  "🎁 Magbigay ng ngiti — libre lang 'yan!",
  "🔥🔥🔥 NANDITO NA ANG HARI 🔥🔥🔥",
  "⚠️ WAG KANG MAHIHIYA MAG SALITA",
  "😎 AKO ANG TAGA INGAY NG GC NA ITO",
  "💪 KAYO AY MAHALAGA DITO SA ATIN",
  "✨ PAG NAG SALITA KAYO MASAYA AKO",
  "🌙 KAHIT GABI NA NANDITO PA RIN AKO",
  "☀️ MAGANDANG UMAGA MGA TOL!",
  "⚡ WALANG TIGIL HANGGANG MAY BUHAY",
  "🎪 MASAYA TAYO DITO LAGI",
  "🚀 SIMULAN NATIN ANG SAYAWAN!",
  "🎊 BAWAL ANG MALUNGKOT DITO",
  "🌍 BUONG MUNDO ALAM NA — MASAYA TAYO!",
  "🔔 TIGNAN MO AKO — NANDITO AKO!",
  "💎 PINAGPALAD KAYO DITO SA GC",
  "🦋 MAGBAGO KA NG PANGALAN — HINDI AKO MAGBABAGO",
  "🌈 HABANG BUHAY — MAG IINGAY AKO",
  "🌟 WALANG MAKAPIGIL SA ATIN!",
  "🎯 TAMA ANG PINILI MO — DITO KA SA AMIN",
  "💫 ANG GC NA ITO — ATING TAHANAN",
  "🌀 HANGGANG DULO NG KAILANAN — NANDITO AKO",
  "🔥 HINDI AKO MAGTITIGIL!",
  "⚡ BAWAT SANDALI — BAGONG SIMULA",
  "🎈 MASAYA KA BA? DAPAT LANG!",
  "🎁 MAY PAGASA — LAGI LANG",
  "🌊 DUMATING KA — NANDITO NA AKO",
  "🍀 SUMAYO KA SA AMIN — LIGAYA MO",
  "💡 MAG ISIP KA — MAY GAGAWA AKO",
  "🔄 BAGONG ARAW — BAGONG PANGALAN",
  "🏁 TAPOS NA ANG KATAHIMIKAN!",
  "🚨 NANDITO NA ANG AWAT!",
  "👑 HARI NG GC — NANDITO NA!",
  "💪 WALANG SUSUKO",
  "🔥 ARAW-ARAW — BAGONG SIMULA",
  "✨ KAHIT SAAN — NANDITO AKO",
  "🌙 GABI O ARAW — HINDI AKO TITIGIL",
  "⚡ HANGGANG MAY BUHAY — MAG IINGAY AKO",
  "🎪 ANG GC NA ITO — HINDI KATAHIMIKAN",
  "🎊 BAWAT PANGALAN — MAY KWENTO",
  "🌍 ITO ANG ATING MUNDO",
  "🔔 MAGISING NA ANG LAHAT!",
  "💎 PINAGPALAD ANG BAWAT ISA",
  "🦋 MAGBAGO ANG PANAHON — HINDI ANG PUSO",
  "🌈 KULAYIN NATIN ANG ATING GC",
  "🌟 NANDITO AKO — PARA SA INYO",
  "🎯 TIGIL ANG KATAHIMIKAN!",
  "💫 SIMULAN NATIN ANG BAGONG YUGTO",
  "🌀 UMIKOT ANG MUNDO — HINDI TAYO TITIGIL",
  "🔥🔥🔥 WALANG TIGIL 🔥🔥🔥",
  "⚡⚡⚡ NANDITO AKO ⚡⚡⚡",
  "💪💪💪 PARA SA INYO 💪💪💪"
];

let running = new Map();
let index = new Map();

function getNextName(threadID) {
  if (!index.has(threadID)) index.set(threadID, 0);
  let i = index.get(threadID);
  const name = GC_NAMES[i];
  i = (i + 1) % GC_NAMES.length;
  index.set(threadID, i);
  return name;
}

async function startLoop(api, threadID) {
  if (running.get(threadID)) return;
  running.set(threadID, true);
  index.set(threadID, 0);

  const loop = async () => {
    if (!running.get(threadID)) return;
    try {
      const newName = getNextName(threadID);
      api.setTitle(newName, threadID, (err) => {
        if (err) console.log("[GC-NAME] Error:", err?.message || err);
      });
    } catch (e) {
      console.log("[GC-NAME] Loop error:", e);
    }
    if (running.get(threadID)) {
      setTimeout(loop, CHANGE_DELAY);
    }
  };
  loop();
}

function stopLoop(threadID) {
  running.set(threadID, false);
  index.delete(threadID);
}

// ===== AUTO START — PAG MAY PASOK NA MENSAHE, AYAW NA AGAD =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, body } = event;
  if (!body) return;
  if (ENABLED_BY_DEFAULT && !running.get(threadID)) {
    startLoop(api, threadID);
  }
};

// ===== WALANG KAILANGANG COMMAND =====
module.exports.run = async function ({ api, event }) {
  api.sendMessage("✅ Auto GC Name active na!", event.threadID, event.messageID);
};
