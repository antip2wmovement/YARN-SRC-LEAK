const { join } = require("../bedrockClient");

const crashList = [
    // { realmCode: 'abc', time: 123, crashes: 1 }
]

const activeCrashList = [
    // { realmCode: 'abc', time: 123, status: 'active', disconnects: 0 }
]

module.exports = (client) => {
    if (!client) throw new Error('No Client Provided');
    if (!client.connection)  throw new Error('No Connection Provided (client.connection is undefined)');   

    const { connection } = client;

    setInterval(async () => {
        // data.time = time
        const [rows] = connection.promise().query('SELECT * FROM `scheduler` WHERE `type` = "crash" AND `data.time` > ?', [Date.now()]);
        if (!rows.length) return;
        rows.forEach(row => {
            // if its already in the crash list, dont do anything
            if (crashList.find(x => x.realmCode === row.realmCode)) return;
            if (row.data.status !== 'active') return; // if its not active, dont do anything
            // add it to the crash list
            crashList.push({ realmCode: row.realmCode, time: row.data, crashes: 0 });
        });
        // checks if codes in crash list are still in the database
        crashList.forEach((crash, index) => {
            const [rows] = connection.promise().query('SELECT * FROM `scheduler` WHERE `type` = "crash" AND `realmCode` = ?', [crash.realmCode]);
            if (!rows.length) {
                // remove it from the crash list
                crashList.splice(index, 1);
            }
        });
        // runs all realm codes that arent in the active crash list
        crashList.forEach(async (crash) => {
            if (activeCrashList.find(x => x.realmCode === crash.realmCode && x.status === 'active')) return;
            console.log('Bot Scheduler is crashing ' + crash.realmCode + '!')
            // add it to the active crash list
            activeCrashList.push({ realmCode: crash.realmCode, time: crash.time, status: 'active', disconnects: 0 });
            // run it
            const mcClient = await join(crash.realmCode, 1, (a)=>{
                if (a.disconnect_reason=="close") {
                    console.log('Bot Scheduler crashed ' + crash.realmCode + '!')
                    // this is the crash
                    crash.crashes++;
                    if (crash.time<Date.now()) {
                        console.log('Bot Scheduler is done crashing ' + crash.realmCode + '!')
                        // remove it from the active crash list
                        activeCrashList.splice(activeCrashList.findIndex(x => x.realmCode === crash.realmCode), 1);                        
                        return;
                    }
                }
                disconnects++;
                if (disconnects>5) {
                    console.log('Bot Scheduler has failed to crashloop ' + crash.realmCode + '!')
                    // remove it from the active crash list
                    activeCrashList.splice(activeCrashList.findIndex(x => x.realmCode === crash.realmCode), 1);
                    // set to database that its inactive
                    connection.promise().query('UPDATE `scheduler` SET `data.status` = "inactive" WHERE `realmCode` = ? AND `type` = "crash"', [crash.realmCode]);
                    return;
                }
            });
            mcClient.crash();
        });

    }, 500);

    client.getCrashList = () => {
        return {
            crashList,
            activeCrashList
        }
    }
}