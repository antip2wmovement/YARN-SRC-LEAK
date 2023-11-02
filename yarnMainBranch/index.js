const ROOT_DIRECTORY = __dirname;
const UTIL_DIRECTORY = ROOT_DIRECTORY+'/util';

process.stdout.write('\033c')

const line = '\x1b[36m=====================================\x1b[0m'

// Modules
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const fs = require('fs');

const WebSocket = require('ws');
const originalProcessWrite = process.stdout.write;

let connection;  // Define the connection variable
const config = {};

let debug = false
if(debug) console.log('DEBUG MODE ENABLED');

global.debugConsole = function(t,ret) {
    //if(!debug) return;
    if(t==0)
        console.log('[ \x1b[32mOK \x1b[0m]    \x1b[32m%s\x1b[0m',ret)
    else if(t==1)
        console.log('[ \x1b[33mWARN \x1b[0m]  \x1b[33m%s\x1b[0m',ret)
    else if(t==2)
        console.log('[ \x1b[31mERROR \x1b[0m] \x1b[31m%s\x1b[0m',ret)
    else if(t==3)
        console.log('[ \x1b[36mINFO \x1b[0m] \x1b[36m%s\x1b[0m',ret)
    else
        console.log(ret)
}

const client = new Client({ 
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
    presence: {
        status: debug ? 'dnd' : 'online'
    },
    restTimeOffset: 0
});
console.log(`  ▄▄▌ ·▄▄▄▄•     ▐ ▄▄▄▄ ▄▄▄▄▄▄▌ ▐ ▄▌    ▄▄▄ ▄ •▄ 
  ██• ▪▀·.█▌    •█▌▐▀▄.▀•██ ██· █▌▐▪    ▀▄ ██▌▄▌▪
  ██▪ ▄█▀▀▀•    ▐█▐▐▐▀▀▪▄▐█.██▪▐█▐▐▌▄█▀▄▐▀▀▄▐▀▀▄·
  ▐█▌▐█▌▪▄█▀    ██▐█▐█▄▄▌▐█▌▐█▌██▐█▐█▌.▐▐█•█▐█.█▌
  .▀▀▀·▀▀▀ •    ▀▀ █▪▀▀▀ ▀▀▀ ▀▀▀▀ ▀▪▀█▄▀.▀  ·▀  ▀`)
  // Code Start
console.log(`\x1b[36mStarting YARN 1.2\x1b[0m\n${line}`);

if (fs.existsSync(ROOT_DIRECTORY+'/db.json')) {
    const db = require(ROOT_DIRECTORY+'/db.json');
    const mysql = require('mysql2');
    const connectionConfig = {
        host: db.host,
        port: db.port || 3306,
        user: db.user,
        password: db.pass,
        database: db.database,
    };

    connection = mysql.createConnection(connectionConfig);  // Assign the connection
    console.log(`\x1b[32mMySQL | Username : ${db.user}\n`+
    `MySQL | Password : ${db.pass.replace(/[^]/g, '*')}\n`+
    `MySQL | Host     : ${db.host}:${db.port || 3306}\n`+
    `MYSQL | Database : ${db.database}\x1b[0m\n`+
    `${line}`);
} else if (fs.existsSync(ROOT_DIRECTORY+'/config.json')) {
    const conf = require(ROOT_DIRECTORY+'/config.json');
    for (const key in conf) {
        config[key] = conf[key];
    }
} else {
    console.log('\x1b[31mNo Config File Found\x1b[0m');
    process.exit();
}


const loadAndStartUtilFiles = async (client) => {
    if (!client) throw new Error('No Client Provided');
    if (fs.existsSync(UTIL_DIRECTORY) === false) return debugConsole(1,'No Util Directory Found');

    const utilFiles = fs.readdirSync(UTIL_DIRECTORY).filter(utilfile => utilfile.endsWith('.js'));

    for (const utilfile of utilFiles) {
        const func = require(`${UTIL_DIRECTORY}/${utilfile}`);

        try {
            if (typeof func === 'function') {
                func(client);
                console.log(`\x1b[32mStarted ${utilfile}\x1b[0m`);
            }
        } catch (e) {
            console.log(`\x1b[31m${utilfile} Errored\x1b[0m`);
            debugConsole(2, e.stack);
        }
    }
};

