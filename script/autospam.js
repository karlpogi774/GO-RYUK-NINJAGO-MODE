const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "autospam",
  version: "1.1.0",
  hasPermission: 2,
  credits: "RYUK",
  description: "Auto send messages continuously",
  usePrefix: true,
  commandCategory: "Admin",
  usages: "/autospam on [message] | off | status",
  cooldowns: 3
};

const AUTHORIZED_UIDS = [
  "61596315422605",
  "61595955098183",
  "61596600291238",
  "61596182742640"
];

const SPAM_DELAY_MS = 6000; // ⏱️ 6 segundo

const MESSAGES = [
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
  "Bakit walang nagre-reply? Busy ba kayo?",
  "Kung tahimik kayo, ako magsasalita para sa inyo 😌",
  "Ingay naman diyan, wag kayong mahiyain!",
  "Ako lang ba ang buhay dito? Hello? 🙋",
  "Mag-type lang kayo kahit '.' — sapat na 😊",
  "Parang multo ang tahimik niyo dyan 😱",
  "Sige dededmahin niyo ako — sanay na ako 😭",
  "Bukas pa ba kayo magsasalita? Hihintayin ko 😤",
  "Ang hirap niyong kausap — parang pader 😂",
  "Magkwento kayo kahit ano — makikinig ako!",
  "Nandito pa ba kayo o nawala na sa mundo?",
  "Magandang araw sa inyo — kahit hindi niyo replyan 😌",
  "Kayo ang pinakamahusay na tahimik na tropa 👏",
  "Wala bang share ng kahit ano? Sige ako lang",
  "Pag hindi kayo magsalita — ikakasal ako sa katahimikan 😂",
  "Hello hello — kumusta ang araw niyo diyan?",
  "Ang katahimikan ay nakakabingi alam niyo ba? 😅",
  "Sige na po — isang salita lang please? 🥺",
  "Ako lang ba kausap ng pader dito?",
  "Pag nag-reply kayo — libre ko kayo sa pangarap 😂",
  "Bakit parang ghost town dito bigla?",
  "May multo man o tao — magsalita ka naman 😂",
  "Kahit emoji lang — send naman oh 😥",
  "Tao po! May tao po ba sa kabilang panig?",
  "Ang bigat ng katahimikan niyo — magaan sana 😌",
  "Buhay pa ang GC — kaya mag-ingay tayo!",
  "Kayo ang misteryo ko — bakit ayaw magsalita? 🤔",
  "Sige na — hindi ako kakain hangga't walang reply — charot 😂",
  "Andito lang ako — naghihintay sa inyong salita ❤️",
  "Masarap ang kape kapag may kasama — ako lang kasi eh 😭",
  "Parang hindi tayo magkakilala — mag-usap naman 😅",
  "Sino mauuna magsalita? Panalo respeto ko 😏",
  "Kung tahimik kayo — panalo ako! Hindi ako titigil 😎",
  "Patay na ba ang baterya niyo o signal lang?",
  "Gising na ang mundo — kayo pa rin tulog 😂",
  "Ako ang boses niyo kapag tahimik kayo — ang ingay ko 😜",
  "Walang masama sa tahimik — pero masaya kung magkausap 😊",
  "Hindi ako magsasawa — hihintayin ko kayo palagi ⏳❤️",
  "Isang salita lang — gaganda ang araw niyo, subukan niyo!",
  "Huwag kayong mahiya — dito kayo ligtas magsalita 😊",
  "Ang bawat boses ay mahalaga — pati sa GC natin ❤️",
  "Sige na — isang 'hi' lang, hindi masasaktan 😄",
  "Mag-ingay tayo — buhay na buhay pa ang GC natin! 🎉",
  "Ang tahimik masyado — parang nasa ibang planeta 😂",
  "May naiwan ba sa lupa o lahat na nasa langit na? 😜",
  "Buhay pa ba kayo o naglaho na parang usok? 💨",
  "Huwag niyo akong iwan dito mag-isa — nakakatakot 😱",
  "Kahit 'hello' lang — hindi naman mahirap 'yun 😊",
  "Ang saya kapag nagkakausap — subukan niyo minsan 😌",
  "Wala kayong kasalanan kung tahimik kayo — nandito lang ako ❤️",
  "Kayo ang paborito kong tropa — kahit tahimik kayo 😂",
  "Mag-usap tayo — kahit tungkol sa ulan o panahon ☔",
  "Bawat isa ay may kwento — sabihin mo lang, makikinig ako 📖",
  "Ang mundo ay malaki — pero dito, kasya tayong lahat 🌍❤️",
  "Hindi mo kailangang maging matalino — kailangan lang nandito ka 😊",
  "Salamat na nandito kayo — kahit tahimik kayo 💖",
  "Magandang araw — nawa'y maging magaan ang puso niyo ngayon ☀️"
];

const active = new Map();
const index = new Map();
const timer = new Map();
const customMsg = new Map();

function getNextMessage(threadID) {
  if (customMsg.get(threadID)) return customMsg.get(threadID);
  if (!index.has(threadID)) index.set(threadID, 0);
  let idx = index.get(threadID);
  const msg = MESSAGES[idx];
  idx = (idx + 1) % MESSAGES.length;
  index.set(threadID, idx);
  return msg;
}

async function startLoop(api, threadID, message = null) {
  if (active.get(threadID)) return false;
  active.set(threadID, true);
  index.set(threadID, 0);
  if (message) customMsg.set(threadID, message);
  else customMsg.delete(threadID);

  const loop = async () => {
    if (!active.get(threadID)) return;
    try {
      const msg = getNextMessage(threadID);
      api.sendMessage(msg, threadID, (err) => {
        if (err) console.error("[SPAM] Error:", err?.message || err);
      });
    } catch (e) {
      console.error("[SPAM] Loop error:", e);
    }
    if (active.get(threadID)) {
      timer.set(threadID, setTimeout(loop, SPAM_DELAY_MS));
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
  customMsg.delete(threadID);
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
      return api.sendMessage("⚠️ Naka-ON na! Gamitin: /autospam off", threadID, messageID);
    }
    const msg = args.slice(1).join(" ").trim() || null;
    await startLoop(api, threadID, msg);
    return api.sendMessage(
      "💬 AUTO SPAM: NAKA-ON ✅\n\n" +
      "⏱️ Bawat 6 segundo magpapadala\n" +
      `📝 ${msg ? "Custom message: ON" : MESSAGES.length + " messages loaded"}\n\n` +
      "/autospam off para itigil",
      threadID, messageID
    );
  }

  if (sub === "off") {
    stopLoop(threadID);
    return api.sendMessage("🛑 AUTO SPAM: NAKA-OFF ✅", threadID, messageID);
  }

  if (sub === "status") {
    const status = active.get(threadID) ? "🟢 ON" : "🔴 OFF";
    return api.sendMessage(`💬 Auto Spam: ${status}\n📝 ${MESSAGES.length} messages loaded`, threadID, messageID);
  }

  return api.sendMessage(
    "📋 COMMANDS:\n\n" +
    "/autospam on — simulan\n" +
    "/autospam on <msg> — custom message\n" +
    "/autospam off — itigil\n" +
    "/autospam status — check status",
    threadID, messageID
  );
};
