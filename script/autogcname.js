const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "autogcname",
  version: "1.1.0",
  hasPermission: 2,
  credits: "RYUK",
  description: "Auto change Group Chat name continuously",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "/autogcname on | off | status",
  cooldowns: 3
};

const AUTHORIZED_UIDS = [
  "61596315422605",
  "61595955098183",
  "61596600291238",
  "61596182742640"
];

const GC_NAME_DELAY_MS = 8000; // ⏱️ 8 segundo

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
  "🔄 Bawat 8s — bago hindi paulit!",
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
  "💫 Hindi kayo nag-iisa dito",
  "✨ Bawat isa ay mahalaga",
  "🌞 Magandang umaga/hapon sa inyo!",
  "💬 Kwentuhan tayo, walang mahiya",
  "🪶 Magaan lang ang kwentuhan natin",
  "🎇 Ang saya kapag magkausap tayo",
  "🌻 Ngiti lang, okay na tayo 😊",
  "🔆 Ang liwanag kapag magkasama",
  "🍃 Hinga ng malalim — okay ka lang",
  "🌷 Salamat na nandito ka ❤️",
  "🎀 Maging mabait sa isa't isa",
  "🌅 Bagong araw, bagong simula",
  "💖 Mahalaga ang boses mo dito",
  "🎵 Ang katahimikan ay okay rin",
  "📖 Kwento mo, makikinig ako",
  "🖋️ Isang salita — sapat na 'yan",
  "🎁 Ikaw ay espesyal, wag kalimutan!"
];

const active = new Map();
const index = new Map();
const timer = new Map();

function getNextName(threadID) {
  if (!index.has(threadID)) index.set(threadID, 0);
  let idx = index.get(threadID);
  const name = GC_NAMES[idx];
  idx = (idx + 1) % GC_NAMES.length;
  index.set(threadID, idx);
  return name;
}

async function startLoop(api, threadID) {
  if (active.get(threadID)) return false;
  active.set(threadID, true);
  index.set(threadID, 0);

  const loop = async () => {
    if (!active.get(threadID)) return;
    try {
      const newName = getNextName(threadID);
      api.setTitle(newName, threadID, (err) => {
        if (err) console.error("[GC-NAME] Error:", err?.message || err);
      });
    } catch (e) {
      console.error("[GC-NAME] Loop error:", e);
    }
    if (active.get(threadID)) {
      timer.set(threadID, setTimeout(loop, GC_NAME_DELAY_MS));
    }
  };
  loop();
  return true;
}

function stopLoop(threadID) {
  active.set(threadID, false);
  if (timer.has(threadID)) {
    clearTimeout(timer.get(threadID));
    timer.delete(threadID);
  }
  index.delete(threadID);
  return true;
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!AUTHORIZED_UIDS.includes(senderID)) {
    return api.sendMessage("❌ Hindi ka awtorisado.", threadID, messageID);
  }

  const sub = (args[0] || "").toLowerCase();

  if (sub === "on") {
    if (active.get(threadID)) {
      return api.sendMessage("⚠️ Naka-ON na! Gamitin: /autogcname off", threadID, messageID);
    }
    await startLoop(api, threadID);
    return api.sendMessage(
      "🏷️ AUTO GC NAME: NAKA-ON ✅\n\n" +
      "⏱️ Bawat 8 segundo magpapalit\n" +
      `📝 ${GC_NAMES.length} names available\n\n` +
      "/autogcname off para itigil",
      threadID, messageID
    );
  }

  if (sub === "off") {
    stopLoop(threadID);
    return api.sendMessage("🛑 AUTO GC NAME: NAKA-OFF ✅", threadID, messageID);
  }

  if (sub === "status") {
    const status = active.get(threadID) ? "🟢 ON" : "🔴 OFF";
    return api.sendMessage(`🏷️ Auto GC Name: ${status}\n📝 ${GC_NAMES.length} names loaded`, threadID, messageID);
  }

  return api.sendMessage(
    "📋 COMMANDS:\n\n" +
    "/autogcname on — simulan\n" +
    "/autogcname off — itigil\n" +
    "/autogcname status — check status",
    threadID, messageID
  );
};
