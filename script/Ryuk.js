const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ryuk",
  version: "17.0.0",
  hasPermission: 0,
  credits: "sinzu & Gemini",
  description: "Glowing /silent command badge, 999 sequential lines, true self-react 😆, mention, and footer.",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "/ryuk on | off | status",
  cooldowns: 5
};

const ADMIN_UIDS = [
  "61593892603402",
  "61594022290817",
  "61595507156493",
  "61595398037273"
];

const DATA_PATH = path.join(__dirname, "ryuk_state.json");
const SELF_EMOJI = "😆";
const FOOTER = "\n\n\u200B- gø Ryūk nīnjāgø mødē";

// BASE UNIQUE ROAST LINES
const BASE_ROASTS = [
  "Ang galing mong manghusga pero sarili mo hindi mo kayang ituwid.",
  "Luh, nag-type pa talaga siya oh, akala mo naman may kumpirmasyon.",
  "Lods, paki-delete na lang 'to bago pa makita ng iba, nakakahiya.",
  "Lakas ng loob mo mag-chat, pero yung sinabi mo walang kwenta.",
  "Sino nagtanong sa'yo? Lakas maka-main character ah.",
  "Bro, isip muna bago pindot ng send button, napapahalata ka eh.",
  "Sana bago ka nag-text, nag-isip ka muna ng limang beses.",
  "Quiet ka na lang muna lods, nauubusan na kami ng patience sa'yo.",
  "Yung utak mo parang data connection, laging slow at nawawala.",
  "Ang ingay mo na naman, wala ka namang ambag.",
  "Sino bang niloloko mo dito? Sarili mo lang naman.",
  "Pilit na pilit yung hirit mo, ulitin mo sa iba baka sakaling tumawa.",
  "May award ka ba sa pagiging epal? Kasi sure win ka.",
  "Mag-aral ka munang mag-isip bago ka mag-type dito.",
  "Wala ka bang ibang gagawin kundi magpakita ng katangahan?",
  "Nakakaubos ka ng brain cells, promise.",
  "Uminom ka muna ng tubig bago ka mag-kalat dito.",
  "Sows, akala mo naman may natuwa sa sinabi mo.",
  "Manahimik ka na lang kasi masikip na yung hangin dito sa GC.",
  "Hiyang-hiya naman kami sa confidence mo na walang laman.",
  "Ulitin mo nga 'yan, pero sa harap ng salamin ha.",
  "Hindi ka nakakatawa, nakakaawa ka na.",
  "Lakas ng trip mo ah, tinaasan mo pa yung standard ng kapeng mapait.",
  "Huwag ka nang umepal kung wala ka namang ibubuga.",
  "Parang kang sirang plaka, paulit-ulit na walang kwenta.",
  "Huwag mo nang ipilit, halatang wala kang naitulong.",
  "Napaka-ingay mo naman, wala ka namang sustansya.",
  "Nakakairita na yung presensya mo dito sa totoo lang.",
  "Wala ka bang ibang libangan bukod sa pagpapansin?",
  "Ayan ka na naman sa mga hirit mong walang kwenta.",
  "Mag-off ka na muna ng data, masisira lang araw namin sa'yo.",
  "Akala mo siguro cool ka kapag ganyan mga banat mo?",
  "Subukan mo kayang tumahimik kahit isang araw lang?",
  "Nakakaawa na yung pagpapansin mo sa totoo lang.",
  "Wala ka bang ibang masabi kundi 'yan?",
  "Ang sakit sa ulo ng mga pinagsasabi mo.",
  "Tumigil ka na bago ka pa masabihan ng masakit.",
  "Wala ka nang mapapala sa pinagagawa mo ngayon.",
  "Isang malaking ewan sa'yo.",
  "Sino bang nagturo sa'yong mag-chat ng ganyan?",
  "Huwag ka nang umasa na may matutuwa sa'yo.",
  "Napakalakas ng loob mong mag-ingay dito.",
  "Magtago ka na lang sa lungga mo.",
  "Wala ka kwenta kausap.",
  "Paulit-ulit na lang yung mga pinagsasabi mo.",
  "Hindi nakakagulat na ganyan ka mag-isip.",
  "Bakit ba nandito ka pa sa GC na ito?",
  "Wala ka namang naitulong kundi bwisitin kami.",
  "Isip-isip din pag may time, hindi puro dada.",
  "Nakakarindi na boses o chats mo.",
  "Ang galing mo talagang magtapon ng oras.",
  "Wala ka bang ibang alam kundi manggulo?",
  "Tumigil ka na, wala namang natutuwa.",
  "Sarap mong i-kick dito sa totoo lang.",
  "Huwag ka nang mag-ilusyon na may bilib sa'yo.",
  "Napaka-feelingero mo naman masyado.",
  "Uwi na, gabi na, nagkakalat ka lang.",
  "Wala ka talagang ka-pounce-pounce sa katawan.",
  "Puro ka satsat, wala namang laman.",
  "Sawa na kami sa mukha at chats mo.",
  "Mag-desisyon ka nang magbago kahit ngayon lang.",
  "Hindi ka naman kawalan dito.",
  "Bakit ba ang hilig mong magpakahiya sa sarili mo?",
  "Wala ka nang pagbabago, pareho pa rin.",
  "Ang hirap mong intindihin kasi puro sabaw.",
  "Mag-isip ka muna bago mo pindutin yan.",
  "Nakakairita na yung mga banat mo.",
  "Wala ka bang ibang hobby bukod diyan?",
  "Sobra na yung kayabangan mo ha.",
  "Wala ka namang ibubuga sa totoo lang.",
  "Nakakasawa na yung mga gimik mo.",
  "Tumahimik ka na lang para may silbi ka.",
  "Ang corny mo sobra, promise.",
  "Huwag ka nang umapoy dyan sa init ng ulo mo.",
  "Wala ka bang ibang alam sabihin?",
  "Nakakaantok yung mga pinagsasabi mo.",
  "Magpahinga ka na lang kaysa magkalat.",
  "Hindi nakakabilib yung ganyan mo.",
  "Ang layo ng narating ng katangahan mo.",
  "Huwag kang masyadong mayabang kung wala kang maipakita.",
  "Sino bang niloloko mo dito?",
  "Napaka-walang kwenta naman ng hirit na yan.",
  "Mag-focus ka na lang sa sarili mo.",
  "Wala ka talagang mapapala dyan.",
  "Ang ingay-ingay mo, wala ka namang kwenta.",
  "Lumipat ka na lang ng ibang GC.",
  "Huwag ka nang magmatigas kung mali ka naman.",
  "Sarap mong tapunan ng malamig na tubig.",
  "Wala ka talagang pakialam sa paligid mo no?",
  "Nakakainis na yung pagka-epal mo.",
  "Magtino ka naman kahit sandali lang.",
  "Wala ka bang ibang topic kundi sarili mo?",
  "Ang galing mo talagang bwisitin kami.",
  "Huwag ka nang umasa pa.",
  "Napaka-epal mo sa totoo lang.",
  "Wala ka na bang ibang masabi?",
  "Ang boring mo kasama at kausap.",
  "Mag-isip ka nga ng matino kahit minsan.",
  "Umay na umay na kami sa'yo.",
  "Wala kang mararating sa ugali mong yan.",
  "Huwag kang masyadong magmamagaling.",
  "Ang sakit mo sa bangs.",
  "Wala ka talagang kwenta kasama.",
  "Tumigil ka na sa kahibangan mo.",
  "Nakakahiya yung pinaggagawa mo.",
  "Mag-sorry ka na lang sa mga naabala mo.",
  "Wala ka bang hiya sa katawan?",
  "Ang kapal ng mukha mo para mag-chat pa.",
  "Huwag mo kaming idamay sa katangahan mo.",
  "Wala kang kwentang kasama sa GC.",
  "Ang sarap mong i-block sa totoo lang.",
  "Magbago ka na habang maaga pa.",
  "Wala ka talagang modo sa katawan.",
  "Nakakadisappoint ka naman.",
  "Huwag ka nang magpapakita dito.",
  "Ang sama ng ugali mo.",
  "Wala kang silbi dito.",
  "Mag-isa ka na lang dyan.",
  "Hindi ka na natuto no?",
  "Ang tigas ng ulo mo.",
  "Wala ka talagang pakialam sa iba.",
  "Nakakainis ka na sobra.",
  "Magtigil ka na habang maaga pa.",
  "Wala ka nang pagbabago.",
  "Ang galing mo talagang mambwisit.",
  "Huwag ka na ngang mag-ingay.",
  "Wala ka namang kwenta.",
  "Magdusa ka dyan sa katangahan mo.",
  "Ang sarap mong batukan.",
  "Wala ka talagang kuwenta kausap.",
  "Nakakarindi ka na.",
  "Mag-isip ka naman.",
  "Wala ka bang konsensya?",
  "Ang panget ng ugali mo.",
  "Wala kang mararating.",
  "Mag-isa ka.",
  "Huwag kang epal.",
  "Wala kang silbi.",
  "Ang arte mo.",
  "Wala kang kwenta.",
  "Magtino ka.",
  "Wala kang kuwenta.",
  "Ang sama mo.",
  "Wala kang hiya.",
  "Magbago ka.",
  "Wala kang modo.",
  "Ang panget mo.",
  "Wala kang isip.",
  "Mag-isip ka.",
  "Wala kang bayag.",
  "Ang duwag mo.",
  "Wala kang laban.",
  "Magtago ka na.",
  "Ang bobo mo.",
  "Wala kang alam.",
  "Ang hina ng ulo mo.",
  "Wala kang mararating kailanman.",
  "Mag-aral kang mabuti muna.",
  "Ang bagal ng pick-up mo.",
  "Magbasa ka ng libro.",
  "Ang sabaw ng utak mo.",
  "Mag-isip ka bago magsalita.",
  "Ang kitid ng pananaw mo.",
  "Magpakatino ka.",
  "Ang bobo ng hirit mo.",
  "Mag-training ka muna.",
  "Ang tanga ng desisyon mo.",
  "Mag-reflect ka sa nagawa mo.",
  "Ang sabaw mo ngayon.",
  "Mag-isa ka na lang dyan habang buhay."
];

