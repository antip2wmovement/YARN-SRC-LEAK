const { realmLookup, getPlayerCount } = require('../bedrockClient.js'); // Import necessary functions from bedrockClient.js

module.exports = {
    name: "rlookup",
    description: "Gets Information From A Realm Code.",
    options: [
        {
            type: "STRING",
            name: "realmcode",
            description: "Realm Code To Pull",
            required: true,
            min_length: 11,
			max_length: 11
        }
    ],
    level: 0,
    async execute(interaction, client) {
        const realmCode = interaction.options.getString('realmcode');

        let messageData = await interaction.reply({
            embeds: [
                {
                    description: `${client.config.emojis.loading} Pulling \`${realmCode}\`...`,
                    footer: { text: `/${this.name} | Command used by > ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() },
                    color: 3515039
                }
            ]
        });
        try {
            // Get Realm information from the realm code
            const data = await realmLookup(realmCode);

            // Calculate the player count
            const playerCount = await getPlayerCount(data);

            // Edit the initial response with the retrieved data
            await messageData.edit({
                embeds: [{
                    description: `${client.config.emojis.success} Pulled Realm \`${realmCode}\`\n\nName: \`${data.realmName}\`\nHost: \`${data.host}\`\nPort: \`${data.port}\`\nPlayers: \`${playerCount}\``,
                    footer: { text: `/${this.name} | Command used by > ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() },
                    color: 3515039
                }]
            });
        } catch (error) {
            // Handle errors
            let errorMessage = `${client.config.emojis.error} Failed to pull \`${realmCode}\`!\n${error}`;
            messageData.edit({
                embeds: [{
                    description: errorMessage,
                    footer: { text: `/${this.name} | Command used by > ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() },
                    color: 16724787
                }]
            });
        }
    }
};
