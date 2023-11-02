const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const cooldowns = new Collection();


// SUB_COMMAND sets the option to be a subcommand
// SUB_COMMAND_GROUP sets the option to be a subcommand group
// STRING sets the option to require a string value
// INTEGER sets the option to require an integer value
// BOOLEAN sets the option to require a boolean value
// USER sets the option to require a user or snowflake as value
// CHANNEL sets the option to require a channel or snowflake as value
// ROLE sets the option to require a role or snowflake as value
// MENTIONABLE sets the option to require a user, role or snowflake as value
// NUMBER sets the option to require a decimal (also known as a floating point) value
// ATTACHMENT sets the option to require an attachment
// options: [
//     {
//         type: "STRING",
//         name: "str",
//         description: "The string to convert to ascii",
//         required: true,
//         choices: [
//             { name: "option1", value: "option #1" },
//             { name: "option2", value: "option #2" },
//             { name: "option3", value: "option #3" },
//         ]
//     }
// ],

function slashbuild(command) { 
    const optionData = []
    command.options.forEach(async (option) => {
        required = option.required || false
        choices = option.choices || []
        // checks if regex matches ^[\p{Ll}\p{Lm}\p{Lo}\p{N}_-]+$
        if(option.name.match(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}_-]+$/)) return console.log(`Invalid option name: ${option.name}`)
        if(option.description.match(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}_-]+$/)) return console.log(`Invalid option description: ${option.description}`)
        let type = option.type.toUpperCase()
        let typeInt = 0
        switch (type) {
            case 'SUB_COMMAND':
                typeInt = 1
                break;
            case 'SUB_COMMAND_GROUP':
                typeInt = 2
                break;
                
            case 'STRING':
                typeInt = 3
                break;
            case 'INTEGER':
                typeInt = 4
                break;
            case 'BOOLEAN':
                typeInt = 5
                break;
            case 'USER':
                typeInt = 6
                break;
            case 'CHANNEL':
                typeInt = 7
                break;
            case 'ROLE':
                typeInt = 8
                break;
            case 'MENTIONABLE':
                typeInt = 9
                break;
            case 'NUMBER':
                typeInt = 10
                break;
            case 'ATTACHMENT':
                typeInt = 11
                break;
            default:
                console.error(`Error: option type "${type}" not valid`);
        }

        option.type = typeInt
        // no builders
        optionData.push(option)
    })
    return optionData;
}

const COMMAND_FOLDER = "/yarn/commands/"

module.exports = async (client)=> {
    if (!client) throw new Error('No Client Provided');
    if (!client.connection) client.debugConsole(1, 'No Connection Provided (client.connection is undefined)\nSome commands may not work');
    if (!client.config.token) throw new Error('No Token Provided (config.token is undefined)');
    if (!client.config.whitelistedGuilds) throw new Error('No Whitelisted Guilds Provided (config.whitelistedGuilds is undefined)');
    if (!client.config.whitelistedGuilds.length) throw new Error('No Whitelisted Guilds Provided (config.whitelistedGuilds is empty)');
    
    let comd  = 0;
    let total = 0;
    let errors= 0;
    const commandFiles = fs.readdirSync(`${COMMAND_FOLDER}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        comd++
        total++
        try {
            let command = require(`${COMMAND_FOLDER}${file}`);
            client.slashCommands.set(command.name, command);
        } catch(e) {
            console.log(`\x1b[31mCommand ${file} errored with The Error:\n${e.stack}\n`)
            comd--
            total-- 
            errors++ 
        }    
        comd = 0
    }
    console.log('Loaded a Total of '+total+' Slash Commands\x1b[0m')
    if(errors>=1) {
        console.log(`\x1b[31m${errors} Commands Errored`)
    }
    const rest = new REST({ version: '9' }).setToken(client.config.token);

    // slash command register
    const commands = [];
    const guildCommands = {};
    client.slashCommands.forEach(async (command) => {
        if(!command.name) return client.debugConsole(2, `A Command is missing a name`)
        if(command.name.length>32) return client.debugConsole(2,`Command ${command.name} has a name longer than 32 characters`)
        if(command.name.length==0) return client.debugConsole(2,`Command ${command.name} has a name of 0 characters`)
        command.description = command.description || "No description provided"
        command.options     = command.options     || []
        command.subcommand = command.subcommand || false
        command.permissions = command.permissions || []
        guild = command.guild || []

        let slash = {
            name: command.name,
            description: command.description,
            options: slashbuild(command)
        }
        if(guild.length==0) {
            commands.push(slash);      
        } else {
            guildCommands[guild] = guildCommands[guild] || [];
            guildCommands[guild].push(slash);
        }
    });
    let clientID = client.user.id
    await rest.put(        
        Routes.applicationCommands(clientID),
        { body: commands },
    );
    for (const guild in guildCommands) {
        await rest.put(
            Routes.applicationGuildCommands(clientID, guild),
            { body: guildCommands[guild] },
        );
    }
    client.on('interactionCreate', async (interaction)=>{
        if (interaction.type !== 2) return;
        let commandName = interaction.commandName
        const command = client.slashCommands.get(commandName);

        if (!client.config.whitelistedGuilds.includes(interaction.guildId)) {
            return interaction.reply({
                embeds: [
                    {
                        title: "Error!",
                        description: "**This guild is not whitelisted!**\nCheck the database?",
                        footer: ({ text: `/${command.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                        color: 1286414
                    }
                ]
                
            , ephemeral: true});
        }
        command.level = command.level || 0 // higher level = more permissions
        let rows = []
        if (client.connection) {
            [rows] = await client.connection.promise().execute('SELECT * FROM `whitelist` WHERE `userid` = ?', [interaction.user.id])
        } else {
            delete require.cache[require.resolve(path.join(__dirname, '../', 'whitelist.json'))]
            const whitelistData = require(path.join(__dirname, '../', 'whitelist.json')).users;
            rows = [whitelistData.filter((user) => user.userid === interaction.user.id)]
            if (rows[0]==[]) rows = []
        }

        let role = 0
        if(rows[0]) {
            role = rows[0].role
        }
    
        if (command.level > role) {
            return interaction.reply({
                embeds: [
                    {
                        title: "Error!",
                        description: "**You are not whitelisted to run this command!**",
                        footer: ({ text: `/${command.name} | Command used by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }),
                        color: 16711680
                    }
                ]
                
            , ephemeral: true});
        }
        command.execute(interaction, client);
    })
}