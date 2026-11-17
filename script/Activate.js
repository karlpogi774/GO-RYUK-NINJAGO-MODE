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
const GC_NAME_DELAY_MS = 5000;      // 🏷️ Auto GC Name: 2 seconds
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
  "🔐 Ang pagkakaibigan natin ay walang katapusan",
"🗝️ Bukasan ang puso, magsalita ka lang",
"📝 Isang salita lang, sapat na",
"📖 Marami pang kwento — simulan natin",
"🖊️ Isulat ang kwento natin ngayon",
"📡 Naririnig mo ba ako? Nandito lang ako",
"📲 Mag-type ka lang, naghihintay ako",
"⏰ Oras na para mag-usap",
"⏳ Hindi nauubos ang pasensya ko sa inyo",
"🔑 Nandito lang ako, hindi ako aalis",
"🪁 Lipad tayo ng pangarap — magsalita ka",
"🎈 Wag kang mag-alala, hawak kita",
"🎀 Ikaw ay espesyal, tandaan mo 'yan",
"🎊 Batiin mo ang sarili mo — nandito ako 😊",
"🎉 Masaya ako na kasama kayo",
"🎁 Ang presensya mo ay sapat na regalo",
"🎯 Hindi ako titigil hanggang mag-usap tayo",
"🎲 Subukan natin — mag-type ka lang",
"🎸 May kanta ako para sa inyo",
"🎹 Kung tahimik kayo, tutugtugin ko ang saya",
"🎺 Tugtugin ang ingay — magsalita na!",
"🎻 Ang musika ng pagkakaibigan ay hindi titigil",
"🎤 Ikaw ang bida, kunin mo ang mikropono",
"🎧 Makinig ako, sabihin mo lang",
"📸 Kuhanan natin ng alaala ang araw na ito",
"🎬 Ang kwento natin ay maganda — simulan mo",
"🎭 Ikaw ang karakter, ako ang tagapakinig",
"🎨 Kulayan natin ang araw na ito",
"🖌️ Kahit simpleng salita, makukulay ang araw",
"✏️ Magsimula sa maliit, lalaki ang kwento",
"📐 Hindi kailangang perpekto — ikaw lang sapat na",
"📏 Hindi mahalaga ang haba, ang mahalaga ikaw 'yan",
"🗺️ Hindi ko alam ang daan kung hindi ka magsasabi",
"🧭 Gabay kita, basta magsalita ka lang",
"🧳 Dalhin mo ako sa kwento mo",
"🎒 Handa akong makinig, anumang oras",
"👜 May kwento ka ba? Ibahagi mo lang",
"💼 Hindi kailangang seryoso — mag-usap lang tayo",
"👑 Ikaw ang hari/reyna ng grupong ito",
"👸 Maging totoo ka lang, tanggap kita",
"🤴 Walang masamang sasabihin — magsalita ka lang",
"🧸 Yakap mula sa malayo — nandito ako",
"🎪 Ang sirkus ng saya — simulan mo na!",
"🎡 Umikot man ang mundo, hindi ako aalis",
"🎢 May taas at baba — kasama mo ako palagi",
"🏠 Ang grupong ito ay tahanan natin",
"🏡 Umuwi ka sa usapan — naghihintay kami",
"🏰 Kahit mataas ang pader, kakausapin kita",
"🏗️ Itayo natin ang magandang samahan",
"🛡️ Protektahan natin ang ating pagkakaibigan",
"⚔️ Hindi laban ito — kwentuhan lang tayo",
"🏹 Ang bawat salita ay tumatama sa puso",
"🪂 Lumipad ka — nandito ang lupa mo",
"🚀 Pumunta tayo sa bagong kwento — magsalita ka",
"🛸 Mayroon bang gusto mong sabihin?",
"🚁 Dumating na ako — hello naman oh!",
"🚗 Sakay ka na, magkwentuhan tayo",
"🚂 Ang tren ng kwento — aalis na, sumama ka!",
"⛵ Layag tayo — bagong kwento ang hinihintay",
"🛶 Kahit maliit na bangka, makakarating tayo",
"🚢 Malaking barko — kasama tayong lahat",
"🚧 Walang harang sa pagkakaibigan natin",
"🚦 Berde na ang ilaw — magsalita ka na!",
"🛑 Hindi kailangang huminto — mag-usap tayo",
"⚠️ Mag-ingat — nandito lang ako para sa'yo",
"🛠️ Ayusin natin ang araw mo — magsalita ka lang",
"🔧 Kahit sira ang araw, maaayos natin 'yan",
"🔩 Maliit na salita — malaking pagbabago",
"⚙️ Gumagana ang mundo kapag magkausap tayo",
"🔭 Tumingin ka sa malayo — may pag-asa pa",
"🔬 Kahit maliit na boses, maririnig kita",
"📡 Signal lang ba ang problema? Nandito ako",
"📠 Magpadala ka lang — nandito ang tanggap mo",
"📤 Ipadala ang salita — darating sa akin",
"📥 Natanggap ko — salamat kung magsasalita ka",
"📦 Ang mensahe mo — pinakamahalagang parsela",
"🎁 Buksan mo ang puso mo — nandito ako",
"🎀 Maganda ka sa paningin ko — magsalita ka lang",
"🏷️ Walang presyo ang pagkakaibigan natin",
"🏺 Panatilihin natin ang kwento natin",
"🗿 Matibay ang pundasyon natin — mag-usap tayo",
"🌋 Kahit pumutok ang bulkan, makikinig pa rin ako",
"🏔️ Matayog ang pangarap ko para sa atin",
"🌊 Ang alon ng usapan — wag nating patigilin",
"🔥 Ang apoy ng pagkakaibigan — panatilihing buhay",
"💧 Ang tubig ng pag-unawa — wag nating patuyuin",
"🌱 Ang binhi ng kwento — itanim mo ngayon",
"🌿 Lalago tayo — basta magsalita ka lang",
"🍃 Ang hangin ng pagbabago — dalhin ang boses mo",
"🌳 Matanda na ang puno, pero bago ang kwento",
"🌲 Laging berde ang pag-asa — magsalita ka",
"🌴 Kahit sa dulo ng mundo, kakausapin kita",
"🌵 Kahit sa disyerto, may tubig pa rin — may pag-asa pa",
"🌾 Mag-ani tayo ng magagandang salita",
"🍁 Ang pagbabago ay okay — magsalita ka lang",
"🍂 Kahit malungkot ang panahon, nandito ako",
"❄️ Kahit nagyeyelo, mainit pa rin ang puso ko",
"☃️ Gawing masaya ang araw — isang salita lang",
"🌬️ Ang hangin ay dadaan — samantalahin mo",
"🌫️ Kahit malabo, nandito ang gabay mo",
"🌥️ Pagkatapos ng ulan, may ngiti — magsalita ka",
"⛈️ Kahit may bagyo, kasama mo ako",
"🌈 Ang bahaghari — pagkatapos ng tahimik, may usapan",
"☀️ Ang liwanag mo — nagsisimula sa isang salita",
"🌙 Kahit gabi, naririnig kita — magsalita ka lang",
"⭐ Ang bituin — nakikinig din sa'yo",
"🌟 Ikaw ang bituin ng grupong ito — magliwanag ka",
"✨ Ang kislap ng usapan — simulan mo ngayon",
"💫 Walang hanggan — hanggang sa magsalita ka 😊", 
  "🤗 Yakap para sa inyo dyan!",
