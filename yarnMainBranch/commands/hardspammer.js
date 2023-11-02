const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { join } = require('../bedrockClient.js');

module.exports = {
	name: "hardspammer",
    description: "Spams realm with a message, Just no stopping this one.",
    options:[
        {
            type: "STRING",
            name: "realmcode",
            description: "Realm Code To Spam",
            required: true,
            min_length: 11,
			max_length: 11
        },
        {
            type: "STRING",
            name: "message",
            description: "The Message to spam",
            required: true,
        },
    ],
    level: 1,
	async execute(interaction, client) {
        const randomId = Math.floor(Math.random() * 100) + 1;
        const realmCode = interaction.options.getString('realmcode');
        const text = interaction.options.getString('message');

        let messageData = {
            embeds: [
                {
                    description:`${client.config.emojis.loading} Joining \`${realmCode}\`...`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 1286414
                }
            ]
        }

        let message = await interaction.reply(messageData);
        
        let connections = await join(realmCode, 1, (data)=>{
            messageData.embeds[0].description = `${client.config.emojis.leave} Disconnected from \`${realmCode}\`!\n\`\`\`${data.msg}\`\`\``
            messageData.embeds[0].color = 16724787
            if (messageData.components) messageData.components[0].components[0].disabled = true
            message.edit(messageData)
        }).catch(e => {
            messageData.embeds[0].description = `${client.config.emojis.error} Failed to join \`${realmCode}\`!\n${e.msg}\nErrors:\n\`${e.errors.join('`\n`')}\``
            message.edit(messageData);
        });
        if (!connections) return;

        messageData.embeds[0].description = `${client.config.emojis.join} Joined \`${realmCode}\`!`
        messageData.embeds[0].color = 1286414
        messageData.components = [{"type": 1,"components": [{
            "type": 2,
            "label": "Stop",
            "style": 4,
            "custom_id": "stop-"+randomId+"-"+interaction.user.id,
            "disabled": false
        }]}]
        message.edit(messageData)
        
        const f = async (interaction) => {
            const customId = interaction.customId.split('-')
            if (customId[2] !== interaction.user.id) {
                await interaction.reply({ content: 'That isn\'t for you!', ephemeral: true });
            }
            if (customId[1] !== randomId.toString() || customId[2] !== interaction.user.id) return;
            connections.leave()
            messageData.embeds[0].description = `${client.config.emojis.leave} Left \`${realmCode}\`!`
            messageData.components[0].components[0].disabled = true
            await message.edit(messageData)
            await interaction.deferUpdate();
            interaction.client.removeListener('interactionCreate', f);
        }

        interaction.client.on('interactionCreate', f);

        // runs a loop to spam the realm for time
        connections.spam(text,25000)
        // auto leave
        setTimeout(() => {
            connections.leave()
        }, 30000);
    }
};