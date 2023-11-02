const bedrockClient = require('../bedrockClient.js');

module.exports = {
	name: "link",
    description: "Links an account to the server.",
    level: 0,
	async execute(interaction, client) {
        let message = await interaction.reply({
            embeds: [
                {
                    title: "Please Wait...",
                    description: `${client.config.emojis.loading} Getting MSAL token...`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 16776960
                }
            ]            
        , ephemeral: true});
        let data = await bedrockClient.link(interaction.user.id+" "+Math.floor(Math.random()*1000), (code)=>{
            message.edit({
                embeds: [
                    {
                        title: "Hello!",
                        description: "Please go to https://microsoft.com/link and enter the following code to link your account:\n```"+code+"```\n**NOTICE:** DO NOT LINK ACCOUNTS YOU CARE FOR!",
                        footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                        color: 1286414
                    }
                ]
            });
        }).catch((err)=>{
            message.edit({
                embeds: [
                    {
                        title: "Error!",
                        description: `${client.config.emojis.error} ${err}`,
                        footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                        color: 16724787
                    }
                ]
            });
        });
        message.edit({
            embeds: [
                {
                    title: "Success!",
                    description: `${client.config.emojis.join} Account linked!`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 1286414
                }
            ]
        });
    }
};