"😉 Ngumiti ka, okay lang ang lahat",
"😄 Masaya ako na andito kayo",
"😌 Magpahinga ka, nandito lang ako",
"🙏 Salamat na nandito kayo",
"💪 Kaya natin 'to, mag-usap lang tayo",
"🤝 Magtulungan tayo, simula sa kwentuhan",
"👂 Naririnig kita, kahit tahimik ka",
"👁️ Nakikita kita, mahalaga ka",
"✋ Hintayin kita, wag magmadali",
"🤚 Nandito lang ako, hindi aalis",
"🖐️ Limang segundo — mag-isip ka lang",
"🤙 Nandito lang ako, tawagin mo lang",
"👊 Lakas ng loob mo, kaya mo 'yan",
"✊ Matatag ka, alam ko 'yan",
"💋 Isang halik sa noo — okay ka lang",
"🤫 Kahit bulong lang, sapat na",
"🤐 Hindi ko sasabihin sa iba, pangako",
"😶 Kahit tahimik, naiintindihan kita",
"😇 Mabuti kang tao, tandaan mo 'yan",
"🥰 Mahalaga ka sa amin dito",
"😍 Masaya ako kapag active ka",
"🤩 Ikaw ang espesyal dyan",
"🥳 Celebrate tayo — ikaw lang sapat na",
"😎 Kalmado lang, magsalita ka kapag handa ka na",
"🤓 Marunong ka, huwag kang matakot magkamali",
"😤 Okay lang magalit, nandito ako makikinig",
"😭 Okay lang umiyak, nandito ako damayan ka",
"😢 Pagkatapos ng luha, may ngiti pa rin",
"😤 Hindi mo kailangang mag-isa",
"😡 Kung galit ka, sabihin mo lang sa akin",
"😠 Okay lang magalit, tao ka lang naman",
"😞 Kung malungkot ka, nandito ako kasama mo",
"😔 Nandito lang ako, hindi kita iiwan",
"🙁 Kung may problema ka, ibahagi mo lang",
"🙂 Okay ka, nandito ako para sa'yo",
"😊 Isang simpleng hello — sapat na sa akin",
"😃 Masaya ako na nagpakita ka",
"😄 Ang araw ko gumaganda kapag nandito ka",
"😁 Salamat na andito ka",
"😆 Ang saya ko, nandito ka",
"😅 Kahit nahihirapan ka, nandito ako",
"🙃 Baliktarin mo ang mukha mo — ngumiti ka 😊",
"😉 May magandang mangyayari, maniwala ka",
"😜 Magbiro ka naman, wag masyadong seryoso",
"😝 Kahit pilyo ka, tanggap kita",
"🤑 Hindi kailangan ng pera — oras lang ang hiling ko",
"🤒 Kung masama pakiramdam mo, magpahinga ka",
"🤕 Okay lang masaktan, gagaling ka rin",
"😴 Kung pagod ka, magpahinga ka muna",
"💤 Babalik ako kapag gising ka na",
"😪 Wag pilitin, nandito lang ako",
"🤐 Walang pipilitin ka — kapag handa ka, sabihin mo",
"🤫 Lihim natin 'to — magsalita ka lang",
"👁️‍🗨️ Sa isip mo lang, pwede mo sabihin sa akin",
"🗣️ Kapag handa ka, andito pa rin ako",
"📢 Hindi kailangang malakas — marinig kita kahit pabulong",
"🔊 Ang boses mo mahalaga",
"🔉 Kahit mahina, mahalaga pa rin",
"🔇 Kahit tahimik, nandito pa rin ako",
"📣 Ikaw ang boses ng puso mo",
"📯 Pakinggan mo ang sarili mo",
"🎺 Ang boses mo mahalaga sa mundo",
"🎸 Ang kwento mo mahalaga sa akin",
"🎹 Ang himig ng boses mo — hinihintay ko",
"🎻 Ang musika ng pagkakaibigan — ikaw ang nota",
"🎼 Bawat salita mo — mahalagang bahagi ng awit",
"🎵 Ang himig ng ating samahan",
"🎶 Sabay tayong kakanta — simulan mo lang",
"🎤 Hawak ko ang mikropono para sa'yo",
"🎧 Naka-headphone ako — nakikinig lang sa'yo",
"📻 Ang dalas mo — laging nakatutok ako",
"📺 Ikaw ang palabas — pinapanood kita 😊",
"📸 Kuhanan kita ng alaala — ngumiti ka",
"📷 Kahit wala kang makita, nakikita kita",
"🎞️ Ang kwento mo — pelikang sulit panoorin",
"🎬 Ikaw ang bida — simulan ang eksena",
"🎥 Ako ang manonood — hihintayin kita",
"🎭 Hindi kailangang mag-arte — ikaw lang okay na",
"🎨 Kulay mo ang mundo mo — magsalita ka lang",
"🖼️ Ang buhay mo — magandang larawan",
"🖍️ Gumuhit ka ng ngiti sa mukha mo",
"✏️ Isulat ang kwento mo — nagsisimula ngayon",
"📝 Isang linya lang — sapat na simula",
"📖 Ang libro ng buhay mo — may pahina pa",
"📕 Hindi pa tapos ang kwento — magpatuloy ka",
"📗 Bagong kabanata — simulan mo ngayon",
"📘 Bukas ang pahina — magsulat ka",
"📙 Ang alaala natin — itatago ko palagi",
"📚 Aklat ng pagkakaibigan — dagdagan pa natin",
"📓 Talaan ng ating samahan — nagsisimula ka",
"📔 Tahanan ng mga alaala — andito ka",
"📒 Isulat mo ang pangalan mo sa puso ko",
"📄 Isang pahina — ikaw ang simula", 
  "🤲 Hawak ko ang kamay mo, wag kang matakot",
