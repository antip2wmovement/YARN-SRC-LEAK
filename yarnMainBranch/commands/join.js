const { ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const { join, bedrockClient, } = require('../bedrockClient.js');

module.exports = {
	name: "join",
    description: "Joins a realm, nothing else.",
    options:[
        {
            type: "STRING",
            name: "realmcode",
            description: "Realm Code To Join",
            required: true,
        },
    ],
    level: 1,
	async execute(interaction, client) {
        const randomId = Math.floor(Math.random() * 100) + 1;
        const realmCode = interaction.options.getString('realmcode');

        let messageData = await interaction.reply({ embeds:[
            {
                description: `${client.config.emojis.loading} Joining \`${realmCode}\`...`,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 1286414
            } 
        ]});
        
        let connections = await join(realmCode,1,(data)=>{
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
                                "label": "Leave",
                                "style": 4,
                                "custom_id": "stop-"+randomId+"-"+interaction.user.id,
                                "disabled": true
                            }
                        ]
                    }
                ]
            });
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

        const leave = new ButtonBuilder()
        .setCustomId('leave-'+randomId+'-'+interaction.user.id)
        .setLabel('Leave')
        .setStyle(4)

        const LeaveBtn = new ActionRowBuilder()
	    .addComponents(leave);

        messageData.edit({ components:[LeaveBtn]});
        
        interaction.client.on('interactionCreate', async interaction => {
            const customId = interaction.customId.split('-')
            if (customId[2] !== interaction.user.id) {
                await interaction.reply({ content: 'That isn\'t for you!', ephemeral: true });
            }
            if (customId[1] !== randomId.toString() || customId[2] !== interaction.user.id) return;
            connections.leave()
            leave.disabled = true;
            await messageData.edit({
                embeds:[{
                    description:`${client.config.emojis.leave} Left \`${realmCode}\`!`,
                    footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                    color: 1286414
                }],
                components:[
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "label": "Leave",
                                "style": 4,
                                "custom_id": "leave-"+randomId+"-"+interaction.user.id,
                                "disabled": true
                            }
                        ]
                    }
                ]
            });
            await interaction.deferUpdate();
        });
    }
};