module.exports = {
	name: "ping",
    description: "Ping!",
    level: 0,
	async execute(interaction) {
        interaction.reply({
            embeds: [
                {
                    title: "Pong!",
                    description: `<:success:1156281409988726824> API Latency: \`${Math.round(interaction.client.ws.ping)}ms\``,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 1286414
                }
            ]
        })
    }
};