"🙌 Itaas ang noo mo, may pag-asa pa",
"🤞 Krosed daliri ko para sa'yo",
"🤟 Mahalaga ka, tandaan mo 'yan",
"✌️ Dalawang daliri — okay lang ang lahat",
"🖖 Mabuhay ka, nandito lang ako",
"👌 Kaya mo 'yan, alam ko",
"🤙 Tawagin mo lang, nandito ako agad",
"💛 Puno ng pag-asa ang puso ko",
"💚 Laging may lunas, wag sumuko",
"💙 Payapa ka, nandito ang tahanan mo",
"💜 Espesyal ka, huwag mong kalimutan",
"❤️ Mahalaga ang presensya mo dito",
"🧡 Nandito lang ako, hindi kita iiwan",
"🧡 Ang init ng pagkakaibigan natin",
"💖 Ikaw ang liwanag ng araw ko",
"💗 Ang puso ko nakikinig sa'yo",
"💓 Ang tibok ng puso ko — para sa'yo",
"💞 Magkasama tayo, kahit sa chat lang",
"💕 Isang simpleng salita — malaking bagay",
"💑 Ang samahan natin — walang kapalit",
"🖤 Kahit madilim, ikaw ang bituin ko",
"🤍 Ang puso ko malinis para sa'yo",
"🤎 Matibay ang samahan natin",
"💝 Regalo ko — ang oras ko para sa'yo",
"🎀 Maganda ka sa paningin ko",
"🎊 Batiin mo ang sarili mo — andito ako",
"🎉 Ang saya ko na nakakausap kita",
"🎈 Palipad tayo ng pangarap — magsalita ka",
"🎁 May oras ako para sa'yo, anytime",
"🏵️ Parang bulaklak — maganda ka",
"🌸 Namumukadkad ka araw-araw",
"🌺 Ikaw ang pinakamagandang bulaklak",
"🌻 Laging humaharap sa liwanag",
"🌼 Ang ngiti mo — parang araw",
"🌷 Ang halaga mo — hindi matutumbasan",
"🌹 Maganda ka sa loob at labas",
"🥀 Kahit may sugat, gagaling ka rin",
"🍀 May swerte ka — naniniwala ako sa'yo",
"🌿 Ang pag-asa — laging berde",
"🍃 Ang hangin — dalhin ang boses mo",
"🌱 Magsisimula ka — maliit pero lalaki",
"🪴 Lumalago ka — wag kang magmadali",
"🌳 Matatag ka — parang puno",
"🌲 Laging berde ang pag-asa ko sa'yo",
"🌴 Kahit sa dulo ng mundo — hahanapin kita",
"🌵 Kahit sa disyerto — may tubig pa rin",
"🌾 Mag-ani tayo ng magagandang alaala",
"🌽 Ang bawat pagsisikap — may bunga",
"🍁 Ang pagbabago — hindi masama",
"🍂 Ang pagpapahinga — kailangan mo rin",
"❄️ Kahit malamig — mainit pa rin ang puso ko",
"⛄ Gawing masaya ang bawat araw",
"🌬️ Hinga nang malalim — okay ka",
"🌫️ Malabo man ngayon — lilinaw din",
"🌤️ May araw pagkatapos ng ulan",
"⛅ Hindi laging maulap — may liwanag din",
"🌥️ Pagkatapos ng dilim — sumisikat ang araw",
"🌦️ Ulan man o araw — kasama kita",
"🌧️ Kung umuulan — payong kita",
"⛈️ Kahit may bagyo — hawak kita",
"🌩️ Hindi ka nag-iisa — nandito ako",
"⚡ Mabilis ang problema — lilipas din",
"🔥 Ang puso mo — wag patayin",
"✨ Ikaw — sapat na, kung sino ka man",
"⭐ May puwang ka dito — hindi mo kailangang magbago",
"🌟 Ang halaga mo — walang katapusan",
"💫 Isang salita lang — sapat na para magsimula",
"🌠 Gumawa ka ng hiling — nandito ako tumutupad",
"🌌 Sa dulo ng kalawakan — kilala kita",
"🌍 Ikaw — mahalaga sa mundong ito",
"🌎 Sa bawat sulok — nandito ka sa puso ko",
"🌏 Magkasama tayo — kahit magkalayo tayo",
"🪐 Kahit ibang mundo — hahanapin kita",
"🌑 Kahit bagong buwan — may liwanag pa rin",
"🌒 Unti-unti — lalabas ang liwanag",
"🌓 Hindi kailangang buo — okay ka na",
"🌔 Lalaki ka pa — wag kang matakot",
"🌕 Buong-buo ka sa paningin ko",
"🌖 Kahit humupa — babalik ang liwanag",
"🌗 Ang bawat yugto — may saysay",
"🌘 Babalik ka — naniniwala ako",
"🌙 Gabay kita sa dilim — magsalita ka lang",
"☀️ Sikat ka — wag kang magtago",
"🌅 Darating ang umaga — may pag-asa",
"🌆 Kahit dapit-hapon — hindi pa huli ang lahat",
"🌇 Ang ganda ng paglubog — may bukas pa",
"🌈️ Ang susunod na araw — bago simula",
"🌉 Tulay tayo — sa pagitan natin",
"🏠 Dito ka — ligtas ka",
"🏡 Tahanan mo ang grupong ito",
"🏘️ Marami kang kasama — hindi ka nag-iisa",
"🏰 Ikaw ang prinsesa/prinsipe ng puso ko",
"⛰️ Mataas man ang harang — kayang lagpasan",
"🏔️ Ang tuktok — abot-kamay mo",
"🌊 Ang alon — lilipas din",
"🏝️ Kahit mag-isa ka — nandito ako kasama mo",
"🛶 Hindi ka lulubog — hawak kita",
"⛵ Layag mo — patungo sa pag-asa",
"🚢 Malayo man ang lalakarin — sasamahan kita",
"🚀 Ang pangarap mo — susuportahan ko",
"🛸 Walang imposible — maniwala ka sa sarili mo",
"🌟 Ikaw — may kinabukasan na naghihintay", 
  "📢 Naririnig mo ba ako o sadyang tahimik lang?",
