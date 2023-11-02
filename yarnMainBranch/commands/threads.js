const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: "threads",
    description: "Check the threads",
    level: 0,
    async execute(interaction, client) {
        const guildId = '995751562926362785'; // Replace with your desired guild ID

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return interaction.reply('Guild not found.');
        }
//get the posts that have the tag p2w and are active and log them to the console

const threadInfo = [];

// Iterate through all threads in the guild
for (const thread of guild.threads.cache.values()) {

    // If the thread is public and has the tag p2w

    if (thread.archived === false && thread.name === 'p2w') {
        threadInfo.push(`**${thread.name}** - ${thread.id}`);
    }
}


       // Create an embed
       const embed = {
        title: "",
        description: `Active Channels with p2w Tag:\n${threadInfo.join('\n')}`,
        color: 1286414, // You can customize the color
        footer: {
            text: `/${this.name} | Command used by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    };

    // Reply with the embed
    await interaction.reply({ embeds: [embed] });
}
};






