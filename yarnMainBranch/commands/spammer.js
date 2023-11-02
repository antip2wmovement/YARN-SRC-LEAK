const { ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const { join, bedrockClient, } = require('../bedrockClient.js');

module.exports = {
	name: "spammer",
    description: "Spams realm with a message",
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
        { 
            type: "NUMBER",
            name: "time",
            description: "How long to spam for",
            required: true,
        }
    ],
    level: 1,
	async execute(interaction, client) {
        const realmCode = interaction.options.getString('realmcode');
        const message = interaction.options.getString('message');
        const time = interaction.options.getNumber('time');
        let inter
        let disconnected = false

        let messageData = await interaction.reply({ embeds:[
            {
                description: `${client.config.emojis.loading} Joining \`${realmCode}\`...`,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 1286414
            } 
        ]});

        
        let connections = await join(realmCode, 1, (data)=>{
            clearInterval(inter)
            disconnected = true
            messageData.edit({
                embeds: [
                    {
                        description:`${client.config.emojis.leave} Disconnected from \`${realmCode}\`!\n\`\`\`${data.msg}\`\`\``,
                        footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                        color: 1286414
                    }
                ],
                components: [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "label": "Stop",
                                "style": 4,
                                "custom_id": "stop-"+randomId+"-"+interaction.user.id,
                                "disabled": true
                            }
                        ]
                    }
                ]
            })
        }).catch(e => {
            messageData.edit({ embeds:[{
                description:`${client.config.emojis.error} Failed to join \`${realmCode}\`!\n${e.msg}\nErrors:\n\`${e.errors.join('`\n`')}\``,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 16724787
            }]});
        });
        if (!connections) return;

        messageData.edit({ embeds:[{
            description:`${client.config.emojis.join} Joined \`${realmCode}\`!`,
            footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
            color: 1286414
        }]});

        const randomId = Math.floor(Math.random() * 100) + 1;

        const stop = new ButtonBuilder()
        .setCustomId('stop-'+randomId+'-'+interaction.user.id)
        .setLabel('Stop')
        .setStyle(4)

        const JustStop = new ActionRowBuilder()
	    .addComponents(stop);

        messageData.edit({ components:[JustStop]});
        
        inter = setInterval(() => {
            connections.spam(message, 25)
        }, 1000);

        interaction.client.on('interactionCreate', async interaction => {
            const customId = interaction.customId.split('-')
            if (customId[2] !== interaction.user.id) {
                await interaction.reply({ content: 'That isn\'t for you!', ephemeral: true });
            }
            if (customId[1] !== randomId.toString() || customId[2] !== interaction.user.id) return;
            connections.leave()
            await messageData.edit({
                embeds:[{
                    description:`${client.config.emojis.leave} Left \`${realmCode}\`!`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 1286414
                }],
                components: [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "label": "Stop",
                                "style": 4,
                                "custom_id": "stop-"+randomId+"-"+userid,
                                "disabled": true
                            }
                        ]
                    }
                ]
            });
            clearInterval(inter)
            await interaction.deferUpdate();
        });

        // runs a loop to spam the realm for time
        //connections.spam(message,25)
        setTimeout(() => {
            clearInterval(inter)
            if (disconnected) return;
            connections.leave()
        }, time * 1000);
    }
};