"🗣️ Kahit pabulong lang, andito ako para makinig",
"🤫 Hindi ko ipagkakalat, sabihin mo lang sa akin",
"👂 Ang tenga ko — nakatutok sa'yo palagi",
"👀 Hindi kita nawawala sa paningin ko",
"✋ Sandali lang — huminga ka nang malalim",
"🤚 Hindi kailangang magmadali — kapag handa ka na",
"🖐️ May puwang ka dito — laging bukas",
"🤙 Tawagin mo lang — kahit anong oras",
"👊 Laban lang — nasa likod mo lang ako",
"✊ Kaya mo — naniniwala ako sa'yo",
"🤝 Hawak-kamay tayo — hindi ka mag-iisa",
"🤗 Yakap mula sa malayo — damhin mo 'yan",
"🫂 Laging may puwang para sa'yo dito",
"💪 Hindi ka mahina — matapang ka lang",
"🧡 Ang puso ko — para sa'yo lang ngayon",
"💛 Ang liwanag ko — gagabay sa'yo",
"💚 Ang pag-asa ko — hindi nauubos",
"💙 Ang payapang isip — nawa'y dumating sa'yo",
"💜 Ang halaga mo — walang katumbas",
"❤️ Ang presensya mo — sapat na",
"🖤 Kahit madilim — ikaw ang liwanag ko",
"🤍 Ang kalinawan — darating din",
"🤎 Ang katatagan — nasa loob mo",
"💖 Ikaw ang dahilan kung bakit andito ako",
"💗 Ang kwento mo — mahalaga sa akin",
"💓 Ang tibok ng puso ko — sumasabay sa'yo",
"💞 Magkasama tayo — sa hirap at ginhawa",
"💕 Isang salita — sapat na para magsimula",
"💝 Regalo ko — ang oras ko para sa'yo",
"🌟 Ikaw ang bituin sa aking kalangitan",
"⭐ Walang bituin na mas maliit kaysa sa iba",
"✨ Ang kislap mo — hindi maglalaho",
"💫 Kahit maliit ang hakbang — umuusad ka",
"🌠 Gumawa ng hiling — tutuparin ko kasama mo",
"🌌 Sa kalawakan ng buhay — may puwang ka",
"🌍 Sa mundong ito — mahalaga ka",
"🌎 Kahit magkahiwalay — magkonektado pa rin tayo",
"🌏 Ang tahanan natin — ang ating samahan",
"🌑 Kahit madilim ang gabi — may buwan pa rin",
"🌒 Unti-unting lilitaw ang liwanag",
"🌓 Hindi mo kailangang maging buo para mahalin ka",
"�4 Lalaki ka pa — may oras ka",
"🌕 Buong-buo ka sa paningin ko",
"🌖 Kahit humupa — babalik ang liwanag",
"🌗 Bawat yugto mo — may saysay",
"�8 Hindi ka nawawala — nagpapahinga ka lang",
"🌙 Gabay kita sa dilim — hindi ka mag-iisa",
"☀️ Sikat ka — huwag kang magtago",
"🌅 Bukas na ang pinto — pumasok ka",
"🌆 Kahit dapit-hapon — hindi pa huli ang lahat",
"🌇 Ang ganda ng paglubog — may bukas na darating",
"🌈 Pagkatapos ng ulan — may bahaghari",
"🌉 Tulay sa pagitan natin — ikaw ang dulo",
"🏠 Dito ka — ligtas ka",
"🏡 Umuwi ka — naghihintay kami",
"🏘️ Marami kang kasama — hindi ka nag-iisa",
"🏰 Kahit mataas ang pader — kakausapin kita",
"⛰️ Ang bundok na inaakyat mo — abot-kamay mo na",
"🏔️ Sa tuktok — hinihintay kita",
"🌊 Ang alon — lilipas din, ikaw mananatili",
"🏝️ Kahit nasa isla ka — dadalawin kita",
"🛶 Hindi ka lulubog — kasama kita",
"⛵ Layag mo — patungo sa atin",
"🚢 Malayo man ang lalakbayin — sasamahan kita",
"🚀 Ang pangarap mo — sasakyan ko kasama ka",
"🛸 Walang hangganan ang kakayahan mo",
"🌤️ Maganda ang umaga — simulan mo na",
"⛅ Kahit maulap — nandito pa rin ako",
"🌥️ Lilinaw din ang lahat — tiwala lang",
"🌦️ Ulan man o araw — kasama kita",
"🌧️ Kung umuulan — payong kita",
"⛈️ Kahit may bagyo — hawak kita",
"🌩️ Matatakot ka man — nandito ako sa tabi mo",
"⚡ Mabilis ang problema — lilipas din agad",
"🔥 Ang apoy ng pag-asa — huwag patayin",
"💧 Ang tubig ng pag-unawa — huwag patuyuin",
"🌱 Ang binhi ng pagbabago — itanim mo ngayon",
"🌿 Lalago ka — bigay lang ng oras",
"🍃 Ang hangin — dalhin ang mensahe mo",
"🌳 Matatag ka — parang puno sa hangin",
"🌲 Laging may pag-asa — kahit taglamig",
"🌴 Kahit sa dulo ng mundo — kilala kita",
"🌵 Kahit sa pinakatuyong lugar — may tubig pa rin",
"🌾 Mag-ani tayo ng magagandang alaala",
"🍁 Ang pagbabago — bahagi ng paglago",
"🍂 Magpahinga ka — kailangan mo rin 'yan",
"❄️ Kahit nagyeyelo — mainit pa rin ang puso ko",
"⛄ Gawing maganda ang bawat araw",
"🌬️ Hinga — dahan-dahan lang",
"🌫️ Malabo man ngayon — lilinaw din bukas",
"📡 Naririnig kita — kahit mahina ang signal",
"📲 Mag-type ka lang — naghihintay ako",
"⏰ Oras mo — mahalaga sa akin",
"⏳ Hihintayin kita — kahit gaano katagal",
"🔑 Nandito lang ako — hindi ako aalis",
"🪄 May solusyon — hindi mo kailangang mag-isa",
"🎈 Ikaw — sapat na, huwag mong baguhin ang sarili mo",
"🎁 Ang presensya mo — pinakamagandang regalo",
"🎀 Maging ikaw lang — masaya na ako",
"🏷️ Walang presyo ang halaga mo",
"🏺 Ang kwento mo — itatago ko sa puso ko",
"🗿 Matibay ang samahan natin — kahit walang salita",
"🌋 Kahit magalit ka — makikinig pa rin ako",
"🪂 Tumalon ka — sasalo kita",
"🚀 Pumunta tayo sa bagong simula — handa ka na?", 
  "🏃 Maglakad ka lang, hihintayin kita",
