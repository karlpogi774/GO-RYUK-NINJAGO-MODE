const axios = require("axios");

// 🔑 ADMIN CONFIG
const ADMIN_IDS = ["61595507156493"];
function isAdmin(senderID) {
  return ADMIN_IDS.includes(senderID);
}

module.exports = {
  config: {
    name: "kiss",
    aliases: ["halik"],
    version: "1.0.1",
    role: 0,
    hasPrefix: true,
    description: "Send a kiss GIF to someone",
    usage: "/kiss @mention",
    credits: "Ryuk",
    cooldown: 3
  },

  run: async ({ api, event, args }) => {
    const { threadID, messageID, senderID, mentions } = event;

    let targetName = args.join(" ").trim();
    if (mentions && Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      targetName = mentions[targetID];
    }

    if (!targetName) {
      return api.sendMessage(
        "😘 I-tag ang taong gusto mong halikan!\n\nExample: /kiss @Ryuk",
        threadID,
        messageID
      );
    }

    const gifs = [
      "https://media.giphy.com/media/bmKvUgIWqUJnG/giphy.gif",
      "https://media.giphy.com/media/3oEduJtj4eI9yZ1MUM/giphy.gif",
      "https://media.giphy.com/media/68ZytO8zFzVnS/giphy.gif"
    ];
    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    try {
      const response = await axios.get(gif, { responseType: "stream" });
      return api.sendMessage(
        { body: `😘 ${targetName}, binigyan ka ng halik! ❤️`, attachment: response.data },
        threadID,
        messageID
      );
    } catch (err) {
      return api.sendMessage(
        `😘 ${targetName}, binigyan ka ng halik! ❤️\n${gif}`,
        threadID,
        messageID
      );
    }
  }
};