async function start() {
    token                = config.token;
    client.ROOT_DIRECTORY= ROOT_DIRECTORY;
    client.debug         = debug
    client.slashCommands = new Collection();
    client.queue         = new Map();
    client.debugConsole  = debugConsole
    client.connection    = connection
    client.on('ready', async () => {
        client.config     = config
        // Utility Libaries
        loadAndStartUtilFiles(client);

        console.log(line)
        function reboot(){
            process.exit()
        }
        setInterval(reboot , 24*60*60*1000*7); // every 7 days it will reboot, this is to prevent memory leaks
    });
    client.on("warn", (info) => console.loSg(info));
    client.on("error", console.error);
}

if (connection)
    connection.connect(function(err) {
        if(err){
            debugConsole(2,"MySQL connection failed"); 
            console.error(err); 
            process.exit();
        }
        $query = "SELECT * FROM `registry` WHERE `data_key` = 'config'";
        console.log('\x1b[32mBuilding Config\x1b[0m')
        connection.query($query, async function(err, rows, fields) {
            try {
                const configData = JSON.parse(rows[0].data)
                for (const key in configData) {
                    config[key] = configData[key];
                }
                if(configData.token) {
                    debugConsole(0,'Logging In')
                    client.login(configData.token).then(()=>{
                        debugConsole(0,'Logged In')
                    });
                } else {
                    debugConsole(1,'No token found in config')
                    console.log(line)
                }
                start()
            } catch (e) {
                debugConsole(2,'Config JSON parse error, check config and reboot !.!.!.!\n'+e.stack)
            }
        })
    })
else {
    client.login(config.token).then(()=>{
        debugConsole(0,'Logged In')
    });
    start()
}

// this is so the bot can safely shut down, for example if the bot is running a task it will wait for it to finish before shutting down
let stopping = false
async function exitHandler() {
    if(stopping) return process.exit(1) // hard exit
    stopping = true
    console.log('\x1b[31m\nShutting Down...\x1b[0m')
    if (connection) {
        // sets AI to offline
        $query = "UPDATE `rules` SET `value`='2' WHERE rule='AI Channel'";
        connection.query($query, async function(err, rows, fields) {})
        // checks if the AI is in use, until false then we are safe to close
        if (client.checkUse) {
            let aiInUse = client.checkUse().status;
            let amountCached = 0
            
            while(aiInUse) {
                await sleep(1000)
                const ai = client.checkUse();
                aiInUse = ai.status
                if (amountCached!=ai.amount) {
                    amountCached = ai.amount
                    console.log('\x1b[31mWaiting for AI to finish... ['+ai.amount+' Requests remaining...]\x1b[0m')
                }
            }
        }
        try { console.log('\x1b[31mClosing MySQL Connection...\x1b[0m')
            connection.end() 
            console.log('\x1b[31mDisconnected from MySQL\x1b[0m')
        } catch {
            console.log('\x1b[31mFailed\x1b[0m')
        }
    }
    
    try { console.log('\x1b[31mClosing Discord Connection...\x1b[0m')
        client.destroy()
        console.log('\x1b[31mDisconnected from Discord\x1b[0m')
    } catch {
        console.log('\x1b[31mFailed\x1b[0m')
    }
    console.log('\x1b[31mGoodbye\x1b[0m')
    process.exit(0);
}

process.on('uncaughtException', function(err) { 
    debugConsole(2,err)
    fs.appendFileSync(ROOT_DIRECTORY+'/error.log', err.stack+'\n');
    // in case of network error it will try to reconnect
    if(err.message.includes('HTTPError [FetchError]: request to https://discord.com/api/v9/gateway/bot failed, ')) {
        debugConsole(2,'DiscordAPIError Reconnecting')
        // if it is a discord error it will try to reconnect
        client.destroy()
        client.login(config.token).then(()=>{
            debugConsole(0,'Logged In')
        });
    }
});

process.on('exit',    exitHandler.bind());
process.on('SIGINT',  exitHandler.bind());
process.on('SIGUSR1', exitHandler.bind());
process.on('SIGUSR2', exitHandler.bind());

client.on('disconnect', () => {
    console.log('\x1b[31mDisconnected\x1b[0m')
    exitHandler()
})

// AngeLz was here