"🚶 Dahan-dahan lang, nandito lang ako",
"🧗 Akyatin mo ang araw na ito — kasama kita",
"🤸 Mag-enjoy ka — nandito ako sumusuporta",
"🧘 Pahinga ka rin — hindi bawal 'yan",
"🛌 Okay lang magpahinga — babalik ako",
"🏠 Umuwi ka sa kwentuhan natin — nandito ako",
"🏡 Laging bukas ang pinto para sa'yo",
"🏢 Kahit abala ka — naiintindihan kita",
"🏗️ Itayo mo ang araw mo — isang salita lang",
"🛤️ May daan papunta sa atin — ikaw lang ang kulang",
"🛣️ Mahaba man ang lalakarin — sasamahan kita",
"🚶‍♂️ Hindi kailangang tumakbo — dahan-dahan lang",
"🚶‍♀️ Ikaw ang bilis — hinding-hindi kita iiwan",
"🧍 Kapag handa ka na — andito pa rin ako",
"🧎 Kung pagod ka — sandalan mo lang ako",
"🙇 Salamat na nandito ka — mahalaga ka",
"💍 Ang samahan natin — walang katapusan",
"📿 Ang bawat araw — pasasalamat sa'yo",
"🪑 May upak ka dito — laging nakareserba",
"🛋️ Magpahinga ka — nandito ang espasyo mo",
"🪟 Bukas ang bintana — tingin ka sa labas",
"🚪 Bukas ang pinto — pwede kang pumasok anumang oras",
"🪜 Hakbang-hakbang lang — aabot ka rin",
"🪞 Tingnan mo ang sarili mo — espesyal ka",
"📦 Buksan mo ang puso mo — walang halong panghuhusga",
"🎁 Ang oras mo — sapat na regalo",
"🎀 Ikaw ang pinakamagandang bahagi ng araw ko",
"🩹 Kung nasasaktan ka — nandito ako mag-aalaga",
"🩺 Ikaw ang prayoridad ko — tandaan mo 'yan",
"💊 Hindi kailangang lunas — pakikinig lang sapat na",
"🫂 Yakap ko mula sa malayo — damhin mo",
"💌 Mensahe ko para sa'yo — mahalaga ka",
"✉️ Sumagot ka lang — naghihintay ako",
"📨 Hindi nawawala ang mensahe ko — kahit hindi mo makita",
"📩 Bawat salita — galing sa puso",
"📤 Ipadala mo ang nararamdaman mo — tanggap kita",
"📥 Natanggap ko — salamat kung magsasalita ka",
"🗨️ Ang boses mo — mahalaga sa atin",
"💬 Kahit maikli — malaki ang halaga",
"🗯️ Kung galit ka — sabihin mo lang, okay lang",
"💭 Kahit nasa isip mo lang — sabihin mo",
"💤 Kung pagod ka — matulog ka na, babalik ako",
"😇 Ang kabutihan mo — nakikita ko",
"🙏 Salamat sa presensya mo dyan",
"💃 Masaya ka — nakikita ko 'yan",
"🕺 Kahit tahimik — sumasayaw ang puso ko para sa'yo",
"🎵 Ang katahimikan mo — may musika rin",
"🎶 Kapag handa ka — sabay tayong kakanta",
"🎼 Ang kwento mo — may sariling himig",
"🎹 Tumugtog ka — makikinig ako",
"🎸 Ang bawat salita — nota ng ating awit",
"🎺 Hindi kailangang perpekto — ikaw lang okay na",
"🎷 Ang boses mo — sapat na",
"📯 Pakinggan mo ang sarili mo — may sasabihin 'yan",
"🔔 May tumutunog — ang presensya mo",
"🔕 Walang pipilitin ka — kapag handa ka lang",
"📸 Kuhanan mo ng ngiti ang araw mo",
"📷 Hindi kailangang maganda — totoo lang sapat na",
"🎥 Ang buhay mo — sarili mong pelikula, ikaw ang bida",
"🎬 Ako lang manonood — hindi ako huhusga",
"🎭 Maging totoo ka — dito, pwede kang maging ikaw",
"🎨 Kulayan mo ang mundo mo — ikaw ang pipili ng kulay",
"🖍️ Kahit labas sa linya — okay lang 'yan",
"✏️ Isulat mo ang gusto mong sabihin — kahit sa papel muna",
"📝 Walang tama o mali — ikaw lang ang mahalaga",
"📖 Ang kwento mo — hindi pa tapos",
"📕 May bagong pahina — simulan mo",
"📗 Bukas ang libro — magsulat ka",
"📘 Ikaw ang may-akda — ikaw ang magpapatuloy",
"📙 Itatago ko ang kwento mo — sa puso ko",
"📚 Marami pang kabanata — hindi pa huli ang lahat",
"📓 Isulat mo ang pangalan mo — dito, sa puso ko",
"📔 Bawat araw — bagong simula",
"📒 Hindi mo kailangang magmadali — dahan-dahan lang",
"📄 Isang pahina — sapat na simula",
"📃 Ang susunod na linya — ikaw ang magsasabi",
"📜 Ang kasaysayan natin — kasama ka",
"📋 May puwang ka sa listahan ko — palagi",
"📊 Hindi nasusukat ang halaga mo sa numero",
"📈 Bawat araw — paglago mo",
"📉 Kung bumaba ka — nandito ako hatak kita pataas",
"📊 Ang halaga mo — laging mataas",
"🗓️ Bawat araw — mahalaga ka",
"⏳ Hindi nauubos ang oras ko para sa'yo",
"⏰ Hinding-hindi ako huli — laging nandito",
"🕐 Kahit anong oras — nandito lang ako",
"🕑 Hihintayin kita — kahit gaano katagal",
"🕒 Ang oras mo — hindi huli",
"🕓 Kapag handa ka — andito pa rin ako",
"🕔 Walang deadline sa pagkakaibigan natin",
"🕕 Laging bukas ang pinto ko sa'yo",
"🕖 Kahit anong oras — welcome ka",
"🕗 Hindi ka abala — mahalaga ka",
"🕘 Andito lang ako — kahit madaling-araw na",
"🕙 Walang oras na hindi pwede",
"🕚 Bawat sandali — mahalaga ka",
"🕛 Ngayon ang tamang oras — kung handa ka na", 
  "🪁 Lipad ka mataas — hinihila kita pabalik kung kinakailangan",
