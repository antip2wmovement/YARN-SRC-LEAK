module.exports = {
	name: "whitelist",
    description: "Whitelists a user.",
    options:[
        {
            type: "USER",
            name: "user",
            description: "The user to whitelist.",
            required: true,
        },
        {
            type: "BOOLEAN",
            name: "whitelist",
            description: "Whitelist or unwhitelist the user.",
            required: true,
        }
    ],
    level: 2,
    async execute(interaction, client) {
        const user = interaction.options.getUser("user")
        const whitelist = interaction.options.getBoolean("whitelist")
        
        let role = whitelist ? 1 : 0
        // checks if the user is already in database
        let rows 
        if (client.connection) [rows] = await client.connection.promise().execute('SELECT * FROM `whitelist` WHERE `userid` = ?', [user.id])
        else {
            delete require.cache[require.resolve(require('path').join(__dirname,'../','whitelist.json'))];
            rows = [require(require('path').join(__dirname,'../','whitelist.json')).whitelist.filter(account => account.userid == user.id)]
            if (rows[0] == []) rows = []
        }

        const lastWhitelist = rows[0] ? rows[0].role : 0

        if(rows[0]) {
            if (rows[0].role > 1) {
                await interaction.reply({ embeds: [
                    {
                        title: "",
                        description: `**${user.tag}** cannot be ${whitelist ? "whitelisted" : "unwhitelisted"}.`,
                        footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                        color: 16711680
                    }
                ]
                })
                return;
            }
            // if they are, update their role
            await client.connection.promise().execute('UPDATE `whitelist` SET `role` = ? WHERE `userid` = ?', [role, user.id])
        } else {
            // if they aren't, add them to the database
            await client.connection.promise().execute('INSERT INTO `whitelist` (`userid`, `role`) VALUES (?, ?)', [user.id, role])
        }

        if (role == lastWhitelist) {
            await interaction.reply({ embeds: [
                {
                    title: "",
                    description: `**${user.tag}** is already ${whitelist ? "whitelisted" : "unwhitelisted"}.`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 16711680
                }
            ]
            });
            return;
        }
        let description = `**${user.tag}** has been ${whitelist ? "whitelisted" : "unwhitelisted"}.`
        let color = whitelist ? 1286414 : 16711680

        await interaction.reply({ embeds: [
            {
                title: "",
                description: description,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: color
            }
        ]
        })
    }
};