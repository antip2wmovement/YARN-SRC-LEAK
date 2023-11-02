const { realmLookup } = require('../bedrockClient.js');

module.exports = {
	name: "rlookup",
    description: "Gets Information From A Realm Code.",
    options:[
        {
            type: "STRING",
            name: "realmcode",
            description: "Realm Code To Pull",
            required: true,
        }
    ],
    subcommands: null,
    guild: null,
    permissions: [  ],
	async execute(interaction) {
        const realmCode = interaction.options.getString('realmcode');

        let messageData = await interaction.reply({ embeds:[
            {
                description: `<:slash:1153790732579123251> Pulling \`${realmCode}\`...`,
                footer: ({ text: `/${this.name} | Command used by > ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 3515039
            } 
        ]});

        realmLookup(realmCode).then(data =>{
            messageData.edit({ embeds:[{
                description:`<:success2:1153790741324255373> Pulled Realm \`${realmCode}\`\n\nName: \`${data.realmName}\`\nHost: \`${data.host}\`\nPort: \`${data.port}\``,
                footer: ({ text: `/${this.name} | Command used by > ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 3515039
            }]});
        }).catch(err => {
            messageData.edit({ embeds:[{
                description:`<:error:1153790709703376896> Failed to pull \`${realmCode}\`!\n${err}`,
                footer: ({ text: `/${this.name} | Command used by > ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 16724787
            }]});
        });
    }
};