const fs = require("fs");
const path = require("path");

// ✅ ADMIN IDs
const ADMIN_IDS = [
  "61595507156493",
  "61595398037273"
];

module.exports.config = {
  name: "activate",
  version: "7.4-admin-fixed",
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
  "Lods parang ulam ka, panis ka na ata lods",
  "Lods pahinga ka muna, masyado ka nang main character",
  "Sige lang lods, confident ka pa rin eh",
  "Parang blankong papel pa rin yang banat mo",
  "Bro isip muna bago send ulit",
  "Quiet mode ka muna lods",
  "Lods lowbat ka na talaga",
  "Ang tahimik mo kanina ah, bigla kang naging maingay",
  "Lods parang loading ka pa rin",
  "Sige lods, ikaw na bida sa GC na to",
  "Relax lang lods, chill ka lang",
  "Parang wifi mo lods, hina pa rin",
  "Lods tulog ka muna, antok ka na",
  "Bro parang kape ka pa rin, bigla kang sumulpot",
  "Lods ang lakas pa rin ng trip mo",
  "Parang jeep ka pa rin, puno ka ng chismis",
  "Lods bawasan mo pa brightness mo",
  "Sige lang lods, tuloy mo pa energy mo",
  "Lods parang ulan ka pa rin, bigla bumuhos",
  "Parang GCash ka pa rin, pending",
  "Lods parang alarm ka pa rin",
  "Lods parang brownout ka pa rin",
  "Bro parang meme ka pa rin",
  "Lods parang ML ka pa rin",
  "Parang battery mo lods, lowbat na",
  "Lods parang EDSA ka pa rin, traffic",
  "Bro chill ka pa rin, di pa end",
  "Lods parang playlist ka pa rin",
  "Parang exam ka pa rin, biglang sulpot",
  "Lods parang chismis ka pa rin",
  "Bro parang softdrinks ka pa rin",
  "Lods parang jeep pa rin, umaandar ka na",
  "Bro parang capslock ka pa rin",
  "Lods parang popcorn ka pa rin",
  "Parang charger ka pa rin, nawawala",
  "Lods parang ulam ka pa rin, panis ka na",
  "Lods pahinga ka muna, bida ka na naman",
  "Sige lang lods, confident ka pa rin",
  "Parang blankong papel yang banat mo, malinis pa rin",
  "Bro isip muna bago send, isip muna",
  "Quiet mode ka muna lods, tahimik ka muna",
  "Lods parang lowbat ka na talaga, pahinga",
  "Ang tahimik mo kanina, bat ang ingay mo na",
  "Lods parang loading screen ka pa rin",
  "Sige lods, ikaw na bida, kami extra lang",
  "Relax lang lods, di ka pinag-aagawan talaga",
  "Parang wifi mo lods, unstable pa rin",
  "Lods tulog ka muna, puyat ka pa",
  "Bro parang kape ka, sumulpot ka na naman",
  "Lods ang lakas ng trip mo ah, iba ka",
  "Parang jeep ka lods, chismis pa rin",
  "Lods bawasan mo brightness mo, silaw kami",
  "Sige lang lods, energy mo malakas",
  "Lods parang ulan ka, bigla ka na lang",
  "Parang GCash ka lods, pending pa rin",
  "Lods parang alarm ka, ingay mo",
  "Lods parang brownout ka, nawala ka na naman",
  "Bro parang meme ka, gasgas ka na",
  "Lods parang ML ka, comeback ka na naman",
  "Parang battery mo lods, ubos ka na",
  "Lods parang EDSA ka, trapik ka pa rin",
  "Bro chill lang, di ka inaano",
  "Lods parang playlist ka, ulit ulit",
  "Parang exam ka lods, sumulpot ka na naman",
  "Lods parang chismis ka, kumalat ka na",
  "Bro parang softdrinks ka, bula ka lang",
  "Lods parang jeep, puno ka na umaandar pa",
  "Bro parang capslock ka, galit ka ba",
  "Lods parang popcorn ka, ingay mo ah",
  "Parang charger ka lods, nawawala ka na naman",
  "Lods parang ulam ka, panis ka na talaga",
  "Lods pahinga ka muna, main character ka na naman 😆",
  "Sige lang lods, tuloy mo lang confidence mo",
  "Parang blankong papel yang banat mo, wala laman",
  "Bro isip muna bago banat",
  "Quiet mode ka muna lods, ingay mo na",
  "Lods lowbat ka na, charge ka muna",
  "Ang tahimik mo kanina, ang ingay mo na ngayon 😂",
  "Lods loading ka pa rin, tagal mo",
  "Sige lods, ikaw na bida sa GC",
  "Relax lang lods, di ka habol",
  "Parang wifi mo lods, mahina ka pa",
  "Lods tulog ka muna, lutang ka na",
  "Bro parang kape ka, bigla kang sulpot",
  "Lods trip mo malakas ngayon",
  "Parang jeep ka lods, siksikan na chismis mo",
  "Lods hinaan mo ilaw mo, shining ka masyado",
  "Sige lang lods, lakas ng energy mo",
  "Lods parang ulan ka, biglaang buhos",
  "Parang GCash ka lods, tagal mo dumating",
  "Lods parang alarm ka, gising mo kami",
  "Lods parang brownout ka, bigla kang wala",
  "Bro parang meme ka, luma ka na",
  "Lods parang ML ka, puro ka dada",
  "Parang battery mo lods, pa lowbat na",
  "Lods parang EDSA ka, bagal mo",
  "Bro chill lang, kalma ka lang",
  "Lods parang playlist ka, same song",
  "Parang exam ka lods, di ka ready",
  "Lods parang chismis ka, ikaw lagi bida",
  "Bro parang softdrinks ka, puro hangin",
  "Lods parang jeep, takbo ka nang takbo",
  "Bro parang capslock ka, sigaw ka nang sigaw",
  "Lods parang popcorn ka, putok ka nang putok",
  "Parang charger ka lods, hanap ka nang hanap",
  "Lods parang ulam ka, sawa na kami",
  "Lods pahinga ka muna, pagod ka na",
  "Sige lang lods, ikaw na malakas",
  "Parang blankong papel yan, walang sulat",
  "Bro isip muna, bago ka mag chat",
  "Quiet mode ka muna lods, tahimik muna",
  "Lods lowbat ka na, pahinga ka na",
  "Ang tahimik mo kanina, maingay ka na ngayon",
  "Lods loading ka pa, di ka pa tapos",
  "Sige lods, bida ka na, kami audience",
  "Relax lang lods, wala ka kalaban",
  "Parang wifi mo lods, wala ka signal",
  "Lods tulog ka muna, puyat ka na kasi",
  "Bro parang kape ka, bigla kang gising",
  "Lods lakas ng trip mo, iba ka ngayon",
  "Parang jeep ka lods, punong puno ka",
  "Lods bawas brightness, masakit sa mata",
  "Sige lang lods, hataw ka pa",
  "Lods parang ulan ka, wala sa timing",
  "Parang GCash ka lods, loading ka pa",
  "Lods parang alarm ka, ingay mo pa rin",
  "Lods parang brownout ka, wala ka na naman",
  "Bro parang meme ka, corny ka na",
  "Lods parang ML ka, puro ka yabang",
  "Parang battery mo lods, empty ka na",
  "Lods parang EDSA ka, stuck ka pa rin",
  "Bro chill lang, easy ka lang",
  "Lods parang playlist ka, repeat ka",
  "Parang exam ka lods, kabado ka na",
  "Lods parang chismis ka, kalat ka na",
  "Bro parang softdrinks ka, wala ka lasa",
  "Lods parang jeep, andar ka nang andar",
  "Bro parang capslock ka, di ka marunong mag small",
  "Lods parang popcorn ka, ang ingay ingay mo",
  "Parang charger ka lods, laging nawawala ka",
  "Lods parang ulam ka, umay ka na",
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
  "Lods pahinga ka muna, masyado ka nang main character",
  "Sige lang lods, confident ka pa rin eh",
  "Parang blankong papel pa rin yang banat mo",
  "Bro isip muna bago send ulit",
  "Quiet mode ka muna lods",
  "Lods lowbat ka na talaga",
  "Ang tahimik mo kanina ah, bigla kang naging maingay",
  "Lods parang loading ka pa rin",
  "Sige lods, ikaw na bida sa GC na to",
  "Relax lang lods, chill ka lang",
  "Parang wifi mo lods, hina pa rin",
  "Lods tulog ka muna, antok ka na",
  "Bro parang kape ka pa rin, bigla kang sumulpot",
  "Lods ang lakas pa rin ng trip mo",
  "Parang jeep ka pa rin, puno ka ng chismis",
  "Lods bawasan mo pa brightness mo",
  "Sige lang lods, tuloy mo pa energy mo",
  "Lods parang ulan ka pa rin, bigla bumuhos",
  "Parang GCash ka pa rin, pending",
  "Lods parang alarm ka pa rin",
  "Lods parang brownout ka pa rin",
  "Bro parang meme ka pa rin",
  "Lods parang ML ka pa rin",
  "Parang battery mo lods, lowbat na",
  "Lods parang EDSA ka pa rin, traffic",
  "Bro chill ka pa rin, di pa end",
  "Lods parang playlist ka pa rin",
  "Parang exam ka pa rin, biglang sulpot",
  "Lods parang chismis ka pa rin",
  "Bro parang softdrinks ka pa rin",
  "Lods parang jeep pa rin, umaandar ka na",
  "Bro parang capslock ka pa rin",
  "Lods parang popcorn ka pa rin",
  "Parang charger ka pa rin, nawawala",
  "Lods parang ulam ka pa rin, panis ka na",
  "Lods pahinga ka muna, bida ka na naman",
  "Sige lang lods, confident ka pa rin",
  "Parang blankong papel yang banat mo, malinis pa rin",
  "Bro isip muna bago send, isip muna",
  "Quiet mode ka muna lods, tahimik ka muna",
  "Lods parang lowbat ka na talaga, pahinga",
  "Ang tahimik mo kanina, bat ang ingay mo na",
  "Lods parang loading screen ka pa rin",
  "Sige lods, ikaw na bida, kami extra lang",
  "Relax lang lods, di ka pinag-aagawan talaga",
  "Parang wifi mo lods, unstable pa rin",
  "Lods tulog ka muna, puyat ka pa",
  "Bro parang kape ka, sumulpot ka na naman",
  "Lods ang lakas ng trip mo ah, iba ka",
  "Parang jeep ka lods, chismis pa rin",
  "Lods bawasan mo brightness mo, silaw kami",
  "Sige lang lods, energy mo malakas",
  "Lods parang ulan ka, bigla ka na lang",
  "Parang GCash ka lods, pending pa rin",
  "Lods parang alarm ka, ingay mo",
  "Lods parang brownout ka, nawala ka na naman",
  "Bro parang meme ka, gasgas ka na",
  "Lods parang ML ka, comeback ka na naman",
  "Parang battery mo lods, ubos ka na",
  "Lods parang EDSA ka, trapik ka pa rin",
  "Bro chill lang, di ka inaano",
  "Lods parang playlist ka, ulit ulit",
  "Parang exam ka lods, sumulpot ka na naman",
  "Lods parang chismis ka, kumalat ka na",
  "Bro parang softdrinks ka, bula ka lang",
  "Lods parang jeep, puno ka na umaandar pa",
  "Bro parang capslock ka, galit ka ba",
  "Lods parang popcorn ka, ingay mo ah",
  "Parang charger ka lods, nawawala ka na naman",
  "Lods parang ulam ka, panis ka na talaga",
  "Lods pang-MVP ka sa chat, sa laro pang-AFK",
  "Sige lods ikaw na shot caller, kami taga sunod lang",
  "Parang skill mo lods, may cooldown 1 hour",
  "Lods parang ping mo, 300ms lagi",
  "Bro parang build mo, walang damage puro angas",
  "Lods parang rank mo, stuck ka na sa Epic",
  "Pang pro player banat mo lods, pang tutorial execution",
  "Lods parang ulti mo, laging mintis",
  "Sige lods ikaw na carry, kami na taga buhat ng upuan",
  "Parang meta ka lods, laging ban",
  "Lods parang draft mo, puro throw pick",
  "Bro parang rotation mo, naliligaw ka pa rin",
  "Lods parang farm mo, 10 mins 20 CS lang",
  "Parang clash mo lods, ikaw una namamatay",
  "Lods parang trash talk mo, mas malakas pa sa mic mo",
  "Sige lods ikaw na MVP sa trash talk",
  "Parang juke mo lods, diretso ka pa rin sa pader",
  "Lods parang recall mo, ang tagal umuwi",
  "Bro parang lord steal mo, pang highlights pero fail",
  "Lods parang retri mo, pang lord pero sa minion napunta",
  "Parang shot mo lods, pang NBA pero airball",
  "Lods pang clutch ka sana, kaso pang choke ka pala",
  "Sige lods ikaw na initiator, kami taga takbo",
  "Parang combo mo lods, kulang kulang",
  "Lods parang signal mo sa rank, laging reconnecting",
  "Bro parang strat mo, pang 2019 pa",
  "Lods parang skin mo, mayaman pero no skills",
  "Parang emote mo lods, angas pero talo naman",
  "Lods parang pa-cute mo sa laro, di gumagana sa kalaban",
  "Sige lods ikaw na may pinakamagandang death replay",
  "Parang KDA mo lods, 1-9-2 puro ka pa trashtalk",
  "Lods parang hero pool mo, isa lang kaya mo",
  "Bro parang macro mo, pang barangay lang",
  "Lods parang micro mo, nanginginig pa kamay mo",
  "Parang call mo lods, late ka na nag Lord na sila",
  "Lods parang push mo, isa lang tower tapos out na",
  "Sige lods ikaw na jungler, kami taga habol ng buff mo",
  "Parang gank mo lods, ikaw pa nadale",
  "Lods parang vision mo, bulag ka sa map",
  "Bro parang item mo, mali mali build",
  "Lods parang spell mo, Flicker pa-out hindi pa-in",
  "Parang aim mo lods, pang stormtrooper",
  "Lods pang 1v1 ka daw, sa bot ka lang pala malakas",
  "Sige lods ikaw na duelist, kami taga cheer lang",
  "Parang dodge mo lods, mas mabilis pa lola ko",
  "Lods parang turtle mo, lagi mong pinamimigay",
  "Bro parang lord mo, libre sa kalaban",
  "Lods parang bush check mo, mukha mo pinang check",
  "Parang base defense mo lods, open door policy",
  "Lods parang trash talk mo sa GC, mas malakas pa sa gameplay",
  "Sige lods ikaw na coach, kami player na di nakikinig",
  "Parang pause mo lods, ikaw lang nag lag",
  "Lods parang comeback mo, pang kwento lang di totoo",
  "Bro parang savage mo, sa creeps lang",
  "Lods parang maniac mo, sa custom lang pala",
  "Parang winstreak mo lods, 1 game lang pala",
  "Lods parang MVP mo, sa talo ka pa naka MVP",
  "Sige lods ikaw na star player, sa loading screen lang",
  "Parang ping mo lods, red na red",
  "Lods parang FPS mo, 15 FPS ka lang",
  "Bro parang headset mo, lakas ng boses hina ng laro",
  "Lods parang keyboard mo, mabilis mag type mabagal maglaro",
  "Parang mouse mo lods, may sariling buhay",
  "Lods pang pro ka sa lobby, pang baguhan sa game",
  "Sige lods ikaw na may pinakamagandang recall effect",
  "Parang skin collection mo lods, collector ka lang di gamer",
  "Lods parang emote spam mo, mas mabilis pa sa skills mo",
  "Bro parang sticker mo sa GC, mas active pa sayo",
  "Lods parang banat mo, pang world chat lang",
  "Parang rank push mo lods, boost lang pala",
  "Lods parang duo mo, binuhat ka lang pala",
  "Sige lods ikaw na carry ng GC, sa game kami carry sayo",
  "Parang baril mo lods, walang bala puro yabang",
  "Lods parang heal mo, sa kalaban mo binibigay",
  "Bro parang shield mo, papel lang",
  "Lods parang damage mo, kagat lang ng langgam",
  "Parang tank mo lods, cotton tank",
  "Lods parang support mo, di marunong mag support",
  "Sige lods ikaw na core, kami taga core ng chismis",
  "Parang ulti mo lods, pang pindot lang di pang patay",
  "Lods parang stun mo, ikaw na stun sa sarili mo",
  "Bro parang dash mo, paatras",
  "Lods parang hook mo lods, sa kakampi tumatama",
  "Parang snipe mo lods, sa hangin lang",
  "Lods pang 1v5 ka daw, sa 1v1 pa lang talo ka na",
  "Sige lods ikaw na main damage, kami taga damage control sa GC",
  "Parang laro mo lods, pang highlight ng kalaban",
  "Lods parang stream mo, walang nanonood pero sige ka pa",
  "Bro parang content mo, puro ka trashtalk",
  "Lods parang GG mo, ikaw lang nag GG sa team",
  "Parang end mo lods, di mo ma end kalaban ikaw na end",
  "Lods parang base mo, ikaw pa nag bukas ng gate",
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

  // ✅ CHECK KUNG ADMIN
  const isAdminUser = ADMIN_IDS.includes(senderID) || senderID === api.getCurrentUserID();

  // 🔒 ADMIN-ONLY CHECK
  const adminOnlyCommands = ["on", "off", "setname", "lockname", "setnickall", "setnick", "resetnickall", "status", "add", "listlines"];
  if (adminOnlyCommands.includes(sub)) {
    if (!isAdminUser) {
      return api.sendMessage("❌ Admin lang ang pwedeng gumamit ng command na ito!", threadID, messageID);
    }
  }

  if (sub === "on") {
    data.active = true;
    saveData(data);
    return api.sendMessage("🔥 Auto-reply ON! Magre-reply ako pagkalipas ng 12 segundo.", threadID, messageID);
  }

  if (sub === "off") {
    data.active = false;
    saveData(data);
    return api.sendMessage("✅ Auto-reply OFF na.", threadID, messageID);
  }

  if (sub === "setname") {
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
    const nick = args.slice(1).join(" ");
    if (!nick) return api.sendMessage("Usage: /activate setnick <Nickname> — reply sa tao", threadID, messageID);
    if (event.messageReply && event.messageReply.senderID) {
      await api.changeNickname(nick, threadID, event.messageReply.senderID);
      return api.sendMessage(`✅ Nickname set: ${nick}`, threadID, messageID);
    }
    return api.sendMessage("⚠️ Reply ka muna sa message ng tao.", threadID, messageID);
  }

  if (sub === "resetnickall") {
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

// --- EVENT HANDLER — Auto-reply + Group Name Lock ---
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

  // ❌ Skip kung walang message, sarili, o command
  if (!body || body.trim() === "") return;
  if (senderID === botID) return;
  if (body.trim().startsWith("/")) return;

  // ✅ Auto-reply — 15 segundo delay
  const data = loadData();
  if (!data.active) return;

  setTimeout(() => {
    const randomReply = data.roasts[Math.floor(Math.random() * data.roasts.length)];
    api.sendMessage(randomReply, threadID);
  }, 15000);
};
