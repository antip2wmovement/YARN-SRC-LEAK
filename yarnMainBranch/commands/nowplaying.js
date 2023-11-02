const axios = require('axios'); // Import the Axios library if not already imported

module.exports = {
  name: "np",
  description: "Show what's now playing on NCS Radio",
  level: 0,
  async execute(interaction) {
    try {
      // Make a GET request to the AzuraCast API for the "ncs_radio" stream
      const response = await axios.get('https://radio.angelz.live/api/nowplaying/ncs_radio');

      // Check if the stream is live or if there's information about the most recent song
      if (response.status === 200 && (response.data.live || response.data.now_playing)) {
        const { title, artist } = response.data.now_playing.song;

        // Respond with the currently playing song information without cover art
        interaction.reply({
          embeds: [
            {
              title: "Now Playing on NCS Radio",
              description: `**Title:** ${title}\n**Artist:** ${artist}`,
              footer: { text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() },
              color: 1286414
            }
          ]
        });
      } else {
        // Handle cases where there's no live stream or recent song information
        interaction.reply({
          content: "NCS Radio is currently offline or there is no recent song information available.",
          ephemeral: true // Optionally, make the response ephemeral (only visible to the user)
        });
      }
    } catch (error) {
      // Handle errors that may occur during the API request
      console.error("Error fetching now playing information:", error);
      interaction.reply({
        content: "An error occurred while fetching now playing information.",
        ephemeral: true // Optionally, make the response ephemeral (only visible to the user)
      });
    }
  }
};
