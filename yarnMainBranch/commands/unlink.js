const { ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');

module.exports = {
	name: "unlink",
    description: "Unlinks all account you linked to the server.",
    level: 0,
	async execute(interaction, client) {
        const randomId = Math.floor(Math.random() * 100) + 1;
        const userid = interaction.user.id
        let message = await interaction.reply({
            embeds: [
                {
                    title: "Please Wait...",
                    description: `${client.config.emojis.loading}`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 16776960
                }
            ]            
        , ephemeral: true});
        // the username is like userid+" "+randomId
        // we just need to get where the userid is
        let rows = []
        if (client.connection) {
            [rows] = await client.connection.promise().execute('SELECT * FROM `accounts` WHERE `username` LIKE ? AND `deleted` = 0;', [userid+"%"]);
        } else {
            delete require.cache[require.resolve('../accounts.json')];
            rows = [require('../accounts.json').accounts.filter(account => account.username.startsWith(userid))]
            if (rows[0].length == 0) rows = []
        }
        if (rows[0] == undefined) return message.edit({
            embeds: [
                {
                    title: "Error",
                    description: `${client.config.emojis.error} You don't have any accounts linked to the server!`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 16711680
                }
            ]
        , ephemeral: true});

        await message.edit({
            embeds: [
                {
                    title: "Unlink?",
                    description: client.config.emojis+" Are you sure you want to unlink all your accounts?\nYou linked `"+rows.length+"` accounts to the server.",
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 16776960
                }
            ],
            "components": [
                {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "label": "Confirm",
                            "style": 4,
                            "custom_id": "confirm-"+randomId+"-"+userid
                        }
                    ]
                }
            ]
        , ephemeral: true});
        interaction.client.on('interactionCreate', async interaction => {
            const customId = interaction.customId.split('-')
            if (customId[2] !== interaction.user.id) {
                await interaction.reply({ content: 'That isn\'t for you!', ephemeral: true });
            }
            if (customId[1] !== randomId.toString() || customId[2] !== interaction.user.id) return;
            if (client.connection) {
                client.connection.execute('UPDATE `accounts` SET `deleted` = 1 WHERE `username` LIKE ?', [userid+"%"]);
            } else {
                delete require.cache[require.resolve(require('path').join(__dirname, "../", 'accounts.json'))];
                let accounts = require(require('path').join(__dirname, "../", 'accounts.json')).accounts
                accounts = accounts.filter(account => !account.username.startsWith(userid))
                require('fs').writeFileSync(require('path').join(__dirname, "../", 'accounts.json'), JSON.stringify({"_note":"This file is automatically generated from YARN",accounts}))
            }
            await message.edit({ embeds:[{
                description:`${client.config.emojis.leave} Unlinked \`${rows.length}\` accounts!`,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 1286414
            }], components: [
                {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "label": "Confirm",
                            "style": 4,
                            "custom_id": "confirm-"+randomId+"-"+userid,
                            "disabled": true
                        }
                    ]
                }
            ]
            , ephemeral: true});
            await interaction.deferUpdate();
        });

    }
};