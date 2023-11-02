module.exports = {
	name: "help",
    description: "Shows you a list of commands and other info",
    level: 0,
	async execute(interaction) {
        const helpmenu = `Here is a list of commands for YARN:
        
        **/ping** - Pings the discord bot and replies with the current ping

        **/help** - Shows you a list of commands and other info

        **/crash**  - Crashes a specific realm using bots

        **/spammer** - Spams a specific realm using bots
        
        Our current contributors: **VortexxJS, zioqhh, Brosmagic, AngeLz79, Snailsped**
        Join our [discord](https://discord.gg/antip2w)!`
        let message = await interaction.reply({
            embeds: [
                {
                    title: "YARN | Help Menu",
                    description: `${helpmenu}`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 1286414
                }
            ]
        });
    }
};