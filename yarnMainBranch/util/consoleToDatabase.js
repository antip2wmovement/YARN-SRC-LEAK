const WebSocket = require('ws');

module.exports = async (client) => {
    return;
    if (!client) throw new Error('No Client Provided');
    if (!client.connection) throw new Error('No MySQL Connection Provided');
    
    const originalProcessWrite = process.stdout.write;

    let ws = await new WebSocket('ws://10.0.0.200:8377/');

    ws.on('open', function open() {
        ws.send(JSON.stringify({
            type: "auth",
            token: client.config.apiWSS 
        }));
        
        ws.on('message', function incoming(data) {
            let parsed = JSON.parse(data);
            if (parsed.type == "auth" && parsed.status == "success") {
                process.stdout.write = new Proxy(originalProcessWrite, {
                    apply: function(target, thisArg, argumentsList) {
                        const message = argumentsList.join(' ');
                        ws.send(JSON.stringify({ type: "yarn", action: "write", data: { type: "log", message } }));
                        return Reflect.apply(target, thisArg, argumentsList);
                    }
                });
            }
        });
    });
}