// GENERATE 999 SEQUENTIAL LINES WITH ZERO-WIDTH LEADING CHAR
const TOTAL_LINES = 999;
const ROASTS = Array.from({ length: TOTAL_LINES }, (_, i) => {
  const baseText = BASE_ROASTS[i % BASE_ROASTS.length];
  return `\u200B/silent Line #${i + 1}: ${baseText} 💀 💯`;
});

function getState() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch (e) {}
  return { active: false, currentIndex: 0 };
}

function saveState(state) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {}
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  const state = getState();

  if (!state.active || !body || body.startsWith("/") || senderID === api.getCurrentUserID()) return;

  // 1. Strict 10 Seconds Delay (Anti-Detection)
  await sleep(10000);

  // 2. Sequential Index Pointer (1 -> 999 -> 1)
  let currentIndex = state.currentIndex || 0;
  if (currentIndex >= ROASTS.length) {
    currentIndex = 0; // Loop back
  }

  const currentRoast = ROASTS[currentIndex];
  
  // Advance sequence index
  state.currentIndex = currentIndex + 1;
  saveState(state);

  // 3. Exact Format: /silent Line #X: Text 💀 💯 @Mention + Footer
  const fullText = `${currentRoast} @${senderID}${FOOTER}`;

  // 4. Send Message with Interactive Glowing /silent Command Badge
  api.sendMessage({
    body: fullText,
    mentions: [{ tag: `@${senderID}`, id: senderID }],
    command: {
      name: "silent",
      length: 7,
      offset: 1
    }
  }, threadID, (err, info) => {
    // 5. TRUE SELF-REACT: Reacts with 😆 directly on the Bot's sent message
    if (!err && info && info.messageID) {
      try {
        api.setMessageReaction(SELF_EMOJI, info.messageID, () => {}, true);
      } catch (e) {}
    }
  }, messageID);
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  
  if (!ADMIN_UIDS.includes(String(senderID))) return;

  if (sub === "on") {
    const state = getState();
    state.active = true;
    saveState(state);
    await sleep(2000);
    return api.sendMessage({
      body: `\u200B/silent 🔥 Ryuk 999 Sequential Mode: ACTIVATED (Glowing /silent Tag + Self-React 😆 + 10s Delay)${FOOTER}`,
      command: { name: "silent", length: 7, offset: 1 }
    }, threadID, messageID);
  }

  if (sub === "off") {
    const state = getState();
    state.active = false;
    saveState(state);
    return api.sendMessage({
      body: `\u200B/silent ✅ Ryuk Sequential Mode: TURNED OFF${FOOTER}`,
      command: { name: "silent", length: 7, offset: 1 }
    }, threadID, messageID);
  }

  if (sub === "status") {
    const state = getState();
    return api.sendMessage({
      body: `\u200B/silent 📌 Ryuk Status: ${state.active ? `ACTIVE (Next Line #${(state.currentIndex || 0) + 1})` : "OFF"}${FOOTER}`,
      command: { name: "silent", length: 7, offset: 1 }
    }, threadID, messageID);
  }

  return api.sendMessage({
    body: `\u200B/silent Usage: /ryuk on | off | status${FOOTER}`,
    command: { name: "silent", length: 7, offset: 1 }
  }, threadID, messageID);
};
