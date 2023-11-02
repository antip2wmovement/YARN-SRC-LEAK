module.exports = {
    name: "uptime",
    description: "Check the bot's uptime",
    level: 0,
    async execute(interaction) {
        const uptime = process.uptime()
        const days = Math.floor(uptime / (60 * 60 * 24));
        const hours = Math.floor((uptime / (60 * 60)) % 24);
        const minutes = Math.floor((uptime / 60) % 60);
        const seconds = Math.floor(uptime % 60);

        
        await interaction.reply({ embeds: [
            {
                title: "",
                description: `**Uptime:** \`${days} Days, ${hours} Hours, ${minutes} Minutes, ${seconds} Seconds.\``,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 1286414
            }
        ]
        });
    },
};