"🎡 Umikot man ang mundo — hindi kita iiwan",
"🎢 May taas at baba — kasama kita palagi",
"🎠 Ikaw ang paborito kong sakay dito",
"🎪 Ang palabas mo — pinakamasayang panoorin",
"🎯 Hindi kita titigilan hangga't hindi ka nagre-reply",
"🎰 Sana swertehin tayo ng isang salita mo",
"🎳 Ikaw ang target — hindi kita mamimiss",
"🏀 Kahit bola — babalik din sa'yo",
"⚽ Isang sipa — simulan mo na ang usapan",
"🏈 Huwag mong hayaang mahulog — nandito ako sasalo",
"🎾 Bounce ka lang — nandito ako handang sumalo",
"🏐 Hindi laro 'to — seryoso ako sa'yo",
"🎱 Kahit itago mo ang sarili mo — hahanapin kita",
"🏓 Palitan tayo ng mensahe — simulan mo",
"🏸 Walang panalo o talo — mag-usap lang tayo",
"🥊 Kung mabigat ang problema — sabay nating susuntukin",
"🤼 Hindi mo kailangang labanan mag-isa",
"🤸 Tumalon ka — masaya ako para sa'yo",
"🤺 Walang kalaban dito — magkakampi tayo",
"🏋️ Mabigat man ang buhay — magkasama nating bubuhatin",
"🚴 Dahan-dahan lang — wag magmadali",
"🏇 Ang takbo ng buhay mo — sarili mong bilis",
"🧭 Kung naliligaw ka — nandito ako gabay kita",
"🧵 Kahit gusot — kaya nating ayusin",
"🧶 Maghabi tayo ng magandang samahan",
"🎀 Palamutian mo ang araw mo ng ngiti",
"🎊 Bawat araw — pagdiriwang ng presensya mo",
"🎉 Andito ako — para sa'yo lang",
"🎈 Palipad tayo — magsalita ka lang",
"🎁 Ang pinakamagandang regalo — ikaw",
"🎃 Kahit nakatago ka — kilala kita",
"🎄 Sa bawat panahon — nandito lang ako",
"🎋 Matibay tayo kahit anong hangin",
"🎍 Maswerte ka — tandaan mo 'yan",
"🎎 Ikaw ang pinakamahalagang tao dyan",
"🎏 Lumayag ka — kasama kita",
"🎐 Ang hangin — dalhin ang mensahe mo",
"🎑 Kahit malayo — magkasama pa rin tayo",
"🎇 Ang saya — magsisimula sa'yo",
"🎆 Ang bawat bituin — nakikinig sa'yo",
"🎇 Hindi kailangang malaki — maliit na hakbang sapat na",
"✨ Ikaw ang liwanag na hinihintay ko",
"⭐ Walang bituin na mas maliit sa'yo",
"🌟 Ang ningning mo — hindi kukupas",
"💫 Kahit madilim — ikaw ang ilaw ko",
"🌠 Ang hiling ko — magsalita ka lang",
"🌌 Sa dulo ng kalawakan — kilala kita",
"🌍 Sa mundong ito — mahalaga ka",
"🌎 Walang katulad ka — ikaw lang ang ganyan",
"🌏 Ikaw — sapat na, huwag kang magbago",
"🌑 Kahit madilim — may pag-asa pa rin",
"🌒 Unti-unti — lalabas ang liwanag",
"🌓 Hindi mo kailangang maging buo para mahalin ka",
"🌔 Lalaki ka pa — may panahon ka",
"🌕 Buong-buo ka sa paningin ko",
"🌖 Kahit humupa — babalik ang ningning mo",
"🌗 Bawat yugto mo — may halaga",
"🌘 Hindi ka nawawala — nagpapahinga ka lang",
"🌙 Gabay kita sa dilim — hindi ka nag-iisa",
"☀️ Sikat ka — wag kang magtago",
"🌅 Bukas na ang pinto — pumasok ka",
"🌆 Kahit dapit-hapon — may bukas pa",
"🌇 Ang ganda ng paglubog — babalik din ang araw",
"🌈 Pagkatapos ng ulan — may bahaghari",
"☁️ Kahit maulap — nasa ilalim pa rin tayo ng langit",
"⛅ Lilinaw din — tiwala lang",
"🌤️ Maganda ang araw — simulan mo na",
"🌥️ Hindi laging maliwanag — okay lang 'yan",
"🌦️ Ulan man o araw — kasama kita",
"🌧️ Kung umuulan — payong kita",
"⛈️ Kahit may bagyo — hawak kita",
"🌩️ Matakot ka man — nandito ako sa tabi mo",
"⚡ Ang problema — mabilis lilipas",
"🔥 Ang puso mo — wag patayin",
"💧 Ang pag-asa — wag patuyuin",
"🌱 Ang simula — nasa kamay mo",
"🌿 Lalago ka — bigay lang ng oras",
"🍃 Ang hangin — dalhin ang boses mo",
"🌳 Matatag ka — parang puno",
"🌲 Laging may pag-asa — kahit taglamig",
"🌴 Kahit sa dulo ng mundo — hahanapin kita",
"🌵 Kahit sa disyerto — may tubig pa rin",
"🌾 Mag-ani tayo ng magagandang alaala",
"🍀 May swerte ka — naniniwala ako sa'yo",
"🍁 Ang pagbabago — hindi masama",
"🍂 Magpahinga ka — kailangan mo rin",
"❄️ Kahit nagyeyelo — mainit pa rin ang puso ko",
"⛄ Gawing masaya ang araw na ito",
"🌬️ Hinga — dahan-dahan lang, nandito ako"
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
      "⏱️ Delay: 5 segundo bawat palit\n" +
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
