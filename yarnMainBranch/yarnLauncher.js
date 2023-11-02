// logs to ather1's yarn console

const WebSocket = require('ws');
const originalProcessWrite = process.stdout.write;

let botInit = false;
let consoleOutput = [];
let c;

function wssConnect() {
    let ws = new WebSocket('wss://ather1.angelz.live/wss/');
    const wsstoken = "923GMWruDaM9tx5f5QK357b5iBEsdiCMq8GAmsJ6fn2QDPwzPeYGHRw8uiy2pKmPKnDcKmADH4Gb5CmGxzPFcYFwtd37jdWb2HZk";
    ws.on('open', function open() {
        ws.send(JSON.stringify({
            type: "auth",
            token: wsstoken
        }));
        
        ws.on('message', function incoming(data) {
            if (data == "pong") return;
            let parsed = JSON.parse(data);
            if (parsed.type == "auth" && parsed.status == "success") {
                ws.send(JSON.stringify({ type: "yarn", action: "reWrite", data: consoleOutput}));
                process.stdout.write = new Proxy(originalProcessWrite, {
                    apply: function(target, thisArg, argumentsList) {
                        const message = argumentsList[0]
                        ws.send(JSON.stringify({ type: "yarn", action: "write", data: { type: "log", message } }));
                        consoleOutput.push({ type: "log", message });
                        return Reflect.apply(target, thisArg, argumentsList);
                    }
                });
                clearInterval(c);
                if (botInit) return;
                botInit = true;
                try {
                    require('./index.js');
                } catch(e) {
                    console.log('Bot Load Error: ')
                    console.log(e);
                }
            } else if (parsed.type == "yarn" && parsed.action == "shutdown") {
                process.exit();
            }
        });
        const d = setInterval(() => {
            ws.send('ping'); // Send a ping message every, for example, 30 seconds
        }, 30000);
        ws.on('close', function close() {
            clearInterval(d);
            c = setInterval(() => {
                wssConnect();
            }, 1000);
        })
    });
    ws.on('error', (error) => {
        console.error(`WebSocket encountered an error: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            console.log(`Connection refused. The server might not be running or the IP/port is incorrect.`);
        }
        clearInterval(c);
        setTimeout(() => {
            wssConnect();
        }, 1000);
    });
}

wssConnect();