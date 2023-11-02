const { link } = require("../bedrockClient.js")
const path = require('path');

module.exports = {
	name: "checkaccounts",
    description: "Checks all accounts in the database.",
    level: 3,
    async execute(interaction, client) {
        let messageContent = { embeds: [
            {
                description: `${client.config.emojis.loading} Pulling Database...`,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 16711680
            }
        ]
        }
        const message = await interaction.reply(messageContent);
        let accounts
        if (client.connection) {
            [accounts] = await client.connection.promise().query(`SELECT * FROM accounts WHERE deleted = 0`);
        } else {
            delete require.cache[require.resolve(path.join(__dirname, '../', 'accounts.json'))]
            accounts = require(path.join(__dirname, '../', 'accounts.json')).accounts
        }
        messageContent.embeds[0].description = `${client.config.emojis.loading} Checking \`${accounts.length}\` accounts...`
        message.edit(messageContent)
        let goodAccounts = 0;
        let badAccounts = 0;
        await Promise.all(accounts.map(async (account) => {
            await link(account.username, async () => {
                if (client.connection) {
                    await client.connection.promise().query(`UPDATE accounts SET deleted = 1 WHERE username = '${account.username}'`)
                } else {
                    accounts.splice(accounts.indexOf(account), 1)
                    require('fs').writeFileSync(path.join(__dirname, '../', 'accounts.json'), JSON.stringify(accounts))
                }
                badAccounts = badAccounts + 1
                return;
            })
            goodAccounts = goodAccounts + 1
        }));
        messageContent.embeds[0].description = `${client.config.emojis.success} Checked \`${accounts.length}\` accounts.`
        messageContent.embeds[0].color = 16776960
        messageContent.embeds[0].fields = [
            {
                name: `Good Accounts`,
                value: `\`${goodAccounts}\``,
                inline: true
            },
            {
                name: `Bad Accounts`,
                value: `\`${badAccounts}\``,
                inline: true
            }
        ]
        message.edit(messageContent)
    }
};