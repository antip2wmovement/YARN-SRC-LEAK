module.exports = {
	name: "suspend",
    description: "Suspends the bot from the server.",
    level: 3,
	async execute(interaction,client) {
        return await interaction.reply({
            embeds: [
                {
                    title: "Cannot suspend.",
                    description: "The bot is currently running on a production server. Please contact the hoster to suspend the bot.",
                    footer: ({ text: `/${this.name} | Command used by > ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 16711680
                }
            ]
        });

        const lastTime = Date.now()
        let message = await interaction.reply({
            embeds: [
                {
                    title: "Suspended.",
                    author: ({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() }),
                    footer: ({ text: `/${this.name} | Command used by > ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 16711680
                }
            ]
        });
        // runs a command to `pm2 stop yarn`
        client.destroy()
        console.log("Bot Suspended.")
        const exec = require('child_process').exec;
        exec('pm2 stop yarn', (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                return;
            }
            console.log(stdout);
            process.exit()
        });
    }
};