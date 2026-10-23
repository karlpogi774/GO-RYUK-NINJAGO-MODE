const axios = require("axios");

module.exports = {
  config: {
    name: "hug",
    aliases: ["yakap"],
    version: "1.0.1",
    role: 0,
    hasPrefix: true,
    description: "Send a hug GIF to someone",
    usage: "/hug @mention / name",
    credits: "Ryuk",
    cooldown: 3
  },

  run: async ({ api, event, args }) => {
    const { threadID, messageID, mentions, senderID } = event;
    
    let targetName = args.join(" ").trim();
    
    // ✅ Kung may nag-tag, kunin ang pangalan nila
    if (mentions && Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      targetName = mentions[targetID];
    }

    if (!targetName) {
      return api.sendMessage(
        "🤗 I-tag o ilagay ang pangalan ng taong gusto mong yakapin!\n\nExample: /hug @Ryuk",
        threadID,
        messageID
      );
    }

    const gifs = [
      "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
      "https://media.giphy.com/media/3ZnBrkqoaI2hq/giphy.gif",
      "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif"
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    try {
      const response = await axios.get(gif, {
        responseType: "stream"
      });

      return api.sendMessage(
        {
          body: `🤗 ${targetName}, niyakap ka! ❤️`,
          attachment: response.data
        },
        threadID,
        messageID
      );
    } catch (err) {
      return api.sendMessage(
        `🤗 ${targetName}, niyakap ka! ❤️\n${gif}`,
        threadID,
        messageID
      );
    }
  